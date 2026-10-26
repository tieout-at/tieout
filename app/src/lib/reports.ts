/**
 * "Berichte" (SPEZIFIKATION.md 4.2, decision E15): the figures `kern/` already has, gathered per question as Attio's
 * dashboards gather reports. Every amount is the core's; the app only counts finds and never adds an amount. Built with
 * the page and again in the browser after a decision there (`kern-live.ts`), like Start.
 */

import {
  ABZUG_TEXT,
  BELEGQUELLE_TEXT,
  BELEGSTAND_TEXT,
  datumText,
  euro,
  FUND_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  nurAusserhalbErp,
  prozentText,
  type AusserhalbErp,
  type Belegstand,
  type FirmenErgebnis,
  type Fund,
} from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, clientSlug, nameAndFacts, type Amount } from "./kern-data";

export type Dashboard = { slug: string; title: string; description: string; reports: string[] };

/** The three dashboards of the list, in their order; each groups the reports that answer one question. */
export const DASHBOARDS: Dashboard[] = [
  {
    slug: "geld-je-projekt",
    title: "Geld je Projekt",
    description: "Was in den offenen Projekten zusätzlich verrechenbar ist und wie gut es belegt ist.",
    reports: ["Zusätzlich verrechenbar je Projekt", "Belegstand je Projekt"],
  },
  {
    slug: "luecken-in-den-belegen",
    title: "Lücken in den Belegen",
    description: "Regie ohne Unterschrift und Leistung, die Ihr ERP nicht kennt.",
    reports: ["Regieberichte ohne Unterschrift", "Nur außerhalb ERP"],
  },
  {
    slug: "kuerzungen-und-abzuege",
    title: "Kürzungen und Abzüge",
    description: "Was jeder Auftraggeber bisher gekürzt und abgezogen hat, aus den Belegen aller Projekte.",
    reports: ["Kürzungen je Auftraggeber", "Abzüge ohne Vertragspunkt je Auftraggeber"],
  },
];

type Named = { name: string; href: string };

export type FindLink = { number: string; project: Named; name: string; href: string };

export type ReportsView = {
  /** The day the twin was compared (`stichtag` of the core). */
  asOf: string;
  /** "In Klärung" of the business, never added to "zusätzlich verrechenbar". */
  unclear: Amount;
  extra: {
    total: Amount;
    risk: Amount;
    rows: (Named & { client: string; amount: Amount; risk: Amount; finds: number })[];
    /** Projects the core does not compare (Schlussrechnung submitted or closed). */
    notCompared: Named[];
  };
  evidence: {
    totals: Record<Belegstand, Amount & { finds: number; label: string }>;
    rows: (Named & { finds: number; skipped: number; parts: Record<Belegstand, Amount & { finds: number }>; unclear: Amount })[];
  };
  /** One statement per report, written from the core's figures (research of step 8: a sentence, not a paragraph). */
  says: { extra: string; unclear: string; regie: string | null; cuts: { lead: Named & { total: Amount; projects: number }; text: string | null } | null; deductions: { lead: Named & { total: Amount; projects: number; kinds: string }; text: string | null } | null };
  regie: {
    finds: (FindLink & { kind: string; amount: Amount; remedy: string | null })[];
    /** "Beleg fehlt" of the core, only when these finds are all of it. */
    total: Amount | null;
    projects: (Named & { all: number; invoiced: number; signedOpen: number; unsigned: number; later: number })[];
    /** Cuts for unsigned Regie in earlier projects, from the Korrekturblätter. */
    cutBefore: { client: Named; project: string; amount: Amount }[];
  };
  erp: {
    extra: { amount: Amount; finds: number; of: Amount; ofFinds: number };
    unclear: { amount: Amount; finds: number; of: Amount; ofFinds: number };
    finds: (FindLink & { money: "zusätzlich verrechenbar" | "in Klärung"; amount: Amount; sources: string[] })[];
  };
  cuts: (Named & { total: Amount | null; projects: number; items: { project: string; invoice: string; date: string; position: string; reason: string; amount: Amount }[] })[];
  deductions: (Named & { total: Amount | null; projects: number; items: { project: string; kind: string; invoices: string; amount: Amount }[] })[];
  /** Deductions without contract item the Auftraggeber announced for a Schlussrechnung still to come. */
  announced: { client: Named; project: Named; kind: string; rate: string; amount: Amount }[];
};

