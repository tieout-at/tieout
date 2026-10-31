import { describe, expect, it } from "vitest";

import { findRecord } from "./finds";
import { folderProjects, gapsView, invoiceView } from "./invoice";
import { live } from "./kern-live";

const ein = (lueckeSchluessel: string, gueltig = true) => ({ lueckeSchluessel, zeit: "2026-10-23T10:00", wer: "Abrechnung", gueltig });

describe("gaps", () => {
  const v = invoiceView("p1")!;

  it("name what is missing, what closing does, and who signs", () => {
    const g = v.gaps.find((x) => x.key === "p1/unterschrift:rb-12")!;
    expect(g).toMatchObject({ title: "Regiebericht 12 ist nicht unterschrieben", about: "F6", effect: "in_rechnung", signer: "Polier", folder: true, closable: true, closed: null });
    expect(g.amount.text).toBe("643,99 €");
    expect(g.find?.number).toBe("F6");
    expect(g.project).toMatchObject({ slug: "wohnpark-mooshaim", folderHref: "/schlussrechnungen/wohnpark-mooshaim/mappe/" });
  });

  it("lead a risk without a find to the Vorprüfung of its project", () => {
    expect(v.gaps.find((x) => x.about === "Z-01")).toMatchObject({ find: null, href: "/projekte/wohnpark-mooshaim/schlussrechnung/#vorpruefung", closable: false, folder: false });
  });

  it("a find page holds its own gaps, and the Abhilfe of F1 leads to the plan and the e-mail", () => {
    const f1 = findRecord("wohnpark-mooshaim-f1");
    expect(f1.gaps.map((g) => g.key)).toEqual(["p1/gegenzeichnung:ab-12"]);
    expect(f1.risk!.sources.map((s) => s.label)).toEqual(["Aufmaßblatt 12", "Plan H-201 Index D", "E-Mail: Wohnungstyp C Heizkörper"]);
    for (const s of f1.risk!.sources) expect(f1.originals[s.page]).toBeTruthy();
  });

  it("Ahornbrunn has a Mappe without an invoice tab, Kiefernau an empty one, closed projects none", () => {
    expect(invoiceView("p3")).toBeNull();
    expect(gapsView("p3").map((g) => g.key)).toEqual(["p3/unterschrift:rb-5"]);
    expect(gapsView("p2")).toEqual([]);
    expect(folderProjects()).toEqual(["p1", "p2", "p3"]);
  });
});

describe("every page's data with a closed gap", () => {
  const l = live([], [ein("p1/unterschrift:rb-12"), ein("p1/regiebericht:W4"), ein("p1/gegenzeichnung:ab-12"), ein("p3/unterschrift:rb-5")]);

  it("computes on all builders of the live core", () => {
    expect(l.findRows().length).toBeGreaterThan(0);
    expect(l.findCalculations()).toBeTruthy();
    expect(l.projectRows().length).toBe(5);
    expect(l.projectCalculations()).toBeTruthy();
    expect(l.startView()).toBeTruthy();
    expect(l.reportsView()).toBeTruthy();
    expect(l.invoiceList().length).toBe(5);
    for (const id of ["p1", "p2", "p3", "p4", "p5"]) {
      l.invoiceView(id);
      l.projectHighlights(id);
      l.gapsView(id);
    }
    for (const id of ["p1", "p2", "p3"]) expect(l.positionsView(id)).toBeTruthy();
    expect(l.findHighlights("wohnpark-mooshaim-f7")).toBeTruthy();
    expect(l.twinView("wohnpark-mooshaim")).toBeTruthy();
  });

  it("keeps the gaps closed, with who entered them, and F7 keeps its number and its gap", () => {
    const closed = l.gapsView("p1").filter((g) => g.closed);
    expect(closed.map((g) => g.about)).toEqual(["F6", "F7", "F1 (4 Positionen)"]);
    expect(closed[0].closed).toMatchObject({ who: "Abrechnung", when: "23.10.2026, 10:00" });
    expect(closed[1].find).toMatchObject({ number: "F7", key: "p1/meldung:W4", earlierKeys: [] });
  });

  it("taking an entry back opens the gap again", () => {
    const again = live([], [ein("p1/unterschrift:rb-12"), { ...ein("p1/unterschrift:rb-12", false), zeit: "2026-10-23T10:05" }]);
    expect(again.gapsView("p1").find((g) => g.key === "p1/unterschrift:rb-12")!.closed).toBeNull();
    expect(again.invoiceView("p1")!.settlement.restforderung.text).toBe("89.274,41 €");
  });
});
