/**
 * Rows of the tables, derived from `kern/` (the pages are a static export). Every amount and every money word comes
 * from here: `pruefeFirma(beispielFirma())` with the core's own label maps and `euro()`. Each builder takes the core's
 * result, so the same code runs while the pages are built (no decisions) and in the browser once decisions are recorded
 * there (`live.ts`, which loads the core only then). Client components import only the types of this file.
 */

import {
  AUFTRAGGEBER_ART_TEXT,
  BELEG_ART_TEXT,
  BELEGGRUPPE_TEXT,
  BELEGQUELLE_TEXT,
  BELEGSTAND_TEXT,
  ENTSCHEIDUNG_TEXT,
  FUND_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  PROJEKTSTUFE_TEXT,
  PRUEFSTAND_TEXT,
  belegListe,
  datumText,
  euro,
  prozentText,
  pruefeFirma,
  type Belegstand,
  type Entscheidungsstand,
  type FirmenErgebnis,
  type Firmendaten,
  type Fund,
  type ProjektZeile,
  type Statusfarbe,
  ZAEHLENDE_ENTSCHEIDUNGEN,
} from "@tieout/kern";
import { beispielFirma } from "@tieout/kern/beispiel";

import { findSlug, projectSlug } from "./example";
import type { Calculation, Row, Sum } from "./table";

export type Amount = { cent: number; text: string };
export type Dated = { iso: string; text: string };

export type StatusColour = Statusfarbe;

export type ProjectRow = Row & {
  slug: string;
  name: string;
  client: string;
  stage: string;
  /** The date the list shows, with what it is ("Schlussrechnung legen bis", "letzte Abschlagsrechnung", …). */
  date: (Dated & { label: string }) | null;
  extra: Amount | null;
  unclear: Amount | null;
  contractSum: Amount;
  finds: number;
  status: { colour: StatusColour; text: string; rank: number };
};

export type FindRow = Row & {
  number: string;
  title: string;
  /** Short name as on the find page, with the word that matters ("14 Wohnungen Typ C: …, je 1 Heizkörper mehr"). */
  name: string;
  detail: string;
  /** The find page. */
  href: string;
  project: { slug: string; name: string };
  kind: string;
  /** null for "Pauschale laut Vertrag". */
  belegstand: { state: Belegstand; text: string } | null;
  amount: Amount;
  decision: string;
  decisionState: Entscheidungsstand;
  /** The groups of its fixed sums while it counts; a decision "Nicht verrechnen" made in the browser takes them away. */
  countedGroups: string[];
  /** Keys the same work had before; their decisions carry over. */
  earlierIds: string[];
  /** The Vorprüfung line that lies in this find. */
  risk: { number: string; reason: string; amount: Amount; alreadyCut: boolean } | null;
  /** What closes the gap of a find in Klärung; named before a release, as on the find page. */
  remedy: string | null;
  /** The text a new task on this find starts with: the Abhilfe of its Kürzungsrisiko, else of its gap (as on the find page). */
  taskText: string;
  /** "Schlussrechnung legen bis 30.10.2026" of its project, named where a task is made. */
  deadline: string | null;
  sources: string[];
  workDate: Dated;
  /** Link target for the original viewer (step 5): the first Beleg behind the find and its place. */
  original: { belegId: string; page: number } | null;
};

let data: Firmendaten | null = null;
let cached: FirmenErgebnis | null = null;

/** The sample company's twin as the core holds it (Belege, fields, Verlauf). */
export function firm(): Firmendaten {
  data ??= beispielFirma();
  return data;
}

/** The business through the whole run, computed once per build. */
export function business(): FirmenErgebnis {
  cached ??= pruefeFirma(firm());
  return cached;
}

const amount = (cent: number): Amount => ({ cent, text: euro(cent) });
const dated = (iso: string): Dated => ({ iso, text: datumText(iso) });

const DATE_LABEL: Record<NonNullable<ProjektZeile["datum"]>["art"], string> = {
  legen_bis: "Schlussrechnung legen bis",
  letzte_abschlagsrechnung: "letzte Abschlagsrechnung",
  gelegt: "Schlussrechnung gelegt",
  schlusszahlung: "Schlusszahlung",
};

/** Status colour as a word next to its dot (SPEZIFIKATION.md 2.2); the order is the order of urgency. */
const STATUS: Record<StatusColour, { text: string; rank: number }> = {
  rot: { text: "Frist nah, offen", rank: 0 },
  gelb: { text: "offen", rank: 1 },
  gruen: { text: "nichts offen", rank: 2 },
  grau: { text: "abgeschlossen", rank: 3 },
};

