// Ergebnis des Rechenkerns. Alles abgeleitet aus dem Datensatz, nichts eingetippt.

import type { AbzugArt, Auftraggeber, Bp, Cent, Datum, Einheit, ProjektStatus, Pruefstand, Quelle } from "@/domain/typen";
import type { Belegquelle } from "./belegquelle";

export interface Beleg {
  /** Was der Beleg zeigt, z. B. „Plan H-201, Index D“. */
  titel: string;
  /** Kernaussage, z. B. „je Top 2 Heizkörper zusätzlich“. */
  text: string;
  datum?: Datum;
  quelle: Quelle;
}

export interface RechenSchritt {
  bezeichnung: string;
  wert: string;
  betrag?: Cent;
  summe?: boolean;
  /**
   * Stellen in den Dokumenten, aus denen die Werte des Schritts stammen, z. B. Stunden im Regiebericht und
   * Regiesatz im Vertrag, oder die Aufmaßblätter einer Menge. Fehlt bei Schritten, die nur gerechnet sind.
   */
  quellen?: Quelle[];
}

export interface Rechenweg {
  /** Ganzer Rechenweg in einer Zeile, z. B. „(100 − 86) Stk × 456,00 € = 6.384,00 €“. */
  text: string;
  /** Schritte für die Tabelle; „summe“ markiert die Schlusszeile, die den Betrag ergibt. */
  schritte: RechenSchritt[];
  /** Zusätzliche Plausibilität (z. B. K7), fließt nicht in den Betrag ein. */
  plausibilitaet?: string;
}

export type BefundArt =
  | "mehrmenge_plan"
  | "mehrmenge"
  | "nicht_verrechnet"
  | "regie"
  | "regie_zuruf"
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
  /** Kurze Unterzeile für Listen, z. B. „+14 Stk über LV“ oder „nicht unterschrieben“. */
  untertitel: string;
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
  | "ausserhalb_lv_kein_nachtrag"
  | "regie_nicht_unterschrieben"
  | "menge_ohne_aufmass"
  | "abzug_ohne_vertragspunkt";

export const KUERZUNGSGRUND_TEXT: Record<Kuerzungsgrund, string> = {
  aufmass_nicht_gegengezeichnet: "Aufmaß nicht gegengezeichnet",
  stunden_weichen_ab: "Stunden weichen ab",
  rechenfehler: "Rechenfehler",
  ausserhalb_lv_kein_nachtrag: "außerhalb des LV, kein Nachtrag gefunden",
  regie_nicht_unterschrieben: "Regie nicht unterschrieben",
  menge_ohne_aufmass: "Menge ohne Aufmaß-Nachweis",
  abzug_ohne_vertragspunkt: "Abzug ohne Vertragspunkt",
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
  /** Menge im eigenen Schlussrechnungs-Entwurf; ohne Entwurf in den Abschlagsrechnungen. */
  verrechnetMenge: number;
  verrechnetBetrag: Cent;
  inAbschlaegenMenge: number;
  /** Ohne Entwurf: nach der letzten AR aufgemessen, kommt in die nächste AR (kein Befund, nicht in der Differenz). */
  naechsteArMenge: number;
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
  /** „abzug_ohne_vertragspunkt“ ist derselbe Schlüssel wie der Kürzungsgrund (Abgleich mit der GU-Historie). */
  pruefung: "laut_vertrag" | "abweichung" | "abzug_ohne_vertragspunkt" | null;
  vertragspunkt: string | null;
  betrag: Cent;
  /**
   * Dokumente hinter der Zeile, jeweils mit Seite und Stelle: Entwurf (Leistungssumme), Vertragspunkt und
   * GU-Abzugsschreiben (Sätze), Zahlungsavisos (Zahlungen). Leer bei Zwischensummen, die nur gerechnet sind.
   */
  belege: Beleg[];
}

export interface ImportStand {
  dokumente: number;
  duplikate: number;
  eindeutig: number;
  planIndizes: string[];
  korrigierteFelder: number;
  nachArt: Record<string, number>;
}

export interface Vorpruefung {
  risiken: Kuerzungsrisiko[];
  summe: Cent;
  bereitsGekuerzt: { anzahl: number; betrag: Cent };
  korrekturblatt: { gekuerzt: Cent; zeilen: number; erkannt: number };
}

