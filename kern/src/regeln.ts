// Run step "Abgleich" (SPEZIFIKATION.md 3.1 and 5.1): what was done but is not in the own Entwurf, or for a project
// "in Ausführung" not in any Abschlagsrechnung up to the last one. Every rule gives an amount, its Rechenweg and the
// Belege with their place in the original. Ported from the v1 core (befunde.ts); new in v3: a find may cover several
// positions (one plan change), Regie material carries the surcharge of the Vertrag, ongoing projects use the work date.
// The solution list is never read here.

import { betragAusMenge, euro, menge, prozent, prozentText, rundeHalbAuf, stunden, stundenBetrag } from "./geld";
import { arbeitsdatum, aufmassFunde, aufmassMenge, baueKontext, verrechneteZeilen, verrechnetMenge, vorGrenze, type AufmassFund, type Kontext } from "./kontext";
import type { Cent, Datensatz, Datum, Email, Entscheidung, Plan, Quelle, Regiebericht, WhatsAppMeldung } from "./modell";
import { entscheidungsstand } from "./modell";
import type { Belegstand, Fund, FundArt, FundPosition, Hinweis, Nachweis, RechenSchritt } from "./typen";

export const datumText = (iso: Datum) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

/** "Polier" → "vom Polier", "örtliche Bauaufsicht" → "von der örtlichen Bauaufsicht". */
export function vonDem(rolle: string): string {
  if (/^(örtliche|Bauleitung|Bauaufsicht)/.test(rolle)) return `von der ${rolle.replace(/^örtliche /, "örtlichen ")}`;
  return `vom ${rolle}`;
}

const quellen = (...q: Quelle[]): { quellen?: Quelle[] } => (q.length ? { quellen: q } : {});
const nachDatum = (n: Nachweis[]) => [...n].sort((a, b) => (a.datum ?? "").localeCompare(b.datum ?? ""));
const ohneDoppel = (n: Nachweis[]) => n.filter((x, i) => n.findIndex((y) => y.quelle.belegId === x.quelle.belegId) === i);

// ---------- Nachweise ----------

const planNachweis = (p: Plan, text: string): Nachweis => ({ titel: `Plan ${p.planNr.wert}, Index ${p.index.wert}`, text, datum: p.datum.wert, quelle: p.index.quelle, art: "plan", rolle: "leistung", imErp: false });
const mailNachweis = (m: Email): Nachweis => ({
  titel: `E-Mail ${m.absender.wert}, ${datumText(m.datum.wert)}`,
  text: m.zitat ? `„${m.zitat.wert}“` : m.betreff.wert,
  datum: m.datum.wert,
  quelle: m.zitat?.quelle ?? m.betreff.quelle,
  art: "email",
  rolle: "leistung",
  imErp: false,
});
const meldungNachweis = (m: WhatsAppMeldung): Nachweis => ({
  titel: `WhatsApp-Meldung ${datumText(m.zeitpunkt.slice(0, 10))}, ${m.zeitpunkt.slice(11, 16)}, ${m.absender}`,
  text: `„${m.transkript.wert}“`,
  datum: m.zeitpunkt.slice(0, 10),
  quelle: m.transkript.quelle,
  art: "whatsapp",
  rolle: "leistung",
  imErp: false,
});
const blattNachweis = (k: Kontext, f: AufmassFund): Nachweis[] => {
  const b = f.blatt;
  const einheit = k.lv.get(f.zeile.positionNr.wert)?.einheit.wert;
  const zustand = [b.gegengezeichnet.wert ? "gegengezeichnet" : "nicht gegengezeichnet", b.erfasstAm ? `erfasst am ${datumText(b.erfasstAm)}` : "nie erfasst"].join(", ");
  const grundlage = b.grundlageBelegId ? k.d.fotodokumentationen.find((x) => x.belegId === b.grundlageBelegId) : undefined;
  return [
    { titel: `Aufmaßblatt ${b.nr}`, text: `${menge(f.zeile.menge.wert, einheit)} aufgemessen, ${zustand}`, datum: b.datum.wert, quelle: f.zeile.menge.quelle, art: "aufmassblatt", rolle: "leistung", imErp: b.erfasstAm !== null },
    ...(grundlage ? [{ titel: grundlage.titel.wert, text: `${menge(grundlage.menge.wert, einheit)} gezählt`, datum: grundlage.datum.wert, quelle: grundlage.menge.quelle, art: "fotodokumentation" as const, rolle: "leistung" as const, imErp: false }] : []),
  ];
};

