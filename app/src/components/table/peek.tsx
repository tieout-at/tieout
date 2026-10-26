"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

import { cn } from "@/lib/utils";

const iconButton =
  "flex size-7 shrink-0 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11";

/** Header of a peek window (Mercury's and Linear's peek): an optional chip, the title, the close button. */
export function PeekHeader({ chip, title, sub, onClose }: { chip?: string; title: string; sub?: string; onClose: () => void }) {
  return (
    <header className="flex shrink-0 items-start gap-2 px-4 pt-3 pb-3 shadow-line-bottom">
      {chip && <span className="mt-0.5 flex h-6 min-w-7 shrink-0 items-center justify-center rounded-sm bg-fill-hover px-1.5 font-mono text-xs text-count shadow-ring">{chip}</span>}
      <span className="flex min-w-0 flex-1 flex-col">
        <h2 className="line-clamp-2 font-medium">{title}</h2>
        {sub && <span className="truncate text-xs text-fg-secondary">{sub}</span>}
      </span>
      <button type="button" aria-label="Schließen" onClick={onClose} className={iconButton}>
        <X className="size-4" aria-hidden />
      </button>
    </header>
  );
}

/** The big figure of a peek: what it is and the amount, one quiet line under it. */
export function PeekFigure({ label, value, line }: { label: string; value: string; line?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 px-4 pt-4">
      <span className="text-xs text-fg-secondary">{label}</span>
      <span className="text-2xl font-semibold tracking-tight tabular-nums">{value.replace(/ €/g, " €")}</span>
      {line && <span className="text-xs text-fg-secondary">{line}</span>}
    </div>
  );
}

/** Facts of a peek as label and value rows (Attio's record attributes in a narrow column). */
export function PeekFacts({ rows }: { rows: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="flex flex-col px-4 py-3">
      {rows.map((r) => (
        <div key={r.label} className="grid min-h-9 grid-cols-[120px_minmax(0,1fr)] items-baseline gap-3 py-1.5 shadow-line-bottom last:shadow-none">
          <dt className="text-xs text-fg-secondary">{r.label}</dt>
          <dd className="min-w-0 tabular-nums">{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The one action of a peek: open the full page. */
export function PeekAction({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("mt-auto flex justify-end px-4 py-3 shadow-[inset_0_1px_0_0_var(--color-line)]", className)}>
      <Link href={href} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-surface px-2.5 font-medium shadow-button outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent">
        {children}
        <ArrowRight className="size-4 text-fg-secondary" aria-hidden />
      </Link>
    </div>
  );
}

/** A coloured dot and its word: status never by colour alone. */
export function DotText({ colour, children }: { colour: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: colour }} />
      {children}
    </span>
  );
}
