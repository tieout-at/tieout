// Inputs of the sample data against solution list v3. Only inputs here (counts, contract sums, Entwurf,
// Abschlagsrechnungen, the payments the Auftraggeber made); every find and total is tested in the later parts.

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { ordnerLesen } from "../src/ordner";
import type { Datensatz } from "../src/modell";
import { ausListe } from "./hilfen";

const firma = beispielFirma();
const projekt = (kurz: string): Datensatz => firma.projekte.find((p) => p.projekt.kurz === kurz)!;
const p1 = projekt("P1");

describe("P1 Wohnpark Mooshaim: folder", () => {
  const s = ordnerLesen(p1);

  it("77 Belege, 4 of them duplicates, and 4 WhatsApp-Meldungen outside the folder", () => {
    expect([s.belege, s.duplikate, s.eindeutig, s.meldungen]).toEqual([77, 4, 73, 4]);
  });

  it("Belege by kind as in the solution list", () => {
    expect(s.nachArt).toEqual({
      vertrag: 1,
      leistungsverzeichnis: 1,
      preisbasis: 1,
      aufmassblatt: 13,
      regiebericht: 15,
      stundenzettel: 1,
      abschlagsrechnung: 3,
      zahlungsavis: 3,
      korrekturblatt: 1,
      abzugsschreiben: 1,
      entwurf: 1,
      grosshaendlerrechnung: 3,
      email: 16,
      foto: 10,
      fotodokumentation: 1,
      plan: 6,
    });
    expect([p1.emails.length, p1.fotos.length]).toEqual([14, 8]);
  });

  it("18 fields corrected by hand: 8 measured quantities, 7 Regie hours, 2 e-mail dates, 1 photo date", () => {
    expect(s.korrigierteFelder).toBe(18);
    const korr = (xs: { pruefstand: string }[]) => xs.filter((x) => x.pruefstand === "korrigiert").length;
    expect(korr(p1.aufmass.flatMap((a) => a.zeilen.map((z) => z.menge)))).toBe(8);
    expect(korr(p1.regie.flatMap((r) => [r.stundenMonteur, r.stundenHelfer]))).toBe(7);
    expect(korr(p1.emails.map((e) => e.datum))).toBe(2);
    expect(korr(p1.fotos.map((f) => f.zeitpunkt))).toBe(1);
  });

  it("plan index chains H-101 C, H-201 C → D, L-310 D → E, S-150 C", () => {
    expect(s.planketten.map((k) => `${k.planNr} ${k.indizes.map((i) => i.index).join(" → ")}`)).toEqual(["H-101 C", "H-201 C → D", "L-310 D → E", "S-150 C"]);
  });
});

describe("P1 Wohnpark Mooshaim: Vertrag, Leistungsverzeichnis, invoices", () => {
  it("286 positions (LG 22 Heizung 98, LG 24 Sanitär 116, LG 26 Lüftung 54, LG 28 MSR 18) summing to the contract sum", () => {
    const lg = (n: string) => p1.positionen.filter((p) => p.nr.wert.startsWith(`${n}.`)).length;
    expect([p1.positionen.length, lg("22"), lg("24"), lg("26"), lg("28")]).toEqual([286, 98, 116, 54, 18]);
    const summe = p1.positionen.reduce((s, p) => s + Math.round((p.menge.wert * p.ep.wert) / 100), 0);
    expect(summe).toBe(ausListe("746.820,00 €"));
    expect(p1.vertrag.auftragssumme.wert).toBe(ausListe("746.820,00 €"));
  });

  it("Entwurf and the three Abschlagsrechnungen", () => {
    expect(p1.entwurf!.summe.wert).toBe(ausListe("752.314,80 €"));
    expect(p1.entwurf!.zeilen.reduce((s, z) => s + z.betrag.wert, 0)).toBe(ausListe("752.314,80 €"));
    expect(p1.abschlaege.map((a) => a.summe.wert)).toEqual([ausListe("168.400,00 €"), ausListe("276.900,00 €"), ausListe("241.600,00 €")]);
    for (const a of p1.abschlaege) expect(a.zeilen.reduce((s, z) => s + z.betrag.wert, 0)).toBe(a.summe.wert);
  });

  it("the payments Hornfeld Bau made, per Zahlungsavis", () => {
    expect(p1.zahlungen.map((z) => z.betrag.wert)).toEqual([ausListe("153.473,61 €"), ausListe("252.356,55 €"), ausListe("218.566,83 €")]);
    expect(p1.zahlungen.reduce((s, z) => s + z.betrag.wert, 0)).toBe(ausListe("624.396,99 €"));
  });

  it("Aufmaßblatt 11 never entered, 12 not countersigned, 13 entered one day after the Entwurf", () => {
    const ab = (nr: string) => p1.aufmass.find((a) => a.nr === nr)!;
    expect([ab("11").erfasstAm, ab("11").gegengezeichnet.wert]).toEqual([null, true]);
    expect([ab("12").erfasstAm, ab("12").gegengezeichnet.wert]).toEqual([null, false]);
    expect([ab("13").erfasstAm, ab("13").gegengezeichnetAm?.wert]).toEqual(["2026-10-20", "2026-10-08"]);
    expect(p1.aufmass.filter((a) => !a.gegengezeichnet.wert).map((a) => a.nr)).toEqual(["12"]);
  });

  it("15 Regieberichte: 12 in an Abschlagsrechnung, Regiebericht 12 not signed", () => {
    const inAr = new Set(p1.abschlaege.flatMap((a) => a.zeilen.flatMap((z) => (z.typ === "regie" ? [z.regieberichtNr.wert] : []))));
    expect([p1.regie.length, inAr.size]).toEqual([15, 12]);
    expect(p1.regie.filter((r) => !inAr.has(r.nr)).map((r) => r.nr)).toEqual(["9", "12", "15"]);
    expect(p1.regie.filter((r) => !r.unterschrieben.wert).map((r) => r.nr)).toEqual(["12"]);
  });
});

