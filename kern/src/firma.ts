// Business level (Ebene 1, "Start", "Projekte", "Berichte"): every project with its status colour and date, the totals
// of the open projects, the money split by Belegstand, "davon mit Kürzungsrisiko" (E13), "nur außerhalb ERP" per money
// word (E15) and the Auftraggeber history. "Zusätzlich verrechenbar" and "in Klärung" are never added up.
// Status colour (fixed rule, never an accent colour): red = Schlussrechnung to be submitted within 21 days of the demo
// date and something open; yellow = something open; green = nothing open; grey = Schlussrechnung submitted or closed.
// Ported from the v1 core (firma.ts).

import type { AusserhalbErp } from "./belegquelle";
import { abrechnung, auftraggeberHistorie, gleicherGrund, tageZwischen, type Abrechnung, type AuftraggeberHistorie } from "./historie";
import type { Auftraggeber, Cent, Datensatz, Datum, Entscheidung, Firmendaten, Projektstufe } from "./modell";
import { pruefeProjekt, type ProjektErgebnis } from "./projekt";

export const STATUS_TAGE = 21;

export type Statusfarbe = "rot" | "gelb" | "gruen" | "grau";

export interface ProjektZeile {
  projektId: string;
  kurz: string;
  name: string;
  auftraggeber: Auftraggeber;
  stufe: Projektstufe;
  auftragssumme: Cent;
  /** The date the list shows: "legen bis", the last Abschlagsrechnung, the submission or the final payment. */
  datum: { art: "legen_bis" | "letzte_abschlagsrechnung" | "gelegt" | "schlusszahlung"; wert: Datum } | null;
  /** null when the project is not compared (Schlussrechnung submitted, closed). */
  zusaetzlichVerrechenbar: Cent | null;
  inKlaerung: Cent | null;
  funde: number;
  status: Statusfarbe;
}

export interface FirmenErgebnis {
  stichtag: Datum;
  projekte: ProjektZeile[];
  ergebnisse: Record<string, ProjektErgebnis>;
  /** Settlement of the projects with a paid Schlussrechnung. */
  abrechnungen: Record<string, Abrechnung>;
  summen: {
    projekte: number;
    offeneProjekte: number;
    auftragssumme: Cent;
    auftragssummeOffen: Cent;
    zusaetzlichVerrechenbar: Cent;
    inKlaerung: Cent;
    fundeZusaetzlich: number;
    fundeInKlaerung: number;
  };
  /** "In Klärung" split by Belegstand. */
  geld: { belegt: { betrag: Cent; anzahl: number }; belegFehlt: { betrag: Cent; anzahl: number }; nachtragNichtGelegt: { betrag: Cent; anzahl: number } };
  /** E13, shown under "zusätzlich verrechenbar", never subtracted. */
  davonMitKuerzungsrisiko: { betrag: Cent; anzahl: number };
  /** E15, only in "Berichte", per money word. */
  ausserhalbErp: { zusaetzlichVerrechenbar: AusserhalbErp; inKlaerung: AusserhalbErp };
  /** The earliest "Schlussrechnung legen bis" from the demo date on, among the open projects. */
  naechsteSchlussrechnung: { projektId: string; datum: Datum } | null;
  historie: AuftraggeberHistorie[];
  /** Notes "Gleicher Grund bei diesem Auftraggeber schon im …" per risk key of the Vorprüfung and per deduction. */
  gleicherGrund: Record<string, { projektId: string; text: string }[]>;
}

export function statusfarbe(d: Datensatz, e: ProjektErgebnis, stichtag: Datum): Statusfarbe {
  if (!e.abgleich.laeuft) return "grau";
  if (e.abgleich.summen.zusaetzlichVerrechenbar + e.abgleich.summen.inKlaerung === 0) return "gruen";
  const bis = d.projekt.schlussrechnungLegenBis;
  return bis && tageZwischen(stichtag, bis) <= STATUS_TAGE ? "rot" : "gelb";
}

function projektDatum(d: Datensatz): ProjektZeile["datum"] {
  const p = d.projekt;
  switch (p.stufe) {
    case "sr_vorbereiten":
      return p.schlussrechnungLegenBis ? { art: "legen_bis", wert: p.schlussrechnungLegenBis } : null;
    case "in_ausfuehrung": {
      const letzte = d.abschlaege.map((r) => r.datum.wert).sort().at(-1);
      return letzte ? { art: "letzte_abschlagsrechnung", wert: letzte } : null;
    }
    case "sr_gelegt":
      return p.schlussrechnungGelegt ? { art: "gelegt", wert: p.schlussrechnungGelegt } : null;
    case "abgeschlossen":
      return p.schlusszahlung ? { art: "schlusszahlung", wert: p.schlusszahlung } : null;
  }
}

const plus = (a: AusserhalbErp, b: AusserhalbErp): AusserhalbErp => ({ betrag: a.betrag + b.betrag, anzahl: a.anzahl + b.anzahl, vonBetrag: a.vonBetrag + b.vonBetrag, vonAnzahl: a.vonAnzahl + b.vonAnzahl });
const NULL_ERP: AusserhalbErp = { betrag: 0, anzahl: 0, vonBetrag: 0, vonAnzahl: 0 };

