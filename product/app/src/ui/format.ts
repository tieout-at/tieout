// Anzeige von Beträgen, Mengen und Daten. Beträge rechnet nur der Rechenkern; hier wird nur formatiert.

import { euro } from "@/engine/geld";

const NBSP = " ";

/** 2741000 → „27.410,00 €“ mit geschütztem Leerzeichen vor dem €. */
export function betrag(cent: number): string {
  return euro(cent).replace(/ €$/, `${NBSP}€`);
}

/** „2026-10-31“ → „31.10.2026“. */
export function datum(iso: string): string {
  return `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;
}

/** „2026-09-08T14:30“ → „08.09.2026, 14:30“. */
export function zeitpunkt(iso: string): string {
  return `${datum(iso.slice(0, 10))}, ${iso.slice(11, 16)}`;
}

// Ein Formatierer für alle Zähler: toLocaleString legt bei jedem Aufruf einen neuen an (messbar teuer in Listen).
const ZAHL = new Intl.NumberFormat("de-AT");

/** 1234 → „1.234“ (Zähler, Anzahl). */
export function zahl(n: number): string {
  return ZAHL.format(n);
}

/** Zählwort: 1 Posten, 2 Posten; 1 Beleg, 2 Belege. */
export function anzahl(n: number, eins: string, mehr: string): string {
  return `${zahl(n)} ${n === 1 ? eins : mehr}`;
}
