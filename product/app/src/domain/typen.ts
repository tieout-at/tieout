// Datenmodell „Datensatz mit Quelle“.
// Jedes Feld, das aus einem Dokument stammt, ist ein Feld<T> mit Quelle (Datei, Seite, Stelle).
// Diese Schicht befüllt später die KI; der Rechenkern (src/engine) liest nur sie.
// Beträge sind immer ganze Cent, Prozentsätze immer Basispunkte (1 % = 100 bp).

export type Cent = number;
export type Bp = number;
/** Datum als ISO-Text „JJJJ-MM-TT“. */
export type Datum = string;

export interface Quelle {
  dokumentId: string;
  seite: number;
  /** Lesbare Stelle, z. B. „Zeile 22.04.12B“ oder „Absatz 2“. */
  stelle?: string;
  /** Rechteck auf der Seite in Punkten (x, y, Breite, Höhe), für die Markierung im Betrachter. */
  bbox?: [number, number, number, number];
}

/** Prüfstand eines Feldes oder Befunds: maschinell gelesen, vom Menschen bestätigt, blockiert (nicht verwenden). */
export type Pruefstand = "maschinell" | "bestaetigt" | "blockiert";

export interface Feld<T> {
  wert: T;
  quelle: Quelle;
  /** Fehlt = „maschinell“. */
  pruefstand?: Pruefstand;
  /** Wert wurde beim Einlesen von Hand korrigiert. */
  korrigiert?: boolean;
}

/** Ein Schritt der zweistufigen Freigabe: wer und wann. */
export interface FreigabeSchritt {
  name: string;
  zeit: string;
}

/** Freigabe eines Befunds: übernommen (Prüfer M), dann freigegeben (Insider I). Lebt außerhalb des Datensatzes. */
export interface Freigabe {
  befundSchluessel: string;
  entscheidung: "uebernehmen" | "verwerfen" | "anwalt";
  uebernommen: FreigabeSchritt | null;
  freigegeben: FreigabeSchritt | null;
}

// ---------- Ordner ----------

export type DokumentArt =
  | "vertrag"
  | "lv"
  | "k7"
  | "aufmass"
  | "regie"
  | "stundenliste"
  | "abschlag"
  | "zahlung"
  | "sr_entwurf"
  | "indexblatt"
  | "mail"
  | "foto"
  | "plan"
  | "gu_abzug"
  | "gu_korrektur";

export interface Dokument {
  id: string;
  art: DokumentArt;
  dateiname: string;
  datum: Datum;
  seiten: number;
  /** Prüfsumme des Inhalts; gleiche Prüfsumme = Duplikat. */
  inhaltHash: string;
}

// ---------- Projekt und Vertrag ----------

export interface Projekt {
  id: string;
  name: string;
  los: string;
  auftragnehmer: string;
  auftraggeber: string;
  /** Fälligkeit der Schlussrechnung (fester Wert, kein Countdown). */
  schlussrechnungFaellig: Datum;
}

export type AbzugArt = "nachlass" | "baustrom_bauwasser" | "bauschadensumlage" | "deckungsruecklass" | "haftruecklass";

export interface VertragsSatz {
  art: AbzugArt;
  satz: Feld<Bp>;
  /** Vertragspunkt, z. B. „5.1“. */
  punkt: string;
  /** Wann der Satz greift: bei Abschlägen oder bei der Schlussrechnung. */
  phase: "abschlag" | "schluss" | "beide";
}

export interface Pauschale {
  kategorie: Feld<string>;
  punkt: string;
  text: Feld<string>;
}

export interface Preisgleitung {
  punkt: string;
  /** Leistungen ab diesem Tag werden umgerechnet. */
  stichtag: Feld<Datum>;
  /** Lohnanteil am Leistungsbetrag laut Vertrag. */
  lohnanteil: Feld<Bp>;
  indexName: Feld<string>;
}

export interface Vertrag {
  datum: Feld<Datum>;
  norm: Feld<string>;
  auftragssumme: Feld<Cent>;
  regiesatzMonteur: Feld<Cent>;
  regiesatzHelfer: Feld<Cent>;
  /** Mittellohnpreis der eigenen Kalkulation (K3), je Stunde. */
  mittellohnpreis: Feld<Cent>;
  saetze: VertragsSatz[];
  preisgleitung: Preisgleitung | null;
  pauschalen: Pauschale[];
}

// ---------- LV und K7 ----------

export type Einheit = "Stk" | "m" | "m²" | "psch" | "h";

/** K7-Preisaufgliederung. Dient nur der Plausibilität; abgerechnet wird immer mit dem EP laut LV. */
export interface K7 {
  /** Lohnstunden je Einheit in Hundertstel Stunden (1,30 h = 130). */
  lohnHundertstel: Feld<number>;
  sonstigesJeEinheit: Feld<Cent>;
}

export interface LvPosition {
  /** Positionsnummer LG.ULG.Pos+Buchstabe, z. B. „22.04.12B“. */
  nr: Feld<string>;
  kurztext: Feld<string>;
  einheit: Feld<Einheit>;
  /** LV-Menge in Hundertstel der Einheit (86 Stk = 8600). */
  menge: Feld<number>;
  ep: Feld<Cent>;
  k7: K7 | null;
}

// ---------- Aufmaß, Regie, Stunden ----------

export interface AufmassZeile {
  positionNr: Feld<string>;
  /** Menge in Hundertstel der Einheit. */
  menge: Feld<number>;
  ort: Feld<string>;
}

