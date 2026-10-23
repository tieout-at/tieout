// Lösungsliste v2 (Firma und die 7 weiteren Projekte), abgeschrieben aus product/docs/Demo_Faelle.md.
// Nur für Tests. Der Rechenkern liest diese Datei nie.

import type { Kuerzungsgrund } from "@/domain/typen";
import type { Ampel, BefundArt, Liste } from "@/engine/typen";

export interface SollProjekt {
  kurz: string;
  auftragssumme: number;
  datum: string | null;
  jetzt: number | null;
  offen: number | null;
  ampel: Ampel;
}

export const SOLL_PROJEKTE: SollProjekt[] = [
  { kurz: "W21", auftragssumme: 124_000_000, datum: "legen_bis 2026-10-31", jetzt: 2_741_000, offen: 1_128_230, ampel: "rot" },
  { kurz: "P2", auftragssumme: 86_000_000, datum: "letzte_ar 2026-09-30", jetzt: 310_070, offen: 25_000, ampel: "gelb" },
  { kurz: "P3", auftragssumme: 41_000_000, datum: "legen_bis 2026-12-04", jetzt: 306_300, offen: 0, ampel: "gelb" },
  { kurz: "P4", auftragssumme: 69_000_000, datum: "letzte_ar 2026-09-30", jetzt: 69_440, offen: 0, ampel: "gelb" },
  { kurz: "P5", auftragssumme: 52_000_000, datum: "letzte_ar 2026-09-30", jetzt: 0, offen: 0, ampel: "gruen" },
  { kurz: "P6", auftragssumme: 34_000_000, datum: "gelegt 2026-09-15", jetzt: null, offen: null, ampel: "grau" },
  { kurz: "P7", auftragssumme: 102_000_000, datum: "schlusszahlung 2026-02-18", jetzt: null, offen: null, ampel: "grau" },
  { kurz: "P8", auftragssumme: 148_000_000, datum: "schlusszahlung 2025-09-12", jetzt: null, offen: null, ampel: "grau" },
];

export const SOLL_FIRMA = {
  projekte: 8,
  offeneProjekte: 5,
  auftragssumme: 656_000_000,
  auftragssummeOffen: 372_000_000,
  jetzt: 3_426_810,
  offen: 1_153_230,
  // Posten: W21 8 + P2 3 + P3 2 + P4 1 = 14 in Liste 1; W21 5 + P2 1 = 6 in Liste 2
  postenJetzt: 14,
  postenOffen: 6,
  projekteMitJetzt: 4,
  projekteMitOffen: 2,
};

/** Nächste Schlussrechnung: W21, legen bis 31.10.2026. */
export const SOLL_NAECHSTE = { projektId: "w21-b-hkls", datum: "2026-10-31" };

export interface SollFall {
  id: string;
  projekt: string;
  schluessel: string;
  art: BefundArt;
  liste: Liste;
  betrag: number;
}

export const SOLL_FAELLE: SollFall[] = [
  { id: "P2-J1", projekt: "P2", schluessel: "regie:RB-03", art: "regie", liste: "jetzt", betrag: 158_830 },
  { id: "P2-J2", projekt: "P2", schluessel: "regie:RB-05", art: "regie", liste: "jetzt", betrag: 41_390 },
  { id: "P2-J3", projekt: "P2", schluessel: "nicht_verrechnet:24.02.04A", art: "nicht_verrechnet", liste: "jetzt", betrag: 109_850 },
  { id: "P2-O1", projekt: "P2", schluessel: "regie:RB-06", art: "regie", liste: "offen", betrag: 25_000 },
  { id: "P3-J1", projekt: "P3", schluessel: "mehrmenge:22.03.06A", art: "mehrmenge", liste: "jetzt", betrag: 119_840 },
  { id: "P3-J2", projekt: "P3", schluessel: "regie:RB-02", art: "regie", liste: "jetzt", betrag: 186_460 },
  { id: "P4-J1", projekt: "P4", schluessel: "regie:RB-04", art: "regie", liste: "jetzt", betrag: 69_440 },
];

/** Hinweis „Mengenänderung über 20 %“: P3-J1 +31,1 % (56 von 180 m). */
export const SOLL_HINWEISE_KLEIN: Record<string, Record<string, number>> = { P3: { "22.03.06A": 3_111 } };

// GU-Historie, abgeschrieben aus Demo_Faelle.md, Abschnitt „GC history“ (Eingaben P7/P8 mit Go Maxi S. 23.10.2026).

