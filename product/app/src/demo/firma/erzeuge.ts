// Firmenzwilling der Demo: Haustechnik Beispiel GmbH (fiktiv) mit 8 Projekten und 4 Auftraggebern.
// W21 ist voll ausgearbeitet (src/demo/w21), P2 bis P8 sind klein, aber echte Datensätze. Fälle und Gegenproben
// wie in product/docs/Demo_Faelle.md v2, Abschnitt „Die 7 weiteren Projekte“. Alles synthetisch.

import type { Auftraggeber, Datensatz, Firmendaten, Projekt } from "@/domain/typen";
import { erzeugeW21 } from "@/demo/w21/erzeuge";
import { baueProjekt, type PosDef, type ProjektDef } from "./bauen";

export const STICHTAG = "2026-10-22";

export const AUFTRAGGEBER: Auftraggeber[] = [
  { id: "hochbau-beispiel", name: "Hochbau Beispiel GmbH", art: "gu" },
  { id: "generalbau-beispiel", name: "Generalbau Beispiel AG", art: "gu" },
  { id: "gemeinde-beispielstadt", name: "Gemeinde Beispielstadt", art: "oeffentlich" },
  { id: "wohnbau-beispiel", name: "Wohnbau Beispiel GmbH", art: "bautraeger" },
];

/** Regiesätze laut Vertrag je Auftraggeber (Monteur / Helfer, Cent je Stunde). */
const REGIESATZ: Record<string, [number, number]> = {
  "hochbau-beispiel": [6_250, 5_200],
  "generalbau-beispiel": [6_400, 5_350],
  "gemeinde-beispielstadt": [5_980, 4_990],
  "wohnbau-beispiel": [6_100, 5_100],
};

// Positionen (EP in Cent, LV-Menge in Hundertstel)
const pos = (nr: string, text: string, einheit: PosDef["einheit"], ep: number, lv: number): PosDef => ({ nr, text, einheit, ep, lv });
const STAHLROHR = (lv: number) => pos("22.02.01A", "Stahlrohr DN 20 inkl. Formteile", "m", 2_480, lv);
const KUPFERROHR = (lv: number) => pos("22.03.06A", "Kupferrohr 22 × 1,0 inkl. Formteile", "m", 2_140, lv);
const HK_TYP11 = (lv: number) => pos("22.04.10A", "Plattenheizkörper Typ 11, 600/800, inkl. Ventilunterteil", "Stk", 35_100, lv);
const HK_TYP22 = (lv: number) => pos("22.04.12A", "Plattenheizkörper Typ 22, 600/1000, inkl. Ventilunterteil", "Stk", 45_200, lv);
const DAEMMUNG = (lv: number) => pos("22.06.03A", "Rohrdämmung 13 mm für Rohr 15 mm", "m", 985, lv);
const ABFLUSS = (lv: number) => pos("24.01.02A", "PE-Abflussrohr DN 100 inkl. Formteile", "m", 3_860, lv);
const VERBUNDROHR16 = (lv: number) => pos("24.02.04A", "Mehrschicht-Verbundrohr 16 × 2,0 inkl. Formteile", "m", 1_690, lv);
const WASCHTISCH = (lv: number) => pos("24.05.03A", "Waschtisch komplett montiert", "Stk", 41_200, lv);
const WICKELFALZ160 = (lv: number) => pos("26.02.05A", "Wickelfalzrohr DN 160 inkl. Formteile", "m", 3_820, lv);

function projekt(teil: Pick<Projekt, "id" | "kurz" | "name" | "los" | "auftraggeberId" | "status"> & Partial<Projekt>): Projekt {
  return { schlussrechnungLegenBis: null, schlussrechnungGelegt: null, schlusszahlung: null, ...teil };
}

function def(p: Projekt, rest: Omit<ProjektDef, "projekt" | "regiesatzMonteur" | "regiesatzHelfer" | "mittellohnpreis" | "stichtag">): ProjektDef {
  const [m, h] = REGIESATZ[p.auftraggeberId];
  return { projekt: p, regiesatzMonteur: m, regiesatzHelfer: h, mittellohnpreis: 5_680, stichtag: STICHTAG, ...rest };
}

