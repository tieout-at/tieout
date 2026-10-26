/**
 * The building schema on a project's "Überblick" (step 8d): where in the building each find lies, read only from the
 * places the twin holds for it (the "Ort" of a WhatsApp-Meldung or a photo, the title of an Aufmaßblatt, the activity
 * of a Regiebericht, the text of an e-mail or a plan, the find's own position text). Nothing is placed by hand: a find
 * whose Belege name no place stays off the schema. The schema itself is drawn from the project's facts (Stiegen,
 * Geschoße, Altbau and Zubau named in its Belege); it is a schema, not a plan, and says so.
 */

import type { Datensatz, Fund } from "@tieout/kern";

export type PlaceKind = "top" | "schacht" | "raum" | "geschoss" | "wohnungen" | "decken" | "stiege" | "teil";

/** A place of a find: the zone of the schema it lights, its words as written, and where they were read. */
export type FindPlace = {
  zone: string;
  kind: PlaceKind;
  /** The place as the Beleg writes it ("Stiege 2, Top 9"). */
  label: string;
  /** Where it was read ("WhatsApp-Meldung W4"). */
  from: string;
  stiegen: number[];
  top: number | null;
  geschoss: number | null;
};

export type BuildingModel =
  | { kind: "stiegen"; stiegen: number; base: ("tiefgarage" | "keller" | "technikraum")[] }
  | { kind: "geschosse"; floors: { id: string; label: string; level: number }[] }
  | { kind: "teile"; parts: ("altbau" | "zubau")[]; untergeschoss: boolean };

type Text = { text: string; from: string; field: boolean };

/**
 * How specific a place is; the most specific one a find's Belege name wins, an "Ort" field before running text. A flat type
 * ranks first: a find about "Wohnungstyp C" spans every flat of the type, a photo of one of them ("Top 7") is an example.
 */
const RANK: Record<PlaceKind, number> = { wohnungen: 8, top: 7, schacht: 6, raum: 6, geschoss: 5, decken: 3, stiege: 2, teil: 2 };

const stiegenIn = (t: string) => {
  const both = t.match(/Stiegen? (\d) und (\d)/);
  if (both) return [+both[1], +both[2]];
  return [...t.matchAll(/Stiege (\d)/g)].map((m) => +m[1]);
};

const ORDINAL: Record<string, number> = { ersten: 1, erster: 1, zweiten: 2, zweiter: 2, dritten: 3, dritter: 3, vierten: 4, vierter: 4 };

/** Every place a text names, most specific first. */
export function placesIn(t: Text): FindPlace[] {
  const s = t.text;
  const stiegen = stiegenIn(s);
  const out: FindPlace[] = [];
  const add = (p: Omit<FindPlace, "from" | "stiegen" | "top" | "geschoss"> & Partial<Pick<FindPlace, "stiegen" | "top" | "geschoss">>) => out.push({ from: t.from, stiegen, top: null, geschoss: null, ...p });
  const top = s.match(/\bTop (\d+)/);
  if (top) add({ zone: `top-${stiegen[0] ?? 0}-${top[1]}`, kind: "top", label: labelOf(s), top: +top[1] });
  if (/Steigschacht|Steigleitung/.test(s) && stiegen.length) add({ zone: `schacht-${stiegen[0]}`, kind: "schacht", label: stiegen.length ? `Stiege ${stiegen[0]}, Steigschacht` : "Steigschacht" });
  for (const [re, zone, label] of [
    [/Technikraum/, "technikraum", "Technikraum"],
    [/\bKeller\b/, "keller", "Keller"],
    [/Tiefgarage/, "tiefgarage", "Tiefgarage"],
  ] as const)
    if (re.test(s)) add({ zone, kind: "raum", label });
  const og = s.match(/(\d)\. ?(?:Obergescho(?:ß|ss)|OG)/) ?? s.match(/\b(ersten|erster|zweiten|zweiter|dritten|dritter|vierten|vierter) Stock/);
  if (og) {
    const n = /^\d$/.test(og[1]) ? +og[1] : ORDINAL[og[1]];
    add({ zone: `og-${n}`, kind: "geschoss", label: `${n}. Obergeschoß`, geschoss: n });
  }
  if (/Wohnungs?typ C|Wohnungen Typ C/.test(s)) add({ zone: "wohnungen", kind: "wohnungen", label: labelOf(s, "Wohnungstyp C") });
  if (/Deckendurchführung/.test(s)) add({ zone: "decken", kind: "decken", label: "Deckendurchführungen" });
  if (stiegen.length === 1 && !out.length) add({ zone: `stiege-${stiegen[0]}`, kind: "stiege", label: `Stiege ${stiegen[0]}` });
  for (const part of ["Altbau", "Zubau"] as const) if (new RegExp(`\\b${part}\\b`).test(s)) add({ zone: part.toLowerCase(), kind: "teil", label: part });
  return out.sort((a, b) => RANK[b.kind] - RANK[a.kind]);
}

