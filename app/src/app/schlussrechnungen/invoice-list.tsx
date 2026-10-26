"use client";

import Link from "next/link";

import type { InvoiceListRow } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";

const cols = "md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_170px_140px]";

/** The list "Schlussrechnungen" in the layout of Attio's tables: a row per project, the row opens its tab "Schlussrechnung". */
export function InvoiceList({ built }: { built: InvoiceListRow[] }) {
  const rows = useLive()?.invoiceList() ?? built;
  return (
    <div role="table" aria-label="Schlussrechnungen" className="flex flex-col">
      <div role="row" className={cn("grid h-9 items-center text-xs text-fg-secondary shadow-line-bottom max-md:hidden", cols)}>
        {["Projekt", "Stand", "Datum", "Restforderung oder Schlusszahlung", "gekürzt"].map((h, i) => (
          <span key={h} role="columnheader" className={cn("px-3 first:px-4", i >= 3 && "text-right")}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r) => (
        <div key={r.id} role="row" className={cn("relative grid min-h-12 items-center shadow-line-bottom hover:bg-row-hover max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-4 max-md:py-2.5", cols)}>
          <span role="cell" className="flex min-w-0 flex-col px-4 max-md:px-0">
            <Link href={r.href} className="truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-accent">
              {r.name}
            </Link>
            <span className="text-xs text-fg-muted">{r.client}</span>
          </span>
          <span role="cell" className="px-3 max-md:order-3 max-md:px-0 max-md:text-xs max-md:text-fg-secondary">
            {r.state}
          </span>
          <span role="cell" className="px-3 text-fg-secondary tabular-nums max-md:order-4 max-md:col-span-2 max-md:px-0 max-md:text-xs">
            {r.date ?? ""}
          </span>
          <span role="cell" className="px-3 text-right tabular-nums max-md:col-start-2 max-md:row-start-1 max-md:px-0">
            {r.figure && (
              <>
                {r.figure.amount.text}
                <span className="block text-xs text-fg-muted md:hidden">{r.figure.label}</span>
              </>
            )}
          </span>
          <span role="cell" className={cn("px-3 text-right tabular-nums max-md:hidden", !r.cut && "text-fg-muted")}>
            {r.cut?.text ?? ""}
          </span>
        </div>
      ))}
    </div>
  );
}
