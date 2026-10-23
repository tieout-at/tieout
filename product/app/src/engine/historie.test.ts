// GU-Historie gegen die Lösungsliste (Demo_Faelle.md, Abschnitt „GC history“), auf den Cent.

import { describe, expect, it } from "vitest";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { SOLL_HISTORIE, SOLL_KUERZUNGEN, SOLL_SCHLUSS } from "@/demo/firma/loesung";
import { pruefeFirma } from "./firma";
import { gleicherGrund, guHistorie } from "./historie";

const firma = erzeugeFirma();
const h = guHistorie(firma);
const ag = (id: string) => h.auftraggeber.find((x) => x.auftraggeber.id === id)!;
const projekt = (id: string) => firma.projekte.find((d) => d.projekt.id === id)!;

describe("GU-Historie je Auftraggeber", () => {
  it("vier Auftraggeber in der Reihenfolge der Firma", () => {
    expect(h.auftraggeber.map((x) => x.auftraggeber.id)).toEqual(Object.keys(SOLL_HISTORIE));
  });

  for (const [id, soll] of Object.entries(SOLL_HISTORIE)) {
    it(`${id}: Kennzahlen wie in der Lösungsliste`, () => {
      const x = ag(id);
      expect({
        projekte: x.projekte,
        abgeschlossen: x.abgeschlossen,
        kuerzungen: x.kuerzungenSumme,
        kuerzungenZeilen: x.kuerzungen.length,
        kuerzungenProjekte: x.kuerzungenProjekte,
        abzuege: x.abzuege.map((a) => ({ kurz: a.kurz, rechnungen: a.rechnungen, betrag: a.betrag })),
        abzuegeSumme: x.abzuegeSumme,
        nachtraege: x.nachtraege,
        tage: Object.fromEntries(x.schlusszahlung.map((s) => [s.kurz, s.tage])),
      }).toEqual(soll);
    });

    it(`${id}: jede Kürzung mit Rechnung, Bezug, Grund und Betrag`, () => {
      expect(ag(id).kuerzungen.map((k) => ({ kurz: k.kurz, rechnung: k.rechnung.nr, bezug: k.bezug, grund: k.grund, betrag: k.betrag }))).toEqual(SOLL_KUERZUNGEN[id]);
    });
  }

  it("jede Kürzung und jeder Abzug zeigt auf ein Dokument des Projekts", () => {
    for (const x of h.auftraggeber) {
      for (const k of x.kuerzungen) expect(projekt(k.projektId).dokumente.some((d) => d.id === k.beleg.quelle.dokumentId)).toBe(true);
      for (const a of x.abzuege) for (const b of a.belege) expect(projekt(a.projektId).dokumente.some((d) => d.id === b.quelle.dokumentId)).toBe(true);
    }
  });
});

describe("Schlussrechnung und Schlusszahlung P7, P8", () => {
  for (const [kurz, soll] of Object.entries(SOLL_SCHLUSS)) {
    it(`${kurz}: Rechenregel vom Rechnungsbetrag bis zur Schlusszahlung`, () => {
      const d = firma.projekte.find((x) => x.projekt.kurz === kurz)!;
      const z = d.zahlungen.find((x) => x.rechnungNr.wert === "SR")!;
      const abzug = (art: string) => z.abzuege.find((a) => a.art === art)?.betrag.wert ?? 0;
      expect(d.schlussrechnung!.art).toBe("schluss");
      expect(d.schlussrechnung!.summe.wert).toBe(soll.summe);
      expect(d.schlussrechnung!.zeilen.reduce((s, x) => s + x.betrag.wert, 0)).toBe(soll.summe);
      expect(soll.summe - abzug("kuerzung")).toBe(soll.nachKuerzung);
      expect({
        nachlass: abzug("nachlass"),
        baustrom: abzug("baustrom_bauwasser"),
        umlage: abzug("bauschadensumlage"),
        haft: abzug("haftruecklass"),
        abschlaege: abzug("abschlagszahlungen"),
        zahlung: z.betrag.wert,
      }).toEqual({ nachlass: soll.nachlass, baustrom: soll.baustrom, umlage: soll.umlage, haft: soll.haft, abschlaege: soll.abschlaege, zahlung: soll.zahlung });
      expect(soll.summe - z.abzuege.reduce((s, a) => s + a.betrag.wert, 0)).toBe(z.betrag.wert);
    });
  }

  it("P7 und P8 bleiben ohne Abgleich: keine Posten, Ampel grau", () => {
    const e = pruefeFirma(firma);
    for (const kurz of ["P7", "P8"]) {
      const p = e.projekte.find((x) => x.kurz === kurz)!;
      expect([p.ampel, p.jetzt, p.befunde]).toEqual(["grau", null, 0]);
    }
  });
});

