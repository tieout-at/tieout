// The three Abläufe of the page "Abläufe" (SPEZIFIKATION.md 5.2): per Ablauf and project what each block read, found and
// checked. Counts only: a block never calculates an amount, the amounts stay in the results they come from. Built from
// the results of `pruefeFirma`, so decisions recorded in the browser change the counts that depend on them.

import { baueKontext } from "./kontext";
import type { Datum, Zeitpunkt } from "./grundtypen";
import type { Datensatz, Entscheidungsstand, Firmendaten, Kuerzungsgrund } from "./modell";
import type { FirmenErgebnis } from "./firma";
import type { ProjektErgebnis } from "./projekt";
import { berichtZuMeldung } from "./regeln";
import type { FundArt } from "./typen";

export type AblaufId = "abschluss_lauf" | "lauf_je_abschlagsrechnung" | "meldung_zu_regiebericht";

export const ABLAUF_TEXT: Record<AblaufId, string> = {
  abschluss_lauf: "Abschluss-Lauf",
  lauf_je_abschlagsrechnung: "Lauf je Abschlagsrechnung",
  meldung_zu_regiebericht: "Meldung zu Regiebericht",
};

/** The check catalogue: the reasons a cut can have, plus the quantity change above 20 % (a note, no reason to cut). */
export type PruefungId = Kuerzungsgrund | "mengenaenderung_ueber_20";

/** In the order of SPEZIFIKATION.md 5.2. */
export const PRUEFUNGEN: readonly { id: PruefungId; text: string }[] = [
  { id: "aufmass_nicht_gegengezeichnet", text: "Aufmaß nicht gegengezeichnet" },
  { id: "regie_nicht_unterschrieben", text: "Regie nicht unterschrieben" },
  { id: "stunden_weichen_ab", text: "Stunden weichen ab" },
  { id: "rechenfehler", text: "Rechenfehler" },
  { id: "ausserhalb_lv_kein_nachtrag", text: "Außerhalb des Leistungsverzeichnisses" },
  { id: "menge_ohne_aufmass", text: "Menge ohne Aufmaß-Nachweis" },
  { id: "abzug_ohne_vertragspunkt", text: "Abzug ohne Vertragspunkt" },
  { id: "mengenaenderung_ueber_20", text: "Mengenänderung über 20 %" },
];

export interface PruefungsTreffer {
  id: PruefungId;
  /** Hits of the rule in the last run. */
  treffer: number;
  /** Of them Kürzungsrisiken that still threaten (only reasons to cut). */
  droht: number;
  /** Numbers of the finds the hits lie in ("F1"), so each hit leads to its find; empty for a line of the Entwurf. */
  funde: string[];
  /** Every hit on its own: its find (or null), the quantity change in basis points (only "Mengenänderung über 20 %"). */
  einzeln: { fund: string | null; aenderung: number | null; droht: boolean }[];
}

/** The finds of a project counted by Belegstand; a find set to "Nicht verrechnen" counts apart, in no Belegstand. */
export interface Fundzahlen {
  funde: number;
  belegt: number;
  belegFehlt: number;
  nachtragNichtGelegt: number;
  nichtVerrechnen: number;
  jeArt: Partial<Record<FundArt, number>>;
}

export interface AbschlussLauf {
  projektId: string;
  /** The day of the own Entwurf: the run checks the Schlussrechnung of that day. */
  datum: Datum;
  ordner: { belege: number; duplikate: number; korrigierteFelder: number; meldungen: number };
  abgleich: Fundzahlen;
  vorpruefung: { positionen: number; droht: number; schonGekuerzt: number; pruefungen: PruefungsTreffer[] };
  aufgaben: { bauleitung: number; abrechnung: number };
  /** Finds not "Gefunden" or "Geprüft" count as decided (as the tab Schlussrechnung counts them). */
  entwurf: { funde: number; entschieden: number; freigegeben: number };
  /** Ausgaben are final only once every find is decided and at least one is released (SPEZIFIKATION.md 5.1). */
  ausgabenFertig: boolean;
}

export interface AbschlagsLauf {
  projektId: string;
  abschlagsrechnung: { nr: string; datum: Datum };
  abgleich: Fundzahlen;
  regie: { unterschriebenNichtVerrechnet: number; nichtUnterschrieben: number; nachGrenze: number };
  /** The Vorprüfung needs an own Entwurf; without one it does not run (null). */
  vorpruefung: { positionen: number; droht: number } | null;
  aufgaben: { bauleitung: number };
}

