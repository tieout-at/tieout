// Lookup tables over one project, built once and used by every rule. Ported from the v1 core (kontext.ts).

import type { Aufmassblatt, AufmassZeile, Datensatz, Datum, Position, Rechnung, RechnungsZeile, Regiebericht } from "./modell";

export interface AufmassFund {
  blatt: Aufmassblatt;
  zeile: AufmassZeile;
}

export interface ZeilenFund {
  rechnung: Rechnung;
  zeile: Extract<RechnungsZeile, { typ: "position" } | { typ: "zusatz" }>;
}

export interface Kontext {
  d: Datensatz;
  /** Name of the Auftraggeber, for the neutral notes ("Hornfeld Bau kann hier …"). */
  auftraggeber: string;
  lv: Map<string, Position>;
  aufmass: Map<string, AufmassFund[]>;
  /** Lines of the own Entwurf per position (empty without an Entwurf). */
  entwurf: Map<string, ZeilenFund[]>;
  /** Lines of every Abschlagsrechnung per position. */
  abschlaege: Map<string, ZeilenFund[]>;
  /** Regieberichte invoiced in an Abschlagsrechnung or in the Entwurf. */
  regieVerrechnet: Set<string>;
  /** Cut amounts per position or Regiebericht according to the Korrekturblätter. */
  kuerzungen: Map<string, number>;
  /**
   * Without an Entwurf (project "in Ausführung"): date of the last Abschlagsrechnung. Only work up to that day counts as
   * forgotten; later work goes into the next Abschlagsrechnung and is no find. With an Entwurf: null (everything counts).
   */
  grenze: Datum | null;
  /** Neither an Entwurf nor an Abschlagsrechnung: nothing was invoiced yet, so nothing can be forgotten. */
  nochNichtsAbgerechnet: boolean;
}

function anhaengen<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const liste = m.get(k);
  if (liste) liste.push(v);
  else m.set(k, [v]);
}

function positionsZeilen(r: Rechnung, ziel: Map<string, ZeilenFund[]>) {
  for (const z of r.zeilen) if (z.typ === "position" || z.typ === "zusatz") anhaengen(ziel, z.positionNr.wert, { rechnung: r, zeile: z });
}

export function baueKontext(d: Datensatz, auftraggeber = "Der Auftraggeber"): Kontext {
  const lv = new Map(d.positionen.map((p) => [p.nr.wert, p] as const));
  if (lv.size !== d.positionen.length) throw new Error(`${d.projekt.kurz}: Leistungsverzeichnis mit doppelten Positionsnummern`);

  const aufmass = new Map<string, AufmassFund[]>();
  for (const blatt of [...d.aufmass].sort((a, b) => a.datum.wert.localeCompare(b.datum.wert)))
    for (const zeile of blatt.zeilen) anhaengen(aufmass, zeile.positionNr.wert, { blatt, zeile });

  const entwurf = new Map<string, ZeilenFund[]>();
  if (d.entwurf) positionsZeilen(d.entwurf, entwurf);
  const abschlaege = new Map<string, ZeilenFund[]>();
  for (const ar of d.abschlaege) positionsZeilen(ar, abschlaege);

  const regieVerrechnet = new Set<string>();
  for (const r of d.entwurf ? [...d.abschlaege, d.entwurf] : d.abschlaege) for (const z of r.zeilen) if (z.typ === "regie") regieVerrechnet.add(z.regieberichtNr.wert);

  const kuerzungen = new Map<string, number>();
  for (const kb of d.korrekturblaetter) for (const z of kb.zeilen) kuerzungen.set(z.positionNr.wert, (kuerzungen.get(z.positionNr.wert) ?? 0) + z.kuerzung.wert);

  const grenze = d.entwurf ? null : (d.abschlaege.map((r) => r.datum.wert).sort().at(-1) ?? null);
  return { d, auftraggeber, lv, aufmass, entwurf, abschlaege, regieVerrechnet, kuerzungen, grenze, nochNichtsAbgerechnet: !d.entwurf && d.abschlaege.length === 0 };
}

/** Does a work date lie up to and including the boundary (or is there none)? Without any invoice: never. */
export function vorGrenze(k: Kontext, datum: Datum): boolean {
  if (k.nochNichtsAbgerechnet) return false;
  return k.grenze === null || datum <= k.grenze;
}

/** Measured quantity of a position; with `nurVorGrenze` only from sheets up to the last Abschlagsrechnung. */
export function aufmassFunde(k: Kontext, nr: string, nurVorGrenze = false): AufmassFund[] {
  return (k.aufmass.get(nr) ?? []).filter((f) => !nurVorGrenze || vorGrenze(k, f.blatt.datum.wert));
}

export function aufmassMenge(k: Kontext, nr: string, nurVorGrenze = false): number {
  return aufmassFunde(k, nr, nurVorGrenze).reduce((s, f) => s + f.zeile.menge.wert, 0);
}

/** Invoiced lines of a position: in the Entwurf, or without an Entwurf in the Abschlagsrechnungen. */
export function verrechneteZeilen(k: Kontext, nr: string): ZeilenFund[] {
  return (k.d.entwurf ? k.entwurf.get(nr) : k.abschlaege.get(nr)) ?? [];
}

export function verrechnetMenge(k: Kontext, nr: string): number {
  return verrechneteZeilen(k, nr).reduce((s, f) => s + f.zeile.menge.wert, 0);
}

/** Last day of the work in a Regiebericht; the rule for ongoing projects uses it, never the document date. */
export function arbeitsdatum(rb: Regiebericht): Datum {
  return [...rb.arbeitstage.wert].sort().at(-1) ?? rb.datum.wert;
}
