/**
 * The find page (SPEZIFIKATION.md 3.2, 4.2, 4.3 "Rechenweg" and 7.3 at 1:10), derived from `kern/` at build time like
 * the record pages in `records.ts`: Rechenweg step by step with its sources, the Belege, the Kürzungsrisiko of the
 * Vorprüfung with its Abhilfe, the Verlauf, and the original of every source. Every amount is a figure of the core
 * formatted with `euro()`. Client components import only the types of this file.
 */

import {
  BELEGSTAND_TEXT,
  ENTSCHEIDUNG_TEXT,
  FUND_ART_TEXT,
  KUERZUNGSGRUND_TEXT,
  belegTitel,
  datumText,
  euro,
  korrekturen,
  menge,
  type Belegstand,
  type Datensatz,
  type Einheit,
  type Entscheidungsstand,
  type Fund,
  type Nachweis,
  type Quelle,
} from "@tieout/kern";

import { findSlug, projectSlug } from "./example";
import { business, clientSlug, firm } from "./kern-data";
import { originalPage, placeText, type OriginalPage } from "./originals";
import type { ActivityEntry, Highlight } from "./records";

/** A place in a Beleg a number or a fact comes from; opens the original on the right. */
export type SourceRef = {
  /** `belegId:seite`, the key of the page in `originals`. */
  page: string;
  /** Place on the page as the twin names it; the viewer marks it. */
  place: string | null;
  /** "Aufmaßblatt 12". */
  label: string;
  /** "Seite 1, Position 22.04.12B". */
  detail: string;
  /** Text of the chip: "Aufmaßblatt 12", "Leistungsverzeichnis, Seite 9" (the page only for a long Beleg). */
  short: string;
};

export type CalcStep = {
  id: string;
  title: string;
  /** "14 Stk × 286,40 €". */
  formula: string;
  /** Where the quantity comes from: "14 Stk = 100 Stk aufgemessen − 86 Stk verrechnet". */
  derivation: string | null;
  amount: string;
  sources: SourceRef[];
};

export type EvidenceGroups = { work: EvidenceItem[]; price: EvidenceItem[] };

export type EvidenceItem = { id: string; kind: Nachweis["art"]; title: string; text: string; date: string | null; source: SourceRef };

export type FindRecord = {
  slug: string;
  /** Key of the find for decisions at business level ("p1/plan:H-201:D"); earlier keys carry their decisions over. */
  key: string;
  earlierKeys: string[];
  number: string;
  title: string;
  /** Name in the head: the title up to its first colon ("Plan H-201 Index C → D"). */
  name: string;
  /** Facts under the name: what the find is and its Art (the project is in the path and the arrows). */
  facts: string[];
  project: { name: string; href: string };
  client: { name: string; href: string };
  amount: string;
  belegstand: { state: Belegstand; text: string } | null;
  /** "zusätzlich verrechenbar", "in Klärung", or null for a find that counts only after a decision. */
  money: string | null;
  highlights: Highlight[];
  calc: { steps: CalcStep[]; total: { label: string; amount: string }; check: string | null };
  evidence: EvidenceGroups;
  risk: { number: string; reason: string; detail: string; remedy: string; amount: string; alreadyCut: boolean; sameReason: string | null; sources: SourceRef[] } | null;
  /** What closes the gap of a find that is not "belegt". */
  remedy: string | null;
  notes: { id: string; title: string; text: string }[];
  /** Entries that come from the twin itself (corrections, confirmed messages); decisions are added in the browser. */
  activity: ActivityEntry[];
  /** The decision the core holds (no decision recorded yet in stage 0: "Gefunden"). */
  decision: Entscheidungsstand;
  decisionText: Record<Entscheidungsstand, string>;
  /** Proposed text of a task: the Abhilfe of the risk or of the gap. */
  taskText: string;
  originals: Record<string, OriginalPage>;
  /** The page the viewer opens with: the original of the first number of the Rechenweg. */
  first: SourceRef | null;
  /** "Schlussrechnung legen bis 30.10.2026" for the task form; null when no Schlussrechnung is due. */
  deadline: string | null;
  /** Position in the project's list of finds, for the arrows in the head (Attio: "11 of 22"). */
  nav: { index: number; count: number; prev: string | null; next: string | null };
};

