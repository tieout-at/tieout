// Ende-zu-Ende: Rechenkern auf dem synthetischen Datensatz W21 gegen die Lösungsliste (Demo_Faelle.md v2).

import { describe, expect, it } from "vitest";
import type { Datensatz, Feld } from "@/domain/typen";
import { erzeugeW21, fehlgelesen } from "@/demo/w21/erzeuge";
import {
  SOLL_AUSSERHALB_ERP,
  SOLL_BEFUNDE,
  SOLL_BELEGQUELLEN,
  SOLL_HINWEISE,
  SOLL_IMPORT,
  SOLL_KASKADE,
  SOLL_REGIE,
  SOLL_RISIKEN,
  SOLL_SUMMEN,
  SOLL_VORPRUEFUNG,
  SOLL_ZAHLUNGEN,
  SOLL_ZURUF_BELEGE,
} from "@/demo/w21/loesung";
import { pruefe } from "./index";
import { kalenderwoche } from "./vorpruefung";

const d = erzeugeW21();
const e = pruefe(d);

describe("W21: Befunde gegen die Lösungsliste", () => {
  it("findet genau die 15 eingebauten Befunde, keinen zusätzlichen", () => {
    expect(e.befunde.map((b) => b.schluessel).sort()).toEqual(SOLL_BEFUNDE.map((s) => s.schluessel).sort());
  });

  it.each(SOLL_BEFUNDE)("$id: Art, Liste und Betrag cent-genau", (soll) => {
    const b = e.befunde.find((x) => x.schluessel === soll.schluessel)!;
    expect(b).toBeDefined();
    expect({ art: b.art, liste: b.liste, betrag: b.betrag }).toEqual({ art: soll.art, liste: soll.liste, betrag: soll.betrag });
  });

  it("Summen der drei Listen", () => {
    expect(e.summen).toEqual(SOLL_SUMMEN);
  });

  it("J1: Rechenweg und K7-Plausibilität wie in der Lösungsliste", () => {
    const j1 = e.befunde.find((b) => b.schluessel === "mehrmenge:22.04.12B")!;
    expect(j1.rechenweg?.text).toBe("(100 − 86) Stk × 456,00 € = 6.384,00 €");
    expect(j1.rechenweg?.plausibilitaet).toBe("K7: 1,30 h × 56,80 € = 73,84 € Lohn + 382,16 € Sonstiges = 456,00 €");
    expect(j1.belege.map((b) => b.titel)).toEqual([
      "LV Pos. 22.04.12B",
      "Plan H-201, Index C",
      "Plan H-201, Index D",
      "Mail Bauleitung Hochbau Beispiel GmbH",
      "WhatsApp-Meldung Z1",
      "Foto IMG_2291.jpg",
      "Aufmaßblatt AB-12",
    ]);
  });

  it("J8: Preisumrechnung aus 40 % Lohnanteil und Index +3,8 %", () => {
    const j8 = e.befunde.find((b) => b.schluessel === "preisumrechnung")!;
    expect(j8.rechenweg?.text).toBe("190.736,84 € × 3,8 % = 7.248,00 €");
  });

  it("O3 und V1: Lohn mit dem Mittellohnpreis 56,80 €", () => {
    expect(e.befunde.find((b) => b.schluessel === "anmeldung:mail-0314-technikraum")?.rechenweg?.text).toBe(
      "Untergrenze aus eigener Kalkulation: 96 h × 56,80 € (Mittellohnpreis) + Material 2.900,00 € = 8.352,80 €",
    );
    const v1 = e.befunde.find((b) => b.schluessel === "vertrag:mail-0520-container")!;
    expect(v1.rechenweg?.text).toBe("16 h × 56,80 € (Mittellohnpreis) + Kran 271,20 € = 1.180,00 €; laut Vertrag Pkt. 4.3 in der Pauschale enthalten");
    expect(v1.rechenweg?.schritte?.map((x) => x.bezeichnung)).toEqual(["Lohn", "Kran"]);
  });

  it("O4 und O5: Regie aus Zuruf, Regiesätze des Vertrags, kein Material", () => {
    expect(e.befunde.find((b) => b.schluessel === "zuruf:Z6")?.rechenweg?.text).toBe(
      "6 h Monteur × 62,50 € + 6 h Helfer × 52,00 € = 687,00 €",
    );
    expect(e.befunde.find((b) => b.schluessel === "zuruf:Z5")?.rechenweg?.text).toBe("8 h Monteur × 62,50 € = 500,00 €");
  });

  it("Zurufe Z1 bis Z4 hängen als Beleg an J1, J3, O1, J4", () => {
    for (const [schluessel, titel] of Object.entries(SOLL_ZURUF_BELEGE)) {
      expect(e.befunde.find((b) => b.schluessel === schluessel)?.belege.map((b) => b.titel), schluessel).toContain(titel);
    }
    expect(e.befunde.flatMap((b) => b.belege).filter((b) => b.titel.startsWith("WhatsApp-Meldung")).length).toBe(6);
  });

  it("Quelle des Belegs je Posten und Anteil nur außerhalb ERP", () => {
    expect(e.belegquellen).toMatchObject(SOLL_BELEGQUELLEN);
    expect(e.ausserhalbErp).toEqual(SOLL_AUSSERHALB_ERP);
  });

  it("A1: Hinweis ohne Betrag und ohne Wort „Forcierung“", () => {
    const a1 = e.befunde.find((b) => b.liste === "anwalt")!;
    expect(a1.betrag).toBeNull();
    expect(JSON.stringify(e)).not.toMatch(/Forcierung|Claim/i);
  });
});

