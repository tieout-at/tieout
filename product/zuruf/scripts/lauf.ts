// Lernschleife ausführen. Aufrufe:
//   npm run lauf                      alle sichtbaren Szenarien, mit Bewerter
//   npm run lauf -- --nur klar        nur Szenarien, deren id mit „klar“ beginnt
//   npm run lauf -- --ohne-bewerter   nur Prüfungen im Code (billiger)
//   npm run lauf -- --zurueck         NUR die zurückgehaltenen Szenarien, Bericht ohne Inhalte (Abnahme)
// Bericht: laeufe/<zeit>/bericht.md und ergebnisse.json (nicht im Repo). Bei --zurueck nur Zahlen.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spiele, type Ergebnis } from "../src/lernschleife.ts";
import { kiWeg, kostenUsd, verbrauch } from "../src/llm.ts";
import { SzenarioSchema, type Szenario } from "../src/szenario.ts";
import { kiVersteher } from "../src/verstehen.ts";

const args = process.argv.slice(2);
const zurueck = args.includes("--zurueck");
// Nur für einen Subagent, der Holdout-Fehler als abstrakte Muster zusammenfasst. Die Hauptsitzung liest diese Datei nicht.
const mitProtokoll = args.includes("--mit-protokoll");
const bewerten = !args.includes("--ohne-bewerter");
const nur = args.includes("--nur") ? args[args.indexOf("--nur") + 1] : undefined;
const parallel = args.includes("--parallel") ? Number(args[args.indexOf("--parallel") + 1]) : 4;

function lade(ordner: string): Szenario[] {
  return readdirSync(ordner)
    .filter((d) => d.endsWith(".json"))
    .map((d) => SzenarioSchema.parse(JSON.parse(readFileSync(path.join(ordner, d), "utf8"))))
    .filter((s) => !nur || s.id.startsWith(nur));
}

const szenarien = lade(zurueck ? "szenarien/zurueck" : "szenarien");
if (!szenarien.length) {
  console.log("Keine Szenarien gefunden.");
  process.exit(1);
}
console.log(`${szenarien.length} Szenarien, ${bewerten ? "mit" : "ohne"} Bewerter, ${parallel} parallel, KI über ${kiWeg() === "abo" ? "Claude-Abo" : "API"}`);

