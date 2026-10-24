// Result types of the core. Everything is derived from the twin, nothing is typed in.

import type { BelegArt, Cent, Datum, Entscheidungsstand, Hundertstel, Kuerzungsgrund, Quelle } from "./modell";

/** One Beleg (or WhatsApp-Meldung) behind a find, with the place in the original. */
export interface Nachweis {
  titel: string;
  text: string;
  datum?: Datum;
  quelle: Quelle;
  art: BelegArt | "whatsapp";
  /**
   * "leistung": proves the work done (Aufmaß, Regiebericht, plan, e-mail, photo, message);
   * "preis": proves the price only (Leistungsverzeichnis, Vertrag, wholesaler invoice).
   */
  rolle: "leistung" | "preis";
  /** The proof of work is in the business's ERP or AVA (an entered Aufmaßblatt). */
  imErp: boolean;
}

export interface RechenSchritt {
  bezeichnung: string;
  wert: string;
  betrag?: Cent;
  /** Marks the line that gives the amount. */
  summe?: boolean;
  /** Places in the documents the values of the step come from; missing for steps that are only calculated. */
  quellen?: Quelle[];
}

export interface Rechenweg {
  /** The whole calculation in one line, for example "14 × 286,40 € + … = 6.648,60 €". */
  text: string;
  schritte: RechenSchritt[];
  /** Further plausibility (K7), never part of the amount. */
  plausibilitaet?: string;
}

export type FundArt =
  | "mehrmenge_plan"
  | "regie"
  | "stunden_ohne_regiebericht"
  | "preisumrechnung"
  | "mehrmenge"
  | "nicht_verrechnet"
  | "aenderung_angemeldet"
  | "pauschale";

export const FUND_ART_TEXT: Record<FundArt, string> = {
  mehrmenge_plan: "Mehrmenge aus Planänderung",
  regie: "Regie",
  stunden_ohne_regiebericht: "Stunden ohne Regiebericht",
  preisumrechnung: "Preisumrechnung",
  mehrmenge: "Mehrmenge",
  nicht_verrechnet: "erbracht, nicht verrechnet",
  aenderung_angemeldet: "Änderung angemeldet",
  pauschale: "Pauschale laut Vertrag",
};

/** "belegt", "Beleg fehlt", "Nachtrag nicht gelegt"; null for "Pauschale laut Vertrag". */
export type Belegstand = "belegt" | "beleg_fehlt" | "nachtrag_nicht_gelegt";

export const BELEGSTAND_TEXT: Record<Belegstand, string> = {
  belegt: "belegt",
  beleg_fehlt: "Beleg fehlt",
  nachtrag_nicht_gelegt: "Nachtrag nicht gelegt",
};

/** One position of a find: what was measured beyond what was invoiced. */
export interface FundPosition {
  positionNr: string;
  kurztext: string;
  einheit: string;
  ep: Cent;
  lvMenge: Hundertstel;
  aufmassMenge: Hundertstel;
  verrechnetMenge: Hundertstel;
  differenz: Hundertstel;
  betrag: Cent;
}

/** What the floor of the Schlussbesprechungs-Blatt needs: hours and material at Einstandspreis, or the contract price. */
export type Kosten = { art: "vertragspreis" } | { art: "aufwand"; stunden: Hundertstel; materialEinstand: Cent };

/** Something tieout found that may go into the Schlussrechnung. */
export interface Fund {
  /** Stable key, for example "plan:H-201:D", "regie:9", "meldung:W4", "mehrmenge:24.02.05A". */
  schluessel: string;
  /** Number in the project, "F1" …, in the order of the result (Belegstand, Art, amount). */
  nr: string;
  art: FundArt;
  belegstand: Belegstand | null;
  titel: string;
  untertitel: string;
  /** Positions of the Leistungsverzeichnis the find covers; empty for Regie, messages and changes. */
  positionen: FundPosition[];
  betrag: Cent;
  rechenweg: Rechenweg;
  nachweise: Nachweis[];
  /** Remedy for a find that is not "belegt" ("Regiebericht vom Polier unterschreiben lassen"); the same text as the task. */
  abhilfe: string | null;
  /** Day of the work (ongoing projects compare it with the last Abschlagsrechnung). */
  arbeitsdatum: Datum;
  kosten: Kosten;
  entscheidung: Entscheidungsstand;
}

/** A note without an amount. */
export interface Hinweis {
  schluessel: string;
  /** "Rechtsfrage" for the Geschäftsführung (tieout gives no legal reading), or a quantity change above 20 %. */
  art: "rechtsfrage" | "mengenaenderung_ueber_20";
  titel: string;
  text: string;
  /** Find the note belongs to, if any. */
  fundSchluessel: string | null;
  positionNr: string | null;
  /** Quantity change against the Leistungsverzeichnis in basis points (+26,3 % = 2625). */
  aenderung: number | null;
  nachweise: Nachweis[];
}

/** One possible cut by the Auftraggeber, found by the Vorprüfung. Overlaps the finds; never added to them. */
export interface Kuerzungsrisiko {
  schluessel: string;
  nr: string;
  grund: Kuerzungsgrund;
  /** Position, find or Regiebericht, for example "Z-01" or "Regiebericht 9". */
  bezug: string;
  /** Find the risk lies in ("zusätzlich verrechenbar"), or null for a line of the Entwurf. */
  fundSchluessel: string | null;
  was: string;
  detail: string;
  abhilfe: string;
  betrag: Cent;
  /** "schon gekürzt": the Auftraggeber already struck it on a Korrekturblatt; otherwise "droht". */
  zustand: "droht" | "schon_gekuerzt";
  nachweise: Nachweis[];
}
