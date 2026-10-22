// Baut aus einer knappen Beschreibung einen vollständigen, kleinen Projektzwilling (alles fiktiv).
// Abschlagsrechnungen entstehen aus dem Aufmaß: jede AR verrechnet, was bis zu ihrem Datum aufgemessen und noch
// nicht verrechnet ist. Abweichungen (die eingebauten Fälle) stehen ausdrücklich in `arMenge` und `entwurfMenge`.
// Die Befunde findet erst der Rechenkern; hier wird nichts vorgerechnet außer Summen von Rechnungszeilen.

import type {
  Aufmassblatt,
  Datensatz,
  Dokument,
  DokumentArt,
  Einheit,
  Feld,
  LvPosition,
  Projekt,
  Quelle,
  Rechnung,
  RechnungsZeile,
  Regiebericht,
  Zahlung,
} from "@/domain/typen";
import { betragAusMenge, stundenBetrag } from "@/engine/geld";

export interface PosDef {
  nr: string;
  text: string;
  einheit: Einheit;
  /** Einheitspreis in Cent. */
  ep: number;
  /** LV-Menge in Hundertstel. */
  lv: number;
}

export interface BlattDef {
  nr: string;
  datum: string;
  von: string;
  bis: string;
  /** Position → Menge in Hundertstel. */
  zeilen: Record<string, number>;
}

export interface RbDef {
  nr: string;
  datum: string;
  text: string;
  /** Stunden in Hundertstel. */
  m: number;
  h: number;
  material: number;
  unterschrieben: boolean;
}

export interface ArDef {
  nr: string;
  datum: string;
  regie: string[];
  /** Abweichende Menge einer Position in dieser AR (statt „wie aufgemessen“). */
  arMenge?: Record<string, number>;
}

export interface ProjektDef {
  projekt: Projekt;
  vertragDatum: string;
  /** Auftragssumme in Cent; eine Sammelposition gleicht die LV-Summe genau darauf aus. */
  auftragssumme: number;
  regiesatzMonteur: number;
  regiesatzHelfer: number;
  mittellohnpreis: number;
  positionen: PosDef[];
  blaetter: BlattDef[];
  regie: RbDef[];
  abschlaege: ArDef[];
  /** Schlussrechnungs-Entwurf: Datum, verrechnete Regie, abweichende Mengen. null = in Ausführung. */
  entwurf: { datum: string; regie: string[]; menge?: Record<string, number> } | null;
  /** Stichtag der Demo: Zahlungen nur für ARs, deren Zahlungsziel (28 Tage) davor liegt. */
  stichtag: string;
}

export const SAMMELPOSITION = "99.01.01A";
const ZAHLUNGSZIEL_TAGE = 28;

const q = (dokumentId: string, seite: number, stelle?: string): Quelle => (stelle ? { dokumentId, seite, stelle } : { dokumentId, seite });
const f = <T,>(wert: T, quelle: Quelle): Feld<T> => ({ wert, quelle });

function plusTage(iso: string, tage: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + tage);
  return d.toISOString().slice(0, 10);
}

