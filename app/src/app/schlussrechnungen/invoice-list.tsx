"use client";

import Link from "next/link";

import type { InvoiceListRow } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";

const cols = "md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)_minmax(0,0.9fr)_190px_130px]";

const STAGES = ["in Ausführung", "Entwurf", "gelegt", "bezahlt"] as const;
type Stage = (typeof STAGES)[number];

/** Where a project's Schlussrechnung stands, from the state the core names (an own Entwurf has a Restforderung). */
function stageOf(r: InvoiceListRow): Stage {
  if (r.state === "bezahlt") return "bezahlt";
  if (r.state === "gelegt") return "gelegt";
  if (r.figure?.label === "Restforderung") return "Entwurf";
  return "in Ausführung";
}

/** The stage as a short path (step 8d): a dot per stage joined by a hairline, the reached ones filled, the current named. */
function StagePath({ stage, detail }: { stage: Stage; detail: string | null }) {
  const at = STAGES.indexOf(stage);
  return (
    <span className="flex min-w-0 flex-col gap-1">
      <span role="img" aria-label={`Stand: ${stage}`} className="flex items-center">
        {STAGES.map((s, i) => (
          <span key={s} className="flex items-center">
            {i > 0 && <span aria-hidden className={cn("h-px w-5", i <= at ? "bg-fg/50" : "bg-line")} />}
            <span aria-hidden title={s} className={cn("size-2 rounded-full", i < at ? "bg-fg/50" : i === at ? (stage === "bezahlt" ? "bg-data-money" : "bg-fg") : "bg-surface ring-1 ring-fg-faint")} />
          </span>
        ))}
        <span className="ml-2.5 font-medium">{stage}</span>
      </span>
      {detail && <span className="truncate text-xs text-fg-muted">{detail}</span>}
    </span>
  );
}

/**
 * The list "Schlussrechnungen" in the layout of Attio's tables (step 8d): a row per project with its stage as a path
 * (in Ausführung, Entwurf, gelegt, bezahlt), the date, the core's figure with what it is (Restforderung or
 * Schlusszahlung) and what was cut, in neutral ink. The row opens its tab "Schlussrechnung".
 */
export function InvoiceList({ built }: { built: InvoiceListRow[] }) {
  const rows = useLive()?.invoiceList() ?? built;
  return (
    <div role="table" aria-label="Schlussrechnungen" className="flex flex-col">
      <div role="row" className={cn("grid h-9 items-center text-xs text-fg-secondary shadow-line-bottom max-md:hidden", cols)}>
        {["Projekt", "Stand", "Datum", "Betrag", "gekürzt"].map((h, i) => (
          <span key={h} role="columnheader" className={cn("px-3 first:px-4", i >= 3 && "text-right")}>
            {h}
          </span>
        ))}
      </div>
      {rows.map((r) => {
        const stage = stageOf(r);
        // the state text adds only what the path does not say ("Entwurf, 8 Funde offen")
        const detail = stage === "Entwurf" ? r.state.replace(/^Entwurf, /, "") : stage === "in Ausführung" ? "noch kein Entwurf" : null;
        return (
          <div
            key={r.id}
            role="row"
            className={cn("relative grid min-h-14 items-center shadow-line-bottom hover:bg-row-hover max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-1.5 max-md:px-4 max-md:py-3", cols)}
          >
            <span role="cell" className="flex min-w-0 flex-col px-4 max-md:px-0">
              <Link href={r.href} className="truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-accent">
                {r.name}
              </Link>
              <span className="text-xs text-fg-muted">{r.client}</span>
            </span>
            <span role="cell" className="min-w-0 px-3 max-md:order-3 max-md:col-span-2 max-md:px-0">
              <StagePath stage={stage} detail={detail} />
            </span>
            <span role="cell" className="px-3 text-fg-secondary tabular-nums max-md:order-4 max-md:col-span-2 max-md:px-0 max-md:text-xs">
              {r.date ?? ""}
            </span>
            <span role="cell" className="flex flex-col items-end px-3 tabular-nums max-md:col-start-2 max-md:row-start-1 max-md:px-0">
              {r.figure ? (
                <>
                  <span className="whitespace-nowrap">{r.figure.amount.text}</span>
                  <span className="text-xs text-fg-muted">{r.figure.label}</span>
                </>
              ) : (
                <span className="text-xs text-fg-muted">noch kein Betrag</span>
              )}
            </span>
            <span role="cell" className="flex flex-col items-end px-3 tabular-nums max-md:hidden">
              {r.cut ? (
                <>
                  <span className="whitespace-nowrap text-fg">{r.cut.text}</span>
                  <span className="text-xs text-fg-muted">gekürzt</span>
                </>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
