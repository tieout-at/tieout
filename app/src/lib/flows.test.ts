import { describe, expect, it } from "vitest";

import { playOrder } from "@/components/ablauf/parts";
import { findRows } from "./kern-data";
import { live } from "./kern-live";
import { FLOW_SLUGS, flowView, flowViews } from "./flows";

// "Abläufe" (step 9): the three Abläufe with the counts of `kern/` (kern/test/ablaeufe.test.ts checks the core). No
// block shows an amount; every result leads to the page where it is.
const views = flowViews();
const abschluss = flowView(FLOW_SLUGS.abschluss_lauf)!;
const run = abschluss.runs[0];

describe("Abläufe (step 9)", () => {
  it("has the three ready Abläufe with their runs, the latest first", () => {
    expect(views.map((v) => [v.title, v.runs.map((r) => `${r.title}, ${r.on}, ${r.date}`)])).toEqual([
      ["Abschluss-Lauf", ["Wohnpark Mooshaim, Entwurf, 19.10.2026"]],
      ["Lauf je Abschlagsrechnung", ["Bürohaus Kiefernau, Abschlagsrechnung 2, 30.09.2026", "Volksschule Ahornbrunn, Abschlagsrechnung 2, 30.09.2026"]],
      [
        "Meldung zu Regiebericht",
        ["Bürohaus Kiefernau, Meldung P2-W1, 24.09.2026", "Wohnpark Mooshaim, Meldung W4, 08.09.2026", "Wohnpark Mooshaim, Meldung W3, 14.07.2026", "Wohnpark Mooshaim, Meldung W2, 03.06.2026", "Wohnpark Mooshaim, Meldung W1, 12.05.2026"],
      ],
    ]);
  });

  it("shows on each block of the Abschluss-Lauf what the core counted", () => {
    const text = Object.fromEntries(Object.entries(run.results).map(([id, r]) => [id, r.text]));
    expect(text).toEqual({
      ausloeser: "Wohnpark Mooshaim",
      ordner: "77 Belege gelesen",
      abgleich: "8 Funde",
      vorpruefung: "3 Kürzungsrisiken",
      entwurf: "0 von 8 Funden entschieden",
      freigabe: "8 Funde offen",
      ausgaben: "Entwurf, nicht freigegeben",
      "aufgabe-bauleitung": "für 3 Funde in Klärung",
      "aufgabe-abrechnung": "für 2 Kürzungsrisiken",
    });
    expect(run.results.abgleich.lines.map((l) => `${l.label} ${l.value}`)).toEqual(["belegt 5", "Beleg fehlt 2", "Nachtrag nicht gelegt 1"]);
    expect(run.checks?.filter((c) => c.hits).map((c) => `${c.title} ${c.hits}${c.threat ? " droht" : ""}`)).toEqual([
      "Aufmaß nicht gegengezeichnet 1 droht",
      "Stunden weichen ab 1 droht",
      "Außerhalb des Leistungsverzeichnisses 1",
      "Abzug ohne Vertragspunkt 1",
      "Mengenänderung über 20 % 1",
    ]);
  });

  it("never shows an amount on a block, in a line or in a run", () => {
    const all = JSON.stringify(views.map((v) => v.runs));
    expect(all).not.toMatch(/€|\d+,\d\d/);
  });

  it("leads every result to a page of the app", () => {
    const links = views.flatMap((v) => v.runs.flatMap((r) => Object.values(r.results).flatMap((x) => (x.link ? [x.link.href] : []))));
    expect(links.length).toBeGreaterThan(10);
    for (const href of links) expect(href).toMatch(/^\/(projekte\/[a-z-]+\/([a-z-]+\/)?|aufgaben\/|whatsapp-meldungen\/#[a-z0-9-]+)$/);
  });

  it("the Lauf je Abschlagsrechnung skips the Vorprüfung without an Entwurf and names the gaps", () => {
    const v = flowView(FLOW_SLUGS.lauf_je_abschlagsrechnung)!;
    expect(v.runs.map((r) => [r.results.vorpruefung.ran, r.results["aufgabe-bauleitung"].text])).toEqual([
      [false, "keine Lücke"],
      [false, "für 1 Fund in Klärung"],
    ]);
  });

  it("the Meldung zu Regiebericht stops where a Regiebericht exists and makes a task for W4", () => {
    const v = flowView(FLOW_SLUGS.meldung_zu_regiebericht)!;
    expect(v.runs.map((r) => [r.on, r.results.bedingung.text, r.results["aufgabe-bauleitung"].ran])).toEqual([
      ["Meldung P2-W1", "Regiebericht 6 vorhanden, unterschrieben", false],
      ["Meldung W4", "kein Regiebericht", true],
      ["Meldung W3", "Regiebericht 15 vorhanden, unterschrieben", false],
      ["Meldung W2", "Regiebericht 9 vorhanden, unterschrieben", false],
      ["Meldung W1", "betrifft Positionen, kein Regiebericht nötig", false],
    ]);
  });

  it("plays the blocks down the column, a side block and the checks after the block they hang on", () => {
    expect(playOrder(abschluss.nodes, abschluss.checksAt)).toEqual(["ausloeser", "ordner", "abgleich", "aufgabe-bauleitung", "vorpruefung", "pruefungen", "aufgabe-abrechnung", "entwurf", "freigabe", "ausgaben"]);
  });

  it("follows the decisions of this browser", () => {
    const rows = findRows().filter((r) => r.project.name === "Wohnpark Mooshaim");
    const gap = rows.find((r) => r.belegstand?.text === "Beleg fehlt")!;
    const l = live([{ fundSchluessel: gap.id, zeit: "2026-10-27T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]).flowView(FLOW_SLUGS.abschluss_lauf)!;
    const r = l.runs[0];
    expect([r.results.entwurf.text, r.results["aufgabe-bauleitung"].text, r.results.abgleich.lines.map((x) => `${x.label} ${x.value}`)]).toEqual([
      "1 von 8 Funden entschieden",
      "für 2 Funde in Klärung",
      ["belegt 5", "Beleg fehlt 1", "Nachtrag nicht gelegt 1", "Nicht verrechnen 1"],
    ]);
    expect(live([]).flowView(FLOW_SLUGS.abschluss_lauf)).toEqual(abschluss);
  });
});

describe("check catalogue of the canvas", () => {
  it("names the rules as the core does, without loading the core", async () => {
    const { PRUEFUNGEN } = await import("@tieout/kern");
    const { CHECK_TEXT, CHECK_TITLES } = await import("./flow-catalogue");
    expect(CHECK_TITLES).toEqual(PRUEFUNGEN.map((p) => p.text));
    expect(Object.keys(CHECK_TEXT).toSorted()).toEqual(PRUEFUNGEN.map((p) => p.id).toSorted());
  });
});
