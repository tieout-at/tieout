// Ende-zu-Ende: Firmenzwilling (8 Projekte) gegen die Lösungsliste v2 (Demo_Faelle.md, „Die 7 weiteren Projekte“).

import { describe, expect, it } from "vitest";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { SOLL_FAELLE, SOLL_FIRMA, SOLL_HINWEISE_KLEIN, SOLL_NAECHSTE, SOLL_PROJEKTE } from "@/demo/firma/loesung";
import { SOLL_AUSSERHALB_ERP } from "@/demo/w21/loesung";
import { ampel, geldAufteilung, geldStand, pruefeFirma, tageZwischen } from "./firma";

const f = erzeugeFirma();
const e = pruefeFirma(f);
const nachKurz = (kurz: string) => {
  const d = f.projekte.find((p) => p.projekt.kurz === kurz)!;
  return { d, e: e.ergebnisse[d.projekt.id] };
};

describe("Firma: Übersicht gegen die Lösungsliste", () => {
  it.each(SOLL_PROJEKTE)("$kurz: Auftragssumme, Datum, jetzt, offen, Ampel", (soll) => {
    const z = e.projekte.find((p) => p.kurz === soll.kurz)!;
    expect({
      auftragssumme: z.auftragssumme,
      datum: z.datum ? `${z.datum.art} ${z.datum.wert}` : null,
      jetzt: z.jetzt,
      offen: z.offen,
      ampel: z.ampel,
    }).toEqual({ auftragssumme: soll.auftragssumme, datum: soll.datum, jetzt: soll.jetzt, offen: soll.offen, ampel: soll.ampel });
  });

  it("Summen: 34.268,10 € jetzt verrechenbar, 11.532,30 € angemeldet und offen, getrennt", () => {
    expect(e.summen).toEqual(SOLL_FIRMA);
  });

  it("Nächste Schlussrechnung: W21 am 31.10.2026, nie ein vergangenes Datum", () => {
    expect(e.naechsteSchlussrechnung).toEqual(SOLL_NAECHSTE);
    expect(pruefeFirma({ ...f, stichtag: "2026-11-01" }).naechsteSchlussrechnung).toEqual({ projektId: "p3-buero-w3", datum: "2026-12-04" });
  });

  // Vorgeschlagene Werte, noch nicht in Demo_Faelle.md (wartet auf das Go von Maxi S., Entwurfs-PR).
  it("nur außerhalb ERP über die offenen Projekte: 20.975,90 € in 13 von 20 Posten (45.800,40 €)", () => {
    expect(e.ausserhalbErp).toEqual({ betrag: 2_097_590, anzahl: 13, vonBetrag: 4_580_040, vonAnzahl: 20 });
    expect(nachKurz("W21").e.ausserhalbErp).toEqual(SOLL_AUSSERHALB_ERP);
    expect(e.ausserhalbErp.vonBetrag).toBe(SOLL_FIRMA.jetzt + SOLL_FIRMA.offen);
    expect(e.ausserhalbErp.vonAnzahl).toBe(SOLL_FIRMA.postenJetzt + SOLL_FIRMA.postenOffen);
  });

  it("Geld nach Stand des Belegs: belegt 34.268,10 €, Beleg fehlt noch 3.179,50 €, angemeldet 8.352,80 €", () => {
    expect(e.geld).toEqual({
      belegt: { betrag: 3_426_810, anzahl: 14 },
      beleg_fehlt: { betrag: 317_950, anzahl: 5 },
      angemeldet: { betrag: 835_280, anzahl: 1 },
    });
    expect(e.geld.belegt).toEqual({ betrag: SOLL_FIRMA.jetzt, anzahl: SOLL_FIRMA.postenJetzt });
    expect(e.geld.beleg_fehlt.betrag + e.geld.angemeldet.betrag).toBe(SOLL_FIRMA.offen);
  });

  it("Stand des Belegs je Posten: O1, O2, O4, O5, P2-O1 fehlt noch, O3 angemeldet, V1 und A1 ohne", () => {
    const stand = (kurz: string, schluessel: string) => geldStand(nachKurz(kurz).e.befunde.find((b) => b.schluessel === schluessel)!);
    expect(["regie:RB-12", "regie:RB-15", "zuruf:Z6", "zuruf:Z5"].map((s) => stand("W21", s))).toEqual(Array(4).fill("beleg_fehlt"));
    expect(stand("P2", "regie:RB-06")).toBe("beleg_fehlt");
    expect(stand("W21", "anmeldung:mail-0314-technikraum")).toBe("angemeldet");
    expect([stand("W21", "regie:RB-07"), stand("W21", "mehrmenge:22.04.12B")]).toEqual(["belegt", "belegt"]);
    expect([stand("W21", "vertrag:mail-0520-container"), stand("W21", "hinweis:mail-0702-termin")]).toEqual([null, null]);
  });

  it("Gegenprobe: ein Projekt mit gelegter Schlussrechnung zählt nicht mit", () => {
    expect(geldAufteilung([])).toEqual({ belegt: { betrag: 0, anzahl: 0 }, beleg_fehlt: { betrag: 0, anzahl: 0 }, angemeldet: { betrag: 0, anzahl: 0 } });
    const ohneW21 = pruefeFirma({ ...f, projekte: f.projekte.map((d) => (d.projekt.kurz === "W21" ? { ...d, projekt: { ...d.projekt, status: "sr_gelegt" as const } } : d)) });
    expect(ohneW21.geld.belegt.betrag).toBe(SOLL_FIRMA.jetzt - 2_741_000);
    expect(ohneW21.ausserhalbErp.betrag).toBe(2_097_590 - SOLL_AUSSERHALB_ERP.betrag);
  });

  it("Reihenfolge der Projekte wie in der Lösungsliste", () => {
    expect(e.projekte.map((p) => p.kurz)).toEqual(SOLL_PROJEKTE.map((p) => p.kurz));
  });

  it("jeder Auftraggeber ist zugeordnet: Hochbau 4, Generalbau 2, Gemeinde 1, Wohnbau 1", () => {
    const zaehler: Record<string, number> = {};
    for (const p of e.projekte) zaehler[p.auftraggeber.name] = (zaehler[p.auftraggeber.name] ?? 0) + 1;
    expect(zaehler).toEqual({ "Hochbau Beispiel GmbH": 4, "Generalbau Beispiel AG": 2, "Gemeinde Beispielstadt": 1, "Wohnbau Beispiel GmbH": 1 });
  });
});

