// Run step "Abgleich" against solution list v3: every find with its amount, Art and Belegstand, the notes, and the
// counter-checks that must find nothing. Expected amounts come from docs/Demo_Faelle.md through `ausListe`.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { abgleich } from "../src/regeln";
import { zumStichtag } from "../src/stand";
import type { Datensatz } from "../src/modell";
import type { Fund } from "../src/typen";
import { ausListe } from "./hilfen";

const firma = beispielFirma();
const projekt = (kurz: string): Datensatz => firma.projekte.find((p) => p.projekt.kurz === kurz)!;
const p1 = abgleich(projekt("P1"), { auftraggeber: "Hornfeld Bau" });
const fund = (nr: string): Fund => p1.funde.find((f) => f.nr === nr)!;
const kurz = (f: Fund) => [f.nr, f.art, f.belegstand, f.betrag];

describe("P1 Wohnpark Mooshaim: 8 finds", () => {
  it("F1 to F8 with Art, Belegstand and amount", () => {
    expect(p1.funde.map(kurz)).toEqual([
      ["F1", "mehrmenge_plan", "belegt", ausListe("6.648,60 €")],
      ["F2", "regie", "belegt", ausListe("1.787,49 €")],
      ["F3", "regie", "belegt", ausListe("824,86 €")],
      ["F4", "mehrmenge", "belegt", ausListe("3.326,40 €")],
      ["F5", "mehrmenge", "belegt", ausListe("2.032,80 €")],
      ["F6", "regie", "beleg_fehlt", ausListe("643,99 €")],
      ["F7", "stunden_ohne_regiebericht", "beleg_fehlt", ausListe("476,00 €")],
      ["F8", "aenderung_angemeldet", "nachtrag_nicht_gelegt", ausListe("6.953,60 €")],
    ]);
    expect(p1.funde.map((f) => f.schluessel)).toEqual(["plan:H-201:D", "regie:9", "regie:15", "mehrmenge:24.02.05A", "mehrmenge:24.08.02A", "regie:12", "meldung:W4", "anmeldung:mail-0316"]);
  });

  it("'zusätzlich verrechenbar' and 'in Klärung' separately, never one total", () => {
    expect(p1.summen).toEqual({
      zusaetzlichVerrechenbar: ausListe("14.620,15 €"),
      inKlaerung: ausListe("8.073,59 €"),
      belegFehlt: ausListe("1.119,99 €"),
      nachtragNichtGelegt: ausListe("6.953,60 €"),
    });
  });

  it("F1 covers 4 positions of Plan H-201 Index C → D", () => {
    const f1 = fund("F1");
    expect(f1.titel).toBe("Plan H-201 Index C → D: Wohnungstyp C: Wohnküche geteilt, 1 Heizkörper mehr");
    expect(f1.positionen.map((p) => [p.positionNr, p.lvMenge, p.aufmassMenge, p.verrechnetMenge, p.betrag])).toEqual([
      ["22.03.02A", 151_200, 163_800, 151_200, ausListe("1.751,40 €")],
      ["22.04.12B", 8_600, 10_000, 8_600, ausListe("4.009,60 €")],
      ["22.05.03A", 16_800, 18_200, 16_800, ausListe("347,20 €")],
      ["22.05.06A", 16_800, 18_200, 16_800, ausListe("540,40 €")],
    ]);
    expect(f1.rechenweg.text).toBe("126 m × 13,90 € + 14 × 286,40 € + 14 × 24,80 € + 14 × 38,60 € = 6.648,60 €");
    expect(f1.rechenweg.plausibilitaet).toBe("K7 22.04.12B: 1,10 h × 58,60 € = 64,46 € Lohn + 221,94 € Sonstiges = 286,40 €");
  });

  it("F1 has 6 Belege and 1 WhatsApp-Meldung: Leistungsverzeichnis, Plan C and D, E-Mail 07.04., Foto, Aufmaßblatt 12, W1", () => {
    expect(fund("F1").nachweise.map((n) => n.titel)).toEqual([
      "Leistungsverzeichnis",
      "Plan H-201, Index C",
      "Plan H-201, Index D",
      "E-Mail Bauleitung Hornfeld Bau, 07.04.2026",
      "WhatsApp-Meldung 12.05.2026, 15:20, Monteur, Trupp 1",
      "Foto 15.05.2026",
      "Aufmaßblatt 12",
    ]);
    expect(fund("F1").nachweise.find((n) => n.titel.startsWith("E-Mail"))!.text).toBe("„Wohnungstyp C: je ein Heizkörper zusätzlich laut Plan D, bitte gleich mitmachen.“");
  });

  it("Regie with the surcharge of the Vertrag on the material", () => {
    expect(fund("F2").rechenweg.schritte.filter((s) => s.betrag !== undefined && !s.summe).map((s) => s.betrag)).toEqual(
      ["777,60 €", "650,40 €", "312,60 €", "46,89 €"].map(ausListe),
    );
    expect(fund("F2").rechenweg.text).toBe("12 h × 64,80 € + 12 h × 54,20 € + Material 312,60 € + 15 % (46,89 €) = 1.787,49 €");
    expect(fund("F3").rechenweg.text).toBe("6 h × 64,80 € + 6 h × 54,20 € + Material 96,40 € + 15 % (14,46 €) = 824,86 €");
    expect(fund("F6").rechenweg.text).toBe("5 h × 64,80 € + 5 h × 54,20 € + Material 42,60 € + 15 % (6,39 €) = 643,99 €");
    expect(fund("F2").nachweise.map((n) => n.titel)).toEqual(["WhatsApp-Meldung 03.06.2026, 09:05, Monteur, Trupp 2", "Regiebericht 9", "Großhändlerrechnung"]);
  });

  it("F7 from the WhatsApp-Meldung of 08.09.2026 without material, F8 on the Preisbasis of the Vertrag", () => {
    expect(fund("F7").rechenweg.text).toBe("4 h × 64,80 € + 4 h × 54,20 € = 476,00 €");
    expect(fund("F7").nachweise.map((n) => n.titel)).toEqual(["WhatsApp-Meldung 08.09.2026, 14:30, Monteur, Trupp 1"]);
    expect(fund("F8").rechenweg.schritte.filter((s) => !s.summe).map((s) => s.betrag)).toEqual(["3.750,40 €", "2.860,00 €", "343,20 €"].map(ausListe));
    expect(fund("F8").nachweise.map((n) => n.datum)).toEqual(["2026-03-12", "2026-03-16"]);
  });

  it("remedies, the same text as the task", () => {
    expect([fund("F6").abhilfe, fund("F7").abhilfe, fund("F8").abhilfe]).toEqual([
      "Regiebericht vom Polier unterschreiben lassen",
      "Regiebericht schreiben und vom Polier unterschreiben lassen",
      "Nachtrag mit Preis legen",
    ]);
    expect(p1.funde.filter((f) => f.belegstand === "belegt").every((f) => f.abhilfe === null)).toBe(true);
  });

  it("F4 Aufmaßblatt 11, F5 Aufmaßblatt 13 with the Fotodokumentation", () => {
    expect(fund("F4").nachweise.map((n) => n.titel)).toEqual(["Leistungsverzeichnis", "Aufmaßblatt 11"]);
    expect(fund("F5").nachweise.map((n) => n.titel)).toEqual(["Leistungsverzeichnis", "Fotodokumentation Brandschutz, 142 Abschottungen DN 110 mit Kennzeichnung", "Aufmaßblatt 13"]);
  });

  it("one Rechtsfrage without an amount, and the 20 % note on F4 only", () => {
    expect(p1.hinweise.map((h) => [h.art, h.fundSchluessel, h.aenderung])).toEqual([
      ["rechtsfrage", null, null],
      ["mengenaenderung_ueber_20", "mehrmenge:24.02.05A", 2_625],
    ]);
    expect(p1.hinweise[0].text).toContain("E-Mail Bauleitung Hornfeld Bau vom 02.07.2026: „Fertigstellung Stiege 2 drei Wochen vorziehen.“");
    expect(p1.hinweise[1].text).toBe("Hornfeld Bau kann hier einen neuen Einheitspreis prüfen.");
    expect(p1.hinweise[1].titel).toBe("Mengenänderung +26,3 %");
  });

  it("counter-checks: the invoiced events (Regiebericht 3, Plan L-310 Index E) produce no find", () => {
    expect(p1.funde.some((f) => f.schluessel === "regie:3" || f.positionen.some((p) => p.positionNr === "26.03.05A"))).toBe(false);
    const rb3 = projekt("P1").abschlaege[0].zeilen.find((z) => z.typ === "regie" && z.regieberichtNr.wert === "3")!;
    expect(rb3.betrag.wert).toBe(ausListe("615,00 €"));
    const planE = projekt("P1").abschlaege[1].zeilen.find((z) => z.typ === "position" && z.positionNr.wert === "26.03.05A")!;
    expect(planE.typ === "position" && planE.menge.wert).toBeGreaterThanOrEqual(3_800);
  });

  it("Regie statistics stay 15, 12, 2, 1 (the WhatsApp-Meldung is no Regiebericht)", () => {
    expect(p1.regie).toEqual({ gesamt: 15, verrechnet: 12, unterschriebenNichtVerrechnet: 2, nichtUnterschrieben: 1, nachGrenze: 0 });
  });

  it("a find set to 'Nicht verrechnen' leaves the sum", () => {
    const e = abgleich(projekt("P1"), { entscheidungen: [{ fundSchluessel: "mehrmenge:24.02.05A", zeit: "2026-10-22T09:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }] });
    expect(e.summen.zusaetzlichVerrechenbar).toBe(ausListe("14.620,15 €") - ausListe("3.326,40 €"));
    expect(e.funde.find((f) => f.nr === "F4")!.entscheidung).toBe("nicht_verrechnen");
  });
});

describe("P2 Bürohaus Kiefernau: Lauf je Abschlagsrechnung", () => {
  const p2 = abgleich(projekt("P2"));

  it("3 finds, 4.852,73 € zusätzlich verrechenbar, nothing in Klärung", () => {
    expect(p2.grenze).toBe("2026-09-30");
    expect(p2.funde.map((f) => [f.nr, f.schluessel, f.art, f.belegstand, f.betrag])).toEqual([
      ["F1", "regie:6", "regie", "belegt", ausListe("809,13 €")],
      ["F2", "regie:4", "regie", "belegt", ausListe("803,60 €")],
      ["F3", "nicht_verrechnet:22.03.08A", "nicht_verrechnet", "belegt", ausListe("3.240,00 €")],
    ]);
    expect([p2.summen.zusaetzlichVerrechenbar, p2.summen.inKlaerung]).toEqual([ausListe("4.852,73 €"), ausListe("0,00 €")]);
  });

  it("P2-F1 from the WhatsApp-Meldung of 24.09.2026: Regiebericht 6, work date before Abschlagsrechnung 2", () => {
    const f1 = p2.funde[0];
    expect(f1.rechenweg.text).toBe("5 h × 64,80 € + 5 h × 54,20 € + Material 186,20 € + 15 % (27,93 €) = 809,13 €");
    expect(f1.arbeitsdatum).toBe("2026-09-24");
    expect(f1.nachweise.map((n) => n.art)).toEqual(["whatsapp", "regiebericht"]);
  });

  it("on 30.09.2026 the same work was 'Stunden ohne Regiebericht', 595,00 €, Beleg fehlt (Verlauf of P2-F1)", () => {
    const damals = abgleich(zumStichtag(projekt("P2"), "2026-09-30"));
    const f = damals.funde.find((x) => x.schluessel === "meldung:P2-W1")!;
    expect([f.art, f.belegstand, f.betrag, f.abhilfe]).toEqual(["stunden_ohne_regiebericht", "beleg_fehlt", ausListe("595,00 €"), "Regiebericht schreiben und vom Polier unterschreiben lassen"]);
    expect(damals.funde.map((x) => x.schluessel)).toEqual(["regie:4", "nicht_verrechnet:22.03.08A", "meldung:P2-W1"]);
  });

  it("P2-F3: Leistungsverzeichnis 880 m, measured up to Aufmaßblatt 5 760 m, invoiced 610 m", () => {
    const p = p2.funde[2].positionen[0];
    expect([p.lvMenge, p.aufmassMenge, p.verrechnetMenge]).toEqual([88_000, 76_000, 61_000]);
    expect(p2.funde[2].nachweise.map((n) => n.titel)).toEqual(["Leistungsverzeichnis", "Aufmaßblatt 5"]);
  });

  it("counter-checks: Aufmaßblatt 6 and Regiebericht 7 lie after the last Abschlagsrechnung", () => {
    expect(p2.regie.nachGrenze).toBe(1);
    expect(p2.funde.some((f) => f.schluessel === "regie:7")).toBe(false);
  });
});

describe("P3 Volksschule Ahornbrunn", () => {
  const p3 = abgleich(projekt("P3"));

  it("3.160,08 € zusätzlich verrechenbar and 245,60 € in Klärung", () => {
    expect(p3.funde.map((f) => [f.nr, f.schluessel, f.belegstand, f.betrag])).toEqual([
      ["F1", "regie:3", "belegt", ausListe("1.307,28 €")],
      ["F2", "mehrmenge:22.07.04A", "belegt", ausListe("1.852,80 €")],
      ["F3", "regie:5", "beleg_fehlt", ausListe("245,60 €")],
    ]);
    expect([p3.summen.zusaetzlichVerrechenbar, p3.summen.inKlaerung]).toEqual([ausListe("3.160,08 €"), ausListe("245,60 €")]);
  });

  it("Regiematerial with 10 %, the Regiebericht signed by the örtliche Bauaufsicht", () => {
    expect(p3.funde[0].rechenweg.text).toBe("10 h × 61,40 € + 10 h × 51,20 € + Material 164,80 € + 10 % (16,48 €) = 1.307,28 €");
    expect(p3.funde[2].abhilfe).toBe("Regiebericht von der örtlichen Bauaufsicht unterschreiben lassen");
  });

  it("+11,4 % on P3-F2 gives no note; Regiebericht 6 lies after the last Abschlagsrechnung", () => {
    expect(p3.hinweise).toEqual([]);
    expect(p3.regie.nachGrenze).toBe(1);
  });
});

describe("closed projects", () => {
  it("P4 and P5 have no Abgleich", () => {
    for (const kurz of ["P4", "P5"]) {
      const e = abgleich(projekt(kurz));
      expect([e.laeuft, e.funde.length, e.hinweise.length]).toEqual([false, 0, 0]);
    }
  });
});
