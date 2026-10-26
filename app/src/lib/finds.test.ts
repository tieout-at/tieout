import { describe, expect, it } from "vitest";

import { findRecord, findSlugs } from "./finds";
import { findRows } from "./kern-data";
import { markOf } from "./originals";

// Expected values from docs/Demo_Faelle.md and SPEZIFIKATION.md 7.2 (Fund F1: 4 positions, 6.648,60 €; K7 check).
describe("find page F1, Wohnpark Mooshaim", () => {
  const f1 = findRecord("wohnpark-mooshaim-f1");

  it("one page per find of the open projects, each reached from its row in Funde", () => {
    const rows = findRows();
    expect(findSlugs()).toHaveLength(rows.length);
    expect(rows.map((r) => r.href)).toEqual(findSlugs().map((s) => `/funde/${s}/`));
  });

  it("Rechenweg over 4 positions to 6.648,60 €, every step with its Aufmaßblatt and its Einheitspreis", () => {
    expect(f1.amount).toBe("6.648,60 €");
    expect(f1.calc.total.amount).toBe("6.648,60 €");
    expect(f1.calc.steps.map((s) => s.amount)).toEqual(["1.751,40 €", "4.009,60 €", "347,20 €", "540,40 €"]);
    const radiator = f1.calc.steps.find((s) => s.title.startsWith("22.04.12B"))!;
    expect(radiator.formula).toBe("14 Stk × 286,40 €");
    expect(radiator.derivation).toBe("14 Stk = 100 Stk aufgemessen − 86 Stk verrechnet");
    // the original opens on the largest number, the radiators
    expect(f1.first).toMatchObject({ page: "ab-12:1", place: "Zeile 22.04.12B" });
    expect(radiator.sources.map((s) => s.label)).toEqual(["Aufmaßblatt 12", "Leistungsverzeichnis"]);
    expect(radiator.sources[1].detail).toBe("Seite 9, Position 22.04.12B, Einheitspreis");
    expect(f1.calc.check).toBe("K7 22.04.12B: 1,10 h × 58,60 € = 64,46 € Lohn + 221,94 € Sonstiges = 286,40 €");
  });

  it("7 Belege with 1 WhatsApp-Meldung, counted as the list counts them; the Leistungsverzeichnis as the proof of price", () => {
    expect(f1.highlights.find((h) => h.id === "belegstand")).toMatchObject({ value: "belegt", lines: ["7 Belege, darunter 1 WhatsApp-Meldung"] });
    expect(f1.evidence.work.length + f1.evidence.price.length).toBe(7);
    expect(f1.highlights.find((h) => h.id === "betrag")!.lines).toEqual(["zusätzlich verrechenbar, netto, vor Nachlass"]);
    // the Kürzungsrisiko is the section below the figures, said once (step 8a)
    expect(f1.highlights.map((h) => h.id)).toEqual(["betrag", "belegstand"]);
    expect(f1.name).toBe("14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr");
    // the Art stands once, in the sum row of the Rechenweg
    expect(f1.facts).toEqual(["Plan H-201 Index C → D"]);
    expect(f1.calc.total.label).toBe("Mehrmenge aus Planänderung");
    expect(f1.evidence.price.map((x) => x.title)).toEqual(["Leistungsverzeichnis"]);
    expect(f1.evidence.work.map((x) => x.title)).toContain("Aufmaßblatt 12");
    expect(f1.evidence.work).toHaveLength(6);
  });

  it("names the weak spot: G1, Aufmaß nicht gegengezeichnet, with the Abhilfe and the same reason at Hornfeld Bau", () => {
    expect(f1.risk).toMatchObject({ number: "Vorprüfung G1", reason: "Aufmaß nicht gegengezeichnet", amount: "6.648,60 €", alreadyCut: false });
    expect(f1.risk!.remedy).toBe("Plan H-201 Index D und die E-Mail vom 07.04. beilegen, gemeinsames Aufmaß vereinbaren");
    expect(f1.risk!.sameReason).toContain("Wohnhof Erlenhain");
    expect(f1.risk!.sources[0]).toMatchObject({ label: "Aufmaßblatt 12", page: "ab-12:2" });
    expect(f1.taskText).toBe(f1.risk!.remedy);
  });

  it("every source opens an original with the place marked", () => {
    const sources = [...f1.calc.steps.flatMap((s) => s.sources), ...f1.evidence.work.map((x) => x.source), ...f1.evidence.price.map((x) => x.source), ...f1.risk!.sources];
    for (const s of sources) {
      const page = f1.originals[s.page];
      expect(page, s.page).toBeDefined();
      expect(markOf(page, s.place), `${s.page} ${s.place}`).not.toBeNull();
    }
    expect(f1.originals["ab-12:2"].sign).toMatchObject({ value: "nicht gegengezeichnet", given: false });
    expect(f1.originals["ab-12:1"].table!.rows.find((r) => r.place === "Zeile 22.04.12B")!.cells[1]).toBe("14 Stk");
    expect(f1.originals["lv:9"].table!.rows.find((r) => r.place === "Pos. 22.04.12B")!.cells[2]).toBe("286,40 €");
  });

  it("Verlauf holds the correction of the e-mail date and the confirmed WhatsApp-Meldung; no decision yet", () => {
    expect(f1.activity.map((a) => a.text)).toEqual([
      "korrigierte E-Mail: Wohnungstyp C Heizkörper, Datum: 01.04.2026 auf 07.04.2026",
      "bestätigte WhatsApp-Meldung W1: zusätzliche Heizkörper montiert",
    ]);
    expect(f1.decision).toBe("gefunden");
    expect(f1.nav).toMatchObject({ index: 1, count: 8, prev: null, next: "wohnpark-mooshaim-f2" });
  });
});

