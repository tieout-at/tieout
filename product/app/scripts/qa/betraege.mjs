// Amount audit (quality gate, point 7): every euro amount on a built page must come from the calculation core or the
// dataset, and the headline amounts of the solution list must stand on their pages. UI arithmetic shows up as unknown.
// Run after `npm run build`: npm run qa:betraege   (tsx, because the calculation core is TypeScript)
// Options: --alle lists every page instead of grouping detail pages (posten/*, belege/*) per project.
// Exit code 1 on an unknown amount or a failed check. Pages that do not exist yet are reported as skipped.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { erzeugeFirma } from "../../src/demo/firma/erzeuge";
import { abrechnung, guHistorie, pruefeFirma } from "../../src/engine";

// Headline amounts of the solution list per page. Extend this when a new screen is built.
// Every amount must also be a headline amount in Demo_Faelle.md (bold or in a section heading).
const ERWARTET = [
  { seite: "/", betraege: ["34.268,10", "11.532,30", "3.179,50", "8.352,80", "20.975,90"] },
  { seite: "/projekte/w21-b-hkls/", betraege: ["27.410,00", "11.282,30", "1.180,00", "8.767,50"] },
  { seite: "/projekte/w21-b-hkls/schlussrechnung/", betraege: ["170.060,89", "8.767,50"] },
];

// Integer leaves whose key names a quantity, count, rate or coordinate, not cents. Everything else in the engine
// result and the dataset counts as an amount, so new money fields are covered without touching this script.
const KEIN_BETRAG =
  /menge|stunden|hundertstel|anzahl|^seiten?$|^bbox$|^satz$|lohnanteil|aenderung|^zeilen$|^erkannt$|^dokumente$|^duplikate$|^eindeutig$|korrigiertefelder|^projekte$|^offeneprojekte$|^befunde$|^posten|^projektemit|^gesamt$|^verrechnet$|unterschrieben|^nachgrenze$|^geschosse$|^vonanzahl$/i;
// Containers whose number leaves are never amounts (record keyed by document type).
const KEIN_BETRAG_UNTER = new Set(["nachArt", "bbox"]);

const app = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const out = join(app, "out");
const loesung = join(app, "..", "docs", "Demo_Faelle.md");
const alle = process.argv.includes("--alle");

if (!existsSync(join(out, "index.html"))) {
  console.error("Kein Build gefunden (out/index.html fehlt). Erst npm run build.");
  process.exit(1);
}

// ---------- Amounts in text ----------

// German euro amounts: "27.410,00 €", "−37.381,50 €", "62,50 €/h", also whole euros "1.240 €", and "€ 1.234,56"
// (the prefix form only with cents, so "… € 20.10." in a timeline is not read as 20 €).
// Not preceded by a digit, dot or comma, so "AB-12" or "3,8 %" never start a match.
const ZAHL = String.raw`(\d{1,3}(?:\.\d{3})+|\d+)(?:,(\d{2}))?(?![\d,])`;
const MIT_CENT = String.raw`(\d{1,3}(?:\.\d{3})+|\d+),(\d{2})(?![\d,])`;
const BETRAG = new RegExp(String.raw`(?<![\d.,])([−–-]\s?)?${ZAHL}\s*€|€\s*([−–-]\s?)?(?<![\d.,])${MIT_CENT}`, "g");

/** All amounts in a text as { cent (absolute), text, index }. */
function betraegeIn(text) {
  const treffer = [];
  for (const m of text.matchAll(BETRAG)) {
    const ganz = m[2] ?? m[5];
    const rest = m[3] ?? m[6] ?? "00";
    treffer.push({ cent: Number(ganz.replaceAll(".", "")) * 100 + Number(rest), text: m[0].trim(), index: m.index });
  }
  return treffer;
}

const euro = (cent) => `${String(Math.floor(cent / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${String(cent % 100).padStart(2, "0")} €`;
const centAus = (text) => betraegeIn(`${text} €`)[0]?.cent;

// ---------- Allowed amounts: calculation core and dataset ----------

