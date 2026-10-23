// Abgeschlossene Projekte mit Geschichte (P7, P8): gelegte Schlussrechnung, Korrekturblatt des Auftraggebers,
// Nachtragsangebote und Schlusszahlung mit Aufschlüsselung. Eingaben wie in product/docs/Demo_Faelle.md,
// Abschnitt „GC history“, Block „Inputs for P7 and P8“ (Go Maxi S. 23.10.2026). Alles synthetisch.
// Kürzungen und Zahlung entstehen nach der Rechenregel aus den Dokumenten; die Summe der Schlussrechnung wird
// gegen die Lösungsliste geprüft, sonst bricht der Generator ab.

import type {
  AbzugArt,
  Bp,
  Datensatz,
  Feld,
  Korrekturzeile,
  Kuerzungsgrund,
  Nachtrag,
  Quelle,
  Rechnung,
  RechnungsZeile,
  VertragsSatz,
  Zahlung,
} from "@/domain/typen";
import { betragAusMenge, prozent, stundenBetrag } from "@/engine/geld";
import { SAMMELPOSITION } from "./bauen";

export interface NachtragDef {
  nr: string;
  titel: string;
  /** Cent. */
  betrag: number;
  beauftragt: boolean;
  datum: string;
}

/** Kürzung des Auftraggebers; der Betrag folgt aus den Dokumenten, je nach Grund. */
export interface KuerzungDef {
  /** LV-Position oder Regiebericht. */
  bezug: string;
  grund: Kuerzungsgrund;
  /** Wortlaut auf dem Korrekturblatt. */
  text: string;
}

export interface SchlussDef {
  /** Gelegt am. */
  datum: string;
  /** Summe laut Lösungsliste in Cent; die Zeilen müssen genau darauf kommen. */
  summe: number;
  /** Verrechnete Menge je LV-Position, wo sie vom Aufmaß abweicht. */
  menge?: Record<string, number>;
  /** Gedruckter Zeilenbetrag, wo er von Menge × EP abweicht (Rechenfehler auf der Rechnung). */
  gedruckt?: Record<string, number>;
  regie: string[];
  nachtraege: NachtragDef[];
  saetze: { art: AbzugArt; satz: Bp; punkt: string; phase: VertragsSatz["phase"] }[];
  /** Sätze, die der Auftraggeber zusätzlich abzieht, ohne dass der Vertrag sie nennt. */
  ohneVertragspunkt: { art: AbzugArt; satz: Bp }[];
  kuerzungen: KuerzungDef[];
  korrekturDatum: string;
  /** Auf Abschläge schon bezahlt (Annahme der Lösungsliste, ohne Abschlagsrechnungen im Datensatz). */
  abschlagszahlungen: number;
  zahlungDatum: string;
}

const q = (dokumentId: string, seite: number, stelle: string, bbox?: Quelle["bbox"]): Quelle =>
  bbox ? { dokumentId, seite, stelle, bbox } : { dokumentId, seite, stelle };
const f = <T,>(wert: T, quelle: Quelle): Feld<T> => ({ wert, quelle });

const NAME: Record<AbzugArt, string> = {
  nachlass: "Nachlass",
  baustrom_bauwasser: "Baustrom und Bauwasser",
  bauschadensumlage: "Bauschadensumlage",
  deckungsruecklass: "Deckungsrücklass",
  haftruecklass: "Haftrücklass",
};

