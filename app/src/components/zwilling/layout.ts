/**
 * Pure layout of the page "Übersicht", without DOM: column widths by stage width, the grid of the Abgleich, the tick
 * rows, the money rows that fit, the cards of a trace, and every line (bundled at rest, lanes between grid rows so a
 * line never runs through a cell). The hooks measure a few boxes once per layout and hand them to these functions.
 */

import { CFG, type Config } from "./config";
import { anchorIn, anchorOut, planChain, type BlockKey, type CellRef, type FindDetail, type Model, type Tone, type Trace } from "./model";

export type Pt = { x: number; y: number };
export type Box = { x: number; y: number; w: number; h: number };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const r1 = (v: number) => Math.round(v * 10) / 10;

/* ------------------------------------------------------------------ columns */

export type Columns =
  | { stacked: true; width: number; pad: number }
  | { stacked: false; width: number; pad: number; ruler: number; cards: number; gapL: number; twin: number; gapR: number; out: number; narrow: boolean };

/** Column widths for a stage width. They always add up to the inner width; spare room widens the line gaps. */
export function columns(width: number, cfg: Config = CFG): Columns {
  if (width < cfg.stackBelow) return { stacked: true, width, pad: cfg.pad.stackX };
  const pad = width >= 1000 ? cfg.pad.x : cfg.pad.xNarrow;
  const inner = width - 2 * pad;
  const gapMin = inner < 900 ? cfg.gap.minNarrow : cfg.gap.min;
  let out = Math.round(clamp(inner * cfg.out.share, cfg.out.min, cfg.out.max));
  let twin = Math.round(clamp(inner * cfg.twin.share, cfg.twin.min, cfg.twin.max));
  let cards = Math.round(clamp(inner * cfg.cards.share, cfg.cards.min, cfg.cards.max));
  let rest = inner - cfg.ruler - cards - twin - out - 2 * gapMin;
  // too tight: give up room in this order, never below a minimum
  const cutCards = Math.max(0, Math.min(cards - cfg.cards.min, -rest));
  cards -= cutCards;
  rest += cutCards;
  const cutTwin = Math.max(0, Math.min(twin - cfg.twin.min, -rest));
  twin -= cutTwin;
  rest += cutTwin;
  const cutOut = Math.max(0, Math.min(out - cfg.out.min, -rest));
  out -= cutOut;
  rest += cutOut;
  rest = Math.max(0, rest);
  const gapL = gapMin + Math.round(rest * cfg.gap.leftShare);
  const gapR = inner - cfg.ruler - cards - twin - out - gapL;
  return { stacked: false, width, pad, ruler: cfg.ruler, cards, gapL, twin, gapR, out, narrow: cards < cfg.cards.narrowBelow };
}

/** CSS grid columns of the stage: ruler, cards, gap, twin, gap, money. */
export function gridTemplate(c: Extract<Columns, { stacked: false }>): string {
  return [c.ruler, c.cards, c.gapL, c.twin, c.gapR, c.out].map((w) => w + "px").join(" ");
}

/* ------------------------------------------------------------------ grid */

export type Fit = { cols: number; pitch: number; cell: number; gap: number; rows: number; width: number; height: number };

export function gapFor(pitch: number): number {
  return pitch >= 15 ? 4 : pitch >= 9 ? 3 : pitch >= 6 ? 2 : 1;
}

function makeFit(n: number, cols: number, pitch: number): Fit {
  const gap = gapFor(pitch);
  const rows = Math.ceil(n / cols);
  return { cols, pitch, cell: pitch - gap, gap, rows, width: cols * pitch - gap, height: rows ? rows * pitch - gap : 0 };
}

/** The largest cell that fits n cells into the box, with at least `minCols` columns; never wider than the box. */
export function gridFit(n: number, maxW: number, maxH: number, minCols: number, cfg: Config = CFG): Fit {
  const count = Math.max(0, n);
  for (let cols = minCols; cols <= cfg.grid.maxCols; cols++) {
    let pitch = Math.min(cfg.grid.pitchMax, Math.floor((maxW + 4) / cols));
    while (pitch > cfg.grid.pitchMin && cols * pitch - gapFor(pitch) > maxW) pitch--;
    if (pitch < cfg.grid.pitchMin) break;
    const fit = makeFit(count, cols, pitch);
    if (fit.height <= maxH) return fit;
  }
  // the height cannot be met: smallest legible cell, as many columns as the width holds
  const pitch = cfg.grid.pitchMin;
  const cols = Math.max(minCols, Math.min(cfg.grid.maxCols, Math.floor((maxW + gapFor(pitch)) / pitch)));
  return makeFit(count, cols, pitch);
}

/** Index of the cell under a point in the grid's own coordinates, or null. */
export function cellAt(fit: Pick<Fit, "cols" | "pitch">, n: number, x: number, y: number): number | null {
  if (x < 0 || y < 0) return null;
  const col = Math.floor(x / fit.pitch);
  const row = Math.floor(y / fit.pitch);
  if (col >= fit.cols) return null;
  const i = row * fit.cols + col;
  return i < n ? i : null;
}