describe("finds in Klärung", () => {
  it("a find without Beleg is not in the Vorprüfung yet: no false all clear", () => {
    const f6 = findRecord("wohnpark-mooshaim-f6");
    expect(f6.risk).toBeNull();
    expect(f6.highlights.find((h) => h.id === "betrag")!.lines).toEqual(["in Klärung, netto, vor Nachlass"]);
    expect(f6.remedy).toBe("Regiebericht vom Polier unterschreiben lassen");
  });

  it("an original lists a value its layout does not show only where a source points, so no raw fields", () => {
    const f1 = findRecord("wohnpark-mooshaim-f1");
    expect(f1.originals["mail-0407:1"].extra).toEqual([]);
    expect(f1.originals["lv:9"].extra).toEqual([]);
    expect(f1.originals["w1:1"].extra).toEqual([]);
  });
});

describe("search", () => {
  it("finds the radiators by the word Heizkörper", async () => {
    const { findSearchEntries } = await import("./finds");
    const { score } = await import("./search");
    const hits = findSearchEntries().filter((e) => score("Heizkörper", [e.title, ...e.keywords]) > 0);
    expect(hits.map((h) => h.href)).toContain("/funde/wohnpark-mooshaim-f1/");
  });
});

describe("every find page", () => {
  it("has an amount equal to its row, a first original, and a visible mark for each source", () => {
    const rows = findRows();
    for (const slug of findSlugs()) {
      const r = findRecord(slug);
      expect(r.amount).toBe(rows.find((x) => x.href === `/funde/${slug}/`)!.amount.text);
      expect(r.first, slug).not.toBeNull();
      for (const s of [...r.calc.steps.flatMap((x) => x.sources), ...r.evidence.work.map((x) => x.source), ...r.evidence.price.map((x) => x.source)]) {
        expect(r.originals[s.page], `${slug} ${s.page}`).toBeDefined();
        expect(markOf(r.originals[s.page], s.place), `${slug} ${s.page} ${s.place}`).not.toBeNull();
      }
    }
  });
});

describe("Rechenweg quantities (step 8d)", () => {
  it("each position step of F1 carries the core's quantities for its bar; the difference is written once, in the formula", () => {
    const f1 = findRecord("wohnpark-mooshaim-f1");
    const pipe = f1.calc.steps.find((s) => s.title.startsWith("22.03.02A"))!;
    expect(pipe.quantities).toMatchObject({ invoicedText: "1.512 m", doneText: "1.638 m", lvText: "1.512 m", diffText: "126 m" });
    expect(pipe.formula).toBe("126 m × 13,90 €");
    expect(f1.calc.steps.every((s) => s.quantities !== null)).toBe(true);
  });

  it("Regie steps have no quantity bar", () => {
    const f2 = findRecord("wohnpark-mooshaim-f2");
    expect(f2.calc.steps.every((s) => s.quantities === null)).toBe(true);
    // the Kürzungsrisiko of F2 is a part of the find, named with its own amount
    expect(f2.risk).toMatchObject({ reason: "Stunden weichen ab", amount: "194,40 €" });
    expect(f2.amount).toBe("1.787,49 €");
  });
});
