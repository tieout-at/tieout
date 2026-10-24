// Edge cases from the independent review of step 2 (24.10.2026): data that look different from the sample company.
// Amounts here are test values of the small dataset only.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import { bestaetige, korrigiere, type Datensatz, type Regiebericht } from "../src/modell";
import { zaehleKorrekturen } from "../src/ordner";
import { positionstabelle } from "../src/positionen";
import { rechnungsabschluss } from "../src/rechnungsabschluss";
import { abgleich } from "../src/regeln";
import { vorpruefung } from "../src/vorpruefung";
import { f, kleinerDatensatz } from "./hilfen";

const rb = (nr: string, tage: string[], m: number, teil: Partial<Regiebericht> = {}): Regiebericht => ({
  nr,
  belegId: `rb-${nr}`,
  datum: f(tage.at(-1)!),
  arbeitstage: f(tage),
  taetigkeit: f("Test"),
  angewiesenVon: null,
  stundenMonteur: f(m),
  stundenHelfer: f(0),
  material: f(0),
  unterschrieben: f(true),
  unterschriebenAm: f(tage.at(-1)!),
  ausMeldung: null,
  ...teil,
});

const ar = (nr: number, datum: string, zeilen: Datensatz["abschlaege"][number]["zeilen"]) => ({ nr: f(`Abschlagsrechnung ${nr}`), belegId: `ar-${nr}`, art: "abschlag" as const, datum: f(datum), zeilen, summe: f(zeilen.reduce((s, z) => s + z.betrag.wert, 0)) });

describe("Regie with an Entwurf", () => {
  it("a Regiebericht invoiced in an Abschlagsrechnung but missing from the Entwurf is a find", () => {
    const d = kleinerDatensatz();
    d.regie = [rb("1", ["2026-05-04"], 400)];
    d.abschlaege = [ar(1, "2026-05-29", [{ typ: "regie", regieberichtNr: f("1"), betrag: f(25_920) }])];
    expect(abgleich(d).funde.map((x) => [x.schluessel, x.betrag])).toEqual([["regie:1", 25_920]]);
  });
});

describe("Mehrmenge and 'erbracht, nicht verrechnet' in one position", () => {
  it("above the Leistungsverzeichnis and invoiced below it: two finds, one for each part", () => {
    const d = kleinerDatensatz();
    d.aufmass[0].zeilen[0].menge = f(13_000);
    d.entwurf!.zeilen[0] = { typ: "position", positionNr: f("22.01.01A"), menge: f(8_000), ep: f(1_000), betrag: f(80_000) };
    const e = abgleich(d);
    expect(e.funde.map((x) => [x.art, x.betrag])).toEqual([
      ["mehrmenge", 30_000],
      ["nicht_verrechnet", 20_000],
    ]);
    expect(positionstabelle(d, e).zeilen[0].offen).toBe(50_000);
  });
});

describe("lump sums", () => {
  it("a lump sum measured complete and missing from the Entwurf is 'erbracht, nicht verrechnet'", () => {
    const d = kleinerDatensatz();
    d.positionen.push({ nr: f("22.08.01A"), kurztext: f("Druckprobe"), einheit: f("psch"), menge: f(100), ep: f(50_000) });
    d.aufmass[0].zeilen.push({ positionNr: f("22.08.01A"), menge: f(100), ort: f("Technikraum") });
    expect(abgleich(d).funde.map((x) => [x.art, x.betrag])).toEqual([["nicht_verrechnet", 50_000]]);
  });
});

describe("Vorprüfung", () => {
  it("'Stunden weichen ab' adds up the Stundenzettel of every week of the Regiebericht", () => {
    const d = kleinerDatensatz();
    d.regie = [rb("1", ["2026-06-05", "2026-06-08"], 1_600)];
    d.entwurf!.zeilen.push({ typ: "regie", regieberichtNr: f("1"), betrag: f(103_680) });
    d.entwurf!.summe = f(203_680);
    const zettel = (von: string, bis: string) => ({ belegId: `sz-${von}`, von: f(von), bis: f(bis), trupp: f("Trupp 1"), eintraege: [{ regieberichtNr: f("1"), stundenMonteur: f(800), stundenHelfer: f(0) }] });
    d.stundenzettel = [zettel("2026-06-01", "2026-06-05"), zettel("2026-06-08", "2026-06-12")];
    expect(vorpruefung(d, abgleich(d))!.risiken).toEqual([]);
  });

  it("'Aufmaß nicht gegengezeichnet' also for an invoiced quantity within the Leistungsverzeichnis", () => {
    const d = kleinerDatensatz();
    d.aufmass[0].zeilen[0].menge = f(6_000);
    d.aufmass.push({ ...d.aufmass[0], nr: "2", belegId: "ab-2", gegengezeichnet: f(false), gegengezeichnetAm: null, zeilen: [{ positionNr: f("22.01.01A"), menge: f(4_000), ort: f("Stiege 2") }] });
    expect(vorpruefung(d, abgleich(d))!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["aufmass_nicht_gegengezeichnet", 40_000]]);
  });
});