/* ------------------------------------------------------------------ ticks */

export type StripLayout = { pitch: number; height: number; rows: { top: number; h: number }[] };

/** Tick rows of every group so the column fills the height H (between the minimum and maximum pitch). */
export function tickLayout(groups: { rows: number; wa: boolean }[], H: number, dense: boolean, cfg: Config = CFG): StripLayout[] {
  const t = cfg.ticks;
  const fixed = groups.length * t.headH + Math.max(0, groups.length - 1) * t.groupGap + (groups.some((g) => g.wa) ? t.waPad : 0);
  const total = groups.reduce((s, g) => s + g.rows, 0);
  const pitch = clamp((H - fixed) / Math.max(total, 1), dense ? t.densePitchMin : t.pitchMin, t.pitchMax);
  return groups.map((g) => {
    const p = g.wa && !dense ? Math.max(pitch, Math.min(t.waPitchMin, (H * t.waShare) / Math.max(1, g.rows))) : pitch;
    const rows = Array.from({ length: g.rows }, (_, i) => {
      const top = Math.round(i * p);
      return { top, h: Math.max(1, Math.round((i + 1) * p) - top) };
    });
    return { pitch: p, height: Math.round(g.rows * p), rows };
  });
}

/** On a phone the ticks of a group run left to right in a strip of the given width. */
export function tickRowLayout(rows: number, width: number, wa: boolean): { left: number; w: number }[] {
  const p = width / Math.max(rows, wa ? 12 : 1);
  return Array.from({ length: rows }, (_, i) => {
    const left = Math.round(i * p);
    return { left, w: Math.max(1, Math.round((i + 1) * p) - left) };
  });
}

/** The row a pointer at height y points to: the exact row; in the gaps between rows, a linked row within the magnet distance. */
export function nearestRow(rows: { top: number; h: number; linked: boolean; empty?: boolean }[], y: number, magnet: number): number | null {
  let exact: number | null = null;
  let best: number | null = null;
  let bestD = Infinity;
  rows.forEach((r, i) => {
    if (r.empty) return;
    if (y >= r.top && y < r.top + r.h) exact = i;
    const d = Math.abs(y - (r.top + r.h / 2));
    if (r.linked && d <= magnet && d < bestD) {
      bestD = d;
      best = i;
    }
  });
  return exact ?? best;
}

/* ------------------------------------------------------------------ money rows */

export function blockHeight(rows: number, visible: number, quiet: boolean, cfg: Config = CFG, stacked = false): number {
  const r = cfg.result;
  return r.blockHead + (quiet ? r.quietH : 0) + r.rowsTop + visible * (stacked ? r.rowHStack : r.rowH) + (visible < rows ? r.moreH : 0);
}

/** How many rows of each block fit the height; the smallest amounts fold into "und N weitere Funde" first. */
export function fitRows(blocks: { rows: number; quiet: boolean }[], H: number, cfg: Config = CFG): number[] {
  const visible = blocks.map((b) => b.rows);
  const height = () => blocks.reduce((s, b, i) => s + blockHeight(b.rows, visible[i], b.quiet, cfg), 0) + Math.max(0, blocks.length - 1) * cfg.result.blockGap;
  let guard = 10_000;
  while (height() > H && guard--) {
    let pick = -1;
    visible.forEach((v, i) => {
      if (v > 1 && (pick < 0 || v > visible[pick])) pick = i;
    });
    if (pick < 0) break;
    visible[pick] -= 1;
  }
  return visible;
}

/* ------------------------------------------------------------------ cards */

export type Span = { top: number; bottom: number };

/**
 * Places the cards of a trace in the docs column: each as close to its tick as possible, in order, never overlapping
 * each other, the obstacles (the WhatsApp heading) or the edges. Cards that do not fit fold into the last card
 * ("und N weitere"); `folded` counts the ones the caller already left out.
 */
