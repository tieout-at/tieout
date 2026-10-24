// P1 Wohnpark Mooshaim, 32 Wohnungen und Tiefgarage, HKLS (fully worked out in docs/Demo_Faelle.md; all fictitious).
// The generator sets the inputs of the solution list: contract sum, Entwurf, the three Abschlagsrechnungen, every
// Regiebericht, Aufmaßblatt, e-mail, photo, plan and WhatsApp-Meldung. It calculates only to hit those inputs; the
// finds, the Vorprüfung and the Rechnungsabschluss are found by the core.

import { betragAusMenge, stundenBetrag } from "../geld";
import type {
  Aufmassblatt,
  AufmassZeile,
  Datensatz,
  Email,
  Foto,
  Hundertstel,
  Plan,
  Position,
  Rechnung,
  RechnungsZeile,
  Regiebericht,
  WhatsAppMeldung,
  Zahlung,
} from "../modell";
import { abrechnen, type Satz } from "../stufen";
import { f, korrigiert, leistungsverzeichnis, loese, lvZeile, Ordner, q, regieBetrag, regieZeile, schrittFuer, summeZeilen, teile, zufall, type Variable } from "./bauen";
import { positionenAusKatalog } from "./katalog";

const SEED = 20_260_202;

// ---------- Inputs from docs/Demo_Faelle.md (cents, hundredths) ----------
const AUFTRAGSSUMME = 74_682_000;
const ENTWURF_SUMME = 75_231_480;
const REGIE_MONTEUR = 6_480;
const REGIE_HELFER = 5_420;
const REGIEMATERIAL_BP = 1_500;
const Z01 = { nr: "Z-01", text: "Kernbohrungen DN 100", menge: 1_200, ep: 14_800 };
const ABSCHLAEGE = [
  { nr: 1, datum: "2026-03-31", summe: 16_840_000, bezahlt: "2026-04-30" },
  { nr: 2, datum: "2026-06-30", summe: 27_690_000, bezahlt: "2026-07-30" },
  { nr: 3, datum: "2026-09-30", summe: 24_160_000, bezahlt: "2026-10-21" },
] as const;
/** How Hornfeld Bau settles each Abschlagsrechnung (Vertrag 5.1 and 9.1, Abzugsschreiben of 16.02.2026). */
const SAETZE_ABSCHLAG: Satz[] = [
  { art: "nachlass", satz: 300 },
  { art: "baustrom_bauwasser", satz: 60 },
  { art: "bauschadensumlage", satz: 50 },
  { art: "deckungsruecklass", satz: 500 },
];

// Positions of the finds and of the invoiced plan change
const F1 = { "22.04.12B": 1_400, "22.05.03A": 1_400, "22.05.06A": 1_400, "22.03.02A": 12_600 } as const;
const F4 = { nr: "24.02.05A", mehr: 16_800 };
const F5 = { nr: "24.08.02A", mehr: 2_200 };
const PLAN_E = { nr: "26.03.05A", mehr: 3_800 };
/** Quantities in the Leistungsverzeichnis fixed by the solution list (whole units). */
const LV_FEST: Record<string, number> = {
  "22.04.10A": 18,
  "22.04.10B": 12,
  "22.04.12A": 20,
  "22.04.12B": 86,
  "22.04.14A": 32,
  "22.04.15A": 136,
  "22.05.03A": 168,
  "22.05.06A": 168,
  "22.03.02A": 1_512,
  "24.02.05A": 640,
  "24.08.02A": 120,
  "26.03.05A": 220,
};
const AUSGLEICH = "22.01.01A"; // Baustelleneinrichtung, pauschal (Vertragspunkt 4.3)
/** Lump sums done at the end, invoiced in the Entwurf without an Aufmaßblatt. */
const PAUSCHAL_AM_ENDE = ["22.01.09A", "22.08.01A", "22.08.02A", "22.08.03A", "22.08.04A", "22.08.05A", "24.08.07A", "24.08.08A", "24.08.09A", "26.08.01A", "26.08.02A", "26.08.03A", "26.08.04A", "28.01.03A", "28.05.01A"];

// ---------- Aufmaßblätter ----------
interface BlattDef {
  nr: string;
  datum: string;
  von: string;
  bis: string;
  titel: string;
  erfasst: string | null;
  gegengezeichnetAm: string | null;
}
const BLAETTER: BlattDef[] = [
  { nr: "1", datum: "2026-03-13", von: "2026-02-02", bis: "2026-03-12", titel: "Heizung Verteilleitungen Tiefgarage, Technikraum und Kompaktstation", erfasst: "2026-03-17", gegengezeichnetAm: "2026-03-16" },
  { nr: "2", datum: "2026-03-27", von: "2026-02-09", bis: "2026-03-26", titel: "Entwässerung, Grundleitungen und Technikraum Sanitär", erfasst: "2026-03-30", gegengezeichnetAm: "2026-03-30" },
  { nr: "3", datum: "2026-04-24", von: "2026-03-30", bis: "2026-04-23", titel: "Lüftung Tiefgarage, Luftleitungen 1. Abschnitt", erfasst: "2026-04-28", gegengezeichnetAm: "2026-04-27" },
  { nr: "4", datum: "2026-05-15", von: "2026-04-13", bis: "2026-05-13", titel: "Trinkwasser Steigleitungen und Verteilung Stiege 1", erfasst: "2026-05-19", gegengezeichnetAm: "2026-05-18" },
  { nr: "5", datum: "2026-05-29", von: "2026-04-20", bis: "2026-05-28", titel: "Heizung Steigleitungen und Wohnungsverteiler", erfasst: "2026-06-02", gegengezeichnetAm: "2026-06-01" },
  { nr: "6", datum: "2026-06-12", von: "2026-05-18", bis: "2026-06-11", titel: "Sanitär Vorwand, Montageelemente und Wohnungsstationen", erfasst: "2026-06-16", gegengezeichnetAm: "2026-06-15" },
  { nr: "7", datum: "2026-06-26", von: "2026-05-18", bis: "2026-06-25", titel: "Lüftung Tiefgarage nach Plan L-310 Index E, Lüftungsgerät", erfasst: "2026-06-29", gegengezeichnetAm: "2026-06-29" },
  { nr: "8", datum: "2026-07-17", von: "2026-06-15", bis: "2026-07-16", titel: "Heizkörper, Thermostatköpfe und Anschlussarmaturen, Stiege 1 und 2", erfasst: "2026-07-21", gegengezeichnetAm: "2026-07-20" },
  { nr: "9", datum: "2026-07-31", von: "2026-06-22", bis: "2026-07-30", titel: "Trinkwasser Wohnungen, Dämmung Heizung und Sanitär", erfasst: "2026-08-04", gegengezeichnetAm: "2026-08-03" },
  { nr: "10", datum: "2026-08-14", von: "2026-07-13", bis: "2026-08-13", titel: "Sanitär Fertigmontage, Brandschutz, Kernbohrungen, MSR", erfasst: "2026-08-19", gegengezeichnetAm: "2026-08-18" },
  { nr: "11", datum: "2026-08-28", von: "2026-08-03", bis: "2026-08-27", titel: "Trinkwasser Stiege 2, Nachaufmaß Mehrschichtverbundrohr", erfasst: null, gegengezeichnetAm: "2026-08-31" },
  { nr: "12", datum: "2026-09-18", von: "2026-04-20", bis: "2026-09-17", titel: "Wohnungstyp C, zusätzliche Heizkörper laut Plan H-201 Index D", erfasst: null, gegengezeichnetAm: null },
  { nr: "13", datum: "2026-09-24", von: "2026-06-15", bis: "2026-08-13", titel: "Brandschutzmanschetten laut Fotodokumentation Brandschutz", erfasst: "2026-10-20", gegengezeichnetAm: "2026-10-08" },
];

