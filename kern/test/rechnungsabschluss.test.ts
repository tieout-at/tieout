// Rechnungsabschluss, the payments per Abschlagsrechnung and the Schlussbesprechungs-Blatt against solution list v3.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { rechnungsabschluss } from "../src/rechnungsabschluss";
import { abgleich } from "../src/regeln";
import { schlussbesprechung } from "../src/schlussbesprechung";
import { ausListe } from "./hilfen";

const firma = beispielFirma();
const p1 = firma.projekte[0];
const a1 = abgleich(p1);
const ra = rechnungsabschluss(p1, a1)!;

describe("P1 Wohnpark Mooshaim: Rechnungsabschluss", () => {
  it("from the Entwurf with the finds down to the Restforderung", () => {
    const zeilen = ra.zeilen.filter((z) => z.art !== "fund").map((z) => [z.bezeichnung, z.betrag]);
    expect(zeilen).toEqual([
      ["Entwurf der Schlussrechnung", ausListe("752.314,80 €")],
      ["Gesamtleistung", ausListe("766.934,95 €")],
      ["Nachlass", -ausListe("23.008,05 €")],
      ["Nach Nachlass", ausListe("743.926,90 €")],
      ["Baustrom und Bauwasser", -ausListe("4.463,56 €")],
      ["Bauschadensumlage", -ausListe("3.719,63 €")],
      ["Vor Haftrücklass", ausListe("735.743,71 €")],
      ["Haftrücklass (durch Bankgarantie ersetzbar)", -ausListe("22.072,31 €")],
      ["Betrag der Schlussrechnung vor Zahlungen", ausListe("713.671,40 €")],
      ["Zahlungen auf Abschlagsrechnung 1, Abschlagsrechnung 2, Abschlagsrechnung 3", -ausListe("624.396,99 €")],
      ["Restforderung", ausListe("89.274,41 €")],
    ]);
    expect(ra.restforderung).toBe(ausListe("89.274,41 €"));
  });

  it("every rate checked: the Bauschadensumlage is 'Abzug ohne Vertragspunkt'", () => {
    expect(ra.zeilen.filter((z) => z.art === "abzug").map((z) => [z.abzugArt, z.satz, z.pruefung, z.vertragspunkt])).toEqual([
      ["nachlass", 300, "laut_vertrag", "5.1"],
      ["baustrom_bauwasser", 60, "laut_vertrag", "4.6"],
      ["bauschadensumlage", 50, "abzug_ohne_vertragspunkt", null],
      ["haftruecklass", 300, "laut_vertrag", "9.2"],
    ]);
  });

  it("the five finds 'belegt' are in it, each marked with its decision; nothing decided yet counts", () => {
    expect(ra.zeilen.filter((z) => z.art === "fund").map((z) => [z.fundSchluessel, z.betrag])).toEqual([
      ["plan:H-201:D", ausListe("6.648,60 €")],
      ["regie:9", ausListe("1.787,49 €")],
      ["regie:15", ausListe("824,86 €")],
      ["mehrmenge:24.02.05A", ausListe("3.326,40 €")],
      ["mehrmenge:24.08.02A", ausListe("2.032,80 €")],
    ]);
  });

  it("'Restforderung laut Vertrag' (E14) without the Bauschadensumlage: 92.882,45 €", () => {
    const z = (b: string) => ra.lautVertrag.zeilen.find((x) => x.bezeichnung === b)!.betrag;
    expect(z("Vor Haftrücklass")).toBe(ausListe("739.463,34 €"));
    expect(z("Haftrücklass (durch Bankgarantie ersetzbar)")).toBe(-ausListe("22.183,90 €"));
    expect(ra.lautVertrag.schlussrechnungsbetrag).toBe(ausListe("717.279,44 €"));
    expect(ra.lautVertrag.restforderung).toBe(ausListe("92.882,45 €"));
    expect(ra.lautVertrag.restforderung - ra.restforderung).toBe(ausListe("3.608,04 €"));
    expect(ausListe("3.719,63 €") - (ra.lautVertrag.restforderung - ra.restforderung)).toBe(ausListe("111,59 €"));
  });

  it("a find set to 'Nicht verrechnen' removes its line (here F4)", () => {
    const e = abgleich(p1, { entscheidungen: [{ fundSchluessel: "mehrmenge:24.02.05A", zeit: "2026-10-22T09:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }] });
    const r = rechnungsabschluss(p1, e)!;
    expect(r.gesamtleistung).toBe(ausListe("766.934,95 €") - ausListe("3.326,40 €"));
    expect(r.zeilen.some((z) => z.fundSchluessel === "mehrmenge:24.02.05A")).toBe(false);
  });
});

describe("P1 Wohnpark Mooshaim: payments per Abschlagsrechnung", () => {
  it("every Zahlungsavis recomputed: cut, Nachlass, Baustrom und Bauwasser, Bauschadensumlage, Deckungsrücklass", () => {
    expect(ra.abschlaege.map((z) => [z.rechnungNr, z.betrag, z.kuerzung, ...z.abzuege.map((x) => x.betrag), z.bezahlt, z.stimmt])).toEqual([
      ["Abschlagsrechnung 1", ausListe("168.400,00 €"), 0, ...["5.052,00 €", "980,09 €", "816,74 €", "8.077,56 €", "153.473,61 €"].map(ausListe), true],
      ["Abschlagsrechnung 2", ausListe("276.900,00 €"), 0, ...["8.307,00 €", "1.611,56 €", "1.342,97 €", "13.281,92 €", "252.356,55 €"].map(ausListe), true],
      ["Abschlagsrechnung 3", ...["241.600,00 €", "1.776,00 €", "7.194,72 €", "1.395,78 €", "1.163,15 €", "11.503,52 €", "218.566,83 €"].map(ausListe), true],
    ]);
  });

  it("totals of the table", () => {
    const summe = (art: string) => ra.abschlaege.reduce((s, z) => s + z.abzuege.find((x) => x.art === art)!.betrag, 0);
    expect([ra.abschlaege.reduce((s, z) => s + z.betrag, 0), summe("nachlass"), summe("baustrom_bauwasser"), summe("bauschadensumlage"), summe("deckungsruecklass"), ra.zahlungen]).toEqual(
      ["686.900,00 €", "20.553,72 €", "3.987,43 €", "3.322,86 €", "32.863,00 €", "624.396,99 €"].map(ausListe),
    );
  });
});

describe("P1 Wohnpark Mooshaim: Schlussbesprechungs-Blatt", () => {
  const sb = schlussbesprechung(p1, a1)!;

  it("Forderung and Untergrenze per find, the floor with the Mittellohnkosten", () => {
    expect(sb.gruppen.flatMap((g) => g.posten.map((p) => [p.nr, p.forderung, p.untergrenze]))).toEqual([
      ["F1", ausListe("6.648,60 €"), ausListe("6.648,60 €")],
      ["F2", ausListe("1.787,49 €"), ausListe("1.411,80 €")],
      ["F3", ausListe("824,86 €"), ausListe("646,00 €")],
      ["F4", ausListe("3.326,40 €"), ausListe("3.326,40 €")],
      ["F5", ausListe("2.032,80 €"), ausListe("2.032,80 €")],
      ["F6", ausListe("643,99 €"), ausListe("500,60 €")],
      ["F7", ausListe("476,00 €"), ausListe("366,40 €")],
      ["F8", ausListe("6.953,60 €"), ausListe("5.791,20 €")],
    ]);
    expect(sb.gruppen.flatMap((g) => g.posten.map((p) => p.rechenweg))).toEqual([
      "Einheitspreis",
      "24 h × 45,80 € = 1.099,20 € + Material 312,60 €",
      "12 h × 45,80 € = 549,60 € + Material 96,40 €",
      "Einheitspreis",
      "Einheitspreis",
      "10 h × 45,80 € = 458,00 € + Material 42,60 €",
      "8 h × 45,80 €",
      "64 h × 45,80 € = 2.931,20 € + Material 2.860,00 €",
    ]);
  });

  it("groups and totals: Forderung 22.693,74 €, Untergrenze 20.723,80 €, Spielraum 1.969,94 €", () => {
    expect(sb.gruppen.map((g) => [g.belegstand, g.posten.length, g.forderung, g.untergrenze, g.spielraum])).toEqual([
      ["belegt", 5, ...["14.620,15 €", "14.065,60 €", "554,55 €"].map(ausListe)],
      ["beleg_fehlt", 2, ...["1.119,99 €", "867,00 €", "252,99 €"].map(ausListe)],
      ["nachtrag_nicht_gelegt", 1, ...["6.953,60 €", "5.791,20 €", "1.162,40 €"].map(ausListe)],
    ]);
    expect([sb.forderung, sb.untergrenze, sb.spielraum]).toEqual(["22.693,74 €", "20.723,80 €", "1.969,94 €"].map(ausListe));
  });
});