export function projectRows(b: FirmenErgebnis = business()): ProjectRow[] {
  return b.projekte.map((p) => ({
    id: p.projektId,
    groups: p.zusaetzlichVerrechenbar === null ? ["alle"] : ["alle", "offen"],
    slug: projectSlug(p.name),
    name: p.name,
    client: p.auftraggeber.kurzname,
    stage: PROJEKTSTUFE_TEXT[p.stufe],
    date: p.datum ? { ...dated(p.datum.wert), label: DATE_LABEL[p.datum.art] } : null,
    extra: p.zusaetzlichVerrechenbar === null ? null : amount(p.zusaetzlichVerrechenbar),
    unclear: p.inKlaerung === null ? null : amount(p.inKlaerung),
    contractSum: amount(p.auftragssumme),
    finds: p.funde,
    status: { colour: p.status, ...(p.status === "grau" && p.stufe === "sr_gelegt" ? { text: "Schlussrechnung gelegt", rank: 3 } : STATUS[p.status]) },
  }));
}

/** Fixed sums of the project table: the business totals over the open projects, and each project on its own. */
export function projectCalculations(b: FirmenErgebnis = business()): Record<"extra" | "unclear" | "contractSum", Calculation[]> {
  const open = b.projekte.filter((p) => p.zusaetzlichVerrechenbar !== null);
  const each = (value: (p: ProjektZeile) => number): Sum[] => open.map((p) => ({ group: "offen", ids: [p.projektId], text: euro(value(p)) }));
  return {
    extra: [{ id: "summe", title: "Summe", sums: [{ group: "offen", ids: open.map((p) => p.projektId), text: euro(b.summen.zusaetzlichVerrechenbar) }, ...each((p) => p.zusaetzlichVerrechenbar!)] }],
    unclear: [{ id: "summe", title: "Summe", sums: [{ group: "offen", ids: open.map((p) => p.projektId), text: euro(b.summen.inKlaerung) }, ...each((p) => p.inKlaerung!)] }],
    contractSum: [
      {
        id: "summe",
        title: "Summe",
        sums: [
          { group: "alle", ids: b.projekte.map((p) => p.projektId), text: euro(b.summen.auftragssumme) },
          { group: "offen", ids: open.map((p) => p.projektId), text: euro(b.summen.auftragssummeOffen) },
          ...b.projekte.map((p) => ({ group: "alle", ids: [p.projektId], text: euro(p.auftragssumme) })),
        ],
      },
    ],
  };
}

/** Group of a find for the fixed sums: "zusätzlich verrechenbar" or "in Klärung"; none once set to "Nicht verrechnen". */
function moneyGroups(stand: Belegstand | null, decision: string, atRisk: boolean): string[] {
  if (decision === "nicht_verrechnen" || stand === null) return [];
  if (stand === "belegt") return atRisk ? ["zusaetzlich", "risiko"] : ["zusaetzlich"];
  return ["klaerung", stand === "beleg_fehlt" ? "beleg_fehlt" : "nachtrag"];
}

/**
 * Name and facts of a find's head. A find from a plan change is named by what changed ("14 Wohnungen Typ C: Wohnküche
 * geteilt, je 1 Heizkörper mehr"), the plan index goes into the facts; every other find by its title up to the first colon.
 */
export function nameAndFacts(f: Fund): { name: string; facts: string[] } {
  const at = f.titel.indexOf(": ");
  if (at < 0) return { name: f.titel, facts: [f.untertitel, FUND_ART_TEXT[f.art]] };
  const [before, after] = [f.titel.slice(0, at), f.titel.slice(at + 2)];
  return f.art === "mehrmenge_plan" ? { name: after, facts: [before, FUND_ART_TEXT[f.art]] } : { name: before, facts: [after, FUND_ART_TEXT[f.art]] };
}