/** Walks any value and adds every amount: integer leaves (unless the key says otherwise) and amounts inside strings. */
function sammle(wert, pfad, ziel) {
  if (typeof wert === "number") {
    if (!Number.isInteger(wert) || pfad.some((p) => KEIN_BETRAG_UNTER.has(p))) return;
    const schluessel = [...pfad].reverse().find((p) => p !== "wert" && !/^\d+$/.test(p)) ?? "";
    if (!KEIN_BETRAG.test(schluessel)) ziel.add(Math.abs(wert));
  } else if (typeof wert === "string") {
    for (const t of betraegeIn(wert)) ziel.add(t.cent);
  } else if (Array.isArray(wert)) {
    wert.forEach((w, i) => sammle(w, [...pfad, String(i)], ziel));
  } else if (wert && typeof wert === "object") {
    for (const [k, w] of Object.entries(wert)) sammle(w, [...pfad, k], ziel);
  }
}

const firma = erzeugeFirma();
const kern = new Set();
sammle(pruefeFirma(firma), [], kern);
// GU-Historie (Firmenebene) und Abrechnung der Projekte mit gelegter und bezahlter Schlussrechnung (P7, P8)
sammle(guHistorie(firma), [], kern);
for (const d of firma.projekte) sammle(abrechnung(d), [], kern);
const daten = new Set();
sammle(firma, [], daten);
const erlaubt = new Set([...kern, ...daten]);

// ---------- Pages ----------

const INLINE = new Set(
  "a abbr b bdi bdo cite code data dfn em i kbd mark q s samp small span strong sub sup time u var wbr".split(" "),
);
const ENTITAETEN = { nbsp: " ", amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", minus: "−", euro: "€", ndash: "–", shy: "" };

function entschluesseln(text) {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (ganz, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1)));
    return ENTITAETEN[e.toLowerCase()] ?? ganz;
  });
}

/**
 * Visible text of a page. Scripts (also the RSC payload), styles and comments go (React's <!-- --> joins text);
 * block tags become a space. An inline tag joins only where an amount can be split: after a minus sign, before the
 * cents or before "€" ("<b>27.410</b>,00 €"). Otherwise it separates, so "AR3" and "84.384,10 €" in two <span>s stay
 * apart. Tooltips and labels (title, aria-label, alt, placeholder) are read as extra text.
 */
function sichtbarerText(html) {
  const ohne = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, "");
  const attribute = [...ohne.matchAll(/\s(?:title|aria-label|alt|placeholder)="([^"]*)"/gi)].map((m) => m[1]);
  const text = entschluesseln(
    ohne.replace(/<\/?([a-z][\w-]*)\b[^>]*>/gi, (_, tag) => (INLINE.has(tag.toLowerCase()) ? "\u0001" : " ")),
  )
    .replace(/(?<=[−–-])\u0001+|\u0001+(?=[,€]|\s+€)/g, "")
    .replaceAll("\u0001", " ");
  return [text, ...attribute.map(entschluesseln)].join(" \n ").replace(/[\s  ]+/g, " ");
}

function htmlDateien(ordner) {
  return readdirSync(ordner, { withFileTypes: true }).flatMap((e) => {
    const pfad = join(ordner, e.name);
    if (e.isDirectory()) return e.name === "_next" ? [] : htmlDateien(pfad);
    return e.name.endsWith(".html") ? [pfad] : [];
  });
}

/** out/projekte/w21-b-hkls/index.html → /projekte/w21-b-hkls/; out/404.html → /404.html */
function seitenpfad(datei) {
  const rel = relative(out, datei).split(sep).join("/");
  return rel === "index.html" ? "/" : `/${rel.replace(/(^|\/)index\.html$/, "/")}`;
}

/** Detail pages are grouped per project unless --alle: /projekte/w21-b-hkls/posten/* */
const gruppe = (seite) => (alle ? seite : seite.replace(/^(\/projekte\/[^/]+\/(?:posten|belege)\/)[^/]+\/$/, "$1*"));

const seiten = new Map();
for (const datei of htmlDateien(out)) seiten.set(seitenpfad(datei), sichtbarerText(readFileSync(datei, "utf8")));

