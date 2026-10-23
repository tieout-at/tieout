// Ein Screenshot mit Edge headless (Windows), wartet, bis die Datei da ist.
// Aufruf: node scripts/qa/shot.mjs <name> <url> [breite,höhe] [dunkel]
// Beispiel: node scripts/qa/shot.mjs positionen http://localhost:3100/projekte/w21-b-hkls/positionen 1440,900 dunkel
// Ablage: qa-shots/<name>.png (nicht im Repository). Edge rendert headless nicht schmaler als etwa 500 px.

import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const EDGE = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ziel = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "qa-shots");
mkdirSync(ziel, { recursive: true });

const [name, url, groesse = "1440,900", dunkel] = process.argv.slice(2);
if (!name || !url) throw new Error("Aufruf: node scripts/qa/shot.mjs <name> <url> [breite,höhe] [dunkel]");
const datei = join(ziel, `${name}.png`);
if (existsSync(datei)) rmSync(datei);

// Eigenes Profil je Aufnahme, sonst merkt sich Edge Thema und Seitenleiste aus dem letzten Lauf.
const profil = join(tmpdir(), `sw-shot-${name}-${Date.now()}`);
spawn(
  EDGE,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    `--user-data-dir=${profil}`,
    "--virtual-time-budget=8000",
    `--window-size=${groesse}`,
    `--screenshot=${datei}`,
    `--blink-settings=preferredColorScheme=${dunkel ? 0 : 1}`,
    url,
  ],
  { stdio: "ignore" },
);

// Edge kehrt sofort zurück; auf die Datei warten (höchstens 40 Sekunden).
const ende = Date.now() + 40_000;
const uhr = setInterval(() => {
  if (!existsSync(datei) && Date.now() < ende) return;
  clearInterval(uhr);
  setTimeout(() => console.log(existsSync(datei) ? datei : `FEHLT ${datei}`), 300);
}, 250);
