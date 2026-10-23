// Firmenzwilling der Demo: Haustechnik Beispiel GmbH (fiktiv) mit 8 Projekten und 4 Auftraggebern.
// W21 ist voll ausgearbeitet (src/demo/w21), P2 bis P8 sind klein, aber echte Datensätze. Fälle und Gegenproben
// wie in product/docs/Demo_Faelle.md v2, Abschnitt „Die 7 weiteren Projekte“. Alles synthetisch.

import type { Auftraggeber, Datensatz, Firmendaten, Projekt } from "@/domain/typen";
import { erzeugeW21 } from "@/demo/w21/erzeuge";
import { ergaenzeSchluss, type SchlussDef } from "./abgeschlossen";
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

/** Projekte ohne Abgleich (Schlussrechnung gelegt oder abgeschlossen): Stammdaten, Vertrag, LV, ggf. Regie. */
function ohneAbgleich(p: Projekt, vertragDatum: string, auftragssumme: number, positionen: PosDef[], regie: ProjektDef["regie"] = []): ProjektDef {
  return def(p, { vertragDatum, auftragssumme, positionen, blaetter: [], regie, abschlaege: [], entwurf: null });
}

const P6 = ohneAbgleich(
  projekt({ id: "p6-rha-w23", kurz: "P6", name: "Reihenhausanlage Wien 23", los: "HKLS", auftraggeberId: "hochbau-beispiel", status: "sr_gelegt", schlussrechnungGelegt: "2026-09-15" }),
  "2025-06-18",
  34_000_000,
  [STAHLROHR(60_000), HK_TYP11(8_400), WASCHTISCH(3_600)],
  // Gegenprobe: würde ohne die Regel „gelegt = kein Abgleich“ als Befund auftauchen
  [{ nr: "RB-04", datum: "2026-07-23", text: "Heizungsanlage nachgeregelt", m: 400, h: 0, material: 0, unterschrieben: true }],
);

// P7 und P8: abgeschlossen, mit Schlussrechnung, Korrekturblatt, Nachträgen und Schlusszahlung (GU-Historie).
// Eingaben aus Demo_Faelle.md, Abschnitt „GC history“; Summen werden in `ergaenzeSchluss` geprüft.
const WICKELFALZ125 = (lv: number) => pos("26.02.03A", "Wickelfalzrohr DN 125 inkl. Formteile", "m", 3_281, lv);

const P7 = def(
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
  {
    vertragDatum: "2024-09-30",
    auftragssumme: 102_000_000,
    positionen: [STAHLROHR(160_000), HK_TYP11(24_000), ABFLUSS(70_000), WASCHTISCH(14_400)],
    blaetter: [
      { nr: "AB-01", datum: "2025-01-31", von: "2025-01-07", bis: "2025-01-24", zeilen: { "22.02.01A": 40_000 } },
      { nr: "AB-02", datum: "2025-02-28", von: "2025-01-27", bis: "2025-02-21", zeilen: { "22.02.01A": 45_000, "24.01.02A": 20_000 } },
      { nr: "AB-03", datum: "2025-03-31", von: "2025-02-24", bis: "2025-03-28", zeilen: { "22.02.01A": 40_000, "24.01.02A": 25_000 } },
      { nr: "AB-04", datum: "2025-04-30", von: "2025-03-31", bis: "2025-04-25", zeilen: { "22.02.01A": 35_000, "22.04.10A": 6_000 } },
      { nr: "AB-05", datum: "2025-05-30", von: "2025-04-28", bis: "2025-05-23", zeilen: { "22.02.01A": 30_000, "22.04.10A": 8_000, "24.01.02A": 20_000 } },
      { nr: "AB-06", datum: "2025-06-30", von: "2025-05-26", bis: "2025-06-27", zeilen: { "22.04.10A": 6_000, "24.01.02A": 20_000, "24.05.03A": 6_000 } },
      { nr: "AB-07", datum: "2025-07-31", von: "2025-06-30", bis: "2025-07-25", zeilen: { "22.04.10A": 4_000, "24.05.03A": 5_000 } },
      { nr: "AB-08", datum: "2025-09-30", von: "2025-08-25", bis: "2025-09-26", zeilen: { "24.05.03A": 3_400 } },
      // 12 Heizkörper über der LV-Menge, vom GU nicht gegengezeichnet: Kürzung in der Schlussrechnung
      { nr: "AB-09", datum: "2025-10-31", von: "2025-09-29", bis: "2025-10-24", zeilen: { "22.04.10A": 1_200 }, gegengezeichnet: false },
    ],
    regie: [
      { nr: "RB-01", datum: "2025-02-13", text: "Provisorische Beheizung Rohbau Stiege 1", m: 4_000, h: 4_000, material: 124_000, unterschrieben: true },
      { nr: "RB-02", datum: "2025-04-09", text: "Bestandsleitung Nachbarhaus umgeschlossen", m: 6_400, h: 6_400, material: 230_000, unterschrieben: true },
      { nr: "RB-03", datum: "2025-05-21", text: "Druckprobe nach Beschädigung durch Fremdgewerk wiederholt", m: 3_200, h: 0, material: 48_640, unterschrieben: true },
      { nr: "RB-04", datum: "2025-07-02", text: "Steigleitung Stiege 2 wegen Fremdgewerk umgelegt", m: 4_800, h: 4_800, material: 187_500, unterschrieben: true },
      { nr: "RB-05", datum: "2025-09-17", text: "Heizungsverteiler Tiefgarage nachgerüstet", m: 5_600, h: 4_000, material: 278_439, unterschrieben: true },
    ],
    abschlaege: [],
    entwurf: null,
  },
);

