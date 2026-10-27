"use client";

import Link from "next/link";
import { Check, ChevronRight, ListFilter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { OriginalPaper } from "@/components/fund/original-paper";
import { barButton, menuItem } from "@/components/table/data-table";
import { Tag } from "@/components/table/tag";
import { InfoTip } from "@/components/ui/info-tip";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/components/ui/use-media";
import type { InboxFind, InboxItem, InboxView } from "@/lib/inbox";
import { cn } from "@/lib/utils";

const chip = "flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring";
const GAP = { beleg_fehlt: "yellow", nachtrag_nicht_gelegt: "orange" } as const;
/** The dot of a find's Belegstand: green belegt, yellow Beleg fehlt, orange Nachtrag nicht gelegt. */
const STAND_DOT = { belegt: "bg-state-green", beleg_fehlt: "bg-state-yellow", nachtrag_nicht_gelegt: "bg-state-orange" } as const;
const keep = (text: string) => text.replace(/ €/g, " €");

/**
 * A find as a chip in the list: "Beleg zu F1" with the dot and the word of its Belegstand. No amount: a message is one
 * Beleg among several of the find, so the find's amount would read as the worth of the message (council of step 8d).
 */
function FindChip({ f }: { f: InboxFind }) {
  return (
    <span className="inline-flex h-5 shrink-0 items-center gap-1.5 rounded-xs bg-fill-subtle pr-1.5 pl-1 text-xs shadow-ring">
      <span aria-hidden className={cn("size-1.5 rounded-full", f.belegstand ? STAND_DOT[f.belegstand.state] : "bg-state-grey")} />
      <span className="text-count">Beleg zu {f.number}</span>
      {f.belegstand && <span className="text-fg-muted">{f.belegstand.text}</span>}
    </span>
  );
}

/** The head of the reader: where the work of the message belongs (a running project settles in its next Abschlagsrechnung). */
const forWhat = (item: InboxItem) => (item.missing.includes("Abschlagsrechnung") ? "Für die nächste Abschlagsrechnung" : "Für die Schlussrechnung");

/** One line per find the message proves: dot, number, name, the gap if there is one, amount. */
function FindLine({ f }: { f: InboxFind }) {
  return (
    <Link href={f.href} className="-mx-2 flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-1.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", f.belegstand ? STAND_DOT[f.belegstand.state] : "bg-state-grey")} />
      <span className={chip}>{f.number}</span>
      <span className="line-clamp-2 min-w-0 flex-1 basis-40">{f.name}</span>
      {f.belegstand && f.belegstand.state !== "belegt" && <Tag colour={GAP[f.belegstand.state]}>{f.belegstand.text}</Tag>}
      <span className="shrink-0 whitespace-nowrap tabular-nums">{keep(f.amount)}</span>
    </Link>
  );
}

