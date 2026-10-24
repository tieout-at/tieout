// Building blocks for the synthetic sample data (everything fictitious). The generator only calculates to hit the input
// amounts of the solution list (contract sum, Entwurf, Abschlagsrechnungen); every find and every total is found by the
// core afterwards. Mechanics ported from the v1 demo generator (tag v1-archiv, product/app/src/demo).

import { betragAusMenge, stundenBetrag, prozent } from "../geld";
import type { Beleg, BelegArt, Cent, Datum, Einheit, Feld, Hundertstel, Quelle, RechnungsZeile, Regiebericht } from "../modell";
import { feld, korrigiere } from "../modell";
import type { KatalogPosition } from "./katalog";

export const q = (belegId: string, seite: number, stelle?: string): Quelle => (stelle ? { belegId, seite, stelle } : { belegId, seite });
export const f = <T>(wert: T, quelle: Quelle): Feld<T> => feld(wert, quelle);

/** A field the machine read wrong and a human corrected on import: the value is right, the misreading stays in the Verlauf. */
export function korrigiert<T>(wert: T, falsch: T, quelle: Quelle, zeit: string): Feld<T> {
  return korrigiere(feld(falsch, quelle), wert, "Abrechnung", zeit);
}

/** Deterministic random numbers (mulberry32): the same seed gives the same data. */
export function zufall(seed: number) {
  let a = seed >>> 0;
  const naechste = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    zahl: naechste,
    /** Whole number between min and max, both included. */
    ganz: (min: number, max: number) => min + Math.floor(naechste() * (max - min + 1)),
  };
}

/** The files of a project folder. Every file gets its own checksum unless it is a copy of another one. */
export class Ordner {
  readonly belege: Beleg[] = [];
  constructor(private readonly projekt: string) {}

  add(id: string, art: BelegArt, dateiname: string, datum: Datum, seiten = 1): string {
    if (this.belege.some((b) => b.id === id)) throw new Error(`${this.projekt}: Beleg ${id} doppelt angelegt`);
    this.belege.push({ id, art, dateiname, datum, seiten, inhaltHash: `${this.projekt}-${id}` });
    return id;
  }

  /** A second copy of a file (the same content saved twice). */
  kopie(vonId: string, id: string, dateiname: string, datum: Datum): string {
    const original = this.belege.find((b) => b.id === vonId);
    if (!original) throw new Error(`${this.projekt}: Original ${vonId} fehlt`);
    this.belege.push({ ...original, id, dateiname, datum });
    return id;
  }
}

/** Regie amount as the business invoices it: hours × Regiesätze + material at Einstandspreis + surcharge of the Vertrag. */
export function regieBetrag(r: { m: Hundertstel; h: Hundertstel; material: Cent }, satzM: Cent, satzH: Cent, zuschlagBp: number): Cent {
  return stundenBetrag(r.m, satzM) + stundenBetrag(r.h, satzH) + r.material + prozent(r.material, zuschlagBp);
}

export interface Variable {
  key: string;
  ep: Cent;
  /** Range of the quantity in hundredths. */
  lo: Hundertstel;
  hi: Hundertstel;
  /** Smallest step: 100 for Stk and psch, 1 for m and m². */
  schritt: number;
}

export const schrittFuer = (e: Einheit) => (e === "Stk" || e === "psch" ? 100 : 1);

/**
 * Quantities so that `fest` + Σ quantity × Einheitspreis (each line rounded) hits `ziel` to the cent. Starts every
 * variable at `start`, moves the coarse ones in whole steps and finishes with an exhaustive search over the last two
 * variables, which must have a step of one hundredth.
 */
export function loese(ziel: Cent, fest: Cent, vars: readonly Variable[], start: "lo" | "hi"): Map<string, Hundertstel> {
  if (vars.length < 2) throw new Error("mindestens zwei Variablen");
  const fein = vars.slice(-2);
  if (fein.some((v) => v.schritt !== 1)) throw new Error("die letzten zwei Variablen brauchen Schritt 1");
  const q = new Map(vars.map((v) => [v.key, v[start]] as const));
  const betrag = (v: Variable) => betragAusMenge(q.get(v.key)!, v.ep);
  const spanne = fein.reduce((s, v) => s + betragAusMenge(v.hi, v.ep) - betragAusMenge(v.lo, v.ep), 0);
  const feinStart = fein.reduce((s, v) => s + betrag(v), 0);
  // coarse: aim at the middle of what the two fine variables can still cover
  const mitte = start === "lo" ? feinStart + Math.floor(spanne / 2) : feinStart - Math.floor(spanne / 2);
  for (const v of vars.slice(0, -2)) {
    const rest = ziel - fest - vars.slice(0, -2).reduce((s, x) => s + betrag(x), 0) - mitte;
    if (rest === 0) break;
    const alt = q.get(v.key)!;
    const schritte = Math.trunc((rest * 100) / v.ep / v.schritt);
    q.set(v.key, Math.min(v.hi, Math.max(v.lo, alt + schritte * v.schritt)));
  }
  const ohneFein = fest + vars.slice(0, -2).reduce((s, x) => s + betrag(x), 0);
  const [a, b] = fein;
  for (let qa = a.lo; qa <= a.hi; qa++) {
    const rest = ziel - ohneFein - betragAusMenge(qa, a.ep);
    const naehe = Math.round((rest * 100) / b.ep);
    for (const qb of [naehe - 1, naehe, naehe + 1]) {
      if (qb < b.lo || qb > b.hi) continue;
      if (betragAusMenge(qb, b.ep) === rest) {
        q.set(a.key, qa);
        q.set(b.key, qb);
        return q;
      }
    }
  }
  throw new Error(`Ziel ${ziel} nicht erreichbar`);
}

