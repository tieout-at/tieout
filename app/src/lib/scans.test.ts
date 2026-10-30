import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { gelesen } from "@tieout/kern";
import { describe, expect, it } from "vitest";

import { firm } from "./kern-data";
import { projectSlug } from "./example";
import { lineOf, marksOf, type Box, type ScanBeleg } from "./scans";

const ROOT = path.join(process.cwd(), "public", "belege");
const read = (project: string, belegId: string): ScanBeleg | null => {
  const file = path.join(ROOT, project, `${belegId}.json`);
  return existsSync(file) ? (JSON.parse(readFileSync(file, "utf8")) as ScanBeleg) : null;
};
const projects = firm().projekte.map((d) => ({ d, slug: projectSlug(d.projekt.name) }));
const inside = ([l, t, w, h]: Box) => l >= -0.01 && t >= -0.01 && l + w <= 1.01 && t + h <= 1.01 && w > 0 && h > 0;

describe("the folder on paper", () => {
  it("has a sheet for every page the twin read, except photos, and a mark for every value on it", () => {
    let values = 0;
    for (const { d, slug } of projects)
      for (const b of d.belege) {
        const werte = gelesen(d, b.id);
        if (b.art === "foto" || !werte.length) continue;
        const scan = read(slug, b.id);
        expect(scan, `${slug}/${b.id}`).not.toBeNull();
        for (const w of werte) {
          const page = scan!.seiten[String(w.seite)];
          expect(page, `${b.id} Seite ${w.seite}`).toBeTruthy();
          expect(marksOf(page, w.stelle).length, `${b.id} Seite ${w.seite}: ${w.stelle}`).toBeGreaterThan(0);
          values++;
        }
      }
    expect(values).toBeGreaterThan(3000);
  });

  it("marks every place inside its page", () => {
    for (const { slug } of projects)
      for (const file of readdirSync(path.join(ROOT, slug)).filter((f) => f.endsWith(".json"))) {
        const scan = read(slug, file.replace(/\.json$/, ""))!;
        for (const page of Object.values(scan.seiten)) for (const [stelle, boxes] of Object.entries(page.marken)) for (const b of boxes) expect(inside(b), `${file}: ${stelle} ${b}`).toBe(true);
      }
  });

  it("points to pictures that exist", () => {
    for (const { slug } of projects)
      for (const file of readdirSync(path.join(ROOT, slug)).filter((f) => f.endsWith(".json"))) {
        const scan = read(slug, file.replace(/\.json$/, ""))!;
        for (const page of Object.values(scan.seiten)) expect(existsSync(path.join(ROOT, slug, page.bild)), page.bild).toBe(true);
        if (scan.vergleich) expect(existsSync(path.join(ROOT, slug, scan.vergleich.aenderung))).toBe(true);
      }
  });

  it("compares the plans that changed with their earlier index", () => {
    const h201 = read("wohnpark-mooshaim", "plan-h201-d")!;
    expect(h201.vergleich).toMatchObject({ mit: "plan-h201-c", links: "Index C · 12.02.2026", rechts: "Index D · 03.04.2026" });
    expect(read("wohnpark-mooshaim", "plan-l310-e")!.vergleich?.mit).toBe("plan-l310-d");
    expect(read("wohnpark-mooshaim", "plan-h201-c")!.vergleich).toBeUndefined();
  });
});

describe("lineOf", () => {
  const page = { bild: "", b: 1, h: 1, marken: { "Pos. 1": [[0, 0, 1, 0.1] as Box], "Pos. 1, Einheitspreis": [[0.8, 0, 0.2, 0.1] as Box], Unterschrift: [[0, 0.8, 0.4, 0.1] as Box] } };

  it("gives the whole line of a value in a line", () => {
    expect(lineOf(page, "Pos. 1, Einheitspreis")).toEqual([[0, 0, 1, 0.1]]);
  });
  it("gives the place itself otherwise", () => {
    expect(lineOf(page, "Unterschrift")).toEqual([[0, 0.8, 0.4, 0.1]]);
  });
});

describe("marksOf", () => {
  const page = { bild: "", b: 1, h: 1, marken: { "Pos. 22.04.12B": [[0, 0, 1, 1] as Box], "Pos. 22.04.12B, Einheitspreis": [[0.5, 0, 0.5, 1] as Box], Kopf: [[0, 0, 0.1, 0.1] as Box] } };

  it("takes the place itself first", () => {
    expect(marksOf(page, "Pos. 22.04.12B, Einheitspreis")).toEqual([[0.5, 0, 0.5, 1]]);
  });
  it("falls back to the part a place lies in", () => {
    expect(marksOf(page, "Pos. 22.04.12B, Menge")).toEqual([[0, 0, 1, 1]]);
  });
  it("gives nothing for a place that is not on the page, or no place", () => {
    expect(marksOf(page, "Unterschrift")).toEqual([]);
    expect(marksOf(page, null)).toEqual([]);
  });
  it("gives the same empty list every time, so that an effect on it does not run on every render", () => {
    expect(marksOf(page, "Unterschrift")).toBe(marksOf(page, null));
  });
});
