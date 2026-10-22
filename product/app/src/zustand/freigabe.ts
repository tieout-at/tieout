// Zweistufige Freigabe als Verlauf: jede Entscheidung ist ein neuer Eintrag, nichts wird überschrieben.
// Stufe 1 (Prüfung, M): übernehmen, verwerfen (Grund aus fester Liste), braucht Anwalt, zurückstellen.
// Stufe 2 (Insider, I): freigeben oder zurück an die Prüfung. Rückgängig nimmt den letzten Eintrag zurück.
// Reine Funktionen; gespeichert wird in ./speicher.ts (MVP: im Browser, v1: Datenbank pro Firma).

import type { Liste } from "@/engine/typen";

export type Aktion = "uebernehmen" | "freigeben" | "verwerfen" | "anwalt" | "zurueckstellen" | "zurueck";
export type Rolle = "M" | "I";
export type Stand = "pruefen" | "uebernommen" | "freigegeben" | "verworfen" | "anwalt" | "zurueckgestellt";

export const GRUENDE_VERWERFEN = ["Bereits verrechnet", "Kein Anspruch laut Vertrag", "Beleg falsch zugeordnet", "Duplikat"] as const;

export const ROLLE_TEXT: Record<Rolle, string> = { M: "Prüfung", I: "Insider" };

export interface Eintrag {
  schluessel: string;
  aktion: Aktion;
  rolle: Rolle;
  /** Zeitpunkt der Entscheidung, ISO mit Zeitzone. */
  zeit: string;
  grund?: string;
}

/** Welche Aktionen in welchem Stand erlaubt sind. */
export const ERLAUBT: Record<Stand, Aktion[]> = {
  pruefen: ["uebernehmen", "verwerfen", "anwalt", "zurueckstellen"],
  zurueckgestellt: ["uebernehmen", "verwerfen", "anwalt"],
  uebernommen: ["freigeben", "zurueck"],
  freigegeben: [],
  verworfen: [],
  anwalt: [],
};

const NACH: Record<Aktion, Stand> = {
  uebernehmen: "uebernommen",
  freigeben: "freigegeben",
  verwerfen: "verworfen",
  anwalt: "anwalt",
  zurueckstellen: "zurueckgestellt",
  zurueck: "pruefen",
};

export const ROLLE_FUER: Record<Aktion, Rolle> = {
  uebernehmen: "M",
  verwerfen: "M",
  anwalt: "M",
  zurueckstellen: "M",
  freigeben: "I",
  zurueck: "I",
};

export function startStand(liste: Liste): Stand {
  return liste === "anwalt" ? "anwalt" : "pruefen";
}

/** Stand eines Postens aus dem Verlauf. Unerlaubte Einträge (z. B. Freigeben vor Übernehmen) werden übergangen. */
export function standAus(verlauf: readonly Eintrag[], schluessel: string, liste: Liste): Stand {
  let stand = startStand(liste);
  for (const e of verlauf) {
    if (e.schluessel !== schluessel) continue;
    if (ERLAUBT[stand].includes(e.aktion)) stand = NACH[e.aktion];
  }
  return stand;
}

/** Letzte gültige Einträge je Stufe, für „Übernommen von … um …“. */
export function schritte(verlauf: readonly Eintrag[], schluessel: string): Eintrag[] {
  return verlauf.filter((e) => e.schluessel === schluessel);
}
