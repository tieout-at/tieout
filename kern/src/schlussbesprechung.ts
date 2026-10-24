// "Schlussbesprechungs-Blatt" (SPEZIFIKATION.md 3.3): for the final meeting after the Schlussrechnung, per find the
// "Forderung" and the "Untergrenze", grouped by Belegstand. The one place where "zusätzlich verrechenbar" and
// "in Klärung" appear in one total, because it lists everything that can be raised. Rule of solution list v3 (Annahme,
// question 9 for the insider): the Untergrenze is the own cost, hours × Mittellohnkosten (Monteur and Helfer alike) +
// material at Einstandspreis, without the surcharge; Mehrmengen keep the Einheitspreis of the Vertrag. Ported from the
// v1 core (schlussbesprechung.ts), which used the Mittellohnpreis.

import { euro, menge, stundenBetrag } from "./geld";
import type { Cent, Datensatz } from "./modell";
import type { Abgleich } from "./regeln";
import type { Belegstand } from "./typen";

export interface BesprechungsPosten {
  fundSchluessel: string;
  nr: string;
  titel: string;
  forderung: Cent;
  untergrenze: Cent;
  /** How the floor is made, for example "24 h × 45,80 € + Material 312,60 €" or "Einheitspreis". */
  rechenweg: string;
}

export interface BesprechungsGruppe {
  belegstand: Belegstand;
  posten: BesprechungsPosten[];
  forderung: Cent;
  untergrenze: Cent;
  spielraum: Cent;
}

export interface Schlussbesprechung {
  gruppen: BesprechungsGruppe[];
  forderung: Cent;
  untergrenze: Cent;
  /** Forderung minus Untergrenze. */
  spielraum: Cent;
}

const REIHE: Belegstand[] = ["belegt", "beleg_fehlt", "nachtrag_nicht_gelegt"];

export function schlussbesprechung(d: Datensatz, a: Abgleich): Schlussbesprechung | null {
  if (!a.laeuft || !d.preisbasis) return null;
  const mlk = d.preisbasis.mittellohnkosten.wert;
  const gruppen = REIHE.map((stand): BesprechungsGruppe => {
    const posten = a.funde
      .filter((f) => f.belegstand === stand && f.entscheidung !== "nicht_verrechnen")
      .map((f): BesprechungsPosten => {
        if (f.kosten.art === "vertragspreis") return { fundSchluessel: f.schluessel, nr: f.nr, titel: f.titel, forderung: f.betrag, untergrenze: f.betrag, rechenweg: "Einheitspreis" };
        const lohn = stundenBetrag(f.kosten.stunden, mlk);
        const material = f.kosten.materialEinstand;
        return {
          fundSchluessel: f.schluessel,
          nr: f.nr,
          titel: f.titel,
          forderung: f.betrag,
          untergrenze: lohn + material,
          rechenweg: `${menge(f.kosten.stunden)} h × ${euro(mlk)}${material > 0 ? ` = ${euro(lohn)} + Material ${euro(material)}` : ""}`,
        };
      });
    const forderung = posten.reduce((s, p) => s + p.forderung, 0);
    const untergrenze = posten.reduce((s, p) => s + p.untergrenze, 0);
    return { belegstand: stand, posten, forderung, untergrenze, spielraum: forderung - untergrenze };
  }).filter((g) => g.posten.length > 0);
  const forderung = gruppen.reduce((s, g) => s + g.forderung, 0);
  const untergrenze = gruppen.reduce((s, g) => s + g.untergrenze, 0);
  return { gruppen, forderung, untergrenze, spielraum: forderung - untergrenze };
}
