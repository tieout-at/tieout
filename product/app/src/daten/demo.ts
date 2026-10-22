// Datenzugriff der App. Heute: der synthetische Firmenzwilling aus dem Generator, einmal gerechnet und beim Build
// vorberechnet. Später (Stufe 0) kommt hier die Datenbank pro Firma hin; die Bildschirme lesen nur diese Funktionen.

import "server-only";
import { notFound } from "next/navigation";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import type { Datensatz, Firmendaten } from "@/domain/typen";
import { pruefeFirma, type Befund, type Ergebnis, type FirmenErgebnis } from "@/engine";

let cache: { f: Firmendaten; e: FirmenErgebnis } | null = null;

function laden() {
  if (!cache) {
    const f = erzeugeFirma();
    cache = { f, e: pruefeFirma(f) };
  }
  return cache;
}

export function firma(): { daten: Firmendaten; ergebnis: FirmenErgebnis } {
  const { f, e } = laden();
  return { daten: f, ergebnis: e };
}

export function projekt(id: string): { d: Datensatz; e: Ergebnis } {
  const { f, e } = laden();
  const d = f.projekte.find((p) => p.projekt.id === id);
  if (!d) notFound();
  return { d, e: e.ergebnisse[id] };
}

export function projektIds(): { projekt: string }[] {
  return laden().f.projekte.map((p) => ({ projekt: p.projekt.id }));
}

/** Befund-Schlüssel wie „mehrmenge:22.04.12B“ als lesbarer URL-Teil „mehrmenge-22-04-12B“. */
export function befundSlug(schluessel: string): string {
  return schluessel.replace(/[:.]/g, "-");
}

export function befund(projektId: string, slug: string): { d: Datensatz; e: Ergebnis; b: Befund } {
  const { d, e } = projekt(projektId);
  const b = e.befunde.find((x) => befundSlug(x.schluessel) === slug);
  if (!b) notFound();
  return { d, e, b };
}

/** Zähler und Stammdaten für die Seitenleiste (klein, geht an den Browser). */
export interface NavProjekt {
  id: string;
  kurz: string;
  name: string;
  los: string;
  abgleich: boolean;
  befunde: number;
  ledger: number;
  dokumente: number;
  risiken: number;
}

export function navDaten(): { firma: string; untertitel: string; projekte: NavProjekt[]; auftraggeber: number } {
  const { f, e } = laden();
  return {
    firma: f.firma.name,
    untertitel: `${f.firma.gewerk} · ${f.firma.sitz}`,
    auftraggeber: f.auftraggeber.length,
    projekte: f.projekte.map((d) => {
      const x = e.ergebnisse[d.projekt.id];
      return {
        id: d.projekt.id,
        kurz: d.projekt.kurz,
        name: d.projekt.name,
        los: d.projekt.los,
        abgleich: x.abgleich,
        befunde: x.befunde.length,
        ledger: x.ledger.length,
        dokumente: d.dokumente.length,
        risiken: x.vorpruefung?.risiken.length ?? 0,
      };
    }),
  };
}
