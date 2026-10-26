// Zeitstrahl of a project (SPEZIFIKATION.md 4.3): the website section 02 for the real project. Lane "Baustelle" holds
// what happened on site (WhatsApp-Meldung, Regiebericht, Aufmaßblatt, E-Mail, Plan, Foto), lane "Rechnung" what was
// invoiced, paid and cut. While the Abgleich runs, each site event is "verrechnet" or "fehlt"; a missing one names the finds it proves. Events
// without anything to invoice (an appointment, a photo of the shell) carry no state. Duplicates are left out.
// The amounts of the lane "Rechnung" are the ones printed on the documents; no amount is calculated here.

import { arbeitsdatum, aufmassMenge, baueKontext, verrechnetMenge, vorGrenze } from "./kontext";
import type { BelegArt, Cent, Datensatz, Datum } from "./modell";
import { EMAIL_KATEGORIE_TEXT } from "./modell";
import type { ProjektErgebnis } from "./projekt";

export type Bahn = "baustelle" | "rechnung";

/** "verrechnet", "fehlt", or work after the last Abschlagsrechnung that goes into the next one. */
export type Ereignisstand = "verrechnet" | "fehlt" | "naechste_abschlagsrechnung";

export const EREIGNISSTAND_TEXT: Record<Ereignisstand, string> = {
  verrechnet: "verrechnet",
  fehlt: "fehlt",
  naechste_abschlagsrechnung: "kommt in die nächste Abschlagsrechnung",
};

export interface Ereignis {
  /** Id of the Beleg or of the WhatsApp-Meldung. */
  id: string;
  datum: Datum;
  /** "14:30" for messages and photos, else null. */
  uhrzeit: string | null;
  bahn: Bahn;
  art: BelegArt | "whatsapp";
  titel: string;
  text: string;
  /** Sender or author as a role ("Monteur, Trupp 1", "Bauleitung Hornfeld Bau"). */
  wer: string | null;
  /** A weakness of the Beleg itself: "nicht gegengezeichnet", "nicht unterschrieben". */
  schwach: string | null;
  positionen: string[];
  /** Site events only; null when there is nothing to invoice. */
  stand: Ereignisstand | null;
  /** Numbers of the finds the event proves ("F1"). */
  funde: string[];
  /** An e-mail the Abgleich marks as a "Rechtsfrage" for the Geschäftsführung (no legal reading). */
  rechtsfrage: boolean;
  /** Lane "Rechnung": the amount printed on the document (total, paid amount, cut). */
  betrag: Cent | null;
}

export interface Zeitstrahl {
  ereignisse: Ereignis[];
  /** Site events per state, and how many belong to a find. */
  zaehler: { baustelle: number; verrechnet: number; fehlt: number; naechste: number; ohneStand: number; mitFund: number; rechnung: number };
}

const uhr = (zeit: string) => zeit.slice(11, 16);
const nachNummer = (a: string, b: string) => a.localeCompare(b, "de", { numeric: true });

