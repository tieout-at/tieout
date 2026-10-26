import { Page } from "@/components/shell/page";
import { TabLinks } from "@/components/shell/tab-links";
import { DASHBOARDS, reportsView } from "@/lib/reports";
import { DashboardReports } from "./report-cards";

export const dashboardHref = (slug: string) => (slug === DASHBOARDS[0].slug ? "/berichte/" : `/berichte/${slug}/`);

/**
 * "Berichte" as three tabs (draft B of the design round of step 8): the first dashboard is the page itself, the others
 * have their own address. Under the tabs the reports; the date of the comparison at the right.
 */
export function Dashboard({ slug }: { slug: string }) {
  const view = reportsView();
  return (
    <Page destination="berichte">
      <div className="flex min-h-12 shrink-0 items-center gap-3 px-4 shadow-line-bottom max-md:flex-col max-md:items-start max-md:gap-1 max-md:py-2">
        <TabLinks label="Berichte" tabs={DASHBOARDS.map((d) => ({ title: d.title, href: dashboardHref(d.slug) }))} className="flex-nowrap overflow-x-auto max-md:w-full" />
        <p className="ml-auto text-xs text-fg-muted tabular-nums max-md:ml-0">Stand {view.asOf}, Beispieldaten</p>
      </div>
      <DashboardReports slug={slug} built={view} />
    </Page>
  );
}
