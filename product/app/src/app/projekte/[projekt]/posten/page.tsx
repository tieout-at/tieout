// Befunde eines Projekts: alle Posten nach Liste gruppiert; Klick, Enter oder j/k öffnet den Befund mit Beleg.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { postenSlug, firma, projekt, projektIds } from "@/daten/demo";
import { PostenTabelle } from "@/ui/PostenTabelle";
import { NeueMeldungZeilen } from "@/ui/NeueMeldungen";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Posten` };
}

export default async function Befunde({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  if (!e.abgleich) notFound();
  const risiken = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}/` }]} titel="Posten" />
      <main className="scr-body">
        <PostenTabelle projektId={id} befunde={e.befunde} summen={e.summen} risiken={risiken} href={(b) => `/projekte/${id}/posten/${postenSlug(b.schluessel)}/`}
          nachOffen={<NeueMeldungZeilen projektId={id} basis={`/projekte/${id}`} />}
        />
      </main>
    </>
  );
}
