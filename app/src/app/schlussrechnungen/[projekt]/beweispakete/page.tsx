import type { Metadata } from "next";

import { EvidencePackage } from "@/components/fund/evidence-package";
import { PrintBar } from "@/components/fund/print-bar";
import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";
import { findRecord } from "@/lib/finds";
import { invoiceProjects, invoiceView } from "@/lib/invoice";
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
 * Every Beweispaket of the Änderungsliste in one print, a find per printed page: what goes with the Schlussrechnung.
 * The finds are those of the built page; a find set to "Nicht verrechnen" in this browser still prints, marked so.
 */
export default async function BeweispaketePage({ params }: Props) {
  const p = project((await params).projekt);
  const view = invoiceView(p.id)!;
  const asOf = reportsView().asOf;
  return (
    <Page destination="schlussrechnungen" trail={[{ label: p.name, href: projectHref(p, "schlussrechnung") }, { label: "Beweispakete" }]}>
      <PrintBar back={{ href: projectHref(p, "schlussrechnung"), label: "Zurück zur Schlussrechnung" }} count={view.changes.entries.length} />
      {view.changes.entries.map((c, i) => (
        <EvidencePackage key={c.find.key} record={findRecord(c.find.href.split("/")[2])} asOf={asOf} first={i === 0} />
      ))}
    </Page>
  );
}
