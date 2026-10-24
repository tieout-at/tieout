// Money and quantities as integers, ported unchanged from the v1 core (tag v1-archiv, product/app/src/engine/geld.ts).
// Amounts: cents. Quantities: hundredths of the unit (86 Stk = 8600). Rates: basis points (3,8 % = 380).
// Rounding is commercial everywhere (from ,5 away from zero), always per line.

import type { Bp, Cent, Einheit } from "./grundtypen";

function pruefeGanzzahl(n: number, name: string) {
  if (!Number.isSafeInteger(n)) throw new Error(`${name} ist keine sichere Ganzzahl: ${n}`);
}

/** zaehler / nenner, commercially rounded. nenner > 0. */
export function rundeHalbAuf(zaehler: number, nenner: number): number {
  pruefeGanzzahl(zaehler, "Zähler");
  pruefeGanzzahl(nenner, "Nenner");
  if (nenner <= 0) throw new Error("Nenner muss positiv sein");
  const vorzeichen = zaehler < 0 ? -1 : 1;
  const z = Math.abs(zaehler);
  return vorzeichen * Math.floor((2 * z + nenner) / (2 * nenner));
}

/** Amount of a line: quantity (hundredths) × Einheitspreis (cents), rounded to the cent. */
export function betragAusMenge(mengeHundertstel: number, ep: Cent): Cent {
  return rundeHalbAuf(mengeHundertstel * ep, 100);
}

/** Percentage of an amount, rounded to the cent. */
export function prozent(betrag: Cent, satz: Bp): Cent {
  return rundeHalbAuf(betrag * satz, 10000);
}

/** Hours × rate, hours in hundredths. */
export function stundenBetrag(stundenHundertstel: number, satzJeStunde: Cent): Cent {
  return rundeHalbAuf(stundenHundertstel * satzJeStunde, 100);
}

export function summe(werte: readonly number[]): number {
  return werte.reduce((a, b) => a + b, 0);
}

const tausender = (s: string) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/** 123456 → "1.234,56 €". */
export function euro(cent: Cent): string {
  pruefeGanzzahl(cent, "Betrag");
  const minus = cent < 0 ? "−" : "";
  const abs = Math.abs(cent);
  const ganz = Math.floor(abs / 100).toString();
  const rest = (abs % 100).toString().padStart(2, "0");
  return `${minus}${tausender(ganz)},${rest} €`;
}

/** 8600, "Stk" → "86 Stk"; 81250, "m" → "812,5 m". */
export function menge(hundertstel: number, einheit?: Einheit): string {
  pruefeGanzzahl(hundertstel, "Menge");
  const minus = hundertstel < 0 ? "−" : "";
  const abs = Math.abs(hundertstel);
  const ganz = tausender(Math.floor(abs / 100).toString());
  const rest = abs % 100;
  const text = rest === 0 ? ganz : `${ganz},${rest.toString().padStart(2, "0").replace(/0$/, "")}`;
  return einheit ? `${minus}${text} ${einheit}` : `${minus}${text}`;
}

/** 380 → "3,8 %"; 300 → "3,00 %" with stellen = 2. Rounded commercially in integers (2015 → "20,2 %"). */
export function prozentText(satz: Bp, stellen = 1): string {
  if (stellen < 0 || stellen > 2) throw new Error("stellen 0 bis 2");
  const teile = rundeHalbAuf(satz, 10 ** (2 - stellen));
  const minus = teile < 0 ? "−" : "";
  const abs = Math.abs(teile);
  const ganz = Math.floor(abs / 10 ** stellen);
  const rest = stellen ? `,${String(abs % 10 ** stellen).padStart(stellen, "0")}` : "";
  return `${minus}${ganz}${rest} %`;
}

/** Hours in hundredths → "1,30 h". */
export function stunden(hundertstel: number): string {
  return `${(hundertstel / 100).toFixed(2).replace(".", ",")} h`;
}

/** "1.234,56 €" (or "1.234,56") → 123456. The reverse of `euro`, for reading amounts out of documents and tests. */
export function centAus(text: string): Cent {
  const m = /^(−|-)?(\d{1,3}(?:\.\d{3})*),(\d{2})(?:\s?€)?$/.exec(text.trim());
  if (!m) throw new Error(`Kein Betrag: „${text}“`);
  const cent = Number(m[2].replace(/\./g, "") + m[3]);
  return m[1] ? -cent : cent;
}
