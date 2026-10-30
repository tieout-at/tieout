// The synthetic sample company Kronfeld Haustechnik with the five projects of solution list v3 (docs/Demo_Faelle.md).
// Everything is fictitious; every screen that shows it carries the mark "Beispieldaten".

import { letzteSeiten } from "../belege";
import type { Firmendaten } from "../modell";
import { erzeugeEibenau, erzeugeErlenhain } from "./abgeschlossen";
import { erzeugeAhornbrunn, erzeugeKiefernau } from "./laufend";
import { erzeugeMooshaim } from "./mooshaim";

/** Demo date: the demo always calculates with this "today", so that status colours stay the same. */
export const DEMO_STICHTAG = "2026-10-22";

export function beispielFirma(): Firmendaten {
  const projekte = [erzeugeMooshaim(), erzeugeKiefernau(), erzeugeAhornbrunn(), erzeugeErlenhain(), erzeugeEibenau()];
  // a Beleg has at least the pages its fields point to: the countersignature of an Aufmaßblatt is always on page 2
  for (const d of projekte) {
    const seiten = letzteSeiten(d);
    for (const b of d.belege) b.seiten = Math.max(b.seiten, seiten.get(b.id) ?? 0);
  }
  return {
    beispieldaten: true,
    betrieb: {
      id: "kronfeld",
      name: "Kronfeld Haustechnik GmbH",
      kurzname: "Kronfeld Haustechnik",
      gewerk: "Heizung, Klima, Lüftung, Sanitär",
      sitz: "Wien",
      mitarbeiter: 64,
      rollen: ["Abrechnung", "Geschäftsführung", "Bauleitung"],
    },
    auftraggeber: [
      { id: "hornfeld", name: "Hornfeld Bau GmbH", kurzname: "Hornfeld Bau", art: "generalunternehmer" },
      { id: "pfeilberg", name: "Pfeilberg Bau GmbH", kurzname: "Pfeilberg Bau", art: "generalunternehmer" },
      { id: "ahornbrunn", name: "Marktgemeinde Ahornbrunn", kurzname: "Marktgemeinde Ahornbrunn", art: "oeffentlich" },
    ],
    projekte,
    stichtag: DEMO_STICHTAG,
  };
}

export { erzeugeAhornbrunn, erzeugeEibenau, erzeugeErlenhain, erzeugeKiefernau, erzeugeMooshaim };
