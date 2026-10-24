// Auftraggeber history (company level): per Auftraggeber what he cut and why (Korrekturblätter), which rates he deducts
// without a contract item (Zahlungsavisos against the Vertrag), how many Nachträge he accepted and how long the final
// payment took. Facts from the documents only, no assessment of the Auftraggeber. Matching with the running project goes
// by the fixed reason (key), never by the text. Ported from the v1 core (historie.ts, abrechnung.ts).

import { euro, prozentText, rundeHalbAuf } from "./geld";
import type { AbzugArt, Auftraggeber, Bp, Cent, Datensatz, Datum, Firmendaten, Kuerzungsgrund, ZahlungsAbzug } from "./modell";
import { ABZUG_TEXT } from "./modell";
import { datumText } from "./regeln";
import { abrechnen, STUFE } from "./stufen";
import type { Nachweis } from "./typen";

export interface HistorieKuerzung {
  projektId: string;
  projekt: string;
  rechnung: { nr: string; art: "abschlag" | "schluss"; datum: Datum };
  bezug: string;
  grund: Kuerzungsgrund;
  text: string;
  betrag: Cent;
  nachweis: Nachweis;
}

export interface HistorieAbzug {
  projektId: string;
  projekt: string;
  art: AbzugArt;
  grund: "abzug_ohne_vertragspunkt";
  rechnungen: string[];
  betrag: Cent;
  nachweise: Nachweis[];
}

export interface AuftraggeberHistorie {
  auftraggeber: Auftraggeber;
  projekte: number;
  abgeschlossen: number;
  kuerzungen: HistorieKuerzung[];
  kuerzungenSumme: Cent;
  kuerzungenProjekte: number;
  abzuege: HistorieAbzug[];
  abzuegeSumme: Cent;
  abzuegeProjekte: number;
  nachtraege: { angeboten: number; beauftragt: number; betrag: Cent; betragBeauftragt: Cent; quote: Bp | null };
  /** Closed projects: days from the submitted Schlussrechnung to the final payment. */
  schlusszahlung: { projektId: string; projekt: string; gelegt: Datum; bezahlt: Datum; tage: number }[];
}

export const tageZwischen = (a: Datum, b: Datum) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);

function kuerzungen(d: Datensatz): HistorieKuerzung[] {
  return d.korrekturblaetter.flatMap((kb) => {
    const nr = kb.rechnungNr.wert;
    const rechnung = d.schlussrechnung?.nr.wert === nr ? d.schlussrechnung : d.abschlaege.find((r) => r.nr.wert === nr);
    if (!rechnung) throw new Error(`${d.projekt.kurz}: Rechnung ${nr} zum Korrekturblatt fehlt`);
    return kb.zeilen.map((z) => ({
      projektId: d.projekt.id,
      projekt: d.projekt.name,
      rechnung: { nr, art: rechnung.art === "schluss" ? ("schluss" as const) : ("abschlag" as const), datum: rechnung.datum.wert },
      bezug: z.positionNr.wert,
      grund: z.grund.wert,
      text: z.text.wert,
      betrag: z.kuerzung.wert,
      nachweis: { titel: `Korrekturblatt ${nr}`, text: `${z.positionNr.wert}: ${z.text.wert}, ${euro(z.kuerzung.wert)}`, datum: kb.datum.wert, quelle: z.kuerzung.quelle, art: "korrekturblatt", rolle: "preis", imErp: false },
    }));
  });
}

/** Rates on the Zahlungsavisos that the Vertrag of the project does not name, summed per kind. */
function abzuegeOhneVertragspunkt(d: Datensatz): HistorieAbzug[] {
  const imVertrag = new Set(d.vertrag.saetze.map((s) => s.art));
  return (Object.keys(ABZUG_TEXT) as AbzugArt[]).flatMap((art): HistorieAbzug[] => {
    if (imVertrag.has(art)) return [];
    const treffer = d.zahlungen.flatMap((z) => z.abzuege.filter((a) => a.art === art).map((a) => ({ z, a })));
    if (!treffer.length) return [];
    return [
      {
        projektId: d.projekt.id,
        projekt: d.projekt.name,
        art,
        grund: "abzug_ohne_vertragspunkt",
        rechnungen: treffer.map(({ z }) => z.rechnungNr.wert),
        betrag: treffer.reduce((s, { a }) => s + a.betrag.wert, 0),
        nachweise: treffer.map(({ z, a }) => ({ titel: `Zahlungsavis ${z.rechnungNr.wert}`, text: `${ABZUG_TEXT[art]} ${euro(a.betrag.wert)}`, datum: z.datum.wert, quelle: a.betrag.quelle, art: "zahlungsavis", rolle: "preis", imErp: false })),
      },
    ];
  });
}

