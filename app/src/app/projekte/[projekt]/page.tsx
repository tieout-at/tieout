import type { Metadata } from "next";

import { EmptyState } from "@/components/shell/empty-state";
import { findProject, TAB_EMPTY } from "./project-tabs";

type Props = { params: Promise<{ projekt: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Zeitstrahl · ${findProject((await params).projekt).name}` };
}

export default async function ZeitstrahlPage({ params }: Props) {
  const project = findProject((await params).projekt);
  const tab = TAB_EMPTY[""];
  return <EmptyState icon={tab.icon} title={tab.title} text={tab.text(project)} />;
}