export function ergaenzeSchluss(d: Datensatz, s: SchlussDef): Datensatz {
  const k = d.projekt.kurz;
  const dokumente = [...d.dokumente];
  const dok = (id: string, art: Datensatz["dokumente"][number]["art"], dateiname: string, datum: string, seiten = 1) => {
    dokumente.push({ id, art, kanal: "ordner", dateiname, datum, seiten, inhaltHash: `h-${k}-${id}` });
    return id;
  };
  const qv = (stelle: string) => q("vertrag", 1, stelle);
  const saetze: VertragsSatz[] = s.saetze.map((x) => ({ art: x.art, satz: f(x.satz, qv(`Pkt. ${x.punkt}`)), punkt: x.punkt, phase: x.phase }));

  // Nachtragsangebote
  const nachtraege: Nachtrag[] = s.nachtraege.map((n) => {
    const id = dok(`nachtrag-${n.nr.toLowerCase()}`, "nachtrag", `${k}_Nachtrag_${n.nr}.pdf`, n.datum, 2);
    return {
      positionNr: f(n.nr, q(id, 1, "Kopf")),
      titel: f(n.titel, q(id, 1, "Gegenstand")),
      betrag: f(n.betrag, q(id, 2, "Angebotssumme")),
      beauftragt: f(n.beauftragt, q(id, 2, n.beauftragt ? "Beauftragung des Auftraggebers" : "Ablehnung des Auftraggebers")),
      dokumentId: id,
    };
  });

  // Gelegte Schlussrechnung: LV wie aufgemessen (Sammelposition ganz), Regie, beauftragte Nachträge
  const srId = dok("schlussrechnung", "schlussrechnung", `${k}_Schlussrechnung.pdf`, s.datum, 6);
  const aufgemessen = new Map<string, number>();
  for (const b of d.aufmass) for (const z of b.zeilen) aufgemessen.set(z.positionNr.wert, (aufgemessen.get(z.positionNr.wert) ?? 0) + z.menge.wert);
  const zeilen: RechnungsZeile[] = [];
  d.lv.forEach((p, i) => {
    const nr = p.nr.wert;
    const menge = s.menge?.[nr] ?? (nr === SAMMELPOSITION ? p.menge.wert : (aufgemessen.get(nr) ?? 0));
    if (menge <= 0) return;
    const qz = q(srId, 1 + Math.floor(i / 12), `Pos. ${nr}`);
    zeilen.push({ typ: "lv", positionNr: f(nr, qz), menge: f(menge, qz), ep: f(p.ep.wert, qz), betrag: f(s.gedruckt?.[nr] ?? betragAusMenge(menge, p.ep.wert), qz) });
  });
  const regieBetrag = (nr: string) => {
    const rb = d.regie.find((r) => r.nr.wert === nr);
    if (!rb) throw new Error(`${k}: Regiebericht ${nr} fehlt`);
    return stundenBetrag(rb.stundenMonteur.wert, d.vertrag.regiesatzMonteur.wert) + stundenBetrag(rb.stundenHelfer.wert, d.vertrag.regiesatzHelfer.wert) + rb.material.wert;
  };
  for (const nr of s.regie) zeilen.push({ typ: "regie", regieNr: f(nr, q(srId, 5, `Regie ${nr}`)), betrag: f(regieBetrag(nr), q(srId, 5, `Regie ${nr}`)) });
  for (const n of nachtraege.filter((x) => x.beauftragt.wert)) {
    const qn = q(srId, 6, `Nachtrag ${n.positionNr.wert}`);
    zeilen.push({ typ: "zusatz", positionNr: f(n.positionNr.wert, qn), text: f(n.titel.wert, qn), menge: f(100, qn), ep: f(n.betrag.wert, qn), betrag: f(n.betrag.wert, qn) });
  }
  const summe = zeilen.reduce((x, z) => x + z.betrag.wert, 0);
  if (summe !== s.summe) throw new Error(`${k}: Schlussrechnung ${summe} statt ${s.summe}`);
  const schlussrechnung: Rechnung = {
    nr: f("SR", q(srId, 1, "Kopf")),
    dokumentId: srId,
    art: "schluss",
    datum: f(s.datum, q(srId, 1, "Kopf")),
    zeilen,
    summe: f(summe, q(srId, 6, "Summe Leistung")),
  };

  // Korrekturblatt: Betrag je Kürzung nach dem Grund aus den Dokumenten
  const zeileZu = (nr: string) => zeilen.find((z) => (z.typ === "lv" || z.typ === "zusatz" ? z.positionNr.wert : z.typ === "regie" ? z.regieNr.wert : "") === nr);
  const ep = (nr: string) => {
    const p = d.lv.find((x) => x.nr.wert === nr);
    if (!p) throw new Error(`${k}: Position ${nr} fehlt`);
    return p.ep.wert;
  };
  const kuerzungsBetrag = (x: KuerzungDef): number => {
    const z = zeileZu(x.bezug);
    if (!z) throw new Error(`${k}: ${x.bezug} nicht in der Schlussrechnung`);
    switch (x.grund) {
      case "aufmass_nicht_gegengezeichnet": {
        const offen = d.aufmass.filter((b) => !b.unterschriftAG.wert).flatMap((b) => b.zeilen).filter((y) => y.positionNr.wert === x.bezug);
        return betragAusMenge(offen.reduce((m, y) => m + y.menge.wert, 0), ep(x.bezug));
      }
      case "rechenfehler":
        if (z.typ !== "lv") throw new Error(`${k}: Rechenfehler nur auf LV-Zeilen`);
        return z.betrag.wert - betragAusMenge(z.menge.wert, z.ep.wert);
      case "regie_nicht_unterschrieben":
        return z.betrag.wert;
      case "menge_ohne_aufmass":
        if (z.typ !== "lv") throw new Error(`${k}: Menge ohne Aufmaß nur auf LV-Zeilen`);
        return betragAusMenge(z.menge.wert - (aufgemessen.get(x.bezug) ?? 0), z.ep.wert);
      default:
        throw new Error(`${k}: Grund ${x.grund} hier nicht vorgesehen`);
    }
  };
  const kbId = dok("gu-korrektur-sr", "gu_korrektur", `${k}_GU_Korrekturblatt_Schlussrechnung.pdf`, s.korrekturDatum, 1);
  const kbZeilen: Korrekturzeile[] = s.kuerzungen.map((x, i) => {
    const qk = q(kbId, 1, `Pos. ${x.bezug}`, [40, 260 + 30 * i, 515, 22]);
    return { positionNr: f(x.bezug, qk), kuerzung: f(kuerzungsBetrag(x), qk), grund: f(x.grund, qk), text: f(x.text, qk) };
  });
  const gekuerzt = kbZeilen.reduce((x, z) => x + z.kuerzung.wert, 0);

  // Schlusszahlung: (Schlussrechnung − Kürzungen) − Nachlass, dann die übrigen Sätze auf den Betrag nach Nachlass,
  // dann Haftrücklass, dann die schon bezahlten Abschläge
  const zId = dok("zahlung-sr", "zahlung", `${k}_Zahlungsavis_Schlussrechnung.pdf`, s.zahlungDatum, 1);
  let zy = 220;
  const qz = (stelle: string) => q(zId, 1, stelle, [60, (zy += 30), 495, 20]);
  const abzuege: Zahlung["abzuege"] = [{ art: "kuerzung", betrag: f(gekuerzt, qz("Kürzung laut Korrekturblatt")) }];
  const satz = (art: AbzugArt) => saetze.find((x) => x.art === art && x.phase !== "abschlag")?.satz.wert ?? s.ohneVertragspunkt.find((x) => x.art === art)?.satz ?? null;
  const zeile = (art: AbzugArt, basis: number) => {
    const bp = satz(art);
    if (bp === null) return 0;
    const betrag = prozent(basis, bp);
    abzuege.push({ art, betrag: f(betrag, qz(`${NAME[art]} ${(bp / 100).toLocaleString("de-AT")} %`)) });
    return betrag;
  };
  let basis = summe - gekuerzt;
  basis -= zeile("nachlass", basis);
  const nachNachlass = basis;
  basis -= zeile("baustrom_bauwasser", nachNachlass) + zeile("bauschadensumlage", nachNachlass);
  basis -= zeile("haftruecklass", basis);
  abzuege.push({ art: "abschlagszahlungen", betrag: f(s.abschlagszahlungen, qz("Bezahlte Abschläge")) });
  const zahlung: Zahlung = {
    dokumentId: zId,
    rechnungNr: f("SR", q(zId, 1, "Bezug")),
    datum: f(s.zahlungDatum, q(zId, 1, "Datum")),
    betrag: f(basis - s.abschlagszahlungen, q(zId, 1, "Zahlbetrag", [300, 400, 255, 24])),
    abzuege,
  };

  return {
    ...d,
    vertrag: { ...d.vertrag, saetze },
    dokumente,
    schlussrechnung,
    zahlungen: [...d.zahlungen, zahlung],
    korrekturblaetter: [
      { dokumentId: kbId, rechnungNr: f("SR", q(kbId, 1, "Kopf", [40, 90, 515, 22])), datum: f(s.korrekturDatum, q(kbId, 1, "Kopf")), zeilen: kbZeilen },
    ],
    nachtraege,
  };
}
