import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { belegRows, clientRows } from "./kern-data";
import { clientRecord, projectRecord } from "./records";

// Expected amounts must stand in the solution list (docs/Demo_Faelle.md), as in kern/test: a typo in a test fails here.
const list = readFileSync(new URL("../../../docs/Demo_Faelle.md", import.meta.url), "utf8");
function listed(text: string): string {
  if (!list.includes(text)) throw new Error(`${text} is not in docs/Demo_Faelle.md`);
  return text;
}

describe("project page Wohnpark Mooshaim (SPEZIFIKATION.md 7.2)", () => {
  const r = projectRecord("p1");
  const card = (id: string) => r.highlights.find((h) => h.id === id)!;

  it("shows the money words of the solution list, never added up, in three figures led by zusätzlich verrechenbar", () => {
    expect(r.highlights.map((h) => h.id)).toEqual(["zusaetzlich", "klaerung", "restforderung"]);
    expect([card("zusaetzlich").value, card("zusaetzlich").lines, card("zusaetzlich").says]).toEqual([listed("14.620,15 €"), ["aus 5 belegten Funden"], `davon mit Kürzungsrisiko ${listed("6.843,00 €")}`]);
    expect(card("zusaetzlich").part).toBeCloseTo(684300 / 1462015);
    expect([card("klaerung").value, card("klaerung").lines]).toEqual([listed("8.073,59 €"), [`Beleg fehlt ${listed("1.119,99 €")}`, `Nachtrag nicht gelegt ${listed("6.953,60 €")}`]]);
    expect([card("restforderung").value, card("restforderung").lines]).toEqual([listed("89.274,41 €"), [`laut Vertrag ${listed("92.882,45 €")}`]]);
    expect(r.highlights.map((h) => h.value)).not.toContain(listed("22.693,74 €"));
  });

  it("names the deadline once (in the head), not in Angaben; the Vertrag is one row that leads to its tab", () => {
    expect(r.attributes.map((a) => a.label)).toEqual(["Auftraggeber", "Bauzeit", "Leistung", "Auftragssumme", "Vertrag"]);
    expect(r.attributes.find((a) => a.label === "Vertrag")).toMatchObject({ value: "vom 12.11.2025", href: "/projekte/wohnpark-mooshaim/vertrag/" });
  });

  it("reads every contract value with its place in the Bauvertrag", () => {
    const by = (label: string) => r.contract.find((a) => a.label === label)!;
    expect(by("Auftragssumme").value).toBe(listed("746.820,00 €"));
    expect([by("Nachlass").value, by("Nachlass").detail]).toEqual(["3 %", "Punkt 5.1"]);
    expect(by("Deckungsrücklass").detail).toBe("Punkt 9.1, auf Abschlagsrechnungen");
    expect(by("Baustrom und Bauwasser").value).toBe("0,6 %");
    expect(by("Regiesatz Monteur").value).toBe(`${listed("64,80 €")} je Stunde`);
    expect(r.contract.every((a) => a.source?.startsWith("Bauvertrag, Seite ") && a.review)).toBe(true);
    expect(r.contract.find((a) => a.label === "Schlussrechnung legen bis")).toMatchObject({ value: "30.10.2026" });
  });

  it("keeps the Verlauf append only and newest first: 18 corrections and 4 confirmed WhatsApp-Meldungen", () => {
    expect(r.activity.filter((a) => a.kind === "korrektur")).toHaveLength(18);
    expect(r.activity.filter((a) => a.kind === "meldung")).toHaveLength(4);
    expect(r.activity.map((a) => a.time)).toEqual([...r.activity.map((a) => a.time)].sort().reverse());
  });

  it("shows the settlement of a closed project instead of finds", () => {
    const closed = projectRecord("p4");
    expect(closed.highlights.map((h) => h.id)).toEqual(["gekuerzt", "schlusszahlung", "einbehalten"]);
    expect(closed.highlights.find((h) => h.id === "gekuerzt")?.value).toBe(listed("2.655,20 €"));
    // the cut by reason, so it meets the Auftraggeber page (2.575,20 € there is one of the reasons)
    expect(closed.highlights.find((h) => h.id === "gekuerzt")?.lines).toContain(`Aufmaß nicht gegengezeichnet ${listed("2.575,20 €")}`);
    expect(closed.highlights.find((h) => h.id === "gekuerzt")?.lines).toContain(`dazu abgezogen: Bauschadensumlage ${listed("3.305,55 €")}`);
  });

  it("says nothing in Klärung once, and shows no Auftragssumme card while Angaben has it", () => {
    const running = projectRecord("p2");
    expect(running.highlights.map((h) => [h.id, h.value])).toEqual([["zusaetzlich", listed("4.852,73 €")], ["klaerung", "nichts"]]);
  });
});

