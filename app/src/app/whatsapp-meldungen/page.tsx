import { MessageCircle } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "WhatsApp-Meldungen" };

export default function WhatsAppMeldungenPage() {
  return (
    <Page destination="whatsapp-meldungen">
      <EmptyState icon={MessageCircle} title="WhatsApp-Meldungen" text="Meldungen von der Baustelle mit Foto, Transkript und Uhrzeit." />
    </Page>
  );
}
