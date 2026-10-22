"use client";

// Ablage neuer Zurufe (Schalter ZURUF_ECHT an) hinter einer Schnittstelle. Heute im Browser wie die Freigaben, je
// Projekt; später Supabase (Tabelle je Firma, nur anhängen, Row Level Security) mit derselben Schnittstelle.
// Nichts wird überschrieben: jede Fassung eines Ereignisses bleibt liegen, angezeigt wird die neueste.
// Der Rechenkern sieht diese Einträge nie; die Summen der Demo ändern sich dadurch nicht.
// Dazu der Gesprächsstand des Chats (der Server merkt sich nichts) und „Demo zurücksetzen“.

import { useSyncExternalStore } from "react";
import type { Antwort, Knopf, Leistungsereignis, Nachricht } from "../../../zuruf/src/typen";
import type { NeuerZuruf } from "@/zuruf/abbildung";

export interface ZurufAblage {
  /** Aktuelle Fassung jedes Ereignisses des Projekts, ohne zurückgezogene, älteste zuerst. */
  lesen(projektId: string): readonly NeuerZuruf[];
  /** Hängt neue Ereignisse (oder neue Fassungen) an; `demoAnzahl` = Zurufe der Demo, die Nummern laufen danach weiter. */
  anhaengen(projektId: string, ereignisse: Leistungsereignis[], nachrichten: Nachricht[], demoAnzahl: number): readonly NeuerZuruf[];
}

interface Projektstand {
  ereignisse: Leistungsereignis[];
  nachrichten: Nachricht[];
  nummern: Record<string, string>;
}

/** Eine Zeile im Chat, wie sie angezeigt wird. */
export interface ChatZeile {
  von: "absender" | "agent";
  text: string;
  zeit: string;
  knoepfe?: Knopf[];
}

/**
 * Gesprächsstand, wie ihn die Route zurückgibt (SpeicherDaten in product/zuruf/src/speicher.ts). Die App liest daraus nur
 * die Nachrichten; der Rest geht unverändert zurück. Eigener Typ, damit die App nur typen.ts des Zuruf-Pakets einbindet.
 */
export interface ZurufStand {
  nachrichten: Nachricht[];
  zustaende: unknown[];
  ereignisse: Leistungsereignis[];
}

/** Antwort von POST /api/zuruf/nachricht (RoutenAntwort in product/zuruf/worker/route.ts). */
export interface ZurufRoutenAntwort {
  antworten: Antwort[];
  stand: ZurufStand;
  neu: Leistungsereignis[];
  obergrenze?: true;
}

export interface Chatstand {
  stand?: ZurufStand;
  zeilen: ChatZeile[];
}

const PRAEFIX = "sw-zuruf-v1:";
const CHAT = "sw-zuruf-chat-v1";
const LEER: readonly NeuerZuruf[] = [];
const LEERER_CHAT: Chatstand = { zeilen: [] };
const hoerer = new Set<() => void>();
const zwischen = new Map<string, { roh: string | null; wert: unknown }>();
/** Ersatz, wenn der Browser keinen Speicher erlaubt (privater Modus): gilt bis zum Neuladen. */
const ohneSpeicher = new Map<string, string>();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key.startsWith(PRAEFIX) || e.key === CHAT) hoerer.forEach((h) => h());
  });
}

function roh(schluessel: string): string | null {
  try {
    return localStorage.getItem(schluessel);
  } catch {
    return ohneSpeicher.get(schluessel) ?? null;
  }
}

/** Liest frisch und gibt bei gleichem Rohtext dieselbe Referenz zurück (für React). */
function lesenRoh<T>(schluessel: string, leer: T, umwandeln: (wert: unknown) => T): T {
  const r = roh(schluessel);
  const z = zwischen.get(schluessel);
  if (z && z.roh === r) return z.wert as T;
  let wert = leer;
  if (r) {
    try {
      wert = umwandeln(JSON.parse(r));
    } catch {
      wert = leer;
    }
  }
  zwischen.set(schluessel, { roh: r, wert });
  return wert;
}

