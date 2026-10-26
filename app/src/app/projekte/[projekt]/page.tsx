import type { Metadata } from "next";

import { Activity } from "@/components/record/activity";
import { AttributeList } from "@/components/record/attribute-list";
import { DecidedLine } from "@/components/record/decided-line";
import { ProjectHighlights } from "@/components/record/live-highlights";
import { findRows } from "@/lib/kern-data";
import { projectRecord } from "@/lib/records";
import { findProject } from "./project-tabs";

type Props = { params: Promise<{ projekt: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: findProject((await params).projekt).name };
}

/**
 * "Überblick" of a project in Attio's record layout: "Angaben" in a 374 px column on the left (the Vertrag item by item
 * has its own tab), the three figures and the Verlauf on the right; below 1024 px one column, figures first.
 */
export default async function ProjectOverviewPage({ params }: Props) {
  const record = projectRecord(findProject((await params).projekt).id);
  const finds = findRows().filter((r) => r.project.slug === record.slug);
  return (
    <div className="flex min-h-full max-lg:flex-col">
      <aside className="w-[374px] shrink-0 shadow-[inset_-1px_0_0_0_var(--color-line)] max-lg:order-2 max-lg:w-full max-lg:shadow-[inset_0_1px_0_0_var(--color-line)]">
        <AttributeList title="Angaben" attributes={record.attributes} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-5 max-md:px-4 max-lg:order-1">
        <div className="flex flex-col gap-2">
          <ProjectHighlights projektId={record.id} items={record.highlights} />
          {finds.length > 0 && <DecidedLine finds={finds.map((r) => ({ keys: [r.id, ...r.earlierIds], state: r.decisionState }))} href={`/projekte/${record.slug}/funde/`} />}
        </div>
        <Activity entries={record.activity} />
      </div>
    </div>
  );
}
