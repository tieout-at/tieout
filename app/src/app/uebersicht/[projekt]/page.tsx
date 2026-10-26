import type { Metadata } from "next";

import { Page } from "@/components/shell/page";
import { Spur } from "@/components/uebersicht/spur";
import { overviewProjects } from "../projects";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;

/** Every open project but the first, which is the page /uebersicht/ itself; closed projects have no overview. */
export function generateStaticParams() {
  return overviewProjects()
    .slice(1)
    .map((x) => ({ projekt: x.link.slug }));
}

function find(slug: string) {
  const all = overviewProjects();
  const hit = all.slice(1).find((x) => x.link.slug === slug);
  if (!hit) throw new Error(`No overview for ${slug}`);
  return { hit, all };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Übersicht ${find((await params).projekt).hit.view.project.name}` };
}

export default async function UebersichtProjectPage({ params }: Props) {
  const { hit, all } = find((await params).projekt);
  return (
    <Page destination="uebersicht" heading={false} trail={[{ label: hit.view.project.name }]}>
      <Spur key={hit.link.slug} view={hit.view} projects={all.map((x) => x.link)} />
    </Page>
  );
}
