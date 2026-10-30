import type { Metadata } from "next";

import { EvidencePdfButton } from "@/components/fund/evidence-actions";
import { EvidencePackage } from "@/components/fund/evidence-package";
import { PrintBar } from "@/components/fund/print-bar";
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
 * Every Beweispaket of the Änderungsliste as one PDF: what goes with the Schlussrechnung. The page lists the finds of the
 * built page; the PDF takes the decisions of the moment and leaves out a find set to "Nicht verrechnen".
 */
export default async function BeweispaketePage({ params }: Props) {
  const p = project((await params).projekt);
  const view = invoiceView(p.id)!;
  const asOf = reportsView().asOf;
  const records = view.changes.entries.map((c) => findRecord(c.find.href.split("/")[2]));
  return (
    <Page destination="schlussrechnungen" trail={[{ label: p.name, href: projectHref(p, "schlussrechnung") }, { label: "Beweispakete" }]}>
      <PrintBar back={{ href: projectHref(p, "schlussrechnung"), label: "Zurück zur Schlussrechnung" }} count={records.length}>
        <EvidencePdfButton records={records} asOf={asOf} projektId={p.id} sample={firm().beispieldaten} />
      </PrintBar>
      {records.map((r, i) => (
        <EvidencePackage key={r.key} record={r} asOf={asOf} first={i === 0} />
      ))}
    </Page>
  );
}
