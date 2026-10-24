import { Calculator } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata = { title: "Preisbasis · Betrieb" };

export default function PreisbasisPage() {
  return <EmptyState icon={Calculator} title="Preisbasis" text="Mittellohnkosten, Mittellohnpreis und K7 je Position aus Ihrer Kalkulation." />;
}
