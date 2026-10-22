// Zeitachse eines Projekts: Mails, Regie, Aufmaß, Pläne, Fotos, Rechnungen, Zahlungen und Zurufe in einer Reihe.

import type { Metadata } from "next";
import { firma, projekt, projektIds } from "@/daten/demo";
import { zeitachse } from "@/daten/zeitachse";
import { Seitenkopf } from "@/ui/Seitenkopf";
import { Zeitachse } from "@/ui/Zeitachse";
import type { SzeneZuruf } from "@/ui/ZurufSzene";
import { menge } from "@/engine/geld";
import { datum } from "@/ui/format";

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
  const stunden = [
    z?.stundenMonteur.wert ? `${menge(z.stundenMonteur.wert)} h Monteur` : "",
    z?.stundenHelfer.wert ? `${menge(z.stundenHelfer.wert)} h Helfer` : "",
  ].filter(Boolean);
  const szene: SzeneZuruf | undefined = z && {
    id: z.id,
    nr: z.nr,
    absender: z.absender,
    datum: datum(z.zeitpunkt.slice(0, 10)),
    uhrzeit: z.zeitpunkt.slice(11, 16),
    uhrzeitJa: z.bestaetigt.zeitpunkt.slice(11, 16),
    foto: z.foto !== null,
    transkript: z.transkript.wert,
    zusammenfassung: [
      `${d.projekt.name}, ${z.ort.wert}`,
      `${z.taetigkeit.wert.replace(`${z.ort.wert} `, "")}, ${z.bezugPositionen.wert.length ? `LV-Position ${z.bezugPositionen.wert.join(", ")}` : "keine LV-Position"}`,
      stunden.join(", "),
      z.angewiesenVon ? `Angewiesen vom ${z.angewiesenVon.wert}` : "",
      `Regiebericht: ${z.bezugRegie?.wert ?? "keiner"}`,
    ]
      .filter(Boolean)
      .join(". ") + ".",
  };
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}` }]} titel="Zeitachse" />
      <main className="scr-body">
        <Zeitachse ereignisse={zeitachse(d, e)} basis={`/projekte/${id}`} szene={szene} />
      </main>
    </>
  );
}
