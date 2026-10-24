// Test helpers. Expected amounts come from the solution list: `ausListe` checks that the written amount appears in
// docs/Demo_Faelle.md and returns it in cents, so a test can never expect an amount the list does not contain.

import { readFileSync } from "node:fs";
import { centAus } from "../src/geld";
import { feld, type Datensatz, type Feld } from "../src/modell";

const LISTE = readFileSync(new URL("../../docs/Demo_Faelle.md", import.meta.url), "utf8");

/** "14.620,15 €" → 1462015, after checking that the solution list contains exactly this amount. */
export function ausListe(betrag: string): number {
  // the whole number only: "0,00 €" must not match inside "746.820,00 €"
  const zahl = betrag.replace(" €", "").replaceAll(".", "[.]");
  if (!new RegExp(`(?<![0-9.,])${zahl}(?![0-9])`).test(LISTE)) throw new Error(`${betrag} steht nicht in docs/Demo_Faelle.md`);
  return centAus(betrag);
}

export const f = <T,>(wert: T): Feld<T> => feld(wert, { belegId: "test", seite: 1 });

/** A small, valid project without anything open: one position, measured and invoiced in full. */
export function kleinerDatensatz(): Datensatz {
  return {
    projekt: {
      id: "t",
      kurz: "T",
      name: "Test",
      langname: "Testprojekt",
      auftraggeberId: "ag",
      stufe: "sr_vorbereiten",
      schlussrechnungLegenBis: "2026-10-30",
      schlussrechnungGelegt: null,
      schlusszahlung: null,
      bauzeit: null,
    },
    vertrag: {
      belegId: "vertrag",
      datum: f("2025-11-12"),
      norm: f("ÖNORM B 2110"),
      vertragsart: f("Einheitspreisvertrag"),
      auftragssumme: f(100_000),
      saetze: [{ art: "nachlass", satz: f(300), punkt: "5.1", phase: "beide" }],
      regiesatzMonteur: f(6_480),
      regiesatzHelfer: f(5_420),
      regiePunkt: "6.3",
      regiematerialZuschlag: f(1_500),
      regiematerialPunkt: "6.4",
      regieUnterschrift: f("Polier"),
      preise: { art: "fest", punkt: "7.1", text: f("Festpreise bis Bauende") },
      pauschalen: [{ kategorie: "baustelleneinrichtung", punkt: "4.3", text: f("Baustelleneinrichtung pauschal") }],
      schlussrechnungLegenBis: f("2026-10-30"),
    },
    preisbasis: { belegId: "pb", mittellohnkosten: f(4_580), mittellohnpreis: f(5_860), materialzuschlag: f(1_200), k7: [] },
    belege: [
      { id: "lv", art: "leistungsverzeichnis", dateiname: "lv.pdf", datum: "2025-11-12", seiten: 1, inhaltHash: "a" },
      { id: "ab-1", art: "aufmassblatt", dateiname: "ab1.pdf", datum: "2026-03-02", seiten: 1, inhaltHash: "b" },
    ],
    positionen: [{ nr: f("22.01.01A"), kurztext: f("Rohr"), einheit: f("m"), menge: f(10_000), ep: f(1_000) }],
    aufmass: [
      {
        nr: "1",
        belegId: "ab-1",
        datum: f("2026-03-02"),
        leistungVon: f("2026-02-02"),
        leistungBis: f("2026-02-27"),
        gegengezeichnet: f(true),
        gegengezeichnetAm: f("2026-03-03"),
        erfasstAm: f("2026-03-04"),
        grundlageBelegId: null,
        zeilen: [{ positionNr: f("22.01.01A"), menge: f(10_000), ort: f("Stiege 1") }],
      },
    ],
    regie: [],
    stundenzettel: [],
    abschlaege: [],
    entwurf: {
      nr: f("Entwurf"),
      belegId: "entwurf",
      art: "entwurf",
      datum: f("2026-10-19"),
      zeilen: [{ typ: "position", positionNr: f("22.01.01A"), menge: f(10_000), ep: f(1_000), betrag: f(100_000) }],
      summe: f(100_000),
    },
    schlussrechnung: null,
    zahlungen: [],
    korrekturblaetter: [],
    abzugsschreiben: null,
    nachtraege: [],
    plaene: [],
    emails: [],
    fotos: [],
    fotodokumentationen: [],
    grosshaendlerrechnungen: [],
    indexblatt: null,
    meldungen: [],
  };
}