const zeitText = (z: string) => `${datumText(z.slice(0, 10))}, ${z.slice(11, 16)}`;

/** "Pos. 22.04.12B, Einheitspreis" and "Zeile 22.04.12B" in full words. */
const detailText = (q: Quelle) => `Seite ${q.seite}${q.stelle ? `, ${placeText(q.stelle).replace(/^Pos\. /, "Position ")}` : ""}`;

function sourceRef(d: Datensatz, q: Quelle): SourceRef {
  // a WhatsApp-Meldung has no pages: it is named by its part ("Transkript", "Stunden")
  const message = d.meldungen.some((m) => m.id === q.belegId);
  const label = belegTitel(d, q.belegId);
  const long = (d.belege.find((b) => b.id === q.belegId)?.seiten ?? 1) > 4;
  return { page: `${q.belegId}:${q.seite}`, place: q.stelle ?? null, label, detail: message && q.stelle ? q.stelle : detailText(q), short: long ? `${label}, Seite ${q.seite}` : label };
}

/** Every find of the open projects with its project, in the order of the core. */
function allFinds() {
  const b = business();
  return b.projekte.flatMap((p) => {
    const e = b.ergebnisse[p.projektId];
    if (!e.abgleich.laeuft) return [];
    const d = firm().projekte.find((x) => x.projekt.id === p.projektId)!;
    return e.abgleich.funde.map((f) => ({ f, d, p, e, slug: findSlug(p.name, f.nr) }));
  });
}

export function findSlugs(): string[] {
  return allFinds().map((x) => x.slug);
}


function steps(d: Datensatz, f: Fund): CalcStep[] {
  return f.rechenweg.schritte
    .filter((s) => !s.summe)
    .map((s, i) => {
      const pos = f.positionen.find((p) => s.bezeichnung.startsWith(`${p.positionNr} `));
      const einheit = pos?.einheit as Einheit | undefined;
      return {
        id: `schritt-${i}`,
        title: s.bezeichnung,
        formula: s.wert,
        derivation: pos ? `${menge(pos.differenz, einheit)} = ${menge(pos.aufmassMenge, einheit)} aufgemessen − ${menge(pos.verrechnetMenge, einheit)} verrechnet` : null,
        amount: s.betrag === undefined ? "" : euro(s.betrag),
        sources: (s.quellen ?? []).map((q) => sourceRef(d, q)),
      };
    });
}

/**
 * Name and facts of the head. A find from a plan change is named by what changed ("14 Wohnungen Typ C: Wohnküche
 * geteilt, je 1 Heizkörper mehr"), the plan index goes into the facts; every other find by its title up to the first colon.
 */
function nameAndFacts(f: Fund): { name: string; facts: string[] } {
  const at = f.titel.indexOf(": ");
  if (at < 0) return { name: f.titel, facts: [f.untertitel, FUND_ART_TEXT[f.art]] };
  const [before, after] = [f.titel.slice(0, at), f.titel.slice(at + 2)];
  return f.art === "mehrmenge_plan" ? { name: after, facts: [before, FUND_ART_TEXT[f.art]] } : { name: before, facts: [after, FUND_ART_TEXT[f.art]] };
}

function largest(f: Fund, steps: CalcStep[]): CalcStep | undefined {
  const amounts = f.rechenweg.schritte.filter((s) => !s.summe).map((s) => s.betrag ?? 0);
  const at = amounts.indexOf(Math.max(...amounts));
  return steps[at] ?? steps[0];
}

/** Every find as an entry of the search (Strg K): title, project, amount, and the words of its positions. */
export function findSearchEntries(): { id: string; title: string; hint: string; href: string; keywords: string[] }[] {
  return allFinds().map(({ f, p, slug }) => ({
    id: `fund-${slug}`,
    title: `${f.nr} ${nameAndFacts(f).name}`,
    hint: `${p.name} · ${euro(f.betrag)}`,
    href: `/funde/${slug}/`,
    keywords: [f.titel, p.name, FUND_ART_TEXT[f.art], f.untertitel, ...f.positionen.flatMap((x) => [x.positionNr, x.kurztext])],
  }));
}