export interface Aufmassblatt {
  nr: string;
  dokumentId: string;
  datum: Feld<Datum>;
  leistungVon: Feld<Datum>;
  leistungBis: Feld<Datum>;
  unterschriftAN: Feld<boolean>;
  unterschriftAG: Feld<boolean>;
  zeilen: AufmassZeile[];
}

export interface Regiebericht {
  nr: Feld<string>;
  dokumentId: string;
  datum: Feld<Datum>;
  taetigkeit: Feld<string>;
  /** Stunden in Hundertstel (24 h = 2400). */
  stundenMonteur: Feld<number>;
  stundenHelfer: Feld<number>;
  material: Feld<Cent>;
  unterschriftAG: Feld<boolean>;
}

/** Eintrag einer Stundenliste; Stunden in Hundertstel. */
export interface StundenEintrag {
  regieNr: Feld<string>;
  stundenMonteur: Feld<number>;
  stundenHelfer: Feld<number>;
}

export interface Stundenliste {
  dokumentId: string;
  von: Feld<Datum>;
  bis: Feld<Datum>;
  eintraege: StundenEintrag[];
}

// ---------- Rechnungen und Zahlungen ----------

export type RechnungsZeile =
  | {
      typ: "lv";
      positionNr: Feld<string>;
      menge: Feld<number>;
      ep: Feld<Cent>;
      betrag: Feld<Cent>;
      /** Pauschale nach Leistungsstand: Betrag statt Menge × EP. */
      teilleistung?: boolean;
    }
  | { typ: "regie"; regieNr: Feld<string>; betrag: Feld<Cent> }
  | {
      typ: "zusatz";
      positionNr: Feld<string>;
      text: Feld<string>;
      menge: Feld<number>;
      ep: Feld<Cent>;
      betrag: Feld<Cent>;
    }
  | { typ: "preisgleitung"; betrag: Feld<Cent> };

export interface Rechnung {
  nr: Feld<string>;
  dokumentId: string;
  art: "abschlag" | "schluss_entwurf";
  datum: Feld<Datum>;
  zeilen: RechnungsZeile[];
  /** Summe wie auf dem Dokument gedruckt. */
  summe: Feld<Cent>;
}

export interface Zahlung {
  dokumentId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  betrag: Feld<Cent>;
}

// ---------- Pläne, Mails, Fotos ----------

/** Vermerk auf einem Plan zu einer LV-Position: Stand oder Änderung (Änderungswolke). */
export interface PlanVermerk {
  typ: "stand" | "aenderung";
  positionNr: Feld<string>;
  text: Feld<string>;
}

export interface Plan {
  dokumentId: string;
  planNr: Feld<string>;
  index: Feld<string>;
  datum: Feld<Datum>;
  titel: Feld<string>;
  vermerke: PlanVermerk[];
}

export type MailKategorie = "anweisung" | "anmeldung" | "terminaenderung" | "behinderung" | "sonstiges";

export interface Mail {
  dokumentId: string;
  datum: Feld<Datum>;
  von: Feld<string>;
  an: Feld<string>;
  betreff: Feld<string>;
  kategorie: Feld<MailKategorie>;
  /** Wörtliche Kernstelle, z. B. die Anweisung. */
  zitat: Feld<string> | null;
  bezugPositionen: Feld<string[]>;
  bezugPlanIndex: Feld<string> | null;
  /** Nur bei Mehrkosten-Anmeldungen: Gegenstand und eigene Aufwandsschätzung (Stunden in Hundertstel). */
  anmeldung: {
    gegenstand: Feld<string>;
    /** Sachgebiet, wird mit den Pauschalen des Vertrags abgeglichen, z. B. „baustelleneinrichtung“. */
    kategorie: Feld<string>;
    stunden: Feld<number>;
    material: Feld<Cent>;
    bepreist: Feld<boolean>;
  } | null;
}

export interface Foto {
  dokumentId: string;
  exifDatum: Feld<string>;
  ort: Feld<string>;
  bezugPositionen: Feld<string[]>;
}

// ---------- Index, GU-Schreiben ----------

export interface Indexblatt {
  dokumentId: string;
  name: Feld<string>;
  /** Indexwerte × 100 (125,00 = 12500). */
  basis: Feld<number>;
  aktuell: Feld<number>;
  stand: Feld<Datum>;
}

export interface GuAbzug {
  art: AbzugArt;
  satz: Feld<Bp>;
}

export interface GuAbzugsschreiben {
  dokumentId: string;
  datum: Feld<Datum>;
  abzuege: GuAbzug[];
}

export interface Korrekturzeile {
  positionNr: Feld<string>;
  kuerzung: Feld<Cent>;
  grund: Feld<string>;
}

export interface Korrekturblatt {
  dokumentId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  zeilen: Korrekturzeile[];
}

export interface Nachtrag {
  positionNr: Feld<string>;
  beauftragt: Feld<boolean>;
}

// ---------- Gesamter Datensatz ----------

export interface Datensatz {
  projekt: Projekt;
  vertrag: Vertrag;
  dokumente: Dokument[];
  lv: LvPosition[];
  aufmass: Aufmassblatt[];
  regie: Regiebericht[];
  stundenlisten: Stundenliste[];
  abschlaege: Rechnung[];
  entwurf: Rechnung;
  zahlungen: Zahlung[];
  plaene: Plan[];
  mails: Mail[];
  fotos: Foto[];
  indexblatt: Indexblatt | null;
  guAbzug: GuAbzugsschreiben | null;
  korrekturblaetter: Korrekturblatt[];
  nachtraege: Nachtrag[];
}
