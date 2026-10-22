// Vorprüfung aus GU-Sicht: dieselben Prüfungen, die ein GU-Werkzeug auf der Schlussrechnung macht,
// laufen vorher auf dem eigenen Entwurf samt Liste 1. Ergebnis: Positionen mit Kürzungsrisiko.
// Überschneidet sich mit den Befunden (nie addieren).

import type { Rechnung } from "@/domain/typen";
import { betragAusMenge, euro, menge, rundeHalbAuf, stundenBetrag } from "./geld";
import { aufmassMenge, type Kontext } from "./kontext";
import type { Befund, Beleg, Hinweis, Kuerzungsrisiko } from "./typen";

const tagMonat = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;

/** ISO-Kalenderwoche eines Datums „JJJJ-MM-TT“. */
export function kalenderwoche(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  const wochentag = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - wochentag);
  const jahresbeginn = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - jahresbeginn) / 86_400_000 + 1) / 7);
}

function aufmassOhneGegenzeichnung(k: Kontext, befunde: Befund[]): Kuerzungsrisiko[] {
  const risiken: Kuerzungsrisiko[] = [];
  for (const p of k.d.lv) {
    const nr = p.nr.wert;
    const aufmass = aufmassMenge(k, nr);
    if (aufmass <= p.menge.wert) continue;
    const funde = k.aufmass.get(nr) ?? [];
    const gezeichnet = funde.filter((f) => f.blatt.unterschriftAG.wert).reduce((s, f) => s + f.zeile.menge.wert, 0);
    const gefaehrdet = aufmass - Math.max(p.menge.wert, gezeichnet);
    if (gefaehrdet <= 0) continue;

    const offen = funde.filter((f) => !f.blatt.unterschriftAG.wert);
    const plaene = k.d.plaene.filter((pl) => pl.vermerke.some((v) => v.typ === "aenderung" && v.positionNr.wert === nr));
    const mails = k.d.mails.filter((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.includes(nr));
    const beilegen = [
      ...plaene.map((pl) => `Plan ${pl.index.wert}`),
      ...mails.map((m) => `Mail ${tagMonat(m.datum.wert)}`),
    ];
    const befund = befunde.find((b) => b.schluessel === `mehrmenge:${nr}`);
    risiken.push({
      schluessel: `vp:aufmass_nicht_gegengezeichnet:${nr}`,
      grund: "aufmass_nicht_gegengezeichnet",
      bezug: nr,
      befundSchluessel: befund?.schluessel ?? null,
      was: `Mehrmenge ${menge(gefaehrdet, p.einheit.wert)}`,
      detail: `${offen.map((f) => `Aufmaßblatt ${f.blatt.nr}`).join(", ")} vom GU nicht gegengezeichnet`,
      abhilfe: `${beilegen.length ? `${beilegen.join(" und ")} beilegen, ` : ""}gemeinsames Aufmaß nachholen`,
      betrag: betragAusMenge(gefaehrdet, p.ep.wert),
      bereitsGekuerzt: k.kuerzungen.has(nr),
      belege: [
        ...offen.map((f): Beleg => ({
          titel: `Aufmaßblatt ${f.blatt.nr}`,
          text: "Unterschrift Auftraggeber fehlt",
          quelle: f.blatt.unterschriftAG.quelle,
          datum: f.blatt.datum.wert,
        })),
        ...plaene.map((pl): Beleg => ({ titel: `Plan ${pl.planNr.wert}, Index ${pl.index.wert}`, text: "Planänderung", quelle: pl.index.quelle, datum: pl.datum.wert })),
        ...mails.map((m): Beleg => ({ titel: `Mail ${tagMonat(m.datum.wert)}`, text: m.zitat ? `„${m.zitat.wert}“` : m.betreff.wert, quelle: m.zitat?.quelle ?? m.betreff.quelle, datum: m.datum.wert })),
      ],
      pruefstand: "maschinell",
    });
  }
  return risiken;
}

function stundenAbweichung(k: Kontext, befunde: Befund[]): Kuerzungsrisiko[] {
  const v = k.d.vertrag;
  const abzurechnen = k.d.regie.filter((rb) => k.regieVerrechnet.has(rb.nr.wert) || (rb.unterschriftAG.wert && befunde.some((b) => b.schluessel === `regie:${rb.nr.wert}`)));
  const risiken: Kuerzungsrisiko[] = [];
  for (const rb of abzurechnen) {
    const liste = k.d.stundenlisten.find((s) => s.von.wert <= rb.datum.wert && rb.datum.wert <= s.bis.wert);
    const eintrag = liste?.eintraege.find((e) => e.regieNr.wert === rb.nr.wert);
    if (!liste || !eintrag) continue;
    const mehrM = Math.max(0, rb.stundenMonteur.wert - eintrag.stundenMonteur.wert);
    const mehrH = Math.max(0, rb.stundenHelfer.wert - eintrag.stundenHelfer.wert);
    if (mehrM === 0 && mehrH === 0) continue;
    const betrag = stundenBetrag(mehrM, v.regiesatzMonteur.wert) + stundenBetrag(mehrH, v.regiesatzHelfer.wert);
    const was = [mehrM ? `${menge(mehrM)} h Monteur` : "", mehrH ? `${menge(mehrH)} h Helfer` : ""].filter(Boolean).join(", ");
    const kw = kalenderwoche(liste.von.wert);
    const detail = mehrM
      ? `Bericht ${menge(rb.stundenMonteur.wert)} h, Stundenliste KW ${kw}: ${menge(eintrag.stundenMonteur.wert)} h`
      : `Bericht ${menge(rb.stundenHelfer.wert)} h Helfer, Stundenliste KW ${kw}: ${menge(eintrag.stundenHelfer.wert)} h`;
    const befund = befunde.find((b) => b.schluessel === `regie:${rb.nr.wert}`);
    risiken.push({
      schluessel: `vp:stunden_weichen_ab:${rb.nr.wert}`,
      grund: "stunden_weichen_ab",
      bezug: rb.nr.wert,
      befundSchluessel: befund?.schluessel ?? null,
      was,
      detail,
      abhilfe: "Stunden korrigieren oder Stundenliste nachreichen",
      betrag,
      bereitsGekuerzt: k.kuerzungen.has(rb.nr.wert),
      belege: [
        { titel: `Regiebericht ${rb.nr.wert}`, text: `${menge(rb.stundenMonteur.wert)} h Monteur`, quelle: rb.stundenMonteur.quelle, datum: rb.datum.wert },
        { titel: `Stundenliste KW ${kw}`, text: `${menge(eintrag.stundenMonteur.wert)} h Monteur für ${rb.nr.wert}`, quelle: eintrag.stundenMonteur.quelle, datum: liste.bis.wert },
      ],
      pruefstand: "maschinell",
    });
  }
  return risiken;
}

function rechenfehler(k: Kontext, entwurf: Rechnung): Kuerzungsrisiko[] {
  const risiken: Kuerzungsrisiko[] = [];
  for (const z of entwurf.zeilen) {
    if (z.typ !== "lv" && z.typ !== "zusatz") continue;
    if (z.typ === "lv" && z.teilleistung) continue;
    const richtig = betragAusMenge(z.menge.wert, z.ep.wert);
    const zuViel = z.betrag.wert - richtig;
    if (zuViel <= 0) continue;
    const nr = z.positionNr.wert;
    const einheit = k.lv.get(nr)?.einheit.wert;
    const herkunft = (k.abschlaege.get(nr) ?? []).find((f) => f.zeile.betrag.wert === z.betrag.wert && f.zeile.menge.wert === z.menge.wert);
    risiken.push({
      schluessel: `vp:rechenfehler:${nr}`,
      grund: "rechenfehler",
      bezug: nr,
      befundSchluessel: null,
      was: herkunft ? `Rechenfehler aus ${herkunft.rechnung.nr.wert}` : "Rechenfehler",
      detail: `${menge(z.menge.wert, einheit)} × ${euro(z.ep.wert)} = ${euro(richtig)}, verrechnet ${euro(z.betrag.wert)}`,
      abhilfe: "Fehler korrigieren, sonst wird er in die Schlussrechnung übernommen",
      betrag: zuViel,
      bereitsGekuerzt: k.kuerzungen.has(nr),
      belege: [
        ...(herkunft
          ? [{ titel: `${herkunft.rechnung.nr.wert} Pos. ${nr}`, text: `verrechnet ${euro(herkunft.zeile.betrag.wert)}`, quelle: herkunft.zeile.betrag.quelle, datum: herkunft.rechnung.datum.wert }]
          : []),
        { titel: `Entwurf Pos. ${nr}`, text: `verrechnet ${euro(z.betrag.wert)}`, quelle: z.betrag.quelle, datum: entwurf.datum.wert },
      ],
      pruefstand: "maschinell",
    });
  }
  return risiken;
}

function ausserhalbLv(k: Kontext, entwurf: Rechnung): Kuerzungsrisiko[] {
  const risiken: Kuerzungsrisiko[] = [];
  for (const z of entwurf.zeilen) {
    if (z.typ !== "lv" && z.typ !== "zusatz") continue;
    const nr = z.positionNr.wert;
    if (k.lv.has(nr)) continue;
    const nachtrag = k.d.nachtraege.some((n) => n.positionNr.wert === nr && n.beauftragt.wert);
    const anweisung = k.d.mails.some((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.includes(nr));
    if (nachtrag || anweisung) continue;
    const text = z.typ === "zusatz" ? z.text.wert : nr;
    const ar = (k.abschlaege.get(nr) ?? [])[0];
    risiken.push({
      schluessel: `vp:ausserhalb_lv_kein_nachtrag:${nr}`,
      grund: "ausserhalb_lv_kein_nachtrag",
      bezug: nr,
      befundSchluessel: null,
      was: "ganze Position",
      detail: `${nr} ${text}: außerhalb des LV, kein Nachtragsauftrag und keine Anweisung gefunden`,
      abhilfe: "Anweisung suchen oder herausnehmen",
      betrag: z.betrag.wert,
      bereitsGekuerzt: k.kuerzungen.has(nr),
      belege: [
        ...(ar ? [{ titel: `${ar.rechnung.nr.wert} Pos. ${nr}`, text: `${text}, ${euro(ar.zeile.betrag.wert)}`, quelle: ar.zeile.betrag.quelle, datum: ar.rechnung.datum.wert }] : []),
        { titel: `Entwurf Pos. ${nr}`, text: `${text}, ${euro(z.betrag.wert)}`, quelle: z.betrag.quelle, datum: entwurf.datum.wert },
      ],
      pruefstand: "maschinell",
    });
  }
  return risiken;
}

/** Nur mit eigenem Entwurf: Ohne Schlussrechnung gibt es nichts aus GU-Sicht vorzuprüfen. */
export function vorpruefung(k: Kontext, befunde: Befund[]) {
  const entwurf = k.d.entwurf;
  if (!entwurf) return null;
  const risiken = [...aufmassOhneGegenzeichnung(k, befunde), ...stundenAbweichung(k, befunde), ...rechenfehler(k, entwurf), ...ausserhalbLv(k, entwurf)];
  const summe = risiken.reduce((s, r) => s + r.betrag, 0);
  const gekuerzt = risiken.filter((r) => r.bereitsGekuerzt);
  const bezuege = new Set(risiken.map((r) => r.bezug));
  const kbZeilen = k.d.korrekturblaetter.flatMap((kb) => kb.zeilen);
  return {
    risiken,
    summe,
    bereitsGekuerzt: { anzahl: gekuerzt.length, betrag: gekuerzt.reduce((s, r) => s + r.betrag, 0) },
    korrekturblatt: {
      gekuerzt: kbZeilen.reduce((s, z) => s + z.kuerzung.wert, 0),
      zeilen: kbZeilen.length,
      erkannt: kbZeilen.filter((z) => bezuege.has(z.positionNr.wert)).length,
    },
  };
}

/** Neutrale Hinweise ohne Betrag: Mengenänderung über 20 % gegenüber dem LV. */
export function hinweise(k: Kontext, befunde: Befund[]): Hinweis[] {
  const ergebnis: Hinweis[] = [];
  for (const b of befunde) {
    if (!b.positionNr || (b.art !== "mehrmenge" && b.art !== "mehrmenge_plan")) continue;
    const p = k.lv.get(b.positionNr);
    if (!p || p.menge.wert <= 0) continue;
    const aenderung = rundeHalbAuf((aufmassMenge(k, b.positionNr) - p.menge.wert) * 10000, p.menge.wert);
    if (aenderung <= 2000) continue;
    ergebnis.push({
      schluessel: `mengenaenderung:${b.positionNr}`,
      art: "mengenaenderung_ueber_20",
      positionNr: b.positionNr,
      befundSchluessel: b.schluessel,
      aenderung,
      text: "Der GU kann hier einen neuen Einheitspreis prüfen.",
    });
  }
  return ergebnis;
}
