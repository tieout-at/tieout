// Datenmodell des Zuruf-Agenten.
// Jede Angabe in einem Eintrag trägt das Zitat aus der Nachricht, die sie belegt („nicht raten“).
// Der Absender ist nur Herkunft (Rolle und interne Kennung), nie Gegenstand einer Auswertung (§ 96a ArbVG).

/** Zeitpunkt als ISO-Text, z. B. „2026-10-22T14:32:00+02:00“. */
export type Zeitpunkt = string;

export type Rolle = "monteur" | "polier" | "obermonteur" | "unbekannt";

/** Was der Absender geschickt hat. Sprache und Foto stehen in Phase 1 als Text (Transkript bzw. Bildbeschreibung). */
export type NachrichtArt = "text" | "sprache" | "foto" | "knopf";

export interface Nachricht {
  id: string;
  absenderId: string;
  zeit: Zeitpunkt;
  art: NachrichtArt;
  /** Text, Transkript der Sprachnachricht, Bildbeschreibung oder Beschriftung des gedrückten Knopfs. */
  inhalt: string;
  /** Bei art „knopf“: die Kennung des Knopfs. */
  knopfId?: string;
}

/** Eine Angabe mit Beleg: Wert plus wörtliches Zitat aus einer Nachricht des Absenders. */
export interface Angabe<T> {
  wert: T;
  zitat: string;
  nachrichtId: string;
}

export interface Menge {
  wert: number;
  einheit: string;
}

/** Ein erkannter Punkt aus einem Zuruf. Fehlende Angaben bleiben leer und gelten als offen. */
export interface Eintrag {
  projektId?: Angabe<string>;
  ort?: Angabe<string>;
  leistung?: Angabe<string>;
  menge?: Angabe<Menge>;
  personen?: Angabe<number>;
  /** Dauer der Arbeit in Stunden, so wie gesagt. Ob pro Person oder gesamt, klärt das Büro. */
  dauerStunden?: Angabe<number>;
  angewiesenVon?: Angabe<string>;
  /** Tag der Leistung als „JJJJ-MM-TT“, wenn genannt (auch „gestern“). */
  datum?: Angabe<string>;
  material?: Angabe<string>;
  /** Warum die Arbeit nötig war, so wie gesagt („weil die Küche woanders hinkommt“). Wichtig fürs Büro. */
  grund?: Angabe<string>;
}

export type Feldname = keyof Eintrag;

/** Gespeicherter Eintrag im Projektzwilling. Nur anhängen; eine Korrektur ist eine neue Version mit Verweis. */
export interface Leistungsereignis {
  id: string;
  version: number;
  ersetzt?: string;
  absenderId: string;
  rolle: Rolle;
  kanal: "simulator" | "whatsapp";
  erfasst: Zeitpunkt;
  eintrag: Eintrag;
  /** Pflicht- oder wichtige Angaben, die fehlen. Der Abrechner sieht sie auf der Liste „offen“. */
  offen: Feldname[];
  /** „bestaetigt“: Absender hat „Passt“ gedrückt. „unbestaetigt“: Gespräch abgebrochen, trotzdem abgelegt. */
  status: "bestaetigt" | "unbestaetigt" | "zurueckgezogen";
  /** Hinweise für das Büro, z. B. „Baustelle als abgeschlossen geführt“ oder „Behinderung oder Wartezeit“. */
  hinweise: string[];
  /** Alle Nachrichten, aus denen der Eintrag entstand (Quelle). */
  nachrichtIds: string[];
}

/** Ein Knopf unter einer Antwort. WhatsApp erlaubt bis zu drei Knöpfe (unbelegt, siehe PLAN.md). */
export interface Knopf {
  id: string;
  titel: string;
}

export interface Antwort {
  text: string;
  knoepfe?: Knopf[];
  /** Auswahlliste statt Knöpfen, wenn es mehr als drei Möglichkeiten gibt. */
  liste?: { titel: string; eintraege: Knopf[] };
  /** Interne Markierung für Tests und Auswertung, wird nicht gesendet. */
  zweck: Antwortzweck;
}

export type Antwortzweck =
  | "begruessung"
  | "rueckfrage"
  | "zusammenfassung"
  | "gespeichert"
  | "aendern_frage"
  | "hinweis_geld_recht"
  | "hinweis_zweck"
  | "stopp"
  | "gestoppt_hinweis"
  | "verstanden_nichts"
  | "zurueckgezogen";
