import type { FlowView } from "@/lib/flows";

// Attio's Workflows canvas, measured in Maxi S.'s workspace on 27.10.2026: blocks 200 × 70, radius 14, the button shadow;
// grid of dots every 10 px at 14 % on #fbfbfb; edges 1.2 px #d9dade; handles 12 px. Laid out top to bottom (decided
// with Maxi S.): 7 steps and 8 checks do not fit side by side next to the 400 px panel at a readable zoom.
export const W = 220;
export const H = 70;
export const ROW = 112;
export const LEFT = -290;
export const GROUP_X = 290;
export const GROUP_W = 310;
export const CHECK_H = 34;
/** The card of the checks, moved as one block. */
export const GROUP = "pruefungen";

export type Point = { x: number; y: number };
/** What the user moved each block by, in canvas pixels; only in this browser view (measured on Attio 28.10.2026: any
 * block can be dragged, with the hand as with the pointer). */
export type Offsets = Record<string, Point>;

/** Where a block (or the card of the checks) sits: its place in the layout plus what it was moved by. */
export function place(view: FlowView, id: string, moved: Offsets): Point {
  const by = moved[id] ?? { x: 0, y: 0 };
  if (id === GROUP) {
    const at = view.nodes.find((n) => n.id === view.checksAt);
    return { x: GROUP_X + by.x, y: (at ? at.row * ROW - 4 : 0) + by.y };
  }
  const n = view.nodes.find((m) => m.id === id);
  if (!n) return by;
  return { x: (n.side === "left" ? LEFT : 0) + by.x, y: n.row * ROW + by.y };
}

/** The box around every block, with room above for the trigger's label. */
export function bounds(view: FlowView, moved: Offsets) {
  const boxes = view.nodes.map((n) => ({ ...place(view, n.id, moved), w: W, h: H }));
  if (view.checksAt) boxes.push({ ...place(view, GROUP, moved), w: GROUP_W, h: 46 + 8 * CHECK_H });
  return {
    minX: Math.min(...boxes.map((b) => b.x)),
    maxX: Math.max(...boxes.map((b) => b.x + b.w)),
    minY: Math.min(...boxes.map((b) => b.y)) - 32,
    maxY: Math.max(...boxes.map((b) => b.y + b.h)),
  };
}

/** A block moved by a drag of (dx, dy) screen pixels at zoom `k`, from where it was when the drag began. */
export function moveBy(moved: Offsets, id: string, from: Point, dx: number, dy: number, k: number): Offsets {
  return { ...moved, [id]: { x: Math.round(from.x + dx / k), y: Math.round(from.y + dy / k) } };
}

/** How close (in screen pixels) a dragged block must come to a straight line to its neighbour before it snaps. */
export const SNAP = 8;

/** A thin line shown while a dragged block sits on a straight edge, as in Attio and Figma. */
export type Guide = { x1: number; y1: number; x2: number; y2: number };

/** The blocks an edge connects to `id`, and whether that edge runs down the column or sideways. */
function links(view: FlowView, id: string): { other: string; down: boolean }[] {
  const side = (n: string) => view.nodes.find((m) => m.id === n)?.side;
  const out = view.edges.flatMap((e) => (e.from === id ? [e.to] : e.to === id ? [e.from] : [])).map((other) => ({ other, down: side(other) === side(id) }));
  if (view.checksAt && id === GROUP) out.push({ other: view.checksAt, down: false });
  if (view.checksAt && id === view.checksAt) out.push({ other: GROUP, down: false });
  return out;
}

/**
 * The drag of a block, snapped: when an edge to a neighbour is less than `SNAP` screen pixels from straight, the block
 * jumps so the edge is straight (one snap across, one along), and the guides show which edge lines up.
 */
