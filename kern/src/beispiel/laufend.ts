// P2 Bürohaus Kiefernau and P3 Volksschule Ahornbrunn, both "in Ausführung" (docs/Demo_Faelle.md, all fictitious).
// Small but complete: a short Leistungsverzeichnis, Aufmaßblätter, Regieberichte and two Abschlagsrechnungen each.
// The generator sets the quantities on the Aufmaßblätter so that the Abschlagsrechnungen total what the list says;
// the finds of the "Lauf je Abschlagsrechnung" are found by the core.

import { betragAusMenge } from "../geld";
import type { AbzugArt, Aufmassblatt, Datensatz, Hundertstel, Projekt, Rechnung, RechnungsZeile, Regiebericht, WhatsAppMeldung } from "../modell";
import { f, leistungsverzeichnis, loese, lvZeile, Ordner, q, regieBetrag, regieZeile, schrittFuer, summeZeilen, zufall, type LvPosition, type Variable } from "./bauen";
import { basisFuer, EIN, positionenAusKatalog, type Basis } from "./katalog";

interface RbDef {
  nr: string;
  datum: string;
  tage: string[];
  text: string;
  m: Hundertstel;
  h: Hundertstel;
  material: number;
  unterschriebenAm: string | null;
  ar: 1 | 2 | null;
  ausMeldung?: string;
}

interface BlattDef {
  nr: string;
  /** First day of the work the sheet measures. */
  von: string;
  datum: string;
  erfasst: string;
  titel: string;
  /** Abschlagsrechnung that invoices the sheet, or null for a sheet after the last one. */
  ar: 1 | 2 | null;
  /** The sheet carries only the quantities fixed by the solution list. */
  nurFest?: boolean;
}

interface ProjektDef {
  projekt: Projekt;
  seed: number;
  katalog: readonly Basis[];
  lvFest: Record<string, number>;
  auftragssumme: number;
  ausgleichZiel: number;
  vertragDatum: string;
  saetze: { art: AbzugArt; satz: number; punkt: string; phase: "abschlag" | "schluss" | "beide" }[];
  regieM: number;
  regieH: number;
  materialBp: number;
  unterschrift: string;
  /** Who signs Regieberichte as the Vertrag names it. */
  regieUnterschrift: string;
  angewiesen: string;
  blaetter: BlattDef[];
  /** Share of the quantity in the Leistungsverzeichnis that each position has on the sheets of each Abschlagsrechnung (and after). */
  anteil: { ar1: number; ar2: number; danach: number };
  /** Quantities fixed by the solution list: position → sheet → measured quantity. */
  festAufmass: Record<string, Record<string, Hundertstel>>;
  /** Quantities an Abschlagsrechnung invoices differently from the Aufmaß: position → AR → quantity. */
  festVerrechnet: Record<string, Partial<Record<1 | 2, Hundertstel>>>;
  /** Lump sums measured complete on a sheet. */
  pauschalAufBlatt: Record<string, string>;
  regie: RbDef[];
  abschlaege: { nr: 1 | 2; datum: string; summe: number }[];
  meldungen: WhatsAppMeldung[];
}

const AUSGLEICH = "22.01.01A";