/** What became of a WhatsApp-Meldung: written up as a Regiebericht, a task to write one, or nothing to do. */
export type MeldungsErgebnis =
  | { art: "regiebericht"; nr: string; unterschrieben: boolean }
  | { art: "aufgabe" }
  | { art: "positionen" }
  | { art: "ohne_stunden" }
  | { art: "verrechnet" };

export interface MeldungsLauf {
  projektId: string;
  meldungId: string;
  nr: string;
  zeitpunkt: Zeitpunkt;
  taetigkeit: string;
  ergebnis: MeldungsErgebnis;
}

export interface Ablaeufe {
  abschluss: AbschlussLauf[];
  abschlag: AbschlagsLauf[];
  meldung: MeldungsLauf[];
}

const ENTSCHIEDEN: readonly Entscheidungsstand[] = ["freigegeben", "in_schlussrechnung", "nicht_verrechnen"];

function fundzahlen(e: ProjektErgebnis): Fundzahlen {
  const funde = e.abgleich.funde;
  const zaehlt = funde.filter((f) => f.entscheidung !== "nicht_verrechnen");
  const jeArt: Partial<Record<FundArt, number>> = {};
  for (const f of funde) jeArt[f.art] = (jeArt[f.art] ?? 0) + 1;
  return {
    funde: funde.length,
    belegt: zaehlt.filter((f) => f.belegstand === "belegt").length,
    belegFehlt: zaehlt.filter((f) => f.belegstand === "beleg_fehlt").length,
    nachtragNichtGelegt: zaehlt.filter((f) => f.belegstand === "nachtrag_nicht_gelegt").length,
    nichtVerrechnen: funde.length - zaehlt.length,
    jeArt,
  };
}

function pruefungen(e: ProjektErgebnis): PruefungsTreffer[] {
  const nr = new Map(e.abgleich.funde.map((f) => [f.schluessel, f.nr]));
  const funde = (keys: (string | null)[]) => [...new Set(keys.flatMap((k) => (k && nr.has(k) ? [nr.get(k)!] : [])))];
  const risiken = e.vorpruefung?.risiken ?? [];
  const abzuege = (e.vorpruefung?.saetze ?? []).filter((s) => s.pruefung === "abzug_ohne_vertragspunkt").length;
  const mengen = e.abgleich.hinweise.filter((h) => h.art === "mengenaenderung_ueber_20");
  return PRUEFUNGEN.map(({ id }) => {
    if (id === "abzug_ohne_vertragspunkt") return { id, treffer: abzuege, droht: 0, funde: [], einzeln: Array.from({ length: abzuege }, () => ({ fund: null, aenderung: null, droht: false })) };
    if (id === "mengenaenderung_ueber_20")
      return { id, treffer: mengen.length, droht: 0, funde: funde(mengen.map((h) => h.fundSchluessel)), einzeln: mengen.map((h) => ({ fund: (h.fundSchluessel && nr.get(h.fundSchluessel)) || null, aenderung: h.aenderung, droht: false })) };
    const xs = risiken.filter((r) => r.grund === id);
    return {
      id,
      treffer: xs.length,
      droht: xs.filter((r) => r.zustand === "droht").length,
      funde: funde(xs.map((r) => r.fundSchluessel)),
      einzeln: xs.map((r) => ({ fund: (r.fundSchluessel && nr.get(r.fundSchluessel)) || null, aenderung: null, droht: r.zustand === "droht" })),
    };
  });
}

/** Finds with a gap in their Belege, each a task to the Bauleitung while the foreman is still on site (E16). */
const luecken = (z: Fundzahlen) => z.belegFehlt + z.nachtragNichtGelegt;

