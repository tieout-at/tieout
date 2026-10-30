// "Lücken" of a project (step 14): what is missing so that a find can go into the invoice or a Kürzungsrisiko goes away,
// from the finds and the Vorprüfung, one line per thing a person can do. A signature that comes back from the site is an
// "Eingang": a fact a human enters, appended and never changed, the latest entry per gap counts. `mitEingaengen` writes the
// facts into a copy of the twin with the human in the Verlauf of the field, so the core computes on as usual; without an
// Eingang the twin stays as it was read and every amount of the solution list stays.

import { datumText, type Abgleich } from "./regeln";
import type { Datensatz, Feld, Regiebericht, Zeitpunkt } from "./modell";
import { feld, korrigiere, KUERZUNGSGRUND_TEXT } from "./modell";
import type { Beilage, Fund } from "./typen";
import type { Cent } from "./grundtypen";
import type { Vorpruefung } from "./vorpruefung";

/** One fact that came back from the site. `gueltig: false` takes an earlier entry back; nothing is ever removed. */
export interface Eingang {
  /** Key of the gap ("p1/unterschrift:rb-12"; inside a project without the prefix). */
  lueckeSchluessel: string;
  zeit: Zeitpunkt;
  /** Role or person, as a decision notes it. */
  wer: string;
  gueltig: boolean;
  /** With an account: the stored file of the signed sheet. */
  dateiId?: string;
}

export type LueckenArt = "unterschrift" | "gegenzeichnung" | "regiebericht" | "nachtrag" | "klaerung";

/** What closing the gap does: money comes into the invoice, a Kürzungsrisiko goes away, or nothing moves by itself. */
export type LueckenWirkung = "in_rechnung" | "kuerzungsrisiko" | "keine";

export interface Luecke {
  schluessel: string;
  art: LueckenArt;
  titel: string;
  /** "F6", "F1 (4 Positionen)", "Z-01". */
  bezug: string;
  fundSchluessel: string | null;
  risikoSchluessel: string | null;
  betrag: Cent;
  wirkung: LueckenWirkung;
  abhilfe: string;
  /** Who gets the task. */
  zustaendig: "Abrechnung" | "Bauleitung";
  /** The sheet with the field to sign; null where there is no sheet yet. */
  blatt: Beilage | null;
  /** Who signs ("Polier", "Auftraggeber"), or null where no signature closes the gap. */
  unterschreibt: string | null;
  /** Sheets that go along, as the Abhilfe asks. */
  beilagen: Beilage[];
  /** Goes into the signature folder for the site. */
  mappe: boolean;
  /** A person can enter that the signature is there. */
  schliessbar: boolean;
  /** What a Regiebericht to prepare says, only from the WhatsApp-Meldung. */
  vorlage: { meldung: string; arbeitstag: string; ort: string; taetigkeit: string; angeordnet: string | null; monteur: number; helfer: number } | null;
  /** The entry that closed it, or null while it is open. */
  eingang: Eingang | null;
}

/** The entries that count: per gap the latest, if it was not taken back. */
export function aktiveEingaenge(eingaenge: readonly Eingang[]): Eingang[] {
  const letzte = new Map<string, Eingang>();
  for (const e of eingaenge) {
    const bisher = letzte.get(e.lueckeSchluessel);
    if (!bisher || e.zeit >= bisher.zeit) letzte.set(e.lueckeSchluessel, e);
  }
  return [...letzte.values()].filter((e) => e.gueltig);
}

const zuWahr = (f: Feld<boolean>, e: Eingang) => korrigiere(f, true, e.wer, e.zeit, "Unterschrift liegt vor");