describe("W21: Vorprüfung aus GU-Sicht", () => {
  it("genau die 4 Positionen mit Kürzungsrisiko", () => {
    expect(e.vorpruefung!.risiken.map((r) => r.schluessel).sort()).toEqual(SOLL_RISIKEN.map((s) => s.schluessel).sort());
  });

  it.each(SOLL_RISIKEN)("$id: Grund, Betrag, schon gekürzt, Bezug zum Befund", (soll) => {
    const r = e.vorpruefung!.risiken.find((x) => x.schluessel === soll.schluessel)!;
    expect({ grund: r.grund, betrag: r.betrag, bereitsGekuerzt: r.bereitsGekuerzt, befundSchluessel: r.befundSchluessel }).toEqual({
      grund: soll.grund,
      betrag: soll.betrag,
      bereitsGekuerzt: soll.bereitsGekuerzt,
      befundSchluessel: soll.befundSchluessel,
    });
  });

  it("Summe, bereits gekürzt, Abgleich mit dem Korrekturblatt AR3", () => {
    expect({ summe: e.vorpruefung!.summe, bereitsGekuerzt: e.vorpruefung!.bereitsGekuerzt, korrekturblatt: e.vorpruefung!.korrekturblatt }).toEqual(SOLL_VORPRUEFUNG);
  });

  it("Texte von G1 und G2 wie in der Lösungsliste", () => {
    const g1 = e.vorpruefung!.risiken.find((r) => r.grund === "aufmass_nicht_gegengezeichnet")!;
    const g2 = e.vorpruefung!.risiken.find((r) => r.grund === "stunden_weichen_ab")!;
    expect(g1.abhilfe).toBe("Plan D und Mail 07.04. beilegen, gemeinsames Aufmaß nachholen");
    expect(g2.detail).toBe("Bericht 24 h, Stundenliste KW 23: 21 h");
  });

  it("Hinweise „Mengenänderung über 20 %“ nur bei J5, J6, J7", () => {
    expect(Object.fromEntries(e.hinweise.map((h) => [h.positionNr, h.aenderung]))).toEqual(SOLL_HINWEISE);
  });
});