export function pruefeFirma(f: Firmendaten, entscheidungen: readonly Entscheidung[] = []): FirmenErgebnis {
  const ergebnisse: Record<string, ProjektErgebnis> = {};
  const abrechnungen: Record<string, Abrechnung> = {};
  const projekte: ProjektZeile[] = f.projekte.map((d) => {
    const ag = f.auftraggeber.find((a) => a.id === d.projekt.auftraggeberId);
    if (!ag) throw new Error(`Auftraggeber ${d.projekt.auftraggeberId} fehlt (${d.projekt.kurz})`);
    const e = pruefeProjekt(d, { auftraggeber: ag.kurzname, entscheidungen: entscheidungen.filter((x) => x.fundSchluessel.startsWith(`${d.projekt.id}/`)).map((x) => ({ ...x, fundSchluessel: x.fundSchluessel.slice(d.projekt.id.length + 1) })) });
    ergebnisse[d.projekt.id] = e;
    const ab = abrechnung(d);
    if (ab) abrechnungen[d.projekt.id] = ab;
    const s = e.abgleich.summen;
    return {
      projektId: d.projekt.id,
      kurz: d.projekt.kurz,
      name: d.projekt.name,
      auftraggeber: ag,
      stufe: d.projekt.stufe,
      auftragssumme: d.vertrag.auftragssumme.wert,
      datum: projektDatum(d),
      zusaetzlichVerrechenbar: e.abgleich.laeuft ? s.zusaetzlichVerrechenbar : null,
      inKlaerung: e.abgleich.laeuft ? s.inKlaerung : null,
      funde: e.abgleich.funde.length,
      status: statusfarbe(d, e, f.stichtag),
    };
  });

  const offen = projekte.filter((p) => p.zusaetzlichVerrechenbar !== null);
  const funde = offen.flatMap((p) => ergebnisse[p.projektId].abgleich.funde.filter((x) => x.entscheidung !== "nicht_verrechnen"));
  const geld = (stand: string) => {
    const xs = funde.filter((x) => x.belegstand === stand);
    return { betrag: xs.reduce((s, x) => s + x.betrag, 0), anzahl: xs.length };
  };
  // per project: find keys are unique inside a project only
  const imRisiko = offen.flatMap((p) => {
    const e = ergebnisse[p.projektId];
    const verrechenbar = new Set(e.abgleich.funde.filter((x) => x.belegstand === "belegt" && x.entscheidung !== "nicht_verrechnen").map((x) => x.schluessel));
    return (e.vorpruefung?.risiken ?? []).filter((r) => r.zustand === "droht" && r.fundSchluessel !== null && verrechenbar.has(r.fundSchluessel));
  });
  const naechste = offen
    .filter((p) => p.datum?.art === "legen_bis" && p.datum.wert >= f.stichtag)
    .sort((a, b) => a.datum!.wert.localeCompare(b.datum!.wert))[0];

  const historie = auftraggeberHistorie(f);
  const brueckeJe: FirmenErgebnis["gleicherGrund"] = {};
  for (const p of offen) {
    const e = ergebnisse[p.projektId];
    for (const r of e.vorpruefung?.risiken ?? []) {
      const g = gleicherGrund(historie, p.auftraggeber.id, r.grund, p.projektId);
      if (g.length) brueckeJe[`${p.projektId}/${r.schluessel}`] = g.map((x) => ({ projektId: x.projektId, text: x.text }));
    }
    for (const s of e.vorpruefung?.saetze ?? []) {
      if (s.pruefung !== "abzug_ohne_vertragspunkt") continue;
      const g = gleicherGrund(historie, p.auftraggeber.id, "abzug_ohne_vertragspunkt", p.projektId);
      if (g.length) brueckeJe[`${p.projektId}/abzug:${s.art}`] = g.map((x) => ({ projektId: x.projektId, text: x.text }));
    }
  }

  return {
    stichtag: f.stichtag,
    projekte,
    ergebnisse,
    abrechnungen,
    summen: {
      projekte: projekte.length,
      offeneProjekte: offen.length,
      auftragssumme: projekte.reduce((s, p) => s + p.auftragssumme, 0),
      auftragssummeOffen: offen.reduce((s, p) => s + p.auftragssumme, 0),
      zusaetzlichVerrechenbar: offen.reduce((s, p) => s + p.zusaetzlichVerrechenbar!, 0),
      inKlaerung: offen.reduce((s, p) => s + p.inKlaerung!, 0),
      fundeZusaetzlich: geld("belegt").anzahl,
      fundeInKlaerung: geld("beleg_fehlt").anzahl + geld("nachtrag_nicht_gelegt").anzahl,
    },
    geld: { belegt: geld("belegt"), belegFehlt: geld("beleg_fehlt"), nachtragNichtGelegt: geld("nachtrag_nicht_gelegt") },
    davonMitKuerzungsrisiko: { betrag: imRisiko.reduce((s, r) => s + r.betrag, 0), anzahl: imRisiko.length },
    ausserhalbErp: {
      zusaetzlichVerrechenbar: offen.map((p) => ergebnisse[p.projektId].ausserhalbErp.zusaetzlichVerrechenbar).reduce(plus, NULL_ERP),
      inKlaerung: offen.map((p) => ergebnisse[p.projektId].ausserhalbErp.inKlaerung).reduce(plus, NULL_ERP),
    },
    naechsteSchlussrechnung: naechste?.datum ? { projektId: naechste.projektId, datum: naechste.datum.wert } : null,
    historie,
    gleicherGrund: brueckeJe,
  };
}
