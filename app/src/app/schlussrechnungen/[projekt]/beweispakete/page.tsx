import type { Metadata } from "next";

import { AllPackages } from "@/components/fund/evidence-actions";
import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";
import { findRecord } from "@/lib/finds";
import { invoiceProjects, invoiceView } from "@/lib/invoice";
import { firm } from "@/lib/kern-data";
import { reportsView } from "@/lib/reports";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return invoiceProjects().map((id) => ({ projekt: PROJECTS.find((p) => p.id === id)!.slug }));
}

const project = (slug: string) => PROJECTS.find((p) => p.slug === slug)!;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Beweispakete · ${project((await params).projekt).name}` };
}

/**
 * Every Beweispaket of the Änderungsliste as one PDF: what goes with the Schlussrechnung. Page and PDF follow the
 * decisions and signatures of the moment; a find set to "Nicht verrechnen" leaves both.
 */
export default async function BeweispaketePage({ params }: Props) {
  const p = project((await params).projekt);
  const view = invoiceView(p.id)!;
  const asOf = reportsView().asOf;
  const records = view.changes.entries.map((c) => findRecord(c.find.href.split("/")[2]));
  return (
    <Page destination="schlussrechnungen" trail={[{ label: p.name, href: projectHref(p, "schlussrechnung") }, { label: "Beweispakete" }]}>
      <AllPackages records={records} projektId={p.id} back={projectHref(p, "schlussrechnung")} asOf={asOf} sample={firm().beispieldaten} />
    </Page>
  );
}