function baue(def: ProjektDef): Datensatz {
  const k = def.projekt.kurz;
  const z = zufall(def.seed);
  const ordner = new Ordner(k);
  const pos: LvPosition[] = leistungsverzeichnis(positionenAusKatalog(def.katalog), def.lvFest, def.auftragssumme, AUSGLEICH, def.ausgleichZiel, z);
  const P = new Map(pos.map((p) => [p.kp.nr, p] as const));

  ordner.add("vertrag", "vertrag", `${k}_Bauvertrag.pdf`, def.vertragDatum, 14);
  ordner.add("lv", "leistungsverzeichnis", `${k}_Leistungsverzeichnis_HKLS.pdf`, def.vertragDatum, 8);
  const positionen = pos.map((p, i) => {
    const ql = (stelle: string) => q("lv", 2 + Math.floor(i / 8), `Pos. ${p.kp.nr}, ${stelle}`);
    return { nr: f(p.kp.nr, ql("Positionsnummer")), kurztext: f(p.kp.kurztext, ql("Kurztext")), einheit: f(p.kp.einheit, ql("Einheit")), menge: f(p.lv, ql("Menge")), ep: f(p.ep, ql("Einheitspreis")) };
  });

  const regie: Regiebericht[] = def.regie.map((r) => {
    const id = ordner.add(`rb-${r.nr}`, "regiebericht", `${k}_Regiebericht_${r.nr.padStart(2, "0")}.pdf`, r.datum);
    const qr = (stelle: string) => q(id, 1, stelle);
    return {
      nr: r.nr,
      belegId: id,
      datum: f(r.datum, qr("Kopf, Datum")),
      arbeitstage: f(r.tage, qr("Arbeitstage")),
      taetigkeit: f(r.text, qr("Tätigkeit")),
      angewiesenVon: f(def.angewiesen, qr("Angeordnet von")),
      stundenMonteur: f(r.m, qr("Stunden Monteur")),
      stundenHelfer: f(r.h, qr("Stunden Helfer")),
      material: f(r.material, qr("Material zum Einstandspreis")),
      unterschrieben: f(r.unterschriebenAm !== null, qr(`Unterschrift ${def.unterschrift}`)),
      unterschriebenAm: r.unterschriebenAm ? f(r.unterschriebenAm, qr(`Unterschrift ${def.unterschrift}, Datum`)) : null,
      ausMeldung: r.ausMeldung ? f(r.ausMeldung, qr("aus WhatsApp-Meldung")) : null,
    };
  });
  const rbBetrag = (r: RbDef) => regieBetrag(r, def.regieM, def.regieH, def.materialBp);

  // Each position lies on one sheet per Abschlagsrechnung, in turn, so that every AR has one line per position.
  const frei = pos.filter((p) => p.kp.einheit !== "psch" && !def.festAufmass[p.kp.nr]);
  const blattFuer = (ar: 1 | 2 | null, i: number) => {
    const blaetter = def.blaetter.filter((b) => b.ar === ar && !b.nurFest);
    return blaetter[i % blaetter.length].nr;
  };
  const geplant = new Map<string, Map<string, Hundertstel>>(def.blaetter.map((b) => [b.nr, new Map()]));
  frei.forEach((p, i) => {
    for (const [ar, anteil] of [[1, def.anteil.ar1], [2, def.anteil.ar2], [null, def.anteil.danach]] as const) {
      const schritt = schrittFuer(p.kp.einheit);
      const menge = Math.floor((p.lv * anteil) / 100 / schritt) * schritt;
      if (menge > 0) geplant.get(blattFuer(ar, i))!.set(p.kp.nr, menge);
    }
  });
  for (const [nr, jeBlatt] of Object.entries(def.festAufmass)) for (const [blatt, menge] of Object.entries(jeBlatt)) geplant.get(blatt)!.set(nr, menge);
  for (const [nr, blatt] of Object.entries(def.pauschalAufBlatt)) geplant.get(blatt)!.set(nr, 100);

  // Measured quantities on the sheets of each Abschlagsrechnung so that it totals the amount of the list
  for (const ar of def.abschlaege) {
    const blaetter = def.blaetter.filter((b) => b.ar === ar.nr).map((b) => b.nr);
    const fest =
      def.regie.filter((r) => r.ar === ar.nr).reduce((s, r) => s + rbBetrag(r), 0) +
      (ar.nr === 1 ? P.get(AUSGLEICH)!.ep : 0) +
      Object.entries(def.festVerrechnet).reduce((s, [nr, jeAr]) => s + (jeAr[ar.nr] ? betragAusMenge(jeAr[ar.nr]!, P.get(nr)!.ep) : 0), 0) +
      Object.entries(def.pauschalAufBlatt).reduce((s, [nr, blatt]) => s + (blaetter.includes(blatt) ? P.get(nr)!.ep : 0), 0);
    const vars: Variable[] = [];
    for (const blatt of blaetter)
      for (const [nr, menge] of geplant.get(blatt)!)
        if (!def.festVerrechnet[nr] && !def.pauschalAufBlatt[nr]) vars.push({ key: `${blatt}|${nr}`, ep: P.get(nr)!.ep, lo: Math.floor((menge * 6) / 10), hi: menge, schritt: schrittFuer(P.get(nr)!.kp.einheit) });
    const fein = vars.filter((v) => v.schritt === 1).slice(-2);
    const loesung = loese(ar.summe, fest, [...vars.filter((v) => !fein.includes(v)), ...fein], "hi");
    for (const [key, menge] of loesung) {
      const [blatt, nr] = key.split("|");
      geplant.get(blatt)!.set(nr, menge);
    }
  }

  const aufmass: Aufmassblatt[] = def.blaetter.map((b) => {
    const id = ordner.add(`ab-${b.nr}`, "aufmassblatt", `${k}_Aufmassblatt_${b.nr.padStart(2, "0")}.pdf`, b.erfasst);
    const zeilen = pos
      .filter((p) => geplant.get(b.nr)!.has(p.kp.nr))
      .map((p, i) => {
        const qa = q(id, 1 + Math.floor(i / 24), `Zeile ${p.kp.nr}`);
        return { positionNr: f(p.kp.nr, qa), menge: f(geplant.get(b.nr)!.get(p.kp.nr)!, qa), ort: f(b.titel, qa) };
      });
    return {
      nr: b.nr,
      belegId: id,
      datum: f(b.datum, q(id, 1, "Kopf, Datum")),
      leistungVon: f(b.von, q(id, 1, "Kopf, Leistungszeitraum")),
      leistungBis: f(b.datum, q(id, 1, "Kopf, Leistungszeitraum")),
      gegengezeichnet: f(true, q(id, 2, `Unterschrift ${def.unterschrift}`)),
      gegengezeichnetAm: f(b.erfasst, q(id, 2, `Unterschrift ${def.unterschrift}, Datum`)),
      erfasstAm: f(b.erfasst, q(id, 1, "AVA, erfasst am")),
      grundlageBelegId: null,
      zeilen,
    };
  });

  const abschlaege: Rechnung[] = def.abschlaege.map((ar) => {
    const id = ordner.add(`ar-${ar.nr}`, "abschlagsrechnung", `${k}_Abschlagsrechnung_${ar.nr}.pdf`, ar.datum, 3);
    const menge = new Map<string, Hundertstel>();
    if (ar.nr === 1) menge.set(AUSGLEICH, 100);
    for (const b of def.blaetter.filter((x) => x.ar === ar.nr)) for (const [nr, m] of geplant.get(b.nr)!) menge.set(nr, (menge.get(nr) ?? 0) + m);
    for (const [nr, jeAr] of Object.entries(def.festVerrechnet)) {
      if (jeAr[ar.nr]) menge.set(nr, jeAr[ar.nr]!);
      else menge.delete(nr);
    }
    const zeilen: RechnungsZeile[] = pos.filter((p) => menge.has(p.kp.nr)).map((p) => lvZeile(id, 2, p.kp.nr, menge.get(p.kp.nr)!, p.ep));
    for (const r of def.regie.filter((x) => x.ar === ar.nr)) zeilen.push(regieZeile(id, 3, regie.find((x) => x.nr === r.nr)!, rbBetrag(r)));
    const summe = summeZeilen(zeilen);
    if (summe !== ar.summe) throw new Error(`${k} Abschlagsrechnung ${ar.nr}: ${summe} statt ${ar.summe}`);
    return { nr: f(`Abschlagsrechnung ${ar.nr}`, q(id, 1, "Kopf")), belegId: id, art: "abschlag", datum: f(ar.datum, q(id, 1, "Kopf, Datum")), zeilen, summe: f(summe, q(id, 3, "Summe netto")) };
  });

  const qv = (stelle: string, seite = 3) => q("vertrag", seite, stelle);
  return {
    projekt: def.projekt,
    vertrag: {
      belegId: "vertrag",
      datum: f(def.vertragDatum, qv("Kopf, Datum", 1)),
      norm: f("ÖNORM B 2110", qv("Punkt 1.2", 1)),
      vertragsart: f("Einheitspreisvertrag", qv("Punkt 2.1", 1)),
      auftragssumme: f(def.auftragssumme, qv("Punkt 2.2", 1)),
      saetze: def.saetze.map((s) => ({ art: s.art, satz: f(s.satz, qv(`Punkt ${s.punkt}`)), punkt: s.punkt, phase: s.phase, ...(s.art === "haftruecklass" ? { durchBankgarantieErsetzbar: true } : {}) })),
      regiesatzMonteur: f(def.regieM, qv("Punkt 6.3", 6)),
      regiesatzHelfer: f(def.regieH, qv("Punkt 6.3", 6)),
      regiePunkt: "6.3",
      regiematerialZuschlag: f(def.materialBp, qv("Punkt 6.4", 6)),
      regiematerialPunkt: "6.4",
      regieUnterschrift: f(def.regieUnterschrift, qv("Punkt 6.2", 6)),
      preise: { art: "fest", punkt: "7.1", text: f("Festpreise bis Bauende", qv("Punkt 7.1", 7)) },
      pauschalen: [{ kategorie: "baustelleneinrichtung", punkt: "4.3", text: f("Die Baustelleneinrichtung wird pauschal vergütet.", qv("Punkt 4.3")) }],
      schlussrechnungLegenBis: null,
    },
    preisbasis: null,
    belege: ordner.belege,
    positionen,
    aufmass,
    regie,
    stundenzettel: [],
    abschlaege,
    entwurf: null,
    schlussrechnung: null,
    zahlungen: [],
    korrekturblaetter: [],
    abzugsschreiben: null,
    nachtraege: [],
    plaene: [],
    emails: [],
    fotos: [],
    fotodokumentationen: [],
    grosshaendlerrechnungen: [],
    indexblatt: null,
    meldungen: def.meldungen,
  };
}

