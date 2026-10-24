// Data model of the twin (SPEZIFIKATION.md section 2). Every value read from a document is a Feld with its source
// (Beleg, page, place), its review state and its Verlauf. A correction never overwrites: the old value stays in the
// Verlauf ("korrigiert, vorher 98 Stk"). The core reads only `wert`.
// German identifiers follow the vocabulary of the specification (section 6), as in the v1 core.

import type { Bp, Cent, Datum, Einheit, Hundertstel, Zeitpunkt } from "./grundtypen";

export type { Bp, Cent, Datum, Einheit, Hundertstel, Zeitpunkt } from "./grundtypen";

// ---------- Fields with source, review state and Verlauf ----------

export interface Quelle {
  /** Id of a Beleg from the folder or of a WhatsApp-Meldung. */
  belegId: string;
  seite: number;
  /** Readable place, for example "Zeile 22.04.12B" or "Absatz 2". */
  stelle?: string;
  /** Rectangle on the page in points (x, y, width, height), for the mark in the original viewer. */
  bbox?: [number, number, number, number];
}

/** "maschinell gelesen", "bestätigt", "korrigiert". */
export type Pruefstand = "maschinell" | "bestaetigt" | "korrigiert";

export const PRUEFSTAND_TEXT: Record<Pruefstand, string> = {
  maschinell: "maschinell gelesen",
  bestaetigt: "bestätigt",
  korrigiert: "korrigiert",
};

/** One entry of the append-only Verlauf of a field: who changed what, when, and the value before. */
export interface FeldVerlauf<T> {
  zeit: Zeitpunkt;
  /** Role, never a person's name ("Abrechnung", "Bauleitung"). */
  wer: string;
  art: "bestaetigt" | "korrigiert";
  vorher: T;
  wert: T;
}

export interface Feld<T> {
  wert: T;
  quelle: Quelle;
  pruefstand: Pruefstand;
  /** Changes after the machine reading, oldest first. Empty while the field is "maschinell gelesen". */
  verlauf: FeldVerlauf<T>[];
}

export function feld<T>(wert: T, quelle: Quelle): Feld<T> {
  return { wert, quelle, pruefstand: "maschinell", verlauf: [] };
}

/** A human corrects a field: the new value applies, the old one stays in the Verlauf. Returns a new field. */
export function korrigiere<T>(f: Feld<T>, wert: T, wer: string, zeit: Zeitpunkt): Feld<T> {
  return { ...f, wert, pruefstand: "korrigiert", verlauf: [...f.verlauf, { zeit, wer, art: "korrigiert", vorher: f.wert, wert }] };
}

/** A human confirms a field as read. Returns a new field. */
export function bestaetige<T>(f: Feld<T>, wer: string, zeit: Zeitpunkt): Feld<T> {
  return { ...f, pruefstand: "bestaetigt", verlauf: [...f.verlauf, { zeit, wer, art: "bestaetigt", vorher: f.wert, wert: f.wert }] };
}

/** The value as the machine read it, before any correction. */
export function gelesenerWert<T>(f: Feld<T>): T {
  return f.verlauf.length ? f.verlauf[0].vorher : f.wert;
}

// ---------- Ihre Daten: Belege and WhatsApp-Meldungen ----------

export type BelegArt =
  | "vertrag"
  | "leistungsverzeichnis"
  | "preisbasis"
  | "aufmassblatt"
  | "regiebericht"
  | "stundenzettel"
  | "abschlagsrechnung"
  | "zahlungsavis"
  | "korrekturblatt"
  | "abzugsschreiben"
  | "entwurf"
  | "schlussrechnung"
  | "nachtrag"
  | "grosshaendlerrechnung"
  | "email"
  | "foto"
  | "fotodokumentation"
  | "plan"
  | "indexblatt";