export function stackCards(
  items: { want: number; h: number }[],
  H: number,
  opts: { gap: number; moreH: number; folded: number; obstacles?: Span[] },
): { tops: number[]; shown: number; moreTop: number | null } {
  const obstacles = [...(opts.obstacles ?? [])].sort((a, b) => a.top - b.top);
  const hits = (top: number, h: number) => obstacles.find((o) => top < o.bottom + opts.gap && top + h > o.top - opts.gap);
  for (let shown = items.length; shown >= 0; shown--) {
    const extra = opts.folded + (items.length - shown);
    const list = items.slice(0, shown).map((it) => ({ ...it }));
    if (extra > 0) {
      const last = list[list.length - 1];
      list.push({ want: last ? last.want + last.h : opts.moreH / 2, h: opts.moreH });
    }
    // forward: as close to the tick as allowed, below the previous card, around obstacles
    const tops: number[] = [];
    list.forEach((it, i) => {
      let top = Math.max(0, it.want - it.h / 2, i ? tops[i - 1] + list[i - 1].h + opts.gap : 0);
      for (let o = hits(top, it.h); o; o = hits(top, it.h)) top = o.bottom + opts.gap;
      tops.push(top);
    });
    // backward: pull up what sticks out at the bottom, jumping obstacles upwards
    for (let i = list.length - 1; i >= 0; i--) {
      const limit = (i === list.length - 1 ? H : tops[i + 1] - opts.gap) - list[i].h;
      if (tops[i] <= limit) continue;
      let top = limit;
      for (let o = hits(top, list[i].h); o; o = hits(top, list[i].h)) top = o.top - opts.gap - list[i].h;
      tops[i] = top;
    }
    const ok = tops.every((t, i) => t >= 0 && t + list[i].h <= H && !hits(t, list[i].h) && (i === 0 || t >= tops[i - 1] + list[i - 1].h + opts.gap));
    if (ok || shown === 0) {
      const moreTop = extra > 0 ? tops[tops.length - 1] : null;
      return { tops: tops.slice(0, shown), shown, moreTop };
    }
  }
  return { tops: [], shown: 0, moreTop: null };
}

/* ------------------------------------------------------------------ readout */

/** Height the readout under the grid needs for a finding at a width; the page reserves the largest. */
export function readoutHeight(d: FindDetail, width: number, cfg: Config = CFG): number {
  const r = cfg.readout;
  const lines = (text: string | null) => (text ? Math.max(1, Math.ceil((text.length * r.width) / Math.max(80, width))) : 0);
  const head = lines(`${d.nr} · ${d.amount} · ${d.proofText ?? d.stand}`);
  const table = d.cells.length ? 1 + Math.min(d.cells.length, r.tableRows) + (d.cells.length > r.tableRows ? 1 : 0) : 0;
  const box = d.memory ? lines(`${d.memory.who}: ${d.memory.text}`) * r.lineH + r.boxPad : 0;
  const text = head + lines(d.remedy && `Abhilfe: ${d.remedy}`) + lines(d.present) + table + lines(d.risk) + d.shows.length;
  return Math.min(r.max, text * r.lineH + (table ? r.gap : 0) + (box ? box + r.gap : 0));
}

/* ------------------------------------------------------------------ geometry */

export type GridGeo = { x: number; y: number; cols: number; pitch: number; cell: number; gap: number; n: number; above: number; below: number };
export type NodeKey = "auftraggeber" | "vertrag" | "preisbasis";

export type Geo = {
  width: number;
  height: number;
  ticks: Record<string, { x0: number; x1: number; y: number }>;
  strips: Record<string, Box>;
  grid: GridGeo;
  ohne: GridGeo | null;
  railL: number;
  railR: number;
  nodes: Record<NodeKey, Pt | null>;
  /** Where a finding's money line ends: its row, or the "weitere" button of its block. */
  rows: Record<string, Pt>;
  cards: Box;
  /** The WhatsApp heading: cards keep clear of it (relative to the cards layer), lines pass it on the right. */
  waHead: Span | null;
  waRight: number | null;
  /** Font families as the page resolved them, for measuring card titles without a layout. */
  font: { sans: string; mono: string };
};

export type Measured = {
  width: number;
  height: number;
  strips: Record<string, Box>;
  docs: Box;
  grid: Box;
  ohne: Box | null;
  nodes: Record<NodeKey, Box | null>;
  rows: Record<string, Box>;
  more: Partial<Record<BlockKey, Box>>;
  waHead: Box | null;
  font: { sans: string; mono: string };
};

export function cellBox(g: GridGeo, i: number): Box {
  return { x: g.x + (i % g.cols) * g.pitch, y: g.y + Math.floor(i / g.cols) * g.pitch, w: g.cell, h: g.cell };
}

function laneAbove(g: GridGeo, row: number): number {
  return row === 0 ? g.above : g.y + row * g.pitch - g.gap / 2;
}
function laneBelow(g: GridGeo, row: number): number {
  return row === Math.ceil(g.n / g.cols) - 1 ? g.below : g.y + (row + 1) * g.pitch - g.gap / 2;
}