const P2 = def(
  projekt({ id: "p2-w22-bt3", kurz: "P2", name: "Wohnhausanlage Wien 22", los: "Bauteil 3, HKLS", auftraggeberId: "hochbau-beispiel", status: "in_ausfuehrung" }),
  {
    vertragDatum: "2025-12-02",
    auftragssumme: 86_000_000,
    positionen: [STAHLROHR(140_000), HK_TYP22(18_000), ABFLUSS(52_000), VERBUNDROHR16(60_000), WASCHTISCH(9_600), DAEMMUNG(130_000)],
    blaetter: [
      { nr: "AB-01", datum: "2026-03-20", von: "2026-02-02", bis: "2026-03-13", zeilen: { "22.02.01A": 42_000, "24.01.02A": 26_000 } },
      { nr: "AB-02", datum: "2026-05-29", von: "2026-03-16", bis: "2026-05-22", zeilen: { "22.02.01A": 51_000, "24.01.02A": 18_000, "24.02.04A": 20_000 } },
      { nr: "AB-03", datum: "2026-07-30", von: "2026-05-25", bis: "2026-07-24", zeilen: { "22.02.01A": 30_000, "22.04.12A": 9_000, "24.02.04A": 18_000, "22.06.03A": 60_000 } },
      { nr: "AB-04", datum: "2026-08-31", von: "2026-07-27", bis: "2026-08-28", zeilen: { "22.04.12A": 5_000, "24.02.04A": 14_000, "22.06.03A": 30_000 } },
      // Gegenprobe: nach der letzten AR aufgemessen, kommt in die nächste AR
      { nr: "AB-05", datum: "2026-10-15", von: "2026-09-28", bis: "2026-10-14", zeilen: { "24.05.03A": 4_000 } },
    ],
    regie: [
      { nr: "RB-01", datum: "2026-03-12", text: "Provisorische Beheizung Rohbau Stiege A", m: 800, h: 800, material: 12_400, unterschrieben: true },
      { nr: "RB-02", datum: "2026-05-14", text: "Bauwasseranschluss Stiege B hergestellt", m: 600, h: 0, material: 8_820, unterschrieben: true },
      { nr: "RB-03", datum: "2026-06-11", text: "Provisorische Heizung Stiege A", m: 1_200, h: 1_200, material: 21_430, unterschrieben: true },
      { nr: "RB-04", datum: "2026-07-16", text: "Nacharbeit Entwässerung nach Beschädigung durch Fremdgewerk", m: 400, h: 400, material: 3_160, unterschrieben: true },
      { nr: "RB-05", datum: "2026-08-27", text: "Leitungen umgelegt wegen Fremdgewerk", m: 600, h: 0, material: 3_890, unterschrieben: true },
      { nr: "RB-06", datum: "2026-09-10", text: "Spülung Heizkreis Stiege B", m: 400, h: 0, material: 0, unterschrieben: false },
    ],
    abschlaege: [
      { nr: "AR1", datum: "2026-03-31", regie: ["RB-01"] },
      { nr: "AR2", datum: "2026-06-30", regie: ["RB-02"] },
      // AR3 verrechnet vom Verbundrohr 255 m statt 320 m (zusammen 455 von 520 m): Fall P2-J3
      { nr: "AR3", datum: "2026-09-30", regie: ["RB-04"], arMenge: { "24.02.04A": 25_500 } },
    ],
    entwurf: null,
  },
);

