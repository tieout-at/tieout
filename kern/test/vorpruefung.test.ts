// Run step "Vorprüfung" against solution list v3: 3 positions, 8.619,00 €, "droht" apart from "schon gekürzt",
// "davon mit Kürzungsrisiko" (E13), every rate of the Auftraggeber against the Vertrag, and the counter-checks.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { abgleich } from "../src/regeln";
import { vorpruefung } from "../src/vorpruefung";
import { ausListe, f, kleinerDatensatz } from "./hilfen";

const firma = beispielFirma();
const p1 = firma.projekte[0];
const vp = vorpruefung(p1, abgleich(p1))!;

describe("P1 Wohnpark Mooshaim: Vorprüfung", () => {
  it("G1 to G3 with reason, find, amount and state", () => {
    expect(vp.risiken.map((r) => [r.nr, r.grund, r.fundSchluessel, r.betrag, r.zustand])).toEqual([
      ["G1", "aufmass_nicht_gegengezeichnet", "plan:H-201:D", ausListe("6.648,60 €"), "droht"],
      ["G2", "stunden_weichen_ab", "regie:9", ausListe("194,40 €"), "droht"],
      ["G3", "ausserhalb_lv_kein_nachtrag", null, ausListe("1.776,00 €"), "schon_gekuerzt"],
    ]);
  });

  it("total 8.619,00 €: 'droht' 6.843,00 €, 'schon gekürzt' 1.776,00 €; 'davon mit Kürzungsrisiko' 6.843,00 €", () => {
    expect([vp.summe, vp.droht, vp.schonGekuerzt, vp.davonMitKuerzungsrisiko]).toEqual(["8.619,00 €", "6.843,00 €", "1.776,00 €", "6.843,00 €"].map(ausListe));
  });

  it("remedies as in the list", () => {
    expect(vp.risiken.map((r) => r.abhilfe)).toEqual([
      "Plan H-201 Index D und die E-Mail vom 07.04. beilegen, gemeinsames Aufmaß vereinbaren",
      "3 h Monteur mit der Bauleitung klären, bevor die Schlussrechnung hinausgeht",
      "Anweisung suchen oder Position streichen",
    ]);
  });

  it("G1 names Aufmaßblatt 12, G2 Regiebericht 9 against the Stundenzettel KW 23, Trupp 2", () => {
    expect(vp.risiken[0].bezug).toBe("F1 (4 Positionen)");
    expect(vp.risiken[0].detail).toBe("Aufmaßblatt 12 vom Auftraggeber nicht gegengezeichnet");
    expect(vp.risiken[1].detail).toBe("Regiebericht 9: 12 h Monteur und 12 h Helfer; Stundenzettel KW 23, Trupp 2: 9 h Monteur und 12 h Helfer zu Regiebericht 9");
    expect(vp.risiken[2].bezug).toBe("Z-01");
  });

  it("finds the one cut already made (1 of 1)", () => {
    expect(vp.korrekturblatt).toEqual({ zeilen: 1, erkannt: 1 });
  });

  it("every rate against the Vertrag: Nachlass and Baustrom und Bauwasser laut Vertrag, Bauschadensumlage without contract item", () => {
    expect(vp.saetze.map((s) => [s.art, s.satz, s.pruefung, s.vertragspunkt])).toEqual([
      ["nachlass", 300, "laut_vertrag", "5.1"],
      ["baustrom_bauwasser", 60, "laut_vertrag", "4.6"],
      ["haftruecklass", 300, "laut_vertrag", "9.2"],
      ["bauschadensumlage", 50, "abzug_ohne_vertragspunkt", null],
    ]);
  });

  it("counter-checks: no 'Menge ohne Aufmaß-Nachweis', no 'Rechenfehler' in P1", () => {
    expect(vp.risiken.filter((r) => r.grund === "menge_ohne_aufmass" || r.grund === "rechenfehler")).toEqual([]);
  });

  it("only with an Entwurf: P2 and P3 have no Vorprüfung", () => {
    for (const d of firma.projekte.slice(1, 3)) expect(vorpruefung(d, abgleich(d))).toBeNull();
  });
});

describe("the checks one by one (small dataset)", () => {
  it("invoiced above the Aufmaß: 'Menge ohne Aufmaß-Nachweis'", () => {
    const d = kleinerDatensatz();
    d.entwurf!.zeilen[0] = { typ: "position", positionNr: f("22.01.01A"), menge: f(10_500), ep: f(1_000), betrag: f(105_000) };
    expect(vorpruefung(d, abgleich(d))!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["menge_ohne_aufmass", 5_000]]);
  });

  it("a line printed with a wrong total: 'Rechenfehler'", () => {
    const d = kleinerDatensatz();
    d.entwurf!.zeilen[0] = { typ: "position", positionNr: f("22.01.01A"), menge: f(10_000), ep: f(1_000), betrag: f(108_000) };
    expect(vorpruefung(d, abgleich(d))!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["rechenfehler", 8_000]]);
  });

  it("an unsigned Regiebericht put into the Entwurf: 'Regie nicht unterschrieben'", () => {
    const d = kleinerDatensatz();
    d.regie = [{ nr: "1", belegId: "rb-1", datum: f("2026-05-04"), arbeitstage: f(["2026-05-04"]), taetigkeit: f("Test"), angewiesenVon: null, stundenMonteur: f(100), stundenHelfer: f(0), material: f(0), unterschrieben: f(false), unterschriebenAm: null, ausMeldung: null }];
    d.entwurf!.zeilen.push({ typ: "regie", regieberichtNr: f("1"), betrag: f(6_480) });
    expect(vorpruefung(d, abgleich(d))!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["regie_nicht_unterschrieben", 6_480]]);
  });
});
