// Kleiner, gültiger Datensatz für Regel-Tests: alles abgerechnet, kein Befund.
// Tests ändern gezielt ein Feld und prüfen, ob genau die erwartete Regel anschlägt.

import type { Datensatz, Feld, Quelle } from "@/domain/typen";

const q: Quelle = { dokumentId: "test", seite: 1 };
export const f = <T,>(wert: T): Feld<T> => ({ wert, quelle: q });

export function miniDatensatz(): Datensatz {
  return {
    projekt: {
      id: "t",
      kurz: "T",
      name: "Test",
      los: "HKLS",
      auftraggeberId: "gu",
      status: "sr_vorbereiten",
      schlussrechnungLegenBis: "2026-10-31",
      schlussrechnungGelegt: null,
      schlusszahlung: null,
    },
    vertrag: {
      datum: f("2025-11-14"),
      norm: f("ÖNORM B 2110"),
      auftragssumme: f(100_000),
      regiesatzMonteur: f(6_250),
      regiesatzHelfer: f(5_200),
      mittellohnpreis: f(5_680),
      saetze: [{ art: "nachlass", satz: f(300), punkt: "5.1", phase: "beide" }],
      preisgleitung: null,
      pauschalen: [{ kategorie: f("baustelleneinrichtung"), punkt: "4.3", text: f("pauschal") }],
    },
    dokumente: [
      { id: "test", art: "lv", kanal: "ordner", dateiname: "lv.pdf", datum: "2026-01-01", seiten: 1, inhaltHash: "a" },
      { id: "test-2", art: "mail", kanal: "ordner", dateiname: "m.eml", datum: "2026-01-01", seiten: 1, inhaltHash: "a" },
    ],
    lv: [
      { nr: f("22.01.01A"), kurztext: f("Rohr"), einheit: f("m"), menge: f(10_000), ep: f(1_000), k7: null },
      { nr: f("22.01.02A"), kurztext: f("Ventil"), einheit: f("Stk"), menge: f(1_000), ep: f(5_000), k7: null },
    ],
    aufmass: [
      {
        nr: "AB-01",
        dokumentId: "test",
        datum: f("2026-06-01"),
        leistungVon: f("2026-05-01"),
        leistungBis: f("2026-05-31"),
        unterschriftAN: f(true),
        unterschriftAG: f(true),
        zeilen: [
          { positionNr: f("22.01.01A"), menge: f(10_000), ort: f("St. 1") },
          { positionNr: f("22.01.02A"), menge: f(1_000), ort: f("St. 1") },
        ],
      },
    ],
    regie: [
      {
        nr: f("RB-01"),
        dokumentId: "test",
        datum: f("2026-06-03"),
        taetigkeit: f("Umlegen"),
        stundenMonteur: f(800),
        stundenHelfer: f(0),
        material: f(1_000),
        unterschriftAG: f(true),
      },
    ],
    stundenlisten: [],
    abschlaege: [],
    schlussrechnung: null,
    entwurf: {
      nr: f("SR"),
      dokumentId: "test",
      art: "schluss_entwurf",
      datum: f("2026-10-20"),
      zeilen: [
        { typ: "lv", positionNr: f("22.01.01A"), menge: f(10_000), ep: f(1_000), betrag: f(100_000) },
        { typ: "lv", positionNr: f("22.01.02A"), menge: f(1_000), ep: f(5_000), betrag: f(50_000) },
        { typ: "regie", regieNr: f("RB-01"), betrag: f(51_000) },
      ],
      summe: f(201_000),
    },
    zahlungen: [],
    plaene: [],
    mails: [],
    fotos: [],
    indexblatt: null,
    guAbzug: null,
    korrekturblaetter: [],
    nachtraege: [],
    zurufe: [],
  };
}
