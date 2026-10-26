"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { belegIcon } from "@/components/fund/icons";
import { findDetail, showsLabel, traceSentence, type Model, type Trace } from "./model";
import { TONE_DOT } from "./twin-column";

function Trail({ model, ids, chips, finds }: { model: Model; ids: string[]; chips: boolean; finds: string[] }) {
  const sorted = [...ids].sort((a, b) => (model.belege.get(a)!.date.iso < model.belege.get(b)!.date.iso ? -1 : 1));
  return (
    <ul className="flex flex-col">
      {sorted.map((id) => {
        const b = model.belege.get(id)!;
        const Icon = belegIcon(b.art);
        const shows = b.shows.filter((n) => finds.includes(n));
        return (
          <li
            key={id}
            className="relative grid grid-cols-[14px_minmax(0,1fr)_auto] items-start gap-x-2 py-[7px] text-[13px] leading-[18px] before:absolute before:top-3 before:-left-[19px] before:size-2 before:rounded-full before:bg-surface before:ring-[1.5px] before:ring-accent before:ring-inset"
          >
            <Icon className="mt-0.5 size-3.5 text-fg-secondary" aria-hidden />
            <span className="min-w-0">{b.detail ? `${b.title}, ${b.detail}` : b.title}</span>
            <span className="font-mono text-xs whitespace-nowrap text-fg-secondary">{b.date.text}</span>
            {chips && b.finds.length > 0 && <span className="col-start-2 col-end-4 font-mono text-[11px] text-accent">{b.finds.join(" · ")}</span>}
            {shows.length > 0 && <span className="col-start-2 col-end-4 text-xs text-accent">{showsLabel(b)}</span>}
          </li>
        );
      })}
    </ul>
  );
}

function Close() {
  return (
    <SheetClose aria-label="Schließen" className="flex size-11 items-center justify-center rounded-[10px] text-fg-secondary hover:bg-fill-hover">
      <X className="size-[18px]" aria-hidden />
    </SheetClose>
  );
}

/**
 * On a phone a trace opens as a sheet from the bottom (Base UI Dialog: focus moves in and back to the opener, the
 * page behind is inert). A finding reads top to bottom: its Belege, its positions, why, and the amount.
 */
