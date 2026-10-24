// Rule by rule on a small dataset: a positive case and a counter-check each, also for the rules that have no case in
// solution list v3 ("Pauschale laut Vertrag", "Preisumrechnung"). Amounts here are test values of the small dataset only.

import { describe, expect, it } from "vitest";
import type { Email } from "../src/modell";
import { abgleich } from "../src/regeln";
import { f, kleinerDatensatz } from "./hilfen";

const anmeldung = (kategorie: string): Email => ({
  belegId: "mail-anmeldung",
  datum: f("2026-05-04"),
  absender: f("Bauleitung Betrieb"),
  von: "betrieb",
  betreff: f("Anmeldung Mehrkosten"),
  kategorie: f("anmeldung"),
  zitat: null,
  bezugPositionen: f([]),
  aendertBauzeit: f(false),
  anmeldung: { gegenstand: f("Zusatzleistung"), kategorie: f(kategorie), anweisungBelegId: null, stunden: f(1_000), material: f(10_000), nachtragGelegt: f(false) },
});

describe("counter-checks on a project without anything open", () => {
  it("no find, no note", () => {
    const e = abgleich(kleinerDatensatz());
    expect([e.funde, e.hinweise]).toEqual([[], []]);
  });

  it("less measured than in the Leistungsverzeichnis and invoiced as measured is no find", () => {
    const d = kleinerDatensatz();
    d.aufmass[0].zeilen[0].menge = f(8_000);
    d.entwurf!.zeilen[0] = { typ: "position", positionNr: f("22.01.01A"), menge: f(8_000), ep: f(1_000), betrag: f(80_000) };
    expect(abgleich(d).funde).toEqual([]);
  });

  it("an instruction by e-mail on a position invoiced in full is no find", () => {
    const d = kleinerDatensatz();
    d.emails.push({ ...anmeldung("x"), kategorie: f("anweisung"), anmeldung: null, bezugPositionen: f(["22.01.01A"]) });
    expect(abgleich(d).funde).toEqual([]);
  });

  it("a meeting e-mail ('Termin' without a schedule change) is no Rechtsfrage", () => {
    const d = kleinerDatensatz();
    d.emails.push({ ...anmeldung("x"), von: "auftraggeber", kategorie: f("termin"), anmeldung: null });
    expect(abgleich(d).hinweise).toEqual([]);
  });
});

describe("Mehrmenge and 'erbracht, nicht verrechnet'", () => {
  it("above the Leistungsverzeichnis: Mehrmenge; +20 % exactly gives no note, above it does", () => {
    const d = kleinerDatensatz();
    d.aufmass[0].zeilen[0].menge = f(12_000);
    expect(abgleich(d).funde.map((x) => [x.art, x.betrag])).toEqual([["mehrmenge", 20_000]]);
    expect(abgleich(d).hinweise).toEqual([]);
    d.aufmass[0].zeilen[0].menge = f(12_100);
    expect(abgleich(d, { auftraggeber: "Testbau" }).hinweise.map((h) => h.text)).toEqual(["Testbau kann hier einen neuen Einheitspreis prüfen."]);
  });

  it("below the Leistungsverzeichnis but above what is invoiced: 'erbracht, nicht verrechnet'", () => {
    const d = kleinerDatensatz();
    d.entwurf!.zeilen[0] = { typ: "position", positionNr: f("22.01.01A"), menge: f(9_000), ep: f(1_000), betrag: f(90_000) };
    expect(abgleich(d).funde.map((x) => [x.art, x.betrag, x.untertitel])).toEqual([["nicht_verrechnet", 10_000, "10 m erbracht, nicht verrechnet"]]);
  });
});

describe("changes notified by e-mail", () => {
  it("priced on the Preisbasis: hours × Mittellohnpreis + material with the surcharge of the own calculation", () => {
    const d = kleinerDatensatz();
    d.emails.push(anmeldung("technikraum"));
    expect(abgleich(d).funde.map((x) => [x.art, x.belegstand, x.betrag])).toEqual([["aenderung_angemeldet", "nachtrag_nicht_gelegt", 58_600 + 10_000 + 1_200]]);
  });

  it("covered by a lump sum of the Vertrag: 'Pauschale laut Vertrag', no Belegstand, in no sum", () => {
    const d = kleinerDatensatz();
    d.emails.push(anmeldung("baustelleneinrichtung"));
    const e = abgleich(d);
    expect(e.funde.map((x) => [x.art, x.belegstand, x.untertitel])).toEqual([["pauschale", null, "Vertragspunkt 4.3 nennt das als Pauschale"]]);
    expect([e.summen.zusaetzlichVerrechenbar, e.summen.inKlaerung]).toEqual([0, 0]);
  });

  it("a priced Nachtrag is no find", () => {
    const d = kleinerDatensatz();
    const m = anmeldung("technikraum");
    m.anmeldung!.nachtragGelegt = f(true);
    d.emails.push(m);
    expect(abgleich(d).funde).toEqual([]);
  });
});

describe("Preisumrechnung", () => {
  it("variable prices: labour share of the work from the start date × change of the index", () => {
    const d = kleinerDatensatz();
    d.vertrag.preise = { art: "veraenderlich", punkt: "7.2", stichtag: f("2026-02-01"), lohnanteil: f(4_000), indexName: f("Baukostenindex Lohn") };
    d.indexblatt = { belegId: "ix", name: f("Baukostenindex Lohn"), basis: f(12_000), aktuell: f(12_600), stand: f("2026-09-30") };
    // 100 m × 10,00 € = 1.000,00 €; 40 % = 400,00 €; +5,0 % = 20,00 €
    expect(abgleich(d).funde.map((x) => [x.art, x.betrag])).toEqual([["preisumrechnung", 2_000]]);
  });

  it("Festpreise: the check runs and finds nothing", () => {
    const d = kleinerDatensatz();
    d.indexblatt = { belegId: "ix", name: f("Baukostenindex Lohn"), basis: f(12_000), aktuell: f(12_600), stand: f("2026-09-30") };
    expect(abgleich(d).funde).toEqual([]);
  });
});

describe("projects in Ausführung: the work date decides", () => {
  it("a signed Regiebericht with its work date after the last Abschlagsrechnung is no find, its document date does not count", () => {
    const d = kleinerDatensatz();
    d.projekt.stufe = "in_ausfuehrung";
    d.entwurf = null;
    d.abschlaege = [{ nr: f("Abschlagsrechnung 1"), belegId: "ar-1", art: "abschlag", datum: f("2026-09-30"), zeilen: [{ typ: "position", positionNr: f("22.01.01A"), menge: f(10_000), ep: f(1_000), betrag: f(100_000) }], summe: f(100_000) }];
    const rb = (nr: string, datum: string, tag: string) => ({
      nr,
      belegId: `rb-${nr}`,
      datum: f(datum),
      arbeitstage: f([tag]),
      taetigkeit: f("Test"),
      angewiesenVon: null,
      stundenMonteur: f(100),
      stundenHelfer: f(0),
      material: f(0),
      unterschrieben: f(true),
      unterschriebenAm: f(datum),
      ausMeldung: null,
    });
    d.regie = [rb("1", "2026-10-01", "2026-09-24"), rb("2", "2026-09-29", "2026-10-02")];
    expect(abgleich(d).funde.map((x) => x.schluessel)).toEqual(["regie:1"]);
  });
});
