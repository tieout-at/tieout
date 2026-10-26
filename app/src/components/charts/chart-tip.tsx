"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type TipLine = { label: string; value?: string; dot?: string };

/**
 * The one hover card of the charts (Attio's chart tooltip): a title, a few lines with a coloured dot, an amount right.
 * Positioned at an anchor inside its chart box and kept inside the box; shown on pointer and on keyboard focus alike.
 */
export function ChartTip({ at, title, lines, box }: { at: { x: number; y: number } | null; title: string; lines: TipLine[]; box: { w: number; h: number } }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 200, h: 60 });
  useLayoutEffect(() => {
    if (ref.current) setSize({ w: ref.current.offsetWidth, h: ref.current.offsetHeight });
  }, [title, lines.length, at?.x]);
  if (!at) return null;
  const left = Math.min(Math.max(at.x - size.w / 2, 0), Math.max(0, box.w - size.w));
  const above = at.y - size.h - 10 >= 0;
  const top = above ? at.y - size.h - 10 : at.y + 14;
  return (
    <div ref={ref} role="status" className={cn("pointer-events-none absolute z-30 min-w-40 max-w-72 rounded-lg bg-surface px-3 py-2 text-xs shadow-popup")} style={{ left, top }}>
      <p className="font-medium text-fg">{title}</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {lines.map((l) => (
          <li key={l.label} className="flex items-center gap-2 text-fg-secondary">
            {l.dot && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: l.dot }} />}
            <span className="min-w-0 flex-1 truncate">{l.label}</span>
            {l.value && <span className="text-fg tabular-nums whitespace-nowrap">{l.value.replace(/ €/g, " €")}</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Measures a chart box with a ResizeObserver; the first value is a guess for the static HTML. Returns a callback ref, so
 * the box can change (a chart that draws another layout when narrow) and is measured again.
 */
export function useBox<T extends HTMLElement>(guess = 600) {
  const [w, setW] = useState(guess);
  const observer = useRef<ResizeObserver | null>(null);
  const ref = useCallback((el: T | null) => {
    observer.current?.disconnect();
    if (!el) return;
    const ro = new ResizeObserver(() => setW(el.clientWidth));
    ro.observe(el);
    observer.current = ro;
    setW(el.clientWidth);
  }, []);
  return [ref, w] as const;
}
