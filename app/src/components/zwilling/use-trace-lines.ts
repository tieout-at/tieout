"use client";

import { useLayoutEffect, useRef } from "react";

import { CFG } from "./config";
import { traceRoutes, type CardPorts, type Geo } from "./layout";
import { targetKey, type Model, type Tone, type Trace } from "./model";

const NS = "http://www.w3.org/2000/svg";

/** Tailwind classes per kind of line; the strings stay in this file so the classes are generated. */
const LINE: Record<string, string> = {
  proof: "fill-none stroke-[2] [stroke-linecap:round]",
  through: "fill-none stroke-[2] [stroke-linecap:round]",
  out: "fill-none stroke-[2] [stroke-linecap:round]",
  shows: "fill-none stroke-accent stroke-[1.5] [stroke-dasharray:4_3]",
  memory: "fill-none stroke-accent stroke-[1.5] [stroke-dasharray:2_3] [stroke-linecap:round]",
  node: "fill-none stroke-accent stroke-1 opacity-70",
  lead: "fill-none stroke-accent stroke-[0.75] opacity-60",
};
const FILL: Record<Tone, string> = {
  belegt: "fill-state-green stroke-state-green-edge",
  fehlt: "fill-state-yellow stroke-state-yellow-edge",
  nachtrag: "fill-state-orange stroke-state-orange-edge",
  pauschale: "fill-surface stroke-fg-faint",
};

function el<K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>): SVGElementTagNameMap[K] {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  return e;
}

/**
 * Draws one trace into an SVG layer, imperatively and without reading the DOM: the cards are already placed by
 * `planCards`, every line is routed by the pure functions, drawn in, and one travelling light runs over all of them.
 * Cleans every animation and frame, so the double run of StrictMode and quick switches leave nothing behind.
 */
export function useTraceLines(opts: {
  layerRef: React.RefObject<SVGGElement | null>;
  sweepRef: React.RefObject<SVGLinearGradientElement | null>;
  sweepId: string;
  model: Model;
  geo: Geo | null;
  trace: Trace | null;
  cards: CardPorts | null;
  reduced: boolean;
}) {
  const { layerRef, sweepRef, sweepId, model, geo, trace, cards, reduced } = opts;
  const lastKey = useRef("");
  const key = targetKey(trace?.target ?? null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;
    layer.replaceChildren();
    if (!geo || !trace || !cards) {
      lastKey.current = "";
      return;
    }
    // a new trace draws in; the same trace on a new geometry (resize) appears at once
    const animate = !reduced && lastKey.current !== key;
    lastKey.current = key;

    const drawing = traceRoutes(model, geo, trace, cards);
    const anims: Animation[] = [];
    const frag = document.createDocumentFragment();
    const play = (e: SVGElement, frames: Keyframe[], delay: number, duration: number) => {
      if (animate) anims.push(e.animate(frames, { delay, duration, fill: "backwards", easing: "cubic-bezier(.35,.1,.25,1)" }));
    };
    for (const t of drawing.ticks) frag.append(el("line", { x1: t.x0, x2: t.x1, y1: t.y, y2: t.y, class: "stroke-accent stroke-2" }));
    for (const r of drawing.routes) {
      const dashed = r.kind === "shows" || r.kind === "memory";
      const solid = r.kind === "proof" || r.kind === "through" || r.kind === "out";
      const p = el("path", { d: r.d, class: LINE[r.kind] });
      if (solid) {
        p.setAttribute("stroke", reduced ? "currentColor" : `url(#${sweepId})`);
        p.classList.add("text-accent");
      }
      if (!dashed) {
        // pathLength 1: the line draws in without measuring its length
        p.setAttribute("pathLength", "1");
        p.setAttribute("stroke-dasharray", "1 1");
        play(p, [{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], r.delay, Math.max(r.dur, 120));
      } else play(p, [{ opacity: 0 }, { opacity: 1 }], r.delay, 260);
      frag.append(p);
    }
    for (const c of drawing.cells) {
      const ring = el("rect", { x: c.box.x - 2.5, y: c.box.y - 2.5, width: c.box.w + 5, height: c.box.h + 5, rx: 4, class: "fill-none stroke-accent stroke-[1.5]" });
      const cell = el("rect", { x: c.box.x + 0.5, y: c.box.y + 0.5, width: c.box.w - 1, height: c.box.h - 1, rx: 2, class: FILL[c.tone] });
      play(ring, [{ opacity: 0 }, { opacity: 1 }], CFG.motion.inMs, 160);
      frag.append(cell, ring);
    }
    for (const d of drawing.dots) frag.append(el("circle", { cx: d.x, cy: d.y, r: 3, class: "fill-surface stroke-accent stroke-[1.5]" }));
    const endAt = CFG.motion.inMs + CFG.motion.midMs + CFG.motion.outMs;
    for (const d of drawing.ends) {
      const dot = el("circle", { cx: d.x, cy: d.y, r: 3.5, class: "fill-accent" });
      dot.style.transformOrigin = `${d.x}px ${d.y}px`;
      play(dot, [{ opacity: 0, transform: "scale(.2)" }, { opacity: 1, transform: "none" }], endAt, 220);
      frag.append(dot);
    }
    layer.append(frag);

    // one travelling light for every traced line: a single gradient, one attribute pair per frame
    let raf = 0;
    const grad = sweepRef.current;
    if (!reduced && grad && drawing.routes.length) {
      const x1 = geo.cards.x;
      const span = Math.max(1, geo.railR + 200 - x1);
      const band = span * 0.35;
      const t0 = performance.now();
      const frame = (now: number) => {
        const k = ((now - t0) % CFG.motion.sweepMs) / CFG.motion.sweepMs;
        const x = x1 - band + k * (span + 2 * band);
        grad.setAttribute("x1", String(Math.round(x - band)));
        grad.setAttribute("x2", String(Math.round(x + band)));
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    }
    return () => {
      cancelAnimationFrame(raf);
      for (const a of anims) a.cancel();
      layer.replaceChildren();
    };
    // `trace` changes with its key; `cards` with the key and the geometry
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo, key, cards, reduced, model, sweepId]);
}
