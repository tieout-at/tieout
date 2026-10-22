// Beleg eines neuen Zurufs aus dem echten Chat (Schalter ZURUF_ECHT an). Die Seite ist statisch, der Zuruf liegt im
// Browser: Kennung als ?id=…, gelesen im Browser. Ziel der neuen Einträge in Zeitachse und Befunden.

import type { Metadata } from "next";
import { Suspense } from "react";
import { firma, projekt, projektIds } from "@/daten/demo";
import { NeuerZurufBeleg } from "@/ui/NeueZurufe";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Neuer Zuruf` };
}

export default async function NeuerZurufSeite({ params }: Props) {
  const id = (await params).projekt;
  const { d } = projekt(id);
  const { daten } = firma();
  const kurz = Object.fromEntries(daten.projekte.map((p) => [p.projekt.id, p.projekt.name]));
  return (
    <>
      <Seitenkopf
        pfad={[
          { text: daten.firma.name, href: "/" },
          { text: d.projekt.kurz, href: `/projekte/${id}` },
          { text: "Zeitachse", href: `/projekte/${id}/zeitachse` },
        ]}
        titel="Neuer Zuruf"
      />
      <Suspense>
        <NeuerZurufBeleg projektId={id} kurz={kurz} />
      </Suspense>
    </>
  );
}
