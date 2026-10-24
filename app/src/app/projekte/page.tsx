import Link from "next/link";
import { Construction } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";
import { PROJECTS, projectHref } from "@/lib/example";

export const metadata = { title: "Projekte" };

// The project table comes in step 3; until then the sample project is reachable from here and from the search.
export default function ProjektePage() {
  const sample = PROJECTS[0];
  return (
    <Page destination="projekte">
      <EmptyState icon={Construction} title="Projekte" text="Jedes Projekt mit Vertrag, Positionen und Funden.">
        <Link href={projectHref(sample)} className={buttonVariants({ size: "lg" })}>
          <Construction />
          {sample.name} öffnen
        </Link>
      </EmptyState>
    </Page>
  );
}
