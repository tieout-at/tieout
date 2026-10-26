"use client";

import Link from "next/link";
import { Check, ListFilter, X } from "lucide-react";
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

/** One line per find the message proves: number, name, amount, and the gap if there is one. */
function FindLine({ f }: { f: InboxFind }) {
  return (
    <Link href={f.href} className="-mx-2 flex min-h-9 flex-wrap items-center gap-x-2 gap-y-1 rounded-md px-2 py-1.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
      <span className={chip}>{f.number}</span>
      <span className="line-clamp-2 min-w-0 flex-1 basis-40">{f.name}</span>
      {f.belegstand && f.belegstand.state !== "belegt" && <Tag colour={GAP[f.belegstand.state]}>{f.belegstand.text}</Tag>}
      <span className="shrink-0 whitespace-nowrap tabular-nums">{f.amount}</span>
    </Link>
  );
}

/** The chosen message: what it means for the Schlussrechnung first, then the facts the original does not show, then the original as read. */
function Reader({ item, noun }: { item: InboxItem; noun: string }) {
  return (
    <article aria-label={item.title} className="mx-auto flex w-full max-w-[720px] flex-col gap-5 px-6 py-5 max-md:px-4">
      <header className="flex flex-col gap-1">
        <h2 className="text-lg font-semibold">{item.title}</h2>
        <p className="text-fg-secondary">
          {[item.sender, item.side, item.time ? `${item.date.text}, ${item.time}` : item.date.text].filter(Boolean).join(" · ")}
          {" · "}
          <Link href={`/projekte/${item.project.slug}/`} className="link-quiet">
            {item.project.name}
          </Link>
        </p>
      </header>

      <section aria-label="Für die Schlussrechnung" className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
        <h3 className="flex items-center gap-1.5 text-xs text-fg-secondary">
          Für die Schlussrechnung
          <InfoTip label="Für die Schlussrechnung">
            tieout gleicht jede {noun} mit den Rechnungen ab: ist die Arbeit verrechnet, oder fehlt sie und ist als Fund aufgenommen. Eine Rechtsfrage bewertet tieout nicht, sie geht an die Geschäftsführung.
          </InfoTip>
        </h3>
        {item.finds.length > 0 ? (
          <>
            <p>{item.stand?.state === "fehlt" ? "Fehlt in der Schlussrechnung, als Fund aufgenommen:" : "Belegt diesen Fund:"}</p>
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
          <p className="text-fg-secondary">Nichts zu verrechnen.</p>
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
        <section aria-label="Original" className="flex flex-col gap-2">
          <h3 className="text-xs text-fg-secondary">So hat tieout sie gelesen</h3>
          <div className="rounded-lg bg-sidebar p-3">
            <OriginalPaper page={item.original} mark={null} />
          </div>
        </section>
      )}
    </article>
  );
}

/** A row of the list: who and when on top, what below, then project, finds and the state in 12 px. */
function ListRow({ item, chosen, onChoose }: { item: InboxItem; chosen: boolean; onChoose: () => void }) {
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
          <span className="min-w-0 flex-1 truncate text-fg-secondary">{item.sender}</span>
          <span className="shrink-0 text-xs text-fg-secondary tabular-nums">{item.time ? `${item.date.text}, ${item.time}` : item.date.text}</span>
        </span>
        <span className="line-clamp-2">{item.title}</span>
        <span className="flex min-h-5 flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-secondary">
          <span>{item.project.name}</span>
          {item.finds.map((f) => (
            <span key={f.number} className={chip}>
              {f.number}
            </span>
          ))}
          {item.stand?.state === "fehlt" && <span>fehlt in der Schlussrechnung</span>}
          {item.rechtsfrage && <span>Rechtsfrage</span>}
          {item.copies > 0 && <span>{item.copies === 1 ? "einmal doppelt abgelegt" : `${item.copies}-mal doppelt abgelegt`}</span>}
        </span>
      </button>
    </li>
  );
}

/**
 * "WhatsApp-Meldungen" and "E-Mails" (Attio's "Calls" and "Emails", read only): a list of every message, newest first,
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
      const id = decodeURIComponent(window.location.hash.slice(1));
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
        <ul aria-label={plural} className="min-h-0 w-full shrink-0 overflow-y-auto lg:w-[400px] lg:shadow-[inset_-1px_0_0_var(--color-line)]">
          {shown.map((i) => (
            <ListRow key={i.id} item={i} chosen={wide && current?.id === i.id} onChoose={() => choose(i.id)} />
          ))}
          {!shown.length && <li className="px-4 py-6 text-center text-fg-secondary">{empty}</li>}
        </ul>
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