// ---------- P2 Bürohaus Kiefernau (Hornfeld Bau) ----------

const h = basisFuer("22");
const s = basisFuer("24");
const l = basisFuer("26");
const m = basisFuer("28");

const KATALOG_KIEFERNAU: readonly Basis[] = [
  h("01.01", "Baustelleneinrichtung und Baustellengemeinkosten HKLS, pauschal", "psch", EIN, 0, 0, [1, 1]),
  h("01.02", "Luft-Wasser-Wärmepumpe 120 kW, Lieferung und Montage", "psch", EIN, 8_640_000, 0, [1, 1]),
  h("01.03", "Pufferspeicher 1.500 l mit Dämmung", "Stk", EIN, 312_000, 0, [2, 2]),
  h("01.04", "Hocheffizienz-Umwälzpumpe {v}", "Stk", ["DN 32", "DN 40"], 91_000, 22_600, [2, 4]),
  h("02.01", "Stahlrohr nahtlos {v}, inkl. Befestigung", "m", ["DN 32", "DN 40", "DN 50", "DN 65"], 4_070, 920, [80, 220]),
  h("03.08", "Mehrschichtverbundrohr 26 × 3,0 inkl. Formteile, Heizung", "m", EIN, 2_160, 0, [880, 880]),
  h("03.09", "Mehrschichtverbundrohr {v} inkl. Formteile, Heizung", "m", ["16 × 2,0", "20 × 2,25"], 1_390, 230, [600, 1400]),
  h("04.01", "Kühl- und Heizdecke Metallkassette 625/625", "m²", EIN, 18_600, 0, [900, 1400]),
  h("05.01", "Raumregelventil mit Stellantrieb {v}", "Stk", ["DN 15", "DN 20"], 21_400, 3_600, [60, 120]),
  h("06.01", "Rohrdämmung 13 mm für Rohr {v}", "m", ["18 mm", "22 mm", "28 mm"], 880, 70, [300, 900]),
  s("01.01", "Schallgedämmtes Abwasserrohr {v} inkl. Formteile", "m", ["DN 75", "DN 110"], 3_200, 640, [120, 360]),
  s("02.01", "Mehrschichtverbundrohr {v} inkl. Formteile und Dämmung, Trinkwasser", "m", ["16 × 2,25", "20 × 2,25", "26 × 3,0"], 1_640, 340, [200, 700]),
  s("02.02", "Edelstahlrohr Trinkwasser {v} inkl. Pressfittings", "m", ["28 × 1,2", "35 × 1,5"], 3_180, 480, [80, 240]),
  s("03.01", "WC wandhängend spülrandlos, mit Sitz", "Stk", EIN, 29_600, 0, [24, 36]),
  s("03.02", "Waschtisch Keramik 60 cm", "Stk", EIN, 19_900, 0, [24, 36]),
  s("03.03", "Teeküche Anschluss Spüle und Geschirrspüler", "Stk", EIN, 18_400, 0, [6, 8]),
  s("04.01", "Montageelement WC mit UP-Spülkasten", "Stk", EIN, 25_600, 0, [24, 36]),
  s("05.01", "Waschtisch-Einhebelmischer, verchromt", "Stk", EIN, 11_640, 0, [24, 36]),
  s("09.01", "Trinkwassererwärmer Frischwasserstation zentral", "Stk", EIN, 712_000, 0, [1, 1]),
  l("01.01", "Lüftungsgerät Büro mit Wärmerückgewinnung 9.000 m³/h, Lieferung und Montage", "psch", EIN, 9_480_000, 0, [1, 1]),
  l("02.01", "Luftleitung rechteckig verzinkt, Blechstärke 0,8 mm", "m²", EIN, 5_680, 0, [600, 1100]),
  l("03.01", "Wickelfalzrohr {v} inkl. Formteile", "m", ["DN 125", "DN 160", "DN 200"], 2_320, 900, [200, 500]),
  l("05.01", "Brandschutzklappe EI 90 rund {v}", "Stk", ["DN 160", "DN 200"], 34_400, 4_800, [16, 40]),
  l("06.01", "Drallauslass Decke {v}", "Stk", ["DN 160", "DN 200"], 14_600, 2_400, [80, 160]),
  l("06.02", "Volumenstromregler variabel {v}", "Stk", ["DN 160", "DN 200"], 38_400, 4_200, [30, 60]),
  m("01.01", "DDC-Unterstation Heizung, Kühlung und Lüftung, Lieferung, Programmierung und Montage", "psch", EIN, 3_240_000, 0, [1, 1]),
  m("02.01", "Raumbediengerät Temperatur und CO₂", "Stk", EIN, 26_400, 0, [60, 120]),
  m("04.01", "Steuerleitung J-Y(St)Y 2 × 2 × 0,8", "m", EIN, 220, 0, [2000, 4000]),
];