const amount = (cent: number): Amount => ({ cent, text: euro(cent) });
const projectLink = (name: string): Named => ({ name, href: `/projekte/${projectSlug(name)}/` });
const clientLink = (name: string, short: string): Named => ({ name, href: `/auftraggeber/${clientSlug(short)}/` });
const STANDS: Belegstand[] = ["belegt", "beleg_fehlt", "nachtrag_nicht_gelegt"];

export function reportsView(b: FirmenErgebnis = business()): ReportsView {
  const open = b.projekte.filter((p) => p.zusaetzlichVerrechenbar !== null);
  const counting = (id: string) => b.ergebnisse[id].abgleich.funde.filter((f) => f.entscheidung !== "nicht_verrechnen");
  const link = (projectName: string, f: Fund): FindLink => ({
    number: f.nr,
    project: projectLink(projectName),
    name: nameAndFacts(f).name,
    href: `/funde/${findSlug(projectName, f.nr)}/`,
  });

  const regieFinds = open.flatMap((p) =>
    counting(p.projektId)
      .filter((f) => f.belegstand === "beleg_fehlt" && (f.art === "regie" || f.art === "stunden_ohne_regiebericht"))
      .map((f) => ({ ...link(p.name, f), kind: FUND_ART_TEXT[f.art], amount: amount(f.betrag), remedy: f.abhilfe ?? null })),
  );

  const erpFinds = open.flatMap((p) => {
    const e = b.ergebnisse[p.projektId];
    return counting(p.projektId)
      .filter((f) => f.belegstand !== null && nurAusserhalbErp(f))
      .map((f) => ({
        ...link(p.name, f),
        money: f.belegstand === "belegt" ? ("zusätzlich verrechenbar" as const) : ("in Klärung" as const),
        amount: amount(f.betrag),
        sources: (e.belegquellen[f.schluessel] ?? []).map((q) => BELEGQUELLE_TEXT[q]),
      }));
  });

  const says = (): ReportsView["says"] => {
    const atRisk = open.filter((p) => (b.ergebnisse[p.projektId].vorpruefung?.davonMitKuerzungsrisiko ?? 0) > 0);
    const risk = euro(b.davonMitKuerzungsrisiko.betrag);
    const extra = !atRisk.length
      ? "Die Vorprüfung sieht bei keinem Fund ein Kürzungsrisiko."
      : atRisk.length === 1
        ? `${risk} davon können gekürzt werden, alles im ${atRisk[0].name}.`
        : `${risk} davon können gekürzt werden, in ${atRisk.length} Projekten.`;
    const unclear = [
      b.geld.nachtragNichtGelegt.anzahl ? `${euro(b.geld.nachtragNichtGelegt.betrag)} warten auf einen Nachtrag` : null,
      b.geld.belegFehlt.anzahl ? `${euro(b.geld.belegFehlt.betrag)} auf einen Beleg` : null,
    ].filter(Boolean).join(", ");
    const regieCut = b.historie.flatMap((h) => h.kuerzungen.filter((k) => k.grund === "regie_nicht_unterschrieben").map((k) => ({ h, k })))[0];
    const byCuts = b.historie.filter((h) => h.kuerzungen.length).sort((x, y) => y.kuerzungenSumme - x.kuerzungenSumme)[0];
    // the same reason in a running project of the same Auftraggeber, as "Gleicher Grund" on the find page
    const same = byCuts
      ? open
          .filter((p) => p.auftraggeber.id === byCuts.auftraggeber.id)
          .flatMap((p) => (b.ergebnisse[p.projektId].vorpruefung?.risiken ?? []).filter((r) => r.zustand === "droht").map((r) => ({ p, r, before: byCuts.kuerzungen.filter((k) => k.grund === r.grund && k.projektId !== p.projektId) })))
          .find((x) => x.before.length)
      : undefined;
    const byDeductions = b.historie.filter((h) => h.abzuege.length).sort((x, y) => y.abzuegeSumme - x.abzuegeSumme)[0];
    const next = byDeductions ? open.find((p) => p.auftraggeber.id === byDeductions.auftraggeber.id && (b.ergebnisse[p.projektId].rechnungsabschluss?.zeilen ?? []).some((z) => z.pruefung === "abzug_ohne_vertragspunkt")) : undefined;
    const nextLine = next ? b.ergebnisse[next.projektId].rechnungsabschluss!.zeilen.find((z) => z.pruefung === "abzug_ohne_vertragspunkt")! : null;
    return {
      extra,
      unclear: unclear ? `${unclear}.` : "Nichts ist in Klärung.",
      regie: regieCut ? `${regieCut.h.auftraggeber.name} hat schon einmal ${euro(regieCut.k.betrag)} gekürzt, weil Regie nicht unterschrieben war.` : null,
      cuts: byCuts
        ? {
            lead: { ...clientLink(byCuts.auftraggeber.name, byCuts.auftraggeber.kurzname), total: amount(byCuts.kuerzungenSumme), projects: byCuts.kuerzungenProjekte },
            text: same
              ? `${same.before.length === 1 ? `${euro(same.before[0].betrag)} davon` : `${same.before.length} Kürzungen`} mit dem Grund „${KUERZUNGSGRUND_TEXT[same.r.grund]}“. Im ${same.p.name} droht derselbe Grund bei ${euro(same.r.betrag)}.`
              : null,
          }
        : null,
      deductions: byDeductions
        ? {
            lead: { ...clientLink(byDeductions.auftraggeber.name, byDeductions.auftraggeber.kurzname), total: amount(byDeductions.abzuegeSumme), projects: byDeductions.abzuegeProjekte, kinds: [...new Set(byDeductions.abzuege.map((a) => ABZUG_TEXT[a.art]))].join(", ") },
            text: next && nextLine ? `Für den ${next.name} ist der nächste schon angekündigt: ${nextLine.abzugArt ? ABZUG_TEXT[nextLine.abzugArt] : nextLine.bezeichnung} ${nextLine.satz === null ? "" : prozentText(nextLine.satz, 1)}, das sind ${euro(-nextLine.betrag)}.` : null,
          }
        : null,
    };
  };

  const erp = (x: AusserhalbErp) => ({ amount: amount(x.betrag), finds: x.anzahl, of: amount(x.vonBetrag), ofFinds: x.vonAnzahl });

  return {
    asOf: datumText(b.stichtag),
    unclear: amount(b.summen.inKlaerung),
    says: says(),
    extra: {
      total: amount(b.summen.zusaetzlichVerrechenbar),
      risk: amount(b.davonMitKuerzungsrisiko.betrag),
      rows: open.map((p) => ({
        ...projectLink(p.name),
        client: p.auftraggeber.kurzname,
        amount: amount(p.zusaetzlichVerrechenbar!),
        risk: amount(b.ergebnisse[p.projektId].vorpruefung?.davonMitKuerzungsrisiko ?? 0),
        finds: counting(p.projektId).filter((f) => f.belegstand === "belegt").length,
      })),
      notCompared: b.projekte.filter((p) => p.zusaetzlichVerrechenbar === null).map((p) => projectLink(p.name)),
    },
    evidence: {
      totals: {
        belegt: { ...amount(b.summen.zusaetzlichVerrechenbar), finds: b.summen.fundeZusaetzlich, label: BELEGSTAND_TEXT.belegt },
        beleg_fehlt: { ...amount(b.geld.belegFehlt.betrag), finds: b.geld.belegFehlt.anzahl, label: BELEGSTAND_TEXT.beleg_fehlt },
        nachtrag_nicht_gelegt: { ...amount(b.geld.nachtragNichtGelegt.betrag), finds: b.geld.nachtragNichtGelegt.anzahl, label: BELEGSTAND_TEXT.nachtrag_nicht_gelegt },
      },
      rows: open.map((p) => {
        const s = b.ergebnisse[p.projektId].abgleich.summen;
        const xs = counting(p.projektId);
        const cent: Record<Belegstand, number> = { belegt: s.zusaetzlichVerrechenbar, beleg_fehlt: s.belegFehlt, nachtrag_nicht_gelegt: s.nachtragNichtGelegt };
        return {
          ...projectLink(p.name),
          finds: xs.length,
          skipped: b.ergebnisse[p.projektId].abgleich.funde.length - xs.length,
          unclear: amount(p.inKlaerung!),
          parts: Object.fromEntries(STANDS.map((st) => [st, { ...amount(cent[st]), finds: xs.filter((f) => f.belegstand === st).length }])) as Record<Belegstand, Amount & { finds: number }>,
        };
      }),
    },
    regie: {
      finds: regieFinds,
      total: regieFinds.length === b.geld.belegFehlt.anzahl ? amount(b.geld.belegFehlt.betrag) : null,
      projects: open.map((p) => {
        const r = b.ergebnisse[p.projektId].abgleich.regie;
        return { ...projectLink(p.name), all: r.gesamt, invoiced: r.verrechnet, signedOpen: r.unterschriebenNichtVerrechnet, unsigned: r.nichtUnterschrieben, later: r.nachGrenze };
      }),
      cutBefore: b.historie.flatMap((h) =>
        h.kuerzungen.filter((k) => k.grund === "regie_nicht_unterschrieben").map((k) => ({ client: clientLink(h.auftraggeber.name, h.auftraggeber.kurzname), project: k.projekt, amount: amount(k.betrag) })),
      ),
    },
    erp: { extra: erp(b.ausserhalbErp.zusaetzlichVerrechenbar), unclear: erp(b.ausserhalbErp.inKlaerung), finds: erpFinds },
    cuts: b.historie.map((h) => ({
      ...clientLink(h.auftraggeber.name, h.auftraggeber.kurzname),
      total: h.kuerzungen.length ? amount(h.kuerzungenSumme) : null,
      projects: h.kuerzungenProjekte,
      items: h.kuerzungen.map((k) => ({ project: k.projekt, invoice: k.rechnung.nr, date: datumText(k.rechnung.datum), position: k.bezug, reason: KUERZUNGSGRUND_TEXT[k.grund], amount: amount(k.betrag) })),
    })),
    deductions: b.historie.map((h) => ({
      ...clientLink(h.auftraggeber.name, h.auftraggeber.kurzname),
      total: h.abzuege.length ? amount(h.abzuegeSumme) : null,
      projects: h.abzuegeProjekte,
      items: h.abzuege.map((a) => ({ project: a.projekt, kind: ABZUG_TEXT[a.art], invoices: a.rechnungen.join(", "), amount: amount(a.betrag) })),
    })),
    announced: open.flatMap((p) =>
      (b.ergebnisse[p.projektId].rechnungsabschluss?.zeilen ?? [])
        .filter((z) => z.art === "abzug" && z.pruefung === "abzug_ohne_vertragspunkt")
        .map((z) => ({
          client: clientLink(p.auftraggeber.name, p.auftraggeber.kurzname),
          project: projectLink(p.name),
          kind: z.abzugArt ? ABZUG_TEXT[z.abzugArt] : z.bezeichnung,
          rate: z.satz === null ? "" : prozentText(z.satz, 1),
          // the Rechnungsabschluss subtracts it; the report names it as a deduction
          amount: amount(-z.betrag),
        })),
    ),
  };
}