describe("Gleicher Grund bei diesem Auftraggeber", () => {
  it("W21: Aufmaß nicht gegengezeichnet und Abzug ohne Vertragspunkt schon in P7", () => {
    expect(gleicherGrund(h, "hochbau-beispiel", "aufmass_nicht_gegengezeichnet", "w21-b-hkls").map((x) => x.kurz)).toEqual(["P7"]);
    expect(gleicherGrund(h, "hochbau-beispiel", "abzug_ohne_vertragspunkt", "w21-b-hkls").map((x) => x.kurz)).toEqual(["P7"]);
  });

  it("Gegenprobe: eigenes Projekt zählt nicht, anderer Auftraggeber nicht, fremder Grund nicht", () => {
    expect(gleicherGrund(h, "hochbau-beispiel", "ausserhalb_lv_kein_nachtrag", "w21-b-hkls").map((x) => x.kurz)).toEqual([]);
    expect(gleicherGrund(h, "hochbau-beispiel", "stunden_weichen_ab", "w21-b-hkls").map((x) => x.kurz)).toEqual([]);
    expect(gleicherGrund(h, "generalbau-beispiel", "aufmass_nicht_gegengezeichnet", "p3-buero-w3").map((x) => x.kurz)).toEqual([]);
    expect(gleicherGrund(h, "unbekannt", "rechenfehler", "w21-b-hkls").map((x) => x.kurz)).toEqual([]);
  });
});

describe("Gleicher Grund: Sprung zum Original", () => {
  it("W21 G1 führt zum Korrekturblatt von P7, die Bauschadensumlage zum Zahlungsavis von P7", () => {
    const g1 = gleicherGrund(h, "hochbau-beispiel", "aufmass_nicht_gegengezeichnet", "w21-b-hkls")[0];
    const umlage = gleicherGrund(h, "hochbau-beispiel", "abzug_ohne_vertragspunkt", "w21-b-hkls")[0];
    expect([g1.projektId, g1.beleg.quelle.dokumentId, g1.anker]).toEqual(["p7-w10-bpa", "gu-korrektur-sr", "22.04.10A"]);
    expect([umlage.projektId, umlage.beleg.quelle.dokumentId, umlage.anker]).toEqual(["p7-w10-bpa", "zahlung-sr", "bauschadensumlage"]);
  });
});

describe("Gleicher Grund: zeitlich richtig", () => {
  it("P7 kam vor W21: von P7 aus gibt es mit Stichtag der eigenen Schlussrechnung kein „schon in W21“", () => {
    expect(gleicherGrund(h, "hochbau-beispiel", "abzug_ohne_vertragspunkt", "p7-w10-bpa").map((x) => x.kurz)).toEqual(["W21"]);
    expect(gleicherGrund(h, "hochbau-beispiel", "abzug_ohne_vertragspunkt", "p7-w10-bpa", "2025-11-20")).toEqual([]);
    expect(gleicherGrund(h, "hochbau-beispiel", "rechenfehler", "p7-w10-bpa", "2025-11-20")).toEqual([]);
    expect(gleicherGrund(h, "hochbau-beispiel", "abzug_ohne_vertragspunkt", "w21-b-hkls", "2026-10-22").map((x) => x.kurz)).toEqual(["P7"]);
  });
});
