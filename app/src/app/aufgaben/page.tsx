import { SquareCheck } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Aufgaben" };

export default function AufgabenPage() {
  return (
    <Page destination="aufgaben">
      <EmptyState
        icon={SquareCheck}
        title="Aufgaben"
        text="Aus jeder Lücke wird eine Aufgabe, zum Beispiel „Regiebericht schreiben und vom Polier unterschreiben lassen“."
      />
    </Page>
  );
}
