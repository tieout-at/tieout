// Business level against solution list v3: projects with status colour, company figures for "Start" and "Berichte",
// "Belegquelle" per find, the Auftraggeber history and the settlement of the closed projects.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import { ausListe } from "./hilfen";

const f = pruefeFirma(beispielFirma());
const ergebnis = (id: string) => f.ergebnisse[id];

describe("Projekte", () => {
  it("per project 'zusätzlich verrechenbar', 'in Klärung', date and status colour", () => {
    expect(f.projekte.map((p) => [p.name, p.auftraggeber.kurzname, p.stufe, p.datum, p.zusaetzlichVerrechenbar, p.inKlaerung, p.status])).toEqual([
      ["Wohnpark Mooshaim", "Hornfeld Bau", "sr_vorbereiten", { art: "legen_bis", wert: "2026-10-30" }, ausListe("14.620,15 €"), ausListe("8.073,59 €"), "rot"],
      ["Bürohaus Kiefernau", "Hornfeld Bau", "in_ausfuehrung", { art: "letzte_abschlagsrechnung", wert: "2026-09-30" }, ausListe("4.852,73 €"), ausListe("0,00 €"), "gelb"],
      ["Volksschule Ahornbrunn", "Marktgemeinde Ahornbrunn", "in_ausfuehrung", { art: "letzte_abschlagsrechnung", wert: "2026-09-30" }, ausListe("3.160,08 €"), ausListe("245,60 €"), "gelb"],
      ["Wohnhof Erlenhain", "Hornfeld Bau", "abgeschlossen", { art: "schlusszahlung", wert: "2026-02-18" }, null, null, "grau"],
      ["Pflegeheim Eibenau", "Pfeilberg Bau", "abgeschlossen", { art: "schlusszahlung", wert: "2025-09-12" }, null, null, "grau"],
    ]);
    expect(f.naechsteSchlussrechnung).toEqual({ projektId: "p1", datum: "2026-10-30" });
  });

  it("contract sums: 5 projects 3.487.720,00 €, 3 open projects 1.897.820,00 €", () => {
    expect([f.summen.projekte, f.summen.offeneProjekte, f.summen.auftragssumme, f.summen.auftragssummeOffen]).toEqual([5, 3, ausListe("3.487.720,00 €"), ausListe("1.897.820,00 €")]);
  });
});

describe("company figures ('Start' and 'Berichte')", () => {
  it("'zusätzlich verrechenbar' 22.632,96 € in 10 finds and 'in Klärung' 8.319,19 € in 4 finds, never added", () => {
    expect([f.summen.zusaetzlichVerrechenbar, f.summen.fundeZusaetzlich, f.summen.inKlaerung, f.summen.fundeInKlaerung]).toEqual([ausListe("22.632,96 €"), 10, ausListe("8.319,19 €"), 4]);
  });

  it("of which 'Beleg fehlt' 1.365,59 € (3) and 'Nachtrag nicht gelegt' 6.953,60 € (1)", () => {
    expect(f.geld.belegFehlt).toEqual({ betrag: ausListe("1.365,59 €"), anzahl: 3 });
    expect(f.geld.nachtragNichtGelegt).toEqual({ betrag: ausListe("6.953,60 €"), anzahl: 1 });
  });

  it("'davon mit Kürzungsrisiko' 6.843,00 € (G1 and G2, P1 only)", () => {
    expect(f.davonMitKuerzungsrisiko).toEqual({ betrag: ausListe("6.843,00 €"), anzahl: 2 });
  });

  it("'nur außerhalb ERP' per money word: 15.507,36 € of 'zusätzlich verrechenbar' (7 of 10), all of 'in Klärung' (4 of 4)", () => {
    expect(f.ausserhalbErp.zusaetzlichVerrechenbar).toEqual({ betrag: ausListe("15.507,36 €"), anzahl: 7, vonBetrag: ausListe("22.632,96 €"), vonAnzahl: 10 });
    expect(f.ausserhalbErp.inKlaerung).toEqual({ betrag: ausListe("8.319,19 €"), anzahl: 4, vonBetrag: ausListe("8.319,19 €"), vonAnzahl: 4 });
    expect(ergebnis("p1").ausserhalbErp.zusaetzlichVerrechenbar.betrag).toBe(ausListe("12.587,35 €"));
    expect(ergebnis("p2").ausserhalbErp.zusaetzlichVerrechenbar.betrag).toBe(ausListe("1.612,73 €"));
    expect(ergebnis("p3").ausserhalbErp.zusaetzlichVerrechenbar.betrag).toBe(ausListe("1.307,28 €"));
  });
});

