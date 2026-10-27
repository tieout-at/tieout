// The three Abläufe of the page "Abläufe" (SPEZIFIKATION.md 5.2) against the sample company: counts per block, no
// amount. The counts come from the same results as every other screen (Ordner lesen, Abgleich, Vorprüfung).

import { describe, expect, it } from "vitest";
import { ablaeufe, PRUEFUNGEN } from "../src/ablaeufe";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import type { Entscheidung } from "../src/modell";

const firma = beispielFirma();
const a = ablaeufe(firma, pruefeFirma(firma));

describe("Abschluss-Lauf", () => {
  it("runs only for Wohnpark Mooshaim, the one project with an own Entwurf, on the day of the Entwurf", () => {
    expect(a.abschluss.map((x) => [x.projektId, x.datum])).toEqual([["p1", "2026-10-19"]]);
  });

  it("Ordner lesen: 77 Belege, 4 duplicates, 18 fields corrected, 4 WhatsApp-Meldungen", () => {
    expect(a.abschluss[0].ordner).toEqual({ belege: 77, duplikate: 4, korrigierteFelder: 18, meldungen: 4 });
  });

  it("Abgleich: 8 finds, 5 belegt, 2 Beleg fehlt, 1 Nachtrag nicht gelegt", () => {
    const z = a.abschluss[0].abgleich;
    expect([z.funde, z.belegt, z.belegFehlt, z.nachtragNichtGelegt, z.nichtVerrechnen]).toEqual([8, 5, 2, 1, 0]);
    expect(z.jeArt).toEqual({ mehrmenge_plan: 1, regie: 3, mehrmenge: 2, stunden_ohne_regiebericht: 1, aenderung_angemeldet: 1 });
  });

  it("Vorprüfung: 3 positions, 2 threaten, 1 already cut; hits per check in the order of the catalogue", () => {
    const vp = a.abschluss[0].vorpruefung;
    expect([vp.positionen, vp.droht, vp.schonGekuerzt]).toEqual([3, 2, 1]);
    expect(vp.pruefungen.map((p) => [p.id, p.treffer, p.droht])).toEqual([
      ["aufmass_nicht_gegengezeichnet", 1, 1],
      ["regie_nicht_unterschrieben", 0, 0],
      ["stunden_weichen_ab", 1, 1],
      ["rechenfehler", 0, 0],
      ["ausserhalb_lv_kein_nachtrag", 1, 0],
      ["menge_ohne_aufmass", 0, 0],
      ["abzug_ohne_vertragspunkt", 1, 0],
      ["mengenaenderung_ueber_20", 1, 0],
    ]);
    expect(PRUEFUNGEN).toHaveLength(8);
  });

  it("tasks: 3 gaps to the Bauleitung, 2 Kürzungsrisiken to the Abrechnung; nothing decided, Ausgaben not final", () => {
    const x = a.abschluss[0];
    expect([x.aufgaben, x.entwurf, x.ausgabenFertig]).toEqual([{ bauleitung: 3, abrechnung: 2 }, { funde: 8, entschieden: 0 }, false]);
  });

  it("follows the decisions: a find set to 'Nicht verrechnen' leaves its gap and counts as decided", () => {
    const e = pruefeFirma(firma).ergebnisse.p1.abgleich.funde;
    const luecke = e.find((f) => f.belegstand === "beleg_fehlt")!;
    const freigabe = e.filter((f) => f.belegstand === "belegt").map((f): Entscheidung => ({ fundSchluessel: `p1/${f.schluessel}`, zeit: "2026-10-27T10:00", wer: "Geschäftsführung", stand: "freigegeben" }));
    const nv: Entscheidung = { fundSchluessel: `p1/${luecke.schluessel}`, zeit: "2026-10-27T10:00", wer: "Abrechnung", stand: "nicht_verrechnen", grund: "Test" };
    const x = ablaeufe(firma, pruefeFirma(firma, [...freigabe, nv])).abschluss[0];
    expect([x.abgleich.belegFehlt, x.abgleich.nichtVerrechnen, x.aufgaben.bauleitung, x.entwurf.entschieden, x.ausgabenFertig]).toEqual([1, 1, 2, 6, false]);
  });
});

describe("Lauf je Abschlagsrechnung", () => {
  it("runs for the two projects in Ausführung at their last Abschlagsrechnung", () => {
    expect(a.abschlag.map((x) => [x.projektId, x.abschlagsrechnung.nr, x.abschlagsrechnung.datum])).toEqual([
      ["p2", "Abschlagsrechnung 2", "2026-09-30"],
      ["p3", "Abschlagsrechnung 2", "2026-09-30"],
    ]);
  });

  it("Bürohaus Kiefernau: 3 finds belegt, no gap; Volksschule Ahornbrunn: 3 finds, 1 gap to the Bauleitung", () => {
    const [p2, p3] = a.abschlag;
    expect([p2.abgleich.funde, p2.abgleich.belegt, p2.aufgaben.bauleitung]).toEqual([3, 3, 0]);
    expect([p3.abgleich.funde, p3.abgleich.belegFehlt, p3.aufgaben.bauleitung]).toEqual([3, 1, 1]);
    expect(p3.regie).toEqual({ unterschriebenNichtVerrechnet: 1, nichtUnterschrieben: 1, nachGrenze: 1 });
  });

  it("the Vorprüfung needs an own Entwurf, so it does not run during Ausführung", () => {
    expect(a.abschlag.map((x) => x.vorpruefung)).toEqual([null, null]);
  });
});

describe("Meldung zu Regiebericht", () => {
  it("one run per WhatsApp-Meldung of the open projects, the latest first", () => {
    expect(a.meldung.map((m) => [m.projektId, m.nr, m.zeitpunkt.slice(0, 10)])).toEqual([
      ["p2", "P2-W1", "2026-09-24"],
      ["p1", "W4", "2026-09-08"],
      ["p1", "W3", "2026-07-14"],
      ["p1", "W2", "2026-06-03"],
      ["p1", "W1", "2026-05-12"],
    ]);
  });

  it("the Meldung without a Regiebericht becomes a task; the find 'Stunden ohne Regiebericht' is the same Meldung", () => {
    const aufgaben = a.meldung.filter((m) => m.ergebnis.art === "aufgabe").map((m) => m.nr);
    const funde = pruefeFirma(firma).ergebnisse.p1.abgleich.funde.filter((f) => f.art === "stunden_ohne_regiebericht").map((f) => f.schluessel);
    expect(funde.every((s) => aufgaben.some((nr) => s === `meldung:${nr}`))).toBe(true);
    expect(aufgaben.length).toBeGreaterThanOrEqual(funde.length);
  });

  it("closed projects run no Ablauf", () => {
    const f = { ...firma, projekte: firma.projekte.filter((d) => d.projekt.stufe === "abgeschlossen") };
    expect(f.projekte).toHaveLength(2);
    expect(ablaeufe(f, pruefeFirma(f))).toEqual({ abschluss: [], abschlag: [], meldung: [] });
  });
});