/** Every find of the open projects, in the order of the core (project, then F1 …). */
export function findRows(b: FirmenErgebnis = business()): FindRow[] {
  return b.projekte.flatMap((p) => {
    const e = b.ergebnisse[p.projektId];
    if (!e.abgleich.laeuft) return [];
    const project = { slug: projectSlug(p.name), name: p.name };
    return e.abgleich.funde.map((f): FindRow => {
      const risk = (e.vorpruefung?.risiken ?? []).find((r) => r.fundSchluessel === f.schluessel) ?? null;
      const atRisk = risk?.zustand === "droht";
      const q = f.nachweise[0]?.quelle;
      return {
        id: `${p.projektId}/${f.schluessel}`,
        groups: moneyGroups(f.belegstand, f.entscheidung, atRisk),
        countedGroups: moneyGroups(f.belegstand, "gefunden", atRisk),
        number: f.nr,
        title: f.titel,
        name: nameAndFacts(f).name,
        detail: f.untertitel,
        href: `/funde/${findSlug(p.name, f.nr)}/`,
        project,
        kind: FUND_ART_TEXT[f.art],
        belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null,
        amount: amount(f.betrag),
        decision: ENTSCHEIDUNG_TEXT[f.entscheidung],
        decisionState: f.entscheidung,
        earlierIds: f.fruehereSchluessel.map((k) => `${p.projektId}/${k}`),
        risk: risk ? { number: risk.nr, reason: KUERZUNGSGRUND_TEXT[risk.grund], amount: amount(risk.betrag), alreadyCut: risk.zustand === "schon_gekuerzt" } : null,
        remedy: f.abhilfe ?? null,
        taskText: risk?.abhilfe ?? f.abhilfe ?? "",
        deadline: p.datum?.art === "legen_bis" ? `${DATE_LABEL.legen_bis} ${datumText(p.datum.wert)}` : null,
        sources: (e.belegquellen[f.schluessel] ?? []).map((s) => BELEGQUELLE_TEXT[s]),
        workDate: dated(f.arbeitsdatum),
        original: q ? { belegId: q.belegId, page: q.seite } : null,
      };
    });
  });
}

/**
 * Fixed sums of the find table, for the business and per project: "zusätzlich verrechenbar" under the amount,
 * "in Klärung" (and its two parts) under the Belegstand, "davon mit Kürzungsrisiko" (E13) under the risk column;
 * never one total of both money words. Then the same sums per Entscheidung (`jeEntscheidung` of the core), for the
 * columns of the board and a filter by Entscheidung; they come after the totals, so a list where every find stands on
 * one decision shows the total. Always over every find: a page that shows one project passes its rows to the table,
 * and the sums of the business must still cover all finds, or they would match that project's rows.
 */
export function findCalculations(b: FirmenErgebnis = business()): Record<"amount" | "belegstand" | "risk", Calculation[]> {
  const rows = findRows(b);
  const open = b.projekte.filter((p) => b.ergebnisse[p.projektId].abgleich.laeuft);
  const ids = (group: string, projektId?: string, stand?: Entscheidungsstand) =>
    rows.filter((r) => r.groups.includes(group) && (!projektId || r.id.startsWith(`${projektId}/`)) && (!stand || r.decisionState === stand)).map((r) => r.id);
  type Part = "zusaetzlichVerrechenbar" | "inKlaerung" | "belegFehlt" | "nachtragNichtGelegt" | "davonMitKuerzungsrisiko";
  const scoped = (group: string, part: Part, total: number, perProject: (projektId: string) => number): Sum[] =>
    [
      { group, ids: ids(group), text: euro(total) },
      ...open.map((p) => ({ group, ids: ids(group, p.projektId), text: euro(perProject(p.projektId)) })),
      ...ZAEHLENDE_ENTSCHEIDUNGEN.flatMap((st) => [
        { group, ids: ids(group, undefined, st), text: euro(b.jeEntscheidung[st][part]) },
        ...open.map((p) => ({ group, ids: ids(group, p.projektId, st), text: euro(b.ergebnisse[p.projektId].jeEntscheidung[st][part]) })),
      ]),
    ].filter((s, i) => i === 0 || s.ids.length);
  const sums = (id: string) => b.ergebnisse[id].abgleich.summen;
  const extra: Calculation = { id: "zusaetzlich", title: "zusätzlich verrechenbar", sums: scoped("zusaetzlich", "zusaetzlichVerrechenbar", b.summen.zusaetzlichVerrechenbar, (id) => sums(id).zusaetzlichVerrechenbar) };
  const unclear: Calculation[] = [
    { id: "klaerung", title: "in Klärung", sums: scoped("klaerung", "inKlaerung", b.summen.inKlaerung, (id) => sums(id).inKlaerung) },
    { id: "beleg_fehlt", title: "Beleg fehlt", sums: scoped("beleg_fehlt", "belegFehlt", b.geld.belegFehlt.betrag, (id) => sums(id).belegFehlt) },
    { id: "nachtrag", title: "Nachtrag nicht gelegt", sums: scoped("nachtrag", "nachtragNichtGelegt", b.geld.nachtragNichtGelegt.betrag, (id) => sums(id).nachtragNichtGelegt) },
  ];
  return {
    amount: [extra, ...unclear],
    belegstand: unclear,
    risk: [
      {
        id: "risiko",
        title: "davon mit Kürzungsrisiko",
        sums: scoped("risiko", "davonMitKuerzungsrisiko", b.davonMitKuerzungsrisiko.betrag, (id) => b.ergebnisse[id].vorpruefung?.davonMitKuerzungsrisiko ?? 0),
      },
    ],
  };
}

