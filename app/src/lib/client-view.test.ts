import { describe, expect, it } from "vitest";

import { clientView } from "./client-view";
import { clientRows } from "./kern-data";

// Amounts of the solution list v3 (docs/Demo_Faelle.md, "Auftraggeber history").
const id = (short: string) => clientRows().find((r) => r.name.startsWith(short))!.id;
const hornfeld = clientView(id("Hornfeld"));

describe("Auftraggeber page (step 8d)", () => {
  it("parts every figure into the core's amounts", () => {
    expect(hornfeld.parts.cuts.map((c) => c.amount.text)).toEqual(["1.776,00 €", "2.575,20 €", "80,00 €"]);
    expect(hornfeld.parts.deductionsByProject.map((d) => `${d.project} ${d.amount.text}`)).toEqual(["Wohnpark Mooshaim 3.322,86 €", "Wohnhof Erlenhain 3.305,55 €"]);
    expect(hornfeld.parts.changeOrders.map((c) => `${c.label} ${c.accepted}`)).toEqual(["N1 Zusätzlicher Heizkreisverteiler true", "N2 Grundleitung umgelegt true", "N3 Winterbaumaßnahmen false"]);
  });

  it("keeps what only our Vorprüfung sees apart from what the Auftraggeber did", () => {
    const own = hornfeld.reasons.filter((r) => r.own).map((r) => r.label);
    const ours = hornfeld.reasons.filter((r) => !r.own).map((r) => r.label);
    expect(own).toContain("Aufmaß nicht gegengezeichnet");
    expect(ours).toEqual(["Stunden weichen ab"]);
    const mooshaim = hornfeld.projects.find((p) => p.name === "Wohnpark Mooshaim")!;
    expect(mooshaim.marks.aufmass_nicht_gegengezeichnet?.map((m) => `${m.kind} ${m.amount.text}`)).toEqual(["droht 6.648,60 €"]);
  });

  it("links the same reason from the closed project to the running one", () => {
    expect(hornfeld.chains.map((c) => `${c.before.name} ${c.before.amount.text} > ${c.now.name} ${c.now.kind} ${c.now.amount.text}`)).toEqual([
      "Wohnhof Erlenhain 2.575,20 € > Wohnpark Mooshaim droht 6.648,60 €",
      "Wohnhof Erlenhain 3.305,55 € > Wohnpark Mooshaim angekuendigt 3.719,63 €",
    ]);
  });

  it("shows the withheld Bauschadensumlage inside the announced one, never beside it", () => {
    const mooshaim = hornfeld.projects.find((p) => p.name === "Wohnpark Mooshaim")!;
    const marks = Object.entries(mooshaim.marks).find(([key]) => key.startsWith("abzug:"))![1];
    expect(marks.map((m) => `${m.kind} ${m.amount.text} davon ${m.withheld?.amount.text}`)).toEqual(["angekuendigt 3.719,63 € davon 3.322,86 €"]);
    expect(hornfeld.chains[1].now.withheld?.text).toBe("3.322,86 €");
  });

  it("labels the Schlusszahlung of a closed project", () => {
    expect(Object.values(hornfeld.closing).map((c) => `${c.label} ${c.amount.text}`)).toEqual(["Schlusszahlung 86.223,12 €"]);
  });
});
