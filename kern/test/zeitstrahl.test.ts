// Zeitstrahl and Belegabdeckung of solution list v3: every site event is "verrechnet" or "fehlt" with its find, the lane
// "Rechnung" carries only the amounts printed on the documents, and every find is traced back to a row of evidence.

import { describe, expect, it } from "vitest";
import { belegabdeckung, NACHWEISARTEN, zeilenJeBeleg } from "../src/abdeckung";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import { zeitstrahl } from "../src/zeitstrahl";
import { ausListe } from "./hilfen";

const firma = beispielFirma();
const f = pruefeFirma(firma);
const [p1, p2, , p4] = firma.projekte;
const z1 = zeitstrahl(p1, f.ergebnisse.p1);

describe("Zeitstrahl of Wohnpark Mooshaim", () => {
  it("61 site events and 9 of the lane Rechnung, duplicates left out, newest first", () => {
    expect(z1.zaehler).toEqual({ baustelle: 61, verrechnet: 24, fehlt: 16, naechste: 0, ohneStand: 21, mitFund: 17, rechnung: 9 });
    const ids = z1.ereignisse.map((x) => x.id);
    expect(ids.some((id) => id.endsWith("-kopie"))).toBe(false);
    expect(new Set(ids).size).toBe(ids.length);
    expect(z1.ereignisse.map((x) => x.datum)).toEqual([...z1.ereignisse.map((x) => x.datum)].sort().reverse());
  });

  it("every find of the project is named by at least one site event, and every event named 'fehlt' names a find", () => {
    const genannt = new Set(z1.ereignisse.flatMap((x) => x.funde));
    expect([...genannt].sort()).toEqual(f.ergebnisse.p1.abgleich.funde.map((x) => x.nr).sort());
    expect(z1.ereignisse.filter((x) => x.stand === "fehlt").every((x) => x.funde.length > 0)).toBe(true);
  });

  it("the trail of F1: plan index D, the instruction, the message, the photo and Aufmaßblatt 12 are missing; index C only proves", () => {
    const f1 = z1.ereignisse.filter((x) => x.funde.includes("F1"));
    expect(f1.map((x) => [x.titel, x.stand])).toEqual([
      ["Aufmaßblatt 12", "fehlt"],
      ["Foto", "fehlt"],
      ["WhatsApp-Meldung", "fehlt"],
      ["E-Mail, Anweisung", "fehlt"],
      ["Plan H-201, Index D", "fehlt"],
      ["Plan H-201, Index C", null],
    ]);
    expect(f1[0].schwach).toBe("nicht gegengezeichnet");
  });

  it("Regieberichte: 12 verrechnet, 9, 12 and 15 missing with their finds, 12 not signed", () => {
    const rb = z1.ereignisse.filter((x) => x.art === "regiebericht");
    expect(rb.filter((x) => x.stand === "verrechnet")).toHaveLength(12);
    expect(rb.filter((x) => x.stand === "fehlt").map((x) => [x.titel, x.funde[0], x.schwach])).toEqual([
      ["Regiebericht 15", "F3", null],
      ["Regiebericht 12", "F6", "nicht unterschrieben"],
      ["Regiebericht 9", "F2", null],
    ]);
  });

  it("the e-mail that brings the completion forward is a Rechtsfrage, with no state", () => {
    const rf = z1.ereignisse.filter((x) => x.rechtsfrage);
    expect(rf.map((x) => [x.id, x.stand])).toEqual([["mail-0702", null]]);
  });

  it("lane Rechnung: the totals, payments and the cut as printed, each in the solution list", () => {
    const r = z1.ereignisse.filter((x) => x.bahn === "rechnung").reverse();
    expect(r.map((x) => [x.titel, x.betrag])).toEqual([
      ["Abzugsschreiben", null],
      ["Abschlagsrechnung 1", ausListe("168.400,00 €")],
      ["Zahlung zu Abschlagsrechnung 1", ausListe("153.473,61 €")],
      ["Abschlagsrechnung 2", ausListe("276.900,00 €")],
      ["Zahlung zu Abschlagsrechnung 2", ausListe("252.356,55 €")],
      ["Abschlagsrechnung 3", ausListe("241.600,00 €")],
      ["Korrekturblatt zu Abschlagsrechnung 3", ausListe("1.776,00 €")],
      ["Entwurf der Schlussrechnung", ausListe("752.314,80 €")],
      ["Zahlung zu Abschlagsrechnung 3", ausListe("218.566,83 €")],
    ]);
  });
});

