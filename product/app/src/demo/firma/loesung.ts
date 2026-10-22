// Lösungsliste v2 (Firma und die 7 weiteren Projekte), abgeschrieben aus product/docs/Demo_Faelle.md.
// Nur für Tests. Der Rechenkern liest diese Datei nie.

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