export interface SollKuerzung {
  kurz: string;
  rechnung: string;
  bezug: string;
  grund: Kuerzungsgrund;
  betrag: number;
}

export const SOLL_KUERZUNGEN: Record<string, SollKuerzung[]> = {
  "hochbau-beispiel": [
    { kurz: "W21", rechnung: "AR3", bezug: "24.05.02A", grund: "rechenfehler", betrag: 3_600 },
    { kurz: "W21", rechnung: "AR3", bezug: "Z-01", grund: "ausserhalb_lv_kein_nachtrag", betrag: 216_000 },
    { kurz: "P7", rechnung: "SR", bezug: "22.04.10A", grund: "aufmass_nicht_gegengezeichnet", betrag: 421_200 },
    { kurz: "P7", rechnung: "SR", bezug: "24.05.03A", grund: "rechenfehler", betrag: 11_840 },
  ],
  "generalbau-beispiel": [
    { kurz: "P8", rechnung: "SR", bezug: "RB-09", grund: "regie_nicht_unterschrieben", betrag: 231_000 },
    { kurz: "P8", rechnung: "SR", bezug: "26.02.03A", grund: "menge_ohne_aufmass", betrag: 164_050 },
  ],
  "gemeinde-beispielstadt": [],
  "wohnbau-beispiel": [],
};

export interface SollHistorie {
  projekte: number;
  abgeschlossen: number;
  kuerzungen: number;
  kuerzungenZeilen: number;
  kuerzungenProjekte: number;
  abzuege: { kurz: string; rechnungen: string[]; betrag: number }[];
  abzuegeSumme: number;
  nachtraege: { anzahl: number; beauftragt: number; betrag: number; betragBeauftragt: number; quote: number | null };
  tage: Record<string, number>;
}

const OHNE_HISTORIE: SollHistorie = {
  projekte: 1,
  abgeschlossen: 0,
  kuerzungen: 0,
  kuerzungenZeilen: 0,
  kuerzungenProjekte: 0,
  abzuege: [],
  abzuegeSumme: 0,
  nachtraege: { anzahl: 0, beauftragt: 0, betrag: 0, betragBeauftragt: 0, quote: null },
  tage: {},
};

/** Tabelle „Per client“: Projekte (abgeschlossen), Kürzungen, Abzüge ohne Vertragspunkt, Nachträge, Tage bis zur Schlusszahlung. */
export const SOLL_HISTORIE: Record<string, SollHistorie> = {
  "hochbau-beispiel": {
    projekte: 4,
    abgeschlossen: 1,
    kuerzungen: 652_640,
    kuerzungenZeilen: 4,
    kuerzungenProjekte: 2,
    abzuege: [
      { kurz: "W21", rechnungen: ["AR1", "AR2", "AR3"], betrag: 526_373 },
      { kurz: "P7", rechnungen: ["SR"], betrag: 523_150 },
    ],
    abzuegeSumme: 1_049_523,
    nachtraege: { anzahl: 3, beauftragt: 2, betrag: 1_424_000, betragBeauftragt: 1_176_000, quote: 8_258 },
    tage: { P7: 90 },
  },
  "generalbau-beispiel": {
    projekte: 2,
    abgeschlossen: 1,
    kuerzungen: 395_050,
    kuerzungenZeilen: 2,
    kuerzungenProjekte: 1,
    abzuege: [],
    abzuegeSumme: 0,
    nachtraege: { anzahl: 2, beauftragt: 2, betrag: 1_826_000, betragBeauftragt: 1_826_000, quote: 10_000 },
    tage: { P8: 74 },
  },
  "gemeinde-beispielstadt": OHNE_HISTORIE,
  "wohnbau-beispiel": OHNE_HISTORIE,
};

/** Schlussrechnung und Schlusszahlung von P7 und P8 laut Eingabeblock (Cent). */
export const SOLL_SCHLUSS: Record<string, { summe: number; nachKuerzung: number; nachlass: number; baustrom: number; umlage: number; haft: number; abschlaege: number; zahlung: number }> = {
  P7: { summe: 108_299_019, nachKuerzung: 107_865_979, nachlass: 3_235_979, baustrom: 837_040, umlage: 523_150, haft: 3_098_094, abschlaege: 90_500_000, zahlung: 9_671_716 },
  P8: { summe: 150_694_000, nachKuerzung: 150_298_950, nachlass: 3_005_979, baustrom: 0, umlage: 0, haft: 4_418_789, abschlaege: 132_000_000, zahlung: 10_874_182 },
};