describe("Belegquelle per find (P1)", () => {
  it("proof of the work, not of the price", () => {
    const e = ergebnis("p1");
    expect(e.abgleich.funde.map((x) => [x.nr, e.belegquellen[x.schluessel].join(", ")])).toEqual([
      ["F1", "datei, email, foto, whatsapp"],
      ["F2", "papier, whatsapp"],
      ["F3", "papier, whatsapp"],
      ["F4", "datei"],
      ["F5", "datei, foto"],
      ["F6", "papier"],
      ["F7", "whatsapp"],
      ["F8", "email"],
    ]);
  });
});

describe("Auftraggeber history", () => {
  const h = (id: string) => f.historie.find((x) => x.auftraggeber.id === id)!;

  it("Hornfeld Bau: 3 projects (1 closed), cuts 4.431,20 € in 3 rows and 2 projects, deductions without contract item 6.628,41 € in 2 projects", () => {
    const x = h("hornfeld");
    expect([x.projekte, x.abgeschlossen, x.kuerzungenSumme, x.kuerzungen.length, x.kuerzungenProjekte, x.abzuegeSumme, x.abzuegeProjekte]).toEqual([3, 1, ausListe("4.431,20 €"), 3, 2, ausListe("6.628,41 €"), 2]);
    expect(x.kuerzungen.map((k) => [k.projekt, k.bezug, k.grund, k.betrag])).toEqual([
      ["Wohnpark Mooshaim", "Z-01", "ausserhalb_lv_kein_nachtrag", ausListe("1.776,00 €")],
      ["Wohnhof Erlenhain", "22.04.10A", "aufmass_nicht_gegengezeichnet", ausListe("2.575,20 €")],
      ["Wohnhof Erlenhain", "24.05.03A", "rechenfehler", ausListe("80,00 €")],
    ]);
    expect(x.abzuege.map((a) => [a.projekt, a.art, a.betrag])).toEqual([
      ["Wohnpark Mooshaim", "bauschadensumlage", ausListe("3.322,86 €")],
      ["Wohnhof Erlenhain", "bauschadensumlage", ausListe("3.305,55 €")],
    ]);
  });

  it("Hornfeld Bau: Nachträge 2 of 3 accepted, 8.820,00 € of 10.680,00 € (82,6 %); 90 days until the final payment", () => {
    const x = h("hornfeld");
    expect(x.nachtraege).toEqual({ angeboten: 3, beauftragt: 2, betrag: ausListe("10.680,00 €"), betragBeauftragt: ausListe("8.820,00 €"), quote: 8_258 });
    expect(x.schlusszahlung.map((s) => [s.projekt, s.tage])).toEqual([["Wohnhof Erlenhain", 90]]);
  });

  it("Pfeilberg Bau: cuts 3.239,20 € in 2 rows, no deduction without contract item, Nachträge 2 of 2 with 14.100,00 €, 74 days", () => {
    const x = h("pfeilberg");
    expect([x.projekte, x.abgeschlossen, x.kuerzungenSumme, x.kuerzungen.length, x.abzuegeSumme]).toEqual([1, 1, ausListe("3.239,20 €"), 2, 0]);
    expect(x.kuerzungen.map((k) => [k.bezug, k.grund, k.betrag])).toEqual([
      ["Regiebericht 9", "regie_nicht_unterschrieben", ausListe("1.599,20 €")],
      ["26.02.03A", "menge_ohne_aufmass", ausListe("1.640,00 €")],
    ]);
    expect([x.nachtraege.angeboten, x.nachtraege.beauftragt, x.nachtraege.betragBeauftragt]).toEqual([2, 2, ausListe("14.100,00 €")]);
    expect(x.schlusszahlung.map((s) => s.tage)).toEqual([74]);
  });

  it("Marktgemeinde Ahornbrunn: 1 project, nothing closed, no history yet", () => {
    const x = h("ahornbrunn");
    expect([x.projekte, x.abgeschlossen, x.kuerzungen.length, x.abzuege.length, x.nachtraege.angeboten]).toEqual([1, 0, 0, 0, 0]);
  });

  it("bridge to the demo: the same reason by the key, never by the text", () => {
    expect(f.gleicherGrund["p1/vp:aufmass_nicht_gegengezeichnet:plan:H-201:D"]).toEqual([{ projektId: "p4", text: "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain." }]);
    expect(f.gleicherGrund["p1/abzug:bauschadensumlage"]).toEqual([{ projektId: "p4", text: "Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain." }]);
    expect(Object.keys(f.gleicherGrund).sort()).toEqual(["p1/abzug:bauschadensumlage", "p1/vp:aufmass_nicht_gegengezeichnet:plan:H-201:D"]);
  });
});

