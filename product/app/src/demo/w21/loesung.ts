// Lösungsliste v2 (Projekt W21), abgeschrieben aus product/docs/Demo_Faelle.md.
// Nur für Tests. Der Rechenkern liest diese Datei nie.

import type { Belegquelle } from "@/engine/belegquelle";
import type { BefundArt, Kuerzungsgrund, Liste } from "@/engine/typen";

export interface SollBefund {
  id: string;
  schluessel: string;
  art: BefundArt;
  liste: Liste;
  betrag: number | null;
}

export const SOLL_BEFUNDE: SollBefund[] = [
  { id: "J1", schluessel: "mehrmenge:22.04.12B", art: "mehrmenge_plan", liste: "jetzt", betrag: 638_400 },
  { id: "J2", schluessel: "regie:RB-07", art: "regie", liste: "jetzt", betrag: 131_140 },
  { id: "J3", schluessel: "regie:RB-11", art: "regie", liste: "jetzt", betrag: 297_480 },
  { id: "J4", schluessel: "regie:RB-14", art: "regie", liste: "jetzt", betrag: 59_620 },
  { id: "J5", schluessel: "mehrmenge:24.02.05A", art: "mehrmenge", liste: "jetzt", betrag: 316_480 },
  { id: "J6", schluessel: "mehrmenge:22.06.03C", art: "mehrmenge", liste: "jetzt", betrag: 236_400 },
  { id: "J7", schluessel: "mehrmenge:26.03.04A", art: "mehrmenge", liste: "jetzt", betrag: 336_680 },
  { id: "J8", schluessel: "preisumrechnung", art: "preisumrechnung", liste: "jetzt", betrag: 724_800 },
  { id: "O1", schluessel: "regie:RB-12", art: "regie", liste: "offen", betrag: 102_150 },
  { id: "O2", schluessel: "regie:RB-15", art: "regie", liste: "offen", betrag: 72_100 },
  { id: "O3", schluessel: "anmeldung:mail-0314-technikraum", art: "aenderung", liste: "offen", betrag: 835_280 },
  { id: "O4", schluessel: "zuruf:Z6", art: "regie_zuruf", liste: "offen", betrag: 68_700 },
  { id: "O5", schluessel: "zuruf:Z5", art: "regie_zuruf", liste: "offen", betrag: 50_000 },
  { id: "V1", schluessel: "anmeldung:mail-0520-container", art: "pauschale", liste: "verloren", betrag: 118_000 },
  { id: "A1", schluessel: "hinweis:mail-0702-termin", art: "terminaenderung", liste: "anwalt", betrag: null },
];

export const SOLL_SUMMEN = { jetzt: 2_741_000, offen: 1_128_230, verloren: 118_000 };

/** Zurufe als zusätzliche Belege vorhandener Posten (Z1 bis Z4). */
export const SOLL_ZURUF_BELEGE: Record<string, string> = {
  "mehrmenge:22.04.12B": "Zuruf Z1",
  "regie:RB-11": "Zuruf Z2",
  "regie:RB-12": "Zuruf Z3",
  "regie:RB-14": "Zuruf Z4",
};

/** Quelle des Belegs je Posten (Tabelle „Belegquelle je Posten“). */
export const SOLL_BELEGQUELLEN: Record<string, Belegquelle[]> = {
  "mehrmenge:22.04.12B": ["datei", "mail", "foto", "whatsapp"],
  "regie:RB-07": ["papier"],
  "regie:RB-11": ["papier", "whatsapp"],
  "regie:RB-14": ["papier", "whatsapp"],
  "mehrmenge:24.02.05A": ["datei"],
  "mehrmenge:22.06.03C": ["datei"],
  "mehrmenge:26.03.04A": ["datei"],
  preisumrechnung: ["datei"],
  "regie:RB-12": ["papier", "whatsapp"],
  "regie:RB-15": ["papier"],
  "anmeldung:mail-0314-technikraum": ["mail"],
  "zuruf:Z6": ["whatsapp"],
  "zuruf:Z5": ["whatsapp"],
};

