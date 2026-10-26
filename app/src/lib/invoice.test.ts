import { describe, expect, it } from "vitest";
import type { Decision } from "./decisions";
import { invoiceProjects, invoiceView } from "./invoice";
import { live } from "./kern-live";

// Amounts of the solution list v3 (docs/Demo_Faelle.md): Rechnungsabschluss, Vorprüfung, Schlussbesprechungs-Blatt.
const v = invoiceView("p1")!;
const at = (key: string, decision: Decision["stand"], zeit = "2026-10-25T10:00"): Decision => ({ fundSchluessel: key, zeit, wer: "Abrechnung", stand: decision, ...(decision === "nicht_verrechnen" ? { grund: "Test" } : {}) });

describe("Schlussrechnung of Wohnpark Mooshaim (step 8)", () => {
  it("exists only for the project with an own Entwurf", () => {
    expect(invoiceProjects()).toEqual(["p1"]);
    expect(invoiceView("p2")).toBeNull();
  });

  it("lists every finding belegt in the Änderungsliste, F1 with its four positions", () => {
    expect(v.changes.entries.map((c) => `${c.find.number} ${c.amount.text}`)).toEqual(["F1 6.648,60 €", "F2 1.787,49 €", "F3 824,86 €", "F4 3.326,40 €", "F5 2.032,80 €"]);
    expect(v.changes.entries[0].items).toHaveLength(4);
    expect(v.changes.total.text).toBe("14.620,15 €");
    expect(v.changes.risk.text).toBe("6.843,00 €");
    expect(v.pending.map((x) => `${x.find.number} ${x.stand} ${x.amount.text}`)).toEqual(["F6 Beleg fehlt 643,99 €", "F7 Beleg fehlt 476,00 €", "F8 Nachtrag nicht gelegt 6.953,60 €"]);
    expect(v.pendingTotal.text).toBe("8.073,59 €");
  });

  it("settles down to the Restforderung, with the Restforderung laut Vertrag next to it (E14)", () => {
    const t = Object.fromEntries(v.settlement.lines.map((l) => [l.label, l.amount.text]));
    expect(t["Gesamtleistung"]).toBe("766.934,95 €");
    expect(t["Nachlass"]).toBe("−23.008,05 €");
    expect(t["Bauschadensumlage"]).toBe("−3.719,63 €");
    expect(v.settlement.restforderung.text).toBe("89.274,41 €");
    expect(v.settlement.contract.restforderung.text).toBe("92.882,45 €");
    expect(v.settlement.contract.difference.map((l) => l.label)).toEqual(["Bauschadensumlage"]);
    expect(v.settlement.lines.find((l) => l.label === "Bauschadensumlage")?.check?.text).toBe("Abzug ohne Vertragspunkt");
    expect(v.settlement.payments.every((p) => p.ok)).toBe(true);
  });

  it("shows the Vorprüfung with G3 already cut, apart from what threatens", () => {
    expect([v.check.total.text, v.check.threatened.text, v.check.alreadyCut.text]).toEqual(["8.619,00 €", "6.843,00 €", "1.776,00 €"]);
    expect(v.check.risks.map((r) => `${r.number} ${r.amount.text} ${r.alreadyCut}`)).toEqual(["G1 6.648,60 € false", "G2 194,40 € false", "G3 1.776,00 € true"]);
  });

  it("has the Schlussbesprechungs-Blatt with Forderung, Untergrenze and Spielraum", () => {
    expect([v.meeting.claim.text, v.meeting.floor.text, v.meeting.room.text]).toEqual(["22.693,74 €", "20.723,80 €", "1.969,94 €"]);
  });

  it("is a draft until every find is decided, and follows the decisions of this browser", () => {
    expect(v.status).toMatchObject({ finds: 8, open: 8, final: false });
    const f1 = v.changes.entries[0].find.key;
    const l = live([at(f1, "nicht_verrechnen")]).invoiceView("p1")!;
    expect(l.changes.entries.map((c) => c.find.number)).toEqual(["F2", "F3", "F4", "F5"]);
    expect(l.changes.total.text).toBe("7.971,55 €");
    expect(l.settlement.lines.some((x) => x.find?.number === "F1")).toBe(false);
    expect(live([]).invoiceView("p1")).toEqual(v);
  });
});
