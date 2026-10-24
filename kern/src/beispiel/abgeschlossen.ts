// P4 Wohnhof Erlenhain (Hornfeld Bau) and P5 Pflegeheim Eibenau (Pfeilberg Bau), both closed (docs/Demo_Faelle.md,
// "Inputs for the closed projects"; all fictitious). They feed the Auftraggeber history: what was cut and why, which
// deductions have no contract item, which Nachträge were accepted, how long the final payment took. The Schlussrechnung
// lists only the lines the Korrekturblatt refers to; the Zahlungsavis of the final payment is what the Auftraggeber paid,
// settled with the rule the core uses (cut, Nachlass, levies, Haftrücklass, minus the payments on Abschlagsrechnungen).

import { betragAusMenge } from "../geld";
import type { AbzugArt, Aufmassblatt, Datensatz, Kuerzungsgrund, Projekt, RechnungsZeile, Regiebericht } from "../modell";
import { abrechnen } from "../stufen";
import { f, lvZeile, Ordner, q, regieBetrag, regieZeile } from "./bauen";

interface Kuerzung {
  positionNr: string;
  betrag: number;
  grund: Kuerzungsgrund;
  text: string;
}

interface AbgeschlossenDef {
  projekt: Projekt;
  vertragDatum: string;
  auftragssumme: number;
  saetze: { art: AbzugArt; satz: number; punkt: string }[];
  regieM: number;
  regieH: number;
  materialBp: number;
  /** Deductions the Auftraggeber announced by letter (some without a contract item). */
  abzugsschreiben: { datum: string; abzuege: { art: AbzugArt; satz: number }[] } | null;
  schlussrechnung: { datum: string; summe: number };
  korrekturblattDatum: string;
  bezahltAufAbschlaege: number;
  nachtraege: { nr: string; titel: string; betrag: number; beauftragt: boolean; datum: string }[];
}

interface Teil {
  aufmass: Aufmassblatt[];
  regie: Regiebericht[];
  /** The lines of the Schlussrechnung the Korrekturblatt refers to. */
  zeilen: RechnungsZeile[];
  kuerzungen: Kuerzung[];
}

