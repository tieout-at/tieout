import { describe, expect, it } from "vitest";

import { twinView } from "@/lib/twin";
import { buildModel, evidenceCount, findDetail, headline, isoWeek, resolveTrace, traceSentence } from "./model";

const view = () => structuredClone(twinView("p1")!);

describe("model of the Übersicht", () => {
  const m = buildModel(view());

  it("counts findings in the headline, not cells", () => {
    expect(headline(m)).toEqual({ count: "303", done: "Leistungen abgeglichen", finds: "8 Funde" });
    expect(m.view.abgleich.counts.fund).toBe(11);
  });

  it("keeps the two money words apart and takes them as text from the view", () => {
    expect(m.blocks.map((b) => [b.key, b.amount])).toEqual([
      ["zusaetzlich", m.view.money.extra],
      ["klaerung", m.view.money.unclear],
    ]);
    expect(m.blocks[0].quiet?.amount).toBe(m.view.money.atRisk);
  });

  it("separates what a finding lacks from what it has, and names the remedy", () => {
    const f6 = findDetail(m, "F6")!;
    expect(f6.stand).toBe("Beleg fehlt");
    expect(f6.present).toBe("vorhanden: 3 Belege"); // Vertrag, Regiebericht 12, Großhändlerrechnung
    expect(f6.remedy).toBe("Regiebericht vom Polier unterschreiben lassen");
    expect(f6.proofText).toBeNull();
    const f1 = findDetail(m, "F1")!;
    expect(f1.proofText).toBe("belegt durch 6 Belege und 1 WhatsApp-Meldung");
    expect(f1.risk).toBe("Kürzungsrisiko: Aufmaß nicht gegengezeichnet");
    expect(f1.memory).toEqual({ who: "Hornfeld Bau GmbH", text: "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain." });
    expect(f1.cells.map((c) => c.id)).toEqual(["22.03.02A", "22.04.12B", "22.05.03A", "22.05.06A"]);
  });

  it("shows the own Entwurf as 'verrechnet laut Entwurf' and never counts it as proof", () => {
    const f4 = findDetail(m, "F4")!;
    expect(f4.shows).toEqual(["verrechnet laut Entwurf"]);
    expect(m.finds.get("F4")!.proof).not.toContain("entwurf");
    expect(f4.proofText).toBe(`belegt durch ${evidenceCount(m, m.finds.get("F4")!.proof)}`);
  });

  it("reads a trace as one sentence for the screen reader", () => {
    const s = traceSentence(m, resolveTrace(m, { kind: "fund", id: "F8" }));
    expect(s).toContain("Nachtrag nicht gelegt");
    expect(s).toContain("vorhanden: 3 Belege");
    expect(s).toContain("Abhilfe: Nachtrag mit Preis legen");
    expect(traceSentence(m, resolveTrace(m, { kind: "tick", id: "ab-12" }))).toBe("Aufmaßblatt 12 · 18.09.2026 · belegt F1");
  });

  it("cleans every index: a Beleg that names an unknown finding traces without it", () => {
    const v = view();
    v.belege = v.belege.map((b) => (b.id === "ab-12" ? { ...b, finds: [...b.finds, "F99"] } : b));
    const clean = buildModel(v);
    expect(clean.belege.get("ab-12")!.finds).toEqual(["F1"]);
    expect(resolveTrace(clean, { kind: "tick", id: "ab-12" }).finds).toEqual(["F1"]);
    expect(resolveTrace(clean, { kind: "fund", id: "F99" }).finds).toEqual([]);
  });

  it("knows the ISO week of a date", () => {
    expect(isoWeek("2026-01-01")).toMatchObject({ year: 2026, week: 1 });
    expect(isoWeek("2025-12-29")).toMatchObject({ year: 2026, week: 1 });
    expect(isoWeek("2026-03-12")).toMatchObject({ year: 2026, week: 11 });
  });
});