export const BELEG_ART_TEXT: Record<BelegArt, string> = {
  vertrag: "Vertrag",
  leistungsverzeichnis: "Leistungsverzeichnis",
  preisbasis: "Preisbasis",
  aufmassblatt: "Aufmaßblatt",
  regiebericht: "Regiebericht",
  stundenzettel: "Stundenzettel",
  abschlagsrechnung: "Abschlagsrechnung",
  zahlungsavis: "Zahlungsavis",
  korrekturblatt: "Korrekturblatt",
  abzugsschreiben: "Abzugsschreiben",
  entwurf: "Entwurf",
  schlussrechnung: "Schlussrechnung",
  nachtrag: "Nachtrag",
  grosshaendlerrechnung: "Großhändlerrechnung",
  email: "E-Mail",
  foto: "Foto",
  fotodokumentation: "Fotodokumentation",
  plan: "Plan",
  indexblatt: "Indexblatt",
};

/** One file of the project folder. In stage 0 every Beleg is "aus Ordner importiert", never "verbunden". */
export interface Beleg {
  id: string;
  art: BelegArt;
  dateiname: string;
  datum: Datum;
  seiten: number;
  /** Checksum of the content; the same checksum twice is a duplicate. */
  inhaltHash: string;
}

/**
 * A WhatsApp-Meldung from the site, recorded by the agent and confirmed by the sender. An object of its own next to the
 * Belege of the folder (channel WhatsApp). The agent only records; whether something is billable is decided by humans.
 * Sources of its fields point to the id of the Meldung.
 */
export interface WhatsAppMeldung {
  id: string;
  /** Short mark, for example "W4". */
  nr: string;
  zeitpunkt: Zeitpunkt;
  /** Sender as a role only ("Monteur, Trupp 1"), never a name. */
  absender: string;
  transkript: Feld<string>;
  /** File name of the photo, or null for a voice message only. */
  foto: string | null;
  ort: Feld<string>;
  taetigkeit: Feld<string>;
  /** Who instructed the work, as the message says; recorded, never assessed. */
  angewiesenVon: Feld<string> | null;
  /** Hours named in the message, per crew ("Zwei Mann, je vier Stunden" = 1 Monteur and 1 Helfer); 0 if none. */
  stundenMonteur: Feld<Hundertstel>;
  stundenHelfer: Feld<Hundertstel>;
  bezugPositionen: Feld<string[]>;
  /** Number of the Regiebericht the message supports, or null. */
  bezugRegiebericht: Feld<string> | null;
  bestaetigt: { rolle: string; zeitpunkt: Zeitpunkt };
}

// ---------- Ebene 1: Betrieb, Auftraggeber ----------

export interface Betrieb {
  id: string;
  name: string;
  kurzname: string;
  gewerk: string;
  sitz: string;
  mitarbeiter: number;
  rollen: string[];
}

export type AuftraggeberArt = "generalunternehmer" | "oeffentlich" | "bautraeger";

export const AUFTRAGGEBER_ART_TEXT: Record<AuftraggeberArt, string> = {
  generalunternehmer: "Generalunternehmer",
  oeffentlich: "öffentlicher Auftraggeber",
  bautraeger: "Bauträger",
};

export interface Auftraggeber {
  id: string;
  name: string;
  kurzname: string;
  art: AuftraggeberArt;
}

// ---------- Projekt and Vertrag ----------

/** Stage of a project. Only "in Ausführung" and "Schlussrechnung vorbereiten" are compared (Abgleich). */
export type Projektstufe = "in_ausfuehrung" | "sr_vorbereiten" | "sr_gelegt" | "abgeschlossen";

export const PROJEKTSTUFE_TEXT: Record<Projektstufe, string> = {
  in_ausfuehrung: "in Ausführung",
  sr_vorbereiten: "Schlussrechnung vorbereiten",
  sr_gelegt: "Schlussrechnung gelegt",
  abgeschlossen: "abgeschlossen",
};