const gruppen = new Map();
const unbekannt = [];
let gesamt = 0;
for (const [seite, text] of [...seiten].sort(([a], [b]) => a.localeCompare(b))) {
  const treffer = betraegeIn(text);
  gesamt += treffer.length;
  const g = gruppen.get(gruppe(seite)) ?? { seiten: 0, betraege: 0 };
  gruppen.set(gruppe(seite), { seiten: g.seiten + 1, betraege: g.betraege + treffer.length });
  const gemeldet = new Set();
  for (const t of treffer) {
    if (erlaubt.has(t.cent) || gemeldet.has(t.cent)) continue;
    gemeldet.add(t.cent);
    const kontext = text.slice(Math.max(0, t.index - 50), t.index + t.text.length + 30).trim();
    unbekannt.push({ seite, betrag: t.text, kontext, mal: treffer.filter((x) => x.cent === t.cent).length });
  }
}

// ---------- Solution list ----------

// Headline amounts: bold amounts ("**27.410,00 €**") and amounts in section headings ("## List 3: …, 1.180,00 €").
const md = readFileSync(loesung, "utf8");
const leit = new Set();
for (const m of md.matchAll(/\*\*([^*]*€)\*\*/g)) for (const t of betraegeIn(m[1])) leit.add(t.cent);
for (const m of md.matchAll(/^#{1,6} .*$/gm)) for (const t of betraegeIn(m[0])) leit.add(t.cent);

const pruefungen = [];
for (const { seite, betraege } of ERWARTET) {
  const text = seiten.get(seite);
  for (const b of betraege) {
    const cent = centAus(b);
    const fehler = [];
    if (!leit.has(cent)) fehler.push("kein Leitbetrag in Demo_Faelle.md");
    if (!kern.has(cent)) fehler.push("Rechenkern liefert ihn nicht");
    if (text === undefined) {
      pruefungen.push({ seite, b, stand: fehler.length ? "FEHLER" : "übersprungen", text: fehler.join(", ") || "Seite gibt es noch nicht" });
      continue;
    }
    if (!betraegeIn(text).some((t) => t.cent === cent)) fehler.push("steht nicht auf der Seite");
    pruefungen.push({ seite, b, stand: fehler.length ? "FEHLER" : "ok", text: fehler.join(", ") });
  }
}
const ueberall = new Set([...seiten.values()].flatMap((t) => betraegeIn(t).map((x) => x.cent)));
const nirgends = [...leit].filter((c) => !ueberall.has(c)).sort((a, b) => b - a);

// ---------- Report ----------

console.log(`Beträge: ${seiten.size} Seiten, ${gesamt} Beträge gefunden, ${erlaubt.size} erlaubte Werte (Rechenkern ${kern.size}, Datensatz ${daten.size}).`);
console.log("\nBeträge je Seite:");
const breite = Math.max(...[...gruppen.keys()].map((k) => k.length));
for (const [g, { seiten: n, betraege }] of gruppen) {
  console.log(`  ${g.padEnd(breite)}  ${String(betraege).padStart(5)}${n > 1 ? `  (${n} Seiten)` : ""}`);
}

console.log("\nLösungsliste (Demo_Faelle.md):");
for (const p of pruefungen) console.log(`  ${p.stand.padEnd(12)} ${p.seite}  ${p.b} €${p.text ? `  ${p.text}` : ""}`);
if (nirgends.length) console.log(`  Info: Leitbeträge auf keiner Seite: ${nirgends.map(euro).join(", ")}`);

if (unbekannt.length) {
  console.log(`\nUnbekannte Beträge (weder Rechenkern noch Datensatz): ${unbekannt.length}`);
  for (const u of unbekannt) console.log(`  ${u.seite}  ${u.betrag}${u.mal > 1 ? ` (${u.mal}×)` : ""}\n      „…${u.kontext}…“`);
} else {
  console.log("\nUnbekannte Beträge: keine.");
}

const fehlgeschlagen = pruefungen.filter((p) => p.stand === "FEHLER").length;
if (unbekannt.length || fehlgeschlagen) {
  console.log(`\nNICHT BESTANDEN: ${unbekannt.length} unbekannte Beträge, ${fehlgeschlagen} Prüfungen der Lösungsliste fehlgeschlagen.`);
  process.exit(1);
}
console.log("\nBestanden.");
