"use client";

import { memo, useId, useMemo } from "react";

import { cn } from "@/lib/utils";
import { baseRoutes, bundleLabels, restPorts, type Geo } from "./layout";
import type { Model } from "./model";

const STOP: Record<string, string> = {
  belegt: "var(--color-state-green)",
  fehlt: "var(--color-state-yellow)",
  nachtrag: "var(--color-state-orange)",
  pauschale: "var(--color-fg-faint)",
  node: "var(--color-fg-secondary)",
};

/** A safe id for url(#…): useId may contain characters a URL fragment does not take. */
export function useSvgId(prefix: string): string {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

/**
 * The resting picture: every Beleg that proves a finding bundled into the twin, through the lanes into each finding
 * cell, and out to the money. Drawn by React once per geometry; a trace dims the whole layer through one opacity.
 */
export const BaseLines = memo(function BaseLines({ model, geo }: { model: Model; geo: Geo }) {
  const id = useSvgId("zw-g");
  const routes = useMemo(() => baseRoutes(model, geo), [model, geo]);
  const labels = useMemo(() => bundleLabels(model, geo), [model, geo]);
  const ports = useMemo(() => restPorts(model, geo), [model, geo]);
  const x0 = Math.min(...Object.values(geo.strips).map((s) => s.x + s.w), geo.railL);
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
      width={geo.width}
      height={geo.height}
      style={{ width: geo.width, height: geo.height }}
    >
      <defs>
        {Object.entries(STOP).map(([k, colour]) => (
          <linearGradient key={k} id={`${id}-${k}`} gradientUnits="userSpaceOnUse" x1={x0} y1={0} x2={geo.railL} y2={0}>
            <stop offset={0} style={{ stopColor: "var(--color-fg)", stopOpacity: 0.18 }} />
            <stop offset={0.55} style={{ stopColor: colour, stopOpacity: 0.5 }} />
            <stop offset={1} style={{ stopColor: colour, stopOpacity: 0.85 }} />
          </linearGradient>
        ))}
      </defs>
      <g data-dim="" className="transition-opacity duration-300 motion-reduce:transition-none in-data-[trace=dim]:opacity-[.12]">
        {routes.map((r, i) => (
          <path
            key={i}
            d={r.d}
            pathLength={1}
            fill="none"
            stroke={r.kind === "proof" ? `url(#${id}-${r.tone})` : STOP[r.tone] ?? STOP.node}
            strokeOpacity={r.kind === "proof" ? 1 : 0.6}
            strokeWidth={r.count ? Math.min(6, 1 + Math.log2(r.count)) : 1}
            strokeLinecap={r.count ? "round" : undefined}
            className={cn(
              "in-data-[enter=run]:[stroke-dasharray:1_1]",
              r.kind === "proof" && "in-data-[enter=run]:animate-[zw-draw_650ms_var(--ease-soft)_250ms_backwards]",
              r.kind === "through" && "in-data-[enter=run]:animate-[zw-draw_400ms_var(--ease-soft)_700ms_backwards]",
              r.kind === "out" && "in-data-[enter=run]:animate-[zw-draw_400ms_var(--ease-soft)_950ms_backwards]",
            )}
          />
        ))}
        {labels.map((l) => (
          <text key={`${l.x},${l.y}`} x={l.x} y={l.y} className="fill-fg-secondary font-mono text-[10px]">
            {l.text}
          </text>
        ))}
        {ports.map((p) => (
          <circle key={`${p.x},${p.y}`} cx={p.x} cy={p.y} r={2.5} className="fill-surface stroke-fg-faint" strokeWidth={1} />
        ))}
      </g>
    </svg>
  );
});

/** The layer a trace is drawn into (by `useTraceLines`), with the gradient of its travelling light. */
export function TraceLayer({
  geo,
  layerRef,
  sweepRef,
  sweepId,
}: {
  geo: Geo;
  layerRef: React.RefObject<SVGGElement | null>;
  sweepRef: React.RefObject<SVGLinearGradientElement | null>;
  sweepId: string;
}) {
  return (
    <svg aria-hidden className="pointer-events-none absolute top-0 left-0 z-[2] overflow-visible" width={geo.width} height={geo.height} style={{ width: geo.width, height: geo.height }}>
      <defs>
        <linearGradient ref={sweepRef} id={sweepId} gradientUnits="userSpaceOnUse" x1={0} y1={0} x2={geo.width} y2={0}>
          <stop offset={0} style={{ stopColor: "var(--color-accent)" }} />
          <stop offset={0.4} style={{ stopColor: "var(--color-accent)" }} />
          <stop offset={0.5} style={{ stopColor: "var(--color-sweep)" }} />
          <stop offset={0.6} style={{ stopColor: "var(--color-accent)" }} />
          <stop offset={1} style={{ stopColor: "var(--color-accent)" }} />
        </linearGradient>
      </defs>
      <g ref={layerRef} />
    </svg>
  );
}
