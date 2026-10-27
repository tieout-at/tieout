"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { InfoTip } from "@/components/ui/info-tip";
import { SideWindow } from "@/components/ui/side-window";
import { useMediaQuery } from "@/components/ui/use-media";
import type { TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { DayPager, MonthView, WeekView } from "./calendar";
import { Chronik } from "./chronik";
import { DetailContent, type Selection } from "./detail";
import { Overview, OverviewList } from "./overview";

type Mode = "ueberblick" | "kalender" | "chronik";
type Span = "woche" | "monat";
const MODES: { id: Mode; title: string }[] = [
  { id: "ueberblick", title: "Überblick" },
  { id: "kalender", title: "Kalender" },
  { id: "chronik", title: "Chronik" },
];

/** The address keeps the view and the chosen event: `#kalender` (the month), `#kalender-woche`, `#chronik/w4`; an old `#w4` opens the event. */
function readHash(ids: Set<string>): { mode?: Mode; span?: Span; event?: string } {
  let raw = "";
  try {
    raw = decodeURIComponent(window.location.hash.slice(1));
  } catch {
    // a broken address ("#%E0") opens the page as it is built
  }
  if (!raw) return {};
  const [head, event] = raw.split("/");
  if (ids.has(head)) return { event: head };
  const [mode, span] = head.split("-") as [Mode, Span | undefined];
  if (!MODES.some((m) => m.id === mode)) return {};
  return { mode, span: span === "woche" ? "woche" : mode === "kalender" ? "monat" : undefined, event: event && ids.has(event) ? event : undefined };
}

function Segmented<T extends string>({ items, value, onChange, label }: { items: { id: T; title: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <span role="radiogroup" aria-label={label} className="inline-flex h-8 shrink-0 items-center rounded-lg bg-fill-hover p-0.5 max-md:h-11">
      {items.map((i) => (
        <button
          key={i.id}
          type="button"
          role="radio"
          aria-checked={value === i.id}
          onClick={() => onChange(i.id)}
          className={cn(
            "flex h-7 items-center gap-1.5 rounded-md px-2.5 text-sm whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:outline-accent max-md:h-10",
            value === i.id ? "bg-surface text-fg shadow-button" : "text-fg-secondary hover:text-fg",
          )}
        >
          {i.title}
          {i.count !== undefined && <span className="text-xs text-fg-muted tabular-nums">{i.count}</span>}
        </button>
      ))}
    </span>
  );
}

/**
 * Project tab "Zeitstrahl" (step 8d, after Maxi S.'s round on the board): one sentence as the answer, then three views of
 * the same events. "Überblick" is the whole Bauzeit on two lanes, "Kalender" the weeks side by side that snap like a
 * calendar (on phones one day per page) or the months from top to bottom, "Chronik" every event in order with day and
 * time. "Nur was fehlt" (the default while something is missing) or "Alle" applies to each. A click on an event opens it
 * in a window at the right that closes again; the view and the event are in the address.
 */
export function Timeline({ view }: { view: TimelineView }) {
  const ids = useMemo(() => new Set(view.events.map((e) => e.id)), [view.events]);
  const [mode, setMode] = useState<Mode>("ueberblick");
  // the month first: it shows at a glance in which weeks something happened
  const [span, setSpan] = useState<Span>("monat");
  const [all, setAll] = useState(view.counts.missing === 0);
  const [selection, setSelection] = useState<Selection | null>(null);
  const phone = useMediaQuery("(max-width: 767px)", false);
  // on phones the Überblick would be the same list as the Chronik, so phones offer Kalender and Chronik only
  const shownMode: Mode = phone && mode === "ueberblick" ? "chronik" : mode;
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1100);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    // the width inside the padding (the window pads the whole page while it is open, see SideWindow)
    const inner = () => {
      const s = getComputedStyle(el);
      return el.clientWidth - parseFloat(s.paddingLeft) - parseFloat(s.paddingRight);
    };
    const ro = new ResizeObserver(() => setWidth(inner()));
    ro.observe(el);
    setWidth(inner());
    return () => ro.disconnect();
  }, [shownMode]);

  useEffect(() => {
    const read = () => {
      const h = readHash(ids);
      if (h.mode) setMode(h.mode);
      if (h.span) setSpan(h.span);
      setSelection(h.event ? { kind: "event", id: h.event } : null);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [ids]);

  const write = useCallback((m: Mode, s: Span, sel: Selection | null) => {
    const head = m === "kalender" && s === "woche" ? "kalender-woche" : m;
    const tail = sel?.kind === "event" ? `/${sel.id}` : "";
    window.history.replaceState(null, "", head === "ueberblick" && !tail ? window.location.pathname : `#${head}${tail}`);
  }, []);

  const choose = (s: Selection | null) => {
    // a second click on the event that is open closes the window
    const next = s && selection && s.kind === selection.kind && (s.kind === "event" ? s.id === (selection as { id: string }).id : s.iso === (selection as { iso: string }).iso) ? null : s;
    setSelection(next);
    write(mode, span, next);
  };
  const close = useCallback(() => {
    setSelection(null);
    write(mode, span, null);
  }, [mode, span, write]);

  const shown = useMemo(() => view.events.filter((e) => e.lane === "rechnung" || all || e.stand === "fehlt"), [view.events, all]);
  // the calendar opens where the last missing event is (the newest one with a gap first), else at the Stand
  const startDay = useMemo(() => {
    const missing = view.events.filter((e) => e.stand === "fehlt").sort((a, b) => a.date.iso.localeCompare(b.date.iso));
    return missing.at(-1)?.date.iso ?? view.asOf.iso;
  }, [view]);
  const chosen = selection?.kind === "event" ? selection.id : null;
  const spanSwitch = (
    <Segmented
      label="Zeitraum"
      items={[
        { id: "woche", title: "Woche" },
        { id: "monat", title: "Monat" },
      ]}
      value={span}
      onChange={(s) => {
        setSpan(s);
        write(mode, s, selection);
      }}
    />
  );
  const c = view.counts;

  return (
    <div className="flex flex-col pb-10">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 pt-4 pb-3 max-md:px-4">
        <Segmented
          label="Ansicht"
          items={phone ? MODES.filter((m) => m.id !== "ueberblick") : MODES}
          value={shownMode}
          onChange={(m) => {
            setMode(m);
            write(m, span, selection);
          }}
        />
        <p className="flex min-w-0 flex-1 items-center gap-1.5 max-md:order-first max-md:basis-full">
          {view.running ? (
            <span>
              <span className="font-semibold tabular-nums">
                {c.missing === 1 ? "1 Ereignis der Baustelle fehlt" : `${c.missing} Ereignisse der Baustelle fehlen`} {view.target === "schlussrechnung" ? "in der Schlussrechnung" : "in den Abschlagsrechnungen"}.
              </span>{" "}
              <span className="text-fg-secondary">
                Gefunden in {c.findCount === 1 ? "1 Fund" : `${c.findCount} Funden`}
                {c.next ? `, ${c.next} kommen in die nächste Abschlagsrechnung` : ""}.
              </span>
            </span>
          ) : (
            <span className="text-fg-secondary">Die Schlussrechnung ist gelegt: tieout gleicht hier nicht mehr ab.</span>
          )}
          <InfoTip label="Zeitstrahl">Überblick zeigt die ganze Bauzeit, oben die Baustelle, unten die Rechnungen. Kalender blättert Woche für Woche oder Monat für Monat, Chronik listet jedes Ereignis mit Tag und Uhrzeit. „Alle“ zählt die Ereignisse der Baustelle; Rechnungen, Zahlungen und Kürzungen stehen in jeder Ansicht dabei. Ein Klick öffnet das Ereignis rechts, ein zweiter Klick schließt es.</InfoTip>
        </p>
        {phone && (
          <ViewMenu
            all={all}
            setAll={setAll}
            counts={{ missing: c.missing, all: view.events.filter((e) => e.lane === "baustelle").length }}
            running={view.running}
            span={shownMode === "kalender" ? span : null}
            setSpan={(s) => {
              setSpan(s);
              write(mode, s, selection);
            }}
          />
        )}
        <span className="flex items-center gap-2 max-md:hidden">
          {view.running && (
            <Segmented
              label="Ereignisse"
              items={[
                { id: "fehlt", title: "Nur was fehlt", count: c.missing },
                { id: "alle", title: "Alle", count: view.events.filter((e) => e.lane === "baustelle").length },
              ]}
              value={all ? "alle" : "fehlt"}
              onChange={(v) => setAll(v === "alle")}
            />
          )}
        </span>
      </div>

      <div ref={box} className={cn(shownMode === "chronik" || phone ? "" : "px-6")}>
        {shownMode === "ueberblick" &&
          (phone || width < 480 ? <OverviewList view={view} shown={shown} onChoose={(id) => choose({ kind: "event", id })} /> : <Overview view={view} shown={shown} width={width} chosen={chosen} onChoose={(id) => choose({ kind: "event", id })} />)}
        {shownMode === "kalender" &&
          (span === "woche" ? (
            phone ? (
              <DayPager view={view} shown={shown} chosen={chosen} onSelect={choose} startDay={startDay} extra={phone ? undefined : spanSwitch} />
            ) : (
              <WeekView view={view} shown={shown} chosen={chosen} onSelect={choose} startDay={startDay} extra={phone ? undefined : spanSwitch} />
            )
          ) : (
            <div className={cn(phone && "px-4")}>
              <MonthView view={view} shown={shown} chosen={chosen} onSelect={choose} startDay={startDay} compact={phone} extra={phone ? undefined : spanSwitch} />
            </div>
          ))}
        {shownMode === "chronik" && <Chronik view={view} shown={shown} chosen={chosen} onSelect={choose} />}
      </div>

      <SideWindow open={selection !== null} onClose={close} title="Ereignis">
        {selection && <DetailContent key={selection.kind === "event" ? selection.id : selection.iso} selection={selection} view={view} onSelect={(s) => choose(s)} onClose={close} />}
      </SideWindow>
    </div>
  );
}

/** Phones: what to show (Nur was fehlt or Alle) and, in the calendar, Woche or Monat, in one menu beside the view switch. */
function ViewMenu({ all, setAll, counts, running, span, setSpan }: { all: boolean; setAll: (v: boolean) => void; counts: { missing: number; all: number }; running: boolean; span: Span | null; setSpan: (s: Span) => void }) {
  const tick = (on: boolean) => (on ? <Check aria-label="gewählt" className="size-4" /> : <span className="size-4" />);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-surface px-3 text-sm shadow-button outline-none focus-visible:outline-2 focus-visible:outline-accent">
        <SlidersHorizontal className="size-4 text-fg-secondary" aria-hidden />
        Ansicht
        <ChevronDown className="size-4 text-fg-secondary" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {running && (
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ereignisse</DropdownMenuLabel>
            <DropdownMenuItem className="min-h-11" onClick={() => setAll(false)}>
              {tick(!all)}
              <span className="flex-1">Nur was fehlt</span>
              <span className="text-xs text-fg-muted tabular-nums">{counts.missing}</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="min-h-11" onClick={() => setAll(true)}>
              {tick(all)}
              <span className="flex-1">Alle</span>
              <span className="text-xs text-fg-muted tabular-nums">{counts.all}</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        {span && (
          <>
            {running && <DropdownMenuSeparator />}
            <DropdownMenuGroup>
              <DropdownMenuLabel>Zeitraum</DropdownMenuLabel>
              <DropdownMenuItem className="min-h-11" onClick={() => setSpan("monat")}>
                {tick(span === "monat")}
                <span className="flex-1">Monat</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="min-h-11" onClick={() => setSpan("woche")}>
                {tick(span === "woche")}
                <span className="flex-1">Woche</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
