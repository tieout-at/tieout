"use client";

import { memo, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import { CFG } from "./config";
import { tickRowLayout, type StripLayout } from "./layout";
import { formatInt, plural, type GroupModel, type Model, type TickRow } from "./model";

/** Look of one tick mark: a linked Beleg is long and dark, every other one short and faint; a copy has a ring. */
function Mark({ row, top, h, n }: { row: TickRow; top: number; h: number; n: number }) {
  const thick = row.linked ? 2 : 1;
  const scale = row.linked ? 1 : row.weight;
  if (!row.docs.length) return null;
  return (
    <span
      className={cn(
        "absolute right-0 origin-right in-data-[enter=run]:animate-[zw-grow-x_450ms_var(--ease-soft)_backwards]",
        row.linked ? "bg-fg" : "bg-fg-faint",
      )}
      style={{ top: top + Math.max(0, Math.floor((h - thick) / 2)), height: thick, width: CFG.mark * scale, animationDelay: `${Math.min(n, 200) * 3}ms` }}
    >
      {row.copy && <span className="absolute top-[-1px] -left-[5px] size-[3px] rounded-full bg-surface ring-1 ring-fg-faint" />}
    </span>
  );
}

function GroupHead({ g, stacked }: { g: GroupModel; stacked: boolean }) {
  return (
    <div
      data-head={g.wa ? undefined : ""}
      title={g.note || undefined}
      data-wa-head={g.wa ? "" : undefined}
      className={cn(
        "flex items-center gap-x-2 text-xs text-fg-secondary transition-opacity duration-200 motion-reduce:transition-none",
        stacked ? "flex-wrap" : "h-6 whitespace-nowrap",
        !g.wa && "in-data-[trace=dim]:opacity-0",
        // the WhatsApp heading sits under its ticks, so the lines that rise from them never cross it
        g.wa && !stacked && "order-last",
      )}
    >
      <span className="text-fg">{g.title}</span>
      <span className="tabular-nums">{formatInt(g.count)}</span>
      {/* the note stays off the stage on wide screens (text budget); the heading carries it as a title */}
      {g.note && stacked && <span className="w-full">{g.note}</span>}
    </div>
  );
}

/**
 * "Ihre Daten": per group a ruler of ticks, one per Beleg (or per week). The marks are one quiet layer that dims as a
 * whole; the buttons above them carry focus (one tab stop per group, arrow keys move) and the words read out.
 * Pointers are resolved by the stage from the height, so a mark of 3 px is still easy to hit.
 */
export const EvidenceColumn = memo(function EvidenceColumn({
  model,
  strips,
  stacked,
  stripWidth,
  pinnedTick,
  pinnedGroup,
}: {
  model: Model;
  strips: StripLayout[] | null;
  stacked: boolean;
  stripWidth: number;
  pinnedTick: string | null;
  pinnedGroup: string | null;
}) {
  const [active, setActive] = useState<Record<string, string>>({});
  const buttons = useRef(new Map<string, HTMLButtonElement>());

  if (stacked) {
    return (
      <div data-docs className="flex flex-col gap-1">
        {model.groups.map((g) => {
          const xs = tickRowLayout(g.rows.length, stripWidth, g.wa);
          return (
            <button
              key={g.key}
              type="button"
              data-target={`gruppe:${g.key}`}
              data-trigger={`gruppe:${g.key}`}
              aria-pressed={pinnedGroup === g.key}
              aria-label={`${g.title}, ${plural(g.count, "Beleg", "Belege")}${g.note ? `, ${g.note}` : ""}`}
              className={cn(
                "-mx-2.5 flex min-h-11 items-center gap-3 rounded-[10px] px-2.5 py-1.5 text-left aria-pressed:bg-row-selected",
                g.wa && "mt-2 border border-dashed border-fg-faint",
              )}
            >
              <span className="min-w-0 flex-1">
                <GroupHead g={g} stacked />
              </span>
              <span aria-hidden className="relative h-6 shrink-0" style={{ width: g.wa ? Math.ceil(xs.at(-1)!.left + xs.at(-1)!.w) : stripWidth }}>
                {g.rows.map((row, i) =>
                  row.docs.length ? (
                    <span
                      key={row.key}
                      className={cn("absolute bottom-0", row.linked ? "bg-fg" : "bg-fg-faint")}
                      style={{ left: xs[i].left + Math.floor((xs[i].w - 1) / 2), width: row.linked ? 1.5 : 1, height: 22 * (row.linked ? 1 : row.weight) }}
                    />
                  ) : null,
                )}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  let n = 0;
  return (
    <div data-docs className="flex flex-col gap-3">
      {model.groups.map((g, gi) => {
        const layout = strips?.[gi];
        const live = g.rows.filter((r) => r.docs.length);
        const current = active[g.key] ?? live[0]?.key;
        const onKeyDown = (e: React.KeyboardEvent) => {
          const i = live.findIndex((r) => r.key === current);
          let j = i;
          if (e.key === "ArrowDown" || e.key === "ArrowRight") j = Math.min(live.length - 1, i + 1);
          else if (e.key === "ArrowUp" || e.key === "ArrowLeft") j = Math.max(0, i - 1);
          else if (e.key === "Home") j = 0;
          else if (e.key === "End") j = live.length - 1;
          else return;
          e.preventDefault();
          const next = live[j];
          setActive((a) => ({ ...a, [g.key]: next.key }));
          buttons.current.get(next.key)?.focus();
        };
        return (
          <div
            key={g.key}
            className={cn("relative flex flex-col", g.wa && "-ml-2.5 self-start rounded-[10px] border border-dashed border-fg-faint pt-2.5 pr-3.5 pb-0.5 pl-2.5")}
          >
            <GroupHead g={g} stacked={false} />
            <div data-zone="strip" data-strip={g.key} className="relative cursor-pointer" style={{ width: CFG.ruler, height: layout?.height ?? g.rows.length * 4 }}>
              <div aria-hidden data-dim="" className="pointer-events-none absolute inset-0">
                {layout && g.rows.map((row, i) => <Mark key={row.key} row={row} top={layout.rows[i].top} h={layout.rows[i].h} n={n++} />)}
              </div>
              <div role="group" aria-label={`${g.title}, ${plural(g.count, "Beleg", "Belege")}, mit Pfeiltasten wählen`} onKeyDown={onKeyDown}>
                {layout &&
                  g.rows.map((row, i) =>
                    row.docs.length ? (
                      <button
                        key={row.key}
                        ref={(el) => {
                          if (el) buttons.current.set(row.key, el);
                          else buttons.current.delete(row.key);
                        }}
                        type="button"
                        tabIndex={row.key === current ? 0 : -1}
                        data-target={`tick:${row.key}`}
                        data-trigger={`tick:${row.key}`}
                        aria-pressed={pinnedTick === row.key}
                        aria-label={row.label}
                        onFocus={() => row.key !== current && setActive((a) => ({ ...a, [g.key]: row.key }))}
                        className="pointer-events-none absolute left-0 w-full outline-none before:pointer-events-none before:absolute before:-inset-y-1 before:-right-[3px] before:w-11 before:rounded-sm focus-visible:before:ring-2 focus-visible:before:ring-accent"
                        style={{ top: layout.rows[i].top, height: layout.rows[i].h }}
                      />
                    ) : null,
                  )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
});