function baue(def: AbgeschlossenDef, teil: (ordner: Ordner) => Teil): Datensatz {
  const k = def.projekt.kurz;
  const ordner = new Ordner(k);
  ordner.add("vertrag", "vertrag", `${k}_Bauvertrag.pdf`, def.vertragDatum, 16);
  if (def.abzugsschreiben) ordner.add("abzugsschreiben", "abzugsschreiben", `${k}_Abzugsschreiben.pdf`, def.abzugsschreiben.datum);
  const { aufmass, regie, zeilen, kuerzungen } = teil(ordner);
  const sid = ordner.add("schlussrechnung", "schlussrechnung", `${k}_Schlussrechnung.pdf`, def.schlussrechnung.datum, 12);
  const kid = ordner.add("korrekturblatt-sr", "korrekturblatt", `${k}_Korrekturblatt_Schlussrechnung.pdf`, def.korrekturblattDatum, 2);
  const gekuerzt = kuerzungen.reduce((s, x) => s + x.betrag, 0);
  const saetze = [...def.saetze.map((s) => ({ art: s.art, satz: s.satz })), ...(def.abzugsschreiben?.abzuege.filter((a) => !def.saetze.some((s) => s.art === a.art)) ?? [])];
  const s = abrechnen(def.schlussrechnung.summe, gekuerzt, saetze);
  const zahltag = def.projekt.schlusszahlung!;
  const aid = ordner.add("avis-sr", "zahlungsavis", `${k}_Zahlungsavis_Schlussrechnung.pdf`, zahltag);
  const qa = (stelle: string) => q(aid, 1, stelle);
  const nachtraege = def.nachtraege.map((n) => {
    const id = ordner.add(`nachtrag-${n.nr.toLowerCase()}`, "nachtrag", `${k}_Nachtrag_${n.nr}.pdf`, n.datum, 3);
    return { belegId: id, nr: f(n.nr, q(id, 1, "Kopf")), titel: f(n.titel, q(id, 1, "Betreff")), betrag: f(n.betrag, q(id, 3, "Summe netto")), beauftragt: f(n.beauftragt, q(id, 1, "Vermerk Auftraggeber")) };
  });
  const qv = (stelle: string) => q("vertrag", 4, stelle);
  return {
    projekt: def.projekt,
    vertrag: {
      belegId: "vertrag",
      datum: f(def.vertragDatum, q("vertrag", 1, "Kopf, Datum")),
      norm: f("ÖNORM B 2110", q("vertrag", 1, "Punkt 1.2")),
      vertragsart: f("Einheitspreisvertrag", q("vertrag", 1, "Punkt 2.1")),
      auftragssumme: f(def.auftragssumme, q("vertrag", 1, "Punkt 2.2")),
      saetze: def.saetze.map((x) => ({ art: x.art, satz: f(x.satz, qv(`Punkt ${x.punkt}`)), punkt: x.punkt, phase: x.art === "haftruecklass" ? ("schluss" as const) : ("beide" as const), ...(x.art === "haftruecklass" ? { durchBankgarantieErsetzbar: true } : {}) })),
      regiesatzMonteur: f(def.regieM, qv("Punkt 6.3")),
      regiesatzHelfer: f(def.regieH, qv("Punkt 6.3")),
      regiePunkt: "6.3",
      regiematerialZuschlag: f(def.materialBp, qv("Punkt 6.4")),
      regiematerialPunkt: "6.4",
      preise: { art: "fest", punkt: "7.1", text: f("Festpreise bis Bauende", qv("Punkt 7.1")) },
      pauschalen: [],
      schlussrechnungLegenBis: null,
    },
    preisbasis: null,
    belege: ordner.belege,
    positionen: [],
    aufmass,
    regie,
    stundenzettel: [],
    abschlaege: [],
    entwurf: null,
    schlussrechnung: { nr: f("Schlussrechnung", q(sid, 1, "Kopf")), belegId: sid, art: "schluss", datum: f(def.schlussrechnung.datum, q(sid, 1, "Kopf, Datum")), zeilen, summe: f(def.schlussrechnung.summe, q(sid, 12, "Summe netto")) },
    zahlungen: [
      {
        belegId: aid,
        rechnungNr: f("Schlussrechnung", qa("Bezug")),
        datum: f(zahltag, qa("Valuta")),
        betrag: f(s.ergebnis - def.bezahltAufAbschlaege, qa("Zahlbetrag")),
        abzuege: [
          { art: "kuerzung", betrag: f(gekuerzt, qa("Kürzung laut Korrekturblatt")), satz: null },
          ...s.zeilen.map((x) => ({ art: x.art, betrag: f(x.betrag, qa(`Abzug ${x.art}`)), satz: f(x.satz, qa(`Satz ${x.art}`)) })),
          { art: "abschlagszahlungen", betrag: f(def.bezahltAufAbschlaege, qa("bezahlte Abschlagsrechnungen")), satz: null },
        ],
      },
    ],
    korrekturblaetter: [
      {
        belegId: kid,
        rechnungNr: f("Schlussrechnung", q(kid, 1, "Kopf")),
        datum: f(def.korrekturblattDatum, q(kid, 1, "Kopf, Datum")),
        zeilen: kuerzungen.map((x, i) => {
          const qk = q(kid, 1 + Math.floor(i / 10), `Zeile ${x.positionNr}`);
          return { positionNr: f(x.positionNr, qk), kuerzung: f(x.betrag, qk), grund: f(x.grund, qk), text: f(x.text, qk) };
        }),
      },
    ],
    abzugsschreiben: def.abzugsschreiben
      ? { belegId: "abzugsschreiben", datum: f(def.abzugsschreiben.datum, q("abzugsschreiben", 1, "Kopf, Datum")), abzuege: def.abzugsschreiben.abzuege.map((a, i) => ({ art: a.art, satz: f(a.satz, q("abzugsschreiben", 1, `Absatz ${i + 2}`)) })) }
      : null,
    nachtraege,
    plaene: [],
    emails: [],
    fotos: [],
    fotodokumentationen: [],
    grosshaendlerrechnungen: [],
    indexblatt: null,
    meldungen: [],
  };
}

