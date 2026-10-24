/**
 * Derived indices of the page "Übersicht": which Belege prove which finding, which cells belong to it, the tick rows
 * of the evidence column (one per Beleg, or one per calendar week when the folder is large), the money blocks, and
 * every sentence the page reads out, as plain strings. No DOM and no amounts: amounts come as text from `twin.ts`.
 */

import type { TwinBeleg, TwinCell, TwinFind, TwinGroup, TwinView } from "@/lib/twin";
import { CFG } from "./config";

export type Tone = "belegt" | "fehlt" | "nachtrag" | "pauschale";
export type BlockKey = "zusaetzlich" | "klaerung" | "pauschale";
export type CellRef = { area: "grid" | "ohne"; index: number };

export type TickRow = {
  key: string;
  group: TwinGroup;
  /** Position in its group, top to bottom. */
  index: number;
  docs: TwinBeleg[];
  /** At least one Beleg proves a finding. */
  linked: boolean;
  /** A single Beleg that is a copy of another. */
  copy: boolean;
  /** Length of an unlinked mark, 0 to 1 (a week with more Belege draws longer). */
  weight: number;
  week: { year: number; week: number } | null;
  label: string;
};

export type GroupModel = { key: TwinGroup; title: string; note: string; count: number; wa: boolean; rows: TickRow[] };

export type FindInfo = {
  find: TwinFind;
  tone: Tone;
  block: BlockKey;
  /** Belege that prove the finding, never the own Entwurf or an Abschlagsrechnung. */
  proof: string[];
  /** Belege that show what was invoiced for it. */
  shows: string[];
  cells: CellRef[];
  /** Length of its bar segment relative to the largest block (0 to 1); a picture, never an amount. */
  share: number;
};

export type Block = { key: BlockKey; label: string; amount: string | null; quiet: { label: string; amount: string } | null; finds: string[] };

export type Model = {
  view: TwinView;
  groups: GroupModel[];
  rows: Map<string, TickRow>;
  /** Row key of every Beleg. */
  rowOf: Map<string, string>;
  belege: Map<string, TwinBeleg>;
  grid: TwinCell[];
  ohne: TwinCell[];
  finds: Map<string, FindInfo>;
  /** Finding numbers in the order of the view. */
  order: string[];
  blocks: Block[];
  dense: boolean;
  counts: { leistungen: number; positionen: number; funde: number };
};

export type Target =
  | { kind: "fund"; id: string }
  | { kind: "block"; id: BlockKey }
  | { kind: "tick"; id: string }
  | { kind: "gruppe"; id: TwinGroup };

export type Link = { beleg: string; find: string };

export type Trace = {
  target: Target;
  /** False for a Beleg without a finding: only its tick and card light up, nothing dims. */
  dims: boolean;
  finds: string[];
  ticks: string[];
  proof: Link[];
  shows: Link[];
  /** Belege that get a card, top to bottom. */
  sources: string[];
  /** Finding whose memory of the Auftraggeber is drawn. */
  memory: string | null;
};

const TONE: Record<NonNullable<TwinFind["belegstand"]>["state"], Tone> = { belegt: "belegt", beleg_fehlt: "fehlt", nachtrag_nicht_gelegt: "nachtrag" };
const BLOCK_LABEL: Record<BlockKey, string> = {
  zusaetzlich: "zusätzlich verrechenbar",
  klaerung: "in Klärung",
  pauschale: "Pauschale laut Vertrag",
};

export function plural(n: number, one: string, many: string): string {
  return `${formatInt(n)} ${n === 1 ? one : many}`;
}

