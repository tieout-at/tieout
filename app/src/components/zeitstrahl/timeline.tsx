"use client";

import Link from "next/link";
import { ArrowRight, Construction, ReceiptText, X } from "lucide-react";
import { createElement, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { belegIcon } from "@/components/fund/icons";
import { OriginalLink } from "@/components/fund/original-sheet";
import { Tag } from "@/components/table/tag";
import { buttonVariants } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TIMELINE_ROWS, type TimelineEvent, type TimelineFind, type TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";

const MONTHS = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const GAP = { beleg_fehlt: "yellow", nachtrag_nicht_gelegt: "orange" } as const;
const chip = "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring";

const day = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));

/** The colour of a site event: the gap of its find, or red where a weak Beleg or a Kürzungsrisiko puts its amount at risk. */
function colourOf(e: TimelineEvent, finds: Record<string, TimelineFind>): "yellow" | "orange" | "red" | null {
  const f = e.finds[0] ? finds[e.finds[0]] : null;
  if (!f) return null;
  if (f.belegstand && f.belegstand.state !== "belegt") return GAP[f.belegstand.state];
  return e.weak || e.risk ? "red" : null;
}

const FILL = { yellow: "bg-state-yellow shadow-[inset_0_0_0_1px_var(--color-state-yellow-edge)]", orange: "bg-state-orange shadow-[inset_0_0_0_1px_var(--color-state-orange-edge)]", red: "bg-state-red shadow-[inset_0_0_0_1px_var(--color-state-red-edge)]" };

/** One mark: a circle for the site (filled when it is missing), a square for an invoice. */
function markClass(e: TimelineEvent, colour: keyof typeof FILL | null) {
  if (e.lane === "rechnung") {
    if (e.art === "abschlagsrechnung" || e.art === "schlussrechnung") return "size-3 rounded-[3px] bg-fg";
    if (e.art === "entwurf") return "size-3 rounded-[3px] border-[1.5px] border-dashed border-fg-secondary bg-surface";
    if (e.art === "korrekturblatt") return "size-2.5 rounded-[3px] bg-surface shadow-[inset_0_0_0_1.5px_var(--color-state-red-edge)]";
    return "size-2.5 rounded-[3px] bg-surface shadow-[inset_0_0_0_1.5px_var(--color-fg-secondary)]";
  }
  if (e.stand === "fehlt") return cn("size-3 rounded-full", colour ? FILL[colour] : "bg-fg");
  if (e.finds.length) return "size-3 rounded-full bg-surface shadow-[inset_0_0_0_2px_var(--color-fg)]";
  if (e.stand === "naechste_abschlagsrechnung") return "size-3 rounded-full bg-surface shadow-[inset_0_0_0_2px_var(--color-fg-secondary)]";
  if (e.stand === "verrechnet") return "size-2 rounded-full bg-fg-faint";
  return "size-2 rounded-full bg-surface shadow-[inset_0_0_0_1.5px_var(--color-fg-faint)]";
}

/** The legend behind the info icon, drawn with the marks of the picture. */
const LEGEND = [
  { mark: "block size-3 rounded-full bg-fg", text: "fehlt in der Schlussrechnung" },
  { mark: cn("block size-3 rounded-full", FILL.yellow), text: "fehlt, Beleg fehlt" },
  { mark: cn("block size-3 rounded-full", FILL.orange), text: "fehlt, Nachtrag nicht gelegt" },
  { mark: cn("block size-3 rounded-full", FILL.red), text: "fehlt, mit Kürzungsrisiko" },
  { mark: "block size-2 rounded-full bg-fg-faint", text: "verrechnet" },
  { mark: "block size-2 rounded-full bg-surface shadow-[inset_0_0_0_1.5px_var(--color-fg-faint)]", text: "nichts zu verrechnen" },
  { mark: "block size-3 rounded-[3px] bg-fg", text: "Abschlagsrechnung, mit ihrem Betrag" },
  { mark: "block size-2.5 rounded-[3px] bg-surface shadow-[inset_0_0_0_1.5px_var(--color-fg-secondary)]", text: "Zahlung" },
  { mark: "block size-3 rounded-[3px] border-[1.5px] border-dashed border-fg-secondary bg-surface", text: "Entwurf, nicht gelegt" },
];

