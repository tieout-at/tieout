// Firma für den Zuruf-Agenten aus dem Firmenzwilling der App: eine Quelle, nicht doppelt gepflegt.
// Der Generator schreibt das Ergebnis nach data/generated/zuruf-firma.json; Worker und lokaler Server lesen es dort.
// Rufnamen und Bereiche sind nur Orientierung für die KI (wie Leute auf der Baustelle reden), keine Pflichtliste.

import type { Firmendaten, ProjektStatus } from "@/domain/typen";
import type { Firma as ZurufFirma } from "../../../zuruf/src/firma";

const LAUFEND: ProjektStatus[] = ["in_ausfuehrung", "sr_vorbereiten"];
const GEWERK: Record<string, string> = { HKLS: "HKLS (Heizung, Klima, Lüftung, Sanitär)" };

export function zurufFirma(f: Firmendaten): ZurufFirma {
  // „Wohnhausanlage Wien 21“: Gebäudeart vorne, Ort dahinter. Die Gebäudeart ist nur ein Rufname, wenn sie eindeutig ist.
  const art = (name: string) => name.split(" ")[0]!;
  const anzahlArt = new Map<string, number>();
  for (const p of f.projekte) anzahlArt.set(art(p.projekt.name), (anzahlArt.get(art(p.projekt.name)) ?? 0) + 1);

  return {
    name: f.firma.name,
    gewerk: GEWERK[f.firma.gewerk] ?? f.firma.gewerk,
    projekte: f.projekte.map((d) => {
      const p = d.projekt;
      const ort = p.name.split(" ").slice(1).join(" ") || p.name;
      const bezirk = /Wien (\d+)/.exec(p.name)?.[1];
      const orte = d.zurufe.map((z) => z.ort.wert);
      return {
        id: p.id,
        name: `${p.name}, ${p.los}`,
        kurz: p.name,
        rufnamen: [p.kurz, ...(bezirk ? [`Wien ${bezirk}`, `${bezirk}er`] : []), ...(anzahlArt.get(art(p.name)) === 1 ? [art(p.name)] : [])],
        ort,
        auftraggeber: f.auftraggeber.find((a) => a.id === p.auftraggeberId)?.name ?? "",
        status: LAUFEND.includes(p.status) ? "laufend" : "abgeschlossen",
        bereiche: [...new Set(orte)].sort(),
      };
    }),
  };
}