describe("settlement of the closed projects", () => {
  it("Wohnhof Erlenhain: Schlussrechnung 684.212,40 € down to the final payment 86.223,12 €", () => {
    const a = f.abrechnungen["p4"];
    expect(a.zeilen.map((z) => [z.bezeichnung, z.betrag])).toEqual([
      ["Schlussrechnung", ausListe("684.212,40 €")],
      ["Kürzungen laut Korrekturblatt", -ausListe("2.655,20 €")],
      ["Nach Kürzungen", ausListe("681.557,20 €")],
      ["Nachlass", -ausListe("20.446,72 €")],
      ["Nach Nachlass", ausListe("661.110,48 €")],
      ["Baustrom und Bauwasser", -ausListe("3.966,66 €")],
      ["Bauschadensumlage", -ausListe("3.305,55 €")],
      ["Vor Haftrücklass", ausListe("653.838,27 €")],
      ["Haftrücklass", -ausListe("19.615,15 €")],
      ["Nach Haftrücklass", ausListe("634.223,12 €")],
      ["Bezahlte Abschlagsrechnungen", -ausListe("548.000,00 €")],
      ["Schlusszahlung", ausListe("86.223,12 €")],
    ]);
    expect(a.zeilen.find((z) => z.abzugArt === "bauschadensumlage")!.pruefung).toBe("abzug_ohne_vertragspunkt");
    expect([a.schlusszahlung.stimmt, a.schlusszahlung.tage, a.einbehalten]).toEqual([true, 90, ausListe("19.615,15 €")]);
  });

  it("Pflegeheim Eibenau: Schlussrechnung 948.360,00 € down to the final payment 56.431,83 €", () => {
    const a = f.abrechnungen["p5"];
    expect(a.zeilen.map((z) => [z.bezeichnung, z.betrag])).toEqual([
      ["Schlussrechnung", ausListe("948.360,00 €")],
      ["Kürzungen laut Korrekturblatt", -ausListe("3.239,20 €")],
      ["Nach Kürzungen", ausListe("945.120,80 €")],
      ["Nachlass", -ausListe("18.902,42 €")],
      ["Nach Nachlass", ausListe("926.218,38 €")],
      ["Haftrücklass", -ausListe("27.786,55 €")],
      ["Nach Haftrücklass", ausListe("898.431,83 €")],
      ["Bezahlte Abschlagsrechnungen", -ausListe("842.000,00 €")],
      ["Schlusszahlung", ausListe("56.431,83 €")],
    ]);
    expect([a.schlusszahlung.stimmt, a.schlusszahlung.tage]).toEqual([true, 74]);
  });

  it("the cuts of the history follow from the documents: 12 × 214,60 €, the printed line against 96 × 193,40 €, Regie with the rates of Pfeilberg Bau", () => {
    const sr = beispielFirma().projekte[3].schlussrechnung!;
    const z = sr.zeilen.find((x) => x.typ === "position" && x.positionNr.wert === "24.05.03A")!;
    expect(z.betrag.wert).toBe(ausListe("18.646,40 €"));
    expect(z.typ === "position" && Math.round((z.menge.wert * z.ep.wert) / 100)).toBe(ausListe("18.566,40 €"));
  });
});

describe("decisions on the business level", () => {
  it("a find set to 'Nicht verrechnen' (key with the project id) leaves the company figure", () => {
    const g = pruefeFirma(beispielFirma(), [{ fundSchluessel: "p2/regie:4", zeit: "2026-10-22T09:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" }]);
    expect(g.summen.zusaetzlichVerrechenbar).toBe(ausListe("22.632,96 €") - ausListe("803,60 €"));
  });
});