const standText = (e: TimelineEvent) =>
  e.stand === "fehlt" ? "fehlt in der Schlussrechnung" : e.stand === "verrechnet" ? "verrechnet" : e.stand === "naechste_abschlagsrechnung" ? "kommt in die nächste Abschlagsrechnung" : null;

/** What the chosen event is, and the find it proves: the panel under the picture, or a sheet on phones. */
function Detail({ e, view, onChoose }: { e: TimelineEvent; view: TimelineView; onChoose: (id: string) => void }) {
  const f = e.finds[0] ? view.finds[e.finds[0]] : null;
  const others = f ? view.events.filter((x) => x.id !== e.id && x.finds.includes(f.number)).sort((a, b) => a.date.iso.localeCompare(b.date.iso)) : [];
  const stand = standText(e);
  const facts = [
    { k: "Datum", v: e.time ? `${e.date.text}, ${e.time}` : e.date.text, mono: true },
    ...(e.who ? [{ k: "Von", v: e.who }] : []),
    ...(e.amount ? [{ k: "Betrag", v: e.amount }] : []),
    ...(e.weak ? [{ k: "Beleg", v: e.weak }] : []),
    ...(e.positions.length ? [{ k: e.positions.length === 1 ? "Position" : "Positionen", v: e.positions.length > 4 ? `${e.positions.slice(0, 4).join(", ")} und ${e.positions.length - 4} weitere` : e.positions.join(", "), mono: true }] : []),
    ...(stand ? [{ k: "Stand", v: stand, strong: e.stand === "fehlt" }] : []),
    ...(e.rechtsfrage ? [{ k: "Hinweis", v: "Rechtsfrage für die Geschäftsführung, tieout bewertet sie nicht" }] : []),
  ];
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-label="Ereignis" className="flex flex-col gap-1 rounded-lg px-4 py-3.5 shadow-ring">
        <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
          {createElement(belegIcon(e.art as Parameters<typeof belegIcon>[0]) ?? Construction, { className: "size-3.5", "aria-hidden": true })}
          {e.lane === "baustelle" ? "Baustelle" : "Rechnung"}
        </span>
        <h3 className="text-base font-semibold">
          <OriginalLink project={view.project} belegId={e.id} label={e.title}>
            {e.title}
          </OriginalLink>
        </h3>
        <p className="text-fg-secondary">{e.text}</p>
        <dl className="mt-2 grid grid-cols-[104px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
          {facts.map((x) => (
            <div key={x.k} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-fg-secondary">{x.k}</dt>
              <dd className={cn("min-w-0 break-words", "mono" in x && x.mono && "font-mono text-xs leading-5", "strong" in x && x.strong && "font-semibold")}>{x.v}</dd>
            </div>
          ))}
        </dl>
      </section>
      {f ? (
        <section aria-label="Gefunden" className="flex flex-col gap-1 rounded-lg px-4 py-3.5 shadow-ring">
          <span className="text-xs text-fg-secondary">Gefunden</span>
          <span className="flex items-start gap-2">
            <span className={chip}>{f.number}</span>
            <span className="min-w-0 flex-1">{f.name}</span>
          </span>
          <span className="mt-1.5 text-xl font-semibold whitespace-nowrap tabular-nums">{f.amount}</span>
          {f.belegstand && f.belegstand.state !== "belegt" && <Tag colour={GAP[f.belegstand.state]} className="self-start">{f.belegstand.text}</Tag>}
          {(e.risk || e.weak) && f.belegstand?.state === "belegt" && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-state-red" />
              Kürzungsrisiko: {e.risk ?? `${e.title} ${e.weak}`}
            </span>
          )}
          {f.remedy && (
            <p className="mt-1">
              <span className="text-fg-secondary">Abhilfe </span>
              {f.remedy}
            </p>
          )}
          {others.length > 0 && (
            <div className="mt-2 flex flex-col">
              <span className="mb-1 text-xs text-fg-secondary">Gehört auch zu {f.number}</span>
              {others.map((o) => (
                <button key={o.id} type="button" onClick={() => onChoose(o.id)} className="-mx-2 flex min-h-8 items-center gap-2 rounded-md px-2 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
                  {createElement(belegIcon(o.art as Parameters<typeof belegIcon>[0]), { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
                  <span className="min-w-0 flex-1 truncate">{o.title}</span>
                  <span className="font-mono text-xs text-fg-muted">{o.date.text}</span>
                </button>
              ))}
            </div>
          )}
          <Link href={f.href} className={cn(buttonVariants({ variant: "primary" }), "mt-3 self-start")}>
            <ArrowRight aria-hidden />
            Fund öffnen
          </Link>
        </section>
      ) : e.lane === "baustelle" ? (
        <section className="rounded-lg bg-sidebar px-4 py-3.5 text-fg-secondary">Zu diesem Ereignis gibt es keinen Fund.</section>
      ) : null}
    </div>
  );
}

/** The picture (from 768 px): a real time axis, the site above, the invoices below, the Abschlagsrechnungen as dividers. */
function Chart({ view, shown, width, chosen, onChoose }: { view: TimelineView; shown: TimelineEvent[]; width: number; chosen: string | null; onChoose: (id: string) => void }) {
  const LABEL = 196, PAD = 24, X0 = LABEL + 8, X1 = width - PAD;
  const [t0, t1] = [day(view.range.from), day(view.range.to)];
  const x = (iso: string) => X0 + ((day(iso) - t0) / (t1 - t0)) * (X1 - X0);
  const AXIS = 26, AR = 22, LANE = 30, ROW = 34, GAPY = 12;
  // a row without any event of the project is left out (a closed project has no messages, a running one no Nachtrag)
  const rows = TIMELINE_ROWS.filter((r) => view.events.some((e) => e.row === r.id));
  const rowsY: Record<string, number> = {};
  let y = AXIS + AR;
  const laneB = y;
  y += LANE;
  for (const r of rows.filter((r) => r.lane === "baustelle")) [rowsY[r.id], y] = [y, y + ROW];
  y += GAPY;
  const laneR = y;
  y += LANE;
  for (const r of rows.filter((r) => r.lane === "rechnung")) [rowsY[r.id], y] = [y, y + ROW];
  const bottom = y;

  const months: { iso: string; label: string | null }[] = [];
  for (let m = view.range.from; m < view.range.to; m = `${m.slice(5, 7) === "12" ? Number(m.slice(0, 4)) + 1 : m.slice(0, 4)}-${String((Number(m.slice(5, 7)) % 12) + 1).padStart(2, "0")}-01`)
    months.push({ iso: m, label: MONTHS[Number(m.slice(5, 7)) - 1] });
  // a name needs about 72 px: on a long project every second or third month is named, the year with the first and every Jänner
  const every = Math.max(1, Math.ceil(72 / ((X1 - X0) / months.length)));
  let last = -every;
  months.forEach((m, i) => {
    const jaenner = m.iso.slice(5, 7) === "01";
    const named = i - last >= every || (jaenner && i > 0 && i - last >= 2);
    const year = months.length > 12 && (i === 0 || jaenner);
    m.label = named ? (year ? `${m.label} ${m.iso.slice(0, 4)}` : m.label) : null;
    if (named) last = i;
  });
  // the line an amount must not run into: the deadline (a dashed divider may run behind a label)
  const walls = view.deadline ? [x(view.deadline.iso)] : [];
  const trace = new Set(view.events.find((e) => e.id === chosen)?.finds ?? []);
  // marks closer than 12 px in one row step up and down, so each stays clickable (two e-mails four days apart)
  const nudge = new Map<string, number>();
  for (const r of rows) {
    let last = -99;
    let up = false;
    let prev: string | null = null;
    for (const e of shown.filter((e) => e.row === r.id).sort((a, b) => a.date.iso.localeCompare(b.date.iso))) {
      const at = x(e.date.iso);
      up = at - last < 12 ? !up : false;
      if (up) {
        // the earlier one steps up, this one down
        nudge.set(e.id, 7);
        if (prev && !nudge.has(prev)) nudge.set(prev, -7);
      }
      last = at;
      prev = e.id;
    }
  }

  // labels: a find chip for the site, the printed amount for an invoice; right of the mark, else left, else above
  const labels: { id: string; left: number; top: number; node: React.ReactNode }[] = [];
  for (const r of rows) {
    const cy = rowsY[r.id] + ROW / 2;
    // oldest first, so the earlier mark gets the place at its right
    const marks = shown.filter((e) => e.row === r.id).map((e) => ({ e, x: x(e.date.iso) })).sort((a, b) => a.x - b.x);
    const taken: [number, number, number][] = [];
    let lastChip: Record<string, number> = {};
    for (const m of marks.filter((m) => m.e.finds.length || m.e.short || m.e.art === "abzugsschreiben")) {
      const isChip = m.e.lane === "baustelle";
      const text = isChip ? m.e.finds[0] : (m.e.short ?? "Abzüge angekündigt");
      if (isChip && lastChip[text] !== undefined && Math.abs(m.x - lastChip[text]) < 40) continue;
      const w = isChip ? 30 : text.length * 6.2 + 6;
      // right of the mark first, then above it, so a label stays next to its own mark
      const tries: [number, number][] = isChip ? [[m.x + 10, 0], [m.x + 4, -16], [m.x - 10 - w, 0], [m.x - 4 - w, -16]] : [[m.x + 10, 0], [m.x - 10 - w, 0]];
      for (const [a, dy] of tries) {
        const b = a + w;
        if (a < X0 - 4 || b > width - 4) continue;
        const hitsMark = marks.some((o) => o !== m && dy === 0 && o.x + 6 > a && o.x - 6 < b);
        const hitsLabel = taken.some(([p, q, ty]) => ty === dy && p < b + 4 && q > a - 4);
        const hitsWall = !isChip && walls.some((wx) => wx > a - 2 && wx < b + 2);
        if (hitsMark || hitsLabel || hitsWall) continue;
        taken.push([a, b, dy]);
        if (isChip) lastChip = { ...lastChip, [text]: m.x };
        labels.push({
          id: `${m.e.id}-label`,
          left: a,
          top: cy - 10 + dy,
          node: isChip ? <span className={chip}>{text}</span> : <span className="text-xs whitespace-nowrap text-fg-secondary tabular-nums">{text}</span>,
        });
        break;
      }
    }
  }

  return (
    <div className="relative" style={{ height: bottom + 26 }} aria-label="Zeitstrahl" role="group">
      {months.map((m) => (
        <div key={m.iso}>
          <div className="absolute w-px bg-line" style={{ left: x(m.iso), top: AXIS - 6, height: bottom - AXIS + 6 }} />
          {m.label && (
            <div className="absolute text-xs whitespace-nowrap text-fg-muted" style={{ left: x(m.iso) + 6, top: 4 }}>
              {m.label}
            </div>
          )}
        </div>
      ))}
      <div className="absolute flex items-center gap-1.5 font-semibold" style={{ top: laneB, height: LANE }}>
        <Construction className="size-4 text-fg-secondary" aria-hidden />
        Baustelle
      </div>
      <div className="absolute flex items-center gap-1.5 font-semibold" style={{ top: laneR, height: LANE }}>
        <ReceiptText className="size-4 text-fg-secondary" aria-hidden />
        Rechnung
      </div>
      {rows.map((r) => (
        <div key={r.id}>
          <div className="absolute flex items-center pl-[22px] text-fg-secondary" style={{ top: rowsY[r.id], height: ROW, width: LABEL }}>
            {r.title}
          </div>
          <div className="absolute h-px bg-[#f4f5f6]" style={{ top: rowsY[r.id] + ROW / 2, left: X0, width: X1 - X0 }} />
        </div>
      ))}
      {view.deadline && (
        <>
          <div className="absolute w-0.5 bg-state-red/70" style={{ left: x(view.deadline.iso), top: AXIS + 2, height: bottom - AXIS - 2 }} />
          <div className="absolute flex items-center gap-1.5 text-xs whitespace-nowrap text-state-red-edge" style={{ right: width - x(view.deadline.iso) - 1, top: bottom + 6 }}>
            <span aria-hidden className="size-2 rounded-full bg-state-red" />
            Schlussrechnung legen bis {view.deadline.text}
          </div>
        </>
      )}
      {view.events
        .filter((e) => e.art === "abschlagsrechnung")
        .map((e) => (
          <div key={`${e.id}-div`}>
            <div className="absolute border-l border-dashed border-fg-faint" style={{ left: x(e.date.iso), top: AXIS + 2, height: bottom - AXIS - 2 }} />
            <div className="absolute bg-surface pr-1 text-xs whitespace-nowrap text-fg-secondary" style={{ left: x(e.date.iso) + 5, top: AXIS + 3 }}>
              {e.title}
            </div>
          </div>
        ))}
      {shown.map((e) => {
        const isChosen = e.id === chosen;
        const traced = !isChosen && e.finds.some((f) => trace.has(f));
        const stand = standText(e);
        return (
          <button
            key={e.id}
            type="button"
            onClick={() => onChoose(e.id)}
            aria-label={[e.title, e.date.text, stand, e.finds.join(" ")].filter(Boolean).join(", ")}
            aria-pressed={isChosen}
            className={cn(
              "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform after:absolute after:-inset-2 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
              markClass(e, colourOf(e, view.finds)),
              isChosen && "outline-2 outline-offset-3 outline-accent outline-solid",
              traced && "outline-[1.5px] outline-offset-2 outline-accent outline-solid",
            )}
            tabIndex={isChosen ? 0 : -1}
            onKeyDown={(k) => {
              // the arrows walk along the time axis; Tab enters and leaves the picture at the chosen mark
              if (k.key !== "ArrowRight" && k.key !== "ArrowLeft") return;
              k.preventDefault();
              const order = [...shown].sort((a, b) => a.date.iso.localeCompare(b.date.iso) || a.row.localeCompare(b.row));
              const next = order[order.findIndex((o) => o.id === e.id) + (k.key === "ArrowRight" ? 1 : -1)];
              if (next) {
                onChoose(next.id);
                requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-mark="${CSS.escape(next.id)}"]`)?.focus());
              }
            }}
            data-mark={e.id}
            style={{ left: x(e.date.iso), top: rowsY[e.row] + ROW / 2 + (nudge.get(e.id) ?? 0) }}
          />
        );
      })}
      {labels.map((l) => (
        <span key={l.id} aria-hidden className="pointer-events-none absolute z-[5] rounded-[5px] bg-surface" style={{ left: l.left, top: l.top }}>
          {l.node}
        </span>
      ))}
    </div>
  );
}

/** Phones: the same events as a short list down the months, the invoices as dividers; a tap opens the event as a sheet. */
function PhoneList({ view, shown, onChoose }: { view: TimelineView; shown: TimelineEvent[]; onChoose: (id: string) => void }) {
  const sorted = [...shown].sort((a, b) => b.date.iso.localeCompare(a.date.iso) || (a.lane === b.lane ? 0 : a.lane === "baustelle" ? -1 : 1));
  return (
    <ol className="flex flex-col">
      {sorted.map((e, i) => {
        const head = i === 0 || sorted[i - 1].date.iso.slice(0, 7) !== e.date.iso.slice(0, 7) ? e.date.iso.slice(0, 7) : null;
        const colour = colourOf(e, view.finds);
        return (
          <li key={e.id}>
            {head && <div className="px-4 pt-4 pb-1 text-xs text-fg-secondary">{`${MONTHS[Number(head.slice(5, 7)) - 1]} ${head.slice(0, 4)}`}</div>}
            {e.lane === "rechnung" ? (
              <button type="button" onClick={() => onChoose(e.id)} className="flex min-h-11 w-full items-center gap-2 px-4 text-left text-xs text-fg-secondary outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
                <span aria-hidden className={cn("shrink-0", markClass(e, null))} />
                <span className="min-w-0 flex-1 truncate">{e.title}</span>
                {e.amount && <span className="shrink-0 whitespace-nowrap tabular-nums">{e.amount}</span>}
              </button>
            ) : (
              <button type="button" onClick={() => onChoose(e.id)} className="flex min-h-11 w-full items-center gap-2.5 px-4 py-1.5 text-left outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
                <span aria-hidden className={cn("shrink-0", markClass(e, colour))} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{e.title}</span>
                  <span className="truncate text-xs text-fg-secondary">{e.text}</span>
                </span>
                {e.finds.slice(0, 1).map((f) => (
                  <span key={f} className={chip}>
                    {f}
                  </span>
                ))}
              </button>
            )}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Project tab "Zeitstrahl" (SPEZIFIKATION.md 4.3; draft A "Zwei Bahnen", chosen by Maxi S. on 26.10.2026): one sentence
 * as the answer, then the picture; a click on a mark shows the event and its find below. "Mit Fund" (the default) shows
 * only the site events of a find, "Alle" every one. The chosen event is in the address (`#w4`).
 */
export function Timeline({ view }: { view: TimelineView }) {
  // a project without anything missing (a closed one) starts with every event
  const [all, setAll] = useState(view.counts.missing === 0);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(1100);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setWidth(el.clientWidth));
    ro.observe(el);
    setWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);
  const wide = width >= 720;

  const shown = useMemo(() => view.events.filter((e) => e.lane === "rechnung" || all || e.stand === "fehlt"), [view.events, all]);
  // first choice: the newest missing event whose find still has a gap, else the newest missing one
  const first = useMemo(() => {
    const missing = view.events.filter((e) => e.stand === "fehlt");
    return (missing.find((e) => view.finds[e.finds[0]]?.belegstand?.state !== "belegt") ?? missing[0] ?? view.events[0])?.id ?? null;
  }, [view]);

  useEffect(() => {
    const read = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (view.events.some((e) => e.id === id)) setChosen(id);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [view.events]);

  const current = view.events.find((e) => e.id === (chosen ?? first));
  const choose = (id: string) => {
    setChosen(id);
    window.history.replaceState(null, "", `#${id}`);
    if (!wide) setSheet(true);
  };
  const c = view.counts;

  return (
    <div className="flex flex-col pb-8">
      <div className="flex min-h-12 flex-wrap items-center gap-x-3 gap-y-2 px-3 py-2.5 shadow-line-bottom max-md:flex-col-reverse max-md:items-start max-md:px-4">
        <div role="group" aria-label="Ereignisse" className="flex items-center gap-1">
          {[
            { on: false, title: "Fehlt", count: c.missing },
            { on: true, title: "Alle", count: view.events.length },
          ].map((t) => (
            <button
              key={t.title}
              type="button"
              aria-pressed={all === t.on}
              onClick={() => setAll(t.on)}
              className={cn("flex h-7 items-center gap-1.5 rounded-md px-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11", all === t.on ? "bg-sidebar text-fg shadow-ring hover:bg-sidebar" : "text-fg-secondary")}
            >
              {t.title}
              <span className="rounded-xs bg-fill-hover px-1 text-xs text-count tabular-nums shadow-ring">{t.count}</span>
            </button>
          ))}
        </div>
        <p className="flex min-w-0 flex-1 items-center gap-1.5">
          {view.running ? (
            <span>
              <span className="font-semibold">{c.missing === 1 ? "1 Ereignis der Baustelle fehlt" : `${c.missing} Ereignisse der Baustelle fehlen`} in der Schlussrechnung.</span>{" "}
              <span className="text-fg-secondary">
                Gefunden in {c.findCount === 1 ? "1 Fund" : `${c.findCount} Funden`}{c.next ? `, ${c.next} kommen in die nächste Abschlagsrechnung` : ""}.
              </span>
            </span>
          ) : (
            <span className="text-fg-secondary">Die Schlussrechnung ist gelegt: tieout gleicht hier nicht mehr ab.</span>
          )}
          <InfoTip label="Zeitstrahl">
            <span className="mb-2 block">Oben die Baustelle, unten die Rechnungen. Ein Klick zeigt das Ereignis und seinen Fund, die Pfeiltasten gehen weiter.</span>
            <span className="grid grid-cols-[16px_1fr] items-center gap-x-2 gap-y-1.5">
              {LEGEND.map((l) => (
                <span key={l.text} className="contents">
                  <span className="flex justify-center">
                    <span aria-hidden className={l.mark} />
                  </span>
                  <span>{l.text}</span>
                </span>
              ))}
            </span>
          </InfoTip>
        </p>
      </div>

      <div ref={box} className={cn(wide ? "mx-6 mt-2" : "")}>
        {wide ? <Chart view={view} shown={shown} width={width} chosen={current?.id ?? null} onChoose={choose} /> : <PhoneList view={view} shown={shown} onChoose={choose} />}
      </div>

      {wide && current && (
        <div className="mx-6 mt-4">
          <Detail e={current} view={view} onChoose={choose} />
        </div>
      )}
      {!wide && (
        <Sheet open={sheet && !!current} onOpenChange={setSheet}>
          <SheetContent side="bottom" className="h-[85dvh]">
            <SheetTitle>{current?.title}</SheetTitle>
            <div className="flex h-11 shrink-0 items-center justify-end px-2 shadow-line-bottom">
              <button type="button" onClick={() => setSheet(false)} aria-label="Schließen" className="flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-4">{current && <Detail e={current} view={view} onChoose={(id) => setChosen(id)} />}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
