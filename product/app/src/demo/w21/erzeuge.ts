// Synthetischer Datensatz „Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los“ (alles fiktiv).
// Deterministisch: gleicher Seed, gleiche Daten. Die eingebauten Fälle stehen in Produkt/Demo_Faelle.md.
// Ziel: genau diese Fälle entstehen, sonst nichts. Der Generator rechnet nur, um Zielsummen zu treffen
// (Auftragssumme, Entwurf, AR-Beträge, Leistung ab Stichtag); die Befunde selbst findet erst der Rechenkern.

import type {
  Aufmassblatt,
  AufmassZeile,
  Datensatz,
  Dokument,
  DokumentArt,
  Einheit,
  Feld,
  Foto,
  LvPosition,
  Mail,
  Plan,
  Quelle,
  Rechnung,
  RechnungsZeile,
  Regiebericht,
  Zahlung,
  Zuruf,
} from "@/domain/typen";
import { betragAusMenge, prozent, stundenBetrag } from "@/engine/geld";
import { KATALOG, SOLL_ANZAHL } from "./katalog";
import { zufall } from "./zufall";

const SEED = 21_2026;

// ---------- Zielwerte aus Demo_Faelle.md (Cent) ----------
const AUFTRAGSSUMME = 124_000_000;
const ENTWURF_SUMME = 121_864_000; // 1.246.050,00 − Liste 1 (27.410,00)
const AR_ZIELE = [31_240_000, 41_890_000, 35_620_000];
/** Leistung ab Stichtag, sodass 40 % Lohnanteil genau 190.736,84 € ergeben. */
const LEISTUNG_AB_STICHTAG = [47_684_209, 47_684_211];
const MITTELLOHNPREIS = 5_680;
const REGIE_MONTEUR = 6_250;
const REGIE_HELFER = 5_200;

// ---------- Feste Positionen ----------
const J1 = "22.04.12B";
const J5 = "24.02.05A";
const J6 = "22.06.03C";
const J7 = "26.03.04A";
const G3 = "24.05.02A";
const AUSGLEICH = "28.01.03A";
/** Pauschalen, die je in genau einer AR nach Leistungsstand (Teilbetrag) verrechnet werden. */
const AR_TEILLEISTUNG = ["22.01.01A", "26.01.01A", "28.01.01A"];
/** Feinjustierung der Leistung ab Stichtag: Aufteilung zwischen Blatt vor und nach dem Stichtag. */
const FEIN = ["22.02.01A", "24.01.01A"];

const LV_MENGE_FIX: Record<string, number> = { [J1]: 8_600, [J5]: 64_000, [J6]: 90_000, [J7]: 21_000, [G3]: 4_800 };
const MEHRMENGE_AUFMASS: Record<string, number> = { [J1]: 10_000, [J5]: 81_200, [J6]: 114_000, [J7]: 28_600 };
const ENTFALLEN = ["24.03.10A", "26.06.03B"];

// ---------- Hilfen ----------
const q = (dokumentId: string, seite: number, stelle?: string, bbox?: [number, number, number, number]): Quelle =>
  bbox ? { dokumentId, seite, stelle, bbox } : stelle ? { dokumentId, seite, stelle } : { dokumentId, seite };
const f = <T,>(wert: T, quelle: Quelle): Feld<T> => ({ wert, quelle });
const zeileBox = (zeile: number, zeilenJeSeite: number): [number, number, number, number] => [40, 150 + (zeile % zeilenJeSeite) * 26, 515, 22];

/** Rundet eine Menge (Hundertstel) auf die übliche Genauigkeit der Einheit ab. */
function abrunden(menge: number, einheit: Einheit): number {
  const schritt = einheit === "Stk" ? 100 : einheit === "psch" ? 1 : 10;
  return Math.floor(menge / schritt) * schritt;
}

interface PosMeta {
  nr: string;
  lg: string;
  ulg: string;
  kurztext: string;
  einheit: Einheit;
  ep: number;
  lvMenge: number;
  lohnHundertstel: number;
  aufmass: number;
  /** Anteil der Aufmaßmenge auf dem Blatt nach dem Stichtag (nur bei geteilten Gruppen). */
  nachher: number;
}

// ---------- Aufmaßblätter ----------
interface BlattDef {
  nr: string;
  von: string;
  bis: string;
  datum: string;
  titel: string;
  ag: boolean;
}

const BLAETTER: BlattDef[] = [
  { nr: "AB-01", von: "2026-02-01", bis: "2026-03-31", datum: "2026-04-02", titel: "Heizung Rohrleitungen, 1. Abschnitt", ag: true },
  { nr: "AB-02", von: "2026-02-01", bis: "2026-03-31", datum: "2026-04-02", titel: "Entwässerung, 1. Abschnitt", ag: true },
  { nr: "AB-03", von: "2026-03-01", bis: "2026-04-30", datum: "2026-05-04", titel: "Lüftung Zentrale, Luftleitungen, Brandschutz, 1. Abschnitt", ag: true },
  { nr: "AB-04", von: "2026-03-01", bis: "2026-04-30", datum: "2026-05-04", titel: "Trinkwasser, 1. Abschnitt", ag: true },
  { nr: "AB-05", von: "2026-02-01", bis: "2026-04-30", datum: "2026-05-05", titel: "Technikraum, Wohnungsstationen, Heizkörper Vormontage", ag: true },
  { nr: "AB-06", von: "2026-05-01", bis: "2026-06-30", datum: "2026-07-02", titel: "Heizung Rohrleitungen, 2. Abschnitt", ag: true },
  { nr: "AB-07", von: "2026-05-01", bis: "2026-06-30", datum: "2026-07-02", titel: "Entwässerung 2. Abschnitt, Vorwand", ag: true },
  { nr: "AB-08", von: "2026-05-01", bis: "2026-06-30", datum: "2026-07-03", titel: "Lüftung Geräte, Luftleitungen 2. Abschnitt, Brandschutz", ag: true },
  { nr: "AB-09", von: "2026-05-01", bis: "2026-07-31", datum: "2026-08-04", titel: "Trinkwasser, 2. Abschnitt", ag: true },
  { nr: "AB-10", von: "2026-07-01", bis: "2026-08-31", datum: "2026-09-03", titel: "Dämmung Heizung und Sanitär", ag: true },
  { nr: "AB-11", von: "2026-07-01", bis: "2026-09-15", datum: "2026-09-17", titel: "Sanitär Fertigmontage", ag: true },
  { nr: "AB-12", von: "2026-07-01", bis: "2026-09-15", datum: "2026-09-18", titel: "Heizkörper und Armaturen Stiege 1 bis 3, Fertigmontage", ag: false },
  { nr: "AB-13", von: "2026-07-01", bis: "2026-09-30", datum: "2026-10-02", titel: "Lüftung Wickelfalz, Luftauslässe", ag: true },
  { nr: "AB-14", von: "2026-08-01", bis: "2026-10-15", datum: "2026-10-16", titel: "MSR, Inbetriebnahmen, Prüfungen", ag: true },
];

