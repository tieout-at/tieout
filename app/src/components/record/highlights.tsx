import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { Highlight } from "@/lib/records";
import { cn } from "@/lib/utils";

const DOT = { rot: "bg-state-red", gelb: "bg-state-yellow", gruen: "bg-state-green", grau: "bg-state-grey" } as const;

/** Highlights of a record page (Attio: cards in a 3-column grid, title above, value below). A card with a target is a link. */
export function Highlights({ items, title = "Auf einen Blick" }: { items: Highlight[]; title?: string }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 text-sm text-fg-secondary">{title}</h2>
      <ul className="grid grid-cols-2 gap-2 xl:grid-cols-3">
        {items.map((h) => {
          const body = (
            <>
              <span className="flex items-center justify-between gap-2 text-xs text-fg-secondary">
                <span className="truncate">{h.title}</span>
                {h.href && <ChevronRight aria-hidden className="size-3.5 shrink-0 text-fg-faint" />}
              </span>
              <span className="mt-2 flex items-center gap-1.5 text-base font-semibold tabular-nums">
                {h.status && <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[h.status])} />}
                {h.value}
              </span>
              {h.lines.map((line) => (
                <span key={line} className="mt-0.5 text-xs text-fg-secondary tabular-nums">
                  {line}
                </span>
              ))}
            </>
          );
          const card = "flex h-full min-h-[92px] flex-col rounded-lg bg-surface px-3 py-2.5 shadow-ring";
          return (
            <li key={h.id} className="min-w-0">
              {h.href ? (
                <Link href={h.href} className={cn(card, "outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent")}>
                  {body}
                </Link>
              ) : (
                <div className={card}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