export interface Projekt {
  id: string;
  /** Short mark in lists, for example "P1". */
  kurz: string;
  /** Two-word name for the UI, for example "Wohnpark Mooshaim". */
  name: string;
  /** Full name, for example "Wohnpark Mooshaim, 32 Wohnungen und Tiefgarage, HKLS". */
  langname: string;
  auftraggeberId: string;
  stufe: Projektstufe;
  /** "Schlussrechnung legen bis" as a plain date, never a countdown. */
  schlussrechnungLegenBis: Datum | null;
  schlussrechnungGelegt: Datum | null;
  schlusszahlung: Datum | null;
  bauzeit: { von: Datum; bis: Datum } | null;
}

export type AbzugArt = "nachlass" | "baustrom_bauwasser" | "bauschadensumlage" | "deckungsruecklass" | "haftruecklass" | "skonto";

export const ABZUG_TEXT: Record<AbzugArt, string> = {
  nachlass: "Nachlass",
  baustrom_bauwasser: "Baustrom und Bauwasser",
  bauschadensumlage: "Bauschadensumlage",
  deckungsruecklass: "Deckungsrücklass",
  haftruecklass: "Haftrücklass",
  skonto: "Skonto",
};

export interface VertragsSatz {
  art: AbzugArt;
  satz: Feld<Bp>;
  /** Vertragspunkt, for example "5.1". */
  punkt: string;
  /** When the rate applies: on Abschlagsrechnungen, on the Schlussrechnung, or both. */
  phase: "abschlag" | "schluss" | "beide";
  /** Haftrücklass only: may be replaced by a bank guarantee. */
  durchBankgarantieErsetzbar?: boolean;
}

export interface Pauschale {
  /** Subject, matched against notified changes, for example "baustelleneinrichtung". */
  kategorie: string;
  punkt: string;
  text: Feld<string>;
}

/** Festpreise, or variable prices with a Preisumrechnung of the labour share (ÖNORM B 2111). */
export type Preise =
  | { art: "fest"; punkt: string; text: Feld<string> }
  | { art: "veraenderlich"; punkt: string; stichtag: Feld<Datum>; lohnanteil: Feld<Bp>; indexName: Feld<string> };

export interface Vertrag {
  belegId: string;
  datum: Feld<Datum>;
  norm: Feld<string>;
  vertragsart: Feld<string>;
  auftragssumme: Feld<Cent>;
  saetze: VertragsSatz[];
  regiesatzMonteur: Feld<Cent>;
  regiesatzHelfer: Feld<Cent>;
  regiePunkt: string;
  /** Surcharge on Regiematerial at Einstandspreis, in basis points (15 % = 1500). */
  regiematerialZuschlag: Feld<Bp>;
  regiematerialPunkt: string;
  /** Who signs Regieberichte for the Auftraggeber, as the Vertrag names it: "Polier", "örtliche Bauaufsicht". */
  regieUnterschrift: Feld<string>;
  preise: Preise;
  pauschalen: Pauschale[];
  /** "Schlussrechnung legen bis" as written in the Vertrag. */
  schlussrechnungLegenBis: Feld<Datum> | null;
}

/** Own calculation (K3 and K7). Visible only to the business and the reviewing construction professional. */
export interface Preisbasis {
  belegId: string;
  /** K3: Mittellohn plus Lohnnebenkosten, per hour. */
  mittellohnkosten: Feld<Cent>;
  /** K3: Mittellohnkosten plus Gesamtzuschlag, per hour. */
  mittellohnpreis: Feld<Cent>;
  /** Surcharge on material in the own calculation, in basis points. */
  materialzuschlag: Feld<Bp>;
  /** K7 per position: labour hours per unit and other costs per unit; for plausibility only. */
  k7: { positionNr: string; lohnHundertstel: Feld<Hundertstel>; sonstigesJeEinheit: Feld<Cent> }[];
}

// ---------- Ebene 2: Position and the project's documents ----------