// ---------- Mehrmengen and "erbracht, nicht verrechnet" ----------

interface Kandidat {
  pos: FundPosition;
  /** Aufmaßblätter beyond what is invoiced (invoiced quantities use up the sheets in date order). */
  offen: AufmassFund[];
  ueberLv: boolean;
  /** The plan change that explains the quantity, if any. */
  planAenderung: Plan | null;
}

function kandidaten(k: Kontext): Kandidat[] {
  const ergebnis: Kandidat[] = [];
  for (const p of k.d.positionen) {
    const nr = p.nr.wert;
    if (p.einheit.wert === "psch") continue;
    const aufmass = aufmassMenge(k, nr, true);
    const verrechnet = verrechnetMenge(k, nr);
    if (aufmass <= verrechnet) continue;
    let rest = verrechnet;
    const offen: AufmassFund[] = [];
    for (const f of aufmassFunde(k, nr, true)) {
      if (rest >= f.zeile.menge.wert) rest -= f.zeile.menge.wert;
      else {
        offen.push(f);
        rest = 0;
      }
    }
    const differenz = aufmass - verrechnet;
    const ueberLv = aufmass > p.menge.wert;
    const planAenderung = ueberLv ? (k.d.plaene.filter((pl) => pl.vermerke.some((v) => v.typ === "aenderung" && v.positionNr.wert === nr)).sort((a, b) => b.datum.wert.localeCompare(a.datum.wert))[0] ?? null) : null;
    ergebnis.push({
      pos: { positionNr: nr, kurztext: p.kurztext.wert, einheit: p.einheit.wert, ep: p.ep.wert, lvMenge: p.menge.wert, aufmassMenge: aufmass, verrechnetMenge: verrechnet, differenz, betrag: betragAusMenge(differenz, p.ep.wert) },
      offen,
      ueberLv,
      planAenderung,
    });
  }
  return ergebnis;
}

function k7Text(k: Kontext, nr: string): string | null {
  const k7 = k.d.preisbasis?.k7.find((x) => x.positionNr === nr);
  const mlp = k.d.preisbasis?.mittellohnpreis.wert;
  if (!k7 || !mlp) return null;
  const lohn = stundenBetrag(k7.lohnHundertstel.wert, mlp);
  const sonst = k7.sonstigesJeEinheit.wert;
  const ep = k.lv.get(nr)!.ep.wert;
  return `K7 ${nr}: ${stunden(k7.lohnHundertstel.wert)} × ${euro(mlp)} = ${euro(lohn)} Lohn + ${euro(sonst)} Sonstiges = ${euro(lohn + sonst)}${lohn + sonst === ep ? "" : `, weicht vom Einheitspreis ${euro(ep)} ab`}`;
}