describe("Zeitstrahl during construction and after the Schlussrechnung", () => {
  it("Bürohaus Kiefernau: work after Abschlagsrechnung 2 goes into the next one, no find", () => {
    const z = zeitstrahl(p2, f.ergebnisse.p2);
    expect(z.ereignisse.filter((x) => x.stand === "naechste_abschlagsrechnung").map((x) => [x.titel, x.funde.length])).toEqual([
      ["Aufmaßblatt 6", 0],
      ["Regiebericht 7", 0],
    ]);
  });

  it("a closed project has no Abgleich: no event carries a state", () => {
    const z = zeitstrahl(p4, f.ergebnisse[p4.projekt.id]);
    expect(z.ereignisse.every((x) => x.stand === null && x.funde.length === 0)).toBe(true);
  });
});

describe("Belegabdeckung of Wohnpark Mooshaim", () => {
  const a = belegabdeckung(p1, f.ergebnisse.p1);
  const zeile = (s: string) => a.zeilen.find((z) => z.schluessel === s)!;
  const ids = (s: string, art: (typeof NACHWEISARTEN)[number]) => zeile(s).belege[art].map((b) => b.belegId);

  it("one row per row of the position table, in its order", () => {
    expect(a.zeilen.map((z) => z.schluessel)).toEqual(f.ergebnisse.p1.positionen.zeilen.map((z) => z.schluessel));
    expect(a.zeilen).toHaveLength(286 + 15 + 2);
  });

  it("every position names the Leistungsverzeichnis; every row with something open names its find", () => {
    expect(a.jeArt.leistungsverzeichnis).toBe(286);
    const offen = f.ergebnisse.p1.positionen.zeilen.filter((z) => z.offen > 0).map((z) => z.schluessel);
    expect(offen.every((s) => zeile(s).fund !== null)).toBe(true);
    expect(new Set(a.zeilen.flatMap((z) => (z.fund ? [z.fund.nr] : []))).size).toBe(8);
  });

  it("22.04.12B (F1): plan C and D, the instruction, message and photo, three Aufmaßblätter with number 12 weak, invoiced up to the Entwurf", () => {
    expect(ids("22.04.12B", "plan")).toEqual(["plan-h201-c", "plan-h201-d"]);
    expect(ids("22.04.12B", "email")).toEqual(["mail-0407"]);
    expect(ids("22.04.12B", "whatsapp")).toEqual(["w1"]);
    expect(ids("22.04.12B", "foto")).toEqual(["foto-0515"]);
    expect(zeile("22.04.12B").belege.aufmass.map((b) => [b.belegId, b.schwach])).toEqual([
      ["ab-8", null],
      ["ab-12", "nicht gegengezeichnet"],
    ]);
    expect(ids("22.04.12B", "rechnung")).toEqual(["ar-3", "entwurf"]);
  });

  it("Regie: Regiebericht 9 with its message, wholesaler invoice and Stundenzettel, in no invoice; 12 not signed", () => {
    expect(ids("regie:9", "whatsapp")).toEqual(["w2"]);
    expect(ids("regie:9", "regie").sort()).toEqual(["gh-rb9", "rb-9", "stundenzettel-kw23"]);
    expect(ids("regie:9", "rechnung")).toEqual([]);
    expect(zeile("regie:12").belege.regie.find((b) => b.belegId === "rb-12")!.schwach).toBe("nicht unterschrieben");
    expect(zeile("regie:12").fund).toMatchObject({ nr: "F6", belegstand: "beleg_fehlt" });
  });

  it("the hours of the WhatsApp-Meldung of 08.09. have a message and nothing else", () => {
    const w4 = zeile("meldung:W4");
    expect(NACHWEISARTEN.filter((x) => w4.belege[x].length)).toEqual(["whatsapp"]);
    expect(w4.fund?.abhilfe).toBeTruthy();
  });

  it("no duplicate is named, and a Beleg lists the rows it proves", () => {
    const alle = a.zeilen.flatMap((z) => NACHWEISARTEN.flatMap((x) => z.belege[x].map((b) => b.belegId)));
    expect(alle.some((id) => id.endsWith("-kopie"))).toBe(false);
    expect(zeilenJeBeleg(a).get("ab-12")).toEqual(["22.03.02A", "22.04.12B", "22.05.03A", "22.05.06A"]);
  });
});

describe("one date for one Beleg", () => {
  it("the Belegabdeckung dates a document as the Zeitstrahl does: by the date written on it", () => {
    const a = belegabdeckung(p1, f.ergebnisse.p1);
    const amZeitstrahl = new Map(z1.ereignisse.map((x) => [x.id, x.datum]));
    const alle = a.zeilen.flatMap((z) => NACHWEISARTEN.flatMap((k) => z.belege[k]));
    const verglichen = alle.filter((b) => amZeitstrahl.has(b.belegId));
    expect(verglichen.length).toBeGreaterThan(100);
    expect(verglichen.filter((b) => b.datum !== amZeitstrahl.get(b.belegId))).toEqual([]);
  });
});
