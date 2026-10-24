// How an Auftraggeber settles an invoice, in the order of solution list v3: (amount − cut) → Nachlass on that →
// Baustrom und Bauwasser and Bauschadensumlage on the amount after Nachlass → Deckungsrücklass or Haftrücklass on what is
// left. Every line commercially rounded to the cent. Used by the Rechnungsabschluss, by the check of a Zahlungsavis and
// by the sample data, where it plays the Auftraggeber.

import { prozent } from "./geld";
import type { AbzugArt, Bp, Cent } from "./modell";

export const STUFE: Record<AbzugArt, 1 | 2 | 3 | 4> = {
  nachlass: 1,
  baustrom_bauwasser: 2,
  bauschadensumlage: 2,
  deckungsruecklass: 3,
  haftruecklass: 3,
  skonto: 4,
};

export interface Satz {
  art: AbzugArt;
  satz: Bp;
}

export interface StufenZeile {
  art: AbzugArt;
  satz: Bp;
  /** Amount the rate is applied to. */
  basis: Cent;
  betrag: Cent;
}

export interface Stufenrechnung {
  /** Amount after the cut. */
  nachKuerzung: Cent;
  zeilen: StufenZeile[];
  /** Amount after each stage: 1 after Nachlass, 2 before the retentions, 3 after the retentions, 4 after Skonto. */
  nachStufe: Record<1 | 2 | 3 | 4, Cent>;
  ergebnis: Cent;
}

export function abrechnen(betrag: Cent, kuerzung: Cent, saetze: readonly Satz[]): Stufenrechnung {
  let basis = betrag - kuerzung;
  const nachKuerzung = basis;
  const zeilen: StufenZeile[] = [];
  const nachStufe = { 1: 0, 2: 0, 3: 0, 4: 0 };
  for (const stufe of [1, 2, 3, 4] as const) {
    let abzug = 0;
    for (const s of saetze.filter((x) => STUFE[x.art] === stufe)) {
      const b = prozent(basis, s.satz);
      zeilen.push({ art: s.art, satz: s.satz, basis, betrag: b });
      abzug += b;
    }
    basis -= abzug;
    nachStufe[stufe] = basis;
  }
  return { nachKuerzung, zeilen, nachStufe, ergebnis: basis };
}