function mengenFunde(k: Kontext): Omit<Fund, "nr" | "entscheidung">[] {
  const gruppen = new Map<string, Kandidat[]>();
  for (const c of kandidaten(k)) {
    const key = c.planAenderung ? `plan:${c.planAenderung.planNr.wert}:${c.planAenderung.index.wert}` : `${c.ueberLv ? "mehrmenge" : "nicht_verrechnet"}:${c.pos.positionNr}`;
    gruppen.set(key, [...(gruppen.get(key) ?? []), c]);
  }
  const label = k.d.entwurf ? "Verrechnet im Entwurf" : "In Abschlagsrechnungen";
  return [...gruppen.entries()].map(([schluessel, cs]) => {
    const plan = cs[0].planAenderung;
    const art: FundArt = plan ? "mehrmenge_plan" : cs[0].ueberLv ? "mehrmenge" : "nicht_verrechnet";
    const betrag = cs.reduce((s, c) => s + c.pos.betrag, 0);
    const positionen = cs.map((c) => c.pos);
    const nrs = new Set(positionen.map((p) => p.positionNr));
    const einzel = cs.length === 1 ? cs[0] : null;
    const schritte: RechenSchritt[] = einzel
      ? [
          { bezeichnung: "Beauftragt (Leistungsverzeichnis)", wert: menge(einzel.pos.lvMenge, k.lv.get(einzel.pos.positionNr)!.einheit.wert), ...quellen(k.lv.get(einzel.pos.positionNr)!.menge.quelle) },
          { bezeichnung: k.grenze ? `Erbracht (Aufmaß bis ${datumText(k.grenze)})` : "Erbracht (Aufmaß)", wert: menge(einzel.pos.aufmassMenge, k.lv.get(einzel.pos.positionNr)!.einheit.wert), ...quellen(...aufmassFunde(k, einzel.pos.positionNr, true).map((f) => f.zeile.menge.quelle)) },
          { bezeichnung: label, wert: menge(einzel.pos.verrechnetMenge, k.lv.get(einzel.pos.positionNr)!.einheit.wert), ...quellen(...verrechneteZeilen(k, einzel.pos.positionNr).map((f) => f.zeile.menge.quelle)) },
          { bezeichnung: "Einheitspreis laut Leistungsverzeichnis", wert: euro(einzel.pos.ep), ...quellen(k.lv.get(einzel.pos.positionNr)!.ep.quelle) },
          { bezeichnung: FUND_SUMME[art], wert: `${menge(einzel.pos.differenz, k.lv.get(einzel.pos.positionNr)!.einheit.wert)} × ${euro(einzel.pos.ep)}`, betrag, summe: true },
        ]
      : [
          ...positionen.map((p) => ({ bezeichnung: `${p.positionNr} ${p.kurztext}`, wert: `${menge(p.differenz, k.lv.get(p.positionNr)!.einheit.wert)} × ${euro(p.ep)}`, betrag: p.betrag, ...quellen(...cs.find((c) => c.pos === p)!.offen.map((f) => f.zeile.menge.quelle), k.lv.get(p.positionNr)!.ep.quelle) })),
          { bezeichnung: FUND_SUMME[art], wert: `${positionen.length} Positionen`, betrag, summe: true },
        ];
    const text = `${positionen.map((p) => `${p.einheit === "Stk" ? menge(p.differenz) : menge(p.differenz, k.lv.get(p.positionNr)!.einheit.wert)} × ${euro(p.ep)}`).join(" + ")} = ${euro(betrag)}`;
    const plausibilitaet = positionen.map((p) => k7Text(k, p.positionNr)).filter((x): x is string => x !== null).join("; ");

    const vorher = plan ? k.d.plaene.filter((x) => x.planNr.wert === plan.planNr.wert && x.datum.wert < plan.datum.wert).sort((a, b) => b.datum.wert.localeCompare(a.datum.wert))[0] : undefined;
    const nachweise: Nachweis[] = ohneDoppel(
      nachDatum([
        ...k.d.plaene
          .filter((pl) => pl.vermerke.some((v) => nrs.has(v.positionNr.wert)))
          .map((pl) => planNachweis(pl, pl.vermerke.find((v) => nrs.has(v.positionNr.wert))!.text.wert)),
        ...k.d.emails.filter((m) => m.kategorie.wert === "anweisung" && m.bezugPositionen.wert.some((x) => nrs.has(x))).map(mailNachweis),
        ...k.d.fotos
          .filter((f) => f.bezugPositionen.wert.some((x) => nrs.has(x)))
          .map((f): Nachweis => ({ titel: `Foto ${datumText(f.zeitpunkt.wert.slice(0, 10))}`, text: `${f.ort.wert}: ${f.motiv.wert}`, datum: f.zeitpunkt.wert.slice(0, 10), quelle: f.zeitpunkt.quelle, art: "foto", rolle: "leistung", imErp: false })),
        ...k.d.meldungen.filter((m) => m.bezugPositionen.wert.some((x) => nrs.has(x))).map(meldungNachweis),
        ...cs.flatMap((c) => c.offen.flatMap((f) => blattNachweis(k, f))),
      ]),
    );
    const lvNachweis: Nachweis = {
      titel: "Leistungsverzeichnis",
      text: positionen.map((p) => `${p.positionNr}: ${menge(p.lvMenge, k.lv.get(p.positionNr)!.einheit.wert)} zu ${euro(p.ep)}`).join("; "),
      quelle: k.lv.get(positionen[0].positionNr)!.ep.quelle,
      art: "leistungsverzeichnis",
      rolle: "preis",
      imErp: true,
    };
    const ueber = (p: FundPosition) => menge(p.aufmassMenge - p.lvMenge, k.lv.get(p.positionNr)!.einheit.wert);
    return {
      schluessel,
      art,
      belegstand: "belegt" as const,
      titel: plan ? `Plan ${plan.planNr.wert}${vorher ? ` Index ${vorher.index.wert} → ${plan.index.wert}` : `, Index ${plan.index.wert}`}: ${plan.aenderung?.wert ?? plan.titel.wert}` : `${positionen[0].positionNr} ${positionen[0].kurztext}`,
      untertitel: plan
        ? `${positionen.length} Positionen über dem Leistungsverzeichnis`
        : art === "mehrmenge"
          ? `+${ueber(positionen[0])} über dem Leistungsverzeichnis`
          : `${menge(positionen[0].differenz, k.lv.get(positionen[0].positionNr)!.einheit.wert)} erbracht, nicht verrechnet`,
      positionen,
      betrag,
      rechenweg: { text, schritte, ...(plausibilitaet ? { plausibilitaet } : {}) },
      nachweise: [lvNachweis, ...nachweise],
      abhilfe: null,
      arbeitsdatum: cs.flatMap((c) => c.offen).map((f) => f.blatt.datum.wert).sort().at(-1) ?? k.d.entwurf?.datum.wert ?? "",
      kosten: { art: "vertragspreis" as const },
    };
  });
}

