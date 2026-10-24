import { FileSignature } from "lucide-react";

import { EmptyState } from "@/components/shell/empty-state";

export const metadata = { title: "Verträge · Betrieb" };

export default function VertraegePage() {
  return <EmptyState icon={FileSignature} title="Verträge" text="Jeder Vertrag mit seinen Vertragspunkten: Nachlass, Rücklässe, Regiesätze." />;
}
