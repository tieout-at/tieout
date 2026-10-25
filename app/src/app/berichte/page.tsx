import Link from "next/link";
import { ChartColumn, LayoutDashboard } from "lucide-react";

import { Page } from "@/components/shell/page";
import { DASHBOARDS, reportsView } from "@/lib/reports";

export const metadata = { title: "Berichte" };

/**
 * "Berichte" as Attio's list of dashboards (`qa-shots/attio/reports.jpg`): one row per dashboard with its reports as
 * chips and the day the twin was compared. No "Neues Dashboard": the reports are fixed (no button before it works).
 */
export default function BerichtePage() {
  const asOf = reportsView().asOf;
  return (
    <Page destination="berichte">
      <div role="table" aria-label="Berichte" className="flex flex-col">
        <div role="row" className="grid h-9 grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_160px] items-center text-xs text-fg-secondary shadow-line-bottom max-md:hidden">
          <span role="columnheader" className="px-4">
            Dashboard
          </span>
          <span role="columnheader" className="flex items-center gap-1.5 px-3">
            <ChartColumn className="size-3.5" aria-hidden />
            Berichte
          </span>
          <span role="columnheader" className="px-3">
            Stand
          </span>
        </div>
        {DASHBOARDS.map((d) => (
          <div
            key={d.slug}
            role="row"
            className="relative grid min-h-12 grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_160px] items-center shadow-line-bottom hover:bg-row-hover max-md:grid-cols-1 max-md:gap-1.5 max-md:px-4 max-md:py-3"
          >
            <span role="cell" className="flex min-w-0 items-center gap-2 px-4 max-md:px-0">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-fill-subtle shadow-ring">
                <LayoutDashboard className="size-3.5 text-fg-secondary" aria-hidden />
              </span>
              <Link
                href={`/berichte/${d.slug}/`}
                className="truncate font-medium outline-none after:absolute after:inset-0 focus-visible:after:outline-2 focus-visible:after:outline-accent"
              >
                {d.title}
              </Link>
            </span>
            <span role="cell" className="flex min-w-0 flex-wrap gap-1.5 px-3 py-2 max-md:px-0 max-md:py-0">
              {d.reports.map((r) => (
                <span key={r} className="inline-flex h-6 items-center gap-1.5 rounded-sm bg-fill-subtle px-1.5 text-xs text-fg-secondary shadow-ring">
                  <ChartColumn className="size-3" aria-hidden />
                  {r}
                </span>
              ))}
            </span>
            <span role="cell" className="px-3 text-fg-muted tabular-nums max-md:px-0 max-md:text-xs">
              <span className="md:hidden">Stand </span>
              {asOf}
            </span>
          </div>
        ))}
      </div>
    </Page>
  );
}
