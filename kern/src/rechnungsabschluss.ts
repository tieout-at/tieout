// "Rechnungsabschluss" of the Schlussrechnung (SPEZIFIKATION.md 3.4): how the Auftraggeber will settle it. Own work
// value including the finds → Nachlass → the deductions he announced, each checked against the Vertrag → Haftrücklass →
// payments received → "Restforderung". Next to it "Restforderung laut Vertrag" (E14): the same without the deductions that
// have no contract item. All amounts net. Ported from the v1 core (kaskade.ts); the input is now the finds "belegt" that
// nobody set to "Nicht verrechnen", and every payment is recomputed from its Abschlagsrechnung.

import { euro, prozentText } from "./geld";
import type { AbzugArt, Cent, Datensatz, Quelle } from "./modell";
import { ABZUG_TEXT } from "./modell";
import { datumText, type Abgleich } from "./regeln";
import { abrechnen, STUFE, type Satz } from "./stufen";
import type { Nachweis } from "./typen";
import { saetzePruefen, type Satzpruefung } from "./vorpruefung";

export interface AbschlussZeile {
  bezeichnung: string;
  art: "summe" | "fund" | "abzug" | "zahlung" | "ergebnis";
  abzugArt: AbzugArt | null;
  satz: number | null;
  pruefung: Satzpruefung["pruefung"] | null;
  vertragspunkt: string | null;
  betrag: Cent;
  /** Finds only: their decision state, so that every tieout line is marked. */
  fundSchluessel?: string;
  nachweise: Nachweis[];
}

/** One Abschlagsrechnung and what the Auftraggeber paid on it, recomputed with the rates on its Zahlungsavis. */
export interface Abschlagszahlung {
  rechnungNr: string;
  datum: string;
  betrag: Cent;
  kuerzung: Cent;
  abzuege: { art: AbzugArt; satz: number; betrag: Cent }[];
  bezahlt: Cent;
  bezahltAm: string;
  /** Recomputed: amount − cut → rates of the Zahlungsavis. */
  nachgerechnet: Cent;
  stimmt: boolean;
}

export interface Rechnungsabschluss {
  zeilen: AbschlussZeile[];
  /** Entwurf plus "zusätzlich verrechenbar". */
  gesamtleistung: Cent;
  schlussrechnungsbetrag: Cent;
  zahlungen: Cent;
  restforderung: Cent;
  /** E14: without the deductions that have no contract item. */
  lautVertrag: { zeilen: AbschlussZeile[]; schlussrechnungsbetrag: Cent; restforderung: Cent };
  abschlaege: Abschlagszahlung[];
}

const nw = (titel: string, text: string, datum: string, quelle: Quelle, art: Nachweis["art"]): Nachweis => ({ titel, text, datum, quelle, art, rolle: "preis", imErp: art !== "abzugsschreiben" && art !== "zahlungsavis" });

function zahlungen(d: Datensatz): Abschlagszahlung[] {
  return d.abschlaege.flatMap((ar) => {
    const z = d.zahlungen.find((x) => x.rechnungNr.wert === ar.nr.wert);
    if (!z) return [];
    const kuerzung = z.abzuege.filter((a) => a.art === "kuerzung").reduce((s, a) => s + a.betrag.wert, 0);
    const saetze = z.abzuege.filter((a): a is typeof a & { art: AbzugArt } => a.art !== "kuerzung" && a.art !== "abschlagszahlungen" && a.satz !== null);
    const s = abrechnen(ar.summe.wert, kuerzung, saetze.map((a) => ({ art: a.art, satz: a.satz!.wert })));
    return [
      {
        rechnungNr: ar.nr.wert,
        datum: ar.datum.wert,
        betrag: ar.summe.wert,
        kuerzung,
        abzuege: saetze.map((a) => ({ art: a.art, satz: a.satz!.wert, betrag: a.betrag.wert })),
        bezahlt: z.betrag.wert,
        bezahltAm: z.datum.wert,
        nachgerechnet: s.ergebnis,
        stimmt: s.ergebnis === z.betrag.wert && s.zeilen.every((x) => saetze.find((a) => a.art === x.art)!.betrag.wert === x.betrag),
      },
    ];
  });
}