/** A row of the Leistungsverzeichnis. */
export interface Position {
  /** LG.ULG.Pos + letter, for example "22.04.12B". */
  nr: Feld<string>;
  kurztext: Feld<string>;
  einheit: Feld<Einheit>;
  /** Quantity in the Leistungsverzeichnis, in hundredths. */
  menge: Feld<Hundertstel>;
  ep: Feld<Cent>;
}

export interface AufmassZeile {
  positionNr: Feld<string>;
  menge: Feld<Hundertstel>;
  ort: Feld<string>;
}

export interface Aufmassblatt {
  /** Number as the business counts, "12" for "Aufmaßblatt 12". */
  nr: string;
  belegId: string;
  datum: Feld<Datum>;
  leistungVon: Feld<Datum>;
  leistungBis: Feld<Datum>;
  /** Countersigned by the Auftraggeber. */
  gegengezeichnet: Feld<boolean>;
  gegengezeichnetAm: Feld<Datum> | null;
  /** Day the sheet was entered into the AVA; null if never (an Excel file, or not countersigned). */
  erfasstAm: Datum | null;
  /** Beleg the measurement is based on, for example the Fotodokumentation Brandschutz. */
  grundlageBelegId: string | null;
  zeilen: AufmassZeile[];
}

export interface Regiebericht {
  /** "9" for "Regiebericht 9". */
  nr: string;
  belegId: string;
  /** Date of the document. */
  datum: Feld<Datum>;
  /** Days the work was done; the rule for ongoing projects uses the last one, never the document date. */
  arbeitstage: Feld<Datum[]>;
  taetigkeit: Feld<string>;
  angewiesenVon: Feld<string> | null;
  stundenMonteur: Feld<Hundertstel>;
  stundenHelfer: Feld<Hundertstel>;
  /** Material at Einstandspreis; the surcharge of the Vertrag is added in `kern/`. */
  material: Feld<Cent>;
  unterschrieben: Feld<boolean>;
  unterschriebenAm: Feld<Datum> | null;
  /** WhatsApp-Meldung the report was written from, or null. */
  ausMeldung: string | null;
}

/** Internal hours per crew and week, booked to Regieberichte. Read only as a sum per crew and week. */
export interface Stundenzettel {
  belegId: string;
  von: Feld<Datum>;
  bis: Feld<Datum>;
  trupp: string;
  eintraege: { regieberichtNr: Feld<string>; stundenMonteur: Feld<Hundertstel>; stundenHelfer: Feld<Hundertstel> }[];
}

export type RechnungsZeile =
  | { typ: "position"; positionNr: Feld<string>; menge: Feld<Hundertstel>; ep: Feld<Cent>; betrag: Feld<Cent> }
  | {
      typ: "zusatz";
      /** Number of a position outside the Leistungsverzeichnis, for example "Z-01". */
      positionNr: Feld<string>;
      text: Feld<string>;
      einheit: Feld<Einheit>;
      menge: Feld<Hundertstel>;
      ep: Feld<Cent>;
      betrag: Feld<Cent>;
    }
  | { typ: "regie"; regieberichtNr: Feld<string>; betrag: Feld<Cent> }
  | { typ: "preisumrechnung"; betrag: Feld<Cent> };

export interface Rechnung {
  /** "Abschlagsrechnung 3", "Entwurf", "Schlussrechnung". */
  nr: Feld<string>;
  belegId: string;
  art: "abschlag" | "entwurf" | "schluss";
  datum: Feld<Datum>;
  /** The lines the document lists. A Schlussrechnung of a closed project may list only the lines that matter. */
  zeilen: RechnungsZeile[];
  /** Total as printed on the document. */
  summe: Feld<Cent>;
}

/** A line of the breakdown on a Zahlungsavis: what the Auftraggeber deducts from the invoice. */
export interface ZahlungsAbzug {
  art: AbzugArt | "kuerzung" | "abschlagszahlungen";
  betrag: Feld<Cent>;
  satz: Feld<Bp> | null;
}

