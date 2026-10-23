// Screenshots aller Bildschirme mit Edge headless (Windows): hell und dunkel bei 1440 und 1280 px, hell bei 390 px.
// Aufruf (App läuft mit `npm run start`): node scripts/qa/screens.mjs [basis-url] [ausgabeordner]
// Edge rendert headless nicht schmaler als etwa 500 px; 390 px deshalb zusätzlich am Handy oder im Gerätemodus prüfen.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";

const basis = process.argv[2] ?? "http://localhost:3000";
const ziel = resolve(process.argv[3] ?? "qa-screens");
const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

const SEITEN = [
  ["firma", "/"],
  ["w21", "/projekte/w21-b-hkls"],
  ["p2", "/projekte/p2-w22-bt3"],
  ["p6", "/projekte/p6-rha-w23"],
  ["w21-posten", "/projekte/w21-b-hkls/posten"],
  ["w21-j1", "/projekte/w21-b-hkls/posten/mehrmenge-22-04-12B"],
  ["w21-rb11", "/projekte/w21-b-hkls/posten/regie-RB-11"],
  ["w21-z6", "/projekte/w21-b-hkls/posten/whatsapp-Z6"],
];
const ANSICHTEN = [
  ["hell-1440", "1440,1000", false],
  ["dunkel-1440", "1440,1000", true],
  ["hell-1280", "1280,900", false],
  ["hell-390", "390,1600", false],
];

if (!existsSync(EDGE)) throw new Error(`Edge nicht gefunden: ${EDGE}`);
mkdirSync(ziel, { recursive: true });

function aufnehmen(name, url, groesse, dunkel) {
  const datei = join(ziel, `${name}.png`);
  const args = [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${join(tmpdir(), `sw-qa-${name}`)}`,
    "--virtual-time-budget=4000",
    `--window-size=${groesse}`,
    `--screenshot=${datei}`,
    ...(dunkel ? ["--blink-settings=preferredColorScheme=0"] : []),
    url,
  ];
  return new Promise((fertig) => {
    const p = spawn(EDGE, args, { stdio: "ignore" });
    p.on("exit", () => fertig(datei));
  });
}

async function warteAufDatei(datei, ms = 20_000) {
  const ende = Date.now() + ms;
  while (Date.now() < ende) {
    if (existsSync(datei) && statSync(datei).size > 0) return true;
    await new Promise((r) => setTimeout(r, 250));
  }
  return false;
}

for (const [seite, pfad] of SEITEN) {
  for (const [ansicht, groesse, dunkel] of ANSICHTEN) {
    const datei = await aufnehmen(`${seite}-${ansicht}`, basis + pfad, groesse, dunkel);
    console.log(`${(await warteAufDatei(datei)) ? "ok    " : "FEHLT "} ${datei}`);
  }
}
