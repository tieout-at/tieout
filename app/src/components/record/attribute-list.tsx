"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Attribute } from "@/lib/records";
import { cn } from "@/lib/utils";

const DOT = { rot: "bg-state-red", gelb: "bg-state-yellow", gruen: "bg-state-green", grau: "bg-state-grey" } as const;

/** A value; with a source, hovering or focusing it names the place in the original it was read from. */
function Value({ a }: { a: Attribute }) {
  const body = (
    <span className="flex min-w-0 flex-col">
      <span className="flex min-w-0 items-baseline gap-1.5">
        {a.status && <span aria-hidden className={cn("size-2 shrink-0 -translate-y-px self-center rounded-full", DOT[a.status])} />}
        {a.href ? (
          <Link href={a.href} className="min-w-0 rounded-xs text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            {a.value}
          </Link>
        ) : (
          <span className="min-w-0 tabular-nums">{a.value}</span>
        )}
      </span>
      {a.detail && <span className="text-xs text-fg-secondary">{a.detail}</span>}
    </span>
  );
  if (!a.source) return body;
  return (
    <Tooltip>
      <TooltipTrigger render={<span tabIndex={0} className="min-w-0 rounded-xs outline-none focus-visible:outline-2 focus-visible:outline-accent" />}>{body}</TooltipTrigger>
      <TooltipContent side="bottom" align="start">
        {a.source} · {a.review}
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * A section of "Angaben" on a record page (Attio's "Record Details": a 12 px heading that folds, rows of 40 px with the
 * label left and the value right). On phones the source is written under the value, since there is no hover.
 */
export function AttributeList({ title, attributes, className }: { title: string; attributes: Attribute[]; className?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <section className={cn("px-3 py-3", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-7 items-center gap-1 rounded-sm px-1 text-xs text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
      >
        {title}
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && (
        <dl className="mt-1">
          {attributes.map((a) => (
            <div key={`${a.label}-${a.value}`} className="grid min-h-10 grid-cols-[132px_minmax(0,1fr)] items-center gap-3 px-1 py-1 max-md:min-h-11">
              <dt className="text-fg-secondary">{a.label}</dt>
              <dd className="min-w-0">
                <Value a={a} />
                {a.source && <span className="block truncate text-xs text-fg-muted md:hidden">{a.source}</span>}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}