/** Blatt je Leistungsgruppe/Untergruppe: [vor dem Stichtag, nach dem Stichtag]. */
const BLATT_JE_ULG: Record<string, [string | null, string | null]> = {
  "22.01": ["AB-05", null],
  "22.02": ["AB-01", "AB-06"],
  "22.03": ["AB-01", "AB-06"],
  "22.04": ["AB-05", "AB-12"],
  "22.05": ["AB-05", "AB-12"],
  "22.06": [null, "AB-10"],
  "22.08": [null, "AB-14"],
  "24.01": ["AB-02", "AB-07"],
  "24.02": ["AB-04", "AB-09"],
  "24.03": [null, "AB-11"],
  "24.04": ["AB-05", null],
  "24.05": [null, "AB-11"],
  "24.06": [null, "AB-10"],
  "24.07": ["AB-05", null],
  "24.08": ["AB-02", "AB-07"],
  "24.09": ["AB-05", null],
  "26.01": ["AB-03", null],
  "26.02": ["AB-03", "AB-08"],
  "26.03": [null, "AB-13"],
  "26.04": ["AB-03", "AB-13"],
  "26.05": ["AB-03", "AB-08"],
  "26.06": [null, "AB-13"],
  "26.07": ["AB-03", "AB-08"],
  "26.08": [null, "AB-14"],
  "26.09": [null, "AB-13"],
  "28.01": [null, "AB-14"],
  "28.02": [null, "AB-14"],
  "28.03": [null, "AB-14"],
  "28.04": ["AB-05", "AB-14"],
  "28.05": [null, "AB-14"],
  "28.06": [null, "AB-14"],
};

// ---------- Regieberichte ----------
interface RbDef {
  nr: string;
  datum: string;
  text: string;
  m: number;
  h: number;
  material: number;
  unterschrieben: boolean;
  ar: number | null;
}

const REGIE: RbDef[] = [
  { nr: "RB-01", datum: "2026-02-12", text: "Provisorische Beheizung Rohbau Stiege 1", m: 1600, h: 800, material: 21_480, unterschrieben: true, ar: 0 },
  { nr: "RB-02", datum: "2026-02-26", text: "Leitungen umverlegt wegen Deckendurchbruch Fremdgewerk", m: 1200, h: 0, material: 9_640, unterschrieben: true, ar: 0 },
  { nr: "RB-03", datum: "2026-03-10", text: "Bauwasseranschluss Stiege 1 hergestellt", m: 600, h: 600, material: 14_820, unterschrieben: true, ar: 0 },
  { nr: "RB-04", datum: "2026-03-24", text: "Nacharbeit Entwässerung nach Beschädigung durch Fremdgewerk", m: 900, h: 900, material: 6_240, unterschrieben: true, ar: 0 },
  { nr: "RB-05", datum: "2026-04-14", text: "Provisorische Beheizung Stiege 2 für Estrich", m: 1400, h: 0, material: 18_660, unterschrieben: true, ar: 1 },
  { nr: "RB-06", datum: "2026-04-28", text: "Rohrdurchführungen Tiefgarage nachgedichtet", m: 800, h: 800, material: 11_280, unterschrieben: true, ar: 1 },
  { nr: "RB-07", datum: "2026-05-06", text: "Provisorische Bauwasserversorgung umlegen", m: 1800, h: 0, material: 18_640, unterschrieben: true, ar: null },
  { nr: "RB-08", datum: "2026-05-19", text: "Heizungsstränge nach Verschmutzung durch Fremdgewerk gespült", m: 1000, h: 1000, material: 4_860, unterschrieben: true, ar: 1 },
  { nr: "RB-09", datum: "2026-05-21", text: "Fernwärme provisorisch umgeschlossen", m: 1200, h: 600, material: 0, unterschrieben: true, ar: 1 },
  { nr: "RB-10", datum: "2026-05-28", text: "Leihheizgeräte für Estrichtrocknung montiert", m: 800, h: 0, material: 7_420, unterschrieben: true, ar: 1 },
  { nr: "RB-11", datum: "2026-06-03", text: "Steigleitung umlegen (Kollision Lüftung)", m: 2400, h: 1600, material: 64_280, unterschrieben: true, ar: null },
  { nr: "RB-12", datum: "2026-06-24", text: "Zusätzliche Entleerungen Heizung Stiege 1", m: 1000, h: 600, material: 8_450, unterschrieben: false, ar: null },
  { nr: "RB-13", datum: "2026-07-08", text: "Druckprobe nach Beschädigung durch Fremdgewerk wiederholt", m: 600, h: 0, material: 3_180, unterschrieben: true, ar: 2 },
  { nr: "RB-14", datum: "2026-07-21", text: "Notabsperrung nach Wasserschaden Fremdgewerk", m: 800, h: 0, material: 9_620, unterschrieben: true, ar: null },
  { nr: "RB-15", datum: "2026-08-11", text: "Nachrüstung Strangregulierventile", m: 800, h: 0, material: 22_100, unterschrieben: false, ar: null },
  { nr: "RB-16", datum: "2026-09-02", text: "Leihheizgeräte demontiert", m: 600, h: 0, material: 2_860, unterschrieben: true, ar: 2 },
];
const RB_FEIN = "RB-09";

const regieBetrag = (rb: RbDef) => stundenBetrag(rb.m, REGIE_MONTEUR) + stundenBetrag(rb.h, REGIE_HELFER) + rb.material;

// ---------- Erzeugen ----------

