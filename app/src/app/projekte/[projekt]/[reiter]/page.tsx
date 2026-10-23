import type { Metadata } from "next";

import { EmptyState } from "@/components/shell/empty-state";
import { PROJECT_TABS, PROJECTS } from "@/lib/example";
import { findProject, TAB_EMPTY } from "../project-tabs";

type Props = { params: Promise<{ projekt: string; reiter: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.flatMap((p) => PROJECT_TABS.filter((t) => t.slug).map((t) => ({ projekt: p.slug, reiter: t.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projekt, reiter } = await params;
  return { title: `${TAB_EMPTY[reiter].title} · ${findProject(projekt).name}` };
}

export default async function ProjectTabPage({ params }: Props) {
  const { projekt, reiter } = await params;
  const project = findProject(projekt);
  const tab = TAB_EMPTY[reiter];
  return <EmptyState icon={tab.icon} title={tab.title} text={tab.text(project)} />;
}