/** Only with an own Entwurf; without one null. */
export function rechnungsabschluss(d: Datensatz, a: Abgleich): Rechnungsabschluss | null {
  const e = d.entwurf;
  if (!e || !a.laeuft) return null;
  const v = d.vertrag;
  const funde = a.funde.filter((f) => f.belegstand === "belegt" && f.entscheidung !== "nicht_verrechnen");
  const gesamtleistung = e.summe.wert + funde.reduce((s, f) => s + f.betrag, 0);
  const pruefungen = saetzePruefen(d);
  const bezahlt = d.zahlungen.filter((z) => d.abschlaege.some((ar) => ar.nr.wert === z.rechnungNr.wert));
  const zahlungsSumme = bezahlt.reduce((s, z) => s + z.betrag.wert, 0);

  const kaskade = (mitOhneVertragspunkt: boolean) => {
    const p = pruefungen.filter((x) => mitOhneVertragspunkt || x.pruefung !== "abzug_ohne_vertragspunkt");
    const s = abrechnen(gesamtleistung, 0, p.map((x): Satz => ({ art: x.art, satz: x.satz })));
    const zeilen: AbschlussZeile[] = [
      { bezeichnung: "Entwurf der Schlussrechnung", art: "summe", abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, betrag: e.summe.wert, nachweise: [nw("Entwurf", `Summe netto ${euro(e.summe.wert)}`, e.datum.wert, e.summe.quelle, "entwurf")] },
      ...funde.map((f): AbschlussZeile => ({ bezeichnung: `${f.nr} ${f.titel}`, art: "fund", abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, betrag: f.betrag, fundSchluessel: f.schluessel, nachweise: [] })),
      { bezeichnung: "Gesamtleistung", art: "summe", abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, betrag: gesamtleistung, nachweise: [] },
    ];
    for (const stufe of [1, 2, 3, 4] as const) {
      const inStufe = s.zeilen.filter((x) => p.find((y) => y.art === x.art) && STUFE[x.art] === stufe);
      if (!inStufe.length) continue;
      for (const x of inStufe) {
        const pr = p.find((y) => y.art === x.art)!;
        const vs = v.saetze.find((y) => y.art === x.art && y.phase !== "abschlag");
        const ag = d.abzugsschreiben?.abzuege.find((y) => y.art === x.art);
        zeilen.push({
          bezeichnung: ABZUG_TEXT[x.art] + (x.art === "haftruecklass" && vs?.durchBankgarantieErsetzbar ? " (durch Bankgarantie ersetzbar)" : ""),
          art: "abzug",
          abzugArt: x.art,
          satz: x.satz,
          pruefung: pr.pruefung,
          vertragspunkt: pr.vertragspunkt,
          betrag: -x.betrag,
          nachweise: [
            ...(vs ? [nw(`Vertrag, Vertragspunkt ${vs.punkt}`, `${ABZUG_TEXT[x.art]} ${prozentText(vs.satz.wert, 2)}`, v.datum.wert, vs.satz.quelle, "vertrag")] : []),
            ...(ag && d.abzugsschreiben ? [nw("Abzugsschreiben", `${ABZUG_TEXT[x.art]} ${prozentText(ag.satz.wert, 2)}`, d.abzugsschreiben.datum.wert, ag.satz.quelle, "abzugsschreiben")] : []),
          ],
        });
      }
      zeilen.push({ bezeichnung: STUFEN_SUMME[stufe], art: "summe", abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, betrag: s.nachStufe[stufe], nachweise: [] });
    }
    zeilen.push({
      bezeichnung: `Zahlungen auf ${bezahlt.map((z) => z.rechnungNr.wert).join(", ")}`,
      art: "zahlung",
      abzugArt: null,
      satz: null,
      pruefung: null,
      vertragspunkt: null,
      betrag: -zahlungsSumme,
      nachweise: bezahlt.map((z) => nw(`Zahlungsavis ${z.rechnungNr.wert}`, `bezahlt am ${datumText(z.datum.wert)}: ${euro(z.betrag.wert)}`, z.datum.wert, z.betrag.quelle, "zahlungsavis")),
    });
    const rest = s.ergebnis - zahlungsSumme;
    zeilen.push({ bezeichnung: mitOhneVertragspunkt ? "Restforderung" : "Restforderung laut Vertrag", art: "ergebnis", abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, betrag: rest, nachweise: [] });
    return { zeilen, schlussrechnungsbetrag: s.ergebnis, restforderung: rest };
  };

  const voll = kaskade(true);
  const lautVertrag = kaskade(false);
  return {
    zeilen: voll.zeilen,
    gesamtleistung,
    schlussrechnungsbetrag: voll.schlussrechnungsbetrag,
    zahlungen: zahlungsSumme,
    restforderung: voll.restforderung,
    lautVertrag,
    abschlaege: zahlungen(d),
  };
}

const STUFEN_SUMME: Record<1 | 2 | 3 | 4, string> = { 1: "Nach Nachlass", 2: "Vor Haftrücklass", 3: "Betrag der Schlussrechnung vor Zahlungen", 4: "Nach Skonto" };
