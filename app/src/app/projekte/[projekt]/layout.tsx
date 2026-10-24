import { Construction } from "lucide-react";

import { Page } from "@/components/shell/page";
import { RecordHead } from "@/components/shell/record-head";
import { StepBar } from "@/components/shell/step-bar";
import { PROJECTS } from "@/lib/example";
import { projectRows } from "@/lib/kern-data";
import { findProject } from "./project-tabs";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ projekt: p.slug }));
}

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ projekt: string }> }) {
  const project = findProject((await params).projekt);
  const row = projectRows().find((r) => r.id === project.id);
  const facts = [project.client, ...(row?.date ? [`${row.date.label} ${row.date.text}`] : []), ...(row ? [row.stage] : [])];
  return (
    <Page destination="projekte" trail={[{ label: project.name }]}>
      <RecordHead icon={Construction} title={project.name} facts={facts} />
      <StepBar project={project} />
      <div className="flex-1">{children}</div>
    </Page>
  );
}