export type ClientRow = Row & {
  slug: string;
  name: string;
  short: string;
  kind: string;
  projects: number;
  closed: number;
  /** Cuts on Korrekturblätter, with how many rows and projects; null when there were none. */
  cuts: (Amount & { rows: number; projects: number }) | null;
  /** Rates deducted on Zahlungsavisos that the Vertrag does not name. */
  deductions: (Amount & { projects: number }) | null;
  /** "2 von 3", with the share of the amount accepted. */
  changeOrders: { text: string; share: string | null; offered: number } | null;
  /** Days from the submitted Schlussrechnung to the final payment, per closed project. */
  paymentDays: { project: string; days: number }[];
};

export const clientSlug = (short: string) => projectSlug(short);

/** "Auftraggeber" (SPEZIFIKATION.md 2.2): facts from the documents of every project, never an assessment. */
export function clientRows(b: FirmenErgebnis = business()): ClientRow[] {
  return b.historie.map((h) => ({
    id: h.auftraggeber.id,
    groups: ["alle"],
    slug: clientSlug(h.auftraggeber.kurzname),
    name: h.auftraggeber.name,
    short: h.auftraggeber.kurzname,
    kind: AUFTRAGGEBER_ART_TEXT[h.auftraggeber.art],
    projects: h.projekte,
    closed: h.abgeschlossen,
    cuts: h.kuerzungen.length ? { ...amount(h.kuerzungenSumme), rows: h.kuerzungen.length, projects: h.kuerzungenProjekte } : null,
    deductions: h.abzuege.length ? { ...amount(h.abzuegeSumme), projects: h.abzuegeProjekte } : null,
    changeOrders: h.nachtraege.angeboten
      ? {
          text: `${h.nachtraege.beauftragt} von ${h.nachtraege.angeboten}`,
          share: h.nachtraege.quote === null ? null : prozentText(h.nachtraege.quote, 1),
          offered: h.nachtraege.angeboten,
        }
      : null,
    paymentDays: h.schlusszahlung.map((s) => ({ project: s.projekt, days: s.tage })),
  }));
}

export type BelegRow = Row & {
  number: number;
  title: string;
  file: string;
  kind: string;
  group: string;
  project: { slug: string; name: string };
  date: Dated;
  pages: number;
  /** "maschinell gelesen", "bestätigt", "korrigiert"; "doppelt" for a duplicate. */
  review: { state: "maschinell" | "bestaetigt" | "korrigiert" | "kopie"; text: string };
  fields: { read: number; corrected: number };
  /** Title of the file this one repeats. */
  copyOf: string | null;
  finds: string[];
};

/** Every Beleg of every project folder (SPEZIFIKATION.md 4.3), with its group, review state and finds. */
export function belegRows(): BelegRow[] {
  const b = business();
  let n = 0;
  return firm().projekte.flatMap((d) => {
    const liste = belegListe(d, b.ergebnisse[d.projekt.id]);
    const titel = new Map(liste.map((x) => [x.id, x.titel]));
    const project = { slug: projectSlug(d.projekt.name), name: d.projekt.name };
    return liste.map((x): BelegRow => ({
      id: `${d.projekt.id}/${x.id}`,
      groups: ["alle"],
      number: ++n,
      title: x.titel,
      file: x.dateiname,
      kind: BELEG_ART_TEXT[x.art],
      group: BELEGGRUPPE_TEXT[x.gruppe],
      project,
      date: dated(x.datum),
      pages: x.seiten,
      review: x.duplikatVon ? { state: "kopie", text: "doppelt" } : { state: x.pruefstand, text: PRUEFSTAND_TEXT[x.pruefstand] },
      fields: { read: x.felder.felder, corrected: x.felder.korrigiert },
      copyOf: x.duplikatVon ? (titel.get(x.duplikatVon) ?? null) : null,
      finds: x.funde,
    }));
  });
}