/** Turns the measured boxes and the computed sizes into every point a line needs (relative to the stage). */
export function buildGeo(
  m: Measured,
  model: Model,
  sizes: { fit: Fit; strips: StripLayout[]; cols: Extract<Columns, { stacked: false }>; visible: Record<BlockKey, number> },
  cfg: Config = CFG,
): Geo {
  const ticks: Geo["ticks"] = {};
  model.groups.forEach((g, gi) => {
    const s = m.strips[g.key];
    const layout = sizes.strips[gi];
    if (!s || !layout) return;
    g.rows.forEach((row, i) => {
      const r = layout.rows[i];
      const y = s.y + r.top + r.h / 2;
      ticks[row.key] = { x0: s.x + s.w - cfg.mark, x1: s.x + s.w, y };
    });
  });
  const { fit } = sizes;
  const ohneGap = m.ohne ? (m.ohne.y - (m.grid.y + fit.height)) / 2 : 0;
  const grid: GridGeo = {
    x: m.grid.x,
    y: m.grid.y,
    cols: fit.cols,
    pitch: fit.pitch,
    cell: fit.cell,
    gap: fit.gap,
    n: model.grid.length,
    above: m.grid.y - Math.max(fit.gap / 2, 3),
    below: m.ohne ? m.grid.y + fit.height + ohneGap : m.grid.y + fit.height + Math.max(fit.gap / 2, 3),
  };
  const ohneRows = Math.ceil(model.ohne.length / fit.cols);
  const ohne: GridGeo | null = m.ohne
    ? {
        x: m.ohne.x,
        y: m.ohne.y,
        cols: fit.cols,
        pitch: fit.pitch,
        cell: fit.cell,
        gap: fit.gap,
        n: model.ohne.length,
        above: grid.below,
        below: m.ohne.y + ohneRows * fit.pitch - fit.gap + Math.max(fit.gap / 2, 3),
      }
    : null;
  const nodes = {} as Geo["nodes"];
  for (const k of ["auftraggeber", "vertrag", "preisbasis"] as const) {
    const b = m.nodes[k];
    nodes[k] = b ? { x: m.grid.x - cfg.rail.inset, y: b.y + b.h / 2 } : null;
  }
  const rows: Geo["rows"] = {};
  for (const b of model.blocks) {
    b.finds.forEach((nr, i) => {
      const box = i < sizes.visible[b.key] ? m.rows[nr] : m.more[b.key];
      if (box) rows[nr] = { x: box.x - 1, y: box.y + box.h / 2 };
    });
  }
  const cardsX = m.docs.x + cfg.ruler + cfg.cards.inset;
  return {
    width: m.width,
    height: m.height,
    ticks,
    strips: m.strips,
    grid,
    ohne,
    railL: m.grid.x - cfg.rail.inset,
    railR: m.grid.x + Math.max(fit.width, 0) + cfg.rail.inset,
    nodes,
    rows,
    cards: { x: cardsX, y: m.docs.y, w: sizes.cols.cards - 16, h: m.docs.h },
    waHead: m.waHead ? { top: m.waHead.y - m.docs.y, bottom: m.waHead.y + m.waHead.h - m.docs.y } : null,
    waRight: m.waHead ? m.waHead.x + m.waHead.w : null,
    font: m.font,
  };
}

/* ------------------------------------------------------------------ routing */

export function bez(a: Pt, b: Pt): string {
  const k = (b.x - a.x) * 0.5;
  return `C${r1(a.x + k)},${r1(a.y)} ${r1(b.x - k)},${r1(b.y)} ${r1(b.x)},${r1(b.y)}`;
}
export function curve(a: Pt, b: Pt): string {
  return `M${r1(a.x)},${r1(a.y)} ${bez(a, b)}`;
}

export type Route = {
  d: string;
  kind: "proof" | "through" | "out" | "lead" | "node" | "memory" | "shows";
  tone: Tone | "node" | "accent";
  /** Lines bundled into one (stroke grows with the count). */
  count?: number;
  /** Straight segments of a lane route, for the "never through a cell" check. */
  segs?: { a: Pt; b: Pt }[];
};

type CellGeo = { box: Box; row: number; g: GridGeo; ref: CellRef };

function cellGeo(geo: Geo, ref: CellRef): CellGeo | null {
  const g = ref.area === "grid" ? geo.grid : geo.ohne;
  if (!g || ref.index >= g.n) return null;
  return { box: cellBox(g, ref.index), row: Math.floor(ref.index / g.cols), g, ref };
}

/**
 * Offsets inside each lane so lines that share a gap between two rows run side by side. Keys are "in:F1" (lane above
 * a cell of F1) and "out:F1" (lane below its out cell); ordered by finding, so the result is stable.
 */
export function laneOffsets(model: Model, geo: Geo): Map<string, number> {
  const lanes = new Map<number, string[]>();
  const add = (y: number, key: string) => {
    const k = Math.round(y * 2);
    const list = lanes.get(k) ?? [];
    if (!list.includes(key)) list.push(key);
    lanes.set(k, list);
  };
  for (const nr of model.order) {
    const info = model.finds.get(nr)!;
    for (const ref of info.cells) {
      const c = cellGeo(geo, ref);
      if (c) add(laneAbove(c.g, c.row), `in:${nr}:${Math.round(laneAbove(c.g, c.row) * 2)}`);
    }
    const out = anchorOut(info, geo.grid.cols);
    const c = out && cellGeo(geo, out);
    if (c) add(laneBelow(c.g, c.row), `out:${nr}`);
  }
  const result = new Map<string, number>();
  for (const [k, keys] of lanes) {
    const room = Math.max(1, geo.grid.gap - 0.5);
    const step = Math.min(1.2, room / (keys.length + 1));
    keys.forEach((key, i) => result.set(key, k / 2 + (i - (keys.length - 1) / 2) * step));
  }
  return result;
}