describe("W21: Prüfkaskade, Zahlungen, Import", () => {
  it("Kaskade Zeile für Zeile", () => {
    expect(e.kaskade!.zeilen.map((z) => [z.bezeichnung, z.betrag])).toEqual(SOLL_KASKADE.map((s) => [s.bezeichnung, s.betrag]));
    for (const s of SOLL_KASKADE.filter((x) => x.quelle)) {
      const z = e.kaskade!.zeilen.find((x) => x.bezeichnung === s.bezeichnung)!;
      expect({ pruefung: z.pruefung ?? undefined, quelle: z.quelle }, s.bezeichnung).toEqual({ pruefung: s.pruefung, quelle: s.quelle });
    }
    expect(e.kaskade!.restforderung).toBe(17_006_089);
  });

  it("Kaskade: jede Zeile mit Quelle hat Belege in vorhandenen Dokumenten, Zwischensummen keine", () => {
    const ids = new Set(d.dokumente.map((x) => x.id));
    for (const z of e.kaskade!.zeilen) {
      if (z.quelle === null) {
        expect(z.belege, z.bezeichnung).toEqual([]);
        continue;
      }
      expect(z.belege.length, z.bezeichnung).toBeGreaterThan(0);
      for (const b of z.belege) expect(ids.has(b.quelle.dokumentId), `${z.bezeichnung}: ${b.quelle.dokumentId}`).toBe(true);
    }
  });

  it("Kaskade: Belege zeigen auf Entwurf, Vertragspunkt, GU-Abzugsschreiben und Zahlungsavisos", () => {
    const stellen = Object.fromEntries(
      e.kaskade!.zeilen.filter((z) => z.quelle).map((z) => [z.bezeichnung, z.belege.map((b) => `${b.quelle.dokumentId} S. ${b.quelle.seite} ${b.quelle.stelle}`)]),
    );
    expect(stellen).toEqual({
      "Leistungssumme laut Entwurf inkl. Liste 1": ["sr-entwurf S. 22 Summe Leistung"],
      Nachlass: ["vertrag S. 5 Pkt. 5.1"],
      "Baustrom und Bauwasser": ["vertrag S. 4 Pkt. 4.6", "gu-abzug S. 1 Absatz 1"],
      Bauschadensumlage: ["gu-abzug S. 1 Absatz 2"],
      "Haftrücklass": ["vertrag S. 9 Pkt. 9.2"],
      "Zahlungen auf AR1, AR2, AR3": ["zahlung-ar1 S. 1 Zahlbetrag", "zahlung-ar2 S. 1 Zahlbetrag", "zahlung-ar3 S. 1 Zahlbetrag"],
    });
  });

  it("Zahlungen je AR nach der Rechenregel", () => {
    expect(d.zahlungen.map((z) => z.betrag.wert)).toEqual(SOLL_ZAHLUNGEN);
    expect(d.abschlaege.map((a) => a.summe.wert)).toEqual([31_240_000, 41_890_000, 35_620_000]);
  });

  it("Import: 81 Dokumente, 4 Duplikate, Indizes C/D/E, 25 korrigierte Felder", () => {
    const { dokumente, duplikate, eindeutig, planIndizes, korrigierteFelder } = e.import;
    expect({ dokumente, duplikate, eindeutig, planIndizes, korrigierteFelder }).toEqual(SOLL_IMPORT);
  });

  it("Regieberichte: 16, davon 11 verrechnet, 3 unterschrieben offen, 2 ohne Unterschrift", () => {
    expect(e.regie).toEqual(SOLL_REGIE);
  });

  it("Auftragssumme = Summe LV-Menge × EP", () => {
    const summe = d.lv.reduce((s, p) => s + Math.round((p.menge.wert * p.ep.wert) / 100), 0);
    expect(summe).toBe(d.vertrag.auftragssumme.wert);
  });
});

