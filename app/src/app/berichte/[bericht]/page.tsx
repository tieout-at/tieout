import type { Metadata } from "next";

import { Page } from "@/components/shell/page";
import { DASHBOARDS, reportsView } from "@/lib/reports";
import { DashboardReports } from "../report-cards";

type Props = { params: Promise<{ bericht: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return DASHBOARDS.map((d) => ({ bericht: d.slug }));
}

function find(slug: string) {
  const d = DASHBOARDS.find((x) => x.slug === slug);
  if (!d) throw new Error(`Unknown dashboard ${slug}`);
  return d;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `${find((await params).bericht).title} · Berichte` };
}

/**
 * A dashboard as Attio's (`qa-shots/attio/dashboard.jpg`, measured 25.10.2026): a 48 px bar with the name in 16/600
 * and its line in secondary text, then one card per report (white, radius 12, 1 px line, head of 40 px). The figures are
 * the core's, built with the page and computed again in the browser after a decision there.
 */
export default async function DashboardPage({ params }: Props) {
  const d = find((await params).bericht);
  const view = reportsView();
  return (
    <Page destination="berichte" trail={[{ label: d.title }]}>
      <div className="flex min-h-12 shrink-0 items-center gap-x-3 gap-y-0.5 px-4 py-2 shadow-line-bottom max-md:flex-col max-md:items-start">
        <h1 className="text-base font-semibold">{d.title}</h1>
        <p className="text-fg-secondary">{d.description}</p>
        <p className="ml-auto text-xs text-fg-muted tabular-nums max-md:ml-0">Stand {view.asOf}, Beispieldaten</p>
      </div>
      <DashboardReports slug={d.slug} built={view} />
    </Page>
  );
}
