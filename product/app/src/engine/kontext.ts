// Nachschlage-Tabellen über den Datensatz, einmal gebaut und von allen Regeln genutzt.

import type { Aufmassblatt, AufmassZeile, Datensatz, LvPosition, Rechnung, RechnungsZeile } from "@/domain/typen";

export interface AufmassFund {
  blatt: Aufmassblatt;
  zeile: AufmassZeile;
}

export interface ZeilenFund {
  rechnung: Rechnung;
  zeile: Extract<RechnungsZeile, { typ: "lv" } | { typ: "zusatz" }>;
}

export interface Kontext {
  d: Datensatz;
  lv: Map<string, LvPosition>;
  aufmass: Map<string, AufmassFund[]>;
  /** Zeilen des eigenen Schlussrechnungs-Entwurfs je Position. */
  entwurf: Map<string, ZeilenFund[]>;
  /** Zeilen aller Abschlagsrechnungen je Position. */
  abschlaege: Map<string, ZeilenFund[]>;
  /** Regieberichte, die in einer AR oder im Entwurf verrechnet sind. */
  regieVerrechnet: Set<string>;
  /** Gekürzte Beträge je Position oder Regiebericht laut Korrekturblättern. */
  kuerzungen: Map<string, number>;
  /** Rechnungsnummern mit Zahlung. */
  bezahlteRechnungen: Set<string>;
}

function anhaengen<K, V>(m: Map<K, V[]>, k: K, v: V) {
  const liste = m.get(k);
  if (liste) liste.push(v);
  else m.set(k, [v]);
}

function positionsZeilen(r: Rechnung, ziel: Map<string, ZeilenFund[]>) {
  for (const z of r.zeilen) {
    if (z.typ === "lv" || z.typ === "zusatz") anhaengen(ziel, z.positionNr.wert, { rechnung: r, zeile: z });
  }
}

export function baueKontext(d: Datensatz): Kontext {
  const lv = new Map(d.lv.map((p) => [p.nr.wert, p] as const));
  if (lv.size !== d.lv.length) throw new Error("LV enthält doppelte Positionsnummern");

  const aufmass = new Map<string, AufmassFund[]>();
  for (const blatt of d.aufmass) for (const zeile of blatt.zeilen) anhaengen(aufmass, zeile.positionNr.wert, { blatt, zeile });

  const entwurf = new Map<string, ZeilenFund[]>();
  positionsZeilen(d.entwurf, entwurf);
  const abschlaege = new Map<string, ZeilenFund[]>();
  for (const ar of d.abschlaege) positionsZeilen(ar, abschlaege);

  const regieVerrechnet = new Set<string>();
  for (const r of [...d.abschlaege, d.entwurf])
    for (const z of r.zeilen) if (z.typ === "regie") regieVerrechnet.add(z.regieNr.wert);

  const kuerzungen = new Map<string, number>();
  for (const kb of d.korrekturblaetter)
    for (const z of kb.zeilen) kuerzungen.set(z.positionNr.wert, (kuerzungen.get(z.positionNr.wert) ?? 0) + z.kuerzung.wert);

  const bezahlteRechnungen = new Set(d.zahlungen.map((z) => z.rechnungNr.wert));

  return { d, lv, aufmass, entwurf, abschlaege, regieVerrechnet, kuerzungen, bezahlteRechnungen };
}

export function aufmassMenge(k: Kontext, nr: string): number {
  return (k.aufmass.get(nr) ?? []).reduce((s, f) => s + f.zeile.menge.wert, 0);
}

export function entwurfMenge(k: Kontext, nr: string): number {
  return (k.entwurf.get(nr) ?? []).reduce((s, f) => s + f.zeile.menge.wert, 0);
}

/** Vergleich von ISO-Daten als Text ist korrekt, weil das Format fest „JJJJ-MM-TT“ ist. */
export function istAbDatum(datum: string, stichtag: string): boolean {
  return datum >= stichtag;
}
