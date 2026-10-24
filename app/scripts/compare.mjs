// Side-by-side pictures: an Attio reference left, the same tieout screen right (both at the 1912 × 930 viewport).
// Usage: node scripts/compare.mjs [shots-dir]
// Needs <shots-dir>/attio/<name>.jpg (taken from Maxi S.'s Attio workspace, never committed) and
// <shots-dir>/1912/<screen>.png from scripts/screens.mjs. Writes <shots-dir>/vergleich/<nn>-<screen>.png.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright-core";

const dir = resolve(process.argv[2] ?? "qa-shots");

// tieout screen, Attio reference, caption
const PAIRS = [
  ["start", "home", "Start ↔ Home"],
  ["aufgaben", "tasks", "Aufgaben ↔ Tasks"],
  ["berichte", "reports", "Berichte ↔ Reports"],
  ["ablaeufe", "workflows", "Abläufe ↔ Workflows"],
  ["belege", "companies", "Belege ↔ Companies (Tabelle)"],
  ["e-mails", "emails", "E-Mails ↔ Emails"],
  ["whatsapp-meldungen", "calls", "WhatsApp-Meldungen ↔ Calls"],
  ["betrieb", "record", "Betrieb ↔ Datensatz (Company)"],
  ["auftraggeber", "companies", "Auftraggeber ↔ Companies (Tabelle)"],
  ["auftraggeber-hornfeld", "record", "Auftraggeber Hornfeld Bau ↔ Datensatz (Company)"],
  ["projekte", "companies", "Projekte ↔ Companies (Tabelle)"],
  ["projekte-sortierung", "companies", "Projekte, Sortierung offen ↔ Companies"],
  ["projekt", "record", "Projekt Wohnpark Mooshaim, Überblick ↔ Datensatz (Company)"],
  ["projekt-funde", "companies", "Projekt, Reiter Funde ↔ Companies (Tabelle)"],
  ["funde", "companies", "Funde ↔ Companies (Tabelle)"],
  ["funde-filter", "companies", "Funde, Filter Belegstand ↔ Companies"],
  ["schlussrechnungen", "notes", "Schlussrechnungen ↔ Notes (Leerzustand)"],
  ["suche", "search", "Suche (Strg K) ↔ Search (Ctrl K)"],
  ["betrieb-menue", "workspace-menu", "Betriebs-Menü ↔ Workspace-Menü"],
  ["erste-schritte", "getting-started", "Erste Schritte ↔ Getting started"],
];

mkdirSync(join(dir, "vergleich"), { recursive: true });
const browser = await chromium.launch({ channel: "msedge", headless: true });
// Twice the pixels, so both screens keep their full detail when zoomed in.
const page = await browser.newPage({ viewport: { width: 1920, height: 560 }, deviceScaleFactor: 2 });
let made = 0;
const index = [];
for (const [i, [ours, theirs, caption]] of PAIRS.entries()) {
  const a = join(dir, "attio", `${theirs}.jpg`);
  const b = join(dir, "1912", `${ours}.png`);
  if (!existsSync(a) || !existsSync(b)) {
    console.log(`skip ${ours}: missing ${existsSync(a) ? b : a}`);
    continue;
  }
  const html = `<!doctype html><meta charset="utf-8"><style>
    body{margin:0;font:500 15px/20px Inter,Segoe UI,sans-serif;color:#0a1020;background:#f4f6f9}
    h1{margin:0;padding:12px 16px 8px;font-size:16px}
    .row{display:flex;gap:16px;padding:0 16px 16px}
    figure{margin:0;flex:1}
    figcaption{font-size:13px;color:rgb(10 16 32/.63);padding:0 0 6px}
    img{width:100%;display:block;border:1px solid #d5dce6;border-radius:6px;background:#fff}
  </style><h1>${caption}</h1><div class="row">
    <figure><figcaption>Attio (Vorlage)</figcaption><img src="${pathToFileURL(a)}"></figure>
    <figure><figcaption>tieout</figcaption><img src="${pathToFileURL(b)}"></figure>
  </div>`;
  const file = join(dir, "vergleich", "_seite.html");
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.waitForLoadState("load");
  const name = `${String(i + 1).padStart(2, "0")}-${ours}.png`;
  await page.screenshot({ path: join(dir, "vergleich", name), fullPage: true });
  index.push(`<h2>${caption}</h2><div class="row"><a href="../attio/${theirs}.jpg"><img src="../attio/${theirs}.jpg"></a><a href="../1912/${ours}.png"><img src="../1912/${ours}.png"></a></div>`);
  made += 1;
}
await browser.close();
writeFileSync(
  join(dir, "vergleich", "index.html"),
  `<!doctype html><meta charset="utf-8"><title>Vergleich Attio und tieout</title><style>
    body{margin:0 auto;max-width:2400px;padding:16px;font:500 15px/20px Inter,Segoe UI,sans-serif;color:#0a1020;background:#f4f6f9}
    h2{font-size:16px;margin:24px 0 8px}.row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
    img{width:100%;border:1px solid #d5dce6;border-radius:6px;background:#fff}
  </style><h1>Links Attio (Vorlage), rechts tieout</h1>${index.join("")}`,
);
console.log(`compare: ${made} picture(s) in ${join(dir, "vergleich")}`);