const P3 = def(
  projekt({
    id: "p3-buero-w3",
    kurz: "P3",
    name: "Bürogebäude Wien 3",
    los: "Umbau 4. bis 6. OG, HKLS",
    auftraggeberId: "generalbau-beispiel",
    status: "sr_vorbereiten",
    schlussrechnungLegenBis: "2026-12-04",
  }),
  {
    vertragDatum: "2025-10-21",
    auftragssumme: 41_000_000,
    positionen: [KUPFERROHR(18_000), HK_TYP11(6_400), WICKELFALZ160(24_000), WASCHTISCH(2_400), DAEMMUNG(42_000)],
    blaetter: [
      { nr: "AB-01", datum: "2026-03-27", von: "2026-02-09", bis: "2026-03-20", zeilen: { "22.04.10A": 3_000, "26.02.05A": 12_000 } },
      { nr: "AB-02", datum: "2026-06-26", von: "2026-03-23", bis: "2026-06-19", zeilen: { "22.03.06A": 12_000, "22.04.10A": 3_400, "22.06.03A": 20_000 } },
      { nr: "AB-03", datum: "2026-09-25", von: "2026-06-22", bis: "2026-09-18", zeilen: { "22.03.06A": 11_600, "26.02.05A": 12_000, "24.05.03A": 2_400, "22.06.03A": 22_000 } },
    ],
    regie: [
      { nr: "RB-01", datum: "2026-03-18", text: "Provisorische Kühlung Serverraum 4. OG", m: 1_000, h: 500, material: 18_200, unterschrieben: true },
      { nr: "RB-02", datum: "2026-08-18", text: "Demontage Altanlage 5. OG", m: 1_600, h: 800, material: 41_260, unterschrieben: true },
    ],
    abschlaege: [
      { nr: "AR1", datum: "2026-03-31", regie: ["RB-01"] },
      { nr: "AR2", datum: "2026-06-30", regie: [] },
      // Kupferrohr nur bis zur LV-Menge verrechnet (180 von 236 m): Fall P3-J1
      { nr: "AR3", datum: "2026-09-30", regie: [], arMenge: { "22.03.06A": 6_000 } },
    ],
    entwurf: { datum: "2026-10-19", regie: ["RB-01"], menge: { "22.03.06A": 18_000 } },
  },
);

const P4 = def(
  projekt({ id: "p4-vs-beispielstadt", kurz: "P4", name: "Volksschule Beispielstadt", los: "Zubau, HKLS", auftraggeberId: "gemeinde-beispielstadt", status: "in_ausfuehrung" }),
  {
    vertragDatum: "2025-11-27",
    auftragssumme: 69_000_000,
    positionen: [STAHLROHR(90_000), HK_TYP22(11_000), ABFLUSS(38_000), WASCHTISCH(4_800), WICKELFALZ160(30_000)],
    blaetter: [
      { nr: "AB-01", datum: "2026-03-26", von: "2026-02-16", bis: "2026-03-20", zeilen: { "22.02.01A": 30_000, "24.01.02A": 20_000 } },
      { nr: "AB-02", datum: "2026-06-25", von: "2026-03-23", bis: "2026-06-19", zeilen: { "22.02.01A": 35_000, "24.01.02A": 18_000, "26.02.05A": 14_000 } },
      { nr: "AB-03", datum: "2026-09-24", von: "2026-06-22", bis: "2026-09-18", zeilen: { "22.04.12A": 7_000, "26.02.05A": 12_000, "24.05.03A": 2_000 } },
    ],
    regie: [
      { nr: "RB-01", datum: "2026-02-19", text: "Provisorische Beheizung Container", m: 600, h: 0, material: 9_480, unterschrieben: true },
      { nr: "RB-02", datum: "2026-05-07", text: "Bestandsleitung im Altbau angeschlossen", m: 800, h: 800, material: 14_260, unterschrieben: true },
      { nr: "RB-03", datum: "2026-08-20", text: "Druckprobe nach Beschädigung durch Fremdgewerk wiederholt", m: 400, h: 0, material: 2_180, unterschrieben: true },
      { nr: "RB-04", datum: "2026-07-15", text: "Provisorische Wasserversorgung Container", m: 1_000, h: 0, material: 9_640, unterschrieben: true },
      // Gegenprobe: nach der letzten AR, kommt in die nächste AR
      { nr: "RB-05", datum: "2026-10-08", text: "Heizungsverteiler Turnsaal nachgeregelt", m: 600, h: 0, material: 0, unterschrieben: true },
    ],
    abschlaege: [
      { nr: "AR1", datum: "2026-03-31", regie: ["RB-01"] },
      { nr: "AR2", datum: "2026-06-30", regie: ["RB-02"] },
      { nr: "AR3", datum: "2026-09-30", regie: ["RB-03"] },
    ],
    entwurf: null,
  },
);

