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
const FARBE = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(|\boklch\(/;

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

  it("nie das Wort „Claim“ und keine Countdowns in der Oberfläche", () => {
    const verstoesse = OBERFLAECHE.filter((p) => /\bClaim|Forcierung|noch \d+ Tage/i.test(readFileSync(p, "utf8"))).map((p) => relative(WURZEL, p));
    expect(verstoesse).toEqual([]);
  });
});
