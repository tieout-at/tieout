// Ablage: Eingang (jede Nachricht roh), Leistungsereignisse (nur anhängen) und Gesprächszustand pro Absender.
// Phase 1: im Speicher, wahlweise zusätzlich als JSONL-Dateien. Datenbank kommt mit der Integration.

import { appendFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import type { Eintrag, Leistungsereignis, Nachricht, Rolle } from "./typen.ts";
import type { Art, UnklarFeld } from "./verstehen.ts";

export type Frage = "projekt" | "abgeschlossen" | "leistung" | `unklar:${string}` | "anweiser" | "aufwand";

export interface PunktZustand {
  eintrag: Eintrag;
  projektKandidaten: string[];
  art: Art;
  unklar: UnklarFeld[];
}

export interface Entwurf {
  nachrichten: Nachricht[];
  punkte: PunktZustand[];
  gestellt: Frage[];
  phase: "sammeln" | "warte_antwort" | "warte_bestaetigung" | "warte_aenderung";
  /** Korrektur nach dem Speichern: pro Punkt die Id des gespeicherten Ereignisses, das er ersetzt. */
  ersetzt?: (string | undefined)[];
  /** Absender war ungeduldig: keine weitere Rückfrage, gleich zusammenfassen. */
  keineFragenMehr?: boolean;
  /** Angekündigte Anzahl Punkte („drei Sachen“). Bis sie da sind, nur kurz quittieren. */
  angekuendigt?: number;
  /** Absender hat „Weiß nicht“ oder „Keiner extra“ gedrückt. */
  anweiserBeantwortet?: boolean;
  /** Absender hat ein abgeschlossenes Projekt bestätigt. */
  abgeschlossenBestaetigt?: boolean;
}

export interface Zustand {
  absenderId: string;
  rolle: Rolle;
  einwilligung: "offen" | "erteilt" | "abgelehnt" | "gestoppt";
  begruesst: boolean;
  wartend: Nachricht[];
  entwurf?: Entwurf;
  verlauf: { von: "absender" | "agent"; text: string }[];
  letzteGespeicherte: string[];
  /** Zweck der letzten Antwort, damit sich nichts wortgleich wiederholt. */
  letzterZweck?: string;
  /** Nach der Begrüßung höchstens einmal nachfragen, nie drängen. */
  einwilligungErinnert?: boolean;
  /** Zeitpunkte der Rückfragen: Die Grenze gilt pro Absender in einem Zeitfenster, nicht pro Entwurf. */
  rueckfragen: string[];
}

export interface Speicher {
  eingang(n: Nachricht): boolean;
  zustand(absenderId: string, rolle: Rolle): Zustand;
  ablegen(e: Leistungsereignis): void;
  ereignisse(): Leistungsereignis[];
  ereignis(id: string): Leistungsereignis | undefined;
  nachricht(id: string): Nachricht | undefined;
}

export class Arbeitsspeicher implements Speicher {
  private gesehen = new Map<string, Nachricht>();
  private zustaende = new Map<string, Zustand>();
  private liste: Leistungsereignis[] = [];

  /** ordner: wenn gesetzt, wird zusätzlich in JSONL-Dateien geschrieben (eingang.jsonl, ereignisse.jsonl). */
  constructor(private ordner?: string) {
    if (ordner) mkdirSync(ordner, { recursive: true });
  }

  private schreibe(datei: string, objekt: unknown) {
    if (this.ordner) appendFileSync(path.join(this.ordner, datei), JSON.stringify(objekt) + "\n");
  }

  /** false, wenn die Nachricht schon da war (WhatsApp liefert manchmal doppelt). */
  eingang(n: Nachricht): boolean {
    if (this.gesehen.has(n.id)) return false;
    this.gesehen.set(n.id, n);
    this.schreibe("eingang.jsonl", n);
    return true;
  }

  zustand(absenderId: string, rolle: Rolle): Zustand {
    let z = this.zustaende.get(absenderId);
    if (!z) {
      z = { absenderId, rolle, einwilligung: "offen", begruesst: false, wartend: [], verlauf: [], letzteGespeicherte: [], rueckfragen: [] };
      this.zustaende.set(absenderId, z);
    }
    return z;
  }

  setzeEinwilligung(absenderId: string, rolle: Rolle) {
    this.zustand(absenderId, rolle).einwilligung = "erteilt";
  }

  ablegen(e: Leistungsereignis): void {
    this.liste.push(e);
    this.schreibe("ereignisse.jsonl", e);
  }

  ereignisse(): Leistungsereignis[] {
    return [...this.liste];
  }

  ereignis(id: string): Leistungsereignis | undefined {
    return [...this.liste].reverse().find((e) => e.id === id);
  }

  nachricht(id: string): Nachricht | undefined {
    return this.gesehen.get(id);
  }

  alleZustaende(): Zustand[] {
    return [...this.zustaende.values()];
  }
}

/** Aktueller Stand: pro Ereignis-Id die höchste Version. Zurückgezogene bleiben sichtbar mit Status. */
export function aktuellerStand(liste: Leistungsereignis[]): Leistungsereignis[] {
  const neueste = new Map<string, Leistungsereignis>();
  for (const e of liste) {
    const alt = neueste.get(e.id);
    if (!alt || e.version > alt.version) neueste.set(e.id, e);
  }
  return [...neueste.values()];
}