describe("Die 7 weiteren Projekte: Fälle und Gegenproben", () => {
  it("genau die 7 eingebauten Fälle in P2 bis P5, keine weiteren", () => {
    const gefunden = ["P2", "P3", "P4", "P5"].flatMap((kurz) => nachKurz(kurz).e.befunde.map((b) => `${kurz} ${b.schluessel}`));
    expect(gefunden.sort()).toEqual(SOLL_FAELLE.map((s) => `${s.projekt} ${s.schluessel}`).sort());
  });

  it.each(SOLL_FAELLE)("$id: Art, Liste und Betrag cent-genau", (soll) => {
    const b = nachKurz(soll.projekt).e.befunde.find((x) => x.schluessel === soll.schluessel)!;
    expect({ art: b.art, liste: b.liste, betrag: b.betrag }).toEqual({ art: soll.art, liste: soll.liste, betrag: soll.betrag });
  });

  it("P2-J3: erbracht bis zur letzten AR gegen die Abschlagsrechnungen", () => {
    const b = nachKurz("P2").e.befunde.find((x) => x.schluessel === "nicht_verrechnet:24.02.04A")!;
    expect(b.rechenweg?.text).toBe("(520 − 455) m × 16,90 € = 1.098,50 €");
  });

  it("Hinweis Mengenänderung über 20 % nur bei P3-J1", () => {
    for (const kurz of ["P2", "P3", "P4", "P5"]) {
      const soll = SOLL_HINWEISE_KLEIN[kurz] ?? {};
      expect(Object.fromEntries(nachKurz(kurz).e.hinweise.map((h) => [h.positionNr, h.aenderung])), kurz).toEqual(soll);
    }
  });

  it("Gegenproben: Leistung nach der letzten AR ist kein Befund", () => {
    expect(nachKurz("P2").e.grenze).toBe("2026-09-30");
    expect(nachKurz("P2").e.befunde.some((b) => b.positionNr === "24.05.03A")).toBe(false); // AB-05 vom 15.10.
    expect(nachKurz("P4").e.befunde.some((b) => b.schluessel === "regie:RB-05")).toBe(false); // RB-05 vom 08.10.
    expect(nachKurz("P5").e.befunde).toEqual([]);
  });

  it("Ledger und Regie-Statistik widersprechen den Gegenproben nicht", () => {
    expect(nachKurz("P2").e.ledger.find((z) => z.positionNr === "24.05.03A")).toMatchObject({ differenzMenge: 0, naechsteArMenge: 4_000 });
    expect(nachKurz("P5").e.ledger.filter((z) => z.differenzMenge !== 0)).toEqual([]);
    expect(nachKurz("P4").e.regie).toMatchObject({ unterschriebenNichtVerrechnet: 1, nachGrenze: 1 });
    expect(nachKurz("P5").e.regie).toMatchObject({ nichtUnterschrieben: 0, nachGrenze: 1 });
  });

  it("P6 bis P8: kein Abgleich, keine Befunde (P6 hat einen nicht verrechneten Regiebericht)", () => {
    expect(nachKurz("P6").d.regie.length).toBeGreaterThan(0);
    for (const kurz of ["P6", "P7", "P8"]) {
      const { e: x } = nachKurz(kurz);
      expect({ abgleich: x.abgleich, befunde: x.befunde.length }, kurz).toEqual({ abgleich: false, befunde: 0 });
    }
  });
});