function abschlussLauf(d: Datensatz, e: ProjektErgebnis): AbschlussLauf | null {
  const vp = e.vorpruefung;
  if (!d.entwurf || !vp || !e.rechnungsabschluss) return null;
  const z = fundzahlen(e);
  const entschieden = e.abgleich.funde.filter((f) => ENTSCHIEDEN.includes(f.entscheidung)).length;
  const freigegeben = e.abgleich.funde.filter((f) => f.entscheidung === "freigegeben" || f.entscheidung === "in_schlussrechnung").length;
  const offen = new Set(e.abgleich.funde.filter((f) => f.entscheidung !== "nicht_verrechnen").map((f) => f.schluessel));
  const droht = vp.risiken.filter((r) => r.zustand === "droht");
  return {
    projektId: d.projekt.id,
    datum: d.entwurf.datum.wert,
    ordner: { belege: e.ordner.belege, duplikate: e.ordner.duplikate, korrigierteFelder: e.ordner.korrigierteFelder, meldungen: e.ordner.meldungen },
    abgleich: z,
    vorpruefung: { positionen: vp.risiken.length, droht: droht.length, schonGekuerzt: vp.risiken.length - droht.length, pruefungen: pruefungen(e) },
    aufgaben: { bauleitung: luecken(z), abrechnung: droht.filter((r) => r.fundSchluessel === null || offen.has(r.fundSchluessel)).length },
    entwurf: { funde: z.funde, entschieden, freigegeben },
    ausgabenFertig: entschieden === z.funde && freigegeben > 0,
  };
}

function abschlagsLauf(d: Datensatz, e: ProjektErgebnis): AbschlagsLauf | null {
  // the latest Abschlagsrechnung; on the same day the one filed later in the folder
  const letzte = d.abschlaege.reduce<(typeof d.abschlaege)[number] | undefined>((a, b) => (!a || b.datum.wert >= a.datum.wert ? b : a), undefined);
  if (d.entwurf || !e.abgleich.laeuft || !letzte) return null;
  const z = fundzahlen(e);
  const r = e.abgleich.regie;
  const vp = e.vorpruefung;
  return {
    projektId: d.projekt.id,
    abschlagsrechnung: { nr: letzte.nr.wert, datum: letzte.datum.wert },
    abgleich: z,
    regie: { unterschriebenNichtVerrechnet: r.unterschriebenNichtVerrechnet, nichtUnterschrieben: r.nichtUnterschrieben, nachGrenze: r.nachGrenze },
    vorpruefung: vp ? { positionen: vp.risiken.length, droht: vp.risiken.filter((x) => x.zustand === "droht").length } : null,
    aufgaben: { bauleitung: luecken(z) },
  };
}

function meldungsLaeufe(d: Datensatz): MeldungsLauf[] {
  const k = baueKontext(d);
  return d.meldungen.map((m) => {
    const rb = berichtZuMeldung(d, m);
    const ergebnis: MeldungsErgebnis = rb
      ? { art: "regiebericht", nr: rb.nr, unterschrieben: rb.unterschrieben.wert }
      : m.bezugPositionen.wert.length > 0
        ? { art: "positionen" }
        : k.regieVerrechnet.has(m.nr)
          ? { art: "verrechnet" }
          : m.stundenMonteur.wert + m.stundenHelfer.wert === 0
            ? { art: "ohne_stunden" }
            : { art: "aufgabe" };
    return { projektId: d.projekt.id, meldungId: m.id, nr: m.nr, zeitpunkt: m.zeitpunkt, taetigkeit: m.taetigkeit.wert, ergebnis };
  });
}

/** Every run the data of the business allows, the latest first. Closed projects run no Ablauf. */
export function ablaeufe(f: Firmendaten, b: FirmenErgebnis): Ablaeufe {
  const abschluss: AbschlussLauf[] = [];
  const abschlag: AbschlagsLauf[] = [];
  const meldung: MeldungsLauf[] = [];
  for (const d of f.projekte) {
    const e = b.ergebnisse[d.projekt.id];
    if (!e?.abgleich.laeuft) continue;
    const a = abschlussLauf(d, e);
    if (a) abschluss.push(a);
    const s = abschlagsLauf(d, e);
    if (s) abschlag.push(s);
    meldung.push(...meldungsLaeufe(d));
  }
  return {
    abschluss: abschluss.toSorted((x, y) => y.datum.localeCompare(x.datum)),
    abschlag: abschlag.toSorted((x, y) => y.abschlagsrechnung.datum.localeCompare(x.abschlagsrechnung.datum) || x.projektId.localeCompare(y.projektId)),
    meldung: meldung.toSorted((x, y) => y.zeitpunkt.localeCompare(x.zeitpunkt)),
  };
}