describe("Auftraggeber Hornfeld Bau (SPEZIFIKATION.md 2.2 and 7.2)", () => {
  const c = clientRecord("hornfeld");

  it("history from the documents: cuts, deductions without contract item, Nachträge, days to final payment", () => {
    expect(c.highlights.map((h) => h.value)).toEqual([listed("4.431,20 €"), listed("6.628,41 €"), "2 von 3"]);
    expect(c.highlights[2].lines).toEqual([`${listed("8.820,00 €")} von ${listed("10.680,00 €")}, 82,6 %`]);
    expect(c.cuts.map((x) => [x.project.name, x.reason, x.amount])).toContainEqual(["Wohnhof Erlenhain", "Aufmaß nicht gegengezeichnet", listed("2.575,20 €")]);
    expect(c.deductions.map((x) => [x.project.name, x.what, x.amount])).toContainEqual(["Wohnhof Erlenhain", "Bauschadensumlage", listed("3.305,55 €")]);
    expect(c.attributes.find((a) => a.label === "Tage bis Schlusszahlung")).toMatchObject({ value: "90", detail: "Wohnhof Erlenhain" });
    expect(c.projects.map((p) => p.name)).toEqual(["Wohnpark Mooshaim", "Bürohaus Kiefernau", "Wohnhof Erlenhain"]);
  });

  it("names the same reason in Wohnpark Mooshaim that Wohnhof Erlenhain already had", () => {
    expect(c.sameReason.map((s) => [s.project.name, s.reason, s.text])).toEqual([
      ["Wohnpark Mooshaim", "Aufmaß nicht gegengezeichnet", "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain."],
      ["Wohnpark Mooshaim", "Bauschadensumlage: Abzug ohne Vertragspunkt", "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain."],
    ]);
    expect(c.sameReason.map((s) => s.earlier)).toEqual([`im Wohnhof Erlenhain gekürzt: ${listed("2.575,20 €")}`, `im Wohnhof Erlenhain abgezogen: ${listed("3.305,55 €")}`]);
  });
});

describe("tables Belege and Auftraggeber", () => {
  it("lists every Beleg of the five folders, 77 of them from Wohnpark Mooshaim with 4 copies", () => {
    const rows = belegRows();
    expect(rows).toHaveLength(77 + 17 + 13 + 9 + 8);
    const p1 = rows.filter((r) => r.project.name === "Wohnpark Mooshaim");
    expect([p1.length, p1.filter((r) => r.review.state === "kopie").length]).toEqual([77, 4]);
    expect(new Set(rows.map((r) => r.id)).size).toBe(rows.length);
  });

  it("one row per Auftraggeber with the history of the solution list", () => {
    expect(clientRows().map((r) => [r.name, r.projects, r.cuts?.text ?? null, r.deductions?.text ?? null, r.changeOrders?.share ?? null])).toEqual([
      ["Hornfeld Bau GmbH", 3, listed("4.431,20 €"), listed("6.628,41 €"), listed("82,6 %")],
      ["Pfeilberg Bau GmbH", 1, listed("3.239,20 €"), null, "100,0 %"],
      ["Marktgemeinde Ahornbrunn", 1, null, null, null],
    ]);
  });
});