const P5 = def(
  projekt({ id: "p5-pflegewohnhaus", kurz: "P5", name: "Pflegewohnhaus Beispielstadt", los: "Sanierung Trakt B", auftraggeberId: "wohnbau-beispiel", status: "in_ausfuehrung" }),
  {
    vertragDatum: "2026-01-12",
    auftragssumme: 52_000_000,
    positionen: [STAHLROHR(70_000), HK_TYP11(9_000), ABFLUSS(30_000), WASCHTISCH(6_000), DAEMMUNG(80_000)],
    blaetter: [
      { nr: "AB-01", datum: "2026-03-27", von: "2026-02-16", bis: "2026-03-20", zeilen: { "22.02.01A": 25_000, "24.01.02A": 15_000 } },
      { nr: "AB-02", datum: "2026-06-26", von: "2026-03-23", bis: "2026-06-19", zeilen: { "22.02.01A": 30_000, "22.04.10A": 4_000, "24.01.02A": 12_000 } },
      { nr: "AB-03", datum: "2026-09-25", von: "2026-06-22", bis: "2026-09-18", zeilen: { "22.04.10A": 3_000, "22.06.03A": 50_000 } },
      // Gegenprobe: nach der letzten AR aufgemessen
      { nr: "AB-04", datum: "2026-10-12", von: "2026-09-21", bis: "2026-10-09", zeilen: { "24.05.03A": 3_000 } },
    ],
    regie: [
      { nr: "RB-01", datum: "2026-04-16", text: "Notabsperrung Bestandsleitung Trakt B", m: 400, h: 400, material: 4_620, unterschrieben: true },
      { nr: "RB-02", datum: "2026-07-09", text: "Provisorische Warmwasserversorgung Station 2", m: 800, h: 0, material: 11_840, unterschrieben: true },
      // Gegenprobe: nach der letzten AR, nicht unterschrieben
      { nr: "RB-03", datum: "2026-10-06", text: "Heizkörper Gemeinschaftsraum getauscht", m: 400, h: 0, material: 0, unterschrieben: false },
    ],
    abschlaege: [
      { nr: "AR1", datum: "2026-03-31", regie: [] },
      { nr: "AR2", datum: "2026-06-30", regie: ["RB-01"] },
      { nr: "AR3", datum: "2026-09-30", regie: ["RB-02"] },
    ],
    entwurf: null,
  },
);

/** Projekte ohne Abgleich (Schlussrechnung gelegt oder abgeschlossen): nur Stammdaten, Vertrag und LV. */
function ohneAbgleich(p: Projekt, vertragDatum: string, auftragssumme: number, positionen: PosDef[]): ProjektDef {
  return def(p, { vertragDatum, auftragssumme, positionen, blaetter: [], regie: [], abschlaege: [], entwurf: null });
}

const P6 = ohneAbgleich(
  projekt({ id: "p6-rha-w23", kurz: "P6", name: "Reihenhausanlage Wien 23", los: "HKLS", auftraggeberId: "hochbau-beispiel", status: "sr_gelegt", schlussrechnungGelegt: "2026-09-15" }),
  "2025-06-18",
  34_000_000,
  [STAHLROHR(60_000), HK_TYP11(8_400), WASCHTISCH(3_600)],
);

const P7 = ohneAbgleich(
  projekt({
    id: "p7-w10-bpa",
    kurz: "P7",
    name: "Wohnhausanlage Wien 10",
    los: "Bauplatz A, HKLS",
    auftraggeberId: "hochbau-beispiel",
    status: "abgeschlossen",
    schlussrechnungGelegt: "2025-11-20",
    schlusszahlung: "2026-02-18",
  }),
  "2024-09-30",
  102_000_000,
  [STAHLROHR(160_000), HK_TYP11(24_000), ABFLUSS(70_000), WASCHTISCH(14_400)],
);

const P8 = ohneAbgleich(
  projekt({
    id: "p8-hotel-w2",
    kurz: "P8",
    name: "Hotel Wien 2",
    los: "Haustechnik Neubau",
    auftraggeberId: "generalbau-beispiel",
    status: "abgeschlossen",
    schlussrechnungGelegt: "2025-06-30",
    schlusszahlung: "2025-09-12",
  }),
  "2024-03-14",
  148_000_000,
  [KUPFERROHR(180_000), HK_TYP22(21_000), WICKELFALZ160(90_000), WASCHTISCH(24_000)],
);

export function erzeugeKleineProjekte(): Datensatz[] {
  return [P2, P3, P4, P5, P6, P7, P8].map(baueProjekt);
}

export function erzeugeFirma(): Firmendaten {
  return {
    firma: { id: "haustechnik-beispiel", name: "Haustechnik Beispiel GmbH", gewerk: "HKLS", sitz: "Wien" },
    auftraggeber: AUFTRAGGEBER,
    projekte: [erzeugeW21(), ...erzeugeKleineProjekte()],
    stichtag: STICHTAG,
  };
}
