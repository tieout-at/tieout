import type { Metadata } from "next";

import { AttributeList } from "@/components/record/attribute-list";
import { EmptyState } from "@/components/shell/empty-state";
import { PROJECT_TABS, PROJECTS } from "@/lib/example";
import { belegRows, findCalculations, findRows } from "@/lib/kern-data";
import { projectRecord } from "@/lib/records";
import { BelegeTable } from "../../../belege/belege-table";
import { FindsTable } from "../../../funde/finds-table";
import { findProject, TAB_EMPTY } from "../project-tabs";

type Props = { params: Promise<{ projekt: string; reiter: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.flatMap((p) => PROJECT_TABS.filter((t) => t.slug).map((t) => ({ projekt: p.slug, reiter: t.slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { projekt, reiter } = await params;
  return { title: `${PROJECT_TABS.find((t) => t.slug === reiter)!.title} · ${findProject(projekt).name}` };
}

// Belege, Vertrag and Funde come from `kern/` while the page is built; the other tabs follow in later steps.
export default async function ProjectTabPage({ params }: Props) {
  const { projekt, reiter } = await params;
  const project = findProject(projekt);

  if (reiter === "belege") return <BelegeTable rows={belegRows().filter((r) => r.project.slug === project.slug)} project={project.slug} />;

  if (reiter === "funde") {
    const rows = findRows().filter((r) => r.project.slug === project.slug);
    if (rows.length) return <FindsTable rows={rows} calculations={findCalculations(rows)} project={project.slug} />;
  }

  if (reiter === "vertrag") {
    return (
      <div className="mx-auto w-full max-w-[720px] py-2">
        <AttributeList title="Vertrag" attributes={projectRecord(project.id).contract} />
      </div>
    );
  }

  const tab = TAB_EMPTY[reiter];
  return <EmptyState icon={tab.icon} title={tab.title} text={tab.text(project)} />;
}