/** The twin with the facts that came back. An entry the twin knows nothing of changes nothing. */
export function mitEingaengen(d: Datensatz, eingaenge: readonly Eingang[]): Datensatz {
  let regie = d.regie;
  let aufmass = d.aufmass;
  for (const e of eingaenge) {
    const [art, id] = [e.lueckeSchluessel.split(":")[0], e.lueckeSchluessel.split(":").slice(1).join(":")];
    const tag = e.zeit.slice(0, 10);
    if (art === "unterschrift")
      regie = regie.map((r) => (r.belegId === id && !r.unterschrieben.wert ? { ...r, unterschrieben: zuWahr(r.unterschrieben, e), unterschriebenAm: feld(tag, r.unterschrieben.quelle) } : r));
    if (art === "gegenzeichnung")
      aufmass = aufmass.map((a) => (a.belegId === id && !a.gegengezeichnet.wert ? { ...a, gegengezeichnet: zuWahr(a.gegengezeichnet, e), gegengezeichnetAm: feld(tag, a.gegengezeichnet.quelle) } : a));
    if (art === "regiebericht") {
      const m = d.meldungen.find((x) => x.nr === id);
      if (m && !regie.some((r) => r.ausMeldung?.wert === m.nr)) regie = [...regie, ausMeldung(m, regie, e)];
    }
  }
  return regie === d.regie && aufmass === d.aufmass ? d : { ...d, regie, aufmass };
}

/** The Regiebericht prepared from a WhatsApp-Meldung and signed: its hours are the Meldung's, no material. */
function ausMeldung(m: Datensatz["meldungen"][number], regie: readonly Regiebericht[], e: Eingang): Regiebericht {
  const quelle = m.stundenMonteur.quelle;
  const tag = e.zeit.slice(0, 10);
  const nr = String(Math.max(0, ...regie.map((r) => Number(r.nr) || 0)) + 1);
  return {
    nr,
    belegId: m.id,
    datum: feld(tag, quelle),
    arbeitstage: feld([m.zeitpunkt.slice(0, 10)], quelle),
    taetigkeit: m.taetigkeit,
    angewiesenVon: m.angewiesenVon,
    stundenMonteur: m.stundenMonteur,
    stundenHelfer: m.stundenHelfer,
    material: feld(0, quelle),
    unterschrieben: zuWahr(feld(false, quelle), e),
    unterschriebenAm: feld(tag, quelle),
    ausMeldung: feld(m.nr, quelle),
  };
}

