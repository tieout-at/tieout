// Decisions made by humans (in stage 0 in the browser): the money words split by decision, and a "Nicht verrechnen"
// taken out of every sum. Without decisions every amount stays as in the solution list (betraege.test.ts).

import { describe, expect, it } from "vitest";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma, type FirmenErgebnis } from "../src/firma";
import type { Entscheidung } from "../src/modell";
import { ZAEHLENDE_ENTSCHEIDUNGEN, type Entscheidungssumme } from "../src/projekt";
import { ausListe } from "./hilfen";

const daten = beispielFirma();
const ohne = pruefeFirma(daten);
const schluessel = (projektId: string, nr: string) => `${projektId}/${ohne.ergebnisse[projektId].abgleich.funde.find((f) => f.nr === nr)!.schluessel}`;
const entscheidung = (fundSchluessel: string, stand: Entscheidung["stand"], zeit = "2026-10-25T10:00"): Entscheidung => ({ fundSchluessel, zeit, wer: "Abrechnung", stand });

const teile = (xs: Record<string, Entscheidungssumme>) => {
  const summe = (k: keyof Entscheidungssumme) => ZAEHLENDE_ENTSCHEIDUNGEN.reduce((s, st) => s + xs[st][k], 0);
  return { zusaetzlich: summe("zusaetzlichVerrechenbar"), klaerung: summe("inKlaerung"), fehlt: summe("belegFehlt"), nachtrag: summe("nachtragNichtGelegt"), risiko: summe("davonMitKuerzungsrisiko") };
};

/** Per money word the parts by decision add up to the total, for the business and for each open project. */
function stimmt(f: FirmenErgebnis) {
  expect(teile(f.jeEntscheidung)).toEqual({
    zusaetzlich: f.summen.zusaetzlichVerrechenbar,
    klaerung: f.summen.inKlaerung,
    fehlt: f.geld.belegFehlt.betrag,
    nachtrag: f.geld.nachtragNichtGelegt.betrag,
    risiko: f.davonMitKuerzungsrisiko.betrag,
  });
  for (const p of f.projekte.filter((x) => x.zusaetzlichVerrechenbar !== null)) {
    const e = f.ergebnisse[p.projektId];
    const s = e.abgleich.summen;
    expect(teile(e.jeEntscheidung)).toEqual({ zusaetzlich: s.zusaetzlichVerrechenbar, klaerung: s.inKlaerung, fehlt: s.belegFehlt, nachtrag: s.nachtragNichtGelegt, risiko: e.vorpruefung?.davonMitKuerzungsrisiko ?? 0 });
  }
}

describe("sums by decision", () => {
  it("without decisions every find is 'Gefunden': the column holds the totals of the solution list", () => {
    const g = ohne.jeEntscheidung.gefunden;
    expect([g.zusaetzlichVerrechenbar, g.inKlaerung, g.davonMitKuerzungsrisiko, g.anzahl]).toEqual([ausListe("22.632,96 €"), ausListe("8.319,19 €"), ausListe("6.843,00 €"), 14]);
    expect(ohne.ergebnisse.p1.jeEntscheidung.gefunden.zusaetzlichVerrechenbar).toBe(ausListe("14.620,15 €"));
    for (const st of ["geprueft", "freigegeben", "in_schlussrechnung"] as const) expect(ohne.jeEntscheidung[st].anzahl).toBe(0);
    stimmt(ohne);
  });

  it("checking and releasing moves money between the columns, never changes a total", () => {
    const f = pruefeFirma(daten, [entscheidung(schluessel("p1", "F1"), "geprueft"), entscheidung(schluessel("p1", "F2"), "geprueft"), entscheidung(schluessel("p1", "F2"), "freigegeben", "2026-10-25T10:05"), entscheidung(schluessel("p2", "F1"), "geprueft")]);
    expect([f.summen.zusaetzlichVerrechenbar, f.summen.inKlaerung, f.davonMitKuerzungsrisiko.betrag]).toEqual([ohne.summen.zusaetzlichVerrechenbar, ohne.summen.inKlaerung, ohne.davonMitKuerzungsrisiko.betrag]);
    expect([f.jeEntscheidung.gefunden.anzahl, f.jeEntscheidung.geprueft.anzahl, f.jeEntscheidung.freigegeben.anzahl]).toEqual([11, 2, 1]);
    const f1 = ohne.ergebnisse.p1.abgleich.funde.find((x) => x.nr === "F1")!;
    expect(f.ergebnisse.p1.jeEntscheidung.geprueft.zusaetzlichVerrechenbar).toBe(f1.betrag);
    stimmt(f);
  });

  it("'Nicht verrechnen' takes the find out of every sum and out of every column", () => {
    const f1 = ohne.ergebnisse.p1.abgleich.funde.find((x) => x.nr === "F1")!;
    const f = pruefeFirma(daten, [entscheidung(schluessel("p1", "F1"), "nicht_verrechnen")]);
    expect(f.summen.zusaetzlichVerrechenbar).toBe(ohne.summen.zusaetzlichVerrechenbar - f1.betrag);
    expect(f.ergebnisse.p1.abgleich.summen.zusaetzlichVerrechenbar).toBe(ohne.ergebnisse.p1.abgleich.summen.zusaetzlichVerrechenbar - f1.betrag);
    expect(f.jeEntscheidung.gefunden.anzahl).toBe(13);
    stimmt(f);
  });

  it("a decision on one project does not touch another", () => {
    const f = pruefeFirma(daten, [entscheidung(schluessel("p1", "F1"), "nicht_verrechnen")]);
    expect(f.ergebnisse.p2.abgleich.summen).toEqual(ohne.ergebnisse.p2.abgleich.summen);
    expect(f.ergebnisse.p3.abgleich.summen).toEqual(ohne.ergebnisse.p3.abgleich.summen);
  });
});