/** Nur außerhalb ERP: 16.164,70 € in 8 von 13 Posten (Listen 1 und 2: 38.692,30 €). */
export const SOLL_AUSSERHALB_ERP = { betrag: 1_616_470, anzahl: 8, vonBetrag: 3_869_230, vonAnzahl: 13 };

export interface SollRisiko {
  id: string;
  schluessel: string;
  grund: Kuerzungsgrund;
  betrag: number;
  bereitsGekuerzt: boolean;
  befundSchluessel: string | null;
}

export const SOLL_RISIKEN: SollRisiko[] = [
  { id: "G1", schluessel: "vp:aufmass_nicht_gegengezeichnet:22.04.12B", grund: "aufmass_nicht_gegengezeichnet", betrag: 638_400, bereitsGekuerzt: false, befundSchluessel: "mehrmenge:22.04.12B" },
  { id: "G2", schluessel: "vp:stunden_weichen_ab:RB-11", grund: "stunden_weichen_ab", betrag: 18_750, bereitsGekuerzt: false, befundSchluessel: "regie:RB-11" },
  { id: "G3", schluessel: "vp:rechenfehler:24.05.02A", grund: "rechenfehler", betrag: 3_600, bereitsGekuerzt: true, befundSchluessel: null },
  { id: "G4", schluessel: "vp:ausserhalb_lv_kein_nachtrag:Z-01", grund: "ausserhalb_lv_kein_nachtrag", betrag: 216_000, bereitsGekuerzt: true, befundSchluessel: null },
];

export const SOLL_VORPRUEFUNG = { summe: 876_750, bereitsGekuerzt: { anzahl: 2, betrag: 219_600 }, korrekturblatt: { gekuerzt: 219_600, zeilen: 2, erkannt: 2 } };

/** Hinweise „Mengenänderung über 20 %“: Position → Änderung in Basispunkten (+26,9 % ≈ 2688). */
export const SOLL_HINWEISE: Record<string, number> = { "24.02.05A": 2_688, "22.06.03C": 2_667, "26.03.04A": 3_619 };

export const SOLL_KASKADE: { bezeichnung: string; betrag: number; pruefung?: string; quelle?: string }[] = [
  { bezeichnung: "Leistungssumme laut Entwurf inkl. Liste 1", betrag: 124_605_000, quelle: "entwurf" },
  { bezeichnung: "Nachlass", betrag: -3_738_150, pruefung: "laut_vertrag", quelle: "vertrag" },
  { bezeichnung: "Summe nach Nachlass", betrag: 120_866_850 },
  { bezeichnung: "Baustrom und Bauwasser", betrag: -966_935, pruefung: "laut_vertrag", quelle: "gu_abzug" },
  { bezeichnung: "Bauschadensumlage", betrag: -604_334, pruefung: "abzug_ohne_vertragspunkt", quelle: "gu_abzug" },
  { bezeichnung: "Betrag vor Einbehalten", betrag: 119_295_581 },
  { bezeichnung: "Haftrücklass", betrag: -3_578_867, pruefung: "laut_vertrag", quelle: "vertrag" },
  { bezeichnung: "Schlussrechnungsbetrag vor Abzug der Zahlungen", betrag: 115_716_714 },
  { bezeichnung: "Zahlungen auf AR1, AR2, AR3", betrag: -98_710_625, quelle: "zahlungen" },
  { bezeichnung: "Restforderung", betrag: 17_006_089 },
];

export const SOLL_ZAHLUNGEN = [28_413_421, 38_099_814, 32_197_390];

export const SOLL_IMPORT = { dokumente: 165, duplikate: 12, eindeutig: 153, planIndizes: ["C", "D", "E"], korrigierteFelder: 31 };

export const SOLL_REGIE = { gesamt: 16, verrechnet: 11, unterschriebenNichtVerrechnet: 3, nichtUnterschrieben: 2, nachGrenze: 0 };