const P7_SCHLUSS: SchlussDef = {
  datum: "2025-11-20",
  summe: 108_299_019,
  // Gedruckt 59.446,40 € statt 144 × 412,00 = 59.328,00 €
  gedruckt: { "24.05.03A": 5_944_640 },
  regie: ["RB-01", "RB-02", "RB-03", "RB-04", "RB-05"],
  nachtraege: [
    { nr: "N1", titel: "Zusätzliche Heizkreisverteiler", betrag: 864_000, beauftragt: true, datum: "2025-03-12" },
    { nr: "N2", titel: "Umlegung Grundleitung", betrag: 312_000, beauftragt: true, datum: "2025-05-07" },
    { nr: "N3", titel: "Mehrkosten Winterbau", betrag: 248_000, beauftragt: false, datum: "2025-02-20" },
  ],
  saetze: [
    { art: "nachlass", satz: 300, punkt: "5.1", phase: "beide" },
    { art: "baustrom_bauwasser", satz: 80, punkt: "4.6", phase: "beide" },
    { art: "haftruecklass", satz: 300, punkt: "9.2", phase: "schluss" },
  ],
  ohneVertragspunkt: [{ art: "bauschadensumlage", satz: 50 }],
  kuerzungen: [
    { bezug: "22.04.10A", grund: "aufmass_nicht_gegengezeichnet", text: "Aufmaß AB-09 nicht gegengezeichnet" },
    { bezug: "24.05.03A", grund: "rechenfehler", text: "Rechenfehler" },
  ],
  korrekturDatum: "2026-01-22",
  abschlagszahlungen: 90_500_000,
  zahlungDatum: "2026-02-18",
};

const P8 = def(
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
  {
    vertragDatum: "2024-03-14",
    auftragssumme: 148_000_000,
    positionen: [KUPFERROHR(180_000), HK_TYP22(21_000), WICKELFALZ160(90_000), WASCHTISCH(24_000), WICKELFALZ125(40_000)],
    blaetter: [
      { nr: "AB-01", datum: "2024-06-28", von: "2024-05-06", bis: "2024-06-21", zeilen: { "22.03.06A": 60_000 } },
      { nr: "AB-02", datum: "2024-09-30", von: "2024-06-24", bis: "2024-09-27", zeilen: { "22.03.06A": 70_000, "26.02.05A": 30_000 } },
      { nr: "AB-03", datum: "2024-12-20", von: "2024-09-30", bis: "2024-12-13", zeilen: { "22.03.06A": 50_000, "26.02.05A": 30_000, "22.04.12A": 8_000 } },
      { nr: "AB-04", datum: "2025-02-28", von: "2025-01-07", bis: "2025-02-21", zeilen: { "26.02.05A": 30_000, "22.04.12A": 8_000, "26.02.03A": 20_000, "24.05.03A": 10_000 } },
      { nr: "AB-05", datum: "2025-04-30", von: "2025-02-24", bis: "2025-04-25", zeilen: { "22.04.12A": 5_000, "26.02.03A": 20_000, "24.05.03A": 8_000 } },
      { nr: "AB-06", datum: "2025-05-30", von: "2025-04-28", bis: "2025-05-23", zeilen: { "24.05.03A": 6_000 } },
    ],
    regie: [
      { nr: "RB-03", datum: "2024-11-14", text: "Notabsperrung nach Wasserschaden Ebene 1", m: 3_000, h: 3_000, material: 120_450, unterschrieben: true },
      // Nicht unterschrieben und trotzdem verrechnet: Kürzung in der Schlussrechnung
      { nr: "RB-09", datum: "2025-05-12", text: "Leitungen wegen Fremdgewerk umgelegt, Ebene 3", m: 2_000, h: 1_600, material: 17_400, unterschrieben: false },
    ],
    abschlaege: [],
    entwurf: null,
  },
);

const P8_SCHLUSS: SchlussDef = {
  datum: "2025-06-30",
  summe: 150_694_000,
  // 450 m verrechnet, 400 m aufgemessen
  menge: { "26.02.03A": 45_000 },
  regie: ["RB-03", "RB-09"],
  nachtraege: [
    { nr: "N1", titel: "Zusätzliche Kühlung Serverraum", betrag: 1_240_000, beauftragt: true, datum: "2024-10-08" },
    { nr: "N2", titel: "Sanitäre Mehrmengen Wellnessbereich", betrag: 586_000, beauftragt: true, datum: "2025-01-29" },
  ],
  saetze: [
    { art: "nachlass", satz: 200, punkt: "5.1", phase: "beide" },
    { art: "haftruecklass", satz: 300, punkt: "9.2", phase: "schluss" },
  ],
  ohneVertragspunkt: [],
  kuerzungen: [
    { bezug: "RB-09", grund: "regie_nicht_unterschrieben", text: "Regiebericht nicht unterschrieben" },
    { bezug: "26.02.03A", grund: "menge_ohne_aufmass", text: "Menge über Aufmaß" },
  ],
  korrekturDatum: "2025-08-21",
  abschlagszahlungen: 132_000_000,
  zahlungDatum: "2025-09-12",
};

export function erzeugeKleineProjekte(): Datensatz[] {
  return [
    ...[P2, P3, P4, P5, P6].map(baueProjekt),
    ergaenzeSchluss(baueProjekt(P7), P7_SCHLUSS),
    ergaenzeSchluss(baueProjekt(P8), P8_SCHLUSS),
  ];
}

export function erzeugeFirma(): Firmendaten {
  return {
    synthetisch: true,
    firma: { id: "haustechnik-beispiel", name: "Haustechnik Beispiel GmbH", gewerk: "HKLS", sitz: "Wien" },
    auftraggeber: AUFTRAGGEBER,
    projekte: [erzeugeW21(), ...erzeugeKleineProjekte()],
    stichtag: STICHTAG,
  };
}
