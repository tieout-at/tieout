import { Page } from "@/components/shell/page";
import { belegRows } from "@/lib/kern-data";
import { BelegeTable } from "./belege-table";

export const metadata = { title: "Belege" };

// Rows are computed from `kern/` while the page is built; the browser only sorts and filters them.
export default function BelegePage() {
  return (
    <Page destination="belege">
      <BelegeTable rows={belegRows()} />
    </Page>
  );
}
