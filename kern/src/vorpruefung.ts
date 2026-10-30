// Run step "Vorprüfung" (SPEZIFIKATION.md 3.1): the checks a Generalunternehmer's checking software runs on the
// Schlussrechnung, run before on the own Entwurf with the finds. Result: positions with "Kürzungsrisiko", reason, remedy,
// "droht" apart from "schon gekürzt". Overlaps "zusätzlich verrechenbar"; never added to it. Ported from the v1 core
// (vorpruefung.ts); new in v3: one risk per find (F1 covers four positions), "Menge ohne Aufmaß-Nachweis" (invoiced above
// the Aufmaß), "Regie nicht unterschrieben" for a Regiebericht the Abrechnung puts into the Entwurf.

import { betragAusMenge, euro, menge, stundenBetrag } from "./geld";
import { arbeitsdatum, aufmassMenge, baueKontext, verrechnetMenge, type Kontext } from "./kontext";
import type { AbzugArt, Bp, Cent, Datensatz } from "./modell";
import { datumText, type Abgleich } from "./regeln";
import type { Kuerzungsrisiko, Nachweis } from "./typen";

const tagMonat = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.`;

/** ISO calendar week of a date "YYYY-MM-DD". */
export function kalenderwoche(iso: string): number {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  return Math.ceil(((d.getTime() - Date.UTC(d.getUTCFullYear(), 0, 1)) / 86_400_000 + 1) / 7);
}

type Roh = Omit<Kuerzungsrisiko, "nr">;

function aufmassNichtGegengezeichnet(k: Kontext, a: Abgleich): Roh[] {
  const jeFund = new Map<string, { nrs: string[]; betrag: Cent; blaetter: Set<string>; text: string[] }>();
  for (const p of k.d.positionen) {
    // What goes to the Auftraggeber (Entwurf plus the finds) beyond what he countersigned, at most what lies on sheets
    // he did not countersign.
    const nr = p.nr.wert;
    const funde = k.aufmass.get(nr) ?? [];
    const gezeichnet = funde.filter((f) => f.blatt.gegengezeichnet.wert).reduce((s, f) => s + f.zeile.menge.wert, 0);
    const ungezeichnet = aufmassMenge(k, nr) - gezeichnet;
    if (ungezeichnet <= 0) continue;
    const fundTeile = a.funde.filter((f) => f.entscheidung !== "nicht_verrechnen" && f.belegstand === "belegt").flatMap((f) => f.positionen.filter((x) => x.positionNr === nr));
    const abgerechnet = verrechnetMenge(k, nr) + fundTeile.reduce((s, x) => s + x.differenz, 0);
    const gefaehrdet = Math.min(ungezeichnet, abgerechnet - gezeichnet);
    if (gefaehrdet <= 0) continue;
    const fund = a.funde.find((f) => f.positionen.some((x) => x.positionNr === nr));
    const key = fund?.schluessel ?? `position:${nr}`;
    const g = jeFund.get(key) ?? { nrs: [], betrag: 0, blaetter: new Set<string>(), text: [] };
    g.nrs.push(nr);
    g.betrag += betragAusMenge(gefaehrdet, p.ep.wert);
    g.text.push(`${menge(gefaehrdet, p.einheit.wert)} ${nr}`);
    for (const f of funde.filter((x) => !x.blatt.gegengezeichnet.wert)) g.blaetter.add(f.blatt.nr);
    jeFund.set(key, g);
  }
  return [...jeFund.entries()].map(([key, g]) => {
    const fund = a.funde.find((f) => f.schluessel === key);
    const nrs = new Set(g.nrs);
    const plaene = k.d.plaene.filter((pl) => pl.vermerke.some((v) => v.typ === "aenderung" && nrs.has(v.positionNr.wert)));
    const mails = k.d.emails.filter((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.some((x) => nrs.has(x)));
    const beilegen = [...plaene.map((pl) => `Plan ${pl.planNr.wert} Index ${pl.index.wert}`), ...mails.map((m) => `die E-Mail vom ${tagMonat(m.datum.wert)}`)];
    const beilagen = [
      ...plaene.map((pl) => ({ belegId: pl.belegId, seite: pl.planNr.quelle.seite, stelle: pl.vermerke.find((v) => v.typ === "aenderung" && nrs.has(v.positionNr.wert))?.text.quelle.stelle ?? "Plankopf", titel: `Plan ${pl.planNr.wert} Index ${pl.index.wert}` })),
      ...mails.map((m) => ({ belegId: m.belegId, seite: m.datum.quelle.seite, stelle: m.zitat?.quelle.stelle ?? "Absatz 1", titel: `E-Mail vom ${datumText(m.datum.wert)}` })),
    ];
    const blaetter = k.d.aufmass.filter((b) => g.blaetter.has(b.nr));
    return {
      schluessel: `vp:aufmass_nicht_gegengezeichnet:${key}`,
      grund: "aufmass_nicht_gegengezeichnet" as const,
      bezug: fund ? `${fund.nr} (${g.nrs.length === 1 ? g.nrs[0] : `${g.nrs.length} Positionen`})` : g.nrs[0],
      fundSchluessel: fund?.schluessel ?? null,
      was: fund?.art === "mehrmenge_plan" ? `Mehrmenge, ${fund.titel.split(": ").slice(1).join(": ")}` : `${g.text.join(", ")} ohne Gegenzeichnung`,
      detail: `${blaetter.map((b) => `Aufmaßblatt ${b.nr}`).join(", ")} vom Auftraggeber nicht gegengezeichnet`,
      abhilfe: `${beilegen.length ? `${beilegen.join(" und ")} beilegen, ` : ""}gemeinsames Aufmaß vereinbaren`,
      beilagen,
      betrag: g.betrag,
      zustand: g.nrs.some((nr) => k.kuerzungen.has(nr)) ? ("schon_gekuerzt" as const) : ("droht" as const),
      nachweise: blaetter.map((b): Nachweis => ({ titel: `Aufmaßblatt ${b.nr}`, text: "Unterschrift Auftraggeber fehlt", datum: b.datum.wert, quelle: b.gegengezeichnet.quelle, art: "aufmassblatt", rolle: "leistung", imErp: b.erfasstAm !== null })),
    };
  });
}

function stundenWeichenAb(k: Kontext, a: Abgleich): Roh[] {
  const v = k.d.vertrag;
  const abzurechnen = k.d.regie.filter((rb) => k.regieVerrechnet.has(rb.nr) || a.funde.some((f) => f.schluessel === `regie:${rb.nr}` && f.belegstand === "belegt"));
  return abzurechnen.flatMap((rb): Roh[] => {
    // Every Stundenzettel of a week with a work day of the report and an entry for it; the hours are added up.
    const tage = rb.arbeitstage.wert.length ? rb.arbeitstage.wert : [arbeitsdatum(rb)];
    const zettel = k.d.stundenzettel.filter((s) => tage.some((t) => s.von.wert <= t && t <= s.bis.wert) && s.eintraege.some((x) => x.regieberichtNr.wert === rb.nr));
    if (!zettel.length) return [];
    const eintraege = zettel.flatMap((s) => s.eintraege.filter((x) => x.regieberichtNr.wert === rb.nr));
    const e = { stundenMonteur: { wert: eintraege.reduce((s, x) => s + x.stundenMonteur.wert, 0), quelle: eintraege[0].stundenMonteur.quelle }, stundenHelfer: { wert: eintraege.reduce((s, x) => s + x.stundenHelfer.wert, 0) } };
    const mehrM = Math.max(0, rb.stundenMonteur.wert - e.stundenMonteur.wert);
    const mehrH = Math.max(0, rb.stundenHelfer.wert - e.stundenHelfer.wert);
    if (mehrM === 0 && mehrH === 0) return [];
    const was = [mehrM ? `${menge(mehrM)} h Monteur` : "", mehrH ? `${menge(mehrH)} h Helfer` : ""].filter(Boolean).join(", ");
    const kw = [...new Set(zettel.map((s) => kalenderwoche(s.von.wert)))].join(" und ");
    const trupp = [...new Set(zettel.map((s) => s.trupp.wert))].join(", ");
    const bis = zettel.map((s) => s.bis.wert).sort().at(-1)!;
    const h = (m: number, hh: number) => `${menge(m)} h Monteur und ${menge(hh)} h Helfer`;
    const fund = a.funde.find((f) => f.schluessel === `regie:${rb.nr}`);
    return [
      {
        schluessel: `vp:stunden_weichen_ab:${rb.nr}`,
        grund: "stunden_weichen_ab",
        bezug: `Regiebericht ${rb.nr}${fund ? ` (${fund.nr})` : ""}`,
        fundSchluessel: fund?.schluessel ?? null,
        was,
        detail: `Regiebericht ${rb.nr}: ${h(rb.stundenMonteur.wert, rb.stundenHelfer.wert)}; Stundenzettel KW ${kw}, ${trupp}: ${h(e.stundenMonteur.wert, e.stundenHelfer.wert)} zu Regiebericht ${rb.nr}`,
        abhilfe: `${was} mit der Bauleitung klären, bevor die Schlussrechnung hinausgeht`,
        betrag: stundenBetrag(mehrM, v.regiesatzMonteur.wert) + stundenBetrag(mehrH, v.regiesatzHelfer.wert),
        zustand: k.kuerzungen.has(`Regiebericht ${rb.nr}`) ? "schon_gekuerzt" : "droht",
        nachweise: [
          { titel: `Regiebericht ${rb.nr}`, text: h(rb.stundenMonteur.wert, rb.stundenHelfer.wert), datum: rb.datum.wert, quelle: rb.stundenMonteur.quelle, art: "regiebericht", rolle: "leistung", imErp: false },
          { titel: `Stundenzettel KW ${kw}, ${trupp}`, text: `${h(e.stundenMonteur.wert, e.stundenHelfer.wert)} zu Regiebericht ${rb.nr}`, datum: bis, quelle: e.stundenMonteur.quelle, art: "stundenzettel", rolle: "leistung", imErp: false },
        ],
      },
    ];
  });
}

function entwurfsZeilen(k: Kontext): Roh[] {
  const e = k.d.entwurf!;
  const risiken: Roh[] = [];
  const entwurfNachweis = (nr: string, text: string, quelle: Nachweis["quelle"]): Nachweis => ({ titel: `Entwurf, ${nr}`, text, datum: e.datum.wert, quelle, art: "entwurf", rolle: "preis", imErp: true });
  for (const z of e.zeilen) {
    if (z.typ === "regie") {
      const rb = k.d.regie.find((r) => r.nr === z.regieberichtNr.wert);
      if (rb && !rb.unterschrieben.wert)
        risiken.push({
          schluessel: `vp:regie_nicht_unterschrieben:${rb.nr}`,
          grund: "regie_nicht_unterschrieben",
          bezug: `Regiebericht ${rb.nr}`,
          fundSchluessel: `regie:${rb.nr}`,
          was: "ganzer Regiebericht",
          detail: `Regiebericht ${rb.nr} vom ${datumText(rb.datum.wert)} ist im Entwurf, aber nicht unterschrieben`,
          abhilfe: "Regiebericht unterschreiben lassen oder aus dem Entwurf nehmen",
          betrag: z.betrag.wert,
          zustand: k.kuerzungen.has(`Regiebericht ${rb.nr}`) ? "schon_gekuerzt" : "droht",
          nachweise: [entwurfNachweis(`Regiebericht ${rb.nr}`, euro(z.betrag.wert), z.betrag.quelle)],
        });
      continue;
    }
    if (z.typ !== "position" && z.typ !== "zusatz") continue;
    const nr = z.positionNr.wert;
    const richtig = betragAusMenge(z.menge.wert, z.ep.wert);
    if (z.betrag.wert > richtig)
      risiken.push({
        schluessel: `vp:rechenfehler:${nr}`,
        grund: "rechenfehler",
        bezug: nr,
        fundSchluessel: null,
        was: "Rechenfehler",
        detail: `${menge(z.menge.wert)} × ${euro(z.ep.wert)} = ${euro(richtig)}, verrechnet ${euro(z.betrag.wert)}`,
        abhilfe: "Zeile korrigieren, sonst geht der Fehler in die Schlussrechnung",
        betrag: z.betrag.wert - richtig,
        zustand: k.kuerzungen.has(nr) ? "schon_gekuerzt" : "droht",
        nachweise: [entwurfNachweis(nr, `verrechnet ${euro(z.betrag.wert)}`, z.betrag.quelle)],
      });
    const position = k.lv.get(nr);
    if (!position) {
      const nachtrag = k.d.nachtraege.some((n) => n.nr.wert === nr && n.beauftragt.wert);
      const anweisung = k.d.emails.some((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.includes(nr));
      if (!nachtrag && !anweisung) {
        const text = z.typ === "zusatz" ? z.text.wert : nr;
        const ar = k.abschlaege.get(nr)?.[0];
        risiken.push({
          schluessel: `vp:ausserhalb_lv_kein_nachtrag:${nr}`,
          grund: "ausserhalb_lv_kein_nachtrag",
          bezug: nr,
          fundSchluessel: null,
          was: "die ganze Position",
          detail: `${nr} ${text}, ${menge(z.menge.wert)} × ${euro(z.ep.wert)}${ar ? `, verrechnet in ${ar.rechnung.nr.wert} und` : ""} im Entwurf: kein Nachtrag und keine Anweisung gefunden`,
          abhilfe: "Anweisung suchen oder Position streichen",
          betrag: z.betrag.wert,
          zustand: k.kuerzungen.has(nr) ? "schon_gekuerzt" : "droht",
          nachweise: [
            ...(ar ? [{ titel: `${ar.rechnung.nr.wert}, ${nr}`, text: `${text}, ${euro(ar.zeile.betrag.wert)}`, datum: ar.rechnung.datum.wert, quelle: ar.zeile.betrag.quelle, art: "abschlagsrechnung" as const, rolle: "preis" as const, imErp: true }] : []),
            ...k.d.korrekturblaetter.flatMap((kb) => kb.zeilen.filter((x) => x.positionNr.wert === nr).map((x): Nachweis => ({ titel: `Korrekturblatt ${kb.rechnungNr.wert}`, text: `${x.text.wert}, ${euro(x.kuerzung.wert)}`, datum: kb.datum.wert, quelle: x.kuerzung.quelle, art: "korrekturblatt", rolle: "preis", imErp: false }))),
            entwurfNachweis(nr, `${text}, ${euro(z.betrag.wert)}`, z.betrag.quelle),
          ],
        });
      }
    }
    // Invoiced above the Aufmaß. Lump sums are not measured.
    const einheit = position?.einheit.wert ?? (z.typ === "zusatz" ? z.einheit.wert : undefined);
    const aufmass = aufmassMenge(k, nr);
    if (einheit !== "psch" && z.menge.wert > aufmass)
      risiken.push({
        schluessel: `vp:menge_ohne_aufmass:${nr}`,
        grund: "menge_ohne_aufmass",
        bezug: nr,
        fundSchluessel: null,
        was: `${menge(z.menge.wert - aufmass, einheit)} über dem Aufmaß`,
        detail: `verrechnet ${menge(z.menge.wert, einheit)}, aufgemessen ${menge(aufmass, einheit)}`,
        abhilfe: "Aufmaß nachreichen oder Menge auf das Aufmaß setzen",
        betrag: betragAusMenge(z.menge.wert - aufmass, z.ep.wert),
        zustand: k.kuerzungen.has(nr) ? "schon_gekuerzt" : "droht",
        nachweise: [entwurfNachweis(nr, `verrechnet ${menge(z.menge.wert, einheit)}`, z.menge.quelle)],
      });
  }
  return risiken;
}

/** Every rate the Auftraggeber announced, checked against the Vertrag. */
export interface Satzpruefung {
  art: AbzugArt;
  satz: Bp;
  quelle: "vertrag" | "abzugsschreiben";
  pruefung: "laut_vertrag" | "abweichung" | "abzug_ohne_vertragspunkt";
  vertragspunkt: string | null;
}

export function saetzePruefen(d: Datensatz): Satzpruefung[] {
  const v = d.vertrag;
  const arten = new Set<AbzugArt>([...v.saetze.filter((s) => s.phase !== "abschlag").map((s) => s.art), ...(d.abzugsschreiben?.abzuege.map((a) => a.art) ?? [])]);
  return [...arten].map((art) => {
    const vs = v.saetze.find((s) => s.art === art && s.phase !== "abschlag");
    const ag = d.abzugsschreiben?.abzuege.find((a) => a.art === art);
    const satz = ag ? ag.satz.wert : vs!.satz.wert;
    return { art, satz, quelle: ag ? "abzugsschreiben" : "vertrag", pruefung: !vs ? "abzug_ohne_vertragspunkt" : vs.satz.wert === satz ? "laut_vertrag" : "abweichung", vertragspunkt: vs?.punkt ?? null };
  });
}

export interface Vorpruefung {
  risiken: Kuerzungsrisiko[];
  summe: Cent;
  droht: Cent;
  schonGekuerzt: Cent;
  /** "Davon mit Kürzungsrisiko" (E13): the "droht" amounts that lie inside "zusätzlich verrechenbar". Shown, never subtracted. */
  davonMitKuerzungsrisiko: Cent;
  /** How many lines of the Korrekturblätter the Vorprüfung found too. */
  korrekturblatt: { zeilen: number; erkannt: number };
  saetze: Satzpruefung[];
}

/** Only with an own Entwurf: without a Schlussrechnung there is nothing to check the way the Auftraggeber will. */
export function vorpruefung(d: Datensatz, a: Abgleich): Vorpruefung | null {
  if (!d.entwurf || !a.laeuft) return null;
  const k = baueKontext(d);
  const roh = [...aufmassNichtGegengezeichnet(k, a), ...stundenWeichenAb(k, a), ...entwurfsZeilen(k)];
  const risiken = roh
    .sort((x, y) => Number(x.zustand === "schon_gekuerzt") - Number(y.zustand === "schon_gekuerzt") || y.betrag - x.betrag || x.schluessel.localeCompare(y.schluessel))
    .map((r, i) => ({ ...r, nr: `G${i + 1}` }));
  const summe = (rs: Kuerzungsrisiko[]) => rs.reduce((s, r) => s + r.betrag, 0);
  const verrechenbar = new Set(a.funde.filter((f) => f.belegstand === "belegt" && f.entscheidung !== "nicht_verrechnen").map((f) => f.schluessel));
  const kb = d.korrekturblaetter.flatMap((x) => x.zeilen);
  const bezuege = new Set(risiken.flatMap((r) => [r.bezug, r.bezug.replace(/ \(.*\)$/, "")]));
  return {
    risiken,
    summe: summe(risiken),
    droht: summe(risiken.filter((r) => r.zustand === "droht")),
    schonGekuerzt: summe(risiken.filter((r) => r.zustand === "schon_gekuerzt")),
    davonMitKuerzungsrisiko: summe(risiken.filter((r) => r.zustand === "droht" && r.fundSchluessel !== null && verrechenbar.has(r.fundSchluessel))),
    korrekturblatt: { zeilen: kb.length, erkannt: kb.filter((z) => bezuege.has(z.positionNr.wert)).length },
    saetze: saetzePruefen(d),
  };
}
