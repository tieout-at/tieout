import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PROJECTS, projectSlug } from "./example";
import { business, findCalculations, findRows, projectCalculations, projectRows } from "./kern-data";
import { matchingSum } from "./table";

// Expected amounts must stand in the solution list (docs/Demo_Faelle.md), as in kern/test: a typo in a test fails here.
const list = readFileSync(new URL("../../../docs/Demo_Faelle.md", import.meta.url), "utf8");
function listed(text: string): string {
  if (!list.includes(text)) throw new Error(`${text} is not in docs/Demo_Faelle.md`);
  return text;
}

describe("kern data", () => {
  it("names the same projects as the core, so search, Start and tables tell one truth", () => {
    const b = business();
    expect(PROJECTS.map((p) => [p.id, p.name, p.client])).toEqual(b.projekte.map((p) => [p.projektId, p.name, p.auftraggeber.kurzname]));
    expect(PROJECTS.map((p) => p.slug)).toEqual(b.projekte.map((p) => projectSlug(p.name)));
    for (const p of PROJECTS) {
      const row = projectRows().find((r) => r.id === p.id)!;
      expect(p.finalInvoiceBy ?? null).toBe(row.date?.label === "Schlussrechnung legen bis" ? row.date.text : null);
    }
  });

  it("makes slugs without umlauts", () => {
    expect(projectSlug("Bürohaus Kiefernau")).toBe("buerohaus-kiefernau");
  });

  it("shows the project amounts of the solution list and the two business sums apart", () => {
    const rows = projectRows();
    const by = (name: string) => rows.find((r) => r.name === name)!;
    expect([by("Wohnpark Mooshaim").extra?.text, by("Wohnpark Mooshaim").unclear?.text]).toEqual([listed("14.620,15 €"), listed("8.073,59 €")]);
    expect(by("Bürohaus Kiefernau").extra?.text).toBe(listed("4.852,73 €"));
    expect([by("Volksschule Ahornbrunn").extra?.text, by("Volksschule Ahornbrunn").unclear?.text]).toEqual([listed("3.160,08 €"), listed("245,60 €")]);
    expect(by("Wohnhof Erlenhain").extra).toBeNull();
    expect(rows.map((r) => r.status.colour)).toEqual(["rot", "gelb", "gelb", "grau", "grau"]);

    const calc = projectCalculations();
    expect(matchingSum(calc.extra[0], rows)?.text).toBe(listed("22.632,96 €"));
    expect(matchingSum(calc.unclear[0], rows)?.text).toBe(listed("8.319,19 €"));
    expect(matchingSum(calc.extra[0], rows.filter((r) => r.name !== "Bürohaus Kiefernau" && r.name !== "Volksschule Ahornbrunn"))?.text).toBe("14.620,15 €");
    expect(matchingSum(calc.extra[0], rows.filter((r) => r.name !== "Volksschule Ahornbrunn"))).toBeNull();
  });

  it("lists every find of the open projects with the sums of the solution list", () => {
    const rows = findRows();
    expect(rows).toHaveLength(14);
    expect(rows.filter((r) => r.project.name === "Wohnpark Mooshaim")).toHaveLength(8);
    const f1 = rows[0];
    expect([f1.number, f1.amount.text, f1.belegstand?.text, f1.risk?.reason, f1.risk?.amount.text]).toEqual(["F1", listed("6.648,60 €"), "belegt", "Aufmaß nicht gegengezeichnet", "6.648,60 €"]);

    const calc = findCalculations(rows);
    const sum = (id: string, visible = rows) => matchingSum([...calc.amount, ...calc.risk].find((c) => c.id === id)!, visible)?.text;
    expect(sum("zusaetzlich")).toBe(listed("22.632,96 €"));
    expect(sum("klaerung")).toBe(listed("8.319,19 €"));
    expect(sum("risiko")).toBe(listed("6.843,00 €"));
    const mooshaim = rows.filter((r) => r.project.name === "Wohnpark Mooshaim");
    expect([sum("zusaetzlich", mooshaim), sum("klaerung", mooshaim), sum("risiko", mooshaim)]).toEqual([listed("14.620,15 €"), listed("8.073,59 €"), listed("6.843,00 €")]);
    expect([sum("beleg_fehlt", mooshaim), sum("nachtrag", mooshaim)]).toEqual([listed("1.119,99 €"), listed("6.953,60 €")]);
    // one find of a group filtered away: no amount at all
    expect(sum("zusaetzlich", rows.slice(1))).toBeUndefined();
  });
});
