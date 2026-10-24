import { Page } from "@/components/shell/page";
import { Zwilling } from "@/components/zwilling/zwilling";
import { overviewProjects } from "./projects";

export const metadata = { title: "Übersicht" };

// The view is computed from `kern/` while the page is built; the browser only draws it and links it.
export default function UebersichtPage() {
  const all = overviewProjects();
  const first = all[0];
  return (
    <Page destination="uebersicht" heading={false}>
      <Zwilling key={first.link.slug} view={first.view} projects={all.map((x) => x.link)} />
    </Page>
  );
}