export function erzeugeW21(): Datensatz {
  const z = zufall(SEED);

  // 1. LV aus dem Katalog
  const pos: PosMeta[] = [];
  for (const lg of Object.keys(KATALOG)) {
    for (const basis of KATALOG[lg]) {
      basis.varianten.forEach((v, i) => {
        const nr = `${lg}.${basis.ulg}.${basis.basis}${String.fromCharCode(65 + i)}`;
        const ep = Math.round((basis.ep + i * (basis.schritt ?? 0)) * 100);
        const einheit = basis.einheit;
        const lvMenge =
          LV_MENGE_FIX[nr] ??
          (einheit === "psch" ? 100 : einheit === "Stk" ? z.ganz(basis.menge[0], basis.menge[1]) * 100 : z.ganz(basis.menge[0] * 10, basis.menge[1] * 10) * 10);
        pos.push({ nr, lg, ulg: basis.ulg, kurztext: v === "–" ? basis.text : basis.text.replace("{v}", v), einheit, ep, lvMenge, lohnHundertstel: 0, aufmass: 0, nachher: 0 });
      });
    }
    const anzahl = pos.filter((p) => p.lg === lg).length;
    if (anzahl !== SOLL_ANZAHL[lg]) throw new Error(`LG ${lg}: ${anzahl} statt ${SOLL_ANZAHL[lg]} Positionen`);
  }
  const P = new Map(pos.map((p) => [p.nr, p] as const));
  const fest = new Set([...Object.keys(LV_MENGE_FIX), AUSGLEICH]);

  // 2. LV-Mengen so skalieren, dass die Auftragssumme mit einer Ausgleichspauschale genau aufgeht
  const betragLv = (p: PosMeta) => betragAusMenge(p.lvMenge, p.ep);
  const variabel = pos.filter((p) => !fest.has(p.nr) && p.einheit !== "psch");
  const festSumme = pos.filter((p) => !variabel.includes(p) && p.nr !== AUSGLEICH).reduce((s, p) => s + betragLv(p), 0);
  const ziel = AUFTRAGSSUMME - festSumme - 750_000;
  const faktor = ziel / variabel.reduce((s, p) => s + betragLv(p), 0);
  for (const p of variabel) p.lvMenge = Math.max(p.einheit === "Stk" ? 100 : 10, abrunden(Math.round(p.lvMenge * faktor), p.einheit));
  const ausgleich = P.get(AUSGLEICH)!;
  const restLv = () => AUFTRAGSSUMME - pos.filter((p) => p !== ausgleich).reduce((s, p) => s + betragLv(p), 0);
  // Abrunden der Mengen lässt zu viel offen: Einheiten auf billige Positionen verteilen, bis der Rest passt
  for (let i = 0; restLv() > 1_000_000 && i < 100_000; i++) {
    const p = variabel[i % variabel.length];
    const schritt = p.einheit === "Stk" ? 100 : 10;
    if (betragAusMenge(schritt, p.ep) < restLv() - 750_000) p.lvMenge += schritt;
  }
  ausgleich.ep = restLv();
  if (ausgleich.ep < 300_000 || ausgleich.ep > 1_500_000) throw new Error(`Ausgleichspauschale unplausibel: ${ausgleich.ep}`);

  // 3. K7: Lohnstunden je Einheit (nur Plausibilität)
  for (const p of pos) {
    const anteil = p.nr === J1 ? 0 : p.einheit === "m" || p.einheit === "m²" ? 0.35 + z.zahl() * 0.25 : 0.2 + z.zahl() * 0.3;
    p.lohnHundertstel = p.nr === J1 ? 130 : Math.max(5, Math.round(((p.ep * anteil) / MITTELLOHNPREIS) * 100));
    while (stundenBetrag(p.lohnHundertstel, MITTELLOHNPREIS) > p.ep) p.lohnHundertstel--;
  }

  // 4. Aufmaß: Standard = LV-Menge, Mehrmengen fest, einzelne Mindermengen, zwei entfallene Positionen
  for (const p of pos) {
    p.aufmass = MEHRMENGE_AUFMASS[p.nr] ?? p.lvMenge;
    if (ENTFALLEN.includes(p.nr)) p.aufmass = 0;
    else if (!fest.has(p.nr) && !AR_TEILLEISTUNG.includes(p.nr) && !FEIN.includes(p.nr) && p.einheit !== "psch" && z.zahl() < 0.14) {
      p.aufmass = abrunden(Math.round(p.lvMenge * (0.85 + z.zahl() * 0.12)), p.einheit);
    }
  }

  // 5. Entwurf-Summe treffen: Mindermengen auf Positionen nur vor dem Stichtag, Rest über das Material von RB-09
  const vorOnly = pos.filter((p) => {
    const [vor, nach] = BLATT_JE_ULG[`${p.lg}.${p.ulg}`];
    return vor && !nach && p.einheit !== "psch" && !fest.has(p.nr) && !ENTFALLEN.includes(p.nr);
  });
  const entwurfMenge = (p: PosMeta) => (MEHRMENGE_AUFMASS[p.nr] ? p.lvMenge : p.aufmass);
  const entwurfZeilenBetrag = (p: PosMeta) => (p.nr === G3 ? 544_080 : betragAusMenge(entwurfMenge(p), p.ep));
  const rbFein = REGIE.find((r) => r.nr === RB_FEIN)!;
  const entwurfOhneFein = () =>
    pos.reduce((s, p) => s + entwurfZeilenBetrag(p), 0) +
    REGIE.filter((r) => r.ar !== null && r.nr !== RB_FEIN).reduce((s, r) => s + regieBetrag(r), 0) +
    stundenBetrag(rbFein.m, REGIE_MONTEUR) +
    stundenBetrag(rbFein.h, REGIE_HELFER) +
    216_000;
  const MATERIAL_MIN = 20_000;
  const MATERIAL_MAX = 150_000;
  for (let runde = 0; runde < 5000; runde++) {
    const luecke = ENTWURF_SUMME - entwurfOhneFein();
    if (luecke >= MATERIAL_MIN && luecke <= MATERIAL_MAX) break;
    const kandidaten = [...vorOnly].sort((a, b) => b.ep - a.ep);
    const schritt = (p: PosMeta) => (p.einheit === "Stk" ? 100 : 10);
    if (luecke < MATERIAL_MIN) {
      const p = kandidaten.find((x) => x.aufmass >= schritt(x) && betragAusMenge(schritt(x), x.ep) <= MATERIAL_MAX - luecke);
      if (!p) throw new Error(`Entwurf zu hoch, keine Mindermenge mehr möglich (Lücke ${luecke})`);
      p.aufmass -= schritt(p);
    } else {
      const p = kandidaten.find((x) => x.aufmass + schritt(x) <= x.lvMenge && betragAusMenge(schritt(x), x.ep) <= luecke - MATERIAL_MIN);
      if (!p) throw new Error(`Entwurf zu niedrig (Lücke ${luecke})`);
      p.aufmass += schritt(p);
    }
  }
  rbFein.material = ENTWURF_SUMME - entwurfOhneFein();
  if (rbFein.material < MATERIAL_MIN || rbFein.material > MATERIAL_MAX) throw new Error(`Material ${RB_FEIN} unplausibel: ${rbFein.material}`);

  // 6. Leistung ab Stichtag treffen: Aufteilung der geteilten Gruppen zwischen Blatt vor/nach dem Stichtag
  const geteilt = pos.filter((p) => {
    const [vor, nach] = BLATT_JE_ULG[`${p.lg}.${p.ulg}`];
    return vor && nach && p.aufmass > 0;
  });
  // Feste Anteile nach dem Stichtag: J1 und J5 wie in der Lösungsliste, Heizkörper zu 40 % Fertigmontage
  P.get(J1)!.nachher = P.get(J1)!.aufmass;
  P.get(J5)!.nachher = 43_200;
  for (const p of geteilt) if (p.lg === "22" && p.ulg === "04" && p.nr !== J1) p.nachher = abrunden(Math.round(p.aufmass * 0.4), p.einheit);
  const festAnteil = geteilt.filter((p) => p.nr === J1 || p.nr === J5 || (p.lg === "22" && p.ulg === "04"));
  const grob = geteilt.filter((p) => !FEIN.includes(p.nr) && !festAnteil.includes(p));
  const nurNach = pos.filter((p) => {
    const [vor, nach] = BLATT_JE_ULG[`${p.lg}.${p.ulg}`];
    return !vor && nach;
  });
  const nachStichtagFix =
    nurNach.reduce((s, p) => s + betragAusMenge(p.aufmass, p.ep), 0) + festAnteil.reduce((s, p) => s + betragAusMenge(p.nachher, p.ep), 0);
  const grobSumme = (phi: number) => grob.reduce((s, p) => s + betragAusMenge(abrunden(Math.round(p.aufmass * phi), p.einheit), p.ep), 0);
  const [fein1, fein2] = FEIN.map((nr) => P.get(nr)!);
  const feinMax = betragAusMenge(fein1.aufmass, fein1.ep) + betragAusMenge(fein2.aufmass, fein2.ep);
  const zielS = LEISTUNG_AB_STICHTAG[0];
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 60; i++) {
    const mitte = (lo + hi) / 2;
    if (nachStichtagFix + grobSumme(mitte) + feinMax * 0.5 > zielS) hi = mitte;
    else lo = mitte;
  }
  const phi = lo;
  for (const p of grob) p.nachher = abrunden(Math.round(p.aufmass * phi), p.einheit);
  const rest = zielS - nachStichtagFix - grobSumme(phi);
  let gefunden = false;
  for (let k1 = 0; k1 <= fein1.aufmass && !gefunden; k1++) {
    const r2 = rest - betragAusMenge(k1, fein1.ep);
    if (r2 < 0) break;
    const schaetzung = Math.round((r2 * 100) / fein2.ep);
    for (let k2 = Math.max(0, schaetzung - 3); k2 <= Math.min(fein2.aufmass, schaetzung + 3); k2++) {
      const s = zielS - rest + betragAusMenge(k1, fein1.ep) + betragAusMenge(k2, fein2.ep);
      if (s >= LEISTUNG_AB_STICHTAG[0] && s <= LEISTUNG_AB_STICHTAG[1]) {
        fein1.nachher = k1;
        fein2.nachher = k2;
        gefunden = true;
        break;
      }
    }
  }
  if (!gefunden) {
    const jeUlg: Record<string, number> = {};
    for (const p of pos) jeUlg[`${p.lg}.${p.ulg}`] = (jeUlg[`${p.lg}.${p.ulg}`] ?? 0) + Math.round(betragAusMenge(p.aufmass, p.ep) / 100);
    throw new Error(`Leistung ab Stichtag nicht treffbar (Rest ${rest}, fein max ${feinMax}, phi ${phi}) ${JSON.stringify(jeUlg)}`);
  }

  // ---------- Dokumente ----------
  const dokumente: Dokument[] = [];
  const dok = (id: string, art: DokumentArt, dateiname: string, datum: string, seiten: number, inhaltHash = `h-${id}`) => {
    dokumente.push({ id, art, kanal: "ordner", dateiname, datum, seiten, inhaltHash });
    return id;
  };
  let korrekturen = 0;
  const korrigiert = <T,>(feld: Feld<T>): Feld<T> => {
    korrekturen++;
    return { ...feld, pruefstand: "bestaetigt", korrigiert: true };
  };

  dok("vertrag", "vertrag", "Bauvertrag_HKLS_W21-B.pdf", "2025-11-14", 18);
  const LV_ZEILEN = 20;
  dok("lv", "lv", "LV_HKLS_W21-B.onlv.pdf", "2025-09-15", Math.ceil(pos.length / LV_ZEILEN) + 2);
  dok("k7", "k7", "K7-Blaetter_HKLS_W21-B.pdf", "2025-09-15", Math.ceil(pos.length / LV_ZEILEN));

  // LV
  const lv: LvPosition[] = pos.map((p, i) => {
    const seite = Math.floor(i / LV_ZEILEN) + 3;
    const box = zeileBox(i, LV_ZEILEN);
    const ql = (stelle: string) => q("lv", seite, `Pos. ${p.nr}, ${stelle}`, box);
    const qk = q("k7", Math.floor(i / LV_ZEILEN) + 1, `Pos. ${p.nr}`, box);
    const lohn = stundenBetrag(p.lohnHundertstel, MITTELLOHNPREIS);
    return {
      nr: f(p.nr, ql("Positionsnummer")),
      kurztext: f(p.kurztext, ql("Kurztext")),
      einheit: f(p.einheit, ql("Einheit")),
      menge: f(p.lvMenge, ql("Menge")),
      ep: f(p.ep, ql("Einheitspreis")),
      k7: { lohnHundertstel: f(p.lohnHundertstel, qk), sonstigesJeEinheit: f(p.ep - lohn, qk) },
    };
  });

  // Aufmaß
  const ZEILEN_JE_BLATT = 24;
  const aufmass: Aufmassblatt[] = BLAETTER.map((b) => {
    const id = `ab-${b.nr.slice(3)}`;
    const zeilen: AufmassZeile[] = [];
    const roh: { p: PosMeta; menge: number }[] = [];
    for (const p of pos) {
      const [vor, nach] = BLATT_JE_ULG[`${p.lg}.${p.ulg}`];
      if (p.aufmass === 0) continue;
      if (vor === b.nr && nach) roh.push({ p, menge: p.aufmass - p.nachher });
      else if (nach === b.nr && vor) roh.push({ p, menge: p.nachher });
      else if (vor === b.nr || nach === b.nr) roh.push({ p, menge: p.aufmass });
    }
    roh
      .filter((r) => r.menge > 0)
      .forEach(({ p, menge }, i) => {
        const seite = Math.floor(i / ZEILEN_JE_BLATT) + 1;
        const qa = q(id, seite, `Zeile ${p.nr}`, zeileBox(i, ZEILEN_JE_BLATT));
        zeilen.push({ positionNr: f(p.nr, qa), menge: f(menge, qa), ort: f(p.lg === "28" ? "Technikraum, alle Stiegen" : "Stiege 1 bis 3", qa) });
      });
    const seiten = Math.max(1, Math.ceil(zeilen.length / ZEILEN_JE_BLATT));
    dok(id, "aufmass", `${b.nr}_Aufmass_${b.titel.replace(/[ ,]+/g, "_")}.pdf`, b.datum, seiten);
    const qs = (stelle: string) => q(id, seiten, stelle, [300, 760, 255, 40]);
    return {
      nr: b.nr,
      dokumentId: id,
      datum: f(b.datum, q(id, 1, "Kopf, Datum")),
      leistungVon: f(b.von, q(id, 1, "Kopf, Leistungszeitraum")),
      leistungBis: f(b.bis, q(id, 1, "Kopf, Leistungszeitraum")),
      unterschriftAN: f(true, qs("Unterschrift Auftragnehmer")),
      unterschriftAG: f(b.ag, qs("Unterschrift Auftraggeber")),
      zeilen,
    };
  });
  // 12 Mengen beim Einlesen von Hand korrigiert (Handschrift im Scan)
  aufmass
    .flatMap((b) => b.zeilen)
    .filter((_, i) => i % 23 === 7)
    .slice(0, 12)
    .forEach((zl) => (zl.menge = korrigiert(zl.menge)));

  // Regie
  const regie: Regiebericht[] = REGIE.map((r, i) => {
    const id = `rb-${r.nr.slice(3)}`;
    dok(id, "regie", `${r.nr}_${r.datum}.pdf`, r.datum, 1);
    const qr = (stelle: string, y: number) => q(id, 1, stelle, [60, y, 470, 24]);
    const rb: Regiebericht = {
      nr: f(r.nr, qr("Berichtsnummer", 90)),
      dokumentId: id,
      datum: f(r.datum, qr("Datum", 90)),
      taetigkeit: f(r.text, qr("Tätigkeit", 160)),
      stundenMonteur: f(r.m, qr("Stunden Monteur", 300)),
      stundenHelfer: f(r.h, qr("Stunden Helfer", 330)),
      material: f(r.material, qr("Material", 420)),
      unterschriftAG: f(r.unterschrieben, qr("Unterschrift Auftraggeber", 720)),
    };
    if (i < 10) rb.stundenMonteur = korrigiert(rb.stundenMonteur);
    return rb;
  });

  dok("stundenliste-kw23", "stundenliste", "Stundenliste_KW23_2026.xlsx", "2026-06-08", 1);
  const qsl = (stelle: string) => q("stundenliste-kw23", 1, stelle, [40, 220, 515, 22]);
  const stundenlisten = [
    {
      dokumentId: "stundenliste-kw23",
      von: f("2026-06-01", qsl("Kopf")),
      bis: f("2026-06-07", qsl("Kopf")),
      eintraege: [{ regieNr: f("RB-11", qsl("Zeile RB-11")), stundenMonteur: f(2_100, qsl("Zeile RB-11, Monteur")), stundenHelfer: f(1_600, qsl("Zeile RB-11, Helfer")) }],
    },
  ];

  // Entwurf der Schlussrechnung (vom Projektleiter, vor der Prüfung)
  dok("sr-entwurf", "sr_entwurf", "Schlussrechnung_Entwurf_PL.xlsx", "2026-10-20", 22);
  const entwurfZeilen: RechnungsZeile[] = [];
  pos.forEach((p, i) => {
    const menge = entwurfMenge(p);
    if (menge === 0) return;
    const qe = q("sr-entwurf", Math.floor(i / LV_ZEILEN) + 1, `Pos. ${p.nr}`, zeileBox(i, LV_ZEILEN));
    entwurfZeilen.push({ typ: "lv", positionNr: f(p.nr, qe), menge: f(menge, qe), ep: f(p.ep, qe), betrag: f(entwurfZeilenBetrag(p), qe) });
  });
  const qeR = (stelle: string) => q("sr-entwurf", 20, stelle);
  for (const r of REGIE.filter((x) => x.ar !== null)) entwurfZeilen.push({ typ: "regie", regieNr: f(r.nr, qeR(`Regie ${r.nr}`)), betrag: f(regieBetrag(r), qeR(`Regie ${r.nr}`)) });
  const qz = q("sr-entwurf", 21, "Zusatzposition Z-01", [40, 180, 515, 22]);
  entwurfZeilen.push({ typ: "zusatz", positionNr: f("Z-01", qz), text: f("Kernbohrungen DN 100", qz), menge: f(1_200, qz), ep: f(18_000, qz), betrag: f(216_000, qz) });
  const entwurfSumme = summeZeilen(entwurfZeilen);
  if (entwurfSumme !== ENTWURF_SUMME) throw new Error(`Entwurf ${entwurfSumme} ≠ ${ENTWURF_SUMME}`);
  const entwurf: Rechnung = {
    nr: f("SR-Entwurf", q("sr-entwurf", 1, "Kopf")),
    dokumentId: "sr-entwurf",
    art: "schluss_entwurf",
    datum: f("2026-10-20", q("sr-entwurf", 1, "Kopf")),
    zeilen: entwurfZeilen,
    summe: f(entwurfSumme, q("sr-entwurf", 22, "Summe Leistung")),
  };

  // Abschlagsrechnungen: kumulativer Leistungsstand, Teilbetrag einer Pauschale gleicht auf den Zielbetrag aus
  const AR_DATUM = ["2026-03-31", "2026-06-30", "2026-09-30"];
  const gewicht = (p: PosMeta) => {
    if (p.einheit === "psch") return 0.5;
    const [vor] = BLATT_JE_ULG[`${p.lg}.${p.ulg}`];
    return vor ? 1.5 : 0.75;
  };
  const imSchema = pos.filter((p) => !AR_TEILLEISTUNG.includes(p.nr) && p.nr !== G3 && entwurfMenge(p) > 0);
  const kumuliert = (p: PosMeta, fr: number) => abrunden(Math.round(Math.min(1, fr * gewicht(p)) * entwurfMenge(p)), p.einheit);
  const abschlaege: Rechnung[] = [];
  let vorher = 0;
  for (let k = 0; k < 3; k++) {
    const id = `ar-${k + 1}`;
    const nr = `AR${k + 1}`;
    const tl = P.get(AR_TEILLEISTUNG[k])!;
    const regieK = REGIE.filter((r) => r.ar === k);
    const fix = regieK.reduce((s, r) => s + regieBetrag(r), 0) + (k === 2 ? 544_080 + 216_000 : 0);
    const roh = (fr: number) => imSchema.reduce((s, p) => s + betragAusMenge(kumuliert(p, fr) - kumuliert(p, vorher), p.ep), 0) + fix;
    let fr = vorher;
    while (fr < 1.5 && AR_ZIELE[k] - roh(fr) > tl.ep - 100_000) fr += 0.0005;
    const teil = AR_ZIELE[k] - roh(fr);
    if (teil < 100_000 || teil > tl.ep - 100_000) throw new Error(`${nr}: Teilbetrag ${teil} außerhalb von ${tl.nr}`);
    dok(id, "abschlag", `${nr}_W21-B_HKLS.pdf`, AR_DATUM[k], 12);
    const zeilen: RechnungsZeile[] = [];
    imSchema.forEach((p, i) => {
      const menge = kumuliert(p, fr) - kumuliert(p, vorher);
      if (menge === 0) return;
      const qa = q(id, Math.floor(i / 30) + 1, `Pos. ${p.nr}`, zeileBox(i, 30));
      zeilen.push({ typ: "lv", positionNr: f(p.nr, qa), menge: f(menge, qa), ep: f(p.ep, qa), betrag: f(betragAusMenge(menge, p.ep), qa) });
    });
    const qt = q(id, 11, `Pos. ${tl.nr} nach Leistungsstand`);
    zeilen.push({ typ: "lv", positionNr: f(tl.nr, qt), menge: f(Math.round((teil * 100) / tl.ep), qt), ep: f(tl.ep, qt), betrag: f(teil, qt), teilleistung: true });
    for (const r of regieK) zeilen.push({ typ: "regie", regieNr: f(r.nr, q(id, 12, `Regie ${r.nr}`)), betrag: f(regieBetrag(r), q(id, 12, `Regie ${r.nr}`)) });
    if (k === 2) {
      const qg = q(id, 9, `Pos. ${G3}`, [40, 410, 515, 22]);
      zeilen.push({ typ: "lv", positionNr: f(G3, qg), menge: f(4_800, qg), ep: f(11_260, qg), betrag: f(544_080, qg) });
      const qz3 = q(id, 12, "Zusatzposition Z-01", [40, 520, 515, 22]);
      zeilen.push({ typ: "zusatz", positionNr: f("Z-01", qz3), text: f("Kernbohrungen DN 100", qz3), menge: f(1_200, qz3), ep: f(18_000, qz3), betrag: f(216_000, qz3) });
    }
    const s = summeZeilen(zeilen);
    if (s !== AR_ZIELE[k]) throw new Error(`${nr}: ${s} ≠ ${AR_ZIELE[k]}`);
    abschlaege.push({ nr: f(nr, q(id, 1, "Kopf")), dokumentId: id, art: "abschlag", datum: f(AR_DATUM[k], q(id, 1, "Kopf")), zeilen, summe: f(s, q(id, 12, "Summe")) });
    vorher = fr;
  }

  // GU-Korrekturblatt AR3 und Zahlungen nach der Rechenregel aus Demo_Faelle.md
  dok("gu-korrektur-ar3", "gu_korrektur", "GU_Korrekturblatt_AR3.pdf", "2026-10-14", 2);
  const qk3 = (stelle: string, y: number) => q("gu-korrektur-ar3", 1, stelle, [40, y, 515, 22]);
  const korrekturblaetter = [
    {
      dokumentId: "gu-korrektur-ar3",
      rechnungNr: f("AR3", qk3("Kopf", 90)),
      datum: f("2026-10-14", qk3("Kopf", 90)),
      zeilen: [
        { positionNr: f(G3, qk3(`Pos. ${G3}`, 260)), kuerzung: f(3_600, qk3(`Pos. ${G3}`, 260)), grund: f("Rechenfehler", qk3(`Pos. ${G3}`, 260)) },
        { positionNr: f("Z-01", qk3("Pos. Z-01", 290)), kuerzung: f(216_000, qk3("Pos. Z-01", 290)), grund: f("nicht beauftragt", qk3("Pos. Z-01", 290)) },
      ],
    },
  ];
  const ZAHL_DATUM = ["2026-04-28", "2026-07-29", "2026-10-21"];
  const zahlungen: Zahlung[] = abschlaege.map((ar, k) => {
    const kuerzung = k === 2 ? 219_600 : 0;
    const basis = ar.summe.wert - kuerzung;
    const nachNachlass = basis - prozent(basis, 300);
    const vorEinbehalt = nachNachlass - prozent(nachNachlass, 80) - prozent(nachNachlass, 50);
    const betrag = vorEinbehalt - prozent(vorEinbehalt, 500);
    const id = dok(`zahlung-ar${k + 1}`, "zahlung", `Zahlungsavis_AR${k + 1}.pdf`, ZAHL_DATUM[k], 1);
    const qzl = q(id, 1, "Zahlbetrag", [300, 400, 255, 24]);
    return { dokumentId: id, rechnungNr: f(`AR${k + 1}`, q(id, 1, "Bezug")), datum: f(ZAHL_DATUM[k], q(id, 1, "Datum")), betrag: f(betrag, qzl) };
  });

  // Vertrag, Index, GU-Abzugsschreiben
  const qv = (seite: number, stelle: string) => q("vertrag", seite, stelle);
  const vertrag = {
    datum: f("2025-11-14", qv(1, "Kopf")),
    norm: f("ÖNORM B 2110", qv(2, "Pkt. 1.2")),
    auftragssumme: f(AUFTRAGSSUMME, qv(3, "Pkt. 2.1")),
    regiesatzMonteur: f(REGIE_MONTEUR, qv(6, "Pkt. 6.3")),
    regiesatzHelfer: f(REGIE_HELFER, qv(6, "Pkt. 6.3")),
    mittellohnpreis: f(MITTELLOHNPREIS, q("k7", 1, "Kopf, Mittellohnpreis laut K3")),
    saetze: [
      { art: "nachlass" as const, satz: f(300, qv(5, "Pkt. 5.1")), punkt: "5.1", phase: "beide" as const },
      { art: "baustrom_bauwasser" as const, satz: f(80, qv(4, "Pkt. 4.6")), punkt: "4.6", phase: "beide" as const },
      { art: "deckungsruecklass" as const, satz: f(500, qv(9, "Pkt. 9.1")), punkt: "9.1", phase: "abschlag" as const },
      { art: "haftruecklass" as const, satz: f(300, qv(9, "Pkt. 9.2")), punkt: "9.2", phase: "schluss" as const },
    ],
    preisgleitung: {
      punkt: "7.2",
      stichtag: f("2026-05-01", qv(7, "Pkt. 7.2")),
      lohnanteil: f(4000, qv(7, "Pkt. 7.2")),
      indexName: f("Index Lohn", qv(7, "Pkt. 7.2")),
    },
    pauschalen: [
      {
        kategorie: f("baustelleneinrichtung", qv(4, "Pkt. 4.3")),
        punkt: "4.3",
        text: f("Baustelleneinrichtung samt allen Umstellungen während der Bauzeit ist in den Einheitspreisen enthalten.", qv(4, "Pkt. 4.3")),
      },
    ],
  };
  dok("indexblatt", "indexblatt", "Indexblatt_Lohn_2026-09.pdf", "2026-10-05", 1);
  const indexblatt = {
    dokumentId: "indexblatt",
    name: f("Index Lohn", q("indexblatt", 1, "Titel")),
    basis: f(12_500, q("indexblatt", 1, "Basis Angebotsmonat 09/2025", [60, 300, 470, 22])),
    aktuell: f(12_975, q("indexblatt", 1, "Stand 09/2026", [60, 330, 470, 22])),
    stand: f("2026-09-30", q("indexblatt", 1, "Stand")),
  };
  dok("gu-abzug", "gu_abzug", "GU_Abzugsschreiben_Umlagen.pdf", "2026-03-05", 1);
  const guAbzug = {
    dokumentId: "gu-abzug",
    datum: f("2026-03-05", q("gu-abzug", 1, "Datum")),
    abzuege: [
      { art: "baustrom_bauwasser" as const, satz: f(80, q("gu-abzug", 1, "Absatz 1", [60, 260, 470, 22])) },
      { art: "bauschadensumlage" as const, satz: f(50, q("gu-abzug", 1, "Absatz 2", [60, 300, 470, 22])) },
    ],
  };

  // Pläne: 8 Pläne in den Indizes C, D, E
  const PLAENE: [string, string, string[]][] = [
    ["H-101", "Heizung Keller und Technikraum", ["2026-01-20", "2026-03-18", "2026-06-10"]],
    ["H-201", "Heizung Regelgeschoß Stiege 2", ["2026-02-12", "2026-04-03", "2026-07-15"]],
    ["H-202", "Heizung Regelgeschoß Stiege 1 und 3", ["2026-02-12", "2026-04-20", "2026-07-15"]],
    ["S-101", "Sanitär Keller und Grundleitungen", ["2026-01-20", "2026-03-11", "2026-05-27"]],
    ["S-201", "Sanitär Regelgeschoß", ["2026-02-05", "2026-04-09", "2026-06-24"]],
    ["L-301", "Lüftung Keller und Technikzentrale", ["2026-01-28", "2026-03-25", "2026-06-02"]],
    ["L-310", "Lüftung Stiege 3", ["2026-02-18", "2026-04-15", "2026-06-22"]],
    ["M-401", "MSR Anlagenschema", ["2026-02-25", "2026-05-12", "2026-08-19"]],
  ];
  const plaene: Plan[] = [];
  for (const [nr, titel, daten] of PLAENE) {
    ["C", "D", "E"].forEach((index, i) => {
      const id = `plan-${nr.toLowerCase()}-${index.toLowerCase()}`;
      dok(id, "plan", `${nr}_${titel.replace(/[ ,]+/g, "_")}_Index_${index}.pdf`, daten[i], 1);
      const qp = (stelle: string, box?: [number, number, number, number]) => q(id, 1, stelle, box);
      const vermerke: Plan["vermerke"] = [];
      if (nr === "H-201" && index === "C")
        vermerke.push({ typ: "stand" as const, positionNr: f(J1, qp("Grundriss Top 7 bis 13")), text: f("1 Heizkörper Typ 22, 600/1000 je Top 7 bis 13", qp("Grundriss Top 7 bis 13", [80, 260, 420, 180])) });
      if (nr === "H-201" && index === "D")
        vermerke.push({
          typ: "aenderung" as const,
          positionNr: f(J1, qp("Änderungswolke Top 7 bis 13")),
          text: f("Räume Top 7 bis 13 geteilt, je Top 2 Heizkörper zusätzlich (14 Stk)", qp("Änderungswolke Top 7 bis 13", [70, 250, 440, 200])),
        });
      if (nr === "L-310" && index === "E")
        vermerke.push({ typ: "stand" as const, positionNr: f(J7, qp("Trasse Abluft Gang")), text: f("Trasse Abluft Stiege 3 über den Gang, Wickelfalzrohr DN 200", qp("Trasse Abluft Gang", [60, 300, 460, 120])) });
      plaene.push({ dokumentId: id, planNr: f(nr, qp("Planstempel")), index: f(index, qp("Planstempel", [380, 740, 180, 60])), datum: f(daten[i], qp("Planstempel")), titel: f(titel, qp("Planstempel")), vermerke });
    });
  }

  // Mails: 50 Originale + 7 Duplikate
  const mails: Mail[] = [];
  const mail = (id: string, datum: string, von: string, an: string, betreff: string, kategorie: Mail["kategorie"]["wert"], extra: Partial<Mail> = {}) => {
    dok(id, "mail", `${datum}_${betreff.replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, "_").slice(0, 40)}.eml`, datum, 1);
    const qm = (stelle: string, box?: [number, number, number, number]) => q(id, 1, stelle, box);
    mails.push({
      dokumentId: id,
      datum: f(datum, qm("Kopf, Datum")),
      von: f(von, qm("Kopf, Von")),
      an: f(an, qm("Kopf, An")),
      betreff: f(betreff, qm("Kopf, Betreff")),
      kategorie: f(kategorie, qm("Inhalt")),
      zitat: null,
      bezugPositionen: f([], qm("Inhalt")),
      bezugPlanIndex: null,
      anmeldung: null,
      ...extra,
    });
  };
  const GU = "Bauleitung Hochbau Beispiel GmbH";
  const AN = "Bauleitung Haustechnik Beispiel GmbH";
  const qz1 = (id: string, box: [number, number, number, number]) => q(id, 1, "Absatz 2", box);
  mail("mail-0407-heizkoerper", "2026-04-07", GU, AN, "W21-B Stiege 2 Planindex D Heizung", "anweisung", {
    zitat: f("Bitte die zusätzlichen Heizkörper gleich mitmachen, damit wir beim Estrich nicht warten müssen.", qz1("mail-0407-heizkoerper", [60, 330, 470, 40])),
    bezugPositionen: f([J1], q("mail-0407-heizkoerper", 1, "Absatz 1")),
    bezugPlanIndex: f("H-201 D", q("mail-0407-heizkoerper", 1, "Anhang")),
  });
  mail("mail-0314-technikraum", "2026-03-14", AN, GU, "Anmeldung Mehrkosten Umplanung Technikraum", "anmeldung", {
    zitat: f("Wir melden Mehrkosten für die Umplanung des Technikraums (Verteiler versetzt) an. Aufwand laut unserer Kalkulation rund 96 Stunden, Material rund 2.900 Euro.", qz1("mail-0314-technikraum", [60, 300, 470, 60])),
    anmeldung: {
      gegenstand: f("Umplanung Technikraum Keller", q("mail-0314-technikraum", 1, "Betreff")),
      kategorie: f("planaenderung", q("mail-0314-technikraum", 1, "Absatz 1")),
      stunden: f(9_600, q("mail-0314-technikraum", 1, "Absatz 2")),
      material: f(290_000, q("mail-0314-technikraum", 1, "Absatz 2")),
      bepreist: f(false, q("mail-0314-technikraum", 1, "Absatz 3")),
    },
  });
  mail("mail-0520-container", "2026-05-20", AN, GU, "Mehraufwand Container versetzt", "anmeldung", {
    zitat: f("Der Container musste wegen der Kranstellung zweimal versetzt werden. Aufwand rund 16 Stunden plus Kran.", qz1("mail-0520-container", [60, 300, 470, 40])),
    anmeldung: {
      gegenstand: f("Container der Baustelleneinrichtung zweimal versetzt", q("mail-0520-container", 1, "Betreff")),
      kategorie: f("baustelleneinrichtung", q("mail-0520-container", 1, "Absatz 1")),
      stunden: f(1_600, q("mail-0520-container", 1, "Absatz 2")),
      material: f(27_120, q("mail-0520-container", 1, "Absatz 2")),
      bepreist: f(false, q("mail-0520-container", 1, "Absatz 3")),
    },
  });
  mail("mail-0702-termin", "2026-07-02", GU, AN, "Terminplan Stiege 2", "terminaenderung", {
    zitat: f("Bitte die Fertigstellung Stiege 2 um drei Wochen vorziehen.", qz1("mail-0702-termin", [60, 300, 470, 24])),
  });
  // Gegenproben: Anweisung zu einer voll verrechneten Position, bereits bepreiste Anmeldung
  mail("mail-0610-vorwand", "2026-06-10", GU, AN, "Vorwandelemente Stiege 1", "anweisung", {
    zitat: f("Bitte die WC-Elemente in Stiege 1 vorziehen.", qz1("mail-0610-vorwand", [60, 300, 470, 24])),
    bezugPositionen: f(["24.04.01A"], q("mail-0610-vorwand", 1, "Absatz 1")),
  });
  mail("mail-0901-zaehler", "2026-09-01", AN, GU, "Nachtragsangebot Zählerumbau", "anmeldung", {
    anmeldung: {
      gegenstand: f("Zählerumbau Stiege 3", q("mail-0901-zaehler", 1, "Betreff")),
      kategorie: f("planaenderung", q("mail-0901-zaehler", 1, "Absatz 1")),
      stunden: f(1_200, q("mail-0901-zaehler", 1, "Absatz 2")),
      material: f(48_000, q("mail-0901-zaehler", 1, "Absatz 2")),
      bepreist: f(true, q("mail-0901-zaehler", 1, "Anhang Nachtragsangebot")),
    },
  });
  const BETREFFE = [
    "Protokoll Baubesprechung",
    "Terminabstimmung Montage",
    "Lieferavis Material",
    "Rückfrage Schlitzplan",
    "Abstimmung Brandschutz",
    "Zutritt Baustelle Wochenende",
    "Plan zur Freigabe",
    "Bemusterung Sanitärobjekte",
    "Kranzeiten",
    "Abnahmetermin Druckprobe",
  ];
  for (let i = 0; i < 44; i++) {
    const tag = new Date(Date.UTC(2026, 0, 12) + i * 6.5 * 86_400_000).toISOString().slice(0, 10);
    mail(`mail-${String(i + 1).padStart(2, "0")}`, tag, i % 3 ? GU : AN, i % 3 ? AN : GU, `${BETREFFE[i % BETREFFE.length]} KW ${2 + Math.floor(i * 0.93)}`, "sonstiges");
  }
  mails.filter((m) => m.kategorie.wert === "sonstiges").slice(0, 5).forEach((m) => (m.datum = korrigiert(m.datum)));
  mails.slice(6, 13).forEach((m) => {
    const original = dokumente.find((d) => d.id === m.dokumentId)!;
    dok(`${m.dokumentId}-kopie`, "mail", original.dateiname.replace(".eml", "_weitergeleitet.eml"), original.datum, 1, original.inhaltHash);
  });

  // Fotos: 35 Originale + 5 Duplikate
  const fotos: Foto[] = [];
  for (let i = 0; i < 35; i++) {
    const nummer = 2280 + i * 3 + (i > 3 ? 2 : 0);
    const name = i === 3 ? "IMG_2291.jpg" : `IMG_${nummer}.jpg`;
    const id = i === 3 ? "foto-img-2291" : `foto-${String(i + 1).padStart(2, "0")}`;
    const datum = i === 3 ? "2026-05-14" : new Date(Date.UTC(2026, 1, 2) + i * 6 * 86_400_000).toISOString().slice(0, 10);
    dok(id, "foto", name, datum, 1);
    const qf = (stelle: string) => q(id, 1, stelle);
    const foto: Foto = {
      dokumentId: id,
      exifDatum: f(i === 3 ? "2026-05-14T09:42" : `${datum}T${String(8 + (i % 8)).padStart(2, "0")}:15`, qf("EXIF Aufnahmedatum")),
      ort: f(i === 3 ? "Stiege 2, Top 9, Zimmer 2" : `Stiege ${(i % 3) + 1}`, qf("Zuordnung")),
      bezugPositionen: f(i === 3 ? [J1] : [], qf("Zuordnung")),
    };
    if (i >= 31) foto.exifDatum = korrigiert(foto.exifDatum);
    fotos.push(foto);
  }
  fotos.slice(10, 15).forEach((ft) => {
    const original = dokumente.find((d) => d.id === ft.dokumentId)!;
    dok(`${ft.dokumentId}-kopie`, "foto", original.dateiname.replace(".jpg", " (1).jpg"), original.datum, 1, original.inhaltHash);
  });

  if (korrekturen !== 31) throw new Error(`${korrekturen} korrigierte Felder statt 31`);
  if (dokumente.length !== 165) throw new Error(`${dokumente.length} Dokumente statt 165`);

  return {
    projekt: {
      id: "w21-b-hkls",
      kurz: "W21",
      name: "Wohnhausanlage Wien 21",
      los: "Bauplatz B, HKLS-Los",
      auftraggeberId: "hochbau-beispiel",
      status: "sr_vorbereiten",
      schlussrechnungLegenBis: "2026-10-31",
      schlussrechnungGelegt: null,
      schlusszahlung: null,
    },
    vertrag,
    dokumente,
    lv,
    aufmass,
    regie,
    stundenlisten,
    abschlaege,
    entwurf,
    zahlungen,
    plaene,
    mails,
    fotos,
    indexblatt,
    guAbzug,
    korrekturblaetter,
    nachtraege: [],
    zurufe: erzeugeZurufe(),
  };
}

