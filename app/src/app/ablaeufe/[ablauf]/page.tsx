import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FlowPage } from "@/components/ablauf/flow-page";
import { Page } from "@/components/shell/page";
import { flowView, flowViews } from "@/lib/flows";

type Props = { params: Promise<{ ablauf: string }> };

export function generateStaticParams() {
  return flowViews().map((v) => ({ ablauf: v.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: flowView((await params).ablauf)?.title ?? "Abläufe" };
}

/**
 * One Ablauf on Attio's Workflows canvas (step 9): the blocks top to bottom, the panel on the right, the toolbar below,
 * the tab "Läufe" with every run. Counts from `kern/` while the page is built; they follow this browser's decisions.
 */
export default async function AblaufPage({ params }: Props) {
  const view = flowView((await params).ablauf);
  if (!view) notFound();
  return (
    <Page destination="ablaeufe" trail={[{ label: view.title }]}>
      <FlowPage built={view} />
    </Page>
  );
}