export interface Zahlung {
  belegId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  /** Amount actually paid. */
  betrag: Feld<Cent>;
  abzuege: ZahlungsAbzug[];
}

/**
 * Fixed reason of a cut or a deduction. The same key in Vorprüfung, Rechnungsabschluss and Auftraggeber history, so that
 * matching goes by the key, never by the text.
 */
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
  ausserhalb_lv_kein_nachtrag: "Außerhalb des Leistungsverzeichnisses, kein Nachtrag gefunden",
  regie_nicht_unterschrieben: "Regie nicht unterschrieben",
  menge_ohne_aufmass: "Menge ohne Aufmaß-Nachweis",
  abzug_ohne_vertragspunkt: "Abzug ohne Vertragspunkt",
};

export interface Korrekturzeile {
  /** Position, additional position or Regiebericht, for example "22.04.10A", "Z-01", "Regiebericht 9". */
  positionNr: Feld<string>;
  kuerzung: Feld<Cent>;
  grund: Feld<Kuerzungsgrund>;
  /** Reason as worded on the Korrekturblatt. */
  text: Feld<string>;
}

export interface Korrekturblatt {
  belegId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  zeilen: Korrekturzeile[];
}

/** The Auftraggeber's letter announcing deductions on every invoice. */
export interface Abzugsschreiben {
  belegId: string;
  datum: Feld<Datum>;
  abzuege: { art: AbzugArt; satz: Feld<Bp> }[];
}

export interface PlanVermerk {
  typ: "stand" | "aenderung";
  positionNr: Feld<string>;
  text: Feld<string>;
}

export interface Plan {
  belegId: string;
  planNr: Feld<string>;
  index: Feld<string>;
  datum: Feld<Datum>;
  titel: Feld<string>;
  /** What changed against the previous index; null for the first index in the folder. */
  aenderung: Feld<string> | null;
  vermerke: PlanVermerk[];
}

export type EmailKategorie = "anweisung" | "anmeldung" | "termin" | "sonstiges";

export const EMAIL_KATEGORIE_TEXT: Record<EmailKategorie, string> = {
  anweisung: "Anweisung",
  anmeldung: "Anmeldung",
  termin: "Termin",
  sonstiges: "Sonstiges",
};

export interface Email {
  belegId: string;
  datum: Feld<Datum>;
  /** Sender as a role, for example "Bauleitung Hornfeld Bau". */
  absender: Feld<string>;
  /** Whether the Auftraggeber or the own business wrote it. */
  von: "auftraggeber" | "betrieb";
  betreff: Feld<string>;
  kategorie: Feld<EmailKategorie>;
  /** The sentence that matters, verbatim. */
  zitat: Feld<string> | null;
  bezugPositionen: Feld<string[]>;
  /** "Termin" only: the Auftraggeber changes the schedule (the app shows a "Rechtsfrage", never a legal reading). */
  aendertBauzeit: boolean;
  /** "Anmeldung" only: a change notified with Mehrkosten, and the own estimate of it. */
  anmeldung: {
    gegenstand: Feld<string>;
    /** Subject, matched against the Pauschalen of the Vertrag. */
    kategorie: string;
    /** E-mail of the Auftraggeber that instructed the change. */
    anweisungBelegId: string | null;
    stunden: Feld<Hundertstel>;
    /** Material at Einstandspreis. */
    material: Feld<Cent>;
    /** A priced Nachtrag was submitted. */
    nachtragGelegt: Feld<boolean>;
  } | null;
}

export interface Foto {
  belegId: string;
  zeitpunkt: Feld<Zeitpunkt>;
  ort: Feld<string>;
  motiv: Feld<string>;
  bezugPositionen: Feld<string[]>;
}

/** A photo documentation (PDF) that counts items, for example 142 Abschottungen with label. */
export interface Fotodokumentation {
  belegId: string;
  datum: Feld<Datum>;
  titel: Feld<string>;
  positionNr: Feld<string>;
  menge: Feld<Hundertstel>;
}

