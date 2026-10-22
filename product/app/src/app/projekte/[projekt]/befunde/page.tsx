// Befunde eines Projekts: alle Posten nach Liste gruppiert; Klick, Enter oder j/k öffnet den Befund mit Beleg.

import type { Metadata } from "next";
import { befundSlug, firma, projekt, projektIds } from "@/daten/demo";
import { BefundTabelle } from "@/ui/BefundTabelle";
import { Panel } from "@/ui/Panel";
import { Seitenkopf } from "@/ui/Seitenkopf";

type Props = { params: Promise<{ projekt: string }> };

export const dynamicParams = false;
export function generateStaticParams() {
  return projektIds();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { d } = projekt((await params).projekt);
  return { title: `${d.projekt.kurz} Befunde` };
}

export default async function Befunde({ params }: Props) {
  const id = (await params).projekt;
  const { d, e } = projekt(id);
  const { daten } = firma();
  const risiken = new Set((e.vorpruefung?.risiken ?? []).map((r) => r.befundSchluessel).filter((s): s is string => s !== null));
  return (
    <>
      <Seitenkopf pfad={[{ text: daten.firma.name, href: "/" }, { text: d.projekt.kurz, href: `/projekte/${id}` }]} titel="Befunde" />
      <main className="scr-body">
        <Panel titel="Befunde" rechts={<span className="sw-count">{e.befunde.length}</span>}>
          <BefundTabelle projektId={id} befunde={e.befunde} risiken={risiken} href={(b) => `/projekte/${id}/befunde/${befundSlug(b.schluessel)}`} />
        </Panel>
      </main>
    </>
  );
}
