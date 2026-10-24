import Link from "next/link";
import { House, MapPinOff } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/shell/empty-state";
import { Page } from "@/components/shell/page";

export const metadata = { title: "Seite nicht gefunden" };

export default function NotFound() {
  return (
    <Page title="Seite nicht gefunden">
      <EmptyState icon={MapPinOff} title="Diese Adresse gibt es nicht" text="Vielleicht ein alter Link. Alles Weitere finden Sie über die Seitenleiste oder die Suche.">
        <Link href="/" className={buttonVariants({ size: "lg" })}>
          <House />
          Zum Start
        </Link>
      </EmptyState>
    </Page>
  );
}