/** Wholesaler invoice for the material of a Regiebericht, at Einstandspreis. */
export interface Grosshaendlerrechnung {
  belegId: string;
  datum: Feld<Datum>;
  regieberichtNr: Feld<string>;
  betrag: Feld<Cent>;
}

/** A Nachtrag offered to the Auftraggeber and whether it was accepted. */
export interface Nachtrag {
  belegId: string;
  /** "N1", or the number of the additional position it covers. */
  nr: Feld<string>;
  titel: Feld<string>;
  betrag: Feld<Cent>;
  beauftragt: Feld<boolean>;
}

/** Labour index for the Preisumrechnung; values × 100 (125,00 = 12500). */
export interface Indexblatt {
  belegId: string;
  name: Feld<string>;
  basis: Feld<number>;
  aktuell: Feld<number>;
  stand: Feld<Datum>;
}

// ---------- The twin ----------

/** Everything about one project, every field with its source. */
export interface Datensatz {
  projekt: Projekt;
  vertrag: Vertrag;
  preisbasis: Preisbasis | null;
  belege: Beleg[];
  positionen: Position[];
  aufmass: Aufmassblatt[];
  regie: Regiebericht[];
  stundenzettel: Stundenzettel[];
  abschlaege: Rechnung[];
  /** Own Entwurf of the Schlussrechnung; null while the project is "in Ausführung". */
  entwurf: Rechnung | null;
  /** Schlussrechnung submitted to the Auftraggeber; null until it is submitted. */
  schlussrechnung: Rechnung | null;
  zahlungen: Zahlung[];
  korrekturblaetter: Korrekturblatt[];
  abzugsschreiben: Abzugsschreiben | null;
  nachtraege: Nachtrag[];
  plaene: Plan[];
  emails: Email[];
  fotos: Foto[];
  fotodokumentationen: Fotodokumentation[];
  grosshaendlerrechnungen: Grosshaendlerrechnung[];
  indexblatt: Indexblatt | null;
  meldungen: WhatsAppMeldung[];
}

/** The business twin: Betrieb, Auftraggeber and every project. One data silo per business. */
export interface Firmendaten {
  /** Synthetic sample data: every screen then carries the mark "Beispieldaten". */
  beispieldaten: boolean;
  betrieb: Betrieb;
  auftraggeber: Auftraggeber[];
  projekte: Datensatz[];
  /** "Today" of the demo; status colours always use this day. */
  stichtag: Datum;
}

// ---------- Decisions (humans, outside the documents) ----------

/** "Gefunden" → "Geprüft" → "Freigegeben" → "In der Schlussrechnung", or "Nicht verrechnen" with a reason. */
export type Entscheidungsstand = "gefunden" | "geprueft" | "freigegeben" | "in_schlussrechnung" | "nicht_verrechnen";

export const ENTSCHEIDUNG_TEXT: Record<Entscheidungsstand, string> = {
  gefunden: "Gefunden",
  geprueft: "Geprüft",
  freigegeben: "Freigegeben",
  in_schlussrechnung: "In der Schlussrechnung",
  nicht_verrechnen: "Nicht verrechnen",
};

/** One decision on a find. Decisions are append only; the latest entry per find counts. */
export interface Entscheidung {
  fundSchluessel: string;
  zeit: Zeitpunkt;
  /** Role: "Abrechnung" checks, "Geschäftsführung" releases. */
  wer: string;
  stand: Exclude<Entscheidungsstand, "gefunden">;
  grund?: string;
}

/** Current decision per find: the latest entry, "Gefunden" without any. */
export function entscheidungsstand(entscheidungen: readonly Entscheidung[], fundSchluessel: string): Entscheidungsstand {
  let stand: Entscheidungsstand = "gefunden";
  let zeit = "";
  for (const e of entscheidungen) if (e.fundSchluessel === fundSchluessel && e.zeit >= zeit) [stand, zeit] = [e.stand, e.zeit];
  return stand;
}
