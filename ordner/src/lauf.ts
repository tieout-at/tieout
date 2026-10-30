// Writes the folder of a company. For each sheet: the picture and the measured place of every value, as the app shows
// them (`app/public/belege/<projekt>/`), and next to it, outside the repository, the file as it would lie in the folder
// with the values reading it must give (`ausgabe/<projekt>/`, for step 18). Same company, same profile, same files.
// Run: npm run erzeugen [-- nur=ab-12,plan-h201-d]

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { datumText, gelesen, type Datensatz, type GelesenerWert } from "@tieout/kern";
import { beispielFirma } from "@tieout/kern/beispiel";
import { chromium, type Page } from "playwright-core";
import sharp from "sharp";
import { KRONFELD, type Profil } from "./profil.ts";
import { blatt, zufall, type Blatt } from "./seiten.ts";
import { stil } from "./stil.ts";

const hier = path.dirname(fileURLToPath(import.meta.url));
const APP = path.join(hier, "..", "..", "app", "public", "belege");
const AUSGABE = path.join(hier, "..", "ausgabe");
const ARBEIT = path.join(hier, "..", ".arbeit");
const QUALITAET = 62;

type Box = [number, number, number, number];
interface Seite {
  bild: string;
  b: number;
  h: number;
  marken: Record<string, Box[]>;
  zuGross?: boolean;
}

const slug = (name: string) =>
  name.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// These two run inside the browser, so they stay text: the bundler's helpers do not exist there.
// A full sheet shrinks as a real form would be printed smaller, instead of cutting a line off.
const PASSEND = `(() => {
  const inhalt = document.querySelector(".inhalt");
  if (!inhalt) return false;
  for (const z of [1, 0.9, 0.8, 0.7, 0.62]) {
    document.documentElement.style.setProperty("--z", String(z));
    if (inhalt.scrollHeight <= inhalt.clientHeight + 1 && inhalt.scrollWidth <= inhalt.clientWidth + 1) return false;
  }
  return true;
})()`;
const LESBAR = `(() => {
  const roh = {};
  for (const el of document.querySelectorAll("[data-place]"))
    for (const stelle of el.getAttribute("data-place").split("|")) roh[stelle] = (roh[stelle] ?? "") + el.textContent;
  return roh;
})()`;
const MESSEN = `(() => {
  const w = document.documentElement.clientWidth;
  const h = document.documentElement.clientHeight;
  const roh = {};
  for (const el of document.querySelectorAll("[data-place]")) {
    const r = el.getBoundingClientRect();
    for (const stelle of el.getAttribute("data-place").split("|"))
      (roh[stelle] ??= []).push([+(r.left / w).toFixed(4), +(r.top / h).toFixed(4), +(r.width / w).toFixed(4), +(r.height / h).toFixed(4)]);
  }
  return roh;
})()`;

async function zeichnen(page: Page, html: string, quer: boolean, scan: boolean, schraeg: number, falz: number, profil: Profil, ziel: string) {
  const [b, h] = quer ? [1754, 1240] : [1240, 1754];
  await page.setViewportSize({ width: b, height: h });
  const seite = `<!doctype html><html lang="de"><head><meta charset="utf-8"><style>:root{--b:${b}px;--h:${h}px;--r:${schraeg.toFixed(2)}deg;--falz:${falz}%}${stil(profil)}</style></head><body${scan ? ` class="scan"` : ""}>${html}</body></html>`;
  const datei = path.join(ARBEIT, "blatt.html");
  await writeFile(datei, seite);
  await page.goto(`file:///${datei.replace(/\\/g, "/")}`);
  await page.evaluate("document.fonts.ready.then(() => undefined)");
  const zuGross = (await page.evaluate(PASSEND)) as boolean;
  const marken = (await page.evaluate(MESSEN)) as Record<string, Box[]>;
  const lesbar = (await page.evaluate(LESBAR)) as Record<string, string>;
  const bild = await page.screenshot({ type: "png" });
  await sharp(bild).webp({ quality: QUALITAET }).toFile(ziel);
  return { b, h, marken, zuGross, lesbar };
}

/** Numbers that must stand on the paper as the core has them: a sheet with a wrong quantity is worse than none. */
const ZAHLEN = new Set(["menge", "betrag", "ep", "positionNr", "nr"]);
const ohneLuecken = (s: string) => s.replace(/\s+/g, "");
function falscheZahlen(werte: GelesenerWert[], seite: number, lesbar: Record<string, string>): string[] {
  return werte
    // a cloud on a plan names no position: the twin ties it to one
    .filter((w) => w.seite === seite && ZAHLEN.has(w.schluessel) && !w.stelle.startsWith("Wolke ") && !ohneLuecken(lesbar[w.stelle] ?? "").includes(ohneLuecken(w.text)))
    .map((w) => `${w.stelle}: ${w.text}`);
}

