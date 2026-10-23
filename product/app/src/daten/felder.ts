// Gelesene Felder eines Belegs (UI-Runde 1, Schritt 4, a6): wie viele Werte aus dem Dokument kommen und welche beim
// Einlesen von Hand korrigiert wurden, mit dem alten Wert. Der Zwilling überschreibt nichts. Nur Nachschlagen im
// Datensatz, gerechnet wird hier nichts; der Rechenkern liest „vorher“ nie.

import type { Datensatz, Feld } from "@/domain/typen";

export interface Korrektur {
  /** Feldname im Datensatz, z. B. „menge“, „stundenMonteur“, „datum“. */
  feld: string;
  /** Stelle im Dokument, z. B. „Zeile 22.02.02B“. */
  stelle: string;
  seite: number;
  wert: number | string;
  vorher: number | string;
}

export interface GeleseneFelder {
  gelesen: number;
  korrekturen: Korrektur[];
}

/** Alle Felder des Datensatzes, deren Quelle im Beleg liegt (Dokument oder WhatsApp-Meldung). */
export function geleseneFelder(d: Datensatz, belegId: string): GeleseneFelder {
  const ergebnis: GeleseneFelder = { gelesen: 0, korrekturen: [] };
  const gehe = (wert: unknown, name: string) => {
    if (Array.isArray(wert)) return wert.forEach((w) => gehe(w, name));
    if (!wert || typeof wert !== "object") return;
    const o = wert as Record<string, unknown>;
    if ("quelle" in o && "wert" in o) {
      const f = o as unknown as Feld<number | string>;
      if (f.quelle.dokumentId === belegId) {
        ergebnis.gelesen++;
        if (f.korrigiert && f.vorher !== undefined) ergebnis.korrekturen.push({ feld: name, stelle: f.quelle.stelle ?? "", seite: f.quelle.seite, wert: f.wert, vorher: f.vorher });
      }
      return;
    }
    for (const [k, w] of Object.entries(o)) gehe(w, k);
  };
  gehe(d, "");
  return ergebnis;
}
