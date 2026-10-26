"use client";

import { useId } from "react";

import { useReducedMotion } from "@/components/ui/use-media";
import { cn } from "@/lib/utils";
import { TONE_VAR, type ChartTone } from "./tones";

export type RingPart = { id: string; label: string; value: number; tone: ChartTone; text?: string; hatched?: boolean };

/**
 * A ring (donut) for parts of one whole (step 8d, in place of the thin bar under a figure): segments in order from the
 * top, clockwise, 2 px of surface between them, the rest of `total` as a light track. A hatched segment is a part that
 * belongs to its neighbour (the Kürzungsrisiko inside "zusätzlich verrechenbar"), so it reads without colour too.
 * `active` lights one segment and fades the rest; the centre takes any content (a count, a word).
 */
export function Ring({
  parts,
  total,
  size = 64,
  thickness = 8,
  active = null,
  onHover,
  label,
  children,
  className,
}: {
  parts: RingPart[];
  total?: number;
  size?: number;
  thickness?: number;
  active?: string | null;
  onHover?: (id: string | null) => void;
  label: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const id = useId().replace(/:/g, "");
  const still = useReducedMotion();
  const shown = parts.filter((p) => p.value > 0);
  const whole = Math.max(total ?? shown.reduce((s, p) => s + p.value, 0), 1);
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const gap = shown.length > 1 || (total !== undefined && shown.reduce((s, p) => s + p.value, 0) < whole) ? Math.min(3, c / 60) : 0;
  // each segment starts where the previous one ended (prefix sums, no mutable counter during render)
  const arcs = shown.reduce<(RingPart & { start: number; end: number; len: number })[]>((list, p) => {
    const start = list.at(-1)?.end ?? 0;
    const len = (p.value / whole) * c;
    return [...list, { ...p, start, end: start + len, len: Math.max(0.5, len - gap) }];
  }, []);
  return (
    <span role="img" aria-label={label} className={cn("relative inline-flex shrink-0 items-center justify-center", className)} style={{ width: size, height: size }} onPointerLeave={() => onHover?.(null)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          {arcs
            .filter((a) => a.hatched)
            .map((a) => (
              <pattern key={a.id} id={`h-${id}-${a.id}`} width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <rect width="4" height="4" fill={TONE_VAR[a.tone]} opacity="0.35" />
                <rect width="2" height="4" fill={TONE_VAR[a.tone]} />
              </pattern>
            ))}
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={TONE_VAR.track} strokeWidth={thickness} />
        {arcs.map((a) => (
          <circle
            key={a.id}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={a.hatched ? `url(#h-${id}-${a.id})` : TONE_VAR[a.tone]}
            strokeWidth={active === a.id ? thickness + 2 : thickness}
            strokeDasharray={`${a.len} ${c - a.len}`}
            strokeDashoffset={-a.start}
            className={cn(!still && "transition-[stroke-dasharray,stroke-dashoffset,opacity,stroke-width] duration-500 ease-soft", active && active !== a.id && "opacity-30")}
            onPointerEnter={() => onHover?.(a.id)}
          />
        ))}
      </svg>
      {children && <span className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</span>}
    </span>
  );
}