export interface Kaskade {
  zeilen: KaskadenZeile[];
  leistungssumme: Cent;
  schlussrechnungsbetrag: Cent;
  zahlungen: Cent;
  restforderung: Cent;
}

export interface Ergebnis {
  projektId: string;
  /** false bei gelegter Schlussrechnung oder abgeschlossenem Projekt: dann kein Abgleich, keine Befunde. */
  abgleich: boolean;
  /** Ohne Entwurf: Datum der letzten AR; nur Leistung bis einschließlich dieses Tages kann ein Befund sein. */
  grenze: Datum | null;
  import: ImportStand;
  ledger: LedgerZeile[];
  befunde: Befund[];
  /** Quelle des Belegs je Befund (Schlüssel → Quellen). */
  belegquellen: Record<string, Belegquelle[]>;
  /** Posten der Listen 1 und 2, die nur außerhalb des ERP belegt sind (synthetisch, kein Beleg der Leithypothese). */
  ausserhalbErp: { betrag: Cent; anzahl: number; vonBetrag: Cent; vonAnzahl: number };
  summen: { jetzt: Cent; offen: Cent; verloren: Cent };
  vorpruefung: Vorpruefung | null;
  hinweise: Hinweis[];
  kaskade: Kaskade | null;
  /** Nicht verrechnete Berichte zählen nur bis zur Grenze; spätere stehen unter „nachGrenze“ (kommen in die nächste AR). */
  regie: { gesamt: number; verrechnet: number; unterschriebenNichtVerrechnet: number; nichtUnterschrieben: number; nachGrenze: number };
}

export type Ampel = "rot" | "gelb" | "gruen" | "grau";

/** Welches Datum die Firmenübersicht je Projekt zeigt. */
export type ProjektDatumArt = "legen_bis" | "letzte_ar" | "gelegt" | "schlusszahlung";

export interface ProjektZeile {
  projektId: string;
  kurz: string;
  name: string;
  los: string;
  auftraggeber: Auftraggeber;
  status: ProjektStatus;
  auftragssumme: Cent;
  datum: { art: ProjektDatumArt; wert: Datum } | null;
  /** null, wenn das Projekt nicht abgeglichen wird (Schlussrechnung gelegt, abgeschlossen). */
  jetzt: Cent | null;
  offen: Cent | null;
  befunde: number;
  ampel: Ampel;
}

export interface FirmenErgebnis {
  stichtag: Datum;
  projekte: ProjektZeile[];
  ergebnisse: Record<string, Ergebnis>;
  summen: {
    projekte: number;
    offeneProjekte: number;
    auftragssumme: Cent;
    auftragssummeOffen: Cent;
    jetzt: Cent;
    offen: Cent;
    /** Anzahl der Posten in Liste 1 bzw. 2 über alle offenen Projekte. */
    postenJetzt: number;
    postenOffen: number;
    projekteMitJetzt: number;
    projekteMitOffen: number;
  };
  /** Früheste „Schlussrechnung legen bis“ ab dem Stichtag unter den offenen Projekten. */
  naechsteSchlussrechnung: { projektId: string; datum: Datum } | null;
  /** „Nur außerhalb ERP“ über alle offenen Projekte, gleiche Form wie je Projekt (Annahme: Datei = ERP). */
  ausserhalbErp: Ergebnis["ausserhalbErp"];
  /** Listen 1 und 2 der offenen Projekte nach Stand des Belegs (Regel in `geldStand`). */
  geld: Record<GeldStand, { betrag: Cent; anzahl: number }>;
}

/**
 * Stand des Belegs eines Postens mit Betrag in Liste 1 oder 2:
 * „belegt“ = Liste 1; „beleg_fehlt“ = Liste 2, Abhilfe ist ein Regiebericht oder eine Unterschrift
 * (Regie nicht unterschrieben, Regie nur aus WhatsApp-Meldung); „angemeldet“ = Liste 2, angemeldet,
 * aber nie bepreist (Änderung per Mail).
 */
export type GeldStand = "belegt" | "beleg_fehlt" | "angemeldet";