const versteher = kiVersteher();
const ergebnisse: Ergebnis[] = [];
let naechstes = 0;
async function arbeiter() {
  while (naechstes < szenarien.length) {
    const s = szenarien[naechstes++]!;
    try {
      const e = await spiele(s, versteher, { bewerten });
      ergebnisse.push(e);
      const ok = e.pruefungen.every((p) => p.ok);
      console.log(`${ok ? "OK  " : "FEHL"} ${zurueck ? s.kategorie : s.id}${e.bewertung ? `  Note ${e.bewertung.note}` : ""}`);
    } catch (err) {
      console.log(`ABBRUCH ${zurueck ? s.kategorie : s.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
await Promise.all(Array.from({ length: Math.min(parallel, szenarien.length) }, arbeiter));

// ---------- Kennzahlen (GESTALTUNG.md, Abschnitt „Woran wir messen“) ----------
const median = (xs: number[]) => {
  if (!xs.length) return NaN;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m]! : (s[m - 1]! + s[m]!) / 2;
};
const feldPruefungen = ergebnisse.flatMap((e) => e.pruefungen.filter((p) => /^eintrag\d+\.(projekt|ort|leistung|personen|dauer|menge|anweiser|datum)$/.test(p.name)));
const kennzahlen = {
  szenarien: ergebnisse.length,
  bestanden: ergebnisse.filter((e) => e.pruefungen.every((p) => p.ok)).length,
  nachrichtenBisBestaetigungMedian: median(ergebnisse.flatMap((e) => (e.absenderNachrichtenBisBestaetigung ? [e.absenderNachrichtenBisBestaetigung] : []))),
  rueckfragenMedian: median(ergebnisse.map((e) => e.rueckfragen)),
  rueckfragenMax: Math.max(...ergebnisse.map((e) => e.rueckfragen)),
  erfundeneWerte: ergebnisse.reduce((s, e) => s + e.erfunden, 0),
  felderRichtigProzent: feldPruefungen.length ? Math.round((100 * feldPruefungen.filter((p) => p.ok).length) / feldPruefungen.length) : NaN,
  verboteneInhalte: ergebnisse.reduce((s, e) => s + e.pruefungen.filter((p) => p.name.startsWith("verboten:")).length, 0),
  noteMedian: median(ergebnisse.flatMap((e) => (e.bewertung ? [e.bewertung.note] : []))),
  noteMin: Math.min(...ergebnisse.flatMap((e) => (e.bewertung ? [e.bewertung.note] : [99]))),
  antwortzeitMedianMs: median(ergebnisse.flatMap((e) => e.dauerMs)),
  verworfeneAngaben: ergebnisse.reduce((s, e) => s + e.verworfen, 0),
  technischeFehler: ergebnisse.reduce((s, e) => s + e.fehler.length, 0),
  anfragen: verbrauch.anfragen,
  kiWeg: kiWeg(),
  // Beim Abo nur Vergleichswert zum Listenpreis; abgerechnet wird über das Abo-Limit.
  kostenUsd: Number(kostenUsd().toFixed(2)),
};
console.log(JSON.stringify(kennzahlen, null, 1));

const stempel = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const ordner = path.join("laeufe", `${zurueck ? "zurueck-" : ""}${stempel}`);
mkdirSync(ordner, { recursive: true });
if (zurueck) {
  const proKategorie = Object.fromEntries(
    [...new Set(ergebnisse.map((e) => e.szenario.kategorie))].map((k) => [k, ergebnisse.filter((e) => e.szenario.kategorie === k && e.pruefungen.every((p) => p.ok)).length + "/" + ergebnisse.filter((e) => e.szenario.kategorie === k).length]),
  );
  writeFileSync(path.join(ordner, "kennzahlen.json"), JSON.stringify({ kennzahlen, proKategorie }, null, 1));
  if (mitProtokoll) writeFileSync(path.join(ordner, "protokoll-nur-fuer-subagent.json"), JSON.stringify(ergebnisse, null, 1));
  console.log(JSON.stringify(proKategorie));
} else {
  writeFileSync(path.join(ordner, "ergebnisse.json"), JSON.stringify(ergebnisse, null, 1));
  const md: string[] = [`# Lauf ${stempel}`, "", "```json", JSON.stringify(kennzahlen, null, 1), "```", ""];
  for (const e of [...ergebnisse].sort((a, b) => a.szenario.id.localeCompare(b.szenario.id))) {
    const fehl = e.pruefungen.filter((p) => !p.ok);
    md.push(`## ${fehl.length ? "FEHL" : "OK"} ${e.szenario.id}${e.bewertung ? ` (Note ${e.bewertung.note})` : ""}`, "", `Soll: ${e.szenario.erwartung.sollVerhalten}`, "");
    if (fehl.length) md.push(`Fehlgeschlagen: ${fehl.map((p) => `${p.name}${p.detail ? ` (${p.detail})` : ""}`).join("; ")}`, "");
    if (e.bewertung) md.push(`Bewerter: ${e.bewertung.begruendung}`, ...e.bewertung.verstoesse.map((v) => `- ${v}`), "");
    md.push("```", ...e.gespraech.map((z) => `${z.von === "agent" ? "AGENT" : `ABSENDER(${z.art})`}: ${z.text}${z.knoepfe ? `  {${z.knoepfe.join(" | ")}}` : ""}`), "```", "");
  }
  writeFileSync(path.join(ordner, "bericht.md"), md.join("\n"));
  console.log(`Bericht: ${path.join(ordner, "bericht.md")}`);
}
