import { describe, expect, it } from "vitest";
import type { Decision } from "./decisions";
import { findRows } from "./kern-data";
import { live } from "./kern-live";
import { reportsView } from "./reports";

// Amounts of the solution list v3 (docs/Demo_Faelle.md, "Amounts that must not change" and section "Berichte").
const v = reportsView();
const text = (xs: { name: string; amount: { text: string } }[]) => Object.fromEntries(xs.map((x) => [x.name, x.amount.text]));

describe("Berichte (step 8)", () => {
  it("names every Regiebericht, and its states count as the core counts", () => {
    for (const p of v.regie.projects) {
      const n = (s: string) => p.cells.filter((c) => c.state === s).length;
      expect([p.cells.length, n("verrechnet"), n("offen"), n("ohne_unterschrift"), n("spaeter")]).toEqual([p.all, p.invoiced, p.signedOpen, p.unsigned, p.later]);
    }
    const p1 = v.regie.projects[0].cells;
    expect(p1.filter((c) => c.state !== "verrechnet").map((c) => `${c.name} ${c.state}`)).toEqual(["Regiebericht 9 offen", "Regiebericht 12 ohne_unterschrift", "Regiebericht 15 offen"]);
    expect(p1.find((c) => c.nr === "12")?.href).toBe("/funde/wohnpark-mooshaim-f6/");
  });

  it("knows the Auftraggeber of every project", () => {
    expect(v.clientOf["Wohnhof Erlenhain"]).toBe("Hornfeld Bau GmbH");
    expect(Object.keys(v.clientOf)).toHaveLength(5);
  });

  it("shows zusätzlich verrechenbar per open project with davon mit Kürzungsrisiko", () => {
    expect(v.extra.total.text).toBe("22.632,96 €");
    expect(v.extra.risk.text).toBe("6.843,00 €");
    expect(text(v.extra.rows)).toEqual({ "Wohnpark Mooshaim": "14.620,15 €", "Bürohaus Kiefernau": "4.852,73 €", "Volksschule Ahornbrunn": "3.160,08 €" });
    expect(v.extra.rows[0].risk.text).toBe("6.843,00 €");
    expect(v.extra.rows.map((r) => r.finds)).toEqual([5, 3, 2]);
    expect(v.extra.notCompared.map((p) => p.name)).toEqual(["Wohnhof Erlenhain", "Pflegeheim Eibenau"]);
  });

  it("splits the Belegstand per project, never into one total", () => {
    expect(v.evidence.totals.beleg_fehlt.text).toBe("1.365,59 €");
    expect(v.evidence.totals.nachtrag_nicht_gelegt.text).toBe("6.953,60 €");
    const p1 = v.evidence.rows[0];
    expect([p1.parts.belegt.finds, p1.parts.beleg_fehlt.finds, p1.parts.nachtrag_nicht_gelegt.finds]).toEqual([5, 2, 1]);
    expect([p1.parts.beleg_fehlt.text, p1.parts.nachtrag_nicht_gelegt.text]).toEqual(["1.119,99 €", "6.953,60 €"]);
    expect(v.evidence.rows[2].parts.beleg_fehlt.text).toBe("245,60 €");
  });

  it("lists Regie without signature with the counts of every project and the cut in Pflegeheim Eibenau", () => {
    expect(v.regie.finds.map((f) => `${f.number} ${f.project.name} ${f.amount.text}`)).toEqual([
      "F6 Wohnpark Mooshaim 643,99 €",
      "F7 Wohnpark Mooshaim 476,00 €",
      "F3 Volksschule Ahornbrunn 245,60 €",
    ]);
    expect(v.regie.total?.text).toBe("1.365,59 €");
    expect(v.regie.projects[0]).toMatchObject({ all: 15, invoiced: 12, signedOpen: 2, unsigned: 1 });
    expect(v.regie.cutBefore.map((c) => `${c.client.name} ${c.project} ${c.amount.text}`)).toEqual([expect.stringContaining("Pflegeheim Eibenau 1.599,20 €")]);
  });

  it("explains nur außerhalb ERP per money word (E15)", () => {
    expect([v.erp.extra.amount.text, v.erp.extra.finds, v.erp.extra.of.text, v.erp.extra.ofFinds]).toEqual(["15.507,36 €", 7, "22.632,96 €", 10]);
    expect([v.erp.unclear.amount.text, v.erp.unclear.finds, v.erp.unclear.ofFinds]).toEqual(["8.319,19 €", 4, 4]);
    expect(v.erp.finds).toHaveLength(11);
  });

  it("shows cuts and deductions without contract item per Auftraggeber", () => {
    expect(v.cuts.map((c) => `${c.name} ${c.total?.text ?? "keine"}`)).toEqual([expect.stringContaining("4.431,20 €"), expect.stringContaining("3.239,20 €"), expect.stringContaining("keine")]);
    expect(v.deductions[0].total?.text).toBe("6.628,41 €");
    expect(v.announced.map((a) => `${a.project.name} ${a.kind} ${a.rate} ${a.amount.text}`)).toEqual(["Wohnpark Mooshaim Bauschadensumlage 0,5 % 3.719,63 €"]);
  });

  it("follows a decision made in this browser", () => {
    const f1 = findRows()[0];
    const d: Decision = { fundSchluessel: f1.id, zeit: "2026-10-25T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" };
    const l = live([d]).reportsView();
    expect(l.extra.total.text).toBe("15.984,36 €");
    expect(l.extra.rows[0].amount.text).toBe("7.971,55 €");
    expect(l.extra.rows[0].finds).toBe(4);
    expect(l.evidence.rows[0].skipped).toBe(1);
    expect(live([]).reportsView()).toEqual(v);
  });
});
