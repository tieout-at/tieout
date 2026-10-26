import { Inbox } from "@/components/inbox/inbox";
import { Page } from "@/components/shell/page";
import { whatsappView } from "@/lib/inbox";

export const metadata = { title: "WhatsApp-Meldungen" };

// The messages come from `kern/` while the page is built: what the agent recorded, what the twin read, and the finds.
export default function WhatsAppMeldungenPage() {
  return (
    <Page destination="whatsapp-meldungen">
      <Inbox view={whatsappView()} noun="WhatsApp-Meldung" plural="WhatsApp-Meldungen" empty="Keine WhatsApp-Meldung für diesen Filter." />
    </Page>
  );
}