/** Every gap of the project as the twin was read, each once; closed ones carry the entry that closed them. */
export function luecken(d: Datensatz, a: Abgleich, vp: Vorpruefung | null, eingaenge: readonly Eingang[]): Luecke[] {
  const liste = new Map<string, Luecke>();
  const aktiv = new Map(eingaenge.map((e) => [e.lueckeSchluessel, e]));
  const rolle = d.vertrag.regieUnterschrift.wert;
  const add = (l: Omit<Luecke, "eingang">) => {
    if (!liste.has(l.schluessel)) liste.set(l.schluessel, { ...l, eingang: aktiv.get(l.schluessel) ?? null });
  };
  const leer = { fundSchluessel: null, risikoSchluessel: null, blatt: null, unterschreibt: null, beilagen: [], mappe: false, schliessbar: false, vorlage: null };
  const unterschrift = (r: Regiebericht, f: Fund | null, betrag: Cent, wirkung: LueckenWirkung, abhilfe: string, risiko: string | null) =>
    add({
      ...leer,
      schluessel: `unterschrift:${r.belegId}`,
      art: "unterschrift",
      titel: `Regiebericht ${r.nr} ist nicht unterschrieben`,
      bezug: f?.nr ?? `Regiebericht ${r.nr}`,
      fundSchluessel: f?.schluessel ?? null,
      risikoSchluessel: risiko,
      betrag,
      wirkung,
      abhilfe,
      zustaendig: "Bauleitung",
      blatt: { belegId: r.belegId, seite: r.unterschrieben.quelle.seite, stelle: r.unterschrieben.quelle.stelle ?? "Unterschrift Auftraggeber", titel: `Regiebericht ${r.nr}` },
      unterschreibt: rolle,
      mappe: true,
      schliessbar: true,
    });

  const zaehlt = (f: Fund) => f.entscheidung !== "nicht_verrechnen";
  for (const f of a.funde.filter(zaehlt)) {
    const rb = d.regie.find((r) => f.schluessel === `regie:${r.nr}`);
    if (rb && f.belegstand === "beleg_fehlt") unterschrift(rb, f, f.betrag, "in_rechnung", f.abhilfe ?? "", null);
    if (f.art === "stunden_ohne_regiebericht") {
      const m = d.meldungen.find((x) => f.schluessel === `meldung:${x.nr}`);
      if (m)
        add({
          ...leer,
          schluessel: `regiebericht:${m.nr}`,
          art: "regiebericht",
          titel: `Zur WhatsApp-Meldung vom ${datumText(m.zeitpunkt.slice(0, 10))} fehlt der Regiebericht`,
          bezug: f.nr,
          fundSchluessel: f.schluessel,
          betrag: f.betrag,
          wirkung: "in_rechnung",
          abhilfe: f.abhilfe ?? "",
          zustaendig: "Bauleitung",
          unterschreibt: rolle,
          mappe: true,
          schliessbar: true,
          vorlage: { meldung: m.id, arbeitstag: m.zeitpunkt.slice(0, 10), ort: m.ort.wert, taetigkeit: m.taetigkeit.wert, angeordnet: m.angewiesenVon?.wert ?? null, monteur: m.stundenMonteur.wert, helfer: m.stundenHelfer.wert },
        });
    }
    if (f.belegstand === "nachtrag_nicht_gelegt") add({ ...leer, schluessel: `nachtrag:${f.schluessel}`, art: "nachtrag", titel: f.abhilfe ?? "Nachtrag legen", bezug: f.nr, fundSchluessel: f.schluessel, betrag: f.betrag, wirkung: "keine", abhilfe: f.abhilfe ?? "", zustaendig: "Abrechnung" });
  }

  for (const r of vp?.risiken ?? []) {
    const f = a.funde.find((x) => x.schluessel === r.fundSchluessel) ?? null;
    if (f && !zaehlt(f)) continue;
    if (r.grund === "aufmass_nicht_gegengezeichnet") {
      for (const n of r.nachweise) {
        const b = d.aufmass.find((x) => x.belegId === n.quelle.belegId);
        if (!b) continue;
        add({
          ...leer,
          schluessel: `gegenzeichnung:${b.belegId}`,
          art: "gegenzeichnung",
          titel: `Aufmaßblatt ${b.nr} ist nicht gegengezeichnet`,
          bezug: r.bezug,
          fundSchluessel: f?.schluessel ?? null,
          risikoSchluessel: r.schluessel,
          betrag: r.betrag,
          wirkung: "kuerzungsrisiko",
          abhilfe: r.abhilfe,
          zustaendig: "Bauleitung",
          blatt: { belegId: b.belegId, seite: n.quelle.seite, stelle: n.quelle.stelle ?? "Unterschrift Auftraggeber", titel: `Aufmaßblatt ${b.nr}` },
          unterschreibt: "Auftraggeber",
          beilagen: r.beilagen ?? [],
          mappe: true,
          schliessbar: true,
        });
      }
      continue;
    }
    const rb = r.grund === "regie_nicht_unterschrieben" ? d.regie.find((x) => r.schluessel.endsWith(`:${x.nr}`)) : undefined;
    if (rb) unterschrift(rb, f, r.betrag, "kuerzungsrisiko", r.abhilfe, r.schluessel);
    else add({ ...leer, schluessel: `klaerung:${r.schluessel}`, art: "klaerung", titel: KUERZUNGSGRUND_TEXT[r.grund], bezug: r.bezug, fundSchluessel: f?.schluessel ?? null, risikoSchluessel: r.schluessel, betrag: r.betrag, wirkung: "keine", abhilfe: r.abhilfe, zustaendig: r.grund === "stunden_weichen_ab" ? "Bauleitung" : "Abrechnung" });
  }
  return [...liste.values()];
}