export function zeitstrahl(d: Datensatz, e: ProjektErgebnis): Zeitstrahl {
  const k = baueKontext(d);
  const doppelt = new Set(e.ordner.duplikatIds);

  // which finds a Beleg proves: only the Belege that prove the work, never the price (Leistungsverzeichnis, Vertrag)
  const fundeJe = new Map<string, string[]>();
  for (const f of e.abgleich.funde) for (const n of f.nachweise) if (n.rolle === "leistung") fundeJe.set(n.quelle.belegId, [...new Set([...(fundeJe.get(n.quelle.belegId) ?? []), f.nr])].sort(nachNummer));
  const rechtsfrage = new Set(e.abgleich.hinweise.filter((h) => h.art === "rechtsfrage").flatMap((h) => h.nachweise.map((n) => n.quelle.belegId)));

  const positionStand = (nrs: string[], datum: Datum): "verrechnet" | "naechste_abschlagsrechnung" | null => {
    const relevant = nrs.filter((nr) => k.lv.has(nr) || k.entwurf.has(nr) || k.abschlaege.has(nr));
    if (!relevant.length) return null;
    if (!vorGrenze(k, datum)) return "naechste_abschlagsrechnung";
    return relevant.every((nr) => verrechnetMenge(k, nr) > 0 || aufmassMenge(k, nr, true) === 0) ? "verrechnet" : null;
  };
  const regieStand = (nr: string): "verrechnet" | "naechste_abschlagsrechnung" | null => {
    if (k.regieVerrechnet.has(nr)) return "verrechnet";
    const rb = d.regie.find((x) => x.nr === nr);
    return rb && !vorGrenze(k, arbeitsdatum(rb)) ? "naechste_abschlagsrechnung" : null;
  };

  const ereignisse: Ereignis[] = [];
  // `keineLeistung`: the event proves a find but holds no work of its own (the earlier index of a changed plan)
  const baustelle = ({ keineLeistung, ...x }: Omit<Ereignis, "bahn" | "funde" | "rechtsfrage" | "betrag" | "stand"> & { stand: Ereignisstand | null; keineLeistung?: boolean }) => {
    if (doppelt.has(x.id)) return;
    const funde = fundeJe.get(x.id) ?? [];
    // once the Schlussrechnung is submitted there is no Abgleich: the events carry no state
    const stand = !e.abgleich.laeuft ? null : funde.length && !keineLeistung ? "fehlt" : x.stand;
    ereignisse.push({ ...x, bahn: "baustelle", funde, stand, rechtsfrage: rechtsfrage.has(x.id), betrag: null });
  };
  const rechnung = (x: Omit<Ereignis, "bahn" | "funde" | "rechtsfrage" | "stand" | "schwach" | "positionen" | "uhrzeit">) => {
    if (doppelt.has(x.id)) return;
    ereignisse.push({ ...x, bahn: "rechnung", uhrzeit: null, schwach: null, positionen: [], stand: null, funde: [], rechtsfrage: false });
  };

  for (const m of d.meldungen) {
    const rb = m.bezugRegiebericht?.wert ?? null;
    baustelle({
      id: m.id,
      datum: m.zeitpunkt.slice(0, 10),
      uhrzeit: uhr(m.zeitpunkt),
      art: "whatsapp",
      titel: "WhatsApp-Meldung",
      text: `${m.taetigkeit.wert}, ${m.ort.wert}`,
      wer: m.absender,
      schwach: null,
      positionen: m.bezugPositionen.wert,
      stand: rb ? regieStand(rb) : positionStand(m.bezugPositionen.wert, m.zeitpunkt.slice(0, 10)),
    });
  }
  for (const rb of d.regie)
    baustelle({
      id: rb.belegId,
      datum: arbeitsdatum(rb),
      uhrzeit: null,
      art: "regiebericht",
      titel: `Regiebericht ${rb.nr}`,
      text: rb.taetigkeit.wert,
      wer: rb.angewiesenVon ? `angewiesen von ${rb.angewiesenVon.wert}` : null,
      schwach: rb.unterschrieben.wert ? null : "nicht unterschrieben",
      positionen: [],
      stand: regieStand(rb.nr),
    });
  for (const b of d.aufmass) {
    const nrs = [...new Set(b.zeilen.map((z) => z.positionNr.wert))];
    baustelle({
      id: b.belegId,
      datum: b.datum.wert,
      uhrzeit: null,
      art: "aufmassblatt",
      titel: `Aufmaßblatt ${b.nr}`,
      text: nrs.length === 1 ? `1 Position` : `${nrs.length} Positionen`,
      wer: null,
      schwach: b.gegengezeichnet.wert ? null : "nicht gegengezeichnet",
      positionen: nrs,
      stand: positionStand(nrs, b.datum.wert),
    });
  }
  for (const f of d.fotodokumentationen)
    baustelle({ id: f.belegId, datum: f.datum.wert, uhrzeit: null, art: "fotodokumentation", titel: f.titel.wert, text: "Fotodokumentation", wer: null, schwach: null, positionen: [f.positionNr.wert], stand: positionStand([f.positionNr.wert], f.datum.wert) });
  for (const m of d.emails)
    baustelle({
      id: m.belegId,
      datum: m.datum.wert,
      uhrzeit: null,
      art: "email",
      titel: `E-Mail, ${EMAIL_KATEGORIE_TEXT[m.kategorie.wert]}`,
      text: m.zitat ? `${m.betreff.wert}: „${m.zitat.wert}“` : m.betreff.wert,
      wer: m.absender.wert,
      schwach: null,
      positionen: m.bezugPositionen.wert,
      stand: positionStand(m.bezugPositionen.wert, m.datum.wert),
    });
  for (const p of d.plaene)
    baustelle({
      id: p.belegId,
      datum: p.datum.wert,
      uhrzeit: null,
      art: "plan",
      titel: `Plan ${p.planNr.wert}, Index ${p.index.wert}`,
      text: p.aenderung?.wert ?? p.titel.wert,
      wer: null,
      schwach: null,
      positionen: [...new Set(p.vermerke.map((v) => v.positionNr.wert))],
      stand: positionStand([...new Set(p.vermerke.filter((v) => v.typ === "aenderung").map((v) => v.positionNr.wert))], p.datum.wert),
      keineLeistung: p.aenderung === null,
    });
  for (const f of d.fotos)
    baustelle({
      id: f.belegId,
      datum: f.zeitpunkt.wert.slice(0, 10),
      uhrzeit: uhr(f.zeitpunkt.wert),
      art: "foto",
      titel: "Foto",
      text: `${f.motiv.wert}, ${f.ort.wert}`,
      wer: null,
      schwach: null,
      positionen: f.bezugPositionen.wert,
      stand: positionStand(f.bezugPositionen.wert, f.zeitpunkt.wert.slice(0, 10)),
    });

  for (const r of [...d.abschlaege, ...(d.entwurf ? [d.entwurf] : []), ...(d.schlussrechnung ? [d.schlussrechnung] : [])])
    rechnung({ id: r.belegId, datum: r.datum.wert, art: r.art === "abschlag" ? "abschlagsrechnung" : r.art === "entwurf" ? "entwurf" : "schlussrechnung", titel: r.art === "entwurf" ? "Entwurf der Schlussrechnung" : r.nr.wert, text: r.art === "entwurf" ? "eigener Entwurf, nicht gelegt" : "gelegt", wer: null, betrag: r.summe.wert });
  for (const z of d.zahlungen) rechnung({ id: z.belegId, datum: z.datum.wert, art: "zahlungsavis", titel: `Zahlung zu ${z.rechnungNr.wert}`, text: "bezahlt", wer: null, betrag: z.betrag.wert });
  for (const kb of d.korrekturblaetter)
    rechnung({ id: kb.belegId, datum: kb.datum.wert, art: "korrekturblatt", titel: `Korrekturblatt zu ${kb.rechnungNr.wert}`, text: "gekürzt", wer: null, betrag: kb.zeilen.reduce((s, z) => s + z.kuerzung.wert, 0) });
  if (d.abzugsschreiben) rechnung({ id: d.abzugsschreiben.belegId, datum: d.abzugsschreiben.datum.wert, art: "abzugsschreiben", titel: "Abzugsschreiben", text: "Abzüge angekündigt", wer: null, betrag: null });
  for (const n of d.nachtraege) rechnung({ id: n.belegId, datum: d.belege.find((b) => b.id === n.belegId)?.datum ?? "", art: "nachtrag", titel: `Nachtrag ${n.nr.wert}`, text: n.beauftragt.wert ? `${n.titel.wert}, beauftragt` : `${n.titel.wert}, nicht beauftragt`, wer: null, betrag: n.betrag.wert });

  // newest first; on one day the lane "Rechnung" after the site, then by time and title
  ereignisse.sort((a, b) => b.datum.localeCompare(a.datum) || (a.bahn === b.bahn ? 0 : a.bahn === "baustelle" ? -1 : 1) || (b.uhrzeit ?? "").localeCompare(a.uhrzeit ?? "") || nachNummer(a.titel, b.titel));

  const bs = ereignisse.filter((x) => x.bahn === "baustelle");
  return {
    ereignisse,
    zaehler: {
      baustelle: bs.length,
      verrechnet: bs.filter((x) => x.stand === "verrechnet").length,
      fehlt: bs.filter((x) => x.stand === "fehlt").length,
      naechste: bs.filter((x) => x.stand === "naechste_abschlagsrechnung").length,
      ohneStand: bs.filter((x) => x.stand === null).length,
      mitFund: bs.filter((x) => x.funde.length > 0).length,
      rechnung: ereignisse.length - bs.length,
    },
  };
}