describe("the other four projects", () => {
  it("contract sums", () => {
    expect(firma.projekte.map((p) => p.vertrag.auftragssumme.wert)).toEqual(
      ["746.820,00 €", "612.400,00 €", "538.600,00 €", "668.400,00 €", "921.500,00 €"].map(ausListe),
    );
  });

  it("Abschlagsrechnungen of the projects in Ausführung", () => {
    expect(projekt("P2").abschlaege.map((a) => a.summe.wert)).toEqual([ausListe("148.300,00 €"), ausListe("196.800,00 €")]);
    expect(projekt("P3").abschlaege.map((a) => a.summe.wert)).toEqual([ausListe("121.400,00 €"), ausListe("163.900,00 €")]);
    for (const a of [...projekt("P2").abschlaege, ...projekt("P3").abschlaege]) expect(a.zeilen.reduce((s, z) => s + z.betrag.wert, 0)).toBe(a.summe.wert);
  });

  it("closed projects: Schlussrechnung and final payment", () => {
    expect(projekt("P4").schlussrechnung!.summe.wert).toBe(ausListe("684.212,40 €"));
    expect(projekt("P5").schlussrechnung!.summe.wert).toBe(ausListe("948.360,00 €"));
    expect(projekt("P4").zahlungen[0].betrag.wert).toBe(ausListe("86.223,12 €"));
    expect(projekt("P5").zahlungen[0].betrag.wert).toBe(ausListe("56.431,83 €"));
  });
});

describe("the whole sample company", () => {
  it("is deterministic: the same data on every call", () => {
    expect(JSON.stringify(beispielFirma())).toBe(JSON.stringify(firma));
  });

  it("every date is a working day (Monday to Friday, no Austrian public holiday)", () => {
    const ostern: Record<string, string> = { "2024": "2024-03-31", "2025": "2025-04-20", "2026": "2026-04-05" };
    const feiertage = new Set<string>();
    for (const [jahr, o] of Object.entries(ostern)) {
      for (const tag of ["01-01", "01-06", "05-01", "08-15", "10-26", "11-01", "12-08", "12-25", "12-26"]) feiertage.add(`${jahr}-${tag}`);
      for (const plus of [1, 39, 50, 60]) {
        const d = new Date(`${o}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() + plus);
        feiertage.add(d.toISOString().slice(0, 10));
      }
    }
    const daten = [...JSON.stringify(firma).matchAll(/"(20\d\d-\d\d-\d\d)/g)].map((m) => m[1]);
    const schlecht = [...new Set(daten)].filter((d) => [0, 6].includes(new Date(`${d}T00:00:00Z`).getUTCDay()) || feiertage.has(d));
    expect(daten.length).toBeGreaterThan(400);
    expect(schlecht).toEqual([]);
  });
});
