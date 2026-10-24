// Position catalogue of the Leistungsverzeichnis of Wohnpark Mooshaim (HKLS, 32 Wohnungen und Tiefgarage; fictitious,
// plausibility only). Number = LG.ULG.Basis + variant letter (A, B, C …); "{v}" in the text is replaced by the variant.
// ep: Einheitspreis of the first variant in cents, schritt: added per further variant. menge: range of the quantity in
// the Leistungsverzeichnis in whole units, or a fixed quantity. Solution list v3: 286 positions, LG 22 Heizung 98,
// LG 24 Sanitär 116, LG 26 Lüftung 54, LG 28 MSR 18.

import type { Einheit } from "../modell";

export interface Basis {
  lg: string;
  ulg: string;
  basis: string;
  text: string;
  einheit: Einheit;
  varianten: readonly string[];
  ep: number;
  schritt: number;
  menge: readonly [number, number];
}

export const EIN = ["–"];
const DN6 = ["DN 15", "DN 20", "DN 25", "DN 32", "DN 40", "DN 50"];

export const basisFuer =
  (lg: string) =>
  (ulgBasis: string, text: string, einheit: Einheit, varianten: readonly string[], ep: number, schritt: number, menge: readonly [number, number]): Basis => {
    const [ulg, basis] = ulgBasis.split(".");
    return { lg, ulg, basis, text, einheit, varianten, ep, schritt, menge };
  };

const h = basisFuer("22");
const s = basisFuer("24");
const l = basisFuer("26");
const m = basisFuer("28");