// ---------- Zurufe (WhatsApp, Demo_Faelle.md v2) ----------
// Eigene Belege neben den 165 Ordner-Dokumenten. Z1 bis Z4 stützen vorhandene Posten und nennen bewusst keine
// Stunden (G2 bleibt unverändert); Z5 und Z6 haben keinen Regiebericht und werden neue Posten in Liste 2.

interface ZurufDef {
  nr: string;
  zeitpunkt: string;
  absender: string;
  transkript: string;
  foto: boolean;
  ort: string;
  taetigkeit: string;
  m: number;
  h: number;
  angewiesenVon: string | null;
  positionen: string[];
  regie: string | null;
}

const ZURUFE: ZurufDef[] = [
  { nr: "Z1", zeitpunkt: "2026-05-12T15:20", absender: "Monteur, Trupp 1", transkript: "Stiege 2, Top 7 bis 13: die zusätzlichen Heizkörper nach Plan D sind montiert.", foto: true, ort: "Stiege 2, Top 7 bis 13", taetigkeit: "Zusätzliche Heizkörper nach Plan D montiert", m: 0, h: 0, angewiesenVon: null, positionen: [J1], regie: null },
  { nr: "Z2", zeitpunkt: "2026-06-03T09:05", absender: "Monteur, Trupp 2", transkript: "Steigleitung Stiege 2 kollidiert mit der Lüftung, wir legen um, Bauleitung GU weiß Bescheid.", foto: true, ort: "Stiege 2", taetigkeit: "Steigleitung umgelegt (Kollision Lüftung)", m: 0, h: 0, angewiesenVon: null, positionen: [], regie: "RB-11" },
  { nr: "Z3", zeitpunkt: "2026-06-24T13:40", absender: "Monteur, Trupp 2", transkript: "Heizung Stiege 1 nochmal entleert, der Polier vom GU hat es angeschafft.", foto: false, ort: "Stiege 1", taetigkeit: "Heizung Stiege 1 zusätzlich entleert", m: 0, h: 0, angewiesenVon: "Polier GU", positionen: [], regie: "RB-12" },
  { nr: "Z4", zeitpunkt: "2026-07-21T07:55", absender: "Monteur, Trupp 1", transkript: "Wasserschaden im Keller vom Fremdgewerk, wir haben notabgesperrt.", foto: true, ort: "Keller", taetigkeit: "Notabsperrung nach Wasserschaden", m: 0, h: 0, angewiesenVon: null, positionen: [], regie: "RB-14" },
  { nr: "Z5", zeitpunkt: "2026-08-19T16:10", absender: "Monteur, Trupp 3", transkript: "Top 4 und 5: Waschtischanschlüsse höher gesetzt, Bauleitung GU wollte das. Ein Mann, acht Stunden.", foto: true, ort: "Top 4 und 5", taetigkeit: "Waschtischanschlüsse Top 4 und 5 höher gesetzt", m: 800, h: 0, angewiesenVon: "Bauleitung GU", positionen: [], regie: null },
  { nr: "Z6", zeitpunkt: "2026-09-08T14:30", absender: "Monteur, Trupp 1", transkript: "Stiege 2, Top 9: Heizkörper im Wohnzimmer versetzt, die Küche wurde anders geplant, der Polier vom GU hat es angeschafft. Zwei Mann, sechs Stunden.", foto: true, ort: "Stiege 2, Top 9", taetigkeit: "Heizkörper im Wohnzimmer versetzt", m: 600, h: 600, angewiesenVon: "Polier GU", positionen: [], regie: null },
];