/** "Donnerstag, 24.09.2026": the head of a day in the list (the date of the twin, read as a calendar day). */
export function dayText(iso: string): string {
  const day = new Intl.DateTimeFormat("de-AT", { weekday: "long", timeZone: "UTC" }).format(new Date(`${iso}T12:00:00Z`));
  return `${day}, ${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

/** The message itself as a chat bubble: sender role and time above, the words in the bubble, place and hours under it. */
function Bubble({ item }: { item: InboxItem }) {
  return (
    <section aria-label="Meldung" className="flex flex-col gap-1.5">
      <p className="flex items-baseline gap-2 text-xs text-fg-secondary">
        <span className="font-medium text-fg">{item.sender}</span>
        <span className="tabular-nums">{item.time ? `${item.date.text}, ${item.time}` : item.date.text}</span>
      </p>
      <div className="w-fit max-w-[560px] rounded-2xl rounded-tl-md bg-sidebar px-4 py-3 leading-6 shadow-ring">{item.preview}</div>
      {(item.hours || item.place) && <p className="text-xs text-fg-secondary">{[item.place, item.hours].filter(Boolean).join(" · ")}</p>}
    </section>
  );
}

/** The chosen message: what it means for the Schlussrechnung first, then the facts the original does not show, then the original as read. */
function Reader({ item, noun }: { item: InboxItem; noun: string }) {
  return (
    <article aria-label={item.title} className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-6 py-5 max-md:px-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{item.title}</h2>
        <p className="text-fg-secondary">
          {/* a message names sender and time in its bubble below */}
          {!item.time && `${[item.sender, item.side, item.date.text].filter(Boolean).join(" · ")} · `}
          <Link href={`/projekte/${item.project.slug}/`} className="link-quiet">
            {item.project.name}
          </Link>
        </p>
      </header>

      {item.time && item.preview && <Bubble item={item} />}

      <section aria-label={forWhat(item)} className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
        <h3 className="flex items-center gap-1.5 text-xs text-fg-secondary">
          {forWhat(item)}
          <InfoTip label={forWhat(item)}>
            tieout gleicht jede {noun} mit den Rechnungen ab: ist die Arbeit verrechnet, oder fehlt sie und ist als Fund aufgenommen. Eine Rechtsfrage bewertet tieout nicht, sie geht an die Geschäftsführung.
          </InfoTip>
        </h3>
        {item.finds.length > 0 ? (
          <>
            <p>{item.stand?.state === "fehlt" ? `${item.missing.charAt(0).toUpperCase()}${item.missing.slice(1)}, als Fund aufgenommen:` : "Belegt diesen Fund:"}</p>
            <div className="flex flex-col">
              {item.finds.map((f) => (
                <FindLine key={f.number} f={f} />
              ))}
            </div>
          </>
        ) : item.rechtsfrage ? (
          <p>Rechtsfrage für die Geschäftsführung. tieout bewertet sie nicht.</p>
        ) : item.stand ? (
          <p>{item.stand.state === "verrechnet" ? "Die Arbeit ist verrechnet." : "Die Arbeit kommt in die nächste Abschlagsrechnung."}</p>
        ) : (
          <p className="text-fg-secondary">Kein Fund aus dieser {noun}.</p>
        )}
      </section>

      {item.facts.length > 0 && (
        <dl className="grid grid-cols-[132px_minmax(0,1fr)] gap-x-3 gap-y-2 max-md:grid-cols-[112px_minmax(0,1fr)]">
          {item.facts.map((f) => (
            <div key={f.label} className="col-span-2 grid grid-cols-subgrid">
              <dt className="text-fg-secondary">{f.label}</dt>
              <dd className="min-w-0 break-words">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {item.original && (
          // the original as read is one click away (a message: its words stand in the bubble above)
          <details className="group">
            <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-md text-xs text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11 [&::-webkit-details-marker]:hidden">
              <ChevronRight aria-hidden className="size-3.5 transition-transform group-open:rotate-90" />
              So hat tieout sie gelesen
            </summary>
            <div className="mt-2 rounded-lg bg-sidebar p-3">
              <OriginalPaper page={item.original} mark={null} />
            </div>
          </details>
        )}
    </article>
  );
}

/** A row of the list: who and when on top, what below, then project, finds and the state in 12 px. */
function ListRow({ item, chosen, onChoose, withDate }: { item: InboxItem; chosen: boolean; onChoose: () => void; withDate: boolean }) {
  return (
    <li>
      <button
        type="button"
        data-item={item.id}
        onClick={onChoose}
        aria-current={chosen ? "true" : undefined}
        className={cn(
          "flex w-full flex-col gap-0.5 px-4 py-2.5 text-left shadow-line-bottom outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent",
          chosen && "bg-fill-selected hover:bg-fill-selected",
        )}
      >
        <span className="flex items-baseline gap-2">
          <span className="line-clamp-2 min-w-0 flex-1 text-fg-secondary">
            {item.sender}
            <span className="text-fg-muted"> · {item.project.name}</span>
          </span>
          {/* a day with two or more messages has a head; otherwise the row carries its date, and a message its time */}
          {(withDate || item.time) && <span className="shrink-0 text-xs text-fg-muted tabular-nums">{[withDate ? item.date.text : null, item.time].filter(Boolean).join(", ")}</span>}
        </span>
        <span className="line-clamp-2">{item.title}</span>
        <span className="mt-0.5 flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-secondary empty:hidden">
          {item.finds.map((f) => (
            <FindChip key={f.number} f={f} />
          ))}
          {item.stand?.state === "fehlt" && <span className="text-fg-muted">{item.missing}</span>}
          {item.rechtsfrage && <span>Rechtsfrage</span>}
          {item.copies > 0 && <span>{item.copies === 1 ? "einmal doppelt abgelegt" : `${item.copies}-mal doppelt abgelegt`}</span>}
        </span>
      </button>
    </li>
  );
}

/**
 * "WhatsApp-Meldungen" and "E-Mails" (Attio's "Calls" and "Emails", read only): a list of every message, newest first, with a
 * sticky head for a day with two or more, each find a chip "Beleg zu F1" with the dot and word of its Belegstand,
 * filtered by "Mit Fund" or project, and the chosen one on the right with what it means for the Schlussrechnung and the
 * original as read. The choice is in the address (`#w4`). Below 1024 px the list stays and a message opens as a panel.
 */
export function Inbox({ view, noun, plural, empty }: { view: InboxView; noun: string; plural: string; empty: string }) {
  const [onlyFinds, setOnlyFinds] = useState(false);
  const [projects, setProjects] = useState<string[]>([]);
  const [chosen, setChosen] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const wide = useMediaQuery("(min-width: 1024px)", true);

  const shown = useMemo(
    () => view.items.filter((i) => (!onlyFinds || i.finds.length > 0) && (!projects.length || projects.includes(i.project.name))),
    [view.items, onlyFinds, projects],
  );

  // the message in the address, else the newest one shown
  useEffect(() => {
    const read = () => {
      let id = "";
      try {
        id = decodeURIComponent(window.location.hash.slice(1));
      } catch {
        return; // a broken address keeps the newest message
      }
      if (view.items.some((i) => i.id === id)) setChosen(id);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [view.items]);

  const current = shown.find((i) => i.id === chosen) ?? (wide ? shown[0] : undefined);
  // a message chosen by the address is brought into view in the list
  useEffect(() => {
    if (chosen) document.querySelector(`[data-item="${CSS.escape(chosen)}"]`)?.scrollIntoView({ block: "nearest" });
  }, [chosen]);
  const choose = (id: string) => {
    setChosen(id);
    window.history.replaceState(null, "", `#${id}`);
    if (!wide) setSheet(true);
  };
  const withFinds = view.items.filter((i) => i.finds.length).length;
  // the list in days, newest first (the items come sorted)
  const days = shown.reduce<{ iso: string; items: InboxItem[] }[]>((acc, i) => {
    const last = acc.at(-1);
    if (last?.iso === i.date.iso) last.items.push(i);
    else acc.push({ iso: i.date.iso, items: [i] });
    return acc;
  }, []);
  // a choice that changes nothing is no choice: "Mit Fund" shows only when some have none
  const views = withFinds < view.items.length ? [{ on: false, title: "Alle", count: view.items.length }, { on: true, title: "Mit Fund", count: withFinds }] : [{ on: false, title: "Alle", count: view.items.length }];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-3 py-2.5 shadow-line-bottom">
        <div role="group" aria-label="Ansicht" className="flex items-center gap-1">
          {views.map((t) => (
            <button
              key={t.title}
              type="button"
              aria-pressed={onlyFinds === t.on}
              onClick={() => setOnlyFinds(t.on)}
              className={cn(
                "flex h-7 items-center gap-1.5 rounded-md px-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11",
                onlyFinds === t.on ? "bg-sidebar text-fg shadow-ring hover:bg-sidebar" : "text-fg-secondary",
              )}
            >
              {t.title}
              <span className="rounded-xs bg-fill-hover px-1 text-xs text-count tabular-nums shadow-ring">{t.count}</span>
            </button>
          ))}
        </div>
        {view.projects.length > 1 && (
          <>
            <span aria-hidden className="h-4 w-px bg-line" />
            {projects.length > 0 && (
              <div className="flex h-7 items-center rounded-md bg-surface shadow-button max-md:h-8">
                <span className="flex h-full max-w-72 items-center gap-1.5 pr-1 pl-2">
                  <span className="text-fg-secondary">Projekt</span>
                  <span className="truncate">{projects.join(", ")}</span>
                </span>
                <button
                  type="button"
                  aria-label="Filter Projekt entfernen"
                  onClick={() => setProjects([])}
                  className="flex h-full items-center rounded-r-md px-1.5 text-fg-secondary outline-none hover:bg-row-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:px-3"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </div>
            )}
            <Popover>
              <PopoverTrigger className={cn(barButton, "bg-fill-subtle px-2 text-fg-muted shadow-none hover:bg-fill-hover")}>
                <ListFilter className="size-4" aria-hidden />
                Filter
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <PopoverTitle>Projekt</PopoverTitle>
                <ul aria-label="Projekt filtern">
                  {view.projects.map((p) => (
                    <li key={p}>
                      <button type="button" onClick={() => setProjects(projects.includes(p) ? projects.filter((x) => x !== p) : [...projects, p])} className={menuItem}>
                        <span className="flex-1 text-left">{p}</span>
                        <span className="text-xs text-fg-muted tabular-nums">{view.items.filter((i) => i.project.name === p).length}</span>
                        {projects.includes(p) && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </PopoverContent>
            </Popover>
          </>
        )}
        <span className="ml-auto text-xs text-fg-muted max-md:hidden">Sortiert nach Datum, neueste zuerst</span>
      </div>

      <div className="flex min-h-0 flex-1">
        <div role="region" aria-label={plural} className="min-h-0 w-full shrink-0 overflow-y-auto lg:w-[400px] lg:shadow-[inset_-1px_0_0_var(--color-line)]">
          {days.map((d) =>
            d.items.length > 1 ? (
              <section key={d.iso} aria-label={dayText(d.iso)}>
                <h3 className="sticky top-0 z-10 flex h-8 items-center justify-between bg-sidebar px-4 text-xs text-fg-secondary shadow-line-bottom">
                  <span>{dayText(d.iso)}</span>
                  <span className="text-fg-muted tabular-nums">{d.items.length}</span>
                </h3>
                <ul>
                  {d.items.map((i) => (
                    <ListRow key={i.id} item={i} withDate={false} chosen={wide && current?.id === i.id} onChoose={() => choose(i.id)} />
                  ))}
                </ul>
              </section>
            ) : (
              <ul key={d.iso}>
                <ListRow item={d.items[0]} withDate chosen={wide && current?.id === d.items[0].id} onChoose={() => choose(d.items[0].id)} />
              </ul>
            ),
          )}
          {!shown.length && <p className="px-4 py-6 text-center text-fg-secondary">{empty}</p>}
        </div>
        {wide && <div className="min-h-0 flex-1 overflow-y-auto">{current && <Reader item={current} noun={noun} />}</div>}
      </div>

      {!wide && (
        <Sheet open={sheet && !!current} onOpenChange={setSheet}>
          <SheetContent side="bottom" className="h-[85dvh]">
            <SheetTitle>{current?.title}</SheetTitle>
            <div className="flex h-11 shrink-0 items-center justify-end px-2 shadow-line-bottom">
              <button type="button" onClick={() => setSheet(false)} aria-label="Schließen" className="flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover">
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto">{current && <Reader item={current} noun={noun} />}</div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