export const KATALOG: readonly Basis[] = [
  // ---------- LG 22 Heizung ----------
  h("01.01", "Baustelleneinrichtung und Baustellengemeinkosten HKLS, pauschal", "psch", EIN, 0, 0, [1, 1]),
  h("01.02", "Fernwärme-Kompaktstation 160 kW, Lieferung und Montage", "psch", EIN, 2_964_000, 0, [1, 1]),
  h("01.03", "Pufferspeicher 1.000 l mit Dämmung", "Stk", EIN, 238_000, 0, [1, 1]),
  h("01.04", "Membran-Ausdehnungsgefäß {v}", "Stk", ["200 l", "300 l"], 46_800, 15_200, [1, 1]),
  h("01.05", "Hocheffizienz-Umwälzpumpe {v}", "Stk", ["DN 25", "DN 32", "DN 40"], 68_400, 22_600, [1, 3]),
  h("01.06", "Heizungsverteiler mit Dämmschale, {v}", "Stk", ["4 Abgänge", "6 Abgänge"], 124_000, 36_000, [1, 1]),
  h("01.07", "Schlammabscheider mit Magnetit DN 40", "Stk", EIN, 34_200, 0, [1, 1]),
  h("01.08", "Sicherheitsgruppe 3 bar", "Stk", EIN, 19_600, 0, [2, 2]),
  h("01.09", "Erstbefüllung mit aufbereitetem Wasser", "psch", EIN, 152_000, 0, [1, 1]),
  h("02.01", "Stahlrohr nahtlos {v}, inkl. Befestigung", "m", DN6, 2_240, 610, [60, 240]),
  h("02.02", "Pressfitting C-Stahl Bogen 90° {v}", "Stk", DN6, 720, 250, [30, 160]),
  h("02.03", "Pressfitting C-Stahl T-Stück {v}", "Stk", DN6, 960, 300, [20, 110]),
  h("02.04", "Rohrbefestigung mit Schallschutzeinlage, {v}", "Stk", ["DN 15 bis 25", "DN 32 bis 50"], 780, 320, [80, 280]),
  h("02.05", "Wand- und Deckendurchführung mit Brandschutz, {v}", "Stk", ["DN 15 bis 25", "DN 32 bis 50"], 4_040, 1_480, [20, 60]),
  h("02.06", "Rosette verchromt für Heizungsrohr {v}", "Stk", ["15 mm", "22 mm"], 380, 60, [100, 240]),
  h("03.01", "Verteilleitung Mehrschichtverbundrohr {v} inkl. Formteile", "m", ["20 × 2,25", "26 × 3,0", "32 × 3,0"], 1_620, 540, [180, 520]),
  h("03.02", "Anbindeleitung Mehrschichtverbundrohr 16 × 2,0 inkl. Formteile", "m", EIN, 1_390, 0, [1512, 1512]),
  h("03.03", "Pressfitting Mehrschicht Kupplung {v}", "Stk", ["16", "20", "26"], 640, 190, [60, 200]),
  h("03.04", "Rohrbefestigung Mehrschichtverbundrohr {v}", "Stk", ["16 bis 20", "26 bis 32"], 420, 130, [200, 480]),
  h("04.10", "Plattenheizkörper Typ 22 VK, 500/{v}", "Stk", ["800", "1000"], 22_180, 2_680, [12, 18]),
  h("04.12", "Plattenheizkörper Typ 22 VK, 600/{v}", "Stk", ["800", "1000"], 25_420, 3_220, [20, 86]),
  h("04.14", "Badheizkörper 600/1500, weiß, mit Mittelanschluss", "Stk", EIN, 41_200, 0, [32, 32]),
  h("04.15", "Heizkörper-Wandkonsole, Satz", "Stk", EIN, 1_940, 0, [136, 136]),
  h("04.16", "Heizkörper-Bodenkonsole, Satz", "Stk", EIN, 4_480, 0, [8, 14]),
  h("05.01", "Strangregulierventil mit Messnippeln {v}", "Stk", ["DN 15", "DN 20", "DN 25", "DN 32", "DN 40"], 9_080, 2_320, [4, 14]),
  h("05.02", "Kugelhahn mit Entleerung {v}", "Stk", DN6, 1_940, 720, [8, 36]),
  h("05.03", "Thermostatkopf mit eingebautem Fühler", "Stk", EIN, 2_480, 0, [168, 168]),
  h("05.04", "Differenzdruckregler {v}", "Stk", ["DN 20", "DN 25"], 32_800, 4_800, [2, 6]),
  h("05.05", "Schnellentlüfter mit Absperrung", "Stk", EIN, 2_860, 0, [12, 24]),
  h("05.06", "Heizkörper-Anschlussarmatur, absperrbar", "Stk", EIN, 3_860, 0, [168, 168]),
  h("05.07", "Wärmemengenzähler Heizung Funk {v}", "Stk", ["qp 0,6", "qp 1,5"], 19_600, 4_000, [4, 32]),
  h("06.01", "Rohrdämmung 9 mm für Rohr {v}", "m", ["15 mm", "18 mm", "22 mm"], 720, 60, [80, 280]),
  h("06.02", "Rohrdämmung 13 mm für Rohr {v}", "m", ["15 mm", "18 mm", "22 mm", "28 mm", "35 mm"], 880, 70, [120, 380]),
  h("06.03", "Rohrdämmung 20 mm für Rohr {v}", "m", ["22 mm", "28 mm", "35 mm"], 1_340, 200, [60, 200]),
  h("06.04", "Dämmung Stahlrohr Mineralwolle alukaschiert {v}", "m", ["DN 32", "DN 40", "DN 50"], 1_860, 340, [40, 140]),
  h("06.05", "Brandschutz-Rohrummantelung {v}", "m", ["DN 15 bis 25", "DN 32 bis 50"], 3_240, 1_120, [20, 60]),
  h("07.01", "Heizkreisverteiler Wohnung im Unterputzkasten, {v}", "Stk", ["4 Abgänge", "6 Abgänge"], 46_800, 8_600, [10, 22]),
  h("07.02", "Verteilerkasten Unterputz {v}", "Stk", ["550 mm", "750 mm"], 12_400, 2_600, [10, 22]),
  h("07.03", "Wohnungsabsperrung Heizung DN 20", "Stk", EIN, 8_640, 0, [32, 32]),
  h("07.04", "Entleerungshahn DN 15", "Stk", EIN, 1_280, 0, [32, 48]),
  h("08.01", "Druckprobe Heizungsanlage mit Protokoll", "psch", EIN, 176_000, 0, [1, 1]),
  h("08.02", "Spülen der Heizungsanlage", "psch", EIN, 128_000, 0, [1, 1]),
  h("08.03", "Hydraulischer Abgleich mit Protokoll", "psch", EIN, 296_000, 0, [1, 1]),
  h("08.04", "Inbetriebnahme Heizung und Einschulung", "psch", EIN, 148_000, 0, [1, 1]),
  h("08.05", "Dokumentation und Revisionsunterlagen Heizung", "psch", EIN, 96_000, 0, [1, 1]),

  // ---------- LG 24 Sanitär ----------
  s("01.01", "HT-Rohr {v} inkl. Formteile", "m", ["DN 50", "DN 75", "DN 110"], 1_420, 360, [60, 240]),
  s("01.02", "Schallgedämmtes Abwasserrohr {v} inkl. Formteile", "m", ["DN 75", "DN 110", "DN 125"], 3_200, 640, [40, 180]),
  s("01.03", "Bodenablauf mit Geruchsverschluss {v}", "Stk", ["DN 50", "DN 75", "DN 100"], 14_800, 2_900, [6, 24]),
  s("01.04", "Rohrbelüfter DN 110", "Stk", EIN, 9_120, 0, [4, 10]),
  s("01.05", "Rückstauverschluss {v}", "Stk", ["DN 100", "DN 150"], 70_800, 24_800, [1, 2]),
  s("01.06", "Hebeanlage für fäkalienfreies Abwasser", "Stk", EIN, 191_000, 0, [1, 1]),
  s("01.07", "Reinigungsöffnung DN 100", "Stk", EIN, 4_980, 0, [6, 14]),
  s("01.08", "Grundleitung PP {v} inkl. Formteile", "m", ["DN 110", "DN 160"], 3_420, 880, [40, 160]),
  s("02.01", "Wasserzähleranlage mit Absperrungen {v}", "Stk", ["DN 25", "DN 40"], 66_400, 22_800, [1, 1]),
  s("02.02", "Druckminderer mit Filter DN 40", "Stk", EIN, 29_400, 0, [1, 2]),
  s("02.03", "Systemtrenner Typ BA DN 32", "Stk", EIN, 55_200, 0, [1, 1]),
  s("02.04", "Mehrschichtverbundrohr 16 × 2,25 inkl. Formteile und Dämmung, Trinkwasser", "m", EIN, 1_640, 0, [600, 980]),
  s("02.05", "Mehrschichtverbundrohr {v} inkl. Formteile und Dämmung, Trinkwasser", "m", ["20 × 2,25", "26 × 3,0", "32 × 3,0", "40 × 3,5"], 1_980, 560, [80, 420]),
  s("02.06", "Edelstahlrohr Trinkwasser {v} inkl. Pressfittings", "m", ["22 × 1,2", "28 × 1,2", "35 × 1,5"], 2_700, 480, [40, 200]),
  s("02.07", "Zirkulationsregulierventil thermostatisch {v}", "Stk", ["DN 15", "DN 20"], 13_200, 2_500, [6, 20]),
  s("02.08", "Absperrventil Strang {v}", "Stk", ["DN 20", "DN 25", "DN 32"], 4_260, 940, [8, 28]),
  s("03.01", "WC wandhängend spülrandlos, mit Sitz, {v}", "Stk", ["Standard", "barrierefrei"], 29_600, 12_400, [4, 32]),
  s("03.02", "Waschtisch Keramik {v}", "Stk", ["55 cm", "60 cm", "65 cm"], 17_400, 2_500, [6, 24]),
  s("03.03", "Handwaschbecken 45 cm", "Stk", EIN, 11_600, 0, [28, 32]),
  s("03.04", "Duschwanne bodeneben mit Rinne {v}", "Stk", ["90 × 90", "90 × 120", "100 × 140"], 50_200, 8_900, [4, 16]),
  s("03.05", "Badewanne Stahl mit Wannenträger {v}", "Stk", ["170 × 75", "180 × 80"], 42_600, 6_600, [4, 14]),
  s("03.06", "Küchenspüle Anschluss mit Eckventilen", "Stk", EIN, 6_640, 0, [32, 32]),
  s("03.07", "Waschmaschinenanschluss mit Geruchsverschluss", "Stk", EIN, 6_020, 0, [32, 32]),
  s("03.08", "Ausgussbecken mit Klappgitter", "Stk", EIN, 24_400, 0, [1, 2]),
  s("03.09", "Haltegriff barrierefrei {v}", "Stk", ["60 cm", "Stützklappgriff"], 8_900, 8_200, [2, 6]),
  s("04.01", "Montageelement WC mit UP-Spülkasten, {v}", "Stk", ["Bauhöhe 112 cm", "barrierefrei"], 25_600, 8_900, [4, 32]),
  s("04.02", "Montageelement Waschtisch, {v}", "Stk", ["Standard", "mit UP-Siphon"], 9_940, 4_340, [6, 32]),
  s("04.03", "Montageelement Dusche mit Ablaufrinne", "Stk", EIN, 22_100, 0, [4, 16]),
  s("04.04", "Betätigungsplatte WC, {v}", "Stk", ["Kunststoff weiß", "Edelstahl"], 4_760, 6_000, [4, 32]),
  s("04.05", "Vorwand-Installationsschiene inkl. Befestigung", "m", EIN, 2_360, 0, [80, 180]),
  s("04.06", "Beplankung Vorwand, Gipskarton imprägniert, {v}", "m²", ["einlagig", "zweilagig"], 3_980, 1_680, [60, 200]),
  s("05.01", "Brausethermostat Aufputz", "Stk", EIN, 19_200, 0, [20, 32]),
  s("05.02", "Waschtisch-Einhebelmischer, verchromt", "Stk", EIN, 11_640, 0, [36, 40]),
  s("05.03", "Spültischarmatur mit Brause", "Stk", EIN, 15_300, 0, [32, 32]),
  s("05.04", "Eckventil mit Filter", "Stk", EIN, 1_510, 0, [140, 200]),
  s("05.05", "Brausegarnitur mit Stange {v}", "Stk", ["90 cm", "120 cm"], 9_500, 2_500, [10, 24]),
  s("05.06", "Badewannen-Einhebelmischer Aufputz", "Stk", EIN, 16_900, 0, [4, 14]),
  s("05.07", "Selbstschlussarmatur Handwaschbecken", "Stk", EIN, 14_100, 0, [2, 4]),
  s("05.08", "Außenwandventil frostsicher", "Stk", EIN, 12_200, 0, [4, 6]),
  s("05.09", "Duschrinne Edelstahl {v}", "Stk", ["80 cm", "90 cm", "100 cm"], 29_600, 4_100, [4, 12]),
  s("05.10", "Thermostat-Mischventil zentral DN 25", "Stk", EIN, 48_400, 0, [1, 1]),
  s("06.01", "Dämmung Trinkwasser kalt 9 mm für Rohr {v}", "m", ["16 mm", "20 mm", "26 mm", "32 mm"], 480, 90, [60, 360]),
  s("06.02", "Dämmung Trinkwasser warm 100 % für Rohr {v}", "m", ["16 mm", "20 mm", "26 mm", "32 mm"], 970, 170, [60, 320]),
  s("06.03", "Dämmung Zirkulation 100 % für Rohr {v}", "m", ["16 mm", "20 mm"], 950, 150, [80, 240]),
  s("06.04", "Dämmung Regenwasserleitung tauwassergeschützt DN 110", "m", EIN, 1_960, 0, [30, 80]),
  s("07.01", "Wohnungsstation Frischwasser mit Wärmemengenzähler", "Stk", EIN, 221_000, 0, [32, 32]),
  s("07.02", "Zirkulationspumpe", "Stk", EIN, 39_200, 0, [1, 2]),
  s("07.03", "Kaltwasserzähler Funk {v}", "Stk", ["Q3 2,5", "Q3 4,0"], 4_960, 1_240, [4, 32]),
  s("07.04", "Thermometer und Manometer, Satz", "Stk", EIN, 6_600, 0, [6, 10]),
  s("08.01", "Regenwasser-Fallleitung SML {v} inkl. Formteile", "m", ["DN 70", "DN 100", "DN 125"], 4_760, 1_240, [30, 110]),
  s("08.02", "Brandschutzmanschette für Kunststoffrohr DN 110, Deckendurchführung EI 90, inkl. Kennzeichnung", "Stk", EIN, 9_240, 0, [120, 120]),
  s("08.03", "Brandschutzmanschette für Kunststoffrohr {v}, Deckendurchführung EI 90", "Stk", ["DN 75", "DN 125"], 7_500, 1_640, [10, 40]),
  s("08.04", "Dachablauf beheizt {v}", "Stk", ["DN 70", "DN 100"], 42_600, 9_900, [2, 6]),
  s("08.05", "Notüberlauf Attika", "Stk", EIN, 19_200, 0, [2, 4]),
  s("08.06", "Feuerlöschleitung trocken DN 80 inkl. Formteile", "m", EIN, 6_420, 0, [40, 70]),
  s("08.07", "Druckprobe Trinkwasser mit Protokoll", "psch", EIN, 128_000, 0, [1, 1]),
  s("08.08", "Spülen und Desinfizieren Trinkwasser nach ÖNORM B 5019", "psch", EIN, 192_000, 0, [1, 1]),
  s("08.09", "Beprobung auf Legionellen", "psch", EIN, 70_400, 0, [1, 1]),
  s("09.01", "Bodenablauf Technikraum mit Schlammeimer DN 100", "Stk", EIN, 27_600, 0, [2, 3]),
  s("09.02", "Verteiler Trinkwasser Technikraum, {v}", "Stk", ["4 Abgänge", "6 Abgänge"], 86_800, 26_800, [1, 1]),
  s("09.03", "Enthärtungsanlage Doppelsäule", "Stk", EIN, 401_000, 0, [1, 1]),
  s("09.04", "Schmutzwasserpumpe Pumpensumpf", "Stk", EIN, 50_200, 0, [1, 2]),
  s("09.05", "Kaltwasser-Steigleitung Edelstahl {v} inkl. Pressfittings", "m", ["42 × 1,5", "54 × 1,5"], 4_960, 1_440, [30, 80]),
  s("09.06", "Warmwasser-Steigleitung Edelstahl {v} inkl. Pressfittings", "m", ["35 × 1,5", "42 × 1,5"], 4_960, 1_040, [30, 80]),
  s("09.07", "Zirkulations-Steigleitung Edelstahl {v} inkl. Pressfittings", "m", ["18 × 1,0", "22 × 1,2"], 2_800, 520, [30, 80]),
  s("09.08", "Schwitzwasserdämmung Steigleitungen {v}", "m", ["42 mm", "54 mm"], 1_300, 290, [30, 80]),
  s("09.09", "Brandabschottung Steigschacht Sanitär", "Stk", EIN, 39_200, 0, [4, 8]),
  s("09.10", "Wohnungsabsperrung mit Zählerbügel DN 20", "Stk", EIN, 9_900, 0, [32, 32]),

  // ---------- LG 26 Lüftung ----------
  l("01.01", "Lüftungsgerät Tiefgarage mit Wärmerückgewinnung 3.600 m³/h, Lieferung und Montage", "psch", EIN, 3_820_000, 0, [1, 1]),
  l("01.02", "Abluftventilator Dach", "Stk", EIN, 128_000, 0, [1, 2]),
  l("01.03", "Schalldämpfer rechteckig 800 × 500", "Stk", EIN, 67_100, 0, [2, 3]),
  l("01.04", "Frostschutz-Vorheizregister elektrisch", "Stk", EIN, 140_400, 0, [1, 1]),
  l("01.05", "Außen- und Fortluftgitter 800 × 800", "Stk", EIN, 44_400, 0, [1, 2]),
  l("02.01", "Luftleitung rechteckig verzinkt, Blechstärke {v}", "m²", ["0,8 mm", "1,0 mm"], 5_680, 660, [40, 220]),
  l("02.02", "Formteile rechteckig, Blechstärke 0,8 mm", "m²", EIN, 8_330, 0, [16, 70]),
  l("02.03", "Revisionsöffnung rechteckig 400 × 300", "Stk", EIN, 6_200, 0, [4, 14]),
  l("03.01", "Wickelfalzrohr DN 100 inkl. Formteile", "m", EIN, 1_920, 0, [200, 480]),
  l("03.02", "Wickelfalzrohr DN 125 inkl. Formteile", "m", EIN, 2_320, 0, [160, 380]),
  l("03.03", "Wickelfalzrohr DN 160 inkl. Formteile", "m", EIN, 3_180, 0, [100, 280]),
  l("03.04", "Wickelfalzrohr DN 200 inkl. Formteile", "m", EIN, 4_120, 0, [80, 220]),
  l("03.05", "Wickelfalzrohr DN 250 inkl. Formteile", "m", EIN, 5_240, 0, [220, 220]),
  l("03.06", "Wickelfalzrohr DN 315 inkl. Formteile", "m", EIN, 7_480, 0, [20, 60]),
  l("04.01", "Bogen 90° Wickelfalz {v}", "Stk", ["DN 100", "DN 160", "DN 250"], 1_280, 500, [16, 90]),
  l("04.02", "Abzweig 90° Wickelfalz {v}", "Stk", ["DN 125", "DN 200"], 1_690, 560, [10, 60]),
  l("05.01", "Brandschutzklappe EI 90 rund {v}", "Stk", ["DN 125", "DN 200", "DN 250"], 29_600, 4_800, [4, 24]),
  l("05.02", "Brandschutzklappe EI 90 rechteckig {v}", "Stk", ["300 × 200", "400 × 300"], 50_200, 12_400, [2, 8]),
  l("05.03", "Stellantrieb Brandschutzklappe 24 V mit Endschalter", "Stk", EIN, 16_900, 0, [10, 28]),
  l("05.04", "Brandschutzventil Abluft Bad {v}", "Stk", ["DN 100", "DN 125"], 13_200, 1_900, [16, 32]),
  l("06.01", "Tellerventil Abluft {v}", "Stk", ["DN 100", "DN 125", "DN 160"], 1_900, 440, [20, 80]),
  l("06.02", "Tellerventil Zuluft {v}", "Stk", ["DN 100", "DN 125", "DN 160"], 2_340, 480, [20, 80]),
  l("06.03", "Überströmgitter {v}", "Stk", ["425 × 125", "625 × 125"], 4_340, 1_240, [20, 64]),
  l("06.04", "Volumenstromregler konstant {v}", "Stk", ["DN 100", "DN 125", "DN 160"], 11_600, 1_900, [8, 32]),
  l("07.01", "Dämmung Außen- und Fortluft, diffusionsdicht 19 mm", "m²", EIN, 4_420, 0, [30, 100]),
  l("07.02", "Dämmung Luftleitung Mineralwolle alukaschiert {v}", "m²", ["30 mm", "50 mm"], 2_960, 800, [40, 200]),
  l("07.03", "Brandschutzbekleidung Luftleitung EI 90", "m²", EIN, 15_300, 0, [10, 32]),
  l("08.01", "Einregulierung Volumenströme mit Protokoll", "psch", EIN, 334_000, 0, [1, 1]),
  l("08.02", "Hygieneinspektion nach VDI 6022", "psch", EIN, 152_000, 0, [1, 1]),
  l("08.03", "Dichtheitsprüfung Luftleitungen", "psch", EIN, 192_000, 0, [1, 1]),
  l("08.04", "Reinigung Luftleitungen vor Übergabe", "psch", EIN, 220_000, 0, [1, 1]),
  l("09.01", "Einzelraumlüfter Bad mit Nachlauf {v}", "Stk", ["60 m³/h", "100 m³/h"], 19_200, 4_300, [10, 32]),
  l("09.02", "Rückschlagklappe {v}", "Stk", ["DN 100", "DN 125"], 2_480, 620, [10, 32]),
  l("09.03", "Anschluss Küchenabluft Umluft", "Stk", EIN, 4_760, 0, [32, 32]),
  l("09.04", "Dachdurchführung Abluft {v}", "Stk", ["DN 125", "DN 160"], 27_600, 5_600, [1, 3]),

  // ---------- LG 28 Mess-, Steuer- und Regeltechnik ----------
  m("01.01", "DDC-Unterstation Heizung und Lüftung, Lieferung, Programmierung und Montage", "psch", EIN, 1_890_000, 0, [1, 1]),
  m("01.02", "Schaltschrank MSR", "Stk", EIN, 638_000, 0, [1, 1]),
  m("01.03", "Inbetriebnahme, Einregulierung und Einschulung MSR", "psch", EIN, 618_000, 0, [1, 1]),
  m("02.01", "Anlegefühler Temperatur", "Stk", EIN, 8_900, 0, [6, 12]),
  m("02.02", "Tauchfühler Temperatur mit Tauchhülse", "Stk", EIN, 11_600, 0, [6, 12]),
  m("02.03", "Außentemperaturfühler", "Stk", EIN, 9_900, 0, [1, 2]),
  m("02.04", "Kanaltemperaturfühler", "Stk", EIN, 12_800, 0, [4, 6]),
  m("02.05", "Differenzdruckfühler Luft", "Stk", EIN, 19_200, 0, [2, 4]),
  m("02.06", "CO-Warnanlage Tiefgarage, Sensor", "Stk", EIN, 46_800, 0, [6, 10]),
  m("03.01", "Stellantrieb Ventil 24 V stetig", "Stk", EIN, 17_400, 0, [6, 12]),
  m("03.02", "Durchgangsventil mit Antrieb {v}", "Stk", ["DN 32", "DN 40"], 25_600, 6_400, [1, 3]),
  m("03.03", "Luftklappenantrieb {v}", "Stk", ["10 Nm", "20 Nm"], 22_800, 5_600, [2, 6]),
  m("04.01", "Steuerleitung J-Y(St)Y 2 × 2 × 0,8", "m", EIN, 220, 0, [400, 1000]),
  m("04.02", "Leitung NYM-J 5 × 1,5", "m", EIN, 340, 0, [200, 600]),
  m("04.03", "Kabeltasse 100 mm inkl. Befestigung", "m", EIN, 1_920, 0, [60, 160]),
  m("05.01", "Aufschaltung Gebäudeleittechnik", "psch", EIN, 256_000, 0, [1, 1]),
];

export const SOLL_ANZAHL: Record<string, number> = { "22": 98, "24": 116, "26": 54, "28": 18 };

export const LG_NAME: Record<string, string> = { "22": "Heizung", "24": "Sanitär", "26": "Lüftung", "28": "Mess-, Steuer- und Regeltechnik" };

export interface KatalogPosition {
  nr: string;
  lg: string;
  ulg: string;
  kurztext: string;
  einheit: Einheit;
  ep: number;
  menge: readonly [number, number];
}

/** Every position of the catalogue with its number. */
export function positionenAusKatalog(katalog: readonly Basis[] = KATALOG): KatalogPosition[] {
  return katalog.flatMap((x) =>
    x.varianten.map((v, i) => ({
      nr: `${x.lg}.${x.ulg}.${x.basis}${String.fromCharCode(65 + i)}`,
      lg: x.lg,
      ulg: x.ulg,
      kurztext: v === "–" ? x.text : x.text.replace("{v}", v),
      einheit: x.einheit,
      ep: x.ep + i * x.schritt,
      menge: x.menge,
    })),
  );
}
