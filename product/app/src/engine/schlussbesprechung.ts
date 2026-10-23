// Schlussbesprechungs-Blatt: je Posten der Listen 1 und 2 die Forderung und die Untergrenze, gruppiert nach Stand des
// Belegs wie auf dem Dashboard (belegt, Beleg fehlt, angemeldet). Regel (Demo_Faelle.md, Go Maxi S. 23.10.2026):
// Regie und Regie aus WhatsApp-Meldung = Stunden × Mittellohnpreis (K3) + Material; Mehrmengen und Preisumrechnung
// = Vertragspreis; angemeldete Änderungen sind schon eine Untergrenze aus eigener Kalkulation.
// „Braucht Anwalt“ und Liste 3 stehen nicht auf dem Blatt.

import type { Cent, Datensatz } from "@/domain/typen";
import { geldStand } from "./firma";
import { euro, menge, stundenBetrag } from "./geld";
import type { Befund, GeldStand } from "./typen";

export interface BesprechungsPosten {
  schluessel: string;
  titel: string;
  untertitel: string;
  forderung: Cent;
  untergrenze: Cent;
  /** Wie die Untergrenze entsteht, z. B. „18 h × 56,80 € + Material 186,40 €“ oder „Vertragspreis“. */
  rechenweg: string;
}

export interface BesprechungsGruppe {
  stand: GeldStand;
  posten: BesprechungsPosten[];
  forderung: Cent;
  untergrenze: Cent;
}

export interface Schlussbesprechung {
  gruppen: BesprechungsGruppe[];
  forderung: Cent;
  untergrenze: Cent;
  /** Forderung minus Untergrenze. */
  spielraum: Cent;
}

const REIHENFOLGE: GeldStand[] = ["belegt", "beleg_fehlt", "angemeldet"];

function untergrenze(d: Datensatz, b: Befund): { betrag: Cent; rechenweg: string } {
  const mlp = d.vertrag.mittellohnpreis.wert;
  const kosten = (stunden: number, material: Cent) => {
    const betrag = stundenBetrag(stunden, mlp) + material;
    return { betrag, rechenweg: `${menge(stunden)} h × ${euro(mlp)}${material > 0 ? ` + Material ${euro(material)}` : ""}` };
  };
  if (b.art === "regie") {
    const rb = d.regie.find((r) => `regie:${r.nr.wert}` === b.schluessel);
    if (!rb) throw new Error(`Regiebericht zu ${b.schluessel} fehlt`);
    return kosten(rb.stundenMonteur.wert + rb.stundenHelfer.wert, rb.material.wert);
  }
  if (b.art === "regie_zuruf") {
    const z = d.zurufe.find((x) => `zuruf:${x.nr}` === b.schluessel);
    if (!z) throw new Error(`WhatsApp-Meldung zu ${b.schluessel} fehlt`);
    return kosten(z.stundenMonteur.wert + z.stundenHelfer.wert, 0);
  }
  if (b.art === "aenderung") return { betrag: b.betrag ?? 0, rechenweg: "Untergrenze aus eigener Kalkulation" };
  return { betrag: b.betrag ?? 0, rechenweg: "Vertragspreis" };
}

export function schlussbesprechung(d: Datensatz, befunde: Befund[]): Schlussbesprechung {
  const gruppen: BesprechungsGruppe[] = REIHENFOLGE.map((stand) => {
    const posten = befunde
      .filter((b) => geldStand(b) === stand)
      .map((b): BesprechungsPosten => {
        const u = untergrenze(d, b);
        return { schluessel: b.schluessel, titel: b.titel, untertitel: b.untertitel, forderung: b.betrag!, untergrenze: u.betrag, rechenweg: u.rechenweg };
      })
      .sort((a, b) => b.forderung - a.forderung);
    return {
      stand,
      posten,
      forderung: posten.reduce((s, p) => s + p.forderung, 0),
      untergrenze: posten.reduce((s, p) => s + p.untergrenze, 0),
    };
  }).filter((g) => g.posten.length > 0);
  const forderung = gruppen.reduce((s, g) => s + g.forderung, 0);
  const grenze = gruppen.reduce((s, g) => s + g.untergrenze, 0);
  return { gruppen, forderung, untergrenze: grenze, spielraum: forderung - grenze };
}
