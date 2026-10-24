import { Page } from "@/components/shell/page";
import { projectCalculations, projectRows } from "@/lib/kern-data";
import { ProjectsTable } from "./projects-table";

export const metadata = { title: "Projekte" };

// Rows and sums are computed from `kern/` while the page is built; the browser only sorts and filters them.
export default function ProjektePage() {
  return (
    <Page destination="projekte">
      <ProjectsTable rows={projectRows()} calculations={projectCalculations()} />
    </Page>
  );
}