/** 1240 → "1.240" (German thousands separator); counts only, never money. */
export function formatInt(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function targetKey(t: Target | null): string {
  return t ? `${t.kind}:${t.id}` : "";
}

/** ISO 8601 week of a date "2026-03-12", and the day number of its Monday. */
export function isoWeek(iso: string): { year: number; week: number; monday: number } {
  const d = new Date(`${iso}T12:00:00Z`);
  const day = (d.getUTCDay() + 6) % 7;
  const thursday = new Date(d);
  thursday.setUTCDate(d.getUTCDate() - day + 3);
  const year = thursday.getUTCFullYear();
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const week = 1 + Math.round(((thursday.getTime() - jan4.getTime()) / 864e5 - 3 + ((jan4.getUTCDay() + 6) % 7)) / 7);
  return { year, week, monday: Math.floor(d.getTime() / 864e5) - day };
}

function byDate(a: TwinBeleg, b: TwinBeleg): number {
  return a.date.iso < b.date.iso ? -1 : a.date.iso > b.date.iso ? 1 : 0;
}

export function buildModel(view: TwinView, cfg = CFG): Model {
  const known = new Set(view.finds.map((f) => f.number));
  // Clean every index against the findings that exist, so a reverse trace never meets a number without a row.
  const belegeList = view.belege.map((b) => ({ ...b, finds: b.finds.filter((n) => known.has(n)), shows: b.shows.filter((n) => known.has(n)) }));
  const belege = new Map(belegeList.map((b) => [b.id, b]));
  const dense = belegeList.length > cfg.ticks.denseOver;

  const rows = new Map<string, TickRow>();
  const rowOf = new Map<string, string>();
  const groups: GroupModel[] = [];
  for (const g of view.groups) {
    const items = belegeList.filter((b) => b.groupKey === g.key).sort(byDate);
    if (!items.length) continue;
    const buckets: { docs: TwinBeleg[]; week: GroupModel["rows"][number]["week"] }[] = [];
    if (dense) {
      const first = isoWeek(items[0].date.iso).monday;
      const last = isoWeek(items[items.length - 1].date.iso).monday;
      for (let m = first; m <= last; m += 7) buckets.push({ docs: [], week: null });
      for (const b of items) {
        const w = isoWeek(b.date.iso);
        const bucket = buckets[(w.monday - first) / 7];
        bucket.docs.push(b);
        bucket.week = { year: w.year, week: w.week };
      }
    } else {
      for (const b of items) buckets.push({ docs: [b], week: null });
    }
    const most = Math.max(1, ...buckets.map((b) => b.docs.length));
    const groupRows = buckets.map((bucket, index): TickRow => {
      const key = bucket.docs.length === 1 && !dense ? bucket.docs[0].id : `${g.key}-${index}`;
      const linked = bucket.docs.some((d) => d.finds.length > 0);
      const row: TickRow = {
        key,
        group: g.key,
        index,
        docs: bucket.docs,
        linked,
        copy: bucket.docs.length === 1 && bucket.docs[0].copy,
        weight: bucket.docs.length === 0 ? 0 : dense ? 0.25 + (0.75 * bucket.docs.length) / most : 0.42,
        week: bucket.week,
        label: "",
      };
      row.label = tickSentence(row, belege);
      return row;
    });
    for (const r of groupRows) {
      rows.set(r.key, r);
      for (const d of r.docs) rowOf.set(d.id, r.key);
    }
    groups.push({ key: g.key, title: g.title, note: g.note, count: items.length, wa: g.key === "whatsapp", rows: groupRows });
  }

  const grid = view.abgleich.positions;
  const ohne = view.abgleich.withoutPosition;
  const cellIndex = new Map<string, CellRef>();
  grid.forEach((c, index) => cellIndex.set(c.id, { area: "grid", index }));
  ohne.forEach((c, index) => cellIndex.set(c.id, { area: "ohne", index }));

  const finds = new Map<string, FindInfo>();
  for (const f of view.finds) {
    const tone: Tone = f.belegstand ? TONE[f.belegstand.state] : "pauschale";
    finds.set(f.number, {
      find: f,
      tone,
      block: f.bucket,
      proof: belegeList.filter((b) => b.finds.includes(f.number)).map((b) => b.id),
      shows: belegeList.filter((b) => b.shows.includes(f.number)).map((b) => b.id),
      cells: f.cells.map((id) => cellIndex.get(id)).filter((c): c is CellRef => c !== undefined),
      share: 0,
    });
  }

  const sorted = [...finds.values()].sort((a, b) => b.find.amount.cent - a.find.amount.cent);
  const blocks: Block[] = (["zusaetzlich", "klaerung", "pauschale"] as const)
    .map((key): Block => ({
      key,
      label: BLOCK_LABEL[key],
      amount: key === "zusaetzlich" ? view.money.extra : key === "klaerung" ? view.money.unclear : null,
      quiet: key === "zusaetzlich" && view.money.atRisk ? { label: "davon mit Kürzungsrisiko", amount: view.money.atRisk } : null,
      finds: sorted.filter((f) => f.block === key).map((f) => f.find.number),
    }))
    // "zusätzlich verrechenbar" and "in Klärung" always show, also at 0,00 € (SPEZIFIKATION.md 7.2); Pauschalen only when there are any
    .filter((b) => b.key !== "pauschale" || b.finds.length > 0);
  const largest = Math.max(1, ...blocks.map((b) => b.finds.reduce((s, n) => s + Math.max(0, finds.get(n)!.find.amount.cent), 0)));
  for (const f of finds.values()) f.share = Math.max(0, f.find.amount.cent) / largest;

  return {
    view,
    groups,
    rows,
    rowOf,
    belege,
    grid,
    ohne,
    finds,
    order: view.finds.map((f) => f.number),
    blocks,
    dense,
    counts: { leistungen: grid.length + ohne.length, positionen: grid.length, funde: view.finds.length },
  };
}

/** Which Belege, cells and money a target lights up. Unknown ids resolve to an empty trace, never a crash. */
export function resolveTrace(model: Model, target: Target): Trace {
  const proof: Link[] = [];
  const shows: Link[] = [];
  let finds: string[] = [];
  let memory: string | null = null;
  const extraTicks: string[] = [];

  const addFind = (nr: string) => {
    const f = model.finds.get(nr);
    if (!f) return;
    finds.push(nr);
    for (const b of f.proof) proof.push({ beleg: b, find: nr });
    for (const b of f.shows) shows.push({ beleg: b, find: nr });
  };
  const addDocs = (docs: TwinBeleg[]) => {
    for (const d of docs) {
      for (const n of d.finds) proof.push({ beleg: d.id, find: n });
      for (const n of d.shows) shows.push({ beleg: d.id, find: n });
      for (const n of [...d.finds, ...d.shows]) if (!finds.includes(n)) finds.push(n);
    }
  };

  if (target.kind === "fund") {
    addFind(target.id);
    if (model.finds.get(target.id)?.find.sameReason) memory = target.id;
  } else if (target.kind === "block") {
    for (const n of model.blocks.find((b) => b.key === target.id)?.finds ?? []) addFind(n);
  } else if (target.kind === "tick") {
    const row = model.rows.get(target.id);
    if (row) {
      addDocs(row.docs);
      extraTicks.push(row.key);
    }
  } else {
    const g = model.groups.find((x) => x.key === target.id);
    for (const r of g?.rows ?? []) addDocs(r.docs.filter((d) => d.finds.length || d.shows.length));
  }
  finds = finds.filter((n) => model.finds.has(n));

  const order = (id: string) => {
    const row = model.rows.get(model.rowOf.get(id) ?? "");
    const g = row ? model.groups.findIndex((x) => x.key === row.group) : 99;
    return g * 1e6 + (row?.index ?? 0) * 100 + (row?.docs.findIndex((d) => d.id === id) ?? 0);
  };
  const linked = [...new Set([...proof, ...shows].map((l) => l.beleg))];
  // a Beleg without a finding still shows its own card
  const peek = target.kind === "tick" && !linked.length ? (model.rows.get(target.id)?.docs.map((d) => d.id) ?? []) : [];
  const sources = [...linked, ...peek].filter((id) => model.belege.has(id)).sort((a, b) => order(a) - order(b));
  const ticks = [...new Set([...extraTicks, ...sources.map((id) => model.rowOf.get(id)).filter((k): k is string => !!k)])];
  return { target, dims: finds.length > 0, finds, ticks, proof, shows, sources, memory };
}

/** "6 Belege und 1 WhatsApp-Meldung" */
export function evidenceCount(model: Model, ids: string[]): string {
  const unique = [...new Set(ids)];
  const wa = unique.filter((id) => model.belege.get(id)?.groupKey === "whatsapp").length;
  const docs = unique.length - wa;
  if (!docs && !wa) return "keine Belege";
  const parts = [docs ? plural(docs, "Beleg", "Belege") : "", wa ? plural(wa, "WhatsApp-Meldung", "WhatsApp-Meldungen") : ""].filter(Boolean);
  return parts.join(" und ");
}

export function showsLabel(b: TwinBeleg): string {
  return b.art === "entwurf" ? "verrechnet laut Entwurf" : `verrechnet laut ${b.title}`;
}

function tickSentence(row: TickRow, belege: Map<string, TwinBeleg>): string {
  if (!row.docs.length) return "leere Woche";
  if (row.docs.length === 1 && !row.week) {
    const d = belege.get(row.docs[0].id) ?? row.docs[0];
    const parts = [d.detail ? `${d.title}, ${d.detail}` : d.title, d.date.text];
    if (d.copy) parts.push("Kopie");
    if (d.finds.length) parts.push(`belegt ${d.finds.join(", ")}`);
    if (d.shows.length) parts.push(`${showsLabel(d)}: ${d.shows.join(", ")}`);
    if (!d.finds.length && !d.shows.length) parts.push("kein Fund");
    return parts.join(" · ");
  }
  const linked = row.docs.filter((d) => d.finds.length).length;
  const head = row.week ? `Kalenderwoche ${row.week.week} ${row.week.year}` : "Belege";
  return [head, plural(row.docs.length, "Beleg", "Belege"), ...(linked ? [`${linked} davon belegen Funde`] : [])].join(" · ");
}

export type FindDetail = {
  nr: string;
  href: string;
  label: string;
  title: string;
  amount: string;
  tone: Tone;
  stand: string;
  bucket: string;
  /** "belegt durch 6 Belege und 1 WhatsApp-Meldung"; only for a finding that is belegt. */
  proofText: string | null;
  /** "vorhanden: 2 Belege"; only for a finding that is not belegt, always its own line. */
  present: string | null;
  remedy: string | null;
  risk: string | null;
  memory: { who: string; text: string } | null;
  shows: string[];
  cells: { id: string; label: string; beauftragt: string; erbracht: string; verrechnet: string }[];
};

export function findDetail(model: Model, nr: string): FindDetail | null {
  const f = model.finds.get(nr);
  if (!f) return null;
  const belegt = f.tone === "belegt";
  const cells = f.cells.map((c) => (c.area === "grid" ? model.grid[c.index] : model.ohne[c.index]));
  return {
    nr,
    href: f.find.href,
    label: f.find.label,
    title: f.find.title,
    amount: f.find.amount.text,
    tone: f.tone,
    stand: f.find.belegstand?.text ?? BLOCK_LABEL.pauschale,
    bucket: BLOCK_LABEL[f.block],
    proofText: belegt ? `belegt durch ${evidenceCount(model, f.proof)}` : null,
    present: belegt ? null : `vorhanden: ${evidenceCount(model, f.proof)}`,
    remedy: belegt ? null : f.find.remedy,
    risk: f.find.risk ? `${f.find.risk.alreadyCut ? "schon gekürzt" : "Kürzungsrisiko"}: ${f.find.risk.reason}` : null,
    memory: f.find.sameReason ? { who: model.view.business.client.name, text: f.find.sameReason } : null,
    shows: [...new Set(f.shows.map((id) => showsLabel(model.belege.get(id)!)))],
    cells: cells.map((c) => ({ id: c.index === null ? "ohne Position" : c.id, label: c.label, ...c.cells })),
  };
}

/** The sentence of a trace: what the readout shows on top and what a screen reader hears on pin or keyboard focus. */
export function traceSentence(model: Model, trace: Trace): string {
  const t = trace.target;
  if (t.kind === "fund") {
    const d = findDetail(model, t.id);
    if (!d) return "";
    return [`${d.nr}, ${d.label}, ${d.amount}`, d.proofText ?? d.stand, d.present, d.remedy && `Abhilfe: ${d.remedy}`, d.risk, d.memory && `${d.memory.who}: ${d.memory.text}`]
      .filter(Boolean)
      .join(". ");
  }
  if (t.kind === "block") {
    const b = model.blocks.find((x) => x.key === t.id);
    if (!b) return "";
    const ids = trace.proof.map((l) => l.beleg);
    const allBelegt = b.finds.every((n) => model.finds.get(n)?.tone === "belegt");
    return [b.label, b.amount, plural(b.finds.length, "Fund", "Funde"), allBelegt ? `belegt durch ${evidenceCount(model, ids)}` : `vorhanden: ${evidenceCount(model, ids)}`]
      .filter(Boolean)
      .join(", ");
  }
  if (t.kind === "tick") return model.rows.get(t.id)?.label ?? "";
  const g = model.groups.find((x) => x.key === t.id);
  if (!g) return "";
  return `${g.title}, ${plural(g.count, "Beleg", "Belege")}, ${trace.sources.length} davon belegen Funde`;
}

/** "303" "Leistungen abgeglichen" · "8 Funde" */
export function headline(model: Model): { count: string; done: string; finds: string } {
  const n = model.counts.funde;
  return { count: formatInt(model.counts.leistungen), done: "Leistungen abgeglichen", finds: n === 0 ? "kein Fund" : plural(n, "Fund", "Funde") };
}

/** Grid cell of a finding nearest to the right edge: where its money line leaves the twin. */
export function anchorOut(info: FindInfo, cols: number): CellRef | null {
  if (!info.cells.length) return null;
  const score = (c: CellRef) => (c.area === "ohne" ? 1e6 : 0) + (c.index % cols) * 1000 - Math.floor(c.index / cols);
  return info.cells.reduce((best, c) => (score(c) > score(best) ? c : best));
}

/** Topmost cell of a finding (lowest row, then leftmost): where its evidence enters the twin. */
export function anchorIn(info: FindInfo, cols: number): CellRef | null {
  if (!info.cells.length) return null;
  const score = (c: CellRef) => (c.area === "ohne" ? 1e6 : 0) + Math.floor(c.index / cols) * 1000 + (c.index % cols);
  return info.cells.reduce((best, c) => (score(c) < score(best) ? c : best));
}

/** The index chain of a plan ("Plan H-201 Index C": H-201 with C → D), when it has more than one index. */
export function planChain(model: Model, title: string): { plan: string; current: string; indices: string[] } | null {
  const m = /^Plan (\S+) Index (\S+)/.exec(title);
  const chain = m && model.view.planChains.find((k) => k.plan === m[1]);
  return m && chain && chain.indices.length > 1 ? { plan: m[1], current: m[2], indices: chain.indices } : null;
}