export function TraceSheet({
  model,
  trace,
  onClose,
  onPick,
  finalFocus,
}: {
  model: Model;
  trace: Trace | null;
  onClose: () => void;
  onPick: (nr: string) => void;
  finalFocus: () => HTMLElement | null;
}) {
  // keep the last trace on screen while the sheet slides out
  const [last, setLast] = useState<Trace | null>(trace);
  if (trace && trace !== last) setLast(trace);
  const view = trace ?? last;
  const t = view?.target;
  const d = t?.kind === "fund" ? findDetail(model, t.id) : null;
  const block = t?.kind === "block" ? model.blocks.find((b) => b.key === t.id) : null;
  const group = t?.kind === "gruppe" ? model.groups.find((g) => g.key === t.id) : null;
  const ids = view ? view.sources : [];
  return (
    <Sheet open={!!trace} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" finalFocus={() => finalFocus() ?? true}>
        <div aria-hidden className="mx-auto mt-2 h-1 w-9 shrink-0 rounded-full bg-fg-faint" />
        {d && (
          <>
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-x-2 py-1.5 pr-1.5 pl-4 shadow-line-bottom">
              <SheetTitle className="not-sr-only text-[15px] leading-5 font-semibold">
                <span className="mr-1.5 font-mono text-xs font-medium text-accent">{d.nr}</span>
                {d.label}
              </SheetTitle>
              <span className="text-[15px] font-semibold tabular-nums">{d.amount}</span>
              <Close />
              <div className="col-span-3 mt-0.5 mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-secondary">
                <span className="inline-flex items-center gap-1.5 text-fg">
                  <i className={cn("size-2 rounded-full", TONE_DOT[d.tone])} />
                  {d.stand}
                </span>
                {d.present && <span>{d.present}</span>}
              </div>
            </div>
            <div className="overflow-auto px-4 pt-2.5 pb-5">
              <div className="relative pl-[22px] before:absolute before:top-2 before:bottom-6 before:left-1.5 before:w-0.5 before:rounded-full before:bg-accent">
                <p className="mt-1 mb-1.5 text-xs text-fg-secondary">{d.proofText ?? "Belege"}</p>
                <Trail model={model} ids={ids} chips={false} finds={view!.finds} />
                {d.cells.length > 0 && (
                  <div className="relative mt-1.5 py-1.5 text-xs leading-[18px] text-fg-secondary before:absolute before:top-2.5 before:-left-[19px] before:size-2 before:rounded-[2px] before:bg-accent">
                    {d.cells.length === 1 ? "1 Position" : `${d.cells.length} Positionen`}
                    <table className="mt-1 w-full border-collapse tabular-nums">
                      <thead>
                        <tr>
                          <th className="sr-only">Position</th>
                          <th className="pb-0.5 pl-2 text-right font-normal">beauftragt</th>
                          <th className="pb-0.5 pl-2 text-right font-normal">erbracht</th>
                          <th className="pb-0.5 pl-2 text-right font-normal">verrechnet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {d.cells.map((c, i) => (
                          <tr key={`${c.id}-${i}`}>
                            <td className={cn("max-w-28 truncate py-0.5 text-left text-fg", c.id !== "ohne Position" && "font-mono")}>{c.id === "ohne Position" ? c.label : c.id}</td>
                            <td className="py-0.5 pl-2 text-right text-fg">{c.beauftragt}</td>
                            <td className="py-0.5 pl-2 text-right font-semibold text-accent">{c.erbracht}</td>
                            <td className="py-0.5 pl-2 text-right text-fg">{c.verrechnet}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {d.remedy && <p className="mt-2 text-xs text-fg">Abhilfe: {d.remedy}</p>}
                {d.risk && <p className="mt-2 text-xs text-fg">{d.risk}</p>}
                {d.memory && (
                  <p className="mt-2 rounded-md bg-row-selected px-2.5 py-2 text-xs leading-[17px]">
                    <b className="font-semibold">{d.memory.who}</b>: {d.memory.text}
                  </p>
                )}
                <div className="relative mt-1.5 flex items-baseline justify-between pt-2 text-xs text-fg-secondary before:absolute before:top-1.5 before:-left-[22px] before:border-x-[7px] before:border-t-[9px] before:border-x-transparent before:border-t-accent">
                  <span>{d.bucket}</span>
                  <b className="text-[22px] leading-7 font-semibold tracking-[-0.02em] text-fg tabular-nums">{d.amount}</b>
                </div>
              </div>
              <Link href={d.href} className="mt-4 flex min-h-11 items-center justify-center rounded-item bg-accent px-3 text-white shadow-primary outline-none focus-visible:outline-2 focus-visible:outline-accent">
                {d.nr} öffnen: Rechenweg, Belege, Original
              </Link>
            </div>
          </>
        )}
        {block && (
          <>
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_auto_44px] items-center gap-x-2 py-1.5 pr-1.5 pl-4 shadow-line-bottom">
              <SheetTitle className="not-sr-only text-[15px] leading-5 font-semibold">{block.label}</SheetTitle>
              <span className="text-[15px] font-semibold tabular-nums">{block.amount}</span>
              <Close />
              {block.quiet && (
                <p className="col-span-3 mb-2 text-xs text-fg-secondary">
                  {block.quiet.label} {block.quiet.amount}
                </p>
              )}
            </div>
            <div className="overflow-auto px-3 pt-1 pb-5">
              {block.finds.map((nr) => {
                const f = model.finds.get(nr)!;
                return (
                  <button
                    key={nr}
                    type="button"
                    onClick={() => onPick(nr)}
                    className="grid min-h-11 w-full grid-cols-[6px_24px_minmax(0,1fr)_auto] items-center gap-x-2 rounded-md px-1 text-left text-[13px] hover:bg-fill-hover"
                  >
                    <span className={cn("size-1.5 rounded-full", TONE_DOT[f.tone])} />
                    <span className="font-mono text-[11px] text-fg-secondary">{nr}</span>
                    <span className="truncate">{f.find.label}</span>
                    <span className="tabular-nums">{f.find.amount.text}</span>
                  </button>
                );
              })}
            </div>
          </>
        )}
        {group && view && (
          <>
            <div className="grid shrink-0 grid-cols-[minmax(0,1fr)_44px] items-center gap-x-2 py-1.5 pr-1.5 pl-4 shadow-line-bottom">
              <SheetTitle className="not-sr-only text-[15px] leading-5 font-semibold">{group.title}</SheetTitle>
              <Close />
              <p className="col-span-2 mb-2 text-xs text-fg-secondary">{traceSentence(model, view).split(", ").slice(1).join(", ")}</p>
            </div>
            <div className="overflow-auto px-4 pt-2.5 pb-5">
              <div className="relative pl-[22px] before:absolute before:top-2 before:bottom-4 before:left-1.5 before:w-0.5 before:rounded-full before:bg-accent">
                <Trail model={model} ids={ids} chips finds={view.finds} />
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
