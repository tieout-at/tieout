// Step 14: gaps of a project and the facts that come back from the site. Without an Eingang every amount stays
// (betraege.test.ts); with one the core computes on, and a find keeps its number.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import { euro } from "../src/geld";
import { aktiveEingaenge, type Eingang } from "../src/luecken";

const daten = beispielFirma();
const ein = (lueckeSchluessel: string, gueltig = true, zeit = "2026-10-23T09:00"): Eingang => ({ lueckeSchluessel, zeit, wer: "Abrechnung", gueltig });
const p1 = (eingaenge: Eingang[] = []) => pruefeFirma(daten, [], eingaenge).ergebnisse.p1;

describe("Lücken", () => {
  it("nennt jede offene Stelle von Wohnpark Mooshaim einmal", () => {
    const l = p1().luecken;
    expect(l.map((x) => x.schluessel)).toEqual(["unterschrift:rb-12", "regiebericht:W4", "nachtrag:anmeldung:mail-0316", "gegenzeichnung:ab-12", "klaerung:vp:stunden_weichen_ab:9", "klaerung:vp:ausserhalb_lv_kein_nachtrag:Z-01"]);
    expect(l.filter((x) => x.mappe).map((x) => x.schluessel)).toEqual(["unterschrift:rb-12", "regiebericht:W4", "gegenzeichnung:ab-12"]);
    expect(l.find((x) => x.schluessel === "unterschrift:rb-12")).toMatchObject({ bezug: "F6", unterschreibt: "Polier", betrag: 64399, wirkung: "in_rechnung", blatt: { belegId: "rb-12", seite: 1, stelle: "Unterschrift Auftraggeber" } });
    expect(l.find((x) => x.schluessel === "gegenzeichnung:ab-12")).toMatchObject({ bezug: "F1 (4 Positionen)", unterschreibt: "Auftraggeber", betrag: 664860, wirkung: "kuerzungsrisiko" });
  });

  it("legt zu Aufmaßblatt 12 Plan und E-Mail bei, wie die Abhilfe sagt", () => {
    const b = p1().luecken.find((x) => x.art === "gegenzeichnung")!.beilagen;
    expect(b.map((x) => [x.belegId, x.titel])).toEqual([["plan-h201-d", "Plan H-201 Index D"], ["mail-0407", "E-Mail vom 07.04.2026"]]);
  });

  it("bereitet den Regiebericht nur aus der WhatsApp-Meldung vor", () => {
    expect(p1().luecken.find((x) => x.art === "regiebericht")!.vorlage).toEqual({ meldung: "w4", arbeitstag: "2026-09-08", ort: "Stiege 2, Top 9", taetigkeit: "Heizkörper Top 9 versetzt", angeordnet: "Polier Hornfeld Bau", monteur: 400, helfer: 400 });
  });

  it("gibt ein abgeschlossenes Projekt und eines ohne Lücke leer zurück", () => {
    const b = pruefeFirma(daten);
    expect(b.ergebnisse.p2.luecken).toEqual([]);
    expect(b.ergebnisse.p4.luecken).toEqual([]);
    expect(b.ergebnisse.p5.luecken).toEqual([]);
    expect(b.ergebnisse.p3.luecken.map((x) => [x.schluessel, x.unterschreibt])).toEqual([["unterschrift:rb-5", "örtliche Bauaufsicht"]]);
  });

  it("lässt einen Fund auf Nicht verrechnen aus", () => {
    const b = pruefeFirma(daten, [{ fundSchluessel: "p1/regie:12", zeit: "2026-10-23T08:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "x" }]);
    expect(b.ergebnisse.p1.luecken.map((x) => x.schluessel)).not.toContain("unterschrift:rb-12");
  });
});

describe("Eingänge", () => {
  it("bringt Regiebericht 12 in die Rechnung, die Treppe rechnet neu", () => {
    const e = p1([ein("p1/unterschrift:rb-12")]);
    expect(euro(e.rechnungsabschluss!.restforderung)).toBe("89.873,66 €");
    expect(euro(e.rechnungsabschluss!.lautVertrag.restforderung)).toBe("93.484,74 €");
    expect(euro(e.abgleich.summen.zusaetzlichVerrechenbar)).toBe("15.264,14 €");
    expect(euro(e.abgleich.summen.inKlaerung)).toBe("7.429,60 €");
    expect(e.luecken.find((x) => x.art === "unterschrift")!.eingang?.wer).toBe("Abrechnung");
  });

  it("nimmt mit Aufmaßblatt 12 das Kürzungsrisiko weg und lässt die Restforderung", () => {
    const e = p1([ein("p1/gegenzeichnung:ab-12")]);
    expect(euro(e.rechnungsabschluss!.restforderung)).toBe("89.274,41 €");
    expect(euro(e.vorpruefung!.davonMitKuerzungsrisiko)).toBe("194,40 €");
  });

  it("macht aus der WhatsApp-Meldung Regiebericht 16 mit denselben 476,00 €", () => {
    const f = p1([ein("p1/regiebericht:W4")]).abgleich.funde.find((x) => x.nr === "F7")!;
    expect(f).toMatchObject({ schluessel: "regie:16", belegstand: "belegt", betrag: 47600, fruehereSchluessel: ["meldung:W4"] });
  });

  it("lässt jede Fundnummer stehen", () => {
    const nummern = (e: ReturnType<typeof p1>) => e.abgleich.funde.map((f) => [f.nr, f.betrag]);
    expect(nummern(p1([ein("p1/unterschrift:rb-12"), ein("p1/regiebericht:W4")]))).toEqual(nummern(p1()));
  });

  it("schreibt die Unterschrift in den Stand des Funds", () => {
    const f = p1([ein("p1/unterschrift:rb-12")]).abgleich.funde.find((x) => x.nr === "F6")!;
    expect(f.untertitel).toBe("unterschrieben, nicht verrechnet");
    expect(f.abhilfe).toBeNull();
  });

  it("lässt sich zurücknehmen, und der letzte Eintrag zählt", () => {
    const zurueck = [ein("p1/unterschrift:rb-12"), ein("p1/unterschrift:rb-12", false, "2026-10-23T10:00")];
    expect(aktiveEingaenge(zurueck)).toEqual([]);
    expect(euro(p1(zurueck).rechnungsabschluss!.restforderung)).toBe("89.274,41 €");
  });

  it("ändert nichts bei einem unbekannten oder fremden Eintrag", () => {
    const e = p1([ein("p1/unterschrift:rb-99"), ein("p1/gegenzeichnung:lv"), ein("p2/unterschrift:rb-12"), ein("p1/regiebericht:W99")]);
    expect(euro(e.rechnungsabschluss!.restforderung)).toBe("89.274,41 €");
  });

  it("zählt schon unterschriebene Felder nicht zweimal", () => {
    expect(euro(p1([ein("p1/unterschrift:rb-9")]).rechnungsabschluss!.restforderung)).toBe("89.274,41 €");
  });
});
