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
      vorpruefung: "2 Kürzungsrisiken, 1 gekürzt",
      entwurf: "0 von 8 Funden entschieden",
      freigabe: "8 Funde offen",
      ausgaben: "Entwurf, nicht freigegeben",
      "aufgabe-bauleitung": "3 Aufgaben vorgeschlagen",
      "aufgabe-abrechnung": "2 Aufgaben vorgeschlagen",
    });
    // proposed, not created: the same 5 proposals the page "Aufgaben" lists for Wohnpark Mooshaim
    expect([run.results["aufgabe-bauleitung"].proposed, run.results["aufgabe-abrechnung"].proposed]).toEqual([true, true]);
    expect(findRows().filter((r) => r.project.name === "Wohnpark Mooshaim" && r.taskText).length).toBe(3 + 2);
    expect(run.results.abgleich.lines.map((l) => `${l.label} ${l.value}`)).toEqual(["belegt 5", "Beleg fehlt 2", "Nachtrag nicht gelegt 1"]);
    expect(run.checks?.filter((c) => c.hits).map((c) => `${c.title} ${c.hits}${c.threat ? " droht" : ""}`)).toEqual([
      "Aufmaß nicht gegengezeichnet 1 droht",
      "Stunden weichen ab 1 droht",
      "Außerhalb des Leistungsverzeichnisses 1",
      "Abzug ohne Vertragspunkt 1",
      "Mengenänderung über 20 % 1",
    ]);
    expect(Object.fromEntries(run.checks!.filter((c) => c.hits).map((c) => [c.title, c.links.map((l) => l.href)]))).toEqual({
      "Aufmaß nicht gegengezeichnet": ["/funde/wohnpark-mooshaim-f1/"],
      "Stunden weichen ab": ["/funde/wohnpark-mooshaim-f2/"],
      "Außerhalb des Leistungsverzeichnisses": ["/projekte/wohnpark-mooshaim/schlussrechnung/"],
      "Abzug ohne Vertragspunkt": ["/projekte/wohnpark-mooshaim/schlussrechnung/"],
      "Mengenänderung über 20 %": ["/funde/wohnpark-mooshaim-f4/"],
    });
  });

  it("never shows an amount on a block, in a line or a check; money only in the money of a run, from the core", () => {
    const all = JSON.stringify(views.map((v) => v.runs.map(({ money, ...rest }) => (void money, rest))));
    expect(all).not.toMatch(/€|\d+,\d\d/);
  });

  it("leads every result to a page of the app", () => {
    const links = views.flatMap((v) => v.runs.flatMap((r) => Object.values(r.results).flatMap((x) => (x.link ? [x.link.href] : []))));
    expect(links.length).toBeGreaterThan(10);
    for (const href of links) expect(href).toMatch(/^\/(projekte\/[a-z-]+\/([a-z-]+\/)?|aufgaben\/|whatsapp-meldungen\/#[a-z0-9-]+)$/);
    const checks = views.flatMap((v) => v.runs.flatMap((r) => (r.checks ?? []).flatMap((c) => c.links.map((l) => l.href))));
    for (const href of checks) expect(href).toMatch(/^\/(funde\/[a-z0-9-]+\/|projekte\/[a-z-]+\/schlussrechnung\/)$/);
  });

  it("the Lauf je Abschlagsrechnung skips the Vorprüfung without an Entwurf and names the gaps", () => {
    const v = flowView(FLOW_SLUGS.lauf_je_abschlagsrechnung)!;
    expect(v.runs.map((r) => [r.results.vorpruefung.ran, r.results["aufgabe-bauleitung"].text])).toEqual([
      [false, "keine Lücke"],
      [false, "1 Aufgabe vorgeschlagen"],
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
      "2 Aufgaben vorgeschlagen",
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

describe("what this browser adds (step 9, after the go of Maxi S.)", () => {
  it("shows the money of the run from the core: the two money words apart, the risk as davon", () => {
    expect(run.money).toEqual({ extra: { cent: 1462015, text: "14.620,15 €" }, risk: { cent: 684300, text: "6.843,00 €" }, unclear: { cent: 807359, text: "8.073,59 €" } });
    const ar = flowView(FLOW_SLUGS.lauf_je_abschlagsrechnung)!.runs.map((r) => [r.money?.extra.text, r.money?.unclear?.text ?? null]);
    expect(ar).toEqual([["4.852,73 €", null], ["3.160,08 €", "245,60 €"]]);
    expect(flowView(FLOW_SLUGS.meldung_zu_regiebericht)!.runs.every((r) => r.money === null)).toBe(true);
  });

  it("names the finds a task block is for, the same as the proposals on Aufgaben", () => {
    const keys = (id: string) => run.results[id].tasks!.map((t) => t.label);
    expect(keys("aufgabe-bauleitung")).toEqual(["F6 Wohnpark Mooshaim", "F7 Wohnpark Mooshaim", "F8 Wohnpark Mooshaim"]);
    expect(keys("aufgabe-abrechnung")).toEqual(["F1 Wohnpark Mooshaim", "F2 Wohnpark Mooshaim"]);
    const w4 = flowView(FLOW_SLUGS.meldung_zu_regiebericht)!.runs.find((r) => r.on === "Meldung W4")!;
    expect(w4.results["aufgabe-bauleitung"].tasks!.map((t) => [t.label, t.taskText])).toEqual([["F7 Wohnpark Mooshaim", "Regiebericht schreiben und vom Polier unterschreiben lassen"]]);
  });

  it("marks tasks created from a block: some, then all", async () => {
    const { localRun } = await import("./flow-state");
    const task = (key: string) => ({ id: key, fundSchluessel: key, fund: "", href: "", zeit: "2026-10-27T10:00", wer: "Abrechnung", text: "", zustaendig: "Bauleitung", bis: null });
    const targets = run.results["aufgabe-bauleitung"].tasks!;
    const some = localRun(run, [task(targets[0].key)], []).results["aufgabe-bauleitung"];
    expect([some.text, some.proposed]).toEqual(["1 von 3 angelegt", true]);
    const all = localRun(run, targets.map((t) => task(t.key)), []).results["aufgabe-bauleitung"];
    expect([all.text, all.proposed]).toEqual(["3 Aufgaben angelegt", false]);
    expect(localRun(run, null, [])).toEqual(run);
  });

  it("applies the threshold of the quantity check: above 26,3 % F4 is no longer a hit", async () => {
    const { localRun, blockSettings, dueDate } = await import("./flow-state");
    const at = (wert: string) => localRun(run, [], [{ block: "mengenaenderung_ueber_20", feld: "schwelle", wert, zeit: "2026-10-27T10:00" }]).checks!.find((c) => c.id === "mengenaenderung_ueber_20")!;
    expect([at("25").title, at("25").hits, at("25").links.map((l) => l.label)]).toEqual(["Mengenänderung über 25 %", 1, ["F4 öffnen"]]);
    expect([at("30").title, at("30").hits, at("30").links, at("30").below?.map((b) => [b.label, b.change])]).toEqual(["Mengenänderung über 30 %", 0, [], [["F4 öffnen", 2625]]]);
    expect(at("7").hits).toBe(1); // an unknown value keeps 20 %
    expect(blockSettings([], "aufgabe-abrechnung")).toEqual({ zustaendig: "Abrechnung", frist: "3" });
    expect(blockSettings([{ block: "aufgabe-bauleitung", feld: "frist", wert: "7", zeit: "2026-10-27T10:00" }, { block: "aufgabe-bauleitung", feld: "frist", wert: "0", zeit: "2026-10-27T11:00" }], "aufgabe-bauleitung").frist).toBe("0");
    expect([dueDate("3", new Date("2026-10-30T12:00")), dueDate("0")]).toEqual(["2026-11-02", null]);
  });
});

describe("review of the settings and tasks (step 9)", () => {
  it("counts the same tasks as the core, for every run", async () => {
    const { ablaeufe, pruefeFirma } = await import("@tieout/kern");
    const { firm } = await import("./kern-data");
    const a = ablaeufe(firm(), pruefeFirma(firm()));
    const n = (r: (typeof run)["results"][string]) => (r.tasks ?? []).filter((t) => !t.excluded).length;
    expect(n(run.results["aufgabe-bauleitung"])).toBe(a.abschluss[0].aufgaben.bauleitung);
    expect(n(run.results["aufgabe-abrechnung"])).toBe(a.abschluss[0].aufgaben.abrechnung);
    const ar = flowView(FLOW_SLUGS.lauf_je_abschlagsrechnung)!.runs.map((r) => n(r.results["aufgabe-bauleitung"]));
    expect(ar).toEqual(a.abschlag.map((x) => x.aufgaben.bauleitung));
  });

  it("keeps the settings of each Ablauf apart and never uses an unknown role", async () => {
    const { blockSettings } = await import("./flow-state");
    const at = (block: string, feld: "zustaendig" | "frist", wert: string) => ({ block, feld, wert, zeit: "2026-10-27T10:00" });
    const list = [at("meldung_zu_regiebericht/aufgabe-bauleitung", "frist", "14"), at("abschluss_lauf/aufgabe-bauleitung", "zustaendig", "Polier X")];
    expect(blockSettings(list, "abschluss_lauf/aufgabe-bauleitung")).toEqual({ zustaendig: "Bauleitung", frist: "3" });
    expect(blockSettings(list, "meldung_zu_regiebericht/aufgabe-bauleitung")).toEqual({ zustaendig: "Bauleitung", frist: "14" });
    expect(blockSettings([], "abschluss_lauf/aufgabe-abrechnung").zustaendig).toBe("Abrechnung");
  });

  it("finds a task made under an earlier key and leaves a find set to Nicht verrechnen out of the count", async () => {
    const { localRun, taskOf } = await import("./flow-state");
    const task = (key: string, zeit = "2026-10-27T10:00") => ({ id: key + zeit, fundSchluessel: key, fund: "", href: "", zeit, wer: "Abrechnung", text: "", zustaendig: "Bauleitung", bis: null });
    const f7 = run.results["aufgabe-bauleitung"].tasks!.find((t) => t.label.startsWith("F7"))!;
    expect(f7.keys).toContain("p1/meldung:W4");
    expect(taskOf(f7, [task("p1/meldung:W4", "2026-10-27T09:00"), task("p1/meldung:W4", "2026-10-27T11:00")])!.zeit).toBe("2026-10-27T11:00");
    const gap = findRows().find((r) => r.project.name === "Wohnpark Mooshaim" && r.belegstand?.text === "Beleg fehlt")!;
    const l = live([{ fundSchluessel: gap.id, zeit: "2026-10-27T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]).flowView(FLOW_SLUGS.abschluss_lauf)!.runs[0];
    const tasks = l.results["aufgabe-bauleitung"].tasks!;
    expect(tasks.map((t) => t.excluded)).toEqual([true, false, false]);
    const r = localRun(l, [task(tasks[0].keys[0]), task(tasks[1].keys[0])], []).results["aufgabe-bauleitung"];
    expect(r.text).toBe("1 von 2 angelegt");
  });
});
