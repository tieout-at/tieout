// Zeitachse eines Projekts: Mails, Regie, Aufmaß, Pläne, Fotos, Rechnungen, Zahlungen und Zurufe in einer Reihe.

import type { Metadata } from "next";
import { firma, projekt, projektIds } from "@/daten/demo";
import { zeitachse } from "@/daten/zeitachse";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Zeitachse } from "@/ui/Zeitachse";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Zeitachse` };
}

export default async function ZeitachseSeite({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}` }]} titel="Zeitachse" />
      <main className="scr-body">
        <Zeitachse ereignisse={zeitachse(d, e)} basis={`/projekte/${id}`} />
      </main>
    </>
  );
}
