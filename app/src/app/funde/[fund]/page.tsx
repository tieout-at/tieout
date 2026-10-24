import type { Metadata } from "next";

import { FindView } from "@/components/fund/find-view";
import { Page } from "@/components/shell/page";
import { findRecord, findSlugs } from "@/lib/finds";

type Props = { params: Promise<{ fund: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return findSlugs().map((fund) => ({ fund }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = findRecord((await params).fund);
  return { title: `${r.number} ${r.name} · ${r.project.name}` };
}

// The find, its Rechenweg, Belege and originals come from `kern/` while the page is built; decisions live in the browser.
export default async function FundPage({ params }: Props) {
  const record = findRecord((await params).fund);
  return (
    <Page destination="funde" trail={[{ label: record.project.name, href: record.project.href }, { label: record.number }]} heading={false}>
      <FindView record={record} />
    </Page>
  );
}
