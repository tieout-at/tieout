"use client";

// Speicher des Freigabe-Verlaufs im Browser (MVP), je Projekt. „Demo zurücksetzen“ leert ihn.
// Jeder Lese- und Schreibzugriff geht frisch an den localStorage, damit mehrere Tabs sich nichts überschreiben;
// der Zwischenspeicher hängt am Rohtext und liefert nur eine stabile Referenz für React.
// Im Server-Rendering ist der Verlauf leer; nach dem Laden liest React den gespeicherten Stand.

import { useSyncExternalStore } from "react";
import type { Eintrag } from "./freigabe";
import { zurufeWiederherstellen, zurufeZuruecksetzen } from "./zurufe";

const PRAEFIX = "sw-freigabe-v1:";
const LEER: readonly Eintrag[] = [];
const hoerer = new Set<() => void>();
const zwischen = new Map<string, { roh: string | null; verlauf: readonly Eintrag[] }>();
/** Ersatz, wenn der Browser keinen Speicher erlaubt (privater Modus): gilt bis zum Neuladen. */
const ohneSpeicher = new Map<string, readonly Eintrag[]>();

function benachrichtigen() {
  hoerer.forEach((h) => h());
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === null || e.key.startsWith(PRAEFIX)) benachrichtigen();
  });
}

function lesen(projektId: string): readonly Eintrag[] {
  let roh: string | null;
  try {
    roh = localStorage.getItem(PRAEFIX + projektId);
  } catch {
    return ohneSpeicher.get(projektId) ?? LEER;
  }
  const z = zwischen.get(projektId);
  if (z && z.roh === roh) return z.verlauf;
  let verlauf: readonly Eintrag[] = LEER;
  if (roh) {
    try {
      const wert: unknown = JSON.parse(roh);
      if (Array.isArray(wert)) verlauf = wert as Eintrag[];
    } catch {
      verlauf = LEER;
    }
  }
  zwischen.set(projektId, { roh, verlauf });
  return verlauf;
}

function schreiben(projektId: string, verlauf: readonly Eintrag[]) {
  try {
    if (verlauf.length) localStorage.setItem(PRAEFIX + projektId, JSON.stringify(verlauf));
    else localStorage.removeItem(PRAEFIX + projektId);
  } catch {
    ohneSpeicher.set(projektId, verlauf);
  }
  benachrichtigen();
}

function abonnieren(h: () => void) {
  hoerer.add(h);
  return () => {
    hoerer.delete(h);
  };
}

export function useVerlauf(projektId: string): readonly Eintrag[] {
  return useSyncExternalStore(
    abonnieren,
    () => lesen(projektId),
    () => LEER,
  );
}

export function eintragen(projektId: string, e: Eintrag) {
  schreiben(projektId, [...lesen(projektId), e]);
}

/** Nimmt genau diesen Eintrag zurück (nicht den letzten des Projekts, der könnte aus einem anderen Tab sein). */
export function rueckgaengig(projektId: string, e: Eintrag) {
  const verlauf = lesen(projektId);
  const i = verlauf.findLastIndex((x) => x.schluessel === e.schluessel && x.zeit === e.zeit && x.aktion === e.aktion);
  if (i < 0) return;
  schreiben(projektId, [...verlauf.slice(0, i), ...verlauf.slice(i + 1)]);
}

/** Stand vor „Demo zurücksetzen“: Freigaben je Projekt und neue Zurufe samt Chat (zurufe.ts). */
export interface Zuruecksetzstand {
  freigaben: Map<string, readonly Eintrag[]>;
  zurufe: Map<string, string>;
}

/** „Demo zurücksetzen“: alle Freigaben aller Projekte und alle neuen Zurufe löschen; liefert den alten Stand für Rückgängig. */
export function allesZuruecksetzen(): Zuruecksetzstand {
  const ids = new Set(ohneSpeicher.keys());
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PRAEFIX)) ids.add(k.slice(PRAEFIX.length));
    }
  } catch {
    // ohne Speicher gibt es nur den Ersatz
  }
  const vorher = new Map([...ids].map((id) => [id, lesen(id)] as const));
  ids.forEach((id) => schreiben(id, LEER));
  return { freigaben: vorher, zurufe: zurufeZuruecksetzen() };
}

export function wiederherstellen(stand: Zuruecksetzstand) {
  stand.freigaben.forEach((verlauf, id) => schreiben(id, verlauf));
  zurufeWiederherstellen(stand.zurufe);
}
