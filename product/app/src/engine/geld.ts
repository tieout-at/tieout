// Geld und Mengen als ganze Zahlen.
// Beträge: Cent. Mengen: Hundertstel der Einheit (86 Stk = 8600). Sätze: Basispunkte (3,8 % = 380).
// Rundung überall kaufmännisch (ab ,5 weg von null), immer pro Zeile.

import type { Bp, Cent, Einheit } from "@/domain/typen";

function pruefeGanzzahl(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} ist keine sichere Ganzzahl: ${n}`);
}

/** zaehler / nenner, kaufmännisch gerundet. nenner > 0. */
export function rundeHalbAuf(zaehler: number, nenner: number): number {
  pruefeGanzzahl(zaehler, "Zähler");
  pruefeGanzzahl(nenner, "Nenner");
  if (nenner <= 0) throw new Error("Nenner muss positiv sein");
  const vorzeichen = zaehler < 0 ? -1 : 1;
  const z = Math.abs(zaehler);
  return vorzeichen * Math.floor((2 * z + nenner) / (2 * nenner));
}

/** Betrag einer Zeile: Menge (Hundertstel) × EP (Cent), auf Cent gerundet. */
export function betragAusMenge(mengeHundertstel: number, ep: Cent): Cent {
  return rundeHalbAuf(mengeHundertstel * ep, 100);
}

/** Prozentsatz auf einen Betrag, auf Cent gerundet. */
export function prozent(betrag: Cent, satz: Bp): Cent {
  return rundeHalbAuf(betrag * satz, 10000);
}

/** Stunden × Satz, Stunden als ganze Zahl oder Hundertstel. */
export function stundenBetrag(stundenHundertstel: number, satzJeStunde: Cent): Cent {
  return rundeHalbAuf(stundenHundertstel * satzJeStunde, 100);
}

export function summe(werte: readonly number[]): number {
  return werte.reduce((a, b) => a + b, 0);
}

const tausender = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** 123456 → „1.234,56 €“. */
export function euro(cent: Cent): string {
  pruefeGanzzahl(cent, "Betrag");
  const minus = cent < 0 ? "−" : "";
  const abs = Math.abs(cent);
  const ganz = Math.floor(abs / 100).toString();
  const rest = (abs % 100).toString().padStart(2, "0");
  return `${minus}${tausender(ganz)},${rest} €`;
}

/** 8600, „Stk“ → „86 Stk“; 81250, „m“ → „812,5 m“. */
export function menge(hundertstel: number, einheit?: Einheit): string {
  pruefeGanzzahl(hundertstel, "Menge");
  const minus = hundertstel < 0 ? "−" : "";
  const abs = Math.abs(hundertstel);
  const ganz = tausender(Math.floor(abs / 100).toString());
  const rest = abs % 100;
  const text = rest === 0 ? ganz : `${ganz},${rest.toString().padStart(2, "0").replace(/0$/, "")}`;
  return einheit ? `${minus}${text} ${einheit}` : `${minus}${text}`;
}

/** 380 → „3,8 %“; 300 → „3,00 %“ wenn stellen = 2. */
export function prozentText(satz: Bp, stellen = 1): string {
  const wert = satz / 100;
  return `${wert.toFixed(stellen).replace(".", ",")} %`;
}

/** Stunden in Hundertstel → „1,30 h“. */
export function stunden(hundertstel: number): string {
  return `${(hundertstel / 100).toFixed(2).replace(".", ",")} h`;
}
