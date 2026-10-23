import { Briefcase } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Auftraggeber" };

export default function AuftraggeberPage() {
  return (
    <Page destination="auftraggeber">
      <EmptyState icon={Briefcase} title="Auftraggeber" text="Jeder Auftraggeber mit Verträgen, Kürzungen und Zahlungsdauer, zum Beispiel Hornfeld Bau." />
    </Page>
  );
}
