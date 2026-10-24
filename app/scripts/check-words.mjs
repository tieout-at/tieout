// After `next build`: fails on words the app must never show (CLAUDE.md rules 1, 2 and 5, vocabulary in
// SPEZIFIKATION.md section 6) and on open placeholders. Checks two places, because neither catches everything alone:
//   1. every exported page: visible text and the attributes people read (aria-label, title, placeholder, alt, meta);
//   2. every string and JSX text in src/: text that only appears after a click (search, menus, popovers).
// Amounts are checked in src/ only: the pages show the amounts kern/ computes at build time (step 3), but no amount
// may be typed into the app itself.
// Quoted originals (the text of a real Beleg, from step 5 on) will need an exception; add it when they exist.
// Usage: node scripts/check-words.mjs [out-dir] [src-dir]

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const out = process.argv[2] ?? "out";
const src = process.argv[3] ?? "src";

// Pattern, and what the app says instead.
const FORBIDDEN = [
  [/\bClaims?\b/i, "Schlussrechnung, verrechenbar, Beweispaket"],
  [/\bPosten\b/, "Fund"],
  [/\bWorkspace\b/i, "Betrieb"],
  [/\bMandant/, "Betrieb"],
  [/\bKlausel/, "Vertragspunkt"],
  [/\bKalkül\b/, "Preisbasis"],
  [/\bLeistungskatalog/, "Leistungsverzeichnis"],
  [/\bLV-Pos/, "Position"],
  [/\bRegiezettel/, "Regiebericht"],
  [/\bTeilrechnung/, "Abschlagsrechnung"],
  [/\bTimesheet/i, "Stundenzettel"],
  [/\bBefund/, "Fund"],
  [/\bFinding/i, "Fund"],
  [/\bZuruf/, "WhatsApp-Meldung"],
  [/\bjetzt verrechenbar/i, "zusätzlich verrechenbar"],
  [/\boffen verrechenbar/i, "zusätzlich verrechenbar"],
  // the Art "Änderung angemeldet" and the fact "angemeldet mit E-Mail vom …" are words of kern/ (SPEZIFIKATION.md 3.2)
  [/(?<!Änderung )\bangemeldet\b(?! mit )/, "in Klärung"],
  [/\bverloren\b/, "Nicht verrechnen, Pauschale laut Vertrag"],
  [/\bverfristet/, "Rechtsfrage (no legal verdict)"],
  [/\bpräkludiert/, "Rechtsfrage (no legal verdict)"],
  [/\bBraucht Anwalt/, "Rechtsfrage"],
  [/\bunzulässig/, "Abzug ohne Vertragspunkt"],
  [/\brechtswidrig/, "Abzug ohne Vertragspunkt"],
  [/\bPrüfkaskade/, "Rechnungsabschluss"],
  [/\bSaldo\b/, "Restforderung"],
  [/\bAudit\b/i, "Vorprüfung"],
  [/\bGU-Check/, "Vorprüfung"],
  [/\bApproval/i, "Prüfung, Freigabe"],
  [/\bKI-Vorschlag/, "maschinell gelesen"],
  [/\bConfidence/i, "maschinell gelesen"],
  [/\bLog\b/, "Verlauf"],
  [/\bPipeline\b/i, "Abschluss-Lauf"],
  [/\bWorkflows?\b/i, "Abläufe"],
  [/\bAutomation/i, "Abläufe"],
  [/\bTwin\b/i, "Digitaler Zwilling"],
  [/\bverbunden\b/, "aus Ordner importiert"],
  [/\bsynchronisiert/, "aus Ordner importiert"],
  [/\bCountdown/i, "Schlussrechnung legen bis"],
  [/\bfällig/, "Schlussrechnung legen bis"],
  [/\bDemo\b/i, "Beispieldaten"],
  [/\bFake\b/i, "Beispieldaten"],
  [/\bKunden?\b/, "Auftraggeber"],
  [/\bDossier\b/, "Beweispaket"],
  [/\bAkte\b/, "Beweispaket"],
  [/\bEvidence\b/i, "Beleg"],
  [/\bDokument/, "Beleg"],
  [/\bZeilen?\b/, "Position"],
  [/(?<![-\p{L}])Mails?\b/u, "E-Mail"],
  [/\bgebaut\b/, "erbracht"],
  [/\bDelta\b/, "offen"],
  [/\b(?:LV|AG|EP|HKLS)\b/, "the full word"],
  [/\b(?:AR|RB|AB)[ -]?\d/, "Abschlagsrechnung 3, Regiebericht 11, Aufmaßblatt 12"],
  [/\s[–—]\s/, "no dash as punctuation"],
  [/PLATZHALTER/, "a real value"],
];

const AMOUNT = [/\d{1,3}(?:\.\d{3})*,\d{2}\s?€|€\s?\d/, "no amount typed into the app; amounts come from kern/"];

function files(dir, keep) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path, keep);
    return keep(name) ? [path] : [];
  });
}

/** Text a reader sees on an exported page, plus the attributes read out or shown on hover. */
function pageText(html) {
  const attributes = [...html.matchAll(/\s(?:aria-label|title|placeholder|alt|content)="([^"]*)"/g)].map((m) => m[1]);
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  return `${text} ${attributes.join(" ")}`.replace(/\s+/g, " ");
}

/** Strings and JSX text of a source file, without comments, import paths and class names. */
function sourceText(code) {
  const plain = code
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/^\s*\/\/.*$/gm, " ")
    .replace(/^import .*$/gm, " ")
    .replace(/className=(?:"[^"]*"|\{[^}]*\})/g, " ")
    .replace(/cn\([^)]*\)/g, " ");
  const strings = [...plain.matchAll(/"([^"\n]*)"|`([^`]*)`/g)].map((m) => m[1] ?? m[2]);
  const jsxText = [...plain.matchAll(/>([^<>{}]*[\p{L}][^<>{}]*)</gu)].map((m) => m[1]);
  return [...strings, ...jsxText].join(" | ");
}

const problems = [];
function check(where, text, rules = FORBIDDEN) {
  for (const [pattern, instead] of rules) {
    const hit = text.match(pattern);
    if (hit) problems.push(`${where}: "${hit[0].trim()}" (say: ${instead})`);
  }
}

const pages = files(out, (n) => n.endsWith(".html"));
for (const file of pages) check(file, pageText(readFileSync(file, "utf8")));
const sources = files(src, (n) => /\.tsx?$/.test(n) && !/\.test\.tsx?$/.test(n));
for (const file of sources) check(file, sourceText(readFileSync(file, "utf8")), [...FORBIDDEN, AMOUNT]);

if (problems.length) {
  console.error(`check-words: ${problems.length} problem(s)\n  ${problems.join("\n  ")}`);
  process.exit(1);
}
console.log(`check-words: ${pages.length} pages and ${sources.length} source files, no forbidden words`);
