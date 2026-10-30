import type { Metadata } from "next";

import { FolderView } from "@/components/schlussrechnung/folder-view";
import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";
import { folderProjects, gapsView } from "@/lib/invoice";
import { business, firm } from "@/lib/kern-data";
import { reportsView } from "@/lib/reports";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return folderProjects().map((id) => ({ projekt: PROJECTS.find((p) => p.id === id)!.slug }));
}

const project = (slug: string) => PROJECTS.find((p) => p.slug === slug)!;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Mappe · ${project((await params).projekt).name}` };
}

// The signature folder of one project; what is open comes from `kern/` while the page is built and follows in the browser.
export default async function MappePage({ params }: Props) {
  const p = project((await params).projekt);
  const zeile = business().projekte.find((x) => x.projektId === p.id)!;
  const invoice = zeile.stufe === "sr_vorbereiten" || zeile.stufe === "sr_gelegt";
  return (
    <Page destination="schlussrechnungen" trail={[{ label: p.name, href: projectHref(p, invoice ? "schlussrechnung" : "funde") }, { label: "Mappe" }]}>
      <FolderView built={gapsView(p.id)} projektId={p.id} project={p.name} client={zeile.auftraggeber.name} back={projectHref(p, invoice ? "schlussrechnung" : "funde")} asOf={reportsView().asOf} sample={firm().beispieldaten} />
    </Page>
  );
}
