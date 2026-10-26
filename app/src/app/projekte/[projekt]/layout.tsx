import { Construction } from "lucide-react";

import { Page } from "@/components/shell/page";
import { RecordHead, type Fact } from "@/components/shell/record-head";
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
  // the deadline once, here in the head of every tab; its colour only when it is near (step 8a)
  const date = row?.date ? `${row.date.label} ${row.date.text}` : null;
  const facts: Fact[] = [
    project.client,
    ...(date ? [row?.status.colour === "rot" || row?.status.colour === "gelb" ? { text: date, dot: row.status.colour, label: row.status.text } : date] : []),
    ...(row ? [row.stage] : []),
  ];
  return (
    <Page destination="projekte" trail={[{ label: project.name }]}>
      <RecordHead icon={Construction} title={project.name} facts={facts} />
      <StepBar project={project} />
      <div className="flex-1">{children}</div>
    </Page>
  );
}