export function baueProjekt(def: ProjektDef): Datensatz {
  const k = def.projekt.kurz;
  const dokumente: Dokument[] = [];
  const dok = (id: string, art: DokumentArt, dateiname: string, datum: string, seiten = 1) => {
    dokumente.push({ id, art, kanal: "ordner", dateiname, datum, seiten, inhaltHash: `h-${k}-${id}` });
    return id;
  };

  // LV mit Sammelposition, die genau auf die Auftragssumme ausgleicht
  const summeEinzeln = def.positionen.reduce((s, p) => s + betragAusMenge(p.lv, p.ep), 0);
  const sammel = def.auftragssumme - summeEinzeln;
  if (sammel <= 0) throw new Error(`${k}: Positionen übersteigen die Auftragssumme`);
  const positionen: PosDef[] = [
    ...def.positionen,
    { nr: SAMMELPOSITION, text: "Übrige Leistungen laut LV (in der Demo zusammengefasst)", einheit: "psch", ep: sammel, lv: 100 },
  ];
  dok("vertrag", "vertrag", `${k}_Bauvertrag.pdf`, def.vertragDatum, 12);
  dok("lv", "lv", `${k}_LV.onlv.pdf`, def.vertragDatum, 2);
  const lv: LvPosition[] = positionen.map((p, i) => {
    const ql = (stelle: string) => q("lv", 1 + Math.floor(i / 20), `Pos. ${p.nr}, ${stelle}`);
    return {
      nr: f(p.nr, ql("Positionsnummer")),
      kurztext: f(p.text, ql("Kurztext")),
      einheit: f(p.einheit, ql("Einheit")),
      menge: f(p.lv, ql("Menge")),
      ep: f(p.ep, ql("Einheitspreis")),
      k7: null,
    };
  });
  const lvNr = new Set(positionen.map((p) => p.nr));

  // Aufmaß (alle Blätter vom Auftraggeber gegengezeichnet)
  const aufmass: Aufmassblatt[] = def.blaetter.map((b) => {
    const id = `ab-${b.nr.slice(3)}`;
    dok(id, "aufmass", `${k}_${b.nr}_Aufmass.pdf`, b.datum);
    const zeilen = Object.entries(b.zeilen).map(([nr, menge]) => {
      if (!lvNr.has(nr)) throw new Error(`${k} ${b.nr}: Position ${nr} nicht im LV`);
      const qa = q(id, 1, `Zeile ${nr}`);
      return { positionNr: f(nr, qa), menge: f(menge, qa), ort: f("laut Blatt", qa) };
    });
    return {
      nr: b.nr,
      dokumentId: id,
      datum: f(b.datum, q(id, 1, "Kopf, Datum")),
      leistungVon: f(b.von, q(id, 1, "Kopf, Leistungszeitraum")),
      leistungBis: f(b.bis, q(id, 1, "Kopf, Leistungszeitraum")),
      unterschriftAN: f(true, q(id, 1, "Unterschrift Auftragnehmer")),
      unterschriftAG: f(true, q(id, 1, "Unterschrift Auftraggeber")),
      zeilen,
    };
  });

  // Regie
  const regieBetrag = (r: RbDef) => stundenBetrag(r.m, def.regiesatzMonteur) + stundenBetrag(r.h, def.regiesatzHelfer) + r.material;
  const regie: Regiebericht[] = def.regie.map((r) => {
    const id = `rb-${r.nr.slice(3)}`;
    dok(id, "regie", `${k}_${r.nr}_${r.datum}.pdf`, r.datum);
    const qr = (stelle: string) => q(id, 1, stelle);
    return {
      nr: f(r.nr, qr("Berichtsnummer")),
      dokumentId: id,
      datum: f(r.datum, qr("Datum")),
      taetigkeit: f(r.text, qr("Tätigkeit")),
      stundenMonteur: f(r.m, qr("Stunden Monteur")),
      stundenHelfer: f(r.h, qr("Stunden Helfer")),
      material: f(r.material, qr("Material")),
      unterschriftAG: f(r.unterschrieben, qr("Unterschrift Auftraggeber")),
    };
  });
  const rbDef = new Map(def.regie.map((r) => [r.nr, r] as const));
  const regieZeile = (id: string, nr: string): RechnungsZeile => {
    const r = rbDef.get(nr);
    if (!r) throw new Error(`${k}: Regiebericht ${nr} fehlt`);
    return { typ: "regie", regieNr: f(nr, q(id, 2, `Regie ${nr}`)), betrag: f(regieBetrag(r), q(id, 2, `Regie ${nr}`)) };
  };
  const ep = new Map(positionen.map((p) => [p.nr, p.ep] as const));
  const lvZeile = (id: string, nr: string, menge: number): RechnungsZeile => {
    const qz = q(id, 1, `Pos. ${nr}`);
    return { typ: "lv", positionNr: f(nr, qz), menge: f(menge, qz), ep: f(ep.get(nr)!, qz), betrag: f(betragAusMenge(menge, ep.get(nr)!), qz) };
  };
  const summe = (zeilen: RechnungsZeile[]) => zeilen.reduce((s, z) => s + z.betrag.wert, 0);

  // Abschlagsrechnungen: verrechnet, was bis zum AR-Datum aufgemessen und noch offen ist
  const bisher = new Map<string, number>();
  const abschlaege: Rechnung[] = def.abschlaege.map((ar) => {
    const id = `ar-${ar.nr.slice(2)}`;
    dok(id, "abschlag", `${k}_${ar.nr}.pdf`, ar.datum, 2);
    const aufgemessen = new Map<string, number>();
    for (const b of def.blaetter.filter((x) => x.datum <= ar.datum))
      for (const [nr, m] of Object.entries(b.zeilen)) aufgemessen.set(nr, (aufgemessen.get(nr) ?? 0) + m);
    const zeilen: RechnungsZeile[] = [];
    for (const p of positionen) {
      const menge = ar.arMenge?.[p.nr] ?? (aufgemessen.get(p.nr) ?? 0) - (bisher.get(p.nr) ?? 0);
      if (menge <= 0) continue;
      bisher.set(p.nr, (bisher.get(p.nr) ?? 0) + menge);
      zeilen.push(lvZeile(id, p.nr, menge));
    }
    for (const nr of ar.regie) zeilen.push(regieZeile(id, nr));
    return { nr: f(ar.nr, q(id, 1, "Kopf")), dokumentId: id, art: "abschlag", datum: f(ar.datum, q(id, 1, "Kopf")), zeilen, summe: f(summe(zeilen), q(id, 2, "Summe")) };
  });

  // Zahlungen: volle AR-Summe nach Zahlungsziel, nur wenn das vor dem Stichtag liegt
  const zahlungen: Zahlung[] = abschlaege
    .filter((ar) => plusTage(ar.datum.wert, ZAHLUNGSZIEL_TAGE) <= def.stichtag)
    .map((ar) => {
      const datum = plusTage(ar.datum.wert, ZAHLUNGSZIEL_TAGE);
      const id = dok(`zahlung-${ar.nr.wert.toLowerCase()}`, "zahlung", `${k}_Zahlungsavis_${ar.nr.wert}.pdf`, datum);
      return { dokumentId: id, rechnungNr: f(ar.nr.wert, q(id, 1, "Bezug")), datum: f(datum, q(id, 1, "Datum")), betrag: f(ar.summe.wert, q(id, 1, "Zahlbetrag")) };
    });

  // Entwurf der Schlussrechnung: alles wie aufgemessen, außer ausdrücklich abweichenden Mengen
  let entwurf: Rechnung | null = null;
  if (def.entwurf) {
    const e = def.entwurf;
    const id = dok("sr-entwurf", "sr_entwurf", `${k}_Schlussrechnung_Entwurf_PL.xlsx`, e.datum, 3);
    const gesamt = new Map<string, number>();
    for (const b of def.blaetter) for (const [nr, m] of Object.entries(b.zeilen)) gesamt.set(nr, (gesamt.get(nr) ?? 0) + m);
    const zeilen: RechnungsZeile[] = [];
    for (const p of positionen) {
      const menge = e.menge?.[p.nr] ?? gesamt.get(p.nr) ?? 0;
      if (menge > 0) zeilen.push(lvZeile(id, p.nr, menge));
    }
    for (const nr of e.regie) zeilen.push(regieZeile(id, nr));
    entwurf = { nr: f("SR-Entwurf", q(id, 1, "Kopf")), dokumentId: id, art: "schluss_entwurf", datum: f(e.datum, q(id, 1, "Kopf")), zeilen, summe: f(summe(zeilen), q(id, 3, "Summe Leistung")) };
  }

  const qv = (stelle: string) => q("vertrag", 1, stelle);
  return {
    projekt: def.projekt,
    vertrag: {
      datum: f(def.vertragDatum, qv("Kopf")),
      norm: f("ÖNORM B 2110", qv("Pkt. 1.2")),
      auftragssumme: f(def.auftragssumme, qv("Pkt. 2.1")),
      regiesatzMonteur: f(def.regiesatzMonteur, qv("Pkt. 6.3")),
      regiesatzHelfer: f(def.regiesatzHelfer, qv("Pkt. 6.3")),
      mittellohnpreis: f(def.mittellohnpreis, qv("Kalkulation K3")),
      saetze: [],
      preisgleitung: null,
      pauschalen: [],
    },
    dokumente,
    lv,
    aufmass,
    regie,
    stundenlisten: [],
    abschlaege,
    entwurf,
    zahlungen,
    plaene: [],
    mails: [],
    fotos: [],
    indexblatt: null,
    guAbzug: null,
    korrekturblaetter: [],
    nachtraege: [],
    zurufe: [],
  };
}
