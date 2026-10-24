import { Workflow } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Abläufe" };

export default function AblaeufePage() {
  return (
    <Page destination="ablaeufe">
      <EmptyState icon={Workflow} title="Abläufe" text="Wie Ihr Betrieb seine Rechnungen prüft, vom Ordner bis zur Freigabe." />
    </Page>
  );
}
