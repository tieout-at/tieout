import { Page } from "@/components/shell/page";
import { invoiceList } from "@/lib/invoice";
import { InvoiceList } from "./invoice-list";

export const metadata = { title: "Schlussrechnungen" };

// Where the Schlussrechnung of every project stands, with the core's Restforderung or Schlusszahlung; live after a decision.
export default function SchlussrechnungenPage() {
  return (
    <Page destination="schlussrechnungen">
      <InvoiceList built={invoiceList()} />
    </Page>
  );
}