function schlusszahlung(d: Datensatz): AuftraggeberHistorie["schlusszahlung"][number] | null {
  const sr = d.schlussrechnung;
  if (d.projekt.stufe !== "abgeschlossen" || !sr) return null;
  const z = d.zahlungen.find((x) => x.rechnungNr.wert === sr.nr.wert);
  return z ? { projektId: d.projekt.id, projekt: d.projekt.name, gelegt: sr.datum.wert, bezahlt: z.datum.wert, tage: tageZwischen(sr.datum.wert, z.datum.wert) } : null;
}

export function auftraggeberHistorie(f: Firmendaten): AuftraggeberHistorie[] {
  return f.auftraggeber.map((ag) => {
    const projekte = f.projekte.filter((d) => d.projekt.auftraggeberId === ag.id);
    const k = projekte.flatMap(kuerzungen);
    const a = projekte.flatMap(abzuegeOhneVertragspunkt);
    const n = projekte.flatMap((d) => d.nachtraege);
    const beauftragt = n.filter((x) => x.beauftragt.wert);
    const betrag = n.reduce((s, x) => s + x.betrag.wert, 0);
    const betragBeauftragt = beauftragt.reduce((s, x) => s + x.betrag.wert, 0);
    return {
      auftraggeber: ag,
      projekte: projekte.length,
      abgeschlossen: projekte.filter((d) => d.projekt.stufe === "abgeschlossen").length,
      kuerzungen: k,
      kuerzungenSumme: k.reduce((s, x) => s + x.betrag, 0),
      kuerzungenProjekte: new Set(k.map((x) => x.projektId)).size,
      abzuege: a,
      abzuegeSumme: a.reduce((s, x) => s + x.betrag, 0),
      abzuegeProjekte: new Set(a.map((x) => x.projektId)).size,
      nachtraege: { angeboten: n.length, beauftragt: beauftragt.length, betrag, betragBeauftragt, quote: betrag > 0 ? rundeHalbAuf(betragBeauftragt * 10000, betrag) : null },
      schlusszahlung: projekte.map(schlusszahlung).filter((x) => x !== null),
    };
  });
}

/** "Wohnhof Erlenhain" → "im Wohnhof Erlenhain", "Volksschule Ahornbrunn" → "in der Volksschule Ahornbrunn". */
export const imProjekt = (name: string) => (/^(Volksschule|Schule)/.test(name) ? `in der ${name}` : `im ${name}`);

/**
 * Other projects of the same Auftraggeber in which he cut or deducted for the same reason, once per project, with the
 * Beleg of the first hit. With `vor`, only hits dated before that day count, so that "schon" is true in time.
 */
export function gleicherGrund(h: readonly AuftraggeberHistorie[], auftraggeberId: string, grund: Kuerzungsgrund, ausserProjektId: string, vor?: Datum) {
  const ag = h.find((x) => x.auftraggeber.id === auftraggeberId);
  if (!ag) return [];
  const treffer = [
    ...ag.kuerzungen.filter((x) => x.grund === grund).map((x) => ({ projektId: x.projektId, projekt: x.projekt, nachweis: x.nachweis })),
    ...ag.abzuege.filter((x) => x.grund === grund).map((x) => ({ projektId: x.projektId, projekt: x.projekt, nachweis: x.nachweise[0] })),
  ].filter((x) => x.projektId !== ausserProjektId && (!vor || (x.nachweis.datum !== undefined && x.nachweis.datum < vor)));
  return treffer
    .filter((x, i) => treffer.findIndex((y) => y.projektId === x.projektId) === i)
    .map((x) => ({ ...x, text: `Gleicher Grund bei diesem Auftraggeber schon ${imProjekt(x.projekt)}.` }));
}

// ---------- Settlement of a closed project ----------

export interface AbrechnungsZeile {
  bezeichnung: string;
  art: "rechnung" | "kuerzung" | "abzug" | "summe" | "zahlung" | "ergebnis";
  abzugArt: AbzugArt | null;
  satz: Bp | null;
  pruefung: "laut_vertrag" | "abweichung" | "abzug_ohne_vertragspunkt" | null;
  vertragspunkt: string | null;
  betrag: Cent;
  nachweise: Nachweis[];
}

export interface Abrechnung {
  zeilen: AbrechnungsZeile[];
  gekuerzt: Cent;
  /** Haftrücklass the Auftraggeber keeps. */
  einbehalten: Cent;
  schlusszahlung: { betrag: Cent; datum: Datum; tage: number; nachgerechnet: Cent; stimmt: boolean };
}