/** Which entered Aufmaßblätter carry a ULG ("LG.ULG"), with the share of the quantity on each. */
const BLATT_JE_ULG: Record<string, [string, number][]> = {
  "22.01": [["1", 1]],
  "22.02": [["1", 1]],
  "22.03": [["5", 2], ["8", 1]],
  "22.04": [["8", 1]],
  "22.05": [["5", 1], ["8", 2]],
  "22.06": [["9", 1]],
  "22.07": [["5", 1]],
  "24.01": [["2", 1]],
  "24.02": [["4", 1], ["9", 1]],
  "24.03": [["10", 1]],
  "24.04": [["6", 1]],
  "24.05": [["10", 1]],
  "24.06": [["9", 1]],
  "24.07": [["6", 1]],
  "24.08": [["2", 1], ["10", 1]],
  "24.09": [["2", 1]],
  "26.01": [["7", 1]],
  "26.02": [["3", 1]],
  "26.03": [["3", 1], ["7", 1]],
  "26.04": [["3", 1], ["7", 1]],
  "26.05": [["7", 1]],
  "26.06": [["10", 1]],
  "26.07": [["7", 1]],
  "26.09": [["10", 1]],
  "28.01": [["10", 1]],
  "28.02": [["10", 1]],
  "28.03": [["10", 1]],
  "28.04": [["10", 1]],
};
/** Positions measured on a fixed sheet, whatever their ULG. */
const BLATT_FEST: Record<string, string> = { "22.01.02A": "1", "22.06.04A": "1", "22.06.04B": "1", "22.06.04C": "1", "24.02.01A": "2", "24.02.01B": "2", "24.02.02A": "2", "24.02.03A": "2", "24.08.02A": "10", "24.08.01A": "2", "24.08.01B": "2", "24.08.01C": "2" };

// ---------- Regieberichte ----------
interface RbDef {
  nr: string;
  datum: string;
  tage: string[];
  text: string;
  angewiesen: string;
  m: Hundertstel;
  h: Hundertstel;
  material: number;
  unterschriebenAm: string | null;
  /** Abschlagsrechnung that invoices it, or null. */
  ar: 1 | 2 | 3 | null;
  /** Misread hours (Monteur), corrected on import. */
  gelesenM?: Hundertstel;
}
const REGIE: RbDef[] = [
  { nr: "1", datum: "2026-02-19", tage: ["2026-02-19"], text: "Provisorische Beheizung Rohbau Stiege 1", angewiesen: "Bauleitung Hornfeld Bau", m: 600, h: 0, material: 14_820, unterschriebenAm: "2026-02-20", ar: 1, gelesenM: 800 },
  { nr: "2", datum: "2026-03-05", tage: ["2026-03-05"], text: "Leitungen umverlegt wegen Deckendurchbruch Fremdgewerk", angewiesen: "Polier Hornfeld Bau", m: 400, h: 400, material: 3_680, unterschriebenAm: "2026-03-06", ar: 1, gelesenM: 900 },
  { nr: "3", datum: "2026-03-12", tage: ["2026-03-12"], text: "Baustellenwasser umgelegt", angewiesen: "Polier Hornfeld Bau", m: 800, h: 0, material: 8_400, unterschriebenAm: "2026-03-13", ar: 1 },
  { nr: "4", datum: "2026-04-16", tage: ["2026-04-16"], text: "Provisorische Beheizung Stiege 2 für den Estrich", angewiesen: "Bauleitung Hornfeld Bau", m: 600, h: 0, material: 12_450, unterschriebenAm: "2026-04-17", ar: 2, gelesenM: 800 },
  { nr: "5", datum: "2026-04-29", tage: ["2026-04-29"], text: "Rohrdurchführungen Tiefgarage nachgedichtet", angewiesen: "Polier Hornfeld Bau", m: 300, h: 300, material: 5_840, unterschriebenAm: "2026-04-30", ar: 2, gelesenM: 500 },
  { nr: "6", datum: "2026-05-20", tage: ["2026-05-20"], text: "Heizungsstrang nach Verschmutzung durch Fremdgewerk gespült", angewiesen: "Polier Hornfeld Bau", m: 400, h: 400, material: 1_860, unterschriebenAm: "2026-05-21", ar: 2, gelesenM: 900 },
  { nr: "7", datum: "2026-05-27", tage: ["2026-05-27"], text: "Leihheizgeräte für die Estrichtrocknung montiert", angewiesen: "Bauleitung Hornfeld Bau", m: 500, h: 0, material: 4_690, unterschriebenAm: "2026-05-28", ar: 2, gelesenM: 300 },
  { nr: "8", datum: "2026-05-29", tage: ["2026-05-29"], text: "Druckprobe nach Beschädigung durch Fremdgewerk wiederholt", angewiesen: "Polier Hornfeld Bau", m: 300, h: 0, material: 1_240, unterschriebenAm: "2026-05-29", ar: 2 },
  { nr: "9", datum: "2026-06-05", tage: ["2026-06-03", "2026-06-05"], text: "Heizungssteigleitung Stiege 2 umgelegt (Unterzug nicht im Plan)", angewiesen: "Bauleitung Hornfeld Bau", m: 1_200, h: 1_200, material: 31_260, unterschriebenAm: "2026-06-08", ar: null, gelesenM: 1_700 },
  { nr: "10", datum: "2026-06-19", tage: ["2026-06-19"], text: "Notabsperrung Strang Stiege 1 nach Wasseraustritt", angewiesen: "Polier Hornfeld Bau", m: 200, h: 0, material: 980, unterschriebenAm: "2026-06-19", ar: 2 },
  { nr: "11", datum: "2026-06-22", tage: ["2026-06-22"], text: "Bauwasseranschluss Stiege 2 rückgebaut", angewiesen: "Polier Hornfeld Bau", m: 400, h: 0, material: 2_230, unterschriebenAm: "2026-06-23", ar: 2 },
  { nr: "12", datum: "2026-06-24", tage: ["2026-06-24"], text: "Heizkörper Stiege 1 für den Maler abgenommen und wieder montiert, Strang entleert und befüllt", angewiesen: "Polier Hornfeld Bau", m: 500, h: 500, material: 4_260, unterschriebenAm: null, ar: null },
  { nr: "13", datum: "2026-07-08", tage: ["2026-07-08"], text: "Leitung für die Elektrotrasse umgehängt", angewiesen: "Bauleitung Hornfeld Bau", m: 400, h: 400, material: 2_860, unterschriebenAm: "2026-07-09", ar: 3 },
  { nr: "14", datum: "2026-07-09", tage: ["2026-07-09"], text: "Druckprobe Trinkwasser nach Beschädigung wiederholt", angewiesen: "Polier Hornfeld Bau", m: 300, h: 0, material: 1_420, unterschriebenAm: "2026-07-10", ar: 3 },
  { nr: "15", datum: "2026-07-14", tage: ["2026-07-14"], text: "Leitung im Keller nach Beschädigung durch den Trockenbau abgesperrt, repariert, druckgeprüft", angewiesen: "Polier Hornfeld Bau", m: 600, h: 600, material: 9_640, unterschriebenAm: "2026-07-15", ar: null },
];
const GROSSHAENDLER: Record<string, string> = { "9": "2026-06-08", "12": "2026-06-26", "15": "2026-07-17" };

