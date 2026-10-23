// Datenmodell „Datensatz mit Quelle“.
// Jedes Feld, das aus einem Dokument stammt, ist ein Feld<T> mit Quelle (Datei, Seite, Stelle).
// Diese Schicht befüllt später die KI; der Rechenkern (src/engine) liest nur sie.
// Beträge sind immer ganze Cent, Prozentsätze immer Basispunkte (1 % = 100 bp).

export type Cent = number;
export type Bp = number;
/** Datum als ISO-Text „JJJJ-MM-TT“. */
export type Datum = string;

export interface Quelle {
  /** Kennung eines Ordner-Dokuments oder eines Zurufs (beides sind Belege). */
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
  /**
   * Maschinell gelesener Wert vor der Korrektur (nur bei korrigiert = true). Der Zwilling überschreibt nichts:
   * der alte Wert bleibt sichtbar. Der Rechenkern liest ihn nie.
   */
  vorher?: T;
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

// ---------- Ordner und Kanäle ----------

/** Wie ein Beleg in den Zwilling kam: Ordner (Einspielen), WhatsApp (Zurufen), später Anbindung (ERP, Mail). */
export type Kanal = "ordner" | "whatsapp" | "anbindung";

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
  | "schlussrechnung"
  | "nachtrag"
  | "indexblatt"
  | "mail"
  | "foto"
  | "plan"
  | "gu_abzug"
  | "gu_korrektur";

export interface Dokument {
  id: string;
  art: DokumentArt;
  kanal: Kanal;
  dateiname: string;
  datum: Datum;
  seiten: number;
  /** Prüfsumme des Inhalts; gleiche Prüfsumme = Duplikat. */
  inhaltHash: string;
}

// ---------- Firma, Auftraggeber, Projekt ----------

export interface Firma {
  id: string;
  name: string;
  gewerk: string;
  sitz: string;
}

export type AuftraggeberArt = "gu" | "oeffentlich" | "bautraeger";

export interface Auftraggeber {
  id: string;
  name: string;
  art: AuftraggeberArt;
}

/** Wo ein Projekt steht. Nur „in Ausführung“ und „Schlussrechnung vorbereiten“ werden abgeglichen. */
export type ProjektStatus = "in_ausfuehrung" | "sr_vorbereiten" | "sr_gelegt" | "abgeschlossen";

export interface Projekt {
  id: string;
  /** Kurzzeichen in Listen, z. B. „W21“. */
  kurz: string;
  name: string;
  los: string;
  auftraggeberId: string;
  status: ProjektStatus;
  /** Schlussrechnung legen bis (reines Datum, kein Countdown). */
  schlussrechnungLegenBis: Datum | null;
  schlussrechnungGelegt: Datum | null;
  schlusszahlung: Datum | null;
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
  /** „schluss“ = an den Auftraggeber gelegte Schlussrechnung, „schluss_entwurf“ = eigener Entwurf davor. */
  art: "abschlag" | "schluss_entwurf" | "schluss";
  datum: Feld<Datum>;
  zeilen: RechnungsZeile[];
  /** Summe wie auf dem Dokument gedruckt. */
  summe: Feld<Cent>;
}

/**
 * Eine Zeile der Aufschlüsselung auf dem Zahlungsavis: was der Auftraggeber von der Rechnung abzieht.
 * „kuerzung“ = gestrichene Positionen laut Korrekturblatt, „abschlagszahlungen“ = schon bezahlte Abschläge
 * (nur bei der Schlusszahlung), sonst ein Satz wie im Vertrag.
 */
export interface ZahlungsAbzug {
  art: AbzugArt | "kuerzung" | "abschlagszahlungen";
  betrag: Feld<Cent>;
  /** Satz, wie ihn das Avis nennt (nur bei Sätzen wie Nachlass oder Rücklass). */
  satz?: Feld<Bp>;
}

export interface Zahlung {
  dokumentId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  betrag: Feld<Cent>;
  /** Aufschlüsselung vom Rechnungsbetrag zum Zahlbetrag; leer, wenn das Avis nur den Zahlbetrag nennt. */
  abzuege: ZahlungsAbzug[];
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
  /** Text der Mail; das Zitat ist ein Ausschnitt daraus. */
  text: Feld<string> | null;
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
    /** Wie die Mail die Kosten neben dem Lohn nennt, z. B. „Kran“; ohne Angabe „Material“. */
    sachkosten: Feld<string> | null;
    bepreist: Feld<boolean>;
  } | null;
}