const FUND_SUMME: Record<FundArt, string> = {
  mehrmenge_plan: "Mehrmenge aus Planänderung",
  regie: "Regie",
  stunden_ohne_regiebericht: "Stunden ohne Regiebericht",
  preisumrechnung: "Preisumrechnung",
  mehrmenge: "Mehrmenge",
  nicht_verrechnet: "Erbracht, nicht verrechnet",
  aenderung_angemeldet: "Änderung angemeldet",
  pauschale: "Pauschale laut Vertrag",
};

// ---------- Regie ----------

function stundenSchritte(k: Kontext, m: { wert: number; quelle: Quelle }, h: { wert: number; quelle: Quelle }) {
  const v = k.d.vertrag;
  const bm = stundenBetrag(m.wert, v.regiesatzMonteur.wert);
  const bh = stundenBetrag(h.wert, v.regiesatzHelfer.wert);
  const schritte: RechenSchritt[] = [];
  const teile: string[] = [];
  if (m.wert > 0) {
    schritte.push({ bezeichnung: "Monteur", wert: `${menge(m.wert)} h × ${euro(v.regiesatzMonteur.wert)}`, betrag: bm, ...quellen(m.quelle, v.regiesatzMonteur.quelle) });
    teile.push(`${menge(m.wert)} h × ${euro(v.regiesatzMonteur.wert)}`);
  }
  if (h.wert > 0) {
    schritte.push({ bezeichnung: "Helfer", wert: `${menge(h.wert)} h × ${euro(v.regiesatzHelfer.wert)}`, betrag: bh, ...quellen(h.quelle, v.regiesatzHelfer.quelle) });
    teile.push(`${menge(h.wert)} h × ${euro(v.regiesatzHelfer.wert)}`);
  }
  return { betrag: bm + bh, schritte, teile };
}

/** Is a Meldung already written up as a Regiebericht (the report names it, or the message names an existing report)? */
function zuBericht(k: Kontext, m: WhatsAppMeldung): Regiebericht | undefined {
  return k.d.regie.find((r) => r.ausMeldung === m.nr || r.nr === m.bezugRegiebericht?.wert);
}