/** Splits a quantity into parts by shares, in steps of `schritt`; the last part takes the rest. */
export function teile(menge: Hundertstel, anteile: readonly number[], schritt: number): Hundertstel[] {
  const summeAnteile = anteile.reduce((s, x) => s + x, 0);
  const teileListe = anteile.map((a) => Math.floor((menge * a) / summeAnteile / schritt) * schritt);
  teileListe[teileListe.length - 1] += menge - teileListe.reduce((s, x) => s + x, 0);
  return teileListe;
}

export function lvZeile(belegId: string, seite: number, nr: string, menge: Hundertstel, ep: Cent): RechnungsZeile {
  const qz = q(belegId, seite, `Pos. ${nr}`);
  return { typ: "position", positionNr: f(nr, qz), menge: f(menge, qz), ep: f(ep, qz), betrag: f(betragAusMenge(menge, ep), qz) };
}

export function regieZeile(belegId: string, seite: number, rb: Regiebericht, betrag: Cent): RechnungsZeile {
  const qz = q(belegId, seite, `Regiebericht ${rb.nr}`);
  return { typ: "regie", regieberichtNr: f(rb.nr, qz), betrag: f(betrag, qz) };
}

export const summeZeilen = (zeilen: readonly RechnungsZeile[]) => zeilen.reduce((s, z) => s + z.betrag.wert, 0);

export function plusTage(iso: Datum, tage: number): Datum {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export interface LvPosition {
  kp: KatalogPosition;
  lv: Hundertstel;
  ep: Cent;
}

/**
 * Quantities of a Leistungsverzeichnis: fixed ones from the solution list, the others random within their range and
 * scaled so that the lump sum `ausgleich` (Baustelleneinrichtung) closes the contract sum with about `ausgleichZiel`.
 */
export function leistungsverzeichnis(
  katalog: readonly KatalogPosition[],
  fest: Record<string, number>,
  auftragssumme: Cent,
  ausgleich: string,
  ausgleichZiel: Cent,
  z: ReturnType<typeof zufall>,
): LvPosition[] {
  const pos = katalog.map((kp) => {
    const lv = kp.einheit === "psch" ? 1 : (fest[kp.nr] ?? z.ganz(kp.menge[0], kp.menge[1]));
    return { kp, lv: lv * 100, ep: kp.ep };
  });
  const frei = pos.filter((p) => p.kp.einheit !== "psch" && fest[p.kp.nr] === undefined);
  const aus = pos.find((p) => p.kp.nr === ausgleich);
  if (!aus) throw new Error(`Ausgleichsposition ${ausgleich} fehlt`);
  const fix = pos.filter((p) => !frei.includes(p) && p !== aus).reduce((s, p) => s + betragAusMenge(p.lv, p.ep), 0);
  const faktor = (auftragssumme - ausgleichZiel - fix) / frei.reduce((s, p) => s + betragAusMenge(p.lv, p.ep), 0);
  for (const p of frei) p.lv = Math.max(100, Math.round((p.lv * faktor) / 100) * 100);
  const rest = () => auftragssumme - pos.filter((p) => p !== aus).reduce((s, p) => s + betragAusMenge(p.lv, p.ep), 0);
  // rounding to whole units leaves a gap: one unit more or less on the cheaper free positions in turn until it closes
  for (let i = 0; Math.abs(rest() - ausgleichZiel) > ausgleichZiel / 50 && i < 20_000; i++) {
    const p = frei[i % frei.length];
    if (p.ep > 20_000) continue;
    p.lv += rest() > ausgleichZiel ? 100 : -100;
  }
  aus.ep = rest();
  if (aus.ep < (ausgleichZiel * 2) / 3 || aus.ep > (ausgleichZiel * 4) / 3) throw new Error(`Baustelleneinrichtung unplausibel: ${aus.ep}`);
  return pos;
}
