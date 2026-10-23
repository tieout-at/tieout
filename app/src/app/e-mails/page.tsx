import { Mail } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "E-Mails" };

export default function EMailsPage() {
  return (
    <Page destination="e-mails">
      <EmptyState icon={Mail} title="E-Mails" text="E-Mails aus dem Projektordner, zum Lesen und Zuordnen. tieout sendet nichts." />
    </Page>
  );
}
