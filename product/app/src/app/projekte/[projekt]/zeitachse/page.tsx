// Zeitachse eines Projekts: Mails, Regie, Aufmaß, Pläne, Fotos, Rechnungen, Zahlungen und Zurufe in einer Reihe.

import type { Metadata } from "next";
import { firma, projekt, projektIds } from "@/daten/demo";
import { zeitachse } from "@/daten/zeitachse";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Zeitachse, type ZurufEcht } from "@/ui/Zeitachse";
import type { SzeneZuruf } from "@/ui/ZurufSzene";
import { datum } from "@/ui/format";
import { zurufVerstanden } from "@/ui/zuruf-text";
import { ZURUF_ECHT } from "@/zuruf/schalter";

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
  // Für die Szene der jüngste Zuruf des Projekts (W21: Z6).
  const z = [...d.zurufe].sort((a, b) => b.zeitpunkt.localeCompare(a.zeitpunkt))[0];
  const szene: SzeneZuruf | undefined = z && {
    id: z.id,
    nr: z.nr,
    absender: z.absender,
    datum: datum(z.zeitpunkt.slice(0, 10)),
    uhrzeit: z.zeitpunkt.slice(11, 16),
    uhrzeitJa: z.bestaetigt.zeitpunkt.slice(11, 16),
    foto: z.foto !== null,
    transkript: z.transkript.wert,
    zusammenfassung: zurufVerstanden(z, d.projekt.name),
  };
  // Echter Chat nur mit Schalter an; sonst bekommt die Seite nichts davon mit.
  const echt: ZurufEcht | undefined = ZURUF_ECHT
    ? {
        projektId: id,
        demoAnzahl: Object.fromEntries(daten.projekte.map((p) => [p.projekt.id, p.zurufe.length])),
        kurz: Object.fromEntries(daten.projekte.map((p) => [p.projekt.id, p.projekt.kurz])),
      }
    : undefined;
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}` }]} titel="Zeitachse" />
      <main className="scr-body">
        <Zeitachse ereignisse={zeitachse(d, e)} basis={`/projekte/${id}`} szene={szene} echt={echt} />
      </main>
    </>
  );
}
