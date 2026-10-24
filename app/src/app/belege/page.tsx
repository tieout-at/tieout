import { FileText } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Belege" };

export default function BelegePage() {
  return (
    <Page destination="belege">
      <EmptyState icon={FileText} title="Belege" text="Jeder Beleg aus dem Projektordner, das Original einen Klick entfernt." />
    </Page>
  );
}