const abgeschlossen = (id: string, kurz: string, name: string, langname: string, auftraggeberId: string, gelegt: string, bezahlt: string): Projekt => ({
  id,
  kurz,
  name,
  langname,
  auftraggeberId,
  stufe: "abgeschlossen",
  schlussrechnungLegenBis: null,
  schlussrechnungGelegt: gelegt,
  schlusszahlung: bezahlt,
  bauzeit: null,
});

export function erzeugeErlenhain(): Datensatz {
  return baue(
    {
      projekt: abgeschlossen("p4", "P4", "Wohnhof Erlenhain", "Wohnhof Erlenhain, 24 Wohnungen, HKLS", "hornfeld", "2025-11-20", "2026-02-18"),
      vertragDatum: "2024-09-23",
      auftragssumme: 66_840_000,
      saetze: [
        { art: "nachlass", satz: 300, punkt: "5.1" },
        { art: "baustrom_bauwasser", satz: 60, punkt: "4.6" },
        { art: "haftruecklass", satz: 300, punkt: "9.2" },
      ],
      regieM: 6_240,
      regieH: 5_210,
      materialBp: 1_500,
      abzugsschreiben: { datum: "2024-10-14", abzuege: [{ art: "baustrom_bauwasser", satz: 60 }, { art: "bauschadensumlage", satz: 50 }] },
      schlussrechnung: { datum: "2025-11-20", summe: 68_421_240 },
      korrekturblattDatum: "2026-01-15",
      bezahltAufAbschlaege: 54_800_000,
      nachtraege: [
        { nr: "N1", titel: "Zusätzlicher Heizkreisverteiler", betrag: 648_000, beauftragt: true, datum: "2025-03-11" },
        { nr: "N2", titel: "Grundleitung umgelegt", betrag: 234_000, beauftragt: true, datum: "2025-04-08" },
        { nr: "N3", titel: "Winterbaumaßnahmen", betrag: 186_000, beauftragt: false, datum: "2025-01-21" },
      ],
    },
    (ordner) => {
      const ab9 = ordner.add("ab-9", "aufmassblatt", "P4_Aufmassblatt_09.pdf", "2025-09-12");
      const qa = q(ab9, 1, "Zeile 22.04.10A");
      const aufmass: Aufmassblatt[] = [
        {
          nr: "9",
          belegId: ab9,
          datum: f("2025-09-12", q(ab9, 1, "Kopf, Datum")),
          leistungVon: f("2025-08-18", q(ab9, 1, "Kopf, Leistungszeitraum")),
          leistungBis: f("2025-09-11", q(ab9, 1, "Kopf, Leistungszeitraum")),
          gegengezeichnet: f(false, q(ab9, 2, "Unterschrift Auftraggeber")),
          gegengezeichnetAm: null,
          erfasstAm: "2025-09-16",
          grundlageBelegId: null,
          zeilen: [{ positionNr: f("22.04.10A", qa), menge: f(1_200, qa), ort: f("Stiege 3, Dachgeschoß", qa) }],
        },
      ];
      // Line 24.05.03A printed with a wrong total: 18.646,40 € instead of 96 × 193,40 €
      const falsch = lvZeile("schlussrechnung", 7, "24.05.03A", 9_600, 19_340);
      const gedruckt = 1_864_640;
      const zeilen: RechnungsZeile[] = [lvZeile("schlussrechnung", 4, "22.04.10A", 6_400, 21_460), { ...falsch, betrag: f(gedruckt, falsch.betrag.quelle) }];
      return {
        aufmass,
        regie: [],
        zeilen,
        kuerzungen: [
          { positionNr: "22.04.10A", betrag: betragAusMenge(1_200, 21_460), grund: "aufmass_nicht_gegengezeichnet", text: "Aufmaßblatt 9 nicht gegengezeichnet" },
          { positionNr: "24.05.03A", betrag: gedruckt - betragAusMenge(9_600, 19_340), grund: "rechenfehler", text: "Rechenfehler in der Zeile" },
        ],
      };
    },
  );
}

