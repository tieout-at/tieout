import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { emailView, whatsappView } from "./inbox";
import { live } from "./kern-live";
import { positionsView } from "./positions";
import { applyFilters, matchingSum } from "./table";

// Expected amounts must stand in the solution list (docs/Demo_Faelle.md), as in kern/test.
const list = readFileSync(new URL("../../../docs/Demo_Faelle.md", import.meta.url), "utf8");
function listed(text: string): string {
  if (!list.includes(text)) throw new Error(`${text} is not in docs/Demo_Faelle.md`);
  return text;
}

describe("tab Positionen", () => {
  const view = positionsView("p1")!;
  const open = applyFilters(view.rows, [{ column: "open", values: ["offen"] }], { open: { filterValue: (r) => (r.open ? "offen" : "nichts offen") } });

  it("one row per row of the core's position table; the view Offen shows the 11 rows with something open", () => {
    expect(view.rows).toHaveLength(303);
    expect(open.map((r) => r.number ?? r.kind)).toEqual(["22.03.02A", "22.04.12B", "22.05.03A", "22.05.06A", "24.02.05A", "24.08.02A", "Regiebericht", "Regiebericht", "Regiebericht", "WhatsApp-Meldung", "Änderung"]);
  });

  it("the footer shows the core's two money words apart, each exactly over its rows", () => {
    expect(matchingSum(view.calculations.open[0], open)?.text).toBe(listed("14.620,15 €"));
    expect(matchingSum(view.calculations.open[1], open)?.text).toBe(listed("8.073,59 €"));
  });

  it("22.04.12B: the website row with its find, and the Belege that prove it", () => {
    const r = view.rows.find((x) => x.number === "22.04.12B")!;
    expect([r.ordered, r.done, r.invoiced, r.open?.text, r.find?.number, r.note]).toEqual(["86 Stk", "100 Stk", "86 Stk", listed("4.009,60 €"), "F1", "über dem Leistungsverzeichnis"]);
    expect(r.coverage.aufmass.map((b) => [b.title, b.weak])).toEqual([
      ["Aufmaßblatt 8", null],
      ["Aufmaßblatt 12", "nicht gegengezeichnet"],
    ]);
  });

  it("a find set to Nicht verrechnen leaves the sum; the core's sum without it still fits the rows", () => {
    const l = live([{ fundSchluessel: "p1/plan:H-201:D", zeit: "2026-10-26T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]);
    const v = l.positionsView("p1")!;
    expect(v.rows.filter((r) => r.find?.number === "F1").every((r) => r.groups.length === 0)).toBe(true);
    const sum = matchingSum(v.calculations.open[0], v.rows);
    // 14.620,15 € less F1 (6.648,60 €), as invoice.test.ts and reports.test.ts
    expect(sum?.text).toBe("7.971,55 €");
  });

  it("a closed project has no table", () => {
    expect(positionsView("p4")).toBeNull();
  });
});

describe("WhatsApp-Meldungen and E-Mails", () => {
  it("five messages, newest first, each with the finds it proves", () => {
    const w = whatsappView();
    expect(w.items.map((i) => [i.id, i.project.name, i.finds.map((f) => f.number).join(), i.stand?.text])).toEqual([
      ["p2-w1", "Bürohaus Kiefernau", "F1", "fehlt"],
      ["w4", "Wohnpark Mooshaim", "F7", "fehlt"],
      ["w3", "Wohnpark Mooshaim", "F3", "fehlt"],
      ["w2", "Wohnpark Mooshaim", "F2", "fehlt"],
      ["w1", "Wohnpark Mooshaim", "F1", "fehlt"],
    ]);
    expect(w.items[1].finds[0]).toMatchObject({ amount: listed("476,00 €"), belegstand: { text: "Beleg fehlt" } });
  });

  it("fourteen e-mails without the two copies; the Rechtsfrage named, the instruction of F1 with its amount", () => {
    const e = emailView();
    expect(e.items).toHaveLength(14);
    expect(e.items.filter((i) => i.copies > 0).map((i) => i.id).sort()).toEqual(["mail-0407", "mail-0702"]);
    expect(e.items.filter((i) => i.rechtsfrage).map((i) => i.id)).toEqual(["mail-0702"]);
    const f1 = e.items.find((i) => i.id === "mail-0407")!;
    expect([f1.category, f1.finds[0].number, f1.finds[0].amount, f1.side]).toEqual(["Anweisung", "F1", listed("6.648,60 €"), null]);
    expect(e.items.find((i) => i.id === "mail-0513")!.side).toBe("für Hornfeld Bau");
  });
});