describe("Firma: Invarianten", () => {
  it("Auftragssumme = Summe LV-Menge × EP in jedem Projekt", () => {
    for (const d of f.projekte) {
      const summe = d.lv.reduce((s, p) => s + Math.round((p.menge.wert * p.ep.wert) / 100), 0);
      expect(summe, d.projekt.kurz).toBe(d.vertrag.auftragssumme.wert);
    }
  });

  it("jeder Beleg zeigt auf ein Dokument oder einen Zuruf desselben Projekts", () => {
    for (const d of f.projekte) {
      const ids = new Set([...d.dokumente.map((x) => x.id), ...d.zurufe.map((z) => z.id)]);
      for (const b of e.ergebnisse[d.projekt.id].befunde)
        for (const beleg of b.belege) expect(ids.has(beleg.quelle.dokumentId), `${d.projekt.kurz} ${b.schluessel}`).toBe(true);
    }
  });

  it("jeder Rechenschritt außer der Schlusszeile hat Quellen in einem Dokument oder Zuruf desselben Projekts", () => {
    for (const d of f.projekte) {
      const ids = new Set([...d.dokumente.map((x) => x.id), ...d.zurufe.map((z) => z.id)]);
      for (const b of e.ergebnisse[d.projekt.id].befunde)
        for (const s of (b.rechenweg?.schritte ?? []).filter((x) => !x.summe)) {
          const name = `${d.projekt.kurz} ${b.schluessel}, ${s.bezeichnung}`;
          expect(s.quellen?.length, name).toBeGreaterThan(0);
          for (const q of s.quellen!) expect(ids.has(q.dokumentId), name).toBe(true);
        }
    }
  });

  it("Mitarbeiter nur als Rolle: kein Zuruf-Absender mit Namen", () => {
    for (const d of f.projekte) for (const z of d.zurufe) expect(z.absender).toMatch(/^(Monteur|Helfer|Bauleitung|Polier), /);
  });

  it("Generator ist deterministisch", () => {
    expect(JSON.stringify(erzeugeFirma())).toBe(JSON.stringify(f));
  });

  it("Ampel: rot bis einschließlich 21 Tage vor dem Legen, danach gelb", () => {
    const { d, e: x } = nachKurz("W21");
    const mit = (legenBis: string) => ampel({ ...d, projekt: { ...d.projekt, schlussrechnungLegenBis: legenBis } }, x, "2026-10-22");
    expect([mit("2026-11-12"), mit("2026-11-13")]).toEqual(["rot", "gelb"]);
  });

  it("nirgends in der Firma die Wörter „Claim“ oder „Forcierung“", () => {
    expect(JSON.stringify(e)).not.toMatch(/Claim|Forcierung/i);
  });

  it("Tage zwischen zwei Daten", () => {
    expect(tageZwischen("2026-10-22", "2026-10-31")).toBe(9);
    expect(tageZwischen("2026-10-22", "2026-12-04")).toBe(43);
  });
});
