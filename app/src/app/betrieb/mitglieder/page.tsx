import { Users } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata = { title: "Mitglieder · Betrieb" };

// Inviting members needs sign-in (step 10); until then this page has no invite button.
export default function MitgliederPage() {
  return <EmptyState icon={Users} title="Mitglieder" text="Abrechnung, Geschäftsführung und Bauleitung, jede Person mit ihrer Rolle. Einladen geht, sobald die Anmeldung aktiv ist." />;
}
