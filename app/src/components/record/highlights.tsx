import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { InfoTip } from "@/components/ui/info-tip";
import type { Highlight } from "@/lib/records";
import { cn } from "@/lib/utils";

/** An amount never breaks before its euro sign. */
const keep = (text: string) => text.replace(/ €/g, "\u00a0€");

const DOT = { rot: "bg-state-red", gelb: "bg-state-yellow", gruen: "bg-state-green", grau: "bg-state-grey", orange: "bg-state-orange" } as const;

/**
 * Highlights of a record page, calmer in step 8a: at most three figures in one box (as the figures of the tab
 * "Schlussrechnung"), the first one big with its statement and, where it has a part, one thin bar. A figure with a
 * target is a link. The order is the page's answer: the money first.
 */
export function Highlights({ items, title = "Auf einen Blick" }: { items: Highlight[]; title?: string }) {
  const shown = items.slice(0, 3);
  return (
    <section aria-label={title}>
      <ul className={cn("grid overflow-hidden rounded-lg bg-surface shadow-ring", shown.length === 3 ? "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]" : "lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]")}>
        {shown.map((h, i) => {
          const lead = i === 0;
          const body = (
            <>
              <span className="flex items-center justify-between gap-2 text-xs text-fg-secondary">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate">{h.title}</span>
                  {h.info && <InfoTip label={h.title}>{h.info}</InfoTip>}
                </span>
                {h.href && !h.href.startsWith("#") && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-faint" />}
              </span>
              <span className={cn("flex items-center gap-1.5 font-semibold tabular-nums", lead ? "mt-1 text-[28px] leading-9 tracking-tight max-md:text-2xl" : "mt-1.5 text-xl")}>
                {h.status && <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[h.status])} />}
                {h.value}
              </span>
              {lead && h.part !== undefined && (
                <span aria-hidden className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-fg/35">
                  <span className="h-full bg-state-red" style={{ width: `${Math.max(h.part, h.part > 0 ? 0.02 : 0) * 100}%` }} />
                </span>
              )}
              {h.lines.map((line) => (
                <span key={line} className="mt-1 text-xs text-fg-secondary tabular-nums">
                  {keep(line)}
                </span>
              ))}
              {lead && h.says && <span className="mt-3 font-semibold">{keep(h.says)}</span>}
            </>
          );
          const cell = cn("flex h-full flex-col px-4 py-3", lead && "lg:row-span-1 lg:px-5 lg:py-4");
          return (
            <li key={h.id} className="min-w-0 [&:not(:last-child)]:shadow-line-bottom lg:[&:not(:last-child)]:shadow-[inset_-1px_0_0_0_var(--color-line)]">
              {h.href ? (
                <Link href={h.href} className={cn(cell, "outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent")}>
                  {body}
                </Link>
              ) : (
                <div className={cell}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