describe("Rechnungsabschluss", () => {
  it("'Restforderung laut Vertrag' uses the rate of the Vertrag where the Auftraggeber deviates", () => {
    const d = kleinerDatensatz();
    d.vertrag.saetze.push({ art: "baustrom_bauwasser", satz: f(60), punkt: "4.6", phase: "beide" });
    d.abzugsschreiben = { belegId: "abz", datum: f("2026-02-16"), abzuege: [{ art: "baustrom_bauwasser", satz: f(100) }] };
    const r = rechnungsabschluss(d, abgleich(d))!;
    // 1.000,00 € − 3 % = 970,00 €; Auftraggeber 1,0 % = 9,70 €, Vertrag 0,6 % = 5,82 €
    expect([r.restforderung, r.lautVertrag.restforderung]).toEqual([96_030, 96_418]);
  });

  it("a Zahlungsavis that deviates from its rates is flagged", () => {
    const d = beispielFirma().projekte[0];
    d.zahlungen[1].betrag = { ...d.zahlungen[1].betrag, wert: d.zahlungen[1].betrag.wert - 100 };
    expect(rechnungsabschluss(d, abgleich(d))!.abschlaege.map((z) => z.stimmt)).toEqual([true, false, true]);
  });

  it("cumulative Abschlagsrechnungen are read as cumulative, never added up", () => {
    const d = kleinerDatensatz();
    d.projekt.stufe = "in_ausfuehrung";
    d.entwurf = null;
    const zeile = (m: number) => ({ typ: "position" as const, positionNr: f("22.01.01A"), menge: f(m), ep: f(1_000), betrag: f(m * 10) });
    d.abschlaege = [
      { ...ar(1, "2026-04-30", [zeile(6_000)]), kumuliert: true },
      { ...ar(2, "2026-05-29", [zeile(8_000)]), kumuliert: true },
    ];
    // 100 m measured, 80 m invoiced in total (not 60 + 80)
    expect(abgleich(d).funde.map((x) => [x.art, x.betrag])).toEqual([["nicht_verrechnet", 20_000]]);
  });
});

describe("decisions and keys", () => {
  it("a decision on 'Stunden ohne Regiebericht' carries over to the Regiebericht written from the message", () => {
    const d = beispielFirma().projekte[1];
    const e = abgleich(d, { entscheidungen: [{ fundSchluessel: "meldung:P2-W1", zeit: "2026-09-30T16:00", wer: "Abrechnung", stand: "geprueft" }] });
    expect(e.funde.find((x) => x.schluessel === "regie:6")!.entscheidung).toBe("geprueft");
  });

  it("'davon mit Kürzungsrisiko' at business level matches finds per project", () => {
    const firma = beispielFirma();
    const p2 = firma.projekte[1];
    p2.regie = p2.regie.map((r) => (r.nr === "4" ? { ...r, nr: "9" } : r));
    const g = pruefeFirma(firma, [{ fundSchluessel: "p1/regie:9", zeit: "2026-10-22T09:00", wer: "Abrechnung", stand: "nicht_verrechnen" }]);
    expect(g.davonMitKuerzungsrisiko.betrag).toBe(g.ergebnisse["p1"].vorpruefung!.davonMitKuerzungsrisiko);
    expect(g.davonMitKuerzungsrisiko.betrag).toBe(664_860);
  });
});

describe("review state", () => {
  it("a field corrected and then confirmed still counts as corrected", () => {
    const x = bestaetige(korrigiere(f(9_800), 10_000, "Abrechnung", "2026-10-20T09:00"), "Geschäftsführung", "2026-10-21T08:00");
    expect(zaehleKorrekturen({ x })).toBe(1);
  });
});