export type NextStep = {
  /** "Prüfen" by the Abrechnung or "Freigeben" by the Geschäftsführung, as the decision bar offers it. */
  step: "Prüfen" | "Freigeben";
  who: string;
  find: FindRow;
  /** How many finds wait for this step in the same project. */
  waiting: number;
  /** "Schlussrechnung legen bis 30.10.2026", or null for a project without that deadline. */
  deadline: string | null;
};

export type StartProject = {
  id: string;
  name: string;
  href: string;
  client: string;
  date: ProjectRow["date"];
  status: ProjectRow["status"];
  /** The core's money words of the project, the Kürzungsrisiko inside the first and the two parts of the second. */
  extra: Amount;
  risk: Amount;
  unclear: Amount;
  gap: Amount;
  change: Amount;
};

export type StartView = {
  extra: Amount;
  risk: Amount;
  unclear: Amount;
  /** The parts of "in Klärung" for the business: Beleg fehlt and Nachtrag nicht gelegt. */
  gap: Amount;
  change: Amount;
  /** Money per open project (step 8d, the chart on Start), in the order of the project list. */
  projects: StartProject[];
  /** Projects the core no longer compares (closed or Schlussrechnung submitted). */
  closed: number;
  /** The day the twin was compared ('Stand'), the same date on every page. */
  asOf: string;
  /** How many finds stand behind each money word (counted, no amount). */
  finds: { extra: number; unclear: number };
  /** The next check and the next release, in the project whose Schlussrechnung is due first; empty once all are decided. */
  next: NextStep[];
};

/**
 * Start (decision E3): the money of the business and "Als Nächstes". The projects are taken in the order of their
 * deadline "Schlussrechnung legen bis", then the others; in each, the first find (F1 …) that waits for a check and the
 * first that waits for a release. Every amount is the core's.
 */
export function startView(b: FirmenErgebnis = business()): StartView {
  const rows = findRows(b);
  const projects = projectRows(b)
    .filter((p) => rows.some((r) => r.project.slug === p.slug))
    .map((p, i) => ({ p, i, due: p.date?.label === DATE_LABEL.legen_bis ? p.date.iso : null }))
    .sort((x, y) => (x.due && y.due ? x.due.localeCompare(y.due) : x.due ? -1 : y.due ? 1 : x.i - y.i));
  const step = (state: Entscheidungsstand, label: NextStep["step"], who: string): NextStep | null => {
    for (const { p, due } of projects) {
      const waiting = rows.filter((r) => r.project.slug === p.slug && r.decisionState === state);
      if (waiting.length) return { step: label, who, find: waiting[0], waiting: waiting.length, deadline: due ? `${DATE_LABEL.legen_bis} ${datumText(due)}` : null };
    }
    return null;
  };
  return {
    extra: amount(b.summen.zusaetzlichVerrechenbar),
    risk: amount(b.davonMitKuerzungsrisiko.betrag),
    unclear: amount(b.summen.inKlaerung),
    gap: amount(b.geld.belegFehlt.betrag),
    change: amount(b.geld.nachtragNichtGelegt.betrag),
    projects: projectRows(b)
      .filter((p) => p.extra !== null)
      .map((p) => {
        const e = b.ergebnisse[p.id];
        return {
          id: p.id,
          name: p.name,
          href: `/projekte/${p.slug}/`,
          client: p.client,
          date: p.date,
          status: p.status,
          extra: amount(e.abgleich.summen.zusaetzlichVerrechenbar),
          risk: amount(e.vorpruefung?.davonMitKuerzungsrisiko ?? 0),
          unclear: amount(e.abgleich.summen.inKlaerung),
          gap: amount(e.abgleich.summen.belegFehlt),
          change: amount(e.abgleich.summen.nachtragNichtGelegt),
        };
      }),
    closed: projectRows(b).filter((p) => p.extra === null).length,
    asOf: datumText(b.stichtag),
    finds: { extra: b.summen.fundeZusaetzlich, unclear: b.geld.belegFehlt.anzahl + b.geld.nachtragNichtGelegt.anzahl },
    next: [step("gefunden", "Prüfen", "Abrechnung"), step("geprueft", "Freigeben", "Geschäftsführung")].filter((s): s is NextStep => s !== null),
  };
}