export function erzeugeEibenau(): Datensatz {
  const regieM = 6_360;
  const regieH = 5_340;
  const rb9 = { m: 1_400, h: 1_000, material: 15_200 };
  return baue(
    {
      projekt: abgeschlossen("p5", "P5", "Pflegeheim Eibenau", "Pflegeheim Eibenau, Zubau, HKLS", "pfeilberg", "2025-06-30", "2025-09-12"),
      vertragDatum: "2024-05-14",
      auftragssumme: 92_150_000,
      saetze: [
        { art: "nachlass", satz: 200, punkt: "5.1" },
        { art: "haftruecklass", satz: 300, punkt: "9.2" },
      ],
      regieM,
      regieH,
      materialBp: 1_500,
      abzugsschreiben: null,
      schlussrechnung: { datum: "2025-06-30", summe: 94_836_000 },
      korrekturblattDatum: "2025-08-05",
      bezahltAufAbschlaege: 84_200_000,
      nachtraege: [
        { nr: "N1", titel: "Zusatzkühlung Serverraum", betrag: 984_000, beauftragt: true, datum: "2024-11-19" },
        { nr: "N2", titel: "Pflegebad-Ausstattung", betrag: 426_000, beauftragt: true, datum: "2025-02-11" },
      ],
    },
    (ordner) => {
      const ab7 = ordner.add("ab-7", "aufmassblatt", "P5_Aufmassblatt_07.pdf", "2025-04-25");
      const qa = q(ab7, 1, "Zeile 26.02.03A");
      const rid = ordner.add("rb-9", "regiebericht", "P5_Regiebericht_09.pdf", "2025-05-12");
      const qr = (stelle: string) => q(rid, 1, stelle);
      const regie: Regiebericht[] = [
        {
          nr: "9",
          belegId: rid,
          datum: f("2025-05-12", qr("Kopf, Datum")),
          arbeitstage: f(["2025-05-12"], qr("Arbeitstage")),
          taetigkeit: f("Leitungen wegen Fremdgewerk umgelegt, 3. OG", qr("Tätigkeit")),
          angewiesenVon: f("Polier Pfeilberg Bau", qr("Angeordnet von")),
          stundenMonteur: f(rb9.m, qr("Stunden Monteur")),
          stundenHelfer: f(rb9.h, qr("Stunden Helfer")),
          material: f(rb9.material, qr("Material zum Einstandspreis")),
          unterschrieben: f(false, qr("Unterschrift Auftraggeber")),
          unterschriebenAm: null,
          ausMeldung: null,
        },
      ];
      const rbBetrag = regieBetrag(rb9, regieM, regieH, 1_500);
      const aufmass: Aufmassblatt[] = [
        {
          nr: "7",
          belegId: ab7,
          datum: f("2025-04-25", q(ab7, 1, "Kopf, Datum")),
          leistungVon: f("2025-03-31", q(ab7, 1, "Kopf, Leistungszeitraum")),
          leistungBis: f("2025-04-24", q(ab7, 1, "Kopf, Leistungszeitraum")),
          gegengezeichnet: f(true, q(ab7, 2, "Unterschrift Auftraggeber")),
          gegengezeichnetAm: f("2025-04-28", q(ab7, 2, "Unterschrift Auftraggeber, Datum")),
          erfasstAm: "2025-04-29",
          grundlageBelegId: null,
          zeilen: [{ positionNr: f("26.02.03A", qa), menge: f(40_000, qa), ort: f("Zubau, alle Geschoße", qa) }],
        },
      ];
      const zeilen = [lvZeile("schlussrechnung", 9, "26.02.03A", 45_000, 3_280), regieZeile("schlussrechnung", 11, regie[0], rbBetrag)];
      return {
        aufmass,
        regie,
        zeilen,
        kuerzungen: [
          { positionNr: "Regiebericht 9", betrag: rbBetrag, grund: "regie_nicht_unterschrieben", text: "Regiebericht nicht unterschrieben" },
          { positionNr: "26.02.03A", betrag: betragAusMenge(45_000 - 40_000, 3_280), grund: "menge_ohne_aufmass", text: "Menge über dem Aufmaß" },
        ],
      };
    },
  );
}