function regieFunde(k: Kontext): Omit<Fund, "nr" | "entscheidung">[] {
  const v = k.d.vertrag;
  const zuschlag = v.regiematerialZuschlag.wert;
  return k.d.regie
    .filter((rb) => !k.regieVerrechnet.has(rb.nr) && vorGrenze(k, arbeitsdatum(rb)))
    .map((rb) => {
      const s = stundenSchritte(k, rb.stundenMonteur, rb.stundenHelfer);
      const material = rb.material.wert;
      const aufschlag = prozent(material, zuschlag);
      const betrag = s.betrag + material + aufschlag;
      const unterschrieben = rb.unterschrieben.wert;
      const schritte: RechenSchritt[] = [
        ...s.schritte,
        ...(material > 0
          ? [
              { bezeichnung: "Material zum Einstandspreis", wert: euro(material), betrag: material, ...quellen(rb.material.quelle) },
              { bezeichnung: `Zuschlag ${prozentText(zuschlag, 0)} laut Vertragspunkt ${v.regiematerialPunkt}`, wert: `${prozentText(zuschlag, 0)} von ${euro(material)}`, betrag: aufschlag, ...quellen(v.regiematerialZuschlag.quelle) },
            ]
          : []),
        { bezeichnung: "Regie", wert: euro(betrag), betrag, summe: true },
      ];
      const teile = [...s.teile, ...(material > 0 ? [`Material ${euro(material)} + ${prozentText(zuschlag, 0)} (${euro(aufschlag)})`] : [])];
      const gh = k.d.grosshaendlerrechnungen.filter((g) => g.regieberichtNr.wert === rb.nr);
      return {
        schluessel: `regie:${rb.nr}`,
        art: "regie" as const,
        belegstand: (unterschrieben ? "belegt" : "beleg_fehlt") as Belegstand,
        titel: `Regiebericht ${rb.nr}, ${rb.taetigkeit.wert}`,
        untertitel: !unterschrieben ? "nicht unterschrieben" : k.d.entwurf ? "unterschrieben, nicht verrechnet" : "unterschrieben, in keiner Abschlagsrechnung",
        positionen: [],
        betrag,
        rechenweg: { text: `${teile.join(" + ")} = ${euro(betrag)}`, schritte },
        nachweise: nachDatum([
          {
            titel: `Regiebericht ${rb.nr}`,
            text: unterschrieben ? `unterschrieben am ${datumText(rb.unterschriebenAm?.wert ?? rb.datum.wert)}, nicht verrechnet` : "nicht unterschrieben, nicht verrechnet",
            datum: rb.datum.wert,
            quelle: rb.unterschrieben.quelle,
            art: "regiebericht",
            rolle: "leistung",
            imErp: false,
          },
          ...k.d.meldungen.filter((m) => zuBericht(k, m) === rb).map(meldungNachweis),
          ...gh.map((g): Nachweis => ({ titel: "Großhändlerrechnung", text: `Material zu Regiebericht ${rb.nr}, ${euro(g.betrag.wert)}`, datum: g.datum.wert, quelle: g.betrag.quelle, art: "grosshaendlerrechnung", rolle: "preis", imErp: false })),
        ]),
        abhilfe: unterschrieben ? null : `Regiebericht ${vonDem(v.regieUnterschrift.wert)} unterschreiben lassen`,
        arbeitsdatum: arbeitsdatum(rb),
        kosten: { art: "aufwand" as const, stunden: rb.stundenMonteur.wert + rb.stundenHelfer.wert, materialEinstand: material },
      };
    });
}

/** Hours known only from a WhatsApp-Meldung: no Regiebericht, no signature. Priced with the Regiesätze, no material. */
function meldungsFunde(k: Kontext): Omit<Fund, "nr" | "entscheidung">[] {
  const v = k.d.vertrag;
  return k.d.meldungen
    .filter((m) => m.stundenMonteur.wert + m.stundenHelfer.wert > 0 && m.bezugPositionen.wert.length === 0 && !zuBericht(k, m) && !k.regieVerrechnet.has(m.nr) && vorGrenze(k, m.zeitpunkt.slice(0, 10)))
    .map((m) => {
      const s = stundenSchritte(k, m.stundenMonteur, m.stundenHelfer);
      return {
        schluessel: `meldung:${m.nr}`,
        art: "stunden_ohne_regiebericht" as const,
        belegstand: "beleg_fehlt" as const,
        titel: `WhatsApp-Meldung ${datumText(m.zeitpunkt.slice(0, 10))}, ${m.taetigkeit.wert}`,
        untertitel: "kein Regiebericht, keine Unterschrift",
        positionen: [],
        betrag: s.betrag,
        rechenweg: { text: `${s.teile.join(" + ")} = ${euro(s.betrag)}`, schritte: [...s.schritte, { bezeichnung: "Stunden ohne Regiebericht", wert: euro(s.betrag), betrag: s.betrag, summe: true }] },
        nachweise: [meldungNachweis(m)],
        abhilfe: `Regiebericht schreiben und ${vonDem(v.regieUnterschrift.wert)} unterschreiben lassen`,
        arbeitsdatum: m.zeitpunkt.slice(0, 10),
        kosten: { art: "aufwand" as const, stunden: m.stundenMonteur.wert + m.stundenHelfer.wert, materialEinstand: 0 },
      };
    });
}

// ---------- Preisumrechnung (variable prices) ----------