export interface Foto {
  dokumentId: string;
  exifDatum: Feld<string>;
  /** Was das Foto zeigt. */
  motiv: Feld<string>;
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

/**
 * Fester Grund einer Kürzung oder eines Abzugs. Derselbe Schlüssel in Vorprüfung, Kaskade und GU-Historie,
 * damit der Abgleich über den Schlüssel geht, nie über den Text.
 */
export type Kuerzungsgrund =
  | "aufmass_nicht_gegengezeichnet"
  | "stunden_weichen_ab"
  | "rechenfehler"
  | "ausserhalb_lv_kein_nachtrag"
  | "regie_nicht_unterschrieben"
  | "menge_ohne_aufmass"
  | "abzug_ohne_vertragspunkt";

export interface Korrekturzeile {
  /** LV-Position, Zusatzposition oder Regiebericht, z. B. „22.04.10A“, „Z-01“, „RB-09“. */
  positionNr: Feld<string>;
  kuerzung: Feld<Cent>;
  /** Grund als fester Schlüssel, vom Agenten aus dem Wortlaut zugeordnet. */
  grund: Feld<Kuerzungsgrund>;
  /** Grund im Wortlaut des Korrekturblatts, z. B. „nicht beauftragt“. */
  text: Feld<string>;
}

export interface Korrekturblatt {
  dokumentId: string;
  rechnungNr: Feld<string>;
  datum: Feld<Datum>;
  zeilen: Korrekturzeile[];
}

/** Nachtragsangebot an den Auftraggeber und ob er es beauftragt hat. */
export interface Nachtrag {
  /** Kennung, zugleich Position in der Rechnung, z. B. „N1“ oder „Z-01“. */
  positionNr: Feld<string>;
  titel: Feld<string>;
  betrag: Feld<Cent>;
  beauftragt: Feld<boolean>;
  dokumentId: string;
}

// ---------- Zurufe (WhatsApp) ----------

/**
 * Ein Zuruf: Foto und Sprachnachricht von der Baustelle, vom Agenten als Text erfasst und vom Absender bestätigt.
 * Eigener Beleg neben den Ordner-Dokumenten. Der Agent erfasst nur; ob etwas abrechenbar ist, entscheidet der Mensch.
 * Quellen der Felder zeigen auf die Kennung des Zurufs.
 */
export interface Zuruf {
  id: string;
  /** Kurzzeichen, z. B. „Z6“. */
  nr: string;
  kanal: "whatsapp";
  /** Zeitpunkt aus dem Nachrichtenzeitstempel, „JJJJ-MM-TTThh:mm“. */
  zeitpunkt: string;
  /** Absender nur als Rolle, nie mit Namen (§ 96a ArbVG). */
  absender: string;
  transkript: Feld<string>;
  /** Dateiname des Fotos oder null, wenn nur eine Sprachnachricht kam. */
  foto: string | null;
  ort: Feld<string>;
  taetigkeit: Feld<string>;
  /** Genannte Stunden in Hundertstel; 0, wenn der Zuruf keine nennt. */
  stundenMonteur: Feld<number>;
  stundenHelfer: Feld<number>;
  /** Wer laut Zuruf angewiesen hat; nur erfasst, nicht gewürdigt. */
  angewiesenVon: Feld<string> | null;
  bezugPositionen: Feld<string[]>;
  /** Regiebericht, den der Zuruf stützt, oder null. */
  bezugRegie: Feld<string> | null;
  /** Bestätigung durch den Absender („Ja“ im Chat). */
  bestaetigt: { von: string; zeitpunkt: string };
}

// ---------- Gesamter Datensatz ----------

/** Der Projektzwilling: alles zu einem Projekt, jedes Feld mit Quelle. */
export interface Datensatz {
  projekt: Projekt;
  vertrag: Vertrag;
  dokumente: Dokument[];
  lv: LvPosition[];
  aufmass: Aufmassblatt[];
  regie: Regiebericht[];
  stundenlisten: Stundenliste[];
  abschlaege: Rechnung[];
  /** Eigener Schlussrechnungs-Entwurf; null, solange das Projekt in Ausführung ist. */
  entwurf: Rechnung | null;
  /** An den Auftraggeber gelegte Schlussrechnung (art „schluss“); null, solange sie nicht gelegt ist. */
  schlussrechnung: Rechnung | null;
  zahlungen: Zahlung[];
  plaene: Plan[];
  mails: Mail[];
  fotos: Foto[];
  indexblatt: Indexblatt | null;
  guAbzug: GuAbzugsschreiben | null;
  korrekturblaetter: Korrekturblatt[];
  nachtraege: Nachtrag[];
  zurufe: Zuruf[];
}

/** Der Firmenzwilling: Firma, Auftraggeber und alle Projekte. Ein Datensilo pro Firma. */
export interface Firmendaten {
  /** Synthetische Demo-Daten: jede Seite trägt dann die Marke „Synthetisch“. */
  synthetisch: boolean;
  firma: Firma;
  auftraggeber: Auftraggeber[];
  projekte: Datensatz[];
  /** „Heute“ der Demo; Ampel und Status rechnen immer mit diesem Tag. */
  stichtag: Datum;
}