/** Eine Minute nach der Nachricht bestätigt der Absender die Zusammenfassung des Agenten mit „Ja“. */
function eineMinuteSpaeter(zeitpunkt: string): string {
  const t = new Date(`${zeitpunkt}:00Z`);
  t.setUTCMinutes(t.getUTCMinutes() + 1);
  return t.toISOString().slice(0, 16);
}

function erzeugeZurufe(): Zuruf[] {
  return ZURUFE.map((z) => {
    const id = `zuruf-${z.nr.toLowerCase()}`;
    const qt = q(id, 1, "Sprachnachricht, Transkript");
    const qa = q(id, 1, "Zusammenfassung des Agenten, bestätigt");
    return {
      id,
      nr: z.nr,
      kanal: "whatsapp",
      zeitpunkt: z.zeitpunkt,
      absender: z.absender,
      transkript: f(z.transkript, qt),
      foto: z.foto ? `WhatsApp_Bild_${z.zeitpunkt.slice(0, 10)}_${z.zeitpunkt.slice(11, 13)}-${z.zeitpunkt.slice(14, 16)}.jpg` : null,
      ort: f(z.ort, qa),
      taetigkeit: f(z.taetigkeit, qa),
      stundenMonteur: f(z.m, qa),
      stundenHelfer: f(z.h, qa),
      angewiesenVon: z.angewiesenVon ? f(z.angewiesenVon, qa) : null,
      bezugPositionen: f(z.positionen, qa),
      bezugRegie: z.regie ? f(z.regie, qa) : null,
      bestaetigt: { von: z.absender, zeitpunkt: eineMinuteSpaeter(z.zeitpunkt) },
    };
  });
}

function summeZeilen(zeilen: RechnungsZeile[]): number {
  return zeilen.reduce((s, zl) => s + zl.betrag.wert, 0);
}
