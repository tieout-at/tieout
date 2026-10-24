/**
 * Rows of the tables, derived from `kern/` at build time (the pages are a static export). Every amount and every
 * money word comes from here: `pruefeFirma(beispielFirma())` with the core's own label maps and `euro()`. Client
 * components import only the types of this file, so the core and its sample data stay out of the browser bundle.
 */

import {
  BELEGQUELLE_TEXT,
  BELEGSTAND_TEXT,
  ENTSCHEIDUNG_TEXT,
  FUND_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  PROJEKTSTUFE_TEXT,
  datumText,
  euro,
  pruefeFirma,
  type Belegstand,
  type FirmenErgebnis,
  type ProjektZeile,
  type Statusfarbe,
} from "@tieout/kern";
import { beispielFirma } from "@tieout/kern/beispiel";

import { projectSlug } from "./example";
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
  detail: string;
  project: { slug: string; name: string };
  kind: string;
  /** null for "Pauschale laut Vertrag". */
  belegstand: { state: Belegstand; text: string } | null;
  amount: Amount;
  decision: string;
  /** The Vorprüfung line that lies in this find. */
  risk: { number: string; reason: string; amount: Amount; alreadyCut: boolean } | null;
  sources: string[];
  workDate: Dated;
  /** Link target for the original viewer (step 5): the first Beleg behind the find and its place. */
  original: { belegId: string; page: number } | null;
};

let cached: FirmenErgebnis | null = null;

/** The business through the whole run, computed once per build. */
export function business(): FirmenErgebnis {
  cached ??= pruefeFirma(beispielFirma());
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

export function projectRows(): ProjectRow[] {
  return business().projekte.map((p) => ({
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
export function projectCalculations(): Record<"extra" | "unclear" | "contractSum", Calculation[]> {
  const b = business();
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

/** Every find of the open projects, in the order of the core (project, then F1 …). */
export function findRows(): FindRow[] {
  const b = business();
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
        number: f.nr,
        title: f.titel,
        detail: f.untertitel,
        project,
        kind: FUND_ART_TEXT[f.art],
        belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null,
        amount: amount(f.betrag),
        decision: ENTSCHEIDUNG_TEXT[f.entscheidung],
        risk: risk ? { number: risk.nr, reason: KUERZUNGSGRUND_TEXT[risk.grund], amount: amount(risk.betrag), alreadyCut: risk.zustand === "schon_gekuerzt" } : null,
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
 * never one total of both money words.
 */
export function findCalculations(rows: FindRow[]): Record<"amount" | "belegstand" | "risk", Calculation[]> {
  const b = business();
  const open = b.projekte.filter((p) => b.ergebnisse[p.projektId].abgleich.laeuft);
  const ids = (group: string, projektId?: string) => rows.filter((r) => r.groups.includes(group) && (!projektId || r.id.startsWith(`${projektId}/`))).map((r) => r.id);
  const scoped = (group: string, total: number, perProject: (projektId: string) => number): Sum[] => [
    { group, ids: ids(group), text: euro(total) },
    ...open.map((p) => ({ group, ids: ids(group, p.projektId), text: euro(perProject(p.projektId)) })).filter((s) => s.ids.length),
  ];
  const sums = (id: string) => b.ergebnisse[id].abgleich.summen;
  const extra: Calculation = { id: "zusaetzlich", title: "zusätzlich verrechenbar", sums: scoped("zusaetzlich", b.summen.zusaetzlichVerrechenbar, (id) => sums(id).zusaetzlichVerrechenbar) };
  const unclear: Calculation[] = [
    { id: "klaerung", title: "in Klärung", sums: scoped("klaerung", b.summen.inKlaerung, (id) => sums(id).inKlaerung) },
    { id: "beleg_fehlt", title: "Beleg fehlt", sums: scoped("beleg_fehlt", b.geld.belegFehlt.betrag, (id) => sums(id).belegFehlt) },
    { id: "nachtrag", title: "Nachtrag nicht gelegt", sums: scoped("nachtrag", b.geld.nachtragNichtGelegt.betrag, (id) => sums(id).nachtragNichtGelegt) },
  ];
  return {
    amount: [extra, ...unclear],
    belegstand: unclear,
    risk: [
      {
        id: "risiko",
        title: "davon mit Kürzungsrisiko",
        sums: scoped("risiko", b.davonMitKuerzungsrisiko.betrag, (id) => b.ergebnisse[id].vorpruefung?.davonMitKuerzungsrisiko ?? 0),
      },
    ],
  };
}
