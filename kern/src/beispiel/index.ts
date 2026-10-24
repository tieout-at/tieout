// The synthetic sample company Kronfeld Haustechnik with the five projects of solution list v3 (docs/Demo_Faelle.md).
// Everything is fictitious; every screen that shows it carries the mark "Beispieldaten".

import type { Firmendaten } from "../modell";
import { erzeugeEibenau, erzeugeErlenhain } from "./abgeschlossen";
import { erzeugeAhornbrunn, erzeugeKiefernau } from "./laufend";
import { erzeugeMooshaim } from "./mooshaim";

/** Demo date: the demo always calculates with this "today", so that status colours stay the same. */
export const DEMO_STICHTAG = "2026-10-22";

export function beispielFirma(): Firmendaten {
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
    projekte: [erzeugeMooshaim(), erzeugeKiefernau(), erzeugeAhornbrunn(), erzeugeErlenhain(), erzeugeEibenau()],
    stichtag: DEMO_STICHTAG,
  };
}

export { erzeugeAhornbrunn, erzeugeEibenau, erzeugeErlenhain, erzeugeKiefernau, erzeugeMooshaim };