const KIEFERNAU: ProjektDef = {
  projekt: {
    id: "p2",
    kurz: "P2",
    name: "Bürohaus Kiefernau",
    langname: "Bürohaus Kiefernau, Neubau, HKLS",
    auftraggeberId: "hornfeld",
    stufe: "in_ausfuehrung",
    schlussrechnungLegenBis: null,
    schlussrechnungGelegt: null,
    schlusszahlung: null,
    bauzeit: { von: "2026-04-20", bis: "2027-03-31" },
  },
  seed: 20_260_318,
  katalog: KATALOG_KIEFERNAU,
  lvFest: { "22.03.08A": 880 },
  auftragssumme: 61_240_000,
  ausgleichZiel: 980_000,
  vertragDatum: "2026-03-18",
  saetze: [
    { art: "nachlass", satz: 300, punkt: "5.1", phase: "beide" },
    { art: "baustrom_bauwasser", satz: 60, punkt: "4.6", phase: "beide" },
    { art: "deckungsruecklass", satz: 500, punkt: "9.1", phase: "abschlag" },
    { art: "haftruecklass", satz: 300, punkt: "9.2", phase: "schluss" },
  ],
  regieM: 6_480,
  regieH: 5_420,
  materialBp: 1_500,
  unterschrift: "Polier Hornfeld Bau",
  regieUnterschrift: "Polier",
  angewiesen: "Bauleitung Hornfeld Bau",
  blaetter: [
    { nr: "1", von: "2026-04-20", datum: "2026-05-22", erfasst: "2026-05-26", titel: "Heizung und Sanitär Untergeschoß", ar: 1 },
    { nr: "2", von: "2026-05-26", datum: "2026-06-26", erfasst: "2026-06-30", titel: "Steigleitungen und Technikzentrale", ar: 1 },
    { nr: "3", von: "2026-06-29", datum: "2026-07-24", erfasst: "2026-07-28", titel: "Erdgeschoß und 1. Obergeschoß", ar: 1 },
    { nr: "4", von: "2026-07-27", datum: "2026-08-21", erfasst: "2026-08-25", titel: "2. Obergeschoß, Lüftungszentrale", ar: 2 },
    { nr: "5", von: "2026-07-27", datum: "2026-08-28", erfasst: "2026-09-01", titel: "3. Obergeschoß, Heizung und Kühlung", ar: 2 },
    { nr: "6", von: "2026-08-31", datum: "2026-10-12", erfasst: "2026-10-14", titel: "4. Obergeschoß", ar: null },
  ],
  anteil: { ar1: 20, ar2: 34, danach: 10 },
  festAufmass: { "22.03.08A": { "3": 30_000, "5": 46_000, "6": 6_000 } },
  festVerrechnet: { "22.03.08A": { 1: 30_000, 2: 31_000 } },
  pauschalAufBlatt: { "26.01.01A": "4", "22.01.02A": "2" },
  regie: [
    { nr: "1", datum: "2026-05-13", tage: ["2026-05-13"], text: "Provisorische Wasserversorgung Baustelle", m: 400, h: 0, material: 4_620, unterschriebenAm: "2026-05-13", ar: 1 },
    { nr: "2", datum: "2026-06-10", tage: ["2026-06-10"], text: "Leitungen umverlegt wegen Kollision mit der Elektrotrasse", m: 300, h: 300, material: 2_840, unterschriebenAm: "2026-06-11", ar: 1 },
    { nr: "3", datum: "2026-07-08", tage: ["2026-07-08"], text: "Heizung provisorisch für den Estrich in Betrieb genommen", m: 500, h: 0, material: 6_480, unterschriebenAm: "2026-07-09", ar: 1 },
    { nr: "4", datum: "2026-08-27", tage: ["2026-08-27"], text: "Provisorische Wasserversorgung für den Estrichleger", m: 800, h: 0, material: 24_800, unterschriebenAm: "2026-08-28", ar: null },
    { nr: "5", datum: "2026-09-16", tage: ["2026-09-16"], text: "Druckprobe nach Beschädigung durch Fremdgewerk wiederholt", m: 300, h: 0, material: 1_260, unterschriebenAm: "2026-09-17", ar: 2 },
    { nr: "6", datum: "2026-10-01", tage: ["2026-09-24"], text: "Teeküche 2. OG, Spüle und Geschirrspüleranschluss verlegt", m: 500, h: 500, material: 18_620, unterschriebenAm: "2026-10-02", ar: null, ausMeldung: "P2-W1" },
    { nr: "7", datum: "2026-10-09", tage: ["2026-10-08"], text: "Zusätzliche Entleerung Heizung 3. OG", m: 300, h: 300, material: 2_240, unterschriebenAm: "2026-10-09", ar: null },
  ],
  abschlaege: [
    { nr: 1, datum: "2026-07-31", summe: 14_830_000 },
    { nr: 2, datum: "2026-09-30", summe: 19_680_000 },
  ],
  meldungen: [
    {
      id: "p2-w1",
      nr: "P2-W1",
      zeitpunkt: "2026-09-24T10:40",
      absender: "Monteur, Trupp 3",
      transkript: f("Teeküche zweiter Stock: Spüle und Geschirrspüler auf die andere Seite verlegt, die Bauleitung von Hornfeld hat es angeordnet. Zwei Mann, je fünf Stunden.", q("p2-w1", 1, "Transkript")),
      foto: "p2-w1.jpg",
      ort: f("2. Obergeschoß, Teeküche", q("p2-w1", 1, "Ort")),
      taetigkeit: f("Spüle und Geschirrspüleranschluss verlegt", q("p2-w1", 1, "Tätigkeit")),
      angewiesenVon: f("Bauleitung Hornfeld Bau", q("p2-w1", 1, "Angeordnet von")),
      stundenMonteur: f(500, q("p2-w1", 1, "Stunden")),
      stundenHelfer: f(500, q("p2-w1", 1, "Stunden")),
      bezugPositionen: f([], q("p2-w1", 1, "Bezug")),
      bezugRegiebericht: null,
      bestaetigt: { rolle: "Monteur, Trupp 3", zeitpunkt: "2026-09-24T10:42" },
    },
  ],
};

