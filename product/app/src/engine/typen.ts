// Ergebnis des Rechenkerns. Alles abgeleitet aus dem Datensatz, nichts eingetippt.

import type { AbzugArt, Bp, Cent, Datum, Einheit, Pruefstand, Quelle } from "@/domain/typen";

export interface Beleg {
  /** Was der Beleg zeigt, z. B. „Plan H-201, Index D“. */
  titel: string;
  /** Kernaussage, z. B. „je Top 2 Heizkörper zusätzlich“. */
  text: string;
  datum?: Datum;
  quelle: Quelle;
}

export interface Rechenweg {
  /** Ganzer Rechenweg in einer Zeile, z. B. „(100 − 86) Stk × 456,00 € = 6.384,00 €“. */
  text: string;
  schritte: { bezeichnung: string; wert: string; betrag?: Cent }[];
  /** Zusätzliche Plausibilität (z. B. K7), fließt nicht in den Betrag ein. */
  plausibilitaet?: string;
}

export type BefundArt =
  | "mehrmenge_plan"
  | "mehrmenge"
  | "regie"
  | "preisumrechnung"
  | "aenderung"
  | "pauschale"
  | "terminaenderung"
  | "behinderung";

export type Liste = "jetzt" | "offen" | "verloren" | "anwalt";

export interface Befund {
  /** Stabiler Schlüssel, z. B. „mehrmenge:22.04.12B“ oder „regie:RB-07“. */
  schluessel: string;
  art: BefundArt;
  liste: Liste;
  titel: string;
  positionNr: string | null;
  /** null bei Hinweisen ohne Betrag („braucht Anwalt“). */
  betrag: Cent | null;
  rechenweg: Rechenweg | null;
  belege: Beleg[];
  pruefstand: Pruefstand;
}

export type Kuerzungsgrund =
  | "aufmass_nicht_gegengezeichnet"
  | "stunden_weichen_ab"
  | "rechenfehler"
  | "ausserhalb_lv_kein_nachtrag";

export const KUERZUNGSGRUND_TEXT: Record<Kuerzungsgrund, string> = {
  aufmass_nicht_gegengezeichnet: "Aufmaß nicht gegengezeichnet",
  stunden_weichen_ab: "Stunden weichen ab",
  rechenfehler: "Rechenfehler",
  ausserhalb_lv_kein_nachtrag: "außerhalb des LV, kein Nachtrag gefunden",
};

export interface Kuerzungsrisiko {
  schluessel: string;
  grund: Kuerzungsgrund;
  /** Position oder Regiebericht, z. B. „22.04.12B“ oder „RB-11“. */
  bezug: string;
  /** Befund, mit dem sich das Risiko überschneidet (nie addieren). */
  befundSchluessel: string | null;
  was: string;
  detail: string;
  abhilfe: string;
  betrag: Cent;
  /** Steht schon im Korrekturblatt einer Abschlagsrechnung. */
  bereitsGekuerzt: boolean;
  belege: Beleg[];
  pruefstand: Pruefstand;
}

export interface Hinweis {
  schluessel: string;
  art: "mengenaenderung_ueber_20";
  positionNr: string;
  befundSchluessel: string;
  /** Mengenänderung gegenüber LV in Basispunkten (+26,9 % = 2688). */
  aenderung: Bp;
  text: string;
}

export interface LedgerZeile {
  positionNr: string;
  kurztext: string;
  einheit: Einheit;
  ep: Cent;
  lvMenge: number;
  aufmassMenge: number;
  /** Menge im eigenen Schlussrechnungs-Entwurf. */
  verrechnetMenge: number;
  verrechnetBetrag: Cent;
  inAbschlaegenMenge: number;
  /** In bezahlten Abschlagsrechnungen enthalten, abzüglich Kürzungen des GU (vor Nachlass und Rücklässen). */
  bezahltBetrag: Cent;
  /** Aufmaß minus verrechnet. */
  differenzMenge: number;
  differenzBetrag: Cent;
  befundSchluessel: string | null;
}

export interface KaskadenZeile {
  bezeichnung: string;
  art: "summe" | "abzug" | "zahlung";
  abzugArt: AbzugArt | null;
  satz: Bp | null;
  quelle: "entwurf" | "vertrag" | "gu_abzug" | "zahlungen" | null;
  pruefung: "laut_vertrag" | "abweichung" | "kein_vertragspunkt" | null;
  vertragspunkt: string | null;
  betrag: Cent;
}

export interface ImportStand {
  dokumente: number;
  duplikate: number;
  eindeutig: number;
  planIndizes: string[];
  korrigierteFelder: number;
  nachArt: Record<string, number>;
}

export interface Ergebnis {
  import: ImportStand;
  ledger: LedgerZeile[];
  befunde: Befund[];
  summen: { jetzt: Cent; offen: Cent; verloren: Cent };
  vorpruefung: {
    risiken: Kuerzungsrisiko[];
    summe: Cent;
    bereitsGekuerzt: { anzahl: number; betrag: Cent };
    korrekturblatt: { gekuerzt: Cent; zeilen: number; erkannt: number };
  };
  hinweise: Hinweis[];
  kaskade: {
    zeilen: KaskadenZeile[];
    leistungssumme: Cent;
    schlussrechnungsbetrag: Cent;
    zahlungen: Cent;
    restforderung: Cent;
  };
  regie: { gesamt: number; verrechnet: number; unterschriebenNichtVerrechnet: number; nichtUnterschrieben: number };
}
