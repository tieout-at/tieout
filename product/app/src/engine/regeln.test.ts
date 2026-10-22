// Regel für Regel: positiver Fall und Gegenprobe auf einem kleinen Datensatz.

import { describe, expect, it } from "vitest";
import type { Mail, Zuruf } from "@/domain/typen";
import { pruefe } from "./index";
import { f, miniDatensatz } from "./testdaten";
import { kalenderwoche } from "./vorpruefung";

const mail = (teil: Partial<Mail>): Mail => ({
  dokumentId: "test",
  datum: f("2026-05-01"),
  von: f("GU"),
  an: f("AN"),
  betreff: f("Betreff"),
  kategorie: f("sonstiges"),
  zitat: null,
  bezugPositionen: f([]),
  bezugPlanIndex: null,
  anmeldung: null,
  ...teil,
});

describe("Gegenprobe: vollständig abgerechnet", () => {
  it("kein Befund, kein Risiko, kein Hinweis", () => {
    const e = pruefe(miniDatensatz());
    expect(e.befunde).toEqual([]);
    expect(e.vorpruefung!.risiken).toEqual([]);
    expect(e.hinweise).toEqual([]);
  });

  it("Mindermenge (Aufmaß unter LV, so verrechnet) ist kein Befund", () => {
    const d = miniDatensatz();
    d.aufmass[0].zeilen[0].menge = f(8_000);
    d.entwurf!.zeilen[0] = { typ: "lv", positionNr: f("22.01.01A"), menge: f(8_000), ep: f(1_000), betrag: f(80_000) };
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("Mail-Anweisung zu einer voll verrechneten Position ist kein Befund", () => {
    const d = miniDatensatz();
    d.mails.push(mail({ kategorie: f("anweisung"), bezugPositionen: f(["22.01.02A"]) }));
    expect(pruefe(d).befunde).toEqual([]);
  });
});

describe("Mehrmenge", () => {
  it("Aufmaß über verrechnet → jetzt verrechenbar, Differenz × EP", () => {
    const d = miniDatensatz();
    d.aufmass[0].zeilen[1].menge = f(1_200);
    const e = pruefe(d);
    expect(e.befunde.map((b) => [b.schluessel, b.liste, b.betrag])).toEqual([["mehrmenge:22.01.02A", "jetzt", 10_000]]);
    expect(e.hinweise.map((h) => h.aenderung)).toEqual([]); // +20 % ist nicht „über 20 %“
  });

  it("ohne AG-Unterschrift → Kürzungsrisiko nur für die Menge über LV", () => {
    const d = miniDatensatz();
    d.aufmass[0].zeilen[1].menge = f(1_300);
    d.aufmass[0].unterschriftAG = f(false);
    const e = pruefe(d);
    expect(e.vorpruefung!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["aufmass_nicht_gegengezeichnet", 15_000]]);
    expect(e.hinweise.map((h) => h.aenderung)).toEqual([3_000]);
  });

  it("Planänderung als Vermerk → Art „Mehrmenge aus Planänderung“", () => {
    const d = miniDatensatz();
    d.aufmass[0].zeilen[1].menge = f(1_100);
    d.plaene.push({ dokumentId: "test", planNr: f("H-1"), index: f("D"), datum: f("2026-04-01"), titel: f("Plan"), vermerke: [{ typ: "aenderung", positionNr: f("22.01.02A"), text: f("+1") }] });
    expect(pruefe(d).befunde[0].art).toBe("mehrmenge_plan");
  });
});

describe("Regie", () => {
  it("unterschrieben, nicht verrechnet → jetzt; nicht unterschrieben → offen", () => {
    const d = miniDatensatz();
    d.entwurf!.zeilen = d.entwurf!.zeilen.filter((z) => z.typ !== "regie");
    expect(pruefe(d).befunde.map((b) => [b.schluessel, b.liste, b.betrag])).toEqual([["regie:RB-01", "jetzt", 51_000]]);
    d.regie[0].unterschriftAG = f(false);
    expect(pruefe(d).befunde.map((b) => b.liste)).toEqual(["offen"]);
  });

  it("Stunden über der Stundenliste → Kürzungsrisiko; gleiche Stunden → keins", () => {
    const d = miniDatensatz();
    d.stundenlisten.push({ dokumentId: "test", von: f("2026-06-01"), bis: f("2026-06-07"), eintraege: [{ regieNr: f("RB-01"), stundenMonteur: f(600), stundenHelfer: f(0) }] });
    expect(pruefe(d).vorpruefung!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["stunden_weichen_ab", 12_500]]);
    d.stundenlisten[0].eintraege[0].stundenMonteur = f(800);
    expect(pruefe(d).vorpruefung!.risiken).toEqual([]);
  });
});

