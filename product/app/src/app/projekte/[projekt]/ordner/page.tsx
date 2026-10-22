// Ordner eines Projekts: Belegmatrix (LV-Position × Belegart) und alle Dokumente mit Duplikaten.

import type { Metadata } from "next";
import { befundSlug, firma, projekt, projektIds } from "@/daten/demo";
import { belegmatrix, dokumentliste } from "@/daten/ordner";
import { Ordner } from "@/ui/Ordner";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Ordner` };
}

export default async function OrdnerSeite({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const basis = `/projekte/${id}`;
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: basis }]} titel="Ordner" />
      <main className="scr-body">
        <Ordner matrix={belegmatrix(d, e, (s) => `${basis}/befunde/${befundSlug(s)}/`)} dokumente={dokumentliste(d)} basis={basis} />
      </main>
    </>
  );
}