/** Where the evidence of a finding enters the twin (left rail), or null for a finding without a cell. */
export function findPort(model: Model, geo: Geo, lanes: Map<string, number>, nr: string): Pt | null {
  const info = model.finds.get(nr);
  const a = info && anchorIn(info, geo.grid.cols);
  const c = a && cellGeo(geo, a);
  if (!c) return null;
  const y = lanes.get(`in:${nr}:${Math.round(laneAbove(c.g, c.row) * 2)}`) ?? laneAbove(c.g, c.row);
  return { x: geo.railL, y };
}

/** From the port of a finding through the lanes into each of its cells. */
export function throughRoutes(model: Model, geo: Geo, lanes: Map<string, number>, nr: string, tone: Route["tone"]): Route[] {
  const info = model.finds.get(nr);
  const port = findPort(model, geo, lanes, nr);
  if (!info || !port) return [];
  const routes: Route[] = [];
  for (const ref of info.cells) {
    const c = cellGeo(geo, ref);
    if (!c) continue;
    const y = lanes.get(`in:${nr}:${Math.round(laneAbove(c.g, c.row) * 2)}`) ?? laneAbove(c.g, c.row);
    const entry = { x: c.g.x - 2, y };
    const cx = c.box.x + c.box.w / 2;
    const cy = c.box.y + c.box.h / 2;
    const jog = Math.abs(y - port.y) > 0.5 ? ` ${bez(port, entry)}` : ` L${r1(entry.x)},${r1(entry.y)}`;
    routes.push({
      d: `M${r1(port.x)},${r1(port.y)}${jog} L${r1(cx)},${r1(y)} L${r1(cx)},${r1(cy)}`,
      kind: "through",
      tone,
      segs: [
        { a: entry, b: { x: cx, y } },
        { a: { x: cx, y }, b: { x: cx, y: cy } },
      ],
    });
  }
  return routes;
}

/** From the out cell of a finding along the lane below it to the right rail, then to its money row. */
export function outRoute(model: Model, geo: Geo, lanes: Map<string, number>, nr: string, tone: Route["tone"]): Route | null {
  const info = model.finds.get(nr);
  const a = info && anchorOut(info, geo.grid.cols);
  const c = a && cellGeo(geo, a);
  const end = geo.rows[nr];
  if (!c || !end) return null;
  const y = lanes.get(`out:${nr}`) ?? laneBelow(c.g, c.row);
  const cx = c.box.x + c.box.w / 2;
  const cy = c.box.y + c.box.h / 2;
  const rail = { x: geo.railR, y };
  return {
    d: `M${r1(cx)},${r1(cy)} L${r1(cx)},${r1(y)} L${r1(rail.x)},${r1(y)} ${bez(rail, end)}`,
    kind: "out",
    tone,
    segs: [
      { a: { x: cx, y: cy }, b: { x: cx, y } },
      { a: { x: cx, y }, b: rail },
    ],
  };
}

type Edge = { group: string; src: Pt; port: Pt; key: string; tone: Route["tone"]; count: number; trunk?: Pt; end?: Pt };

/** Groups with more lines than the threshold draw one line per target, carrying the count. */
export function bundleEdges(edges: Edge[], threshold: number, anchors: Record<string, Pt>): Edge[] {
  const byGroup = new Map<string, Edge[]>();
  for (const e of edges) byGroup.set(e.group, [...(byGroup.get(e.group) ?? []), e]);
  const out: Edge[] = [];
  for (const [group, list] of byGroup) {
    if (list.length <= threshold || !anchors[group]) {
      out.push(...list);
      continue;
    }
    const byKey = new Map<string, Edge>();
    for (const e of list) {
      const b = byKey.get(e.key) ?? { ...e, src: anchors[group], count: 0 };
      b.count += e.count;
      byKey.set(e.key, b);
    }
    out.push(...byKey.values());
  }
  return out;
}

/**
 * Fan-in at a port: arrivals sorted by where they come from, spread by `fan`, so lines that meet never cross.
 * Returns the end point of each arrival in the input order.
 */
export function fanIn(arrivals: { from: number; port: Pt }[], fan: number): Pt[] {
  const byPort = new Map<string, number[]>();
  arrivals.forEach((a, i) => {
    const k = `${Math.round(a.port.x)}:${Math.round(a.port.y * 2)}`;
    byPort.set(k, [...(byPort.get(k) ?? []), i]);
  });
  const ends: Pt[] = arrivals.map((a) => a.port);
  for (const idx of byPort.values()) {
    const sorted = [...idx].sort((a, b) => arrivals[a].from - arrivals[b].from || a - b);
    sorted.forEach((i, j) => {
      ends[i] = { x: arrivals[i].port.x, y: arrivals[i].port.y + (j - (sorted.length - 1) / 2) * fan };
    });
  }
  return ends;
}