// ---------- P3 Volksschule Ahornbrunn (Marktgemeinde Ahornbrunn) ----------

const KATALOG_AHORNBRUNN: readonly Basis[] = [
  h("01.01", "Baustelleneinrichtung und Baustellengemeinkosten HKLS, pauschal", "psch", EIN, 0, 0, [1, 1]),
  h("01.02", "Gas-Brennwertkessel 140 kW mit Kaskade, Lieferung und Montage", "psch", EIN, 4_860_000, 0, [1, 1]),
  h("01.03", "Heizungsverteiler mit Dämmschale, 6 Abgänge", "Stk", EIN, 172_000, 0, [1, 1]),
  h("02.01", "Stahlrohr nahtlos {v}, inkl. Befestigung", "m", ["DN 25", "DN 32", "DN 40", "DN 50"], 3_460, 720, [80, 260]),
  h("04.01", "Plattenheizkörper Typ 22 VK, 600/{v}", "Stk", ["1000", "1400"], 30_200, 7_800, [20, 46]),
  h("05.01", "Thermostatkopf, Behördenmodell", "Stk", EIN, 3_640, 0, [60, 90]),
  h("06.01", "Rohrdämmung 20 mm für Rohr {v}", "m", ["28 mm", "35 mm", "42 mm"], 1_340, 200, [200, 600]),
  h("07.04", "Fußbodenheizung Noppensystemplatte inkl. Heizrohr", "m²", EIN, 3_860, 0, [420, 420]),
  h("07.05", "Fußbodenheizung Verteiler mit Stellantrieben {v}", "Stk", ["6 Kreise", "10 Kreise"], 98_600, 31_400, [2, 4]),
  s("01.01", "Schallgedämmtes Abwasserrohr {v} inkl. Formteile", "m", ["DN 75", "DN 110"], 3_200, 640, [120, 300]),
  s("02.01", "Edelstahlrohr Trinkwasser {v} inkl. Pressfittings", "m", ["22 × 1,2", "28 × 1,2", "35 × 1,5"], 2_700, 480, [120, 360]),
  s("03.01", "WC wandhängend Kinderhöhe, mit Sitz", "Stk", EIN, 34_800, 0, [18, 28]),
  s("03.02", "Waschrinne Edelstahl {v}", "Stk", ["3 Plätze", "4 Plätze"], 186_000, 42_000, [4, 8]),
  s("04.01", "Montageelement WC Kinderhöhe mit UP-Spülkasten", "Stk", EIN, 27_200, 0, [18, 28]),
  s("05.01", "Selbstschlussarmatur berührungslos", "Stk", EIN, 41_600, 0, [24, 40]),
  s("07.01", "Trinkwassererwärmer 500 l mit thermischer Desinfektion", "Stk", EIN, 640_000, 0, [1, 1]),
  l("01.01", "Lüftungsgerät Klassen mit Wärmerückgewinnung 6.000 m³/h, Lieferung und Montage", "psch", EIN, 6_920_000, 0, [1, 1]),
  l("02.01", "Luftleitung rechteckig verzinkt, Blechstärke 0,8 mm", "m²", EIN, 5_680, 0, [400, 800]),
  l("03.01", "Wickelfalzrohr {v} inkl. Formteile", "m", ["DN 160", "DN 200", "DN 250"], 3_180, 940, [120, 360]),
  l("05.01", "Brandschutzklappe EI 90 rund {v}", "Stk", ["DN 200", "DN 250"], 39_200, 4_800, [10, 24]),
  l("06.01", "Weitwurfdüse Turnsaal {v}", "Stk", ["DN 200", "DN 250"], 21_400, 3_600, [6, 12]),
  m("01.01", "DDC-Unterstation Heizung und Lüftung, Lieferung, Programmierung und Montage", "psch", EIN, 2_480_000, 0, [1, 1]),
  m("02.01", "CO₂-Fühler Klassenraum", "Stk", EIN, 28_600, 0, [12, 20]),
];

