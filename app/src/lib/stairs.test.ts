import { describe, expect, it } from "vitest";

import { invoiceView, type InvoiceView } from "./invoice";
import { live } from "./kern-live";
import { MOST_FINDS, stairs } from "./stairs";

const v = invoiceView("p1")!;

describe("Treppe", () => {
  it("steps from the Entwurf through every find and deduction, each level the core's", () => {
    const s = stairs(v, "announced");
    expect(s.steps.map((x) => x.label)).toEqual(["Ihr Entwurf", "F1", "F2", "F3", "F4", "F5", "Nachlass", "Baustrom und Bauwasser", "Bauschadensumlage", "Haftrücklass"]);
    expect(s.steps.at(-1)!.to).toBe(s.end.cent);
    expect(s.end.text).toBe("713.671,40 €");
    expect(s.paid.text).toBe("624.396,99 €");
    expect(s.rest).toEqual({ cent: 8927441, text: "89.274,41 €", label: "Restforderung" });
    for (let i = 2; i < s.steps.length; i++) expect(s.steps[i].from).toBe(s.steps[i - 1].to);
  });

  it("keeps what is in Klärung beside the steps and out of every level", () => {
    const s = stairs(v, "announced");
    expect(s.pending.map((x) => [x.label, x.text])).toEqual([
      ["F6", "643,99 €"],
      ["F7", "476,00 €"],
      ["F8", "6.953,60 €"],
    ]);
    expect(s.steps.some((x) => x.find && ["F6", "F7", "F8"].includes(x.find.number))).toBe(false);
  });

  it("marks the finds with a Kürzungsrisiko and the deduction without contract item", () => {
    const s = stairs(v, "announced");
    expect(s.steps.filter((x) => x.risk).map((x) => x.label)).toEqual(["F1", "F2"]);
    expect(s.steps.filter((x) => x.noClause).map((x) => x.label)).toEqual(["Bauschadensumlage"]);
    expect(s.steps.find((x) => x.label === "Nachlass")!.check).toMatch(/^Vertragspunkt 5\.1/);
  });

  it("laut Vertrag takes the deduction out", () => {
    const s = stairs(v, "contract");
    expect(s.steps.map((x) => x.label)).not.toContain("Bauschadensumlage");
    expect(s.rest).toMatchObject({ text: "92.882,45 €", label: "Restforderung laut Vertrag" });
  });

  it("starts its axis under the lowest level and ends above the highest", () => {
    const s = stairs(v, "announced");
    expect(s.base).toBe(70_000_000);
    expect(s.base).toBeLessThan(s.end.cent);
    expect(s.top).toBeGreaterThan(s.pending.at(-1)!.to);
  });

  it("walks with a decision and with a signature that came back", () => {
    const f1 = v.status.all[0];
    const no = stairs(live([{ fundSchluessel: f1.key, zeit: "2026-10-23T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]).invoiceView("p1")!, "announced");
    expect(no.rest.text).toBe("83.087,54 €");
    expect(no.steps.map((x) => x.label)).not.toContain("F1");
    const signed = stairs(live([], [{ lueckeSchluessel: "p1/unterschrift:rb-12", zeit: "2026-10-23T10:00", wer: "Abrechnung", gueltig: true }]).invoiceView("p1")!, "announced");
    expect(signed.rest.text).toBe("89.873,66 €");
    expect(signed.steps.map((x) => x.label).slice(1, 7)).toEqual(["F1", "F2", "F3", "F4", "F5", "F6"]);
    expect(signed.pending.map((x) => x.label)).toEqual(["F7", "F8"]);
  });

  it("folds the smallest finds of a long Änderungsliste into one step without an amount", () => {
    const line = v.settlement.lines.find((l) => l.kind === "fund")!;
    const many = Array.from({ length: 20 }, (_, i) => ({ ...line, amount: { cent: 1000 + i, text: `${i}` }, find: { ...line.find!, number: `F${i + 1}`, key: `k${i}` } }));
    const lines = v.settlement.lines.flatMap((l) => (l.kind === "fund" ? (l === line ? many : []) : [l]));
    const s = stairs({ ...v, settlement: { ...v.settlement, lines } } as InvoiceView, "announced");
    expect(s.folded).toBe(20 - (MOST_FINDS - 1));
    expect(s.steps.filter((x) => x.kind === "fund")).toHaveLength(MOST_FINDS - 1);
    expect(s.steps.find((x) => x.kind === "more")).toMatchObject({ label: "11 weitere", text: "" });
  });

  it("stands with no find and nothing in Klärung", () => {
    const lines = v.settlement.lines.filter((l) => l.kind !== "fund");
    const s = stairs({ ...v, pending: [], settlement: { ...v.settlement, lines } } as InvoiceView, "announced");
    expect(s.pending).toEqual([]);
    expect(s.top).toBeGreaterThan(s.base);
  });
});
