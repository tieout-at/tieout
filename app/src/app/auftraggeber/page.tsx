import { Page } from "@/components/shell/page";
import { clientRows } from "@/lib/kern-data";
import { ClientsTable } from "./clients-table";

export const metadata = { title: "Auftraggeber" };

// Rows are computed from `kern/` while the page is built; the browser only sorts and filters them.
export default function AuftraggeberPage() {
  return (
    <Page destination="auftraggeber">
      <ClientsTable rows={clientRows()} />
    </Page>
  );
}
