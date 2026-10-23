// Beleg einer neuen WhatsApp-Meldung aus dem echten Chat (Schalter ZURUF_ECHT an). Die Seite ist statisch, die Meldung
// liegt im Browser: Kennung als ?id=…, gelesen im Browser. Ziel der neuen Einträge in Zeitachse und Posten.

import type { Metadata } from "next";
import { Suspense } from "react";
import { firma, projekt, projektIds } from "@/daten/demo";
import { NeueMeldungBeleg } from "@/ui/NeueMeldungen";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Neue WhatsApp-Meldung` };
}

export default async function NeueMeldungSeite({ params }: Props) {
  const id = (await params).projekt;
  const { d } = projekt(id);
  const { daten } = firma();
  const kurz = Object.fromEntries(daten.projekte.map((p) => [p.projekt.id, p.projekt.name]));
  return (
    <>
      <Seitenkopf
        pfad={[
          { text: daten.firma.name, href: "/" },
          { text: d.projekt.kurz, href: `/projekte/${id}/` },
          { text: "Zeitachse", href: `/projekte/${id}/zeitachse` },
        ]}
        titel="Neue WhatsApp-Meldung"
        zurueck={`/projekte/${id}/zeitachse/`}
      />
      <Suspense>
        <NeueMeldungBeleg projektId={id} kurz={kurz} />
      </Suspense>
    </>
  );
}