/** The place words of a short "Ort" field as written; a longer text is cut to the part that names the place. */
function labelOf(s: string, fallback?: string): string {
  if (s.length <= 40) return s.replace(/\.$/, "");
  const m = s.match(/(Stiegen? \d(?: und \d)?(?:, [^,.:]+)?)/);
  return m ? m[1] : (fallback ?? s.slice(0, 40));
}

/** The texts a find's Belege give about where the work was done, the "Ort" fields first. */
export function placeTexts(d: Datensatz, f: Fund): Text[] {
  const out: Text[] = [];
  for (const n of f.nachweise) {
    if (n.rolle !== "leistung") continue;
    const id = n.quelle.belegId;
    const m = d.meldungen.find((x) => x.id === id);
    if (m) out.push({ text: m.ort.wert, from: `WhatsApp-Meldung ${m.nr}`, field: true });
    const foto = d.fotos.find((x) => x.belegId === id);
    if (foto) out.push({ text: foto.ort.wert, from: n.titel, field: true });
    const ab = d.aufmass.find((x) => x.belegId === id);
    if (ab?.zeilen[0]) out.push({ text: ab.zeilen[0].ort.wert, from: `Aufmaßblatt ${ab.nr}`, field: true });
    const rb = d.regie.find((x) => x.belegId === id);
    if (rb) out.push({ text: rb.taetigkeit.wert, from: `Regiebericht ${rb.nr}`, field: false });
    if (!m && !foto && !ab && !rb) out.push({ text: `${n.titel} ${n.text}`, from: n.titel, field: false });
  }
  out.push({ text: f.titel, from: f.positionen.length ? "Leistungsverzeichnis" : "Fund", field: false });
  return out;
}

/** The one place of a find: the most specific any of its Belege names, an "Ort" field before running text; null if none. */
export function placeOf(d: Datensatz, f: Fund): FindPlace | null {
  let best: { p: FindPlace; score: number } | null = null;
  placeTexts(d, f).forEach((t, i) => {
    for (const p of placesIn(t)) {
      // a place with more Stiegen named is the fuller reading of the same kind ("Stiege 1 und 2, Wohnungstyp C")
      const score = RANK[p.kind] * 100 + (t.field ? 20 : 0) + p.stiegen.length * 5 - i * 0.1;
      if (!best || score > best.score) best = { p, score };
    }
  });
  return best ? (best as { p: FindPlace }).p : null;
}

/** Floors named anywhere in a project's Aufmaßblätter and places: Untergeschoß, Erdgeschoß, 1. to n. Obergeschoß. */
function floorsOf(texts: string[], places: FindPlace[]) {
  const all = texts.join(" | ");
  const top = Math.max(0, ...places.map((p) => p.geschoss ?? 0), ...[...all.matchAll(/(\d)\. ?Obergescho(?:ß|ss)/g)].map((m) => +m[1]));
  return [
    ...(/Untergescho(?:ß|ss)/.test(all) ? [{ id: "ug", label: "Untergeschoß", level: -1 }] : []),
    { id: "eg", label: "Erdgeschoß", level: 0 },
    ...Array.from({ length: top }, (_, i) => ({ id: `og-${i + 1}`, label: `${i + 1}. Obergeschoß`, level: i + 1 })),
  ];
}

/**
 * The schema of a project from its facts, or null when its finds name fewer than two places (then the page shows the
 * finds as a strip): Stiegen over a base of the rooms its Belege name, Geschoße of one building, or Altbau and Zubau.
 */
export function buildingModel(d: Datensatz, places: FindPlace[]): BuildingModel | null {
  const zones = new Set(places.map((p) => p.zone));
  if (zones.size < 2) return null;
  const titles = [d.projekt.langname, ...d.aufmass.map((a) => a.zeilen[0]?.ort.wert ?? ""), ...d.plaene.map((p) => p.titel.wert)];
  const all = titles.join(" | ");
  const stiegen = Math.max(0, ...places.flatMap((p) => p.stiegen), ...stiegenIn(all));
  if (stiegen > 0) {
    const base = (["tiefgarage", "keller", "technikraum"] as const).filter((r) => zones.has(r) || (r === "tiefgarage" ? /Tiefgarage/.test(all) : r === "technikraum" ? /Technikraum/.test(all) : false));
    return { kind: "stiegen", stiegen, base };
  }
  if (places.some((p) => p.kind === "teil")) {
    const parts = (["altbau", "zubau"] as const).filter((x) => zones.has(x) || new RegExp(x, "i").test(all));
    return { kind: "teile", parts, untergeschoss: /Zubau Untergescho/.test(all) };
  }
  if (places.some((p) => p.kind === "geschoss")) return { kind: "geschosse", floors: floorsOf(titles, places) };
  return null;
}
