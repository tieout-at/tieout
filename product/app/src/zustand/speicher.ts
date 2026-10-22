"use client";

// Speicher des Freigabe-Verlaufs im Browser (MVP), je Projekt. „Demo zurücksetzen“ leert ihn.
// Im Server-Rendering ist der Verlauf leer; nach dem Laden liest React den gespeicherten Stand.

import { useSyncExternalStore } from "react";
import type { Eintrag } from "./freigabe";

const PRAEFIX = "sw-freigabe-v1:";
const LEER: readonly Eintrag[] = [];
const hoerer = new Set<() => void>();
const zwischen = new Map<string, readonly Eintrag[]>();

function lesen(projektId: string): readonly Eintrag[] {
  const vorhanden = zwischen.get(projektId);
  if (vorhanden) return vorhanden;
  let verlauf: readonly Eintrag[] = LEER;
  try {
    const roh = localStorage.getItem(PRAEFIX + projektId);
    if (roh) verlauf = JSON.parse(roh) as Eintrag[];
  } catch {
    verlauf = LEER;
  }
  zwischen.set(projektId, verlauf);
  return verlauf;
}

function schreiben(projektId: string, verlauf: readonly Eintrag[]) {
  zwischen.set(projektId, verlauf);
  try {
    if (verlauf.length) localStorage.setItem(PRAEFIX + projektId, JSON.stringify(verlauf));
    else localStorage.removeItem(PRAEFIX + projektId);
  } catch {
    // privater Modus: Verlauf gilt nur bis zum Neuladen
  }
  hoerer.forEach((h) => h());
}

function abonnieren(h: () => void) {
  hoerer.add(h);
  const beiAenderung = (e: StorageEvent) => {
    if (e.key?.startsWith(PRAEFIX)) {
      zwischen.delete(e.key.slice(PRAEFIX.length));
      h();
    }
  };
  window.addEventListener("storage", beiAenderung);
  return () => {
    hoerer.delete(h);
    window.removeEventListener("storage", beiAenderung);
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

/** Nimmt den letzten Eintrag zurück (mehrfach möglich). */
export function rueckgaengig(projektId: string): Eintrag | null {
  const verlauf = lesen(projektId);
  if (!verlauf.length) return null;
  schreiben(projektId, verlauf.slice(0, -1));
  return verlauf[verlauf.length - 1];
}

export function zuruecksetzen(projektId: string) {
  schreiben(projektId, LEER);
}