/** From the submitted Schlussrechnung over the cuts, Nachlass, levies and Haftrücklass to the final payment; null without one. */
export function abrechnung(d: Datensatz): Abrechnung | null {
  const sr = d.schlussrechnung;
  const z = sr ? d.zahlungen.find((x) => x.rechnungNr.wert === sr.nr.wert) : undefined;
  if (!sr || !z) return null;
  const avis = (a: ZahlungsAbzug): Nachweis => ({ titel: "Zahlungsavis", text: `${datumText(z.datum.wert)}: ${euro(a.betrag.wert)}`, datum: z.datum.wert, quelle: a.betrag.quelle, art: "zahlungsavis", rolle: "preis", imErp: false });
  const zeile = (t: Pick<AbrechnungsZeile, "bezeichnung" | "art" | "betrag"> & Partial<AbrechnungsZeile>): AbrechnungsZeile => ({ abzugArt: null, satz: null, pruefung: null, vertragspunkt: null, nachweise: [], ...t });
  const kuerzung = z.abzuege.find((a) => a.art === "kuerzung");
  const gekuerzt = kuerzung?.betrag.wert ?? 0;
  const saetze = z.abzuege.filter((a): a is ZahlungsAbzug & { art: AbzugArt } => a.art !== "kuerzung" && a.art !== "abschlagszahlungen" && a.satz !== null);
  const s = abrechnen(sr.summe.wert, gekuerzt, saetze.map((a) => ({ art: a.art, satz: a.satz!.wert })));
  const zeilen: AbrechnungsZeile[] = [zeile({ bezeichnung: "Schlussrechnung", art: "rechnung", betrag: sr.summe.wert, nachweise: [{ titel: "Schlussrechnung", text: `Summe netto ${euro(sr.summe.wert)}`, datum: sr.datum.wert, quelle: sr.summe.quelle, art: "schlussrechnung", rolle: "preis", imErp: true }] })];
  if (kuerzung) {
    const kb = d.korrekturblaetter.filter((x) => x.rechnungNr.wert === sr.nr.wert);
    zeilen.push(zeile({ bezeichnung: "Kürzungen laut Korrekturblatt", art: "kuerzung", betrag: -gekuerzt, nachweise: [...kb.flatMap((x) => x.zeilen.map((y): Nachweis => ({ titel: "Korrekturblatt", text: `${y.positionNr.wert}: ${y.text.wert}, ${euro(y.kuerzung.wert)}`, datum: x.datum.wert, quelle: y.kuerzung.quelle, art: "korrekturblatt", rolle: "preis", imErp: false }))), avis(kuerzung)] }));
    zeilen.push(zeile({ bezeichnung: "Nach Kürzungen", art: "summe", betrag: s.nachKuerzung }));
  }
  const SUMME: Record<number, string> = { 1: "Nach Nachlass", 2: "Vor Haftrücklass", 3: "Nach Haftrücklass", 4: "Nach Skonto" };
  let einbehalten = 0;
  for (const stufe of [1, 2, 3, 4] as const) {
    const inStufe = s.zeilen.filter((x) => STUFE[x.art] === stufe);
    if (!inStufe.length) continue;
    for (const x of inStufe) {
      const a = saetze.find((y) => y.art === x.art)!;
      const vs = d.vertrag.saetze.find((y) => y.art === x.art && y.phase !== "abschlag");
      zeilen.push(
        zeile({
          bezeichnung: ABZUG_TEXT[x.art],
          art: "abzug",
          abzugArt: x.art,
          satz: x.satz,
          pruefung: !vs ? "abzug_ohne_vertragspunkt" : vs.satz.wert === x.satz ? "laut_vertrag" : "abweichung",
          vertragspunkt: vs?.punkt ?? null,
          betrag: -a.betrag.wert,
          nachweise: [...(vs ? [{ titel: `Vertrag, Vertragspunkt ${vs.punkt}`, text: `${ABZUG_TEXT[x.art]} ${prozentText(vs.satz.wert, 2)}`, datum: d.vertrag.datum.wert, quelle: vs.satz.quelle, art: "vertrag" as const, rolle: "preis" as const, imErp: true }] : []), avis(a)],
        }),
      );
      if (x.art === "haftruecklass") einbehalten += a.betrag.wert;
    }
    zeilen.push(zeile({ bezeichnung: SUMME[stufe], art: "summe", betrag: s.nachStufe[stufe] }));
  }
  const abschlaege = z.abzuege.find((a) => a.art === "abschlagszahlungen");
  const nachgerechnet = s.ergebnis - (abschlaege?.betrag.wert ?? 0);
  if (abschlaege) zeilen.push(zeile({ bezeichnung: "Bezahlte Abschlagsrechnungen", art: "zahlung", betrag: -abschlaege.betrag.wert, nachweise: [avis(abschlaege)] }));
  zeilen.push(zeile({ bezeichnung: "Schlusszahlung", art: "ergebnis", betrag: nachgerechnet, nachweise: [{ titel: "Zahlungsavis", text: `Zahlbetrag ${euro(z.betrag.wert)}`, datum: z.datum.wert, quelle: z.betrag.quelle, art: "zahlungsavis", rolle: "preis", imErp: false }] }));
  const stimmt = nachgerechnet === z.betrag.wert && s.zeilen.every((x) => saetze.find((y) => y.art === x.art)!.betrag.wert === x.betrag);
  return { zeilen, gekuerzt, einbehalten, schlusszahlung: { betrag: z.betrag.wert, datum: z.datum.wert, tage: tageZwischen(sr.datum.wert, z.datum.wert), nachgerechnet, stimmt } };
}
