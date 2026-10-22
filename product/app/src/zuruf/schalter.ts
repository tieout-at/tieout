"use client";

// Schalter ZURUF_ECHT, zur Laufzeit: Die Seite fragt den Worker (GET /api/zuruf/status), ob der echte Agent gerade
// verfügbar ist (Schalter an, eingerichtet, Tages- und Monatsgrenze nicht erreicht). Sonst, und bei jedem Fehler,
// bleibt alles wie bisher: Die Szene wird nur vorgespielt. Eingeschaltet wird im Worker, ohne neuen Build.

import { useEffect, useState } from "react";

/** Adresse der Routen. Online dieselbe Adresse wie die Seite; lokal der Server aus product/zuruf (npm run app-server). */
export const ZURUF_API = process.env.NEXT_PUBLIC_ZURUF_API ?? "/api/zuruf";

let status: Promise<boolean> | null = null;

/** Einmal je Seitenaufruf gefragt; `abschalten` merkt sich „nicht verfügbar“ (Grenze erreicht, Fehler). */
function verfuegbar(): Promise<boolean> {
  status ??= fetch(`${ZURUF_API}/status`, { cache: "no-store" })
    .then((r) => (r.ok ? (r.json() as Promise<{ verfuegbar?: boolean }>) : { verfuegbar: false }))
    .then((d) => d.verfuegbar === true)
    .catch(() => false);
  return status;
}

export function zurufAbschalten() {
  status = Promise.resolve(false);
}

/** Ist der echte Agent verfügbar? Bis zur Antwort und bei Fehlern: nein. `fragen` = false fragt gar nicht. */
export function useZurufVerfuegbar(fragen: boolean): [boolean, () => void] {
  const [an, setAn] = useState(false);
  useEffect(() => {
    if (!fragen) return;
    let aktiv = true;
    void verfuegbar().then((v) => aktiv && setAn(v));
    return () => {
      aktiv = false;
    };
  }, [fragen]);
  return [
    an,
    () => {
      zurufAbschalten();
      setAn(false);
    },
  ];
}
