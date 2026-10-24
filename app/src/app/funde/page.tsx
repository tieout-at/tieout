import { SearchCheck } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Funde" };

export default function FundePage() {
  return (
    <Page destination="funde">
      <EmptyState icon={SearchCheck} title="Funde" text="Was in der Schlussrechnung fehlt, jeder Fund mit Rechenweg und Belegen." />
    </Page>
  );
}