/** Target ports of a Beleg at rest: an Ebene 1 node, or each finding it proves that has a cell. */
function restTargets(model: Model, geo: Geo, lanes: Map<string, number>, belegId: string): { key: string; port: Pt; tone: Route["tone"] }[] {
  const b = model.belege.get(belegId);
  if (!b || !b.finds.length) return [];
  if (b.node === "auftraggeber" || b.node === "vertrag" || b.node === "preisbasis") {
    const p = geo.nodes[b.node];
    return p ? [{ key: `n:${b.node}`, port: p, tone: "node" }] : [];
  }
  return b.finds.flatMap((nr) => {
    const p = findPort(model, geo, lanes, nr);
    return p ? [{ key: `f:${nr}`, port: p, tone: model.finds.get(nr)!.tone }] : [];
  });
}

/** Every line at rest: Belege bundled into the twin, through the lanes into each finding cell, out to the money. */
export function baseRoutes(model: Model, geo: Geo, cfg: Config = CFG): Route[] {
  const lanes = laneOffsets(model, geo);
  const edges: Edge[] = [];
  const anchors: Record<string, Pt> = {};
  for (const g of model.groups) {
    const s = geo.strips[g.key];
    if (s) anchors[g.key] = { x: s.x + s.w, y: s.y + s.h / 2 };
    for (const row of g.rows) {
      const t = geo.ticks[row.key];
      if (!t || !row.linked) continue;
      for (const d of row.docs) {
        for (const target of restTargets(model, geo, lanes, d.id)) {
          edges.push({ group: g.key, src: { x: t.x1, y: t.y }, port: target.port, key: target.key, tone: target.tone, count: 1 });
        }
      }
    }
  }
  // one line per tick and target: a week of several Belege draws once
  const seen = new Set<string>();
  const unique = edges.filter((e) => {
    const k = `${e.src.x},${e.src.y}>${e.key}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const bundled = bundleEdges(unique, cfg.bundleOver, anchors);
  const trunkX = geo.cards.x - 12 + clamp((geo.railL - geo.cards.x) * cfg.rail.trunkShare, cfg.rail.trunkMin, cfg.rail.trunkMax);
  // per group the lines gather at a trunk, sorted by target height so the fan-out never crosses
  const byGroup = new Map<string, Edge[]>();
  for (const e of bundled) byGroup.set(e.group, [...(byGroup.get(e.group) ?? []), e]);
  for (const [group, list] of byGroup) {
    // the WhatsApp lines run level until they are past their heading, so they never cross its words
    const x = group === "whatsapp" && geo.waRight !== null ? Math.max(trunkX, geo.waRight + 12) : trunkX;
    list.sort((a, b) => a.port.y - b.port.y || a.src.y - b.src.y);
    const ys = list.map((e) => e.src.y);
    const lo = Math.min(...ys);
    const hi = Math.max(...ys);
    const mid = (lo + hi) / 2;
    const meanPort = list.reduce((s, e) => s + e.port.y, 0) / list.length;
    const y0 = clamp((meanPort + mid) / 2, lo, hi);
    list.forEach((e, i) => (e.trunk = { x, y: y0 + (i - (list.length - 1) / 2) * cfg.rail.bundleGap }));
  }
  const ends = fanIn(
    bundled.map((e) => ({ from: e.trunk!.y, port: e.port })),
    cfg.rail.fan,
  );
  const routes: Route[] = bundled.map((e, i) => {
    const end = ends[i];
    const pre = { x: end.x - 10, y: end.y };
    return {
      d: `M${r1(e.src.x)},${r1(e.src.y)} ${bez(e.src, e.trunk!)} ${bez(e.trunk!, pre)} L${r1(e.port.x)},${r1(e.port.y)}`,
      kind: "proof",
      tone: e.tone,
      count: e.count > 1 ? e.count : undefined,
    };
  });
  for (const nr of model.order) {
    const tone = model.finds.get(nr)!.tone;
    routes.push(...throughRoutes(model, geo, lanes, nr, tone));
    const out = outRoute(model, geo, lanes, nr, tone);
    if (out) routes.push(out);
  }
  // "in Klärung" under "belegt"
  const rank = (t: Route["tone"]) => (t === "belegt" ? 1 : 0);
  return routes.sort((a, b) => rank(a.tone) - rank(b.tone));
}

/** The small circles at rest: where evidence enters the twin, where money leaves it, and the Ebene 1 nodes. */
export function restPorts(model: Model, geo: Geo): Pt[] {
  const lanes = laneOffsets(model, geo);
  const pts = new Map<string, Pt>();
  const add = (p: Pt) => pts.set(`${Math.round(p.x * 2)}:${Math.round(p.y * 2)}`, { x: r1(p.x), y: r1(p.y) });
  for (const nr of model.order) {
    const p = findPort(model, geo, lanes, nr);
    if (p) add(p);
    const a = anchorOut(model.finds.get(nr)!, geo.grid.cols);
    const c = a && cellGeo(geo, a);
    if (c && geo.rows[nr]) add({ x: geo.railR, y: lanes.get(`out:${nr}`) ?? laneBelow(c.g, c.row) });
  }
  for (const p of Object.values(geo.nodes)) if (p) add(p);
  return [...pts.values()];
}

/** Count of a bundled group, drawn at its trunk. */
export function bundleLabels(model: Model, geo: Geo, cfg: Config = CFG): { x: number; y: number; text: string }[] {
  const labels: { x: number; y: number; text: string }[] = [];
  for (const g of model.groups) {
    const n = g.rows.reduce((s, r) => s + (r.linked ? r.docs.reduce((t, d) => t + d.finds.length, 0) : 0), 0);
    const s = geo.strips[g.key];
    if (n > cfg.bundleOver && s) labels.push({ x: s.x + s.w + 6, y: s.y + s.h / 2 - 6, text: String(n) });
  }
  return labels;
}

export type CardPorts = { ports: Record<string, Pt>; more: Pt | null; folded: string[] };

/** Height of a card: one or two title lines, the date on its own line when narrow, a plan chain, "verrechnet laut". */
export function cardHeight(p: { lines: 1 | 2; narrow: boolean; chain: boolean; shows: boolean }, cfg: Config = CFG): number {
  const c = cfg.cards;
  return c.padY + c.lineH * (p.lines + (p.narrow ? 1 : 0) + (p.shows ? 1 : 0)) + (p.chain ? c.chainH : 0);
}

export type CardPlan = {
  cards: { id: string; top: number; h: number; dy: number }[];
  moreTop: number | null;
  moreCount: number;
  ports: CardPorts;
};

/**
 * Which Belege of a trace get a card and where, before anything is drawn: titles are measured as text (no layout),
 * a title wider than its line takes two (the card clamps there), and the cards are stacked by `stackCards`.
 */
export function planCards(
  model: Model,
  geo: Geo,
  trace: Trace,
  textWidth: (text: string, mono: boolean) => number,
  narrow: boolean,
  cfg: Config = CFG,
): CardPlan {
  const c = cfg.cards;
  const sources = trace.sources.filter((id) => geo.ticks[model.rowOf.get(id) ?? ""]);
  const first = sources.length > c.maxShown ? sources.slice(0, c.maxShown - 1) : sources;
  const items = first.map((id) => {
    const b = model.belege.get(id)!;
    const avail = geo.cards.w - (narrow ? c.chromeNarrow : c.chrome + c.dateGap + textWidth(b.date.text, true));
    const lines: 1 | 2 = textWidth(b.detail ? `${b.title}, ${b.detail}` : b.title, false) > avail - 1 ? 2 : 1;
    const h = cardHeight({ lines, narrow, chain: !!planChain(model, b.title), shows: b.shows.some((n) => trace.finds.includes(n)) }, cfg);
    return { id, h, want: geo.ticks[model.rowOf.get(id)!].y - geo.cards.y };
  });
  const placed = stackCards(items, geo.cards.h, { gap: c.gap, moreH: c.moreH, folded: sources.length - first.length, obstacles: geo.waHead ? [geo.waHead] : [] });
  const shown = items.slice(0, placed.shown);
  const folded = sources.slice(placed.shown);
  const ports: Record<string, Pt> = {};
  const cards = shown.map((it, i) => {
    const top = placed.tops[i];
    ports[it.id] = { x: geo.cards.x + geo.cards.w, y: geo.cards.y + top + Math.min(it.h / 2, 12) };
    return { id: it.id, top, h: it.h, dy: it.want - (top + it.h / 2) };
  });
  const more = placed.moreTop !== null ? { x: geo.cards.x + c.moreW, y: geo.cards.y + placed.moreTop + c.moreH / 2 } : null;
  return { cards, moreTop: placed.moreTop, moreCount: folded.length, ports: { ports, more, folded } };
}

export type TraceDrawing = {
  routes: (Route & { delay: number; dur: number })[];
  ticks: { x0: number; x1: number; y: number }[];
  cells: { box: Box; tone: Tone }[];
  dots: Pt[];
  ends: Pt[];
};

/** Every line, highlight and dot of one trace, with its timing. */
export function traceRoutes(model: Model, geo: Geo, trace: Trace, cards: CardPorts, cfg: Config = CFG): TraceDrawing {
  const m = cfg.motion;
  const tIn = m.inStart;
  const tMid = tIn + m.inMs;
  const tOut = tMid + m.midMs;
  const lanes = laneOffsets(model, geo);
  const routes: TraceDrawing["routes"] = [];
  const ticks = trace.ticks.map((k) => geo.ticks[k]).filter(Boolean);
  const cells: TraceDrawing["cells"] = [];
  const dots: Pt[] = [];
  const ends: Pt[] = [];
  const folded = new Set(cards.folded);

  // leads: tick to its card (or to the "weitere" card)
  for (const id of trace.sources) {
    const t = geo.ticks[model.rowOf.get(id) ?? ""];
    const to = cards.ports[id] ? { x: geo.cards.x, y: cards.ports[id].y } : folded.has(id) && cards.more ? { x: geo.cards.x, y: cards.more.y } : null;
    if (!t || !to) continue;
    const a = { x: t.x1, y: t.y };
    routes.push({ d: `M${r1(a.x)},${r1(a.y)} C${r1(a.x + 6)},${r1(a.y)} ${r1(to.x - 6)},${r1(to.y)} ${r1(to.x)},${r1(to.y)}`, kind: "lead", tone: "accent", delay: 0, dur: 0 });
  }
  if (!trace.dims) return { routes, ticks, cells, dots, ends };

  // evidence and "verrechnet laut": card to the port of its node or finding
  const from = (id: string) => cards.ports[id] ?? (folded.has(id) ? cards.more : null);
  const arrivals: { src: Pt; port: Pt; kind: Route["kind"]; key: string }[] = [];
  const nodeLinks = new Map<string, Set<string>>();
  const seen = new Set<string>();
  const push = (src: Pt | null, port: Pt | null, kind: Route["kind"], key: string) => {
    if (!src || !port) return;
    const k = `${r1(src.y)}>${key}>${kind}`;
    if (seen.has(k)) return;
    seen.add(k);
    arrivals.push({ src, port, kind, key });
  };
  for (const l of trace.proof) {
    const b = model.belege.get(l.beleg);
    if (!b) continue;
    if (b.node === "auftraggeber" || b.node === "vertrag" || b.node === "preisbasis") {
      push(from(l.beleg), geo.nodes[b.node], "proof", `n:${b.node}`);
      nodeLinks.set(b.node, (nodeLinks.get(b.node) ?? new Set()).add(l.find));
    } else push(from(l.beleg), findPort(model, geo, lanes, l.find), "proof", `f:${l.find}`);
  }
  for (const l of trace.shows) push(from(l.beleg), findPort(model, geo, lanes, l.find), "shows", `f:${l.find}`);
  const ends0 = fanIn(
    arrivals.map((a) => ({ from: a.src.y, port: a.port })),
    cfg.rail.fan,
  );
  arrivals.forEach((a, i) => {
    const end = ends0[i];
    const pre = { x: end.x - 10, y: end.y };
    routes.push({ d: `${curve(a.src, pre)} L${r1(a.port.x)},${r1(a.port.y)}`, kind: a.kind, tone: "accent", delay: tIn, dur: m.inMs });
  });

  // Ebene 1: a node that holds the price of a finding, and the memory of the Auftraggeber (dashed: memory, not proof)
  const nodeToFind = (node: Pt, nr: string, kind: Route["kind"]) => {
    const fp = findPort(model, geo, lanes, nr);
    if (!fp) return;
    const dx = -18 - Math.min(18, Math.abs(fp.y - node.y) * 0.08);
    routes.push({
      d: `M${r1(node.x)},${r1(node.y)} C${r1(node.x + dx)},${r1(node.y)} ${r1(fp.x + dx)},${r1(fp.y)} ${r1(fp.x)},${r1(fp.y)}`,
      kind,
      tone: "accent",
      delay: tMid,
      dur: m.midMs + 100,
    });
  };
  for (const [node, nrs] of nodeLinks) {
    const p = geo.nodes[node as keyof Geo["nodes"]];
    if (p) for (const nr of nrs) nodeToFind(p, nr, "node");
  }
  if (trace.memory && geo.nodes.auftraggeber) nodeToFind(geo.nodes.auftraggeber, trace.memory, "memory");

  // through the twin and out to the money
  for (const nr of trace.finds) {
    const info = model.finds.get(nr)!;
    for (const ref of info.cells) {
      const c = cellGeo(geo, ref);
      if (c) cells.push({ box: c.box, tone: info.tone });
    }
    const port = findPort(model, geo, lanes, nr);
    if (port) dots.push(port);
    for (const r of throughRoutes(model, geo, lanes, nr, "accent")) routes.push({ ...r, delay: tMid, dur: m.midMs });
    const out = outRoute(model, geo, lanes, nr, "accent");
    if (out) {
      routes.push({ ...out, delay: tOut, dur: m.outMs });
      dots.push({ x: geo.railR, y: lanes.get(`out:${nr}`) ?? 0 });
      ends.push(geo.rows[nr]);
    } else if (geo.rows[nr] && !port) ends.push(geo.rows[nr]);
  }
  return { routes, ticks, cells, dots, ends };
}
