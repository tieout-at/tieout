// Abrechnung der abgeschlossenen Projekte gegen die Prüfzeilen der Lösungsliste (Demo_Faelle.md, „Check P7“ und
// „Check P8“ im Abschnitt „GC history“), auf den Cent.

import { describe, expect, it } from "vitest";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { abrechnung } from "./abrechnung";

const firma = erzeugeFirma();
const projekt = (kurz: string) => firma.projekte.find((d) => d.projekt.kurz === kurz)!;

// [Bezeichnung, Betrag in Cent, Prüfung] je Zeile, in Reihenfolge
const SOLL: Record<string, [string, number, string | null][]> = {
  P7: [
    ["Schlussrechnung", 108_299_019, null],
    ["Kürzungen laut Korrekturblatt", -433_040, null],
    ["Summe nach Kürzungen", 107_865_979, null],
    ["Nachlass", -3_235_979, "laut_vertrag"],
    ["Summe nach Nachlass", 104_630_000, null],
    ["Baustrom und Bauwasser", -837_040, "laut_vertrag"],
    ["Bauschadensumlage", -523_150, "abzug_ohne_vertragspunkt"],
    ["Betrag vor Einbehalten", 103_269_810, null],
    ["Haftrücklass", -3_098_094, "laut_vertrag"],
    ["Schlussrechnungsbetrag vor Abzug der Zahlungen", 100_171_716, null],
    ["Bezahlte Abschläge", -90_500_000, null],
    ["Schlusszahlung", 9_671_716, null],
  ],
  P8: [
    ["Schlussrechnung", 150_694_000, null],
    ["Kürzungen laut Korrekturblatt", -395_050, null],
    ["Summe nach Kürzungen", 150_298_950, null],
    ["Nachlass", -3_005_979, "laut_vertrag"],
    ["Summe nach Nachlass", 147_292_971, null],
    ["Haftrücklass", -4_418_789, "laut_vertrag"],
    ["Schlussrechnungsbetrag vor Abzug der Zahlungen", 142_874_182, null],
    ["Bezahlte Abschläge", -132_000_000, null],
    ["Schlusszahlung", 10_874_182, null],
  ],
};

describe("Abrechnung abgeschlossener Projekte", () => {
  for (const [kurz, soll] of Object.entries(SOLL)) {
    it(`${kurz}: jede Zeile wie in der Prüfzeile der Lösungsliste`, () => {
      const a = abrechnung(projekt(kurz))!;
      expect(a.zeilen.map((z) => [z.bezeichnung, z.betrag, z.pruefung])).toEqual(soll);
    });

    it(`${kurz}: Zahlbetrag nachgerechnet, jede Zeile außer Zwischensummen mit Beleg im Projekt`, () => {
      const d = projekt(kurz);
      const a = abrechnung(d)!;
      expect(a.schlusszahlung.stimmt).toBe(true);
      for (const z of a.zeilen.filter((x) => x.art !== "summe")) {
        expect(z.belege.length).toBeGreaterThan(0);
        for (const b of z.belege) expect(d.dokumente.some((x) => x.id === b.quelle.dokumentId)).toBe(true);
      }
    });
  }

  it("Kennzahlen: gekürzt, einbehalten, Tage, Nachträge", () => {
    const p7 = abrechnung(projekt("P7"))!;
    const p8 = abrechnung(projekt("P8"))!;
    expect([p7.gekuerzt, p7.einbehalten, p7.schlusszahlung.tage, p7.schlusszahlung.datum]).toEqual([433_040, 3_098_094, 90, "2026-02-18"]);
    expect([p8.gekuerzt, p8.einbehalten, p8.schlusszahlung.tage, p8.schlusszahlung.datum]).toEqual([395_050, 4_418_789, 74, "2025-09-12"]);
    expect(p7.kuerzungen.map((k) => [k.bezug, k.grund, k.betrag])).toEqual([
      ["22.04.10A", "aufmass_nicht_gegengezeichnet", 421_200],
      ["24.05.03A", "rechenfehler", 11_840],
    ]);
    expect(p7.nachtraege.map((n) => [n.nr, n.betrag, n.beauftragt])).toEqual([
      ["N1", 864_000, true],
      ["N2", 312_000, true],
      ["N3", 248_000, false],
    ]);
    expect(p8.nachtraege.map((n) => [n.nr, n.betrag, n.beauftragt])).toEqual([
      ["N1", 1_240_000, true],
      ["N2", 586_000, true],
    ]);
  });

  it("Gegenprobe: ohne gelegte Schlussrechnung keine Abrechnung (W21, P3, P6)", () => {
    for (const kurz of ["W21", "P3", "P6"]) expect(abrechnung(projekt(kurz))).toBeNull();
  });

  it("Gegenprobe: weicht der Zahlbetrag ab, stimmt die Nachrechnung nicht", () => {
    const d = structuredClone(projekt("P7"));
    const z = d.zahlungen.find((x) => x.rechnungNr.wert === "SR")!;
    z.betrag.wert -= 100;
    const a = abrechnung(d)!;
    expect([a.schlusszahlung.stimmt, a.schlusszahlung.nachgerechnet, a.schlusszahlung.betrag]).toEqual([false, 9_671_716, 9_671_616]);
  });
});