/** The file as it lies in a folder: pictures of pages with no text in them, so reading it is as hard as a real scan. */
async function alsPdf(page: Page, blaetter: { datei: string; b: number; h: number }[], ziel: string) {
  const seiten = blaetter.map((x) => `<img src="file:///${x.datei.replace(/\\/g, "/")}" style="display:block;width:${x.b}px;height:${x.h}px;break-after:page">`).join("");
  const datei = path.join(ARBEIT, "pdf.html");
  await writeFile(datei, `<!doctype html><html><head><style>@page{margin:0;size:${blaetter[0].b}px ${blaetter[0].h}px}body{margin:0}</style></head><body>${seiten}</body></html>`);
  await page.goto(`file:///${datei.replace(/\\/g, "/")}`, { waitUntil: "load" });
  await page.pdf({ path: ziel, preferCSSPageSize: true, printBackground: true });
}

const fehler: string[] = [];

async function belegZeichnen(page: Page, d: Datensatz, firma: ReturnType<typeof beispielFirma>, belegId: string, ordner: string, profil: Profil) {
  const b = d.belege.find((x) => x.id === belegId)!;
  const werte = gelesen(d, b.id);
  const seiten: Record<string, Seite> = {};
  let aenderung: string | undefined;
  for (let n = 1; n <= b.seiten; n++) {
    const x: Blatt | null = blatt(firma, d, b, n, werte, profil);
    if (!x) continue;
    const r = zufall(`${b.id}:${n}:scan`, profil.saat);
    const schraeg = x.scan ? (r() - 0.5) * 2 * profil.schraeglage : 0;
    const falz = 46 + r() * 8;
    const name = `${b.id}-${n}.webp`;
    const { lesbar, ...s } = await zeichnen(page, x.html, x.quer, x.scan, schraeg, falz, profil, path.join(ordner, name));
    seiten[n] = { bild: name, ...s };
    for (const f of falscheZahlen(werte, n, lesbar)) fehler.push(`${b.id} Seite ${n}: ${f}`);
    if (x.aenderung) {
      aenderung = `${b.id}-${n}-aenderung.webp`;
      await zeichnen(page, x.aenderung, x.quer, false, 0, falz, profil, path.join(ordner, aenderung));
    }
  }
  return { seiten, aenderung, werte };
}

const nur = process.argv.find((a) => a.startsWith("nur="))?.slice(4).split(",");
const firma = beispielFirma();
const profil = KRONFELD;
await mkdir(ARBEIT, { recursive: true });
const browser = await chromium.launch({ channel: "msedge" });
const page = await browser.newPage();

let blaetter = 0;
let zuGross = 0;
for (const d of firma.projekte) {
  const name = slug(d.projekt.name);
  const ordner = path.join(APP, name);
  const soll = path.join(AUSGABE, name);
  if (!nur) await rm(ordner, { recursive: true, force: true });
  await mkdir(ordner, { recursive: true });
  await mkdir(soll, { recursive: true });
  for (const b of d.belege) {
    if (nur && !nur.includes(b.id)) continue;
    const { seiten, aenderung, werte } = await belegZeichnen(page, d, firma, b.id, ordner, profil);
    if (!Object.keys(seiten).length) continue;
    blaetter += Object.keys(seiten).length;
    for (const [n, s] of Object.entries(seiten))
      if (s.zuGross) {
        zuGross++;
        console.log(`zu groß: ${b.id} Seite ${n}`);
      }
    const plan = d.plaene.find((p) => p.belegId === b.id);
    const vorher = plan ? d.plaene.filter((p) => p.planNr.wert === plan.planNr.wert && p.datum.wert < plan.datum.wert).at(-1) : undefined;
    const beschriftet = (p: NonNullable<typeof plan>) => `Index ${p.index.wert} · ${datumText(p.datum.wert)}`;
    const vergleich = aenderung && vorher && plan ? { mit: vorher.belegId, aenderung, links: beschriftet(vorher), rechts: beschriftet(plan) } : undefined;
    await writeFile(path.join(ordner, `${b.id}.json`), JSON.stringify({ belegId: b.id, seiten: Object.fromEntries(Object.entries(seiten).map(([n, { zuGross: _, ...s }]) => [n, s])), vergleich }));
    await writeFile(path.join(soll, `${b.id}.soll.json`), JSON.stringify({ datei: b.dateiname, art: b.art, seiten: b.seiten, werte }, null, 1));
    await alsPdf(page, Object.values(seiten).map((s) => ({ datei: path.join(ordner, s.bild), b: s.b, h: s.h })), path.join(soll, `${b.dateiname.replace(/\.[a-z]+$/i, "")}.pdf`));
  }
}
await browser.close();
await rm(ARBEIT, { recursive: true, force: true });
console.log(`${blaetter} Blätter, ${zuGross} zu groß, ${fehler.length} falsche Zahlen`);
fehler.slice(0, 20).forEach((f) => console.log(`falsch: ${f}`));
if (zuGross || fehler.length) process.exitCode = 1;
