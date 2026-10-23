// Ledger eines Projekts: alle LV-Positionen mit LV-Menge, Aufmaß, verrechnet, bezahlt und Differenz aus dem Rechenkern.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { postenSlug, firma, leistungsgruppen, projekt, projektIds } from "@/daten/demo";
import { PositionenTabelle, type Originale, type PositionsReihe } from "@/ui/PositionenTabelle";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} LV-Positionen` };
}

export default async function Ledger({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  if (!e.abgleich) notFound();
  // Wo jede Zahl im Original steht (nur Nachschlagen im Datensatz, keine Rechnung): Aufmaßblätter nach Datum,
  // verrechnet im Entwurf oder sonst in der letzten Abschlagsrechnung mit der Position.
  const blaetter = [...d.aufmass].sort((a, b) => a.datum.wert.localeCompare(b.datum.wert));
  const rechnungen = d.entwurf ? [d.entwurf] : [...d.abschlaege].sort((a, b) => b.datum.wert.localeCompare(a.datum.wert));
  const enthaelt = (zeilen: object[], nr: string) => zeilen.some((x) => "positionNr" in x && (x.positionNr as { wert: string }).wert === nr);
  const originale: Originale = {
    basis: `/projekte/${id}`,
    lv: d.dokumente.find((x) => x.art === "lv")?.id ?? null,
    namen: Object.fromEntries([
      ...d.aufmass.map((a) => [a.dokumentId, a.nr]),
      ...d.abschlaege.map((r) => [r.dokumentId, r.nr.wert]),
      ...(d.entwurf ? [[d.entwurf.dokumentId, "Schlussrechnungs-Entwurf"]] : []),
    ]),
  };
  // Nur die Felder, die die Tabelle braucht: die Zeilen gehen als Daten mit jeder Seite an den Browser.
  const zeilen: PositionsReihe[] = e.ledger.map((z) => {
    const b = e.befunde.find((x) => x.schluessel.endsWith(`:${z.positionNr}`));
    return {
      positionNr: z.positionNr,
      kurztext: z.kurztext,
      einheit: z.einheit,
      lvMenge: z.lvMenge,
      aufmassMenge: z.aufmassMenge,
      verrechnetMenge: z.verrechnetMenge,
      bezahltBetrag: z.bezahltBetrag,
      differenzBetrag: z.differenzBetrag,
      naechsteArMenge: z.naechsteArMenge,
      befundHref: b ? `/projekte/${id}/posten/${postenSlug(b.schluessel)}/` : null,
      aufmassBlaetter: blaetter.filter((a) => enthaelt(a.zeilen, z.positionNr)).map((a) => a.dokumentId),
      verrechnetIn: rechnungen.find((r) => enthaelt(r.zeilen, z.positionNr))?.dokumentId ?? null,
    };
  });
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}/` }]} titel="LV-Positionen" />
      <main className="scr-body">
        <PositionenTabelle zeilen={zeilen} gruppen={leistungsgruppen()} originale={originale} />
      </main>
    </>
  );
}
