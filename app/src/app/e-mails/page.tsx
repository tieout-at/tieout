import { Inbox } from "@/components/inbox/inbox";
import { Page } from "@/components/shell/page";
import { emailView } from "@/lib/inbox";

export const metadata = { title: "E-Mails" };

// The e-mails of the project folders come from `kern/` while the page is built; tieout reads and assigns, it sends nothing.
export default function EMailsPage() {
  return (
    <Page destination="e-mails">
      <Inbox view={emailView()} noun="E-Mail" plural="E-Mails" empty="Keine E-Mail für diesen Filter." />
    </Page>
  );
}
