import { Page } from "@/components/shell/page";
import { findCalculations, findRows } from "@/lib/kern-data";
import { FindsTable } from "./finds-table";

export const metadata = { title: "Funde" };

// Rows and sums are computed from `kern/` while the page is built; the browser only sorts and filters them.
export default function FundePage() {
  const rows = findRows();
  return (
    <Page destination="funde">
      <FindsTable rows={rows} calculations={findCalculations()} />
    </Page>
  );
}