export function dragTo(view: FlowView, moved: Offsets, id: string, from: Point, dx: number, dy: number, k: number): { moved: Offsets; guides: Guide[] } {
  const next = moveBy(moved, id, from, dx, dy, k);
  const p = place(view, id, next);
  const base = place(view, id, {});
  const reach = SNAP / k;
  const width = (n: string) => (n === GROUP ? GROUP_W : W);
  let sx: { at: number; d: number; q: Point } | null = null;
  let sy: { at: number; d: number; q: Point; w: number } | null = null;
  for (const { other, down } of links(view, id)) {
    const q = place(view, other, next);
    // the card of the checks hangs 4 px above the block it belongs to, so their edge is straight at that offset
    const at = down ? q.x : q.y + (id === GROUP ? -4 : other === GROUP ? 4 : 0);
    const d = Math.abs((down ? p.x : p.y) - at);
    if (d >= reach) continue;
    if (down && (!sx || d < sx.d)) sx = { at, d, q };
    if (!down && (!sy || d < sy.d)) sy = { at, d, q, w: width(other) };
  }
  const x = sx ? sx.at : p.x;
  const y = sy ? sy.at : p.y;
  const guides: Guide[] = [];
  if (sx) guides.push({ x1: x + W / 2, y1: Math.min(y, sx.q.y) - 12, x2: x + W / 2, y2: Math.max(y, sx.q.y) + H + 12 });
  if (sy) {
    const cy = (id === GROUP ? y + 4 : y) + H / 2;
    guides.push({ x1: Math.min(x, sy.q.x) - 12, y1: cy, x2: Math.max(x + width(id), sy.q.x + sy.w) + 12, y2: cy });
  }
  return { moved: { ...next, [id]: { x: x - base.x, y: y - base.y } }, guides };
}

/** The moves of one view with the steps to undo and redo; at most 50 steps back. */
export type Moves = { by: Offsets; past: Offsets[]; future: Offsets[] };
export const NO_MOVES: Moves = { by: {}, past: [], future: [] };

/**
 * "begin" keeps the arrangement before a drag as one step back, "set" follows the drag, "reset" puts every block back
 * (itself a step that can be undone).
 */
export function moves(m: Moves, a: { type: "begin" | "undo" | "redo" | "reset" } | { type: "set"; by: Offsets }): Moves {
  switch (a.type) {
    case "begin":
      return { by: m.by, past: [...m.past, m.by].slice(-50), future: [] };
    case "set":
      return { ...m, by: a.by };
    case "undo":
      return m.past.length ? { by: m.past[m.past.length - 1], past: m.past.slice(0, -1), future: [m.by, ...m.future] } : m;
    case "redo":
      return m.future.length ? { by: m.future[0], past: [...m.past, m.by], future: m.future.slice(1) } : m;
    case "reset":
      return Object.keys(m.by).length ? { by: {}, past: [...m.past, m.by].slice(-50), future: [] } : m;
  }
}

/**
 * The line of an edge and its chevron at the target. "down" runs from the bottom of `a` to the top of `b`, "left" from
 * the left of `a` to the right of `b` (a task beside the column), "right" from the right of `a` to the left of `b` (the
 * checks). A straight line while the two ends line up, as laid out; a soft curve once a block was moved.
 */
export function edge(a: Point, b: Point, dir: "down" | "left" | "right"): { line: string; head: string } {
  if (dir === "down") {
    const sx = a.x + W / 2;
    const sy = a.y + H;
    const ex = b.x + W / 2;
    const ey = b.y - 1;
    const c = Math.max(24, Math.abs(ey - sy) / 2);
    return {
      line: sx === ex && ey > sy ? `M${sx} ${sy} V${ey}` : `M${sx} ${sy} C${sx} ${sy + c} ${ex} ${ey - c} ${ex} ${ey}`,
      head: `M${ex - 5} ${ey - 5} l5 5 5-5`,
    };
  }
  const left = dir === "left";
  const sx = left ? a.x : a.x + W;
  const sy = a.y + H / 2;
  const ex = left ? b.x + W + 1 : b.x - 1;
  const ey = left ? b.y + H / 2 : b.y + 4 + H / 2;
  const c = Math.max(24, Math.abs(ex - sx) / 2) * (left ? -1 : 1);
  return {
    line: sy === ey ? `M${sx} ${sy} H${ex}` : `M${sx} ${sy} C${sx + c} ${sy} ${ex - c} ${ey} ${ex} ${ey}`,
    head: left ? `M${ex + 5} ${ey - 5} l-5 5 5 5` : `M${ex - 5} ${ey - 5} l5 5 -5 5`,
  };
}

/**
 * The shadow of a block: one class only. `shadow-button` and an arbitrary `shadow-[…]` are not merged by tailwind-merge,
 * and in the stylesheet `shadow-button` comes later, so the blue line of a selected block was drawn transparent.
 */
export function blockShadow(selected: boolean, running: boolean): string {
  if (running) return "shadow-[inset_0_0_0_1.5px_var(--color-accent),0_0_0_4px_rgb(29_59_255/0.1)]";
  if (selected) return "shadow-[inset_0_0_0_1px_var(--color-accent),0_0_2px_0_rgb(28_40_64/0.18),0_1px_3px_0_rgb(0_0_0/0.04)]";
  return "shadow-button";
}
