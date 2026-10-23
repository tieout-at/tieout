// Ordner eines Projekts: Belegmatrix (LV-Position × Belegart) und alle Dokumente mit Duplikaten.

import type { Metadata } from "next";
import { postenSlug, firma, projekt, projektIds } from "@/daten/demo";
import { belegmatrix, dokumentliste } from "@/daten/belege";
import { Belege } from "@/ui/Belege";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Belege` };
}

export default async function OrdnerSeite({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const basis = `/projekte/${id}`;
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: basis }]} titel="Belege" />
      <main className="scr-body">
        <Belege matrix={belegmatrix(d, e, (s) => `${basis}/posten/${postenSlug(s)}/`)} dokumente={dokumentliste(d)} basis={basis} />
      </main>
    </>
  );
}
