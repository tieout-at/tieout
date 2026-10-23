import { ReceiptText } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Schlussrechnungen" };

export default function SchlussrechnungenPage() {
  return (
    <Page destination="schlussrechnungen">
      <EmptyState icon={ReceiptText} title="Schlussrechnungen" text="Änderungsliste, Rechnungsabschluss und Vorprüfung je Projekt." />
    </Page>
  );
}
