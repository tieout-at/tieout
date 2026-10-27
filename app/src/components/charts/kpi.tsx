"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useState } from "react";

import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";
import { Ring, type RingPart } from "./ring";
import { keep, TONE_VAR } from "./tones";

export type KpiItem = {
  id: string;
  label: string;
  value: string;
  /** Quiet lines under the value; a line with a tone gets its dot. */
  lines?: { text: string; tone?: RingPart["tone"] }[];
  info?: string;
  href?: string;
  ring?: { parts: RingPart[]; total?: number; label: string; centre?: string };
  /** The answer of the row: larger value. */
  lead?: boolean;
};

/**
 * Figures of a page in one box (step 8d): label, value in Inter with tabular figures, at most two quiet lines, and a
 * ring for its parts instead of the thin bar of step 8a. Pointing at a ring segment or a line with the same tone lights
 * both. A figure with a target is a link; the box is one row from 1024 px and stacks below.
 */
export function KpiRow({ items, className }: { items: KpiItem[]; className?: string }) {
  return (
    <ul className={cn("grid overflow-hidden rounded-xl bg-surface shadow-ring", className)} style={{ gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 240px), 1fr))` }}>
      {items.map((k) => (
        <li key={k.id} className="min-w-0 shadow-[inset_-1px_-1px_0_0_var(--color-line)]">
          <Kpi k={k} />
        </li>
      ))}
    </ul>
  );
}

export function Kpi({ k }: { k: KpiItem }) {
  const [hot, setHot] = useState<string | null>(null);
  const body = (
    <span className="flex items-start justify-between gap-4">
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
          <span className="truncate">{k.label}</span>
          {k.info && (
            // above the card's link, so the "i" explains instead of leaving the page
            <span className="relative z-10 flex">
              <InfoTip label={k.label}>{k.info}</InfoTip>
            </span>
          )}
          {k.href && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-faint" />}
        </span>
        <span className={cn("mt-1 font-semibold tracking-tight tabular-nums whitespace-nowrap", k.lead ? "text-[28px] leading-9 max-md:text-2xl" : "text-[22px] leading-8 max-md:text-xl")}>{keep(k.value)}</span>
        {k.lines?.map((l) => {
          const part = l.tone ? k.ring?.parts.find((p) => p.tone === l.tone) : undefined;
          return (
            <span
              key={l.text}
              onPointerEnter={() => part && setHot(part.id)}
              onPointerLeave={() => setHot(null)}
              className={cn("mt-1 flex items-center gap-1.5 text-xs text-fg-secondary tabular-nums transition-opacity", hot && part && hot !== part.id && "opacity-50")}
            >
              {l.tone && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: TONE_VAR[l.tone] }} />}
              <span className="min-w-0">{keep(l.text)}</span>
            </span>
          );
        })}
      </span>
      {k.ring && (
        <Ring parts={k.ring.parts} total={k.ring.total} label={k.ring.label} size={k.lead ? 72 : 60} thickness={k.lead ? 9 : 8} active={hot} onHover={setHot}>
          {k.ring.centre && <RingCentre text={k.ring.centre} />}
        </Ring>
      )}
    </span>
  );
  const cls = "flex h-full flex-col justify-start px-4 py-3.5 max-md:px-4";
  // a button may not sit inside a link: with an info icon the link lies over the card and the icon above it
  if (k.href && k.info)
    return (
      <div className={cn(cls, "relative hover:bg-row-hover")}>
        <Link href={k.href} aria-label={`${k.label} ${k.value}`} className="absolute inset-0 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent" />
        {body}
      </div>
    );
  return k.href ? (
    <Link href={k.href} className={cn(cls, "outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** "5 Funde" in the middle of a ring: the number on top, the word small under it, so it fits a 60 px ring. */
function RingCentre({ text }: { text: string }) {
  const [first, ...rest] = text.split(" ");
  return (
    <>
      <span className="text-sm leading-4 font-semibold tabular-nums">{first}</span>
      {rest.length > 0 && <span className="text-[10px] leading-3 text-fg-muted">{rest.join(" ")}</span>}
    </>
  );
}
