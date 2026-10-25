"use client";

import { CircleCheck, Repeat } from "lucide-react";

import { cn } from "@/lib/utils";
import { formatInt, headline, type BlockKey, type Model } from "./model";
import { TONE_DOT } from "./twin-column";

/**
 * "Ergebnis": the two money words (never added together), each with its findings. Rows that do not fit fold into
 * "und N weitere Funde", a button that unfolds them. A traced finding lights its row and its segment of the bar.
 */
export function ResultColumn({
  model,
  visible,
  stacked,
  narrow,
  on,
  dims,
  pinned,
  onUnfold,
}: {
  model: Model;
  visible: Record<BlockKey, number> | null;
  stacked: boolean;
  narrow: boolean;
  on: Set<string>;
  dims: boolean;
  pinned: string;
  onUnfold: () => void;
}) {
  if (!model.blocks.length) {
    const head = headline(model);
    return (
      <div className="flex gap-2.5 rounded-[10px] bg-fill-subtle px-3.5 py-3 shadow-ring in-data-[enter=run]:animate-[zw-fade-up_400ms_var(--ease-soft)_950ms_backwards]">
        <CircleCheck className="mt-0.5 size-[18px] shrink-0 text-state-green" aria-hidden />
        <div>
          <b className="block font-semibold">Alles verrechnet wie erbracht</b>
          <span className="text-xs text-fg-secondary">
            {head.count} {head.done}, {head.finds}
          </span>
        </div>
      </div>
    );
  }
  const widest = Math.max(...model.blocks.map((b) => b.finds.length));
  return (
    <div className="flex flex-col gap-6">
      {model.blocks.map((b) => {
        const shown = Math.min(b.finds.length, visible?.[b.key] ?? b.finds.length);
        const hidden = b.finds.length - shown;
        const has = b.finds.some((n) => on.has(n));
        const blockOn = pinned === `block:${b.key}`;
        // a money word without findings (Bürohaus Kiefernau: in Klärung 0,00 €) is shown, but there is nothing to trace
        if (b.finds.length === 0) {
          return (
            <div key={b.key} className="in-data-[enter=run]:animate-[zw-fade-up_400ms_var(--ease-soft)_950ms_backwards]">
              <span className="block text-xs text-fg-secondary">{b.label}</span>
              {b.amount && (
                <span className={cn("mt-0.5 block font-semibold tracking-[-0.025em] whitespace-nowrap text-fg-secondary tabular-nums", narrow ? "text-2xl leading-[30px]" : "text-[28px] leading-[34px]")}>
                  {b.amount}
                </span>
              )}
            </div>
          );
        }
        return (
          <div key={b.key} className="in-data-[enter=run]:animate-[zw-fade-up_400ms_var(--ease-soft)_950ms_backwards]">
            <button
              type="button"
              data-target={`block:${b.key}`}
              data-trigger={`block:${b.key}`}
              aria-pressed={blockOn}
              className={cn(
                "-mx-2 block w-[calc(100%+16px)] rounded-[10px] px-2 pt-1 pb-2 text-left transition-colors duration-150 hover:bg-fill-subtle aria-pressed:bg-fill-subtle motion-reduce:transition-none",
                stacked && "min-h-11",
              )}
            >
              <span className="block text-xs text-fg-secondary">{b.label}</span>
              {b.amount && (
                <span
                  className={cn(
                    "mt-0.5 block font-semibold tracking-[-0.025em] whitespace-nowrap tabular-nums transition-colors duration-200",
                    narrow ? "text-2xl leading-[30px]" : "text-[28px] leading-[34px]",
                    dims && !has && "text-fg-secondary",
                  )}
                >
                  {b.amount}
                </span>
              )}
              <span aria-hidden className="mt-2.5 flex h-1 gap-0.5 overflow-hidden">
                {b.finds.map((nr) => {
                  const f = model.finds.get(nr)!;
                  return (
                    <span
                      key={nr}
                      className={cn("h-1 shrink-0 rounded-[1px] transition-opacity duration-200", on.has(nr) ? "bg-accent" : TONE_DOT[f.tone], dims && !on.has(nr) && "opacity-25")}
                      style={{ width: `calc(${f.share.toFixed(4)} * (100% - ${2 * (widest - 1)}px))`, minWidth: 1 }}
                    />
                  );
                })}
              </span>
              {b.quiet && (
                <span className="mt-2 flex flex-wrap justify-between gap-x-2 text-xs text-fg-secondary">
                  <span>{b.quiet.label}</span>
                  <b className="font-medium text-fg tabular-nums">{b.quiet.amount}</b>
                </span>
              )}
            </button>
            <div className="-mx-2 mt-1.5 flex flex-col gap-px">
              {b.finds.slice(0, shown).map((nr) => {
                const f = model.finds.get(nr)!;
                const isOn = on.has(nr);
                return (
                  <button
                    key={nr}
                    type="button"
                    data-target={`fund:${nr}`}
                    data-trigger={`fund:${nr}`}
                    aria-pressed={pinned === `fund:${nr}`}
                    aria-label={`${nr}, ${f.find.label}, ${f.find.amount.text}, ${f.find.belegstand?.text ?? b.label}${f.find.sameReason ? `, ${f.find.sameReason}` : ""}`}
                    className={cn(
                      "grid w-full grid-cols-[6px_24px_minmax(0,1fr)_auto] items-center gap-x-2 rounded-md px-2 text-left text-[13px] leading-[18px] transition-colors duration-150 hover:bg-fill-hover motion-reduce:transition-none",
                      stacked ? "min-h-11" : "h-8",
                      isOn && "bg-row-selected",
                      dims && !isOn && "text-fg-secondary",
                    )}
                  >
                    <span data-dot={nr} className={cn("size-1.5 rounded-full transition-opacity", TONE_DOT[f.tone], dims && !isOn && "opacity-30")} />
                    <span className={cn("font-mono text-[11px] text-fg-secondary", isOn && "text-accent")}>{nr}</span>
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate">{f.find.label}</span>
                      {f.find.sameReason && <Repeat className="size-3.5 shrink-0 text-fg-secondary" aria-hidden />}
                    </span>
                    <span className="whitespace-nowrap tabular-nums">{f.find.amount.text}</span>
                  </button>
                );
              })}
              {hidden > 0 && (
                <button
                  type="button"
                  data-more={b.key}
                  aria-expanded={false}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnfold();
                  }}
                  className={cn("rounded-md py-1 pr-2 pl-12 text-left text-xs text-fg-secondary hover:bg-fill-hover hover:text-fg", stacked && "min-h-11")}
                >
                  und {hidden === 1 ? "1 weiterer Fund" : `${formatInt(hidden)} weitere Funde`}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