describe("W21: Invarianten", () => {
  it("jede LV-Position genau einmal im Ledger", () => {
    expect(e.ledger.length).toBe(380);
    expect(new Set(e.ledger.map((z) => z.positionNr)).size).toBe(380);
  });

  it("jeder Befund und jedes Risiko hat mindestens einen Beleg mit Quelle in einem vorhandenen Dokument oder Zuruf", () => {
    const ids = new Set([...d.dokumente.map((x) => x.id), ...d.zurufe.map((z) => z.id)]);
    for (const b of [...e.befunde, ...e.vorpruefung!.risiken]) {
      expect(b.belege.length, b.schluessel).toBeGreaterThan(0);
      for (const beleg of b.belege) expect(ids.has(beleg.quelle.dokumentId), `${b.schluessel}: ${beleg.quelle.dokumentId}`).toBe(true);
    }
  });

  it("Ledger: Differenz nur bei den vier Mehrmengen", () => {
    expect(e.ledger.filter((z) => z.differenzMenge > 0).map((z) => z.positionNr).sort()).toEqual(["22.04.12B", "22.06.03C", "24.02.05A", "26.03.04A"]);
  });

  it("jede Mail hat Text, das Zitat steht wörtlich darin", () => {
    for (const m of d.mails) {
      expect(m.text?.wert.length, m.dokumentId).toBeGreaterThan(0);
      if (m.zitat) expect(m.text?.wert, m.dokumentId).toContain(m.zitat.wert);
    }
  });

  it("Kalenderwoche im Betreff = ISO-Woche des Mail-Datums", () => {
    const mitKw = d.mails.filter((m) => /KW \d+/.test(m.betreff.wert));
    expect(mitKw.length).toBeGreaterThan(0);
    for (const m of mitKw) expect(Number(m.betreff.wert.match(/KW (\d+)/)![1]), m.betreff.wert).toBe(kalenderwoche(m.datum.wert));
  });

  it("Fotonummern steigen mit dem Aufnahmedatum", () => {
    const nummern = [...d.fotos].sort((a, b) => a.exifDatum.wert.localeCompare(b.exifDatum.wert)).map((x) => d.dokumente.find((y) => y.id === x.dokumentId)!.dateiname);
    expect(nummern).toEqual([...nummern].sort());
  });

  it("Generator ist deterministisch", () => {
    expect(JSON.stringify(erzeugeW21())).toBe(JSON.stringify(d));
  });
});

describe("W21: Korrekturen beim Einlesen behalten den alten Wert", () => {
  const mitVorher = (wert: unknown): Feld<unknown>[] => {
    if (Array.isArray(wert)) return wert.flatMap(mitVorher);
    if (!wert || typeof wert !== "object") return [];
    const o = wert as Record<string, unknown>;
    const selbst = "quelle" in o && "wert" in o && "vorher" in o ? [o as unknown as Feld<unknown>] : [];
    return [...selbst, ...Object.values(o).flatMap(mitVorher)];
  };

  it("genau die 25 korrigierten Felder tragen „vorher“, jeweils anders als der Wert", () => {
    const felder = mitVorher(d);
    expect(felder.length).toBe(25);
    for (const x of felder) {
      expect(x.korrigiert).toBe(true);
      expect(x.vorher).not.toEqual(x.wert);
    }
  });

  it("12 Aufmaßmengen, 10 Regiestunden, 2 Mail-Daten, 1 Fotodatum", () => {
    expect({
      aufmass: mitVorher(d.aufmass).length,
      regie: mitVorher(d.regie.map((r) => r.stundenMonteur)).length,
      mails: mitVorher(d.mails.map((m) => m.datum)).length,
      fotos: mitVorher(d.fotos.map((x) => x.exifDatum)).length,
    }).toEqual({ aufmass: 12, regie: 10, mails: 2, fotos: 1 });
  });

  it("Lesefehler ist eine reine Funktion des richtigen Werts", () => {
    expect([fehlgelesen(1_600), fehlgelesen(81_250), fehlgelesen(50)]).toEqual([1_500, 81_750, 850]);
    expect([fehlgelesen("2026-01-14"), fehlgelesen("2026-02-19T10:15")]).toEqual(["2025-01-14", "2025-02-19T10:15"]);
  });

  it("der Rechenkern liest „vorher“ nie: gleiches Ergebnis mit und ohne", () => {
    const ohne = JSON.parse(JSON.stringify(d, (k, v) => (k === "vorher" ? undefined : v))) as Datensatz;
    expect(mitVorher(ohne).length).toBe(0);
    expect(pruefe(ohne)).toEqual(e);
  });
});
