import { ChartColumn } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Berichte" };

export default function BerichtePage() {
  return (
    <Page destination="berichte">
      <EmptyState icon={ChartColumn} title="Berichte" text="Zusätzlich verrechenbar je Projekt und Kürzungen je Auftraggeber, sobald Funde da sind." />
    </Page>
  );
}
