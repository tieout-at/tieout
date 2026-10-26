import type { Metadata } from "next";

import { ProjectOverviewView } from "@/components/projekt/overview";
import { startView } from "@/lib/kern-data";
import { projectOverview } from "@/lib/project-view";
import { findProject } from "./project-tabs";

type Props = { params: Promise<{ projekt: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: findProject((await params).projekt).name };
}

/**
 * "Überblick" of a project (step 8d): the facts in one line with every Angabe in a window, the figures with rings, the
 * building with the place of each find, the Bauzeit and the Verlauf. All from `kern/` while the page is built; the
 * money and the decisions follow this browser's decisions (live.ts).
 */
export default async function ProjectOverviewPage({ params }: Props) {
  const project = findProject((await params).projekt);
  const view = projectOverview(project.id);
  const start = startView().projects.find((p) => p.id === project.id) ?? null;
  return <ProjectOverviewView v={view} start={start} />;
}