/** Aufmaß lines read wrong and corrected by hand on import: position and the misread quantity in hundredths. */
const KORRIGIERTE_MENGEN: [string, string, number][] = [
  ["1", "22.02.01C", 900],
  ["2", "24.01.01B", -1_000],
  ["3", "26.03.01A", 1_000],
  ["4", "24.02.06A", -300],
  ["5", "22.03.01B", 800],
  ["6", "24.04.05A", -500],
  ["9", "22.06.02C", 1_100],
  ["10", "24.03.03A", 300],
];


export function erzeugeMooshaim(): Datensatz {
  const z = zufall(SEED);
  const ordner = new Ordner("P1");
  const pos = leistungsverzeichnis(positionenAusKatalog(), LV_FEST, AUFTRAGSSUMME, AUSGLEICH, 1_200_000, z);
  const P = new Map(pos.map((p) => [p.kp.nr, p] as const));
  const ep = (nr: string) => P.get(nr)!.ep;

  // ---------- Vertrag, Leistungsverzeichnis, Preisbasis ----------
  ordner.add("preisbasis", "preisbasis", "P1_Kalkulation_K3_K7.xlsx", "2025-10-24", 4);
  ordner.add("vertrag", "vertrag", "P1_Bauvertrag_Hornfeld_Bau.pdf", "2025-11-12", 18);
  ordner.add("lv", "leistungsverzeichnis", "P1_Leistungsverzeichnis_HKLS.pdf", "2025-11-12", 42);
  const positionen: Position[] = pos.map((p, i) => {
    const ql = (stelle: string) => q("lv", 2 + Math.floor(i / 7), `Pos. ${p.kp.nr}, ${stelle}`);
    return {
      nr: f(p.kp.nr, ql("Positionsnummer")),
      kurztext: f(p.kp.kurztext, ql("Kurztext")),
      einheit: f(p.kp.einheit, ql("Einheit")),
      menge: f(p.lv, ql("Menge")),
      ep: f(p.ep, ql("Einheitspreis")),
    };
  });

  // ---------- Regieberichte (amounts as the business invoices them) ----------
  const regie: Regiebericht[] = REGIE.map((r) => {
    const id = ordner.add(`rb-${r.nr}`, "regiebericht", `P1_Regiebericht_${r.nr.padStart(2, "0")}.pdf`, r.datum);
    const qr = (stelle: string) => q(id, 1, stelle);
    return {
      nr: r.nr,
      belegId: id,
      datum: f(r.datum, qr("Kopf, Datum")),
      arbeitstage: f(r.tage, qr("Arbeitstage")),
      taetigkeit: f(r.text, qr("Tätigkeit")),
      angewiesenVon: f(r.angewiesen, qr("Angeordnet von")),
      stundenMonteur: r.gelesenM !== undefined ? korrigiert(r.m, r.gelesenM, qr("Stunden Monteur"), "2026-10-19T08:40") : f(r.m, qr("Stunden Monteur")),
      stundenHelfer: f(r.h, qr("Stunden Helfer")),
      material: f(r.material, qr("Material zum Einstandspreis")),
      unterschrieben: f(r.unterschriebenAm !== null, qr("Unterschrift Auftraggeber")),
      unterschriebenAm: r.unterschriebenAm ? f(r.unterschriebenAm, qr("Unterschrift Auftraggeber, Datum")) : null,
      ausMeldung: null,
    };
  });
  const rbBetrag = (nr: string) => {
    const r = REGIE.find((x) => x.nr === nr)!;
    return regieBetrag(r, REGIE_MONTEUR, REGIE_HELFER, REGIEMATERIAL_BP);
  };
  const regieVerrechnet = REGIE.filter((r) => r.ar !== null);

  // ---------- Measured quantities: the entered Aufmaß hits the Entwurf ----------
  // Entered Aufmaß = Leistungsverzeichnis, plus the invoiced plan change of Plan L-310 Index E, minus a few smaller
  // quantities, which the solver sets so that the Entwurf totals exactly what the solution list says.
  const erfasst = new Map<string, Hundertstel>();
  for (const p of pos) if (p.kp.einheit !== "psch") erfasst.set(p.kp.nr, p.lv + (p.kp.nr === PLAN_E.nr ? PLAN_E.mehr : 0));
  const minder = ["24.06.01B", "22.06.02B", "26.07.02A", "24.06.02C", "22.02.01B", "24.01.08A", "26.02.01A", "22.06.03A", "24.06.03A", "22.06.01B"];
  const psch = pos.filter((p) => p.kp.einheit === "psch").reduce((s, p) => s + p.ep, 0);
  const regieSumme = regieVerrechnet.reduce((s, r) => s + rbBetrag(r.nr), 0);
  const ohneMinder = [...erfasst.entries()].filter(([nr]) => !minder.includes(nr)).reduce((s, [nr, m]) => s + betragAusMenge(m, ep(nr)), 0);
  const vars: Variable[] = minder.map((nr) => ({ key: nr, ep: ep(nr), lo: Math.round((P.get(nr)!.lv * 85) / 100), hi: P.get(nr)!.lv, schritt: schrittFuer(P.get(nr)!.kp.einheit) }));
  const loesung = loese(ENTWURF_SUMME, ohneMinder + psch + betragAusMenge(Z01.menge, Z01.ep) + regieSumme, vars, "hi");
  for (const [nr, m] of loesung) erfasst.set(nr, m);

  // ---------- Aufmaßblätter ----------
  const korrektur = new Map(KORRIGIERTE_MENGEN.map(([blatt, nr, delta]) => [`${blatt}|${nr}`, delta] as const));
  const zeilenJeBlatt = new Map<string, [string, Hundertstel][]>(BLAETTER.map((b) => [b.nr, []]));
  for (const p of pos) {
    const nr = p.kp.nr;
    if (p.kp.einheit === "psch" && (PAUSCHAL_AM_ENDE.includes(nr) || nr === AUSGLEICH)) continue;
    const menge = p.kp.einheit === "psch" ? 100 : erfasst.get(nr)!;
    const fest = BLATT_FEST[nr];
    const verteilung = fest ? [[fest, 1] as [string, number]] : BLATT_JE_ULG[`${p.kp.lg}.${p.kp.ulg}`];
    if (!verteilung) throw new Error(`P1: kein Aufmaßblatt für ${nr}`);
    const teileListe = teile(menge, verteilung.map(([, a]) => a), schrittFuer(p.kp.einheit));
    verteilung.forEach(([blatt], i) => teileListe[i] > 0 && zeilenJeBlatt.get(blatt)!.push([nr, teileListe[i]]));
  }
  zeilenJeBlatt.get("10")!.push([Z01.nr, Z01.menge]);
  zeilenJeBlatt.get("11")!.push([F4.nr, F4.mehr]);
  zeilenJeBlatt.get("12")!.push(...(Object.entries(F1) as [string, number][]));
  zeilenJeBlatt.get("13")!.push([F5.nr, F5.mehr]);
  const ordnerDatum = (b: BlattDef) => b.erfasst ?? b.datum;
  const aufmass: Aufmassblatt[] = BLAETTER.map((b) => {
    const id = ordner.add(`ab-${b.nr}`, "aufmassblatt", b.nr === "11" ? "P1_Aufmass_11_Stiege2.xlsx" : `P1_Aufmassblatt_${b.nr.padStart(2, "0")}.pdf`, ordnerDatum(b), b.nr === "11" ? 1 : 2);
    const zeilen: AufmassZeile[] = zeilenJeBlatt.get(b.nr)!.map(([nr, menge], i) => {
      const qa = q(id, 1 + Math.floor(i / 24), `Zeile ${nr}`);
      const delta = korrektur.get(`${b.nr}|${nr}`);
      return {
        positionNr: f(nr, qa),
        menge: delta !== undefined ? korrigiert(menge, menge + delta, qa, "2026-10-19T09:10") : f(menge, qa),
        ort: f(b.titel, qa),
      };
    });
    return {
      nr: b.nr,
      belegId: id,
      datum: f(b.datum, q(id, 1, "Kopf, Datum")),
      leistungVon: f(b.von, q(id, 1, "Kopf, Leistungszeitraum")),
      leistungBis: f(b.bis, q(id, 1, "Kopf, Leistungszeitraum")),
      gegengezeichnet: f(b.gegengezeichnetAm !== null, q(id, 2, "Unterschrift Auftraggeber")),
      gegengezeichnetAm: b.gegengezeichnetAm ? f(b.gegengezeichnetAm, q(id, 2, "Unterschrift Auftraggeber, Datum")) : null,
      erfasstAm: b.erfasst ? f(b.erfasst, q(id, 1, "AVA, erfasst am")) : null,
      grundlageBelegId: b.nr === "13" ? "fotodoku" : null,
      zeilen,
    };
  });
  if (korrektur.size !== KORRIGIERTE_MENGEN.length || aufmass.flatMap((a) => a.zeilen).filter((x) => x.menge.pruefstand === "korrigiert").length !== korrektur.size)
    throw new Error("P1: korrigierte Aufmaßzeile nicht gefunden");

  // ---------- Abschlagsrechnungen: what was measured and entered up to their date, to the amount of the list ----------
  const verrechnet = new Map<string, Hundertstel>();
  const abschlaege: Rechnung[] = ABSCHLAEGE.map((ar) => {
    const id = ordner.add(`ar-${ar.nr}`, "abschlagsrechnung", `P1_Abschlagsrechnung_${ar.nr}.pdf`, ar.datum, 4);
    const verfuegbar = new Map<string, Hundertstel>();
    if (ar.nr === 1) verfuegbar.set(AUSGLEICH, 100);
    for (const a of aufmass.filter((x) => x.erfasstAm !== null && x.erfasstAm.wert <= ar.datum))
      for (const zl of a.zeilen) if (zl.positionNr.wert !== Z01.nr) verfuegbar.set(zl.positionNr.wert, (verfuegbar.get(zl.positionNr.wert) ?? 0) + zl.menge.wert);
    for (const [nr, m] of verrechnet) verfuegbar.set(nr, (verfuegbar.get(nr) ?? 0) - m);
    const rbs = regie.filter((r) => REGIE.find((x) => x.nr === r.nr)!.ar === ar.nr);
    const fest = rbs.reduce((s, r) => s + rbBetrag(r.nr), 0) + (ar.nr === 3 ? betragAusMenge(Z01.menge, Z01.ep) : 0);
    const kandidaten = [...verfuegbar.entries()].filter(([, m]) => m > 0).map(([nr, m]): Variable => ({ key: nr, ep: ep(nr), lo: 0, hi: m, schritt: schrittFuer(P.get(nr)!.kp.einheit) }));
    // the plan change of Plan L-310 Index E goes into Abschlagsrechnung 2 in full (website event "verrechnet")
    if (ar.nr === 2) kandidaten.sort((a, b) => Number(b.key === PLAN_E.nr) - Number(a.key === PLAN_E.nr));
    const fein = kandidaten.filter((k) => k.schritt === 1 && k.hi > 5_000 && k.key !== PLAN_E.nr).slice(-2);
    const loesungAr = loese(ar.summe, fest, [...kandidaten.filter((k) => !fein.includes(k)), ...fein], "lo");
    const zeilen: RechnungsZeile[] = [];
    for (const p of pos) {
      const m = loesungAr.get(p.kp.nr) ?? 0;
      if (m <= 0) continue;
      verrechnet.set(p.kp.nr, (verrechnet.get(p.kp.nr) ?? 0) + m);
      zeilen.push(lvZeile(id, 2, p.kp.nr, m, p.ep));
    }
    if (ar.nr === 3) zeilen.push(zusatzZeile(id));
    for (const r of rbs) zeilen.push(regieZeile(id, 3, r, rbBetrag(r.nr)));
    const summe = summeZeilen(zeilen);
    if (summe !== ar.summe) throw new Error(`P1 Abschlagsrechnung ${ar.nr}: ${summe} statt ${ar.summe}`);
    return { nr: f(`Abschlagsrechnung ${ar.nr}`, q(id, 1, "Kopf")), belegId: id, art: "abschlag", datum: f(ar.datum, q(id, 1, "Kopf, Datum")), zeilen, summe: f(summe, q(id, 4, "Summe netto")) };
  });
  if (verrechnetIn(abschlaege[1], PLAN_E.nr) < PLAN_E.mehr) throw new Error("P1: Plan L-310 Index E nicht in Abschlagsrechnung 2");

  function zusatzZeile(id: string): RechnungsZeile {
    const qz = q(id, 2, `Pos. ${Z01.nr}`);
    return { typ: "zusatz", positionNr: f(Z01.nr, qz), text: f(Z01.text, qz), einheit: f("Stk", qz), menge: f(Z01.menge, qz), ep: f(Z01.ep, qz), betrag: f(betragAusMenge(Z01.menge, Z01.ep), qz) };
  }

  // ---------- Korrekturblatt, Abzugsschreiben, Zahlungsavisos ----------
  ordner.add("abzugsschreiben", "abzugsschreiben", "P1_Hornfeld_Abzugsschreiben.pdf", "2026-02-16");
  ordner.add("korrekturblatt-ar3", "korrekturblatt", "P1_Korrekturblatt_Abschlagsrechnung_3.pdf", "2026-10-14");
  const qk = q("korrekturblatt-ar3", 1, "Zeile Z-01");
  const korrekturblaetter = [
    {
      belegId: "korrekturblatt-ar3",
      rechnungNr: f("Abschlagsrechnung 3", q("korrekturblatt-ar3", 1, "Kopf")),
      datum: f("2026-10-14", q("korrekturblatt-ar3", 1, "Kopf, Datum")),
      zeilen: [{ positionNr: f(Z01.nr, qk), kuerzung: f(betragAusMenge(Z01.menge, Z01.ep), qk), grund: f("ausserhalb_lv_kein_nachtrag" as const, qk), text: f("nicht beauftragt, kein Nachtrag vorhanden", qk) }],
    },
  ];
  const zahlungen: Zahlung[] = ABSCHLAEGE.map((ar) => {
    const id = ordner.add(`avis-${ar.nr}`, "zahlungsavis", `P1_Zahlungsavis_Abschlagsrechnung_${ar.nr}.pdf`, ar.bezahlt);
    const kuerzung = ar.nr === 3 ? betragAusMenge(Z01.menge, Z01.ep) : 0;
    const s = abrechnen(ar.summe, kuerzung, SAETZE_ABSCHLAG);
    const qz = (stelle: string) => q(id, 1, stelle);
    return {
      belegId: id,
      rechnungNr: f(`Abschlagsrechnung ${ar.nr}`, qz("Bezug")),
      datum: f(ar.bezahlt, qz("Valuta")),
      betrag: f(s.ergebnis, qz("Zahlbetrag")),
      abzuege: [
        ...(kuerzung ? [{ art: "kuerzung" as const, betrag: f(kuerzung, qz("Kürzung laut Korrekturblatt")), satz: null }] : []),
        ...s.zeilen.map((x) => ({ art: x.art, betrag: f(x.betrag, qz(`Abzug ${x.art}`)), satz: f(x.satz, qz(`Satz ${x.art}`)) })),
      ],
    };
  });

  // ---------- Entwurf of the Schlussrechnung (19.10.2026), printed from the AVA ----------
  const eid = ordner.add("entwurf", "entwurf", "P1_Schlussrechnung_Entwurf.xlsx", "2026-10-19", 9);
  const entwurfZeilen: RechnungsZeile[] = [];
  for (const p of pos) {
    const m = p.kp.einheit === "psch" ? 100 : erfasst.get(p.kp.nr)!;
    if (m > 0) entwurfZeilen.push(lvZeile(eid, 2 + Math.floor(entwurfZeilen.length / 40), p.kp.nr, m, p.ep));
  }
  entwurfZeilen.push(zusatzZeile(eid));
  for (const r of regie.filter((x) => regieVerrechnet.some((y) => y.nr === x.nr))) entwurfZeilen.push(regieZeile(eid, 9, r, rbBetrag(r.nr)));
  const entwurf: Rechnung = { nr: f("Entwurf", q(eid, 1, "Kopf")), belegId: eid, art: "entwurf", datum: f("2026-10-19", q(eid, 1, "Kopf, Datum")), zeilen: entwurfZeilen, summe: f(summeZeilen(entwurfZeilen), q(eid, 9, "Summe netto")) };
  if (entwurf.summe.wert !== ENTWURF_SUMME) throw new Error(`P1 Entwurf: ${entwurf.summe.wert} statt ${ENTWURF_SUMME}`);

  // ---------- Stundenzettel, Großhändlerrechnungen ----------
  ordner.add("stundenzettel-kw23", "stundenzettel", "P1_Stundenzettel_KW23_Trupp2.pdf", "2026-06-08");
  const qs = (stelle: string) => q("stundenzettel-kw23", 1, stelle);
  const stundenzettel = [
    {
      belegId: "stundenzettel-kw23",
      von: f("2026-06-01", qs("Kopf, Woche")),
      bis: f("2026-06-05", qs("Kopf, Woche")),
      trupp: f("Trupp 2", qs("Kopf, Trupp")),
      eintraege: [{ regieberichtNr: f("9", qs("Zeile Regiebericht 9")), stundenMonteur: f(900, qs("Zeile Regiebericht 9, Monteur")), stundenHelfer: f(1_200, qs("Zeile Regiebericht 9, Helfer")) }],
    },
  ];
  const grosshaendlerrechnungen = Object.entries(GROSSHAENDLER).map(([nr, datum]) => {
    const id = ordner.add(`gh-rb${nr}`, "grosshaendlerrechnung", `P1_Grosshaendler_Material_Regiebericht_${nr}.pdf`, datum);
    return { belegId: id, datum: f(datum, q(id, 1, "Kopf, Datum")), regieberichtNr: f(nr, q(id, 1, "Kommission")), betrag: f(REGIE.find((r) => r.nr === nr)!.material, q(id, 1, "Summe netto")) };
  });

  // ---------- Pläne ----------
  const F1_NR = Object.keys(F1);
  const plan = (id: string, nr: string, index: string, datum: string, titel: string, aenderung: string | null, vermerke: Plan["vermerke"]): Plan => {
    ordner.add(id, "plan", `P1_Plan_${nr}_Index_${index}.pdf`, datum);
    return { belegId: id, planNr: f(nr, q(id, 1, "Plankopf")), index: f(index, q(id, 1, "Plankopf, Index")), datum: f(datum, q(id, 1, "Plankopf, Datum")), titel: f(titel, q(id, 1, "Plankopf")), aenderung: aenderung ? f(aenderung, q(id, 1, "Indexfeld")) : null, vermerke };
  };
  const vermerk = (id: string, typ: "stand" | "aenderung", nr: string, text: string) => ({ typ, positionNr: f(nr, q(id, 1, `Wolke ${nr}`)), text: f(text, q(id, 1, `Wolke ${nr}`)) });
  const plaene: Plan[] = [
    plan("plan-h101-c", "H-101", "C", "2026-01-20", "Heizung Tiefgarage und Technikraum", null, []),
    plan("plan-s150-c", "S-150", "C", "2026-01-22", "Sanitär Steigleitungen", null, []),
    plan("plan-l310-d", "L-310", "D", "2026-01-28", "Lüftung Tiefgarage", null, []),
    plan("plan-h201-c", "H-201", "C", "2026-02-12", "Heizung Wohnungen Stiege 1 und 2", null, F1_NR.map((nr) => vermerk("plan-h201-c", "stand", nr, "Wohnungstyp C: eine Wohnküche mit einem Heizkörper"))),
    plan("plan-h201-d", "H-201", "D", "2026-04-03", "Heizung Wohnungen Stiege 1 und 2", "14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr", F1_NR.map((nr) => vermerk("plan-h201-d", "aenderung", nr, "14 Wohnungen Typ C: Wohnküche geteilt, je 1 Heizkörper mehr"))),
    plan("plan-l310-e", "L-310", "E", "2026-05-13", "Lüftung Tiefgarage", "Lüftungsleitung in der Tiefgarage umgeführt", [vermerk("plan-l310-e", "aenderung", PLAN_E.nr, "Lüftungsleitung in der Tiefgarage umgeführt")]),
  ];

  // ---------- E-Mails (14 originals, 2 saved twice) ----------
  const mail = (id: string, datum: string, absender: string, von: Email["von"], betreff: string, kategorie: Email["kategorie"]["wert"], zitat: string | null, teil: Partial<Email> = {}, falschesDatum?: string): Email => {
    ordner.add(id, "email", `P1_${datum}_${betreff.replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, "_").slice(0, 40)}.msg`, datum);
    const qm = (stelle: string) => q(id, 1, stelle);
    return {
      belegId: id,
      datum: falschesDatum ? korrigiert(datum, falschesDatum, qm("Kopf, Datum"), "2026-10-19T10:05") : f(datum, qm("Kopf, Datum")),
      absender: f(absender, qm("Kopf, Absender")),
      von,
      betreff: f(betreff, qm("Kopf, Betreff")),
      kategorie: f(kategorie, qm("Inhalt")),
      zitat: zitat ? f(zitat, qm("Absatz 1")) : null,
      bezugPositionen: f([], qm("Inhalt")),
      aendertBauzeit: f(false, qm("Inhalt")),
      anmeldung: null,
      ...teil,
    };
  };
  const emails: Email[] = [
    mail("mail-0204", "2026-02-04", "Bauleitung Hornfeld Bau", "auftraggeber", "Baustellenordnung und Ansprechpartner", "sonstiges", null),
    mail("mail-0223", "2026-02-23", "Bauleitung Hornfeld Bau", "auftraggeber", "Baubesprechung jeden Dienstag", "termin", "Die Baubesprechung findet ab sofort jeden Dienstag um 9 Uhr statt."),
    mail("mail-0312", "2026-03-12", "Bauleitung Hornfeld Bau", "auftraggeber", "Technikraum umgeplant", "anweisung", "Bitte im Technikraum einen zweiten Pufferspeicher vorsehen und den Verteiler an die Westwand setzen."),
    mail("mail-0316", "2026-03-16", "Bauleitung Kronfeld Haustechnik", "betrieb", "Anmeldung Mehrkosten Technikraum", "anmeldung", "Für die Umplanung des Technikraums melden wir hiermit Mehrkosten an.", {
      anmeldung: {
        gegenstand: f("Technikraum umgeplant: zweiter Pufferspeicher, Verteiler versetzt", q("mail-0316", 1, "Betreff")),
        kategorie: f("technikraum", q("mail-0316", 1, "Betreff")),
        anweisungBelegId: "mail-0312",
        stunden: f(6_400, q("mail-0316", 1, "Absatz 2, geschätzter Aufwand")),
        material: f(286_000, q("mail-0316", 1, "Absatz 2, Material")),
        nachtragGelegt: f(false, q("mail-0316", 1, "Inhalt")),
      },
    }),
    mail("mail-0407", "2026-04-07", "Bauleitung Hornfeld Bau", "auftraggeber", "Wohnungstyp C Heizkörper", "anweisung", "Wohnungstyp C: je ein Heizkörper zusätzlich laut Plan D, bitte gleich mitmachen.", { bezugPositionen: f(F1_NR, q("mail-0407", 1, "Absatz 1")) }, "2026-04-01"),
    mail("mail-0513", "2026-05-13", "Planung Haustechnik", "auftraggeber", "Plan L-310 Index E", "sonstiges", "Anbei Plan L-310 Index E, Lüftungsleitung in der Tiefgarage umgeführt."),
    mail("mail-0609", "2026-06-09", "Bauleitung Hornfeld Bau", "auftraggeber", "Anlieferung Lüftungsgerät", "sonstiges", null),
    mail("mail-0702", "2026-07-02", "Bauleitung Hornfeld Bau", "auftraggeber", "Fertigstellung Stiege 2", "termin", "Fertigstellung Stiege 2 drei Wochen vorziehen.", { aendertBauzeit: f(true, q("mail-0702", 1, "Absatz 1")) }),
    mail("mail-0721", "2026-07-21", "Bauleitung Hornfeld Bau", "auftraggeber", "Bemusterung Sanitär", "sonstiges", null),
    mail("mail-0813", "2026-08-13", "Bauleitung Kronfeld Haustechnik", "betrieb", "Fotodokumentation Brandschutz", "sonstiges", "Anbei die Fotodokumentation der Brandschutzmanschetten.", {}, "2026-08-31"),
    mail("mail-0915", "2026-09-15", "Bauleitung Hornfeld Bau", "auftraggeber", "Abnahme Lüftung", "termin", "Die Abnahme der Lüftung ist am 29.09. um 10 Uhr."),
    mail("mail-1001", "2026-10-01", "Bauleitung Hornfeld Bau", "auftraggeber", "Übernahmetermin", "sonstiges", null),
    mail("mail-1009", "2026-10-09", "Bauleitung Hornfeld Bau", "auftraggeber", "Übernahmeprotokoll", "sonstiges", null),
    mail("mail-1014", "2026-10-14", "Abrechnung Hornfeld Bau", "auftraggeber", "Korrekturblatt Abschlagsrechnung 3", "sonstiges", null),
  ];
  ordner.kopie("mail-0407", "mail-0407-kopie", "P1_2026-04-07_Wohnungstyp_C_Heizkoerper (2).msg", "2026-04-07");
  ordner.kopie("mail-0702", "mail-0702-kopie", "P1_2026-07-02_Fertigstellung_Stiege_2 (2).msg", "2026-07-02");

  // ---------- Fotos (8 originals, 2 saved twice), Fotodokumentation ----------
  const foto = (id: string, zeit: string, ort: string, motiv: string, bezug: string[], falscheZeit?: string): Foto => {
    ordner.add(id, "foto", `P1_IMG_${zeit.slice(0, 10).replace(/-/g, "")}_${zeit.slice(11).replace(":", "")}.jpg`, zeit.slice(0, 10));
    const qf = q(id, 1, "EXIF");
    return { belegId: id, zeitpunkt: falscheZeit ? korrigiert(zeit, falscheZeit, qf, "2026-10-19T10:20") : f(zeit, qf), ort: f(ort, q(id, 1)), motiv: f(motiv, q(id, 1)), bezugPositionen: f(bezug, q(id, 1)) };
  };
  const fotos: Foto[] = [
    foto("foto-0218", "2026-02-18T10:12", "Technikraum", "Technikraum im Rohbau", []),
    foto("foto-0325", "2026-03-25T14:40", "Tiefgarage", "Grundleitungen vor dem Verfüllen", []),
    foto("foto-0515", "2026-05-15T11:05", "Stiege 1, Top 7, Wohnungstyp C", "zusätzlicher Heizkörper in der geteilten Wohnküche", ["22.04.12B"]),
    foto("foto-0603", "2026-06-03T09:10", "Stiege 2, Steigschacht", "Unterzug im Steigschacht, Steigleitung umgelegt", [], "2026-06-30T09:10"),
    foto("foto-0624", "2026-06-24T13:30", "Tiefgarage", "Lüftungsleitung umgeführt", [PLAN_E.nr]),
    foto("foto-0714", "2026-07-14T08:20", "Keller", "Wasserschaden, Leitung angebohrt", []),
    foto("foto-0813", "2026-08-13T15:00", "Stiege 1", "Brandschutzmanschetten mit Kennzeichnung", []),
    foto("foto-1009", "2026-10-09T10:00", "Technikraum", "Technikraum bei der Übernahme", []),
  ];
  ordner.kopie("foto-0515", "foto-0515-kopie", "P1_IMG_20260515_1105 (1).jpg", "2026-05-15");
  ordner.kopie("foto-0714", "foto-0714-kopie", "P1_IMG_20260714_0820 (1).jpg", "2026-07-14");
  ordner.add("fotodoku", "fotodokumentation", "P1_Fotodokumentation_Brandschutz.pdf", "2026-08-13", 24);
  const fotodokumentationen = [
    {
      belegId: "fotodoku",
      datum: f("2026-08-13", q("fotodoku", 1, "Deckblatt")),
      titel: f("Fotodokumentation Brandschutz, 142 Abschottungen DN 110 mit Kennzeichnung", q("fotodoku", 1, "Deckblatt")),
      positionNr: f(F5.nr, q("fotodoku", 1, "Deckblatt")),
      menge: f(14_200, q("fotodoku", 24, "Zusammenfassung")),
    },
  ];

  // ---------- WhatsApp-Meldungen (not in the folder) ----------
  const meldung = (id: string, nr: string, zeit: string, absender: string, text: string, ort: string, taetigkeit: string, teil: Partial<WhatsAppMeldung>): WhatsAppMeldung => ({
    id,
    nr,
    zeitpunkt: zeit,
    absender,
    transkript: f(text, q(id, 1, "Transkript")),
    foto: `${id}.jpg`,
    ort: f(ort, q(id, 1, "Ort")),
    taetigkeit: f(taetigkeit, q(id, 1, "Tätigkeit")),
    angewiesenVon: null,
    stundenMonteur: f(0, q(id, 1, "Stunden")),
    stundenHelfer: f(0, q(id, 1, "Stunden")),
    bezugPositionen: f([], q(id, 1, "Bezug")),
    bezugRegiebericht: null,
    bestaetigt: { rolle: absender, zeitpunkt: zeit },
    ...teil,
  });
  const meldungen: WhatsAppMeldung[] = [
    meldung("w1", "W1", "2026-05-12T15:20", "Monteur, Trupp 1", "Wohnungstyp C: die zusätzlichen Heizkörper laut Plan D sind montiert.", "Stiege 1 und 2, Wohnungstyp C", "zusätzliche Heizkörper montiert", { bezugPositionen: f(F1_NR, q("w1", 1, "Bezug")) }),
    meldung("w2", "W2", "2026-06-03T09:05", "Monteur, Trupp 2", "Steigleitung Stiege 2 geht nicht durch, da ist ein Unterzug, der im Plan nicht drin ist. Wir legen um, die Bauleitung von Hornfeld weiß Bescheid.", "Stiege 2, Steigschacht", "Steigleitung umgelegt", { angewiesenVon: f("Bauleitung Hornfeld Bau", q("w2", 1, "Angeordnet von")), bezugRegiebericht: f("9", q("w2", 1, "Bezug")) }),
    meldung("w3", "W3", "2026-07-14T07:55", "Monteur, Trupp 1", "Wasserschaden im Keller, der Trockenbau hat eine Leitung angebohrt, wir haben abgesperrt.", "Keller", "Leitung abgesperrt", { bezugRegiebericht: f("15", q("w3", 1, "Bezug")) }),
    meldung("w4", "W4", "2026-09-08T14:30", "Monteur, Trupp 1", "Top 9: Heizkörper im Wohnzimmer versetzt, die Küche wurde anders geplant, der Polier von Hornfeld hat es angeschafft. Zwei Mann, je vier Stunden.", "Stiege 2, Top 9", "Heizkörper Top 9 versetzt", {
      angewiesenVon: f("Polier Hornfeld Bau", q("w4", 1, "Angeordnet von")),
      stundenMonteur: f(400, q("w4", 1, "Stunden")),
      stundenHelfer: f(400, q("w4", 1, "Stunden")),
    }),
  ];

  // ---------- Vertrag, Preisbasis ----------
  const qv = (stelle: string, seite = 3) => q("vertrag", seite, stelle);
  const vertrag: Datensatz["vertrag"] = {
    belegId: "vertrag",
    datum: f("2025-11-12", qv("Kopf, Datum", 1)),
    norm: f("ÖNORM B 2110", qv("Punkt 1.2", 1)),
    vertragsart: f("Einheitspreisvertrag", qv("Punkt 2.1", 1)),
    auftragssumme: f(AUFTRAGSSUMME, qv("Punkt 2.2", 1)),
    saetze: [
      { art: "nachlass", satz: f(300, qv("Punkt 5.1", 5)), punkt: "5.1", phase: "beide" },
      { art: "baustrom_bauwasser", satz: f(60, qv("Punkt 4.6", 4)), punkt: "4.6", phase: "beide" },
      { art: "deckungsruecklass", satz: f(500, qv("Punkt 9.1", 11)), punkt: "9.1", phase: "abschlag" },
      { art: "haftruecklass", satz: f(300, qv("Punkt 9.2", 11)), punkt: "9.2", phase: "schluss", durchBankgarantieErsetzbar: true },
    ],
    regiesatzMonteur: f(REGIE_MONTEUR, qv("Punkt 6.3", 7)),
    regiesatzHelfer: f(REGIE_HELFER, qv("Punkt 6.3", 7)),
    regiePunkt: "6.3",
    regiematerialZuschlag: f(REGIEMATERIAL_BP, qv("Punkt 6.4", 7)),
    regiematerialPunkt: "6.4",
    regieUnterschrift: f("Polier", qv("Punkt 6.2", 7)),
    preise: { art: "fest", punkt: "7.1", text: f("Festpreise bis Bauende", qv("Punkt 7.1", 8)) },
    pauschalen: [{ kategorie: "baustelleneinrichtung", punkt: "4.3", text: f("Die Baustelleneinrichtung wird pauschal vergütet.", qv("Punkt 4.3", 4)) }],
    schlussrechnungLegenBis: f("2026-10-30", qv("Punkt 8.4", 9)),
  };
  const preisbasis: Datensatz["preisbasis"] = {
    belegId: "preisbasis",
    mittellohnkosten: f(4_580, q("preisbasis", 1, "K3, Mittellohnkosten")),
    mittellohnpreis: f(5_860, q("preisbasis", 1, "K3, Mittellohnpreis")),
    materialzuschlag: f(1_200, q("preisbasis", 1, "K3, Zuschlag Material")),
    k7: [{ positionNr: "22.04.12B", lohnHundertstel: f(110, q("preisbasis", 3, "K7 22.04.12B, Lohn")), sonstigesJeEinheit: f(22_194, q("preisbasis", 3, "K7 22.04.12B, Sonstiges")) }],
  };
  if (stundenBetrag(110, 5_860) + 22_194 !== ep("22.04.12B")) throw new Error("P1: K7 22.04.12B passt nicht zum Einheitspreis");

  return {
    projekt: {
      id: "p1",
      kurz: "P1",
      name: "Wohnpark Mooshaim",
      langname: "Wohnpark Mooshaim, 32 Wohnungen und Tiefgarage, HKLS",
      auftraggeberId: "hornfeld",
      stufe: "sr_vorbereiten",
      schlussrechnungLegenBis: "2026-10-30",
      schlussrechnungGelegt: null,
      schlusszahlung: null,
      bauzeit: { von: "2026-02-02", bis: "2026-10-09" },
    },
    vertrag,
    preisbasis,
    belege: ordner.belege,
    positionen,
    aufmass,
    regie,
    stundenzettel,
    abschlaege,
    entwurf,
    schlussrechnung: null,
    zahlungen,
    korrekturblaetter,
    abzugsschreiben: {
      belegId: "abzugsschreiben",
      datum: f("2026-02-16", q("abzugsschreiben", 1, "Kopf, Datum")),
      abzuege: [
        { art: "baustrom_bauwasser", satz: f(60, q("abzugsschreiben", 1, "Absatz 2")) },
        { art: "bauschadensumlage", satz: f(50, q("abzugsschreiben", 1, "Absatz 3")) },
      ],
    },
    nachtraege: [],
    plaene,
    emails,
    fotos,
    fotodokumentationen,
    grosshaendlerrechnungen,
    indexblatt: null,
    meldungen,
  };
}

function verrechnetIn(r: Rechnung, nr: string): Hundertstel {
  return r.zeilen.reduce((s, z) => s + (z.typ === "position" && z.positionNr.wert === nr ? z.menge.wert : 0), 0);
}
