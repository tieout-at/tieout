// Ledger eines Projekts: alle LV-Positionen mit LV-Menge, Aufmaß, verrechnet, bezahlt und Differenz aus dem Rechenkern.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { befundSlug, firma, leistungsgruppen, projekt, projektIds } from "@/daten/demo";
import { LedgerTabelle, type LedgerReihe } from "@/ui/LedgerTabelle";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Ledger` };
}

export default async function Ledger({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  if (!e.abgleich) notFound();
  const zeilen: LedgerReihe[] = e.ledger.map((z) => {
    const b = e.befunde.find((x) => x.schluessel.endsWith(`:${z.positionNr}`));
    return { ...z, befundHref: b ? `/projekte/${id}/befunde/${befundSlug(b.schluessel)}/` : null };
  });
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}` }]} titel="Ledger" />
      <main className="scr-body">
        <LedgerTabelle zeilen={zeilen} gruppen={leistungsgruppen()} />
      </main>
    </>
  );
}