const AHORNBRUNN: ProjektDef = {
  projekt: {
    id: "p3",
    kurz: "P3",
    name: "Volksschule Ahornbrunn",
    langname: "Volksschule Ahornbrunn, Zubau und Sanierung, HKLS",
    auftraggeberId: "ahornbrunn",
    stufe: "in_ausfuehrung",
    schlussrechnungLegenBis: null,
    schlussrechnungGelegt: null,
    schlusszahlung: null,
    bauzeit: { von: "2026-05-04", bis: "2026-12-18" },
  },
  seed: 20_260_409,
  katalog: KATALOG_AHORNBRUNN,
  lvFest: { "22.07.04A": 420 },
  auftragssumme: 53_860_000,
  ausgleichZiel: 860_000,
  vertragDatum: "2026-04-09",
  saetze: [
    { art: "deckungsruecklass", satz: 500, punkt: "9.1", phase: "abschlag" },
    { art: "haftruecklass", satz: 300, punkt: "9.2", phase: "schluss" },
  ],
  regieM: 6_140,
  regieH: 5_120,
  materialBp: 1_000,
  unterschrift: "örtliche Bauaufsicht Marktgemeinde Ahornbrunn",
  regieUnterschrift: "örtliche Bauaufsicht",
  angewiesen: "örtliche Bauaufsicht Marktgemeinde Ahornbrunn",
  blaetter: [
    { nr: "1", von: "2026-05-04", datum: "2026-06-19", erfasst: "2026-06-23", titel: "Zubau Untergeschoß und Technik", ar: 1 },
    { nr: "2", von: "2026-06-22", datum: "2026-08-21", erfasst: "2026-08-25", titel: "Zubau Erdgeschoß und Altbau Sanierung", ar: 2 },
    { nr: "3", von: "2026-07-13", datum: "2026-09-04", erfasst: "2026-09-08", titel: "Fußbodenheizung Zubau", ar: 2, nurFest: true },
  ],
  anteil: { ar1: 34, ar2: 46, danach: 0 },
  festAufmass: { "22.07.04A": { "3": 46_800 } },
  festVerrechnet: { "22.07.04A": { 2: 42_000 } },
  pauschalAufBlatt: { "22.01.02A": "2" },
  regie: [
    { nr: "1", datum: "2026-05-20", tage: ["2026-05-20"], text: "Provisorische Wasserversorgung Zubau", m: 400, h: 0, material: 3_800, unterschriebenAm: "2026-05-20", ar: 1 },
    { nr: "2", datum: "2026-06-17", tage: ["2026-06-17"], text: "Heizungsleitung im Altbau für den Elektriker umgelegt", m: 300, h: 300, material: 2_160, unterschriebenAm: "2026-06-18", ar: 1 },
    { nr: "3", datum: "2026-07-22", tage: ["2026-07-22"], text: "Trinkwasser im Altbau während der Ferien abgesperrt, Provisorium für den Hort", m: 1_000, h: 1_000, material: 16_480, unterschriebenAm: "2026-07-23", ar: null },
    { nr: "4", datum: "2026-08-26", tage: ["2026-08-26"], text: "Druckprobe Altbau wiederholt", m: 300, h: 0, material: 980, unterschriebenAm: "2026-08-27", ar: 2 },
    { nr: "5", datum: "2026-09-09", tage: ["2026-09-09"], text: "Trinkwasserleitungen im Altbau nach Hygienebefund gespült", m: 400, h: 0, material: 0, unterschriebenAm: null, ar: null },
    { nr: "6", datum: "2026-10-07", tage: ["2026-10-07"], text: "Heizkörper im Turnsaal versetzt", m: 400, h: 400, material: 3_000, unterschriebenAm: "2026-10-08", ar: null },
  ],
  abschlaege: [
    { nr: 1, datum: "2026-06-30", summe: 12_140_000 },
    { nr: 2, datum: "2026-09-30", summe: 16_390_000 },
  ],
  meldungen: [],
};

export const erzeugeKiefernau = () => baue(KIEFERNAU);
export const erzeugeAhornbrunn = () => baue(AHORNBRUNN);
