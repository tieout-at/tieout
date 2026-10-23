import { Construction } from "lucide-react";

import { Page } from "@/components/shell/page";
import { RecordHead } from "@/components/shell/record-head";
import { StepBar } from "@/components/shell/step-bar";
import { PROJECTS } from "@/lib/example";
import { findProject } from "./project-tabs";

export const dynamicParams = false;

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ projekt: p.slug }));
}

export default async function ProjectLayout({ children, params }: { children: React.ReactNode; params: Promise<{ projekt: string }> }) {
  const project = findProject((await params).projekt);
  return (
    <Page destination="projekte" trail={[{ label: project.name }]}>
      <RecordHead icon={Construction} title={project.name} facts={[project.client, `Schlussrechnung legen bis ${project.finalInvoiceBy}`]} />
      <StepBar project={project} />
      <div className="flex-1">{children}</div>
    </Page>
  );
}