describe("Preisumrechnung", () => {
  it("nur mit Vertragsklausel, Indexblatt und ohne Zeile im Entwurf", () => {
    const d = miniDatensatz();
    d.vertrag.preisgleitung = { punkt: "7.2", stichtag: f("2026-05-01"), lohnanteil: f(4_000), indexName: f("Index Lohn") };
    expect(pruefe(d).befunde).toEqual([]); // kein Indexblatt
    d.indexblatt = { dokumentId: "test", name: f("Index Lohn"), basis: f(12_500), aktuell: f(12_975), stand: f("2026-09-30") };
    const e = pruefe(d);
    // Leistung ab Stichtag 150.000 Cent × 40 % = 60.000 × 3,8 % = 2.280
    expect(e.befunde.map((b) => [b.schluessel, b.betrag])).toEqual([["preisumrechnung", 2_280]]);
    d.entwurf!.zeilen.push({ typ: "preisgleitung", betrag: f(2_280) });
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("Aufmaß vor dem Stichtag zählt nicht", () => {
    const d = miniDatensatz();
    d.vertrag.preisgleitung = { punkt: "7.2", stichtag: f("2026-05-01"), lohnanteil: f(4_000), indexName: f("Index Lohn") };
    d.indexblatt = { dokumentId: "test", name: f("Index Lohn"), basis: f(12_500), aktuell: f(12_975), stand: f("2026-09-30") };
    d.aufmass[0].leistungVon = f("2026-04-01");
    expect(pruefe(d).befunde).toEqual([]);
  });
});

describe("Anmeldungen und Hinweise", () => {
  const anmeldung = (kategorie: string, bepreist = false) =>
    mail({
      kategorie: f("anmeldung"),
      anmeldung: { gegenstand: f("Umbau"), kategorie: f(kategorie), stunden: f(1_000), material: f(10_000), bepreist: f(bepreist) },
    });

  it("nie bepreist → offen, Lohn mit Mittellohnpreis", () => {
    const d = miniDatensatz();
    d.mails.push(anmeldung("planaenderung"));
    expect(pruefe(d).befunde.map((b) => [b.liste, b.betrag])).toEqual([["offen", 66_800]]);
  });

  it("vertraglich pauschal → verloren; schon bepreist → nichts", () => {
    const d = miniDatensatz();
    d.mails.push(anmeldung("baustelleneinrichtung"));
    expect(pruefe(d).befunde.map((b) => b.liste)).toEqual(["verloren"]);
    d.mails[0] = anmeldung("planaenderung", true);
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("Terminänderung des GU → Hinweis für die Kanzlei ohne Betrag", () => {
    const d = miniDatensatz();
    d.mails.push(mail({ kategorie: f("terminaenderung") }));
    expect(pruefe(d).befunde.map((b) => [b.liste, b.betrag])).toEqual([["anwalt", null]]);
  });
});

describe("Vorprüfung: Rechenfehler und Positionen außerhalb des LV", () => {
  it("zu viel verrechnet → Risiko; richtig gerechnet → keins", () => {
    const d = miniDatensatz();
    d.entwurf!.zeilen[1] = { typ: "lv", positionNr: f("22.01.02A"), menge: f(1_000), ep: f(5_000), betrag: f(50_360) };
    expect(pruefe(d).vorpruefung!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["rechenfehler", 360]]);
  });

  it("Zusatzposition ohne Nachtrag → Risiko; mit beauftragtem Nachtrag → keins", () => {
    const d = miniDatensatz();
    d.entwurf!.zeilen.push({ typ: "zusatz", positionNr: f("Z-01"), text: f("Kernbohrung"), menge: f(100), ep: f(18_000), betrag: f(18_000) });
    expect(pruefe(d).vorpruefung!.risiken.map((r) => [r.grund, r.betrag])).toEqual([["ausserhalb_lv_kein_nachtrag", 18_000]]);
    d.nachtraege.push({ positionNr: f("Z-01"), beauftragt: f(true) });
    expect(pruefe(d).vorpruefung!.risiken).toEqual([]);
  });

  it("Kürzung im Korrekturblatt → als bereits gekürzt markiert", () => {
    const d = miniDatensatz();
    d.entwurf!.zeilen.push({ typ: "zusatz", positionNr: f("Z-01"), text: f("Kernbohrung"), menge: f(100), ep: f(18_000), betrag: f(18_000) });
    d.korrekturblaetter.push({ dokumentId: "test", rechnungNr: f("AR1"), datum: f("2026-04-10"), zeilen: [{ positionNr: f("Z-01"), kuerzung: f(18_000), grund: f("nicht beauftragt") }] });
    const e = pruefe(d);
    expect(e.vorpruefung!.risiken[0].bereitsGekuerzt).toBe(true);
    expect(e.vorpruefung!.korrekturblatt).toEqual({ gekuerzt: 18_000, zeilen: 1, erkannt: 1 });
  });
});

describe("Zurufe", () => {
  const zuruf = (teil: Partial<Zuruf>): Zuruf => ({
    id: "zuruf-z1",
    nr: "Z1",
    kanal: "whatsapp",
    zeitpunkt: "2026-06-10T10:00",
    absender: "Monteur, Trupp 1",
    transkript: f("Heizkörper versetzt. Zwei Mann, sechs Stunden."),
    foto: null,
    ort: f("Top 9"),
    taetigkeit: f("Heizkörper versetzt"),
    stundenMonteur: f(600),
    stundenHelfer: f(600),
    angewiesenVon: f("Polier GU"),
    bezugPositionen: f([]),
    bezugRegie: null,
    bestaetigt: { von: "Monteur, Trupp 1", zeitpunkt: "2026-06-10T10:01" },
    ...teil,
  });

  it("Stunden ohne Regiebericht → angemeldet und offen, mit Regiesätzen, ohne Material", () => {
    const d = miniDatensatz();
    d.zurufe.push(zuruf({}));
    expect(pruefe(d).befunde.map((b) => [b.schluessel, b.art, b.liste, b.betrag])).toEqual([["zuruf:Z1", "regie_zuruf", "offen", 68_700]]);
  });

  it("Zuruf zu einem Regiebericht oder ohne Stunden ist nur Beleg, kein eigener Posten", () => {
    const d = miniDatensatz();
    d.zurufe.push(zuruf({ bezugRegie: f("RB-01") }), zuruf({ id: "zuruf-z2", nr: "Z2", stundenMonteur: f(0), stundenHelfer: f(0) }));
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("Zuruf mit LV-Position und Stunden ist Beleg der Position, kein zweiter Posten", () => {
    const d = miniDatensatz();
    d.aufmass[0].zeilen[1].menge = f(1_200);
    d.zurufe.push(zuruf({ bezugPositionen: f(["22.01.02A"]) }));
    const e = pruefe(d);
    expect(e.befunde.map((b) => b.schluessel)).toEqual(["mehrmenge:22.01.02A"]);
    expect(e.befunde[0].belege.map((b) => b.titel)).toContain("Zuruf Z1");
  });

  it("Zuruf mit Verweis auf einen fehlenden Regiebericht wird eigener Posten, nicht verschluckt", () => {
    const d = miniDatensatz();
    d.zurufe.push(zuruf({ bezugRegie: f("RB-99") }));
    expect(pruefe(d).befunde.map((b) => b.schluessel)).toEqual(["zuruf:Z1"]);
  });

  it("Zuruf-Regie, die mit der Zuruf-Nummer verrechnet ist, ist kein Posten mehr", () => {
    const d = miniDatensatz();
    d.zurufe.push(zuruf({}));
    d.entwurf!.zeilen.push({ typ: "regie", regieNr: f("Z1"), betrag: f(68_700) });
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("Zuruf hängt als Beleg am Regiebericht", () => {
    const d = miniDatensatz();
    d.entwurf!.zeilen = d.entwurf!.zeilen.filter((z) => z.typ !== "regie");
    d.zurufe.push(zuruf({ bezugRegie: f("RB-01") }));
    expect(pruefe(d).befunde[0].belege.map((b) => b.titel)).toEqual(["Regiebericht RB-01", "Zuruf Z1"]);
  });
});

describe("Projekt in Ausführung (ohne Entwurf)", () => {
  const laufend = () => {
    const d = miniDatensatz();
    d.projekt.status = "in_ausfuehrung";
    d.entwurf = null;
    d.abschlaege.push({
      nr: f("AR1"),
      dokumentId: "test",
      art: "abschlag",
      datum: f("2026-06-30"),
      zeilen: [
        { typ: "lv", positionNr: f("22.01.01A"), menge: f(10_000), ep: f(1_000), betrag: f(100_000) },
        { typ: "lv", positionNr: f("22.01.02A"), menge: f(1_000), ep: f(5_000), betrag: f(50_000) },
        { typ: "regie", regieNr: f("RB-01"), betrag: f(51_000) },
      ],
      summe: f(201_000),
    });
    return d;
  };

  it("alles bis zur letzten AR verrechnet → kein Befund, keine Vorprüfung, keine Kaskade", () => {
    const e = pruefe(laufend());
    expect({ befunde: e.befunde, vorpruefung: e.vorpruefung, kaskade: e.kaskade, grenze: e.grenze }).toEqual({ befunde: [], vorpruefung: null, kaskade: null, grenze: "2026-06-30" });
  });

  it("vor der letzten AR erbracht, nicht verrechnet → Befund „erbracht, nicht verrechnet“", () => {
    const d = laufend();
    d.abschlaege[0].zeilen[0] = { typ: "lv", positionNr: f("22.01.01A"), menge: f(8_000), ep: f(1_000), betrag: f(80_000) };
    expect(pruefe(d).befunde.map((b) => [b.schluessel, b.art, b.betrag])).toEqual([["nicht_verrechnet:22.01.01A", "nicht_verrechnet", 20_000]]);
  });

  it("Leistung am Tag der letzten AR zählt mit (bis einschließlich)", () => {
    const d = laufend();
    d.aufmass.push({ ...d.aufmass[0], nr: "AB-02", datum: f("2026-06-30"), zeilen: [{ positionNr: f("22.01.02A"), menge: f(200), ort: f("St. 2") }] });
    expect(pruefe(d).befunde.map((b) => [b.schluessel, b.betrag])).toEqual([["mehrmenge:22.01.02A", 10_000]]);
    d.abschlaege[0].zeilen[1] = { typ: "lv", positionNr: f("22.01.02A"), menge: f(1_200), ep: f(5_000), betrag: f(60_000) };
    expect(pruefe(d).befunde).toEqual([]);
  });

  it("noch keine AR und kein Entwurf → nichts kann vergessen sein", () => {
    const d = laufend();
    d.abschlaege = [];
    const e = pruefe(d);
    expect({ befunde: e.befunde, regie: e.regie.unterschriebenNichtVerrechnet }).toEqual({ befunde: [], regie: 0 });
  });

  it("Zuruf nach der letzten AR ist kein Posten", () => {
    const d = laufend();
    d.zurufe.push({
      id: "zuruf-z1",
      nr: "Z1",
      kanal: "whatsapp",
      zeitpunkt: "2026-07-02T10:00",
      absender: "Monteur, Trupp 1",
      transkript: f("Ein Mann, vier Stunden."),
      foto: null,
      ort: f("Top 1"),
      taetigkeit: f("Ventil getauscht"),
      stundenMonteur: f(400),
      stundenHelfer: f(0),
      angewiesenVon: null,
      bezugPositionen: f([]),
      bezugRegie: null,
      bestaetigt: { von: "Monteur, Trupp 1", zeitpunkt: "2026-07-02T10:01" },
    });
    expect(pruefe(d).befunde).toEqual([]);
    d.zurufe[0].zeitpunkt = "2026-06-20T10:00";
    expect(pruefe(d).befunde.map((b) => b.schluessel)).toEqual(["zuruf:Z1"]);
  });

  it("Gegenprobe: Aufmaß und Regie nach der letzten AR sind kein Befund", () => {
    const d = laufend();
    d.aufmass.push({ ...d.aufmass[0], nr: "AB-02", datum: f("2026-07-15"), zeilen: [{ positionNr: f("22.01.02A"), menge: f(500), ort: f("St. 2") }] });
    d.regie.push({ ...d.regie[0], nr: f("RB-02"), datum: f("2026-07-10") });
    const e = pruefe(d);
    expect(e.befunde).toEqual([]);
    expect(e.ledger.find((z) => z.positionNr === "22.01.02A")).toMatchObject({ differenzMenge: 0, naechsteArMenge: 500 });
    expect(e.regie).toMatchObject({ unterschriebenNichtVerrechnet: 0, nachGrenze: 1 });
  });

  it("Schlussrechnung gelegt → kein Abgleich", () => {
    const d = laufend();
    d.abschlaege = [];
    d.projekt.status = "sr_gelegt";
    const e = pruefe(d);
    expect({ abgleich: e.abgleich, befunde: e.befunde.length, ledger: e.ledger.length }).toEqual({ abgleich: false, befunde: 0, ledger: 0 });
  });
});

describe("Import und Hilfen", () => {
  it("Duplikate über gleiche Prüfsumme", () => {
    expect(pruefe(miniDatensatz()).import.duplikate).toBe(1);
  });

  it("ISO-Kalenderwoche", () => {
    expect(kalenderwoche("2026-06-01")).toBe(23);
    expect(kalenderwoche("2026-06-07")).toBe(23);
    expect(kalenderwoche("2026-01-01")).toBe(1);
    expect(kalenderwoche("2027-01-01")).toBe(53);
  });
});