function schreibenRoh(schluessel: string, wert: unknown | null) {
  const text = wert === null ? null : JSON.stringify(wert);
  try {
    if (text === null) localStorage.removeItem(schluessel);
    else localStorage.setItem(schluessel, text);
  } catch {
    if (text === null) ohneSpeicher.delete(schluessel);
    else ohneSpeicher.set(schluessel, text);
  }
  hoerer.forEach((h) => h());
}

function projektstand(projektId: string): Projektstand {
  return lesenRoh<Projektstand>(PRAEFIX + projektId, { ereignisse: [], nachrichten: [], nummern: {} }, (w) => w as Projektstand);
}

function aktuell(p: Projektstand): NeuerZuruf[] {
  const neueste = new Map<string, Leistungsereignis>();
  for (const e of p.ereignisse) if ((neueste.get(e.id)?.version ?? 0) < e.version) neueste.set(e.id, e);
  return [...neueste.values()]
    .filter((e) => e.status !== "zurueckgezogen")
    .map((e) => ({ nr: p.nummern[e.id] ?? "Z", ereignis: e, nachrichten: p.nachrichten.filter((m) => e.nachrichtIds.includes(m.id)) }));
}

const zwischenAktuell = new Map<string, { p: Projektstand; liste: readonly NeuerZuruf[] }>();

export const browserAblage: ZurufAblage = {
  lesen(projektId) {
    const p = projektstand(projektId);
    const z = zwischenAktuell.get(projektId);
    if (z && z.p === p) return z.liste;
    const liste = p.ereignisse.length ? aktuell(p) : LEER;
    zwischenAktuell.set(projektId, { p, liste });
    return liste;
  },
  anhaengen(projektId, ereignisse, nachrichten, demoAnzahl) {
    const p = projektstand(projektId);
    const nummern = { ...p.nummern };
    for (const e of ereignisse) nummern[e.id] ??= `Z${demoAnzahl + Object.keys(nummern).length + 1}`;
    const bekannt = new Set(p.nachrichten.map((m) => m.id));
    schreibenRoh(PRAEFIX + projektId, {
      ereignisse: [...p.ereignisse, ...ereignisse],
      nachrichten: [...p.nachrichten, ...nachrichten.filter((m) => !bekannt.has(m.id))],
      nummern,
    } satisfies Projektstand);
    return browserAblage.lesen(projektId);
  },
};

function abonnieren(h: () => void) {
  hoerer.add(h);
  return () => {
    hoerer.delete(h);
  };
}

/** Neue Zurufe eines Projekts; im Server-Rendering leer. */
export function useNeueZurufe(projektId: string, an: boolean): readonly NeuerZuruf[] {
  return useSyncExternalStore(
    abonnieren,
    () => (an ? browserAblage.lesen(projektId) : LEER),
    () => LEER,
  );
}

export function chatLesen(): Chatstand {
  return lesenRoh<Chatstand>(CHAT, LEERER_CHAT, (w) => w as Chatstand);
}

export function chatSchreiben(c: Chatstand | null) {
  schreibenRoh(CHAT, c);
}

export function useChat(): Chatstand {
  return useSyncExternalStore(abonnieren, chatLesen, () => LEERER_CHAT);
}

/** Antwort des Agenten als Chatzeile; eine Auswahlliste wird zu Knöpfen. */
export function alsZeile(a: Antwort, zeit: string): ChatZeile {
  return { von: "agent", text: a.text, zeit, knoepfe: a.knoepfe ?? a.liste?.eintraege };
}

/** Für „Demo zurücksetzen“: alle neuen Zurufe und den Chat löschen; liefert den alten Stand für Rückgängig. */
export function zurufeZuruecksetzen(): Map<string, string> {
  const vorher = new Map<string, string>();
  const schluessel = new Set([...ohneSpeicher.keys()]);
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(PRAEFIX) || k === CHAT)) schluessel.add(k);
    }
  } catch {
    // ohne Speicher gibt es nur den Ersatz
  }
  for (const k of schluessel) {
    const r = roh(k);
    if (r !== null) vorher.set(k, r);
    schreibenRoh(k, null);
  }
  return vorher;
}

export function zurufeWiederherstellen(vorher: Map<string, string>) {
  vorher.forEach((r, k) => schreibenRoh(k, JSON.parse(r)));
}
