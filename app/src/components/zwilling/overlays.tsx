"use client";

import { cn } from "@/lib/utils";
import { CFG } from "./config";
import { belegIcon } from "./icons";
import { cellBox, type CardPlan, type Geo } from "./layout";
import { formatInt, planChain, showsLabel, type Model, type Trace } from "./model";
import type { TipCell } from "./twin-column";

/** The chain of a plan's indices under its card: ○—● C → D. */
function PlanChain({ chain, narrow }: { chain: NonNullable<ReturnType<typeof planChain>>; narrow: boolean }) {
  return (
    <span className={cn("mt-0.5 flex h-3 items-center", narrow ? "col-start-1" : "col-start-2 col-end-4")}>
      {chain.indices.map((x, j) => (
        <span key={x} className="flex items-center">
          {j > 0 && <b className="h-px w-2.5 bg-fg-faint" />}
          <i className={cn("size-1.5 rounded-full", x === chain.current ? "bg-accent" : "bg-surface ring-1 ring-fg-faint ring-inset")} />
        </span>
      ))}
      <span className="ml-1.5 font-mono text-[10px] leading-3 text-fg-secondary">{chain.indices.join(" → ")}</span>
    </span>
  );
}

/**
 * The cards of a trace, in the docs column above every line, placed by `planCards` before they are drawn (fixed
 * heights, titles clamped at two lines). What does not fit goes into "und N weitere".
 */
export function Cards({ model, geo, trace, plan, narrow, traceKey }: { model: Model; geo: Geo; trace: Trace | null; plan: CardPlan | null; narrow: boolean; traceKey: string }) {
  return (
    <div aria-hidden className="pointer-events-none absolute z-[3]" style={{ left: geo.cards.x, top: geo.cards.y, width: geo.cards.w, height: geo.cards.h }}>
      {trace &&
        plan?.cards.map((card, i) => {
          const b = model.belege.get(card.id);
          if (!b) return null;
          const Icon = belegIcon(b.art);
          const chain = planChain(model, b.title);
          const shows = b.shows.some((n) => trace.finds.includes(n));
          return (
            <div
              key={`${traceKey}|${card.id}`}
              className={cn(
                "absolute inset-x-0 grid content-start items-start gap-x-[7px] overflow-hidden rounded-[7px] bg-surface px-2 py-1 text-xs leading-4 shadow-popup motion-safe:animate-[zw-card-in_240ms_var(--ease-soft)_both] motion-safe:[animation-delay:var(--d)]",
                narrow ? "grid-cols-[minmax(0,1fr)]" : "grid-cols-[14px_minmax(0,1fr)_auto]",
              )}
              style={
                {
                  top: card.top,
                  height: card.h,
                  "--dx": `-${CFG.cards.inset * 2}px`,
                  "--dy": `${card.dy.toFixed(1)}px`,
                  "--d": `${i * CFG.motion.cardStagger}ms`,
                } as React.CSSProperties
              }
            >
              {!narrow && <Icon className="mt-px size-3.5 text-fg-secondary" aria-hidden />}
              <span className="line-clamp-2 min-w-0 text-fg hyphens-auto">{b.detail ? `${b.title}, ${b.detail}` : b.title}</span>
              <span className={cn("font-mono text-[11px] whitespace-nowrap text-fg-secondary", narrow && "col-start-1")}>{b.date.text}</span>
              {chain && <PlanChain chain={chain} narrow={narrow} />}
              {shows && <span className={cn("truncate text-accent", narrow ? "col-start-1" : "col-start-2 col-end-4")}>{showsLabel(b)}</span>}
            </div>
          );
        })}
      {trace && plan && plan.moreTop !== null && (
        <div
          key={`${traceKey}|more`}
          className="absolute left-0 truncate rounded-[7px] bg-surface px-2 text-xs leading-6 text-fg-secondary shadow-ring motion-safe:animate-[zw-card-in_240ms_var(--ease-soft)_both]"
          style={{ top: plan.moreTop, height: CFG.cards.moreH, width: CFG.cards.moreW }}
        >
          und {formatInt(plan.moreCount)} weitere
        </div>
      )}
    </div>
  );
}

const STATE_TEXT = {
  verrechnet: "verrechnet wie erbracht",
  menge_abweichend: "verrechnet wie erbracht, Menge abweichend",
  pauschale: "Pauschale ohne Aufmaß",
  fund: "Fund",
} as const;

/** What a cell holds: position, beauftragt, erbracht, verrechnet; for a finding its kind and number. */
export function CellTip({ model, geo, tip }: { model: Model; geo: Geo; tip: TipCell }) {
  const g = tip.area === "grid" ? geo.grid : geo.ohne;
  const c = (tip.area === "grid" ? model.grid : model.ohne)[tip.index];
  if (!g || !c) return null;
  const box = cellBox(g, tip.index);
  const f = c.find ? model.finds.get(c.find) : undefined;
  const width = 232;
  const left = Math.max(geo.grid.x - 40, Math.min(box.x + box.w / 2 - width / 2, geo.railR + 40 - width));
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-[4] rounded-lg bg-surface px-2.5 py-2 text-xs leading-[18px] shadow-popup"
      style={{ left, top: box.y + box.h + 8, width }}
    >
      <div className="font-mono text-[11px] leading-4 text-fg">
        {c.index === null ? "ohne Position" : c.id}
        {f && <span className="text-accent"> · {f.find.number}</span>}
      </div>
      <div className="line-clamp-2 text-fg-secondary">{c.index === null ? c.label : c.label.replace(`${c.id} `, "")}</div>
      <dl className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3.5">
        {(["beauftragt", "erbracht", "verrechnet"] as const).map((k) => (
          <div key={k} className="contents">
            <dt className="text-fg-secondary">{k}</dt>
            <dd className={cn("truncate text-right tabular-nums", f && k === "erbracht" && "font-semibold text-accent")}>{c.cells[k]}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-1 text-fg-secondary">{f ? `${f.find.number}, ${f.find.kind}` : STATE_TEXT[c.state]}</div>
    </div>
  );
}
