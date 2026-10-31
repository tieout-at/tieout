import type { Metadata } from "next";

import { OnePackage } from "@/components/fund/evidence-actions";
import { Page } from "@/components/shell/page";
import { findRecord, findSlugs } from "@/lib/finds";
import { firm } from "@/lib/kern-data";
import { reportsView } from "@/lib/reports";

type Props = { params: Promise<{ fund: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return findSlugs().map((fund) => ({ fund }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = findRecord((await params).fund);
  return { title: `Beweispaket ${r.number} · ${r.project.name}` };
}

// The Beweispaket of one find, a page made for printing; everything on it comes from `kern/` while the page is built.
export default async function BeweispaketPage({ params }: Props) {
  const record = findRecord((await params).fund);
  return (
    <Page
      destination="funde"
      trail={[
        { label: record.project.name, href: record.project.href },
        { label: record.number, href: `/funde/${record.slug}/` },
        { label: "Beweispaket" },
      ]}
    >
      <OnePackage record={record} asOf={reportsView().asOf} sample={firm().beispieldaten} />
    </Page>
  );
}