function preisumrechnung(k: Kontext): Omit<Fund, "nr" | "entscheidung">[] {
  const pr = k.d.vertrag.preise;
  const ix = k.d.indexblatt;
  if (pr.art !== "veraenderlich" || !ix || !k.d.entwurf) return [];
  if (k.d.entwurf.zeilen.some((z) => z.typ === "preisumrechnung")) return [];
  const aenderung = rundeHalbAuf((ix.aktuell.wert - ix.basis.wert) * 10000, ix.basis.wert);
  if (aenderung <= 0) return [];
  const stichtag = pr.stichtag.wert;
  const blaetter = k.d.aufmass.filter((b) => b.leistungVon.wert >= stichtag);
  const leistung = blaetter.flatMap((b) => b.zeilen).reduce((s, z) => s + (k.lv.has(z.positionNr.wert) ? betragAusMenge(z.menge.wert, k.lv.get(z.positionNr.wert)!.ep.wert) : 0), 0);
  const lohn = prozent(leistung, pr.lohnanteil.wert);
  const betrag = prozent(lohn, aenderung);
  if (betrag <= 0) return [];
  return [
    {
      schluessel: "preisumrechnung",
      art: "preisumrechnung",
      belegstand: "belegt",
      titel: `Preisumrechnung Lohn ab ${datumText(stichtag)}`,
      untertitel: `${ix.name.wert} +${prozentText(aenderung)}`,
      positionen: [],
      betrag,
      rechenweg: {
        text: `${euro(lohn)} × ${prozentText(aenderung)} = ${euro(betrag)}`,
        schritte: [
          { bezeichnung: `Leistung ab ${datumText(stichtag)} (${blaetter.length} Aufmaßblätter)`, wert: euro(leistung), betrag: leistung, ...quellen(...blaetter.map((b) => b.leistungVon.quelle)) },
          { bezeichnung: `Lohnanteil laut Vertragspunkt ${pr.punkt}`, wert: prozentText(pr.lohnanteil.wert, 0), betrag: lohn, ...quellen(pr.lohnanteil.quelle) },
          { bezeichnung: `${ix.name.wert}: ${menge(ix.basis.wert)} → ${menge(ix.aktuell.wert)}`, wert: prozentText(aenderung), ...quellen(ix.basis.quelle, ix.aktuell.quelle) },
          { bezeichnung: "Preisumrechnung", wert: `${euro(lohn)} × ${prozentText(aenderung)}`, betrag, summe: true },
        ],
      },
      nachweise: [
        { titel: `Vertrag, Vertragspunkt ${pr.punkt}`, text: `veränderliche Preise, Lohnanteil ${prozentText(pr.lohnanteil.wert, 0)}, ab ${datumText(stichtag)}`, datum: k.d.vertrag.datum.wert, quelle: pr.stichtag.quelle, art: "vertrag", rolle: "preis", imErp: true },
        { titel: `Indexblatt ${ix.name.wert}`, text: `${menge(ix.basis.wert)} → ${menge(ix.aktuell.wert)}`, datum: ix.stand.wert, quelle: ix.aktuell.quelle, art: "indexblatt", rolle: "preis", imErp: false },
        ...blaetter.map((b): Nachweis => ({ titel: `Aufmaßblatt ${b.nr}`, text: `Leistung ab ${datumText(b.leistungVon.wert)}`, datum: b.datum.wert, quelle: b.leistungVon.quelle, art: "aufmassblatt", rolle: "leistung", imErp: b.erfasstAm !== null })),
      ],
      abhilfe: null,
      arbeitsdatum: k.d.entwurf.datum.wert,
      kosten: { art: "vertragspreis" },
    },
  ];
}

// ---------- Changes notified by e-mail and never priced ----------

