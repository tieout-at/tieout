import { euro } from "@tieout/kern";
import { describe, expect, it } from "vitest";
import type { Decision } from "./decisions";
import { findSlug } from "./example";
import { findHighlights } from "./finds";
import { business, findCalculations, findRows, projectCalculations, projectRows } from "./kern-data";
import { live } from "./kern-live";
import { projectHighlights } from "./records";
import { columnSums, footerSum, matchingSum, type Row } from "./table";
import { twinView } from "./twin";

const built = findRows();
const f1 = built[0];
const decision = (row: Row, stand: Decision["stand"], zeit = "2026-10-25T10:00"): Decision => ({ fundSchluessel: row.id, zeit, wer: "Abrechnung", stand });
const mooshaim = (rows: typeof built) => rows.filter((r) => r.project.name === "Wohnpark Mooshaim");

describe("the core in the browser (step 6b)", () => {
  it("without decisions computes exactly what the pages were built with (amount audit)", () => {
    const l = live([]);
    expect(l.findRows()).toEqual(built);
    expect(l.findCalculations()).toEqual(findCalculations());
    expect(l.projectRows()).toEqual(projectRows());
    expect(l.projectCalculations()).toEqual(projectCalculations());
    expect(l.projectHighlights("p1")).toEqual(projectHighlights("p1"));
    expect(l.findHighlights(findSlug("Wohnpark Mooshaim", "F1"))).toEqual(findHighlights(findSlug("Wohnpark Mooshaim", "F1"), business()));
    expect(l.twinView("wohnpark-mooshaim")).toEqual(twinView("p1"));
  });

  it("after a check every column of the board has the core's sum, on the business and on the project", () => {
    const l = live([decision(f1, "geprueft")]);
    const rows = l.findRows();
    const calcs = l.findCalculations().amount.filter((c) => c.id === "zusaetzlich" || c.id === "klaerung");
    for (const scope of [rows, mooshaim(rows)]) {
      for (const state of ["gefunden", "geprueft"] as const) {
        const sums = columnSums(calcs, scope.filter((r) => r.decisionState === state));
        expect(sums.length).toBeGreaterThan(0);
        expect(sums.filter((s) => "cut" in s)).toEqual([]);
      }
    }
    expect(columnSums(calcs, mooshaim(rows).filter((r) => r.decisionState === "geprueft"))).toEqual([{ title: "zusätzlich verrechenbar", text: f1.amount.text }]);
    // checking moves no money: the totals stay those of the solution list
    expect(l.projectRows().find((r) => r.id === "p1")!.extra?.text).toBe("14.620,15 €");
  });

  it("a filter by Entscheidung shows the core's sum instead of 'nicht gerechnet'", () => {
    const l = live([decision(f1, "geprueft"), decision(built[1], "nicht_verrechnen")]);
    const rows = l.findRows();
    const calcs = l.findCalculations();
    for (const state of ["gefunden", "geprueft"] as const) {
      const visible = rows.filter((r) => r.decisionState === state);
      for (const [column, id] of [["amount", "zusaetzlich"], ["belegstand", "klaerung"], ["risk", "risiko"]] as const) {
        const result = footerSum(calcs[column], id, visible);
        expect(result === null || !("cut" in result)).toBe(true);
      }
    }
  });

  it("'Nicht verrechnen' takes the find out of the project, the business, the find page and the overview", () => {
    const l = live([decision(f1, "nicht_verrechnen")]);
    const rest = (text: string) => euro(Number(text.replace(/[^0-9]/g, "")) - f1.amount.cent);
    expect(l.projectRows().find((r) => r.id === "p1")!.extra?.text).toBe(rest("14.620,15 €"));
    const rows = l.findRows();
    expect(rows.find((r) => r.id === f1.id)!.groups).toEqual([]);
    expect(matchingSum(l.findCalculations().amount[0], rows)?.text).toBe(rest("22.632,96 €"));
    expect(matchingSum(l.findCalculations().amount[0], mooshaim(rows))?.text).toBe(rest("14.620,15 €"));
    expect(matchingSum(l.projectCalculations().extra[0], l.projectRows())?.text).toBe(rest("22.632,96 €"));
    expect(l.projectHighlights("p1").find((h) => h.id === "zusaetzlich")!.value).toBe(rest("14.620,15 €"));
    expect(l.projectHighlights("p1").find((h) => h.id === "funde")!.lines[0]).toMatch(/1 nicht verrechnen$/);
    expect(l.findHighlights(findSlug("Wohnpark Mooshaim", "F1"))!.find((h) => h.id === "betrag")!.lines[0]).toBe("zählt in keiner Summe");
    const twin = l.twinView("wohnpark-mooshaim")!;
    expect(twin.money.extra).toBe(rest("14.620,15 €"));
    expect(twin.finds.find((f) => f.number === "F1")!.bucket).toBe("nicht_verrechnen");
    // another project stays as it was
    expect(l.projectRows().find((r) => r.id === "p2")).toEqual(projectRows().find((r) => r.id === "p2"));
  });
});