/** The find page of one find; throws for an unknown slug (the pages are generated from `findSlugs()`). */
export function findRecord(slug: string): FindRecord {
  const list = allFinds();
  const at = list.findIndex((x) => x.slug === slug);
  if (at < 0) throw new Error(`Unknown find ${slug}`);
  const { f, d, p, e } = list[at];
  const b = business();
  const inProject = list.filter((x) => x.p.projektId === p.projektId);
  const index = inProject.findIndex((x) => x.slug === slug);

  const risk = (e.vorpruefung?.risiken ?? []).find((r) => r.fundSchluessel === f.schluessel) ?? null;
  const sameReason = risk ? (b.gleicherGrund[`${p.projektId}/${risk.schluessel}`]?.[0]?.text ?? null) : null;
  const money = f.belegstand === null ? null : f.belegstand === "belegt" ? "zusätzlich verrechenbar" : "in Klärung";

  const calcSteps = steps(d, f);
  const total = f.rechenweg.schritte.find((s) => s.summe);
  const evidence = f.nachweise.map((n, i): EvidenceItem => ({ id: `beleg-${i}`, kind: n.art, title: n.titel, text: n.text, date: n.datum ? datumText(n.datum) : null, source: sourceRef(d, n.quelle) }));
  const messages = new Set(d.meldungen.map((m) => m.id));
  const files = new Set(f.nachweise.filter((n) => !messages.has(n.quelle.belegId)).map((n) => n.quelle.belegId)).size;
  const fromMessages = new Set(f.nachweise.filter((n) => messages.has(n.quelle.belegId)).map((n) => n.quelle.belegId)).size;
  const count = [files ? `${files} ${files === 1 ? "Beleg" : "Belege"}` : "", fromMessages ? `${fromMessages} ${fromMessages === 1 ? "WhatsApp-Meldung" : "WhatsApp-Meldungen"}` : ""].filter(Boolean).join(", ");

  const highlights: Highlight[] = [
    {
      id: "betrag",
      title: "Betrag",
      value: euro(f.betrag),
      lines: [money ?? "zählt erst nach einer Entscheidung", "netto, vor Nachlass"],
    },
    {
      id: "belegstand",
      title: "Belegstand",
      value: f.belegstand ? BELEGSTAND_TEXT[f.belegstand] : "keiner",
      lines: [count],
      status: f.belegstand === "belegt" ? "gruen" : f.belegstand === "beleg_fehlt" ? "gelb" : f.belegstand ? "orange" : undefined,
    },
    {
      id: "risiko",
      title: "Kürzungsrisiko",
      // a find in Klärung is not in the Entwurf yet, so the Vorprüfung has not looked at it
      value: risk ? KUERZUNGSGRUND_TEXT[risk.grund] : f.belegstand === "belegt" ? "keines" : "noch nicht geprüft",
      lines: risk
        ? [risk.zustand === "droht" ? `droht für ${euro(risk.betrag)}` : `schon gekürzt ${euro(risk.betrag)}`]
        : [f.belegstand === "belegt" ? "die Vorprüfung meldet hier nichts" : "erst mit Beleg in der Vorprüfung"],
      status: risk ? "rot" : undefined,
      href: risk ? "#kuerzungsrisiko" : undefined,
    },
  ];

  // the Belege behind the find, for its Verlauf: corrections to them and the WhatsApp-Meldungen confirmed
  const quellen = [...f.nachweise.map((n) => n.quelle), ...f.rechenweg.schritte.flatMap((s) => s.quellen ?? [])];
  const ids = new Set(quellen.map((q) => q.belegId));
  const places = new Set(quellen.map((q) => `${q.belegId}|${q.stelle ?? ""}`));
  const activity: ActivityEntry[] = [
    ...korrekturen(d)
      // a correction to a line of a list counts only when the find points to that line
      .filter((k) => ids.has(k.belegId) && (!/^Zeile /.test(k.stelle) || places.has(`${k.belegId}|${k.stelle}`)))
      .map((k, i) => ({ id: `korrektur-${i}`, time: k.zeit, timeText: zeitText(k.zeit), who: k.wer, text: `korrigierte ${k.beleg}, ${placeText(k.stelle)}: ${k.vorher} auf ${k.wert}`, kind: "korrektur" as const })),
    ...d.meldungen
      .filter((m) => ids.has(m.id))
      .map((m) => ({ id: `meldung-${m.id}`, time: m.bestaetigt.zeitpunkt, timeText: zeitText(m.bestaetigt.zeitpunkt), who: m.bestaetigt.rolle, text: `bestätigte WhatsApp-Meldung ${m.nr}: ${m.taetigkeit.wert}`, kind: "meldung" as const })),
  ].sort((x, y) => y.time.localeCompare(x.time));

  const refs = [...calcSteps.flatMap((s) => s.sources), ...evidence.map((x) => x.source), ...(risk?.nachweise ?? []).map((n) => sourceRef(d, n.quelle))];
  // the places sources point to, so that a page lists a value its layout does not show only when it is marked
  const pointed = new Set(refs.map((r) => `${r.page}|${r.place ?? ""}`));
  const originals: Record<string, OriginalPage> = {};
  for (const r of refs) {
    const [belegId, page] = [r.page.slice(0, r.page.lastIndexOf(":")), Number(r.page.slice(r.page.lastIndexOf(":") + 1))];
    const beleg = d.belege.find((x) => x.id === belegId);
    // short Belege are there page by page; a long one (the Leistungsverzeichnis) only with the pages the find points to
    const pages = beleg && beleg.seiten <= 4 ? Array.from({ length: beleg.seiten }, (_, i) => i + 1) : [page];
    for (const n of pages) {
      const o = originals[`${belegId}:${n}`] ?? originalPage(d, belegId, n, pointed);
      if (o) originals[o.key] = o;
    }
  }

  const ag = p.auftraggeber;
  return {
    slug,
    key: `${p.projektId}/${f.schluessel}`,
    earlierKeys: f.fruehereSchluessel.map((k) => `${p.projektId}/${k}`),
    number: f.nr,
    title: f.titel,
    ...nameAndFacts(f),
    project: { name: p.name, href: `/projekte/${projectSlug(p.name)}/` },
    client: { name: ag.name, href: `/auftraggeber/${clientSlug(ag.kurzname)}/` },
    amount: euro(f.betrag),
    belegstand: f.belegstand ? { state: f.belegstand, text: BELEGSTAND_TEXT[f.belegstand] } : null,
    money,
    highlights,
    calc: { steps: calcSteps, total: { label: total?.bezeichnung ?? FUND_ART_TEXT[f.art], amount: euro(f.betrag) }, check: f.rechenweg.plausibilitaet ?? null },
    evidence: { work: evidence.filter((x, i) => f.nachweise[i].rolle === "leistung"), price: evidence.filter((x, i) => f.nachweise[i].rolle === "preis") },
    risk: risk
      ? {
          number: `Vorprüfung ${risk.nr}`,
          reason: KUERZUNGSGRUND_TEXT[risk.grund],
          detail: risk.detail,
          remedy: risk.abhilfe,
          amount: euro(risk.betrag),
          alreadyCut: risk.zustand === "schon_gekuerzt",
          sameReason,
          sources: risk.nachweise.map((n) => sourceRef(d, n.quelle)),
        }
      : null,
    remedy: f.abhilfe,
    notes: e.abgleich.hinweise.filter((h) => h.fundSchluessel === f.schluessel).map((h) => ({ id: h.schluessel, title: h.titel, text: h.text })),
    activity,
    decision: f.entscheidung,
    decisionText: ENTSCHEIDUNG_TEXT,
    taskText: risk?.abhilfe ?? f.abhilfe ?? "",
    originals,
    // the original of the largest number of the Rechenweg (for F1 the radiators), else the first Beleg
    first: largest(f, calcSteps)?.sources[0] ?? evidence[0]?.source ?? null,
    deadline: p.datum?.art === "legen_bis" ? `Schlussrechnung legen bis ${datumText(p.datum.wert)}` : null,
    nav: { index: index + 1, count: inProject.length, prev: inProject[index - 1]?.slug ?? null, next: inProject[index + 1]?.slug ?? null },
  };
}