function anmeldungen(k: Kontext): Omit<Fund, "nr" | "entscheidung">[] {
  const v = k.d.vertrag;
  return k.d.emails
    .filter((m) => m.kategorie.wert === "anmeldung" && m.anmeldung && !m.anmeldung.nachtragGelegt.wert && vorGrenze(k, m.datum.wert))
    .map((m) => {
      const a = m.anmeldung!;
      const pb = k.d.preisbasis;
      if (!pb) throw new Error(`${k.d.projekt.kurz}: Preisbasis fehlt, die Änderung „${a.gegenstand.wert}“ lässt sich nicht schätzen`);
      const lohn = stundenBetrag(a.stunden.wert, pb.mittellohnpreis.wert);
      const aufschlag = prozent(a.material.wert, pb.materialzuschlag.wert);
      const material = a.material.wert + aufschlag;
      const betrag = lohn + material;
      const pauschale = v.pauschalen.find((p) => p.kategorie === a.kategorie);
      const anweisung = a.anweisungBelegId ? k.d.emails.find((x) => x.belegId === a.anweisungBelegId) : undefined;
      const mehr = `${menge(a.stunden.wert)} h × ${euro(pb.mittellohnpreis.wert)} (Mittellohnpreis) = ${euro(lohn)} + Material ${euro(a.material.wert)} + ${prozentText(pb.materialzuschlag.wert, 0)} (${euro(aufschlag)}) = ${euro(material)}`;
      const nachweise = nachDatum([...(anweisung ? [mailNachweis(anweisung)] : []), mailNachweis(m)]);
      const basis = {
        positionen: [],
        betrag,
        rechenweg: {
          text: `Schätzung auf der Preisbasis des Vertrags: ${mehr}, zusammen ${euro(betrag)}`,
          schritte: [
            { bezeichnung: "Lohn", wert: `${menge(a.stunden.wert)} h × ${euro(pb.mittellohnpreis.wert)}`, betrag: lohn, ...quellen(a.stunden.quelle, pb.mittellohnpreis.quelle) },
            { bezeichnung: "Material zum Einstandspreis", wert: euro(a.material.wert), betrag: a.material.wert, ...quellen(a.material.quelle) },
            { bezeichnung: `Zuschlag ${prozentText(pb.materialzuschlag.wert, 0)} laut Preisbasis`, wert: `${prozentText(pb.materialzuschlag.wert, 0)} von ${euro(a.material.wert)}`, betrag: aufschlag, ...quellen(pb.materialzuschlag.quelle) },
            { bezeichnung: "Änderung angemeldet", wert: euro(betrag), betrag, summe: true },
          ],
        },
        arbeitsdatum: m.datum.wert,
        kosten: { art: "aufwand" as const, stunden: a.stunden.wert, materialEinstand: a.material.wert },
      };
      if (pauschale)
        return {
          ...basis,
          schluessel: `pauschale:${m.belegId}`,
          art: "pauschale" as const,
          belegstand: null,
          titel: a.gegenstand.wert,
          untertitel: `Vertragspunkt ${pauschale.punkt} nennt das als Pauschale`,
          nachweise: [...nachweise, { titel: `Vertrag, Vertragspunkt ${pauschale.punkt}`, text: pauschale.text.wert, datum: v.datum.wert, quelle: pauschale.text.quelle, art: "vertrag" as const, rolle: "preis" as const, imErp: true }],
          abhilfe: null,
        };
      return {
        ...basis,
        schluessel: `anmeldung:${m.belegId}`,
        art: "aenderung_angemeldet" as const,
        belegstand: "nachtrag_nicht_gelegt" as const,
        titel: a.gegenstand.wert,
        untertitel: `angemeldet mit E-Mail vom ${datumText(m.datum.wert)}, nie bepreist`,
        nachweise,
        abhilfe: "Nachtrag mit Preis legen",
      };
    });
}

// ---------- Notes without an amount ----------

function hinweise(k: Kontext, funde: readonly Fund[]): Hinweis[] {
  const rechtsfragen = k.d.emails
    .filter((m) => m.kategorie.wert === "termin" && m.aendertBauzeit && m.von === "auftraggeber")
    .map(
      (m): Hinweis => ({
        schluessel: `rechtsfrage:${m.belegId}`,
        art: "rechtsfrage",
        titel: "Rechtsfrage",
        text: `E-Mail ${m.absender.wert} vom ${datumText(m.datum.wert)}: ${m.zitat ? `„${m.zitat.wert}“` : m.betreff.wert} Für die Geschäftsführung; tieout gibt dazu keine rechtliche Einschätzung.`,
        fundSchluessel: null,
        positionNr: null,
        aenderung: null,
        nachweise: [mailNachweis(m)],
      }),
    );
  const mengen = funde
    .filter((f) => f.art === "mehrmenge" || f.art === "mehrmenge_plan")
    .flatMap((f) =>
      f.positionen.flatMap((p): Hinweis[] => {
        if (p.lvMenge <= 0) return [];
        const aenderung = rundeHalbAuf((p.aufmassMenge - p.lvMenge) * 10000, p.lvMenge);
        if (aenderung <= 2000) return [];
        return [
          {
            schluessel: `mengenaenderung:${p.positionNr}`,
            art: "mengenaenderung_ueber_20",
            titel: `Mengenänderung +${prozentText(aenderung)}`,
            text: `${k.auftraggeber} kann hier einen neuen Einheitspreis prüfen.`,
            fundSchluessel: f.schluessel,
            positionNr: p.positionNr,
            aenderung,
            nachweise: [],
          },
        ];
      }),
    );
  return [...rechtsfragen, ...mengen];
}

