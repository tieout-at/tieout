"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Construction, FileSearch, ReceiptText, X } from "lucide-react";
import { createElement, useEffect, useState } from "react";

import { keep } from "@/components/charts/tones";
import { belegIcon } from "@/components/fund/icons";
import { OriginalViewer } from "@/components/fund/original-viewer";
import { buttonVariants } from "@/components/ui/button";
import { dayTitle, groupByDay, byMoment } from "@/lib/calendar";
import type { OriginalPage } from "@/lib/originals";
import type { TimelineEvent, TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { markStyle, meaningOf, statusWord } from "./marks";

export type Selection = { kind: "event"; id: string } | { kind: "day"; iso: string };

// the originals of a project, loaded once per visit from its static file (as `OriginalLink` does)
const loaded = new Map<string, Promise<Record<string, OriginalPage>>>();
const loadOriginals = (project: string) => {
  if (!loaded.has(project)) loaded.set(project, fetch(`/originale/${project}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return loaded.get(project)!;
};

const iconOf = (art: string) => belegIcon(art as Parameters<typeof belegIcon>[0]) ?? Construction;
const chip = "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring";
const closeButton = "flex size-8 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11";

export function Mark({ e, view, size = 12 }: { e: TimelineEvent; view: TimelineView; size?: number }) {
  const m = markStyle(meaningOf(e, view.finds), size);
  return <span aria-hidden className={cn("inline-block shrink-0", m.className)} style={m.style} />;
}

/**
 * The content of the window that opens at the right when an event or a day is chosen in any view of the Zeitstrahl:
 * what happened, what it means for the Schlussrechnung, the find with its amount, gap and Abhilfe, the other events of
 * that find, and the original. Its own header carries the close button (the window closes on Escape too). The parent
 * keys it by the selection, so a new choice starts with the event, not with the original of the one before.
 */
export function DetailContent({ selection, view, onSelect, onClose }: { selection: Selection; view: TimelineView; onSelect: (s: Selection) => void; onClose: () => void }) {
  const [original, setOriginal] = useState(false);
  const [pages, setPages] = useState<Record<string, OriginalPage> | null>(null);
  useEffect(() => {
    let live = true;
    void loadOriginals(view.project).then((p) => live && setPages(p));
    return () => {
      live = false;
    };
  }, [view.project]);

  if (selection.kind === "day") {
    const day = groupByDay(view.events.filter((e) => e.date.iso === selection.iso))[0];
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-4 shadow-line-bottom">
          <h2 className="min-w-0 flex-1 truncate font-medium">{dayTitle(selection.iso)}</h2>
          <button type="button" aria-label="Fenster schließen" onClick={onClose} className={closeButton}>
            <X className="size-4" aria-hidden />
          </button>
        </header>
        <ul className="min-h-0 flex-1 overflow-y-auto p-2">
          {(day?.events ?? []).map((e) => (
            <li key={e.id}>
              <button type="button" onClick={() => onSelect({ kind: "event", id: e.id })} className="flex min-h-11 w-full items-center gap-3 rounded-md px-2 py-1.5 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
                <span className="w-10 shrink-0 text-xs text-fg-muted tabular-nums">{e.time ?? ""}</span>
                <Mark e={e} view={view} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate">{e.title}</span>
                  <span className="truncate text-xs text-fg-muted">{statusWord(meaningOf(e, view.finds), view.target) ?? e.amount ?? e.text}</span>
                </span>
                {e.finds[0] && <span className={chip}>{e.finds[0]}</span>}
              </button>
            </li>
          ))}
          {!day && <li className="px-2 py-6 text-center text-fg-muted">An diesem Tag ist nichts passiert.</li>}
        </ul>
      </div>
    );
  }

  const e = view.events.find((x) => x.id === selection.id);
  if (!e) return null;
  const meaning = meaningOf(e, view.finds);
  const word = statusWord(meaning, view.target);
  const f = e.finds[0] ? view.finds[e.finds[0]] : null;
  const others = f ? view.events.filter((x) => x.id !== e.id && x.finds.includes(f.number)).sort(byMoment) : [];
  const page = pages?.[`${e.id}:1`];

  if (original && page && pages)
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <button type="button" onClick={() => setOriginal(false)} className="flex h-10 shrink-0 items-center gap-1.5 px-4 text-left text-xs text-fg-secondary outline-none shadow-line-bottom hover:text-fg focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
          <ArrowLeft className="size-3.5" aria-hidden />
          Zurück zum Ereignis
        </button>
        <div className="min-h-0 flex-1">
          <OriginalViewer source={{ page: `${e.id}:1`, place: null, label: e.title, detail: "Seite 1", short: e.title }} originals={pages} onClose={onClose} />
        </div>
      </div>
    );

  const facts = [
    ...(e.who ? [{ k: "Von", v: e.who }] : []),
    ...(e.amount ? [{ k: "Betrag", v: keep(e.amount) }] : []),
    ...(e.weak ? [{ k: "Beleg", v: e.weak }] : []),
    ...(e.positions.length ? [{ k: e.positions.length === 1 ? "Position" : "Positionen", v: e.positions.length > 4 ? `${e.positions.slice(0, 4).join(", ")} und ${e.positions.length - 4} weitere` : e.positions.join(", "), mono: true }] : []),
  ];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-4 shadow-line-bottom">
        {createElement(e.lane === "baustelle" ? iconOf(e.art) : ReceiptText, { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
        <span className="min-w-0 flex-1 truncate text-sm text-fg-secondary tabular-nums">
          {dayTitle(e.date.iso)}
          {e.time ? `, ${e.time}` : ""}
        </span>
        <button type="button" aria-label="Fenster schließen" onClick={onClose} className={closeButton}>
          <X className="size-4" aria-hidden />
        </button>
      </header>
      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <section aria-label="Ereignis" className="flex flex-col gap-1.5">
          <span className="text-xs text-fg-muted">{e.lane === "baustelle" ? "Baustelle" : "Rechnung"}</span>
          <h2 className="text-base font-semibold">{e.title}</h2>
          {e.text !== e.title && <p className="text-fg-secondary">{e.text}</p>}
          {word && (
            <span className={cn("mt-1 flex items-center gap-2", meaning !== "invoiced" && meaning !== "none" && "font-medium")}>
              <Mark e={e} view={view} />
              {word}
            </span>
          )}
          {e.rechtsfrage && <p className="mt-1 rounded-md bg-fill-subtle px-3 py-2 text-xs text-fg-secondary">Rechtsfrage für die Geschäftsführung. tieout bewertet sie nicht.</p>}
          {facts.length > 0 && (
            <dl className="mt-2 grid grid-cols-[88px_minmax(0,1fr)] gap-x-3 gap-y-1.5">
              {facts.map((x) => (
                <div key={x.k} className="col-span-2 grid grid-cols-subgrid">
                  <dt className="text-fg-secondary">{x.k}</dt>
                  <dd className={cn("min-w-0 break-words tabular-nums", "mono" in x && x.mono && "font-mono text-xs leading-5")}>{x.v}</dd>
                </div>
              ))}
            </dl>
          )}
          {page && (
            <button type="button" onClick={() => setOriginal(true)} className={cn(buttonVariants({ variant: "secondary" }), "mt-2 self-start")}>
              <FileSearch aria-hidden />
              Original ansehen
            </button>
          )}
        </section>

        {f ? (
          <section aria-label="Gefunden" className="flex flex-col gap-2 rounded-xl bg-sidebar p-3.5 shadow-ring">
            <span className="text-xs text-fg-secondary">Gefunden</span>
            <span className="flex items-start gap-2">
              <span className={chip}>{f.number}</span>
              <span className="min-w-0 flex-1">{f.name}</span>
            </span>
            <span className="text-xl font-semibold whitespace-nowrap tabular-nums">{keep(f.amount)}</span>
            {f.belegstand && f.belegstand.state !== "belegt" && (
              <span className="flex items-center gap-2 text-sm">
                <span aria-hidden className={cn("size-2 rounded-full", f.belegstand.state === "beleg_fehlt" ? "bg-data-gap" : "bg-data-change")} />
                {f.belegstand.text}
              </span>
            )}
            {(e.risk || e.weak) && f.belegstand?.state === "belegt" && (
              <span className="flex items-center gap-2 text-sm">
                <span aria-hidden className="size-2 rounded-full bg-data-risk" />
                Kürzungsrisiko: {e.risk ?? `${e.title} ${e.weak}`}
              </span>
            )}
            {f.remedy && (
              <p className="text-sm">
                <span className="text-fg-secondary">Abhilfe </span>
                {f.remedy}
              </p>
            )}
            {others.length > 0 && (
              <div className="mt-1 flex flex-col">
                <span className="mb-1 text-xs text-fg-secondary">Weitere Belege zu {f.number}</span>
                {others.map((o) => (
                  <button key={o.id} type="button" onClick={() => onSelect({ kind: "event", id: o.id })} className="-mx-2 flex min-h-9 items-center gap-2 rounded-md px-2 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
                    {createElement(iconOf(o.art), { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
                    <span className="min-w-0 flex-1 truncate text-sm">{o.title}</span>
                    <span className="text-xs text-fg-muted tabular-nums">
                      {o.date.text}
                      {o.time ? `, ${o.time}` : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <Link href={f.href} className={cn(buttonVariants({ variant: "secondary" }), "mt-1 self-start")}>
              Fund öffnen
              <ArrowRight aria-hidden />
            </Link>
          </section>
        ) : e.lane === "baustelle" ? (
          <p className="rounded-xl bg-sidebar px-3.5 py-3 text-fg-secondary">Zu diesem Ereignis gehört kein Fund.</p>
        ) : null}
      </div>
    </div>
  );
}
