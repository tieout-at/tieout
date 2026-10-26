import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { emailView, whatsappView } from "./inbox";
import { live } from "./kern-live";
import { positionsView } from "./positions";
import { COVERAGE_KINDS } from "./positions-shared";
import { applyFilters, matchingSum } from "./table";
import { timelineView } from "./timeline";
import { NACHWEISARTEN } from "@tieout/kern";

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

  it("a service without a position leaves Beauftragt empty instead of a dash", () => {
    const r = view.rows.find((x) => x.id === "p1/regie:9")!;
    expect([r.ordered, r.done, r.invoiced]).toEqual(["", "12 h Monteur, 12 h Helfer", "0 h"]);
  });

  it("a find set to Nicht verrechnen leaves the sum; the core's sum without it still fits the rows", () => {
    const l = live([{ fundSchluessel: "p1/plan:H-201:D", zeit: "2026-10-26T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]);
    const v = l.positionsView("p1")!;
    expect(v.rows.filter((r) => r.find?.number === "F1").every((r) => r.groups.length === 0)).toBe(true);
    const sum = matchingSum(v.calculations.open[0], v.rows);
    // 14.620,15 € less F1 (6.648,60 €), as invoice.test.ts and reports.test.ts
    expect(sum?.text).toBe("7.971,55 €");
  });

  it("Belegabdeckung: 3 gaps (2 Beleg fehlt, 1 Nachtrag), 4 rows weak, the missing Beleg named by its kind", () => {
    expect(view.answer).toEqual({ gaps: 3, belegFehlt: 2, nachtrag: 1, weak: 4 });
    expect(view.rows.filter((r) => r.missing).map((r) => [r.find?.number, r.missing!.kind, r.missing!.text])).toEqual([
      ["F7", "regie", "Regiebericht"],
      ["F8", "rechnung", "Nachtrag mit Preis"],
    ]);
    expect(view.rows.find((r) => r.find?.number === "F6")!.coverage.regie[0]).toMatchObject({ title: "Regiebericht 12", weak: "nicht unterschrieben", date: "24.06.2026" });
    expect(COVERAGE_KINDS.map((k) => k.id)).toEqual([...NACHWEISARTEN]);
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

describe("tab Zeitstrahl", () => {
  const t = timelineView("p1")!;

  it("the answer: 16 of 61 site events missing, in 8 finds, 24 invoiced; the picture runs Jänner to the month after the deadline", () => {
    expect(t.counts).toEqual({ site: 61, missing: 16, invoiced: 24, next: 0, withFind: 17, findCount: 8 });
    expect([t.range.from, t.range.to, t.deadline?.text]).toEqual(["2026-01-01", "2026-11-01", "30.10.2026"]);
  });

  it("every event has a row of the picture; the invoices carry the amounts printed on them", () => {
    expect(t.events).toHaveLength(70);
    const ar = t.events.filter((e) => e.row === "rechnung").map((e) => e.short);
    expect(ar).toEqual([listed("241.600,00 €"), listed("276.900,00 €"), listed("168.400,00 €")]);
    expect(t.events.find((e) => e.art === "zahlungsavis")!.amount).toBe(`bezahlt ${listed("218.566,83 €")}`);
  });

  it("the find of an event with its amount and remedy, for the panel", () => {
    expect(t.finds.F7).toMatchObject({ amount: listed("476,00 €"), belegstand: { text: "Beleg fehlt" } });
    expect(t.finds.F7.remedy).toBeTruthy();
  });
});