// ---------- The Abgleich of one project ----------

const STAND_REIHE: (Belegstand | null)[] = ["belegt", "beleg_fehlt", "nachtrag_nicht_gelegt", null];
const ART_REIHE: FundArt[] = ["mehrmenge_plan", "regie", "stunden_ohne_regiebericht", "preisumrechnung", "mehrmenge", "nicht_verrechnet", "aenderung_angemeldet", "pauschale"];

export interface Abgleich {
  /** false once the Schlussrechnung is submitted or the project is closed: then no Abgleich and no finds. */
  laeuft: boolean;
  /** Without an Entwurf: date of the last Abschlagsrechnung; only work up to that day can be a find. */
  grenze: Datum | null;
  funde: Fund[];
  hinweise: Hinweis[];
  summen: {
    /** Finds "belegt" that nobody set to "Nicht verrechnen". */
    zusaetzlichVerrechenbar: Cent;
    /** Finds "Beleg fehlt" and "Nachtrag nicht gelegt" that nobody set to "Nicht verrechnen". Never added to the line above. */
    inKlaerung: Cent;
    belegFehlt: Cent;
    nachtragNichtGelegt: Cent;
  };
  /** Regieberichte not invoiced count only up to the boundary; later ones are under "nachGrenze". */
  regie: { gesamt: number; verrechnet: number; unterschriebenNichtVerrechnet: number; nichtUnterschrieben: number; nachGrenze: number };
}

export interface AbgleichOptionen {
  /** Name of the Auftraggeber for the neutral notes. */
  auftraggeber?: string;
  /** Decisions on the finds (append only); without any, every find is "Gefunden". */
  entscheidungen?: readonly Entscheidung[];
}

/** Only projects "in Ausführung" and "Schlussrechnung vorbereiten" are compared. */
export const wirdAbgeglichen = (d: Datensatz) => d.projekt.stufe === "in_ausfuehrung" || d.projekt.stufe === "sr_vorbereiten";

export function abgleich(d: Datensatz, optionen: AbgleichOptionen = {}): Abgleich {
  const k = baueKontext(d, optionen.auftraggeber);
  const laeuft = wirdAbgeglichen(d);
  const roh = laeuft ? [...mengenFunde(k), ...regieFunde(k), ...meldungsFunde(k), ...preisumrechnung(k), ...anmeldungen(k)] : [];
  const funde: Fund[] = roh
    .sort((a, b) => STAND_REIHE.indexOf(a.belegstand) - STAND_REIHE.indexOf(b.belegstand) || ART_REIHE.indexOf(a.art) - ART_REIHE.indexOf(b.art) || b.betrag - a.betrag || a.schluessel.localeCompare(b.schluessel))
    .map((f, i) => ({ ...f, nr: `F${i + 1}`, entscheidung: entscheidungsstand(optionen.entscheidungen ?? [], f.schluessel) }));
  const zaehlt = (f: Fund, ...staende: Belegstand[]) => f.belegstand !== null && staende.includes(f.belegstand) && f.entscheidung !== "nicht_verrechnen";
  const summe = (...staende: Belegstand[]) => funde.filter((f) => zaehlt(f, ...staende)).reduce((s, f) => s + f.betrag, 0);
  const offeneRegie = d.regie.filter((r) => !k.regieVerrechnet.has(r.nr));
  const bisGrenze = offeneRegie.filter((r) => vorGrenze(k, arbeitsdatum(r)));
  return {
    laeuft,
    grenze: k.grenze,
    funde,
    hinweise: laeuft ? hinweise(k, funde) : [],
    summen: { zusaetzlichVerrechenbar: summe("belegt"), inKlaerung: summe("beleg_fehlt", "nachtrag_nicht_gelegt"), belegFehlt: summe("beleg_fehlt"), nachtragNichtGelegt: summe("nachtrag_nicht_gelegt") },
    regie: {
      gesamt: d.regie.length,
      verrechnet: d.regie.filter((r) => k.regieVerrechnet.has(r.nr)).length,
      unterschriebenNichtVerrechnet: bisGrenze.filter((r) => r.unterschrieben.wert).length,
      nichtUnterschrieben: bisGrenze.filter((r) => !r.unterschrieben.wert).length,
      nachGrenze: offeneRegie.length - bisGrenze.length,
    },
  };
}
