import { Page } from "@/components/shell/page";
import { Spur } from "@/components/uebersicht/spur";
import { overviewProjects } from "./projects";

export const metadata = { title: "Übersicht" };

// The view is computed from `kern/` while the page is built; the browser draws it and recomputes it after a decision.
export default function UebersichtPage() {
  const all = overviewProjects();
  const first = all[0];
  return (
    <Page destination="uebersicht" heading={false}>
      <Spur key={first.link.slug} view={first.view} projects={all.map((x) => x.link)} />
    </Page>
  );
}
