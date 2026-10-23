// Wächter für das UI-Fundament: Farben nur in tokens.css, keine freien Stile in Komponenten.
// Bricht, sobald jemand eine Farbe, einen Schatten oder Abstand an den Tokens vorbei einbaut.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const WURZEL = join(__dirname, "..");

function dateien(ordner: string, endungen: string[]): string[] {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return dateien(pfad, endungen);
    return endungen.some((e) => name.endsWith(e)) ? [pfad] : [];
  });
}

const OBERFLAECHE = [...dateien(join(WURZEL, "app"), [".tsx", ".css"]), ...dateien(join(WURZEL, "ui"), [".tsx", ".css"])];
const FARBE = /(?<!href=")#[0-9a-fA-F]{3,8}\b|\b(?:rgba?|hsla?|oklch|oklab|lab|lch|color-mix)\(/;
const TEXTQUELLEN = [...dateien(join(WURZEL, "engine"), [".ts"]), ...dateien(join(WURZEL, "demo"), [".ts"])].filter((p) => !p.endsWith(".test.ts"));

describe("UI-Fundament", () => {
  it("Farben und Schatten stehen nur in tokens.css", () => {
    const verstoesse = OBERFLAECHE.filter((p) => !p.endsWith("tokens.css") && FARBE.test(readFileSync(p, "utf8"))).map((p) => relative(WURZEL, p));
    expect(verstoesse).toEqual([]);
  });

  it("Inline-Stile nur für Tabellen-Spaltenbreiten", () => {
    const erlaubt = new Set(["width", "minWidth", "tableLayout"]);
    const verstoesse: string[] = [];
    for (const p of OBERFLAECHE.filter((x) => x.endsWith(".tsx"))) {
      for (const m of readFileSync(p, "utf8").matchAll(/style=\{\{([^}]*)\}\}/g)) {
        const schluessel = m[1].split(",").map((teil) => teil.split(":")[0].trim()).filter(Boolean);
        if (schluessel.some((s) => !erlaubt.has(s))) verstoesse.push(`${relative(WURZEL, p)}: ${m[0]}`);
      }
    }
    expect(verstoesse).toEqual([]);
  });

  it("keine Tailwind-Klassen mit freien Werten (z. B. p-[13px])", () => {
    const verstoesse = OBERFLAECHE.filter((p) => p.endsWith(".tsx") && /className="[^"]*\[[^\]]+\]/.test(readFileSync(p, "utf8"))).map((p) => relative(WURZEL, p));
    expect(verstoesse).toEqual([]);
  });

  it("keine Trennpunkte „·“ und keine Gedankenstriche im sichtbaren Text (Kommentare ausgenommen)", () => {
    const verstoesse: string[] = [];
    for (const p of OBERFLAECHE.filter((x) => x.endsWith(".tsx"))) {
      readFileSync(p, "utf8")
        .split(/\r?\n/)
        .forEach((zeile, i) => {
          const code = zeile.trim();
          if (code.startsWith("//") || code.startsWith("*") || code.startsWith("/*")) return;
          if (/[·–—]/.test(code)) verstoesse.push(`${relative(WURZEL, p)}:${i + 1}`);
        });
    }
    expect(verstoesse).toEqual([]);
  });

  it("nie „Claim“, „Forcierung“, Präklusion oder Countdowns, auch nicht in Texten aus Rechenkern und Demo", () => {
    const verboten = /\bClaim|Forcierung|präklusi|noch \d+ Tage|Tage übrig|in höchstens \d+ Tagen/i;
    const verstoesse = [...OBERFLAECHE, ...TEXTQUELLEN].filter((p) => verboten.test(readFileSync(p, "utf8"))).map((p) => relative(WURZEL, p));
    expect(verstoesse).toEqual([]);
  });

  it("jede Seite hat den Seitenkopf", () => {
    // Ausnahme: die Anmeldeseite zeigt keine Daten und steht ohne Rahmen.
    const seiten = OBERFLAECHE.filter((p) => /(page|not-found)\.tsx$/.test(p) && !/anmelden/.test(p));
    expect(seiten.length).toBeGreaterThan(0);
    expect(seiten.filter((p) => !readFileSync(p, "utf8").includes("<Seitenkopf")).map((p) => relative(WURZEL, p))).toEqual([]);
  });

  it("die Seitenleiste kennzeichnet die Beispieldaten (steht auf jeder Seite)", () => {
    const leiste = readFileSync(join(WURZEL, "ui", "Seitenleiste.tsx"), "utf8");
    expect(leiste).toContain(">Beispieldaten<");
  });

  it("alles Deaktivierte nennt den Grund im Tooltip", () => {
    const verstoesse: string[] = [];
    for (const p of OBERFLAECHE.filter((x) => x.endsWith(".tsx")))
      for (const m of readFileSync(p, "utf8").matchAll(/<[a-z]+[^>]*aria-disabled="true"[^>]*>/g))
        if (!/\stitle=/.test(m[0])) verstoesse.push(`${relative(WURZEL, p)}: ${m[0]}`);
    expect(verstoesse).toEqual([]);
  });
});
