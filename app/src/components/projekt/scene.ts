/**
 * Geometry of the building schema (step 8d): boxes in model units, drawn in an isometric view (x to the right and down,
 * y to the left and down, z up). Pure functions, so the layout is tested without a browser; the component only paints
 * what this returns. Every number of the drawing lives here.
 */

import type { BuildingModel } from "@/lib/building";

export type P3 = [number, number, number];
export type P2 = [number, number];

/** Size of one model unit in px before the SVG scales to its box; floor height and the gap of the exploded base. */
export const ISO = { unit: 24, floorH: 1.05, floors: 4, gap: 1.35, slab: 0.6 } as const;

const C = Math.cos(Math.PI / 6);

export function project([x, y, z]: P3, u: number = ISO.unit): P2 {
  return [(x - y) * C * u, (x + y) * 0.5 * u - z * u];
}

export type Box = { id: string; x: number; y: number; z: number; w: number; d: number; h: number; zone: string | null; label?: string; dashed?: boolean };

/** The three visible faces of a box, as polygons in model space: top, the face towards y (left) and towards x (right). */
export function faces(b: Box): { top: P3[]; left: P3[]; right: P3[] } {
  const { x, y, z, w, d, h } = b;
  const x1 = x + w;
  const y1 = y + d;
  const z1 = z + h;
  return {
    top: [[x, y, z1], [x1, y, z1], [x1, y1, z1], [x, y1, z1]],
    left: [[x, y1, z], [x1, y1, z], [x1, y1, z1], [x, y1, z1]],
    right: [[x1, y, z], [x1, y1, z], [x1, y1, z1], [x1, y, z1]],
  };
}

/** A patch on a face of a box: a zone drawn onto the building (a flat, the riser shaft, a room of the base). */
export type Patch = { id: string; zone: string; poly: P3[]; kind: "cell" | "strip" | "room" | "slab" };

export type Scene = {
  boxes: Box[];
  patches: Patch[];
  /** Thin lines on the faces: floor slabs and the edges of flats, the texture of the schema. */
  lines: { id: string; zone: string | null; a: P3; b: P3 }[];
  /** Where a zone's marker stands. */
  anchors: Record<string, P3>;
  labels: { id: string; text: string; at: P3; anchor: "start" | "middle" | "end" }[];
};

const cellOn = (face: "left" | "right", b: Box, floor: number, slot: number, slots: number): P3[] => {
  // a flat on one face: its floor and its slot along the face, inset so neighbouring flats stay apart
  const z0 = b.z + (floor - 1) * ISO.floorH + 0.18;
  const z1 = b.z + floor * ISO.floorH - 0.18;
  if (face === "left") {
    const step = b.w / slots;
    const a = b.x + slot * step + 0.22;
    const e = b.x + (slot + 1) * step - 0.22;
    return [[a, b.y + b.d, z0], [e, b.y + b.d, z0], [e, b.y + b.d, z1], [a, b.y + b.d, z1]];
  }
  const step = b.d / slots;
  const a = b.y + slot * step + 0.22;
  const e = b.y + (slot + 1) * step - 0.22;
  return [[b.x + b.w, a, z0], [b.x + b.w, e, z0], [b.x + b.w, e, z1], [b.x + b.w, a, z1]];
};

/** Flat "Top n" of a Stiege with 4 flats per floor: two on the left face, two on the right (a schema, not the plan). */
export function topCell(b: Box, top: number): P3[] {
  const floor = Math.min(ISO.floors, Math.ceil(top / 4));
  const slot = (top - 1) % 4;
  return slot < 2 ? cellOn("left", b, floor, slot, 2) : cellOn("right", b, floor, slot - 2, 2);
}

const centre = (poly: P3[]): P3 => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length, poly.reduce((s, p) => s + p[2], 0) / poly.length];

/** Stiegen as towers over an exploded base with the rooms the Belege name along its front. */
function stiegenScene(m: Extract<BuildingModel, { kind: "stiegen" }>, tops: { zone: string; stiege: number; top: number }[], typeStiegen: number[]): Scene {
  const tw = 4;
  const gapX = 2;
  const width = m.stiegen * tw + (m.stiegen - 1) * gapX + 1.2;
  const baseD = 7.6;
  const front = 4.8;
  const z0 = ISO.slab + ISO.gap;
  const boxes: Box[] = [{ id: "base", x: 0, y: 0, z: 0, w: width, d: baseD, h: ISO.slab, zone: null }];
  const patches: Patch[] = [];
  const lines: Scene["lines"] = [];
  const anchors: Record<string, P3> = {};
  const labels: Scene["labels"] = [];

  // rooms along the front band of the base, wider for the Tiefgarage
  const weight = { tiefgarage: 2.6, keller: 1.2, technikraum: 1.3 } as const;
  const total = m.base.reduce((s, r) => s + weight[r], 0);
  m.base.reduce((x, r) => {
    const w = (weight[r] / Math.max(total, 1)) * (width - 0.6);
    const poly: P3[] = [[x + 0.12, front, ISO.slab], [x + w - 0.12, front, ISO.slab], [x + w - 0.12, baseD - 0.3, ISO.slab], [x + 0.12, baseD - 0.3, ISO.slab]];
    patches.push({ id: `room-${r}`, zone: r, poly, kind: "room" });
    anchors[r] = centre(poly);
    // the name inside its room, below the marker at its centre (not on the edge of the base)
    labels.push({ id: `label-${r}`, text: r === "tiefgarage" ? "Tiefgarage" : r === "keller" ? "Keller" : "Technikraum", at: [x + w / 2, front + (baseD - 0.3 - front) * 0.76, ISO.slab], anchor: "middle" });
    return x + w;
  }, 0.3);

  for (let i = 0; i < m.stiegen; i++) {
    const n = i + 1;
    const t: Box = { id: `stiege-${n}`, x: 0.6 + i * (tw + gapX), y: 0.4, z: z0, w: tw, d: tw, h: ISO.floors * ISO.floorH, zone: `stiege-${n}`, label: `Stiege ${n}` };
    boxes.push(t);
    labels.push({ id: `label-stiege-${n}`, text: `Stiege ${n}`, at: [t.x + t.w / 2, t.y + t.d / 2, t.z + t.h], anchor: "middle" });
    anchors[`stiege-${n}`] = [t.x + 0.9, t.y + t.d, t.z + 0.55];
    // floor slabs on both faces: the zone "decken" (Deckendurchführungen) lights them
    for (let k = 1; k < ISO.floors; k++) {
      const z = t.z + k * ISO.floorH;
      lines.push({ id: `slab-l-${n}-${k}`, zone: "decken", a: [t.x, t.y + t.d, z], b: [t.x + t.w, t.y + t.d, z] });
      lines.push({ id: `slab-r-${n}-${k}`, zone: "decken", a: [t.x + t.w, t.y, z], b: [t.x + t.w, t.y + t.d, z] });
    }
    if (n === 1) anchors.decken = [t.x + t.w * 0.35, t.y + t.d, t.z + 2 * ISO.floorH];
    // flats of type C: one corner flat on every floor of the right face and on three floors of the left (7 per Stiege, 14 in two)
    if (typeStiegen.includes(n)) {
      for (let f = 1; f <= ISO.floors; f++) patches.push({ id: `c-r-${n}-${f}`, zone: "wohnungen", poly: cellOn("right", t, f, 1, 2), kind: "cell" });
      for (let f = 1; f < ISO.floors; f++) patches.push({ id: `c-l-${n}-${f}`, zone: "wohnungen", poly: cellOn("left", t, f, 0, 2), kind: "cell" });
      if (!anchors.wohnungen) anchors.wohnungen = centre(cellOn("right", t, ISO.floors, 1, 2));
    }
    // the riser shaft: a strip near the back of the right face, the full height
    const shaft: P3[] = [[t.x + t.w, t.y + 0.35, t.z], [t.x + t.w, t.y + 0.85, t.z], [t.x + t.w, t.y + 0.85, t.z + t.h], [t.x + t.w, t.y + 0.35, t.z + t.h]];
    patches.push({ id: `shaft-${n}`, zone: `schacht-${n}`, poly: shaft, kind: "strip" });
    anchors[`schacht-${n}`] = [t.x + t.w, t.y + 0.6, t.z + t.h * 0.72];
    for (const tp of tops.filter((x) => x.stiege === n)) {
      const poly = topCell(t, tp.top);
      patches.push({ id: `top-${n}-${tp.top}`, zone: tp.zone, poly, kind: "cell" });
      anchors[tp.zone] = centre(poly);
    }
  }
  return { boxes, patches, lines, anchors, labels };
}

/** One building as a stack of floors, slightly apart; the Untergeschoß below ground is drawn dashed. */
function floorsScene(m: Extract<BuildingModel, { kind: "geschosse" }>): Scene {
  const boxes: Box[] = [];
  const anchors: Record<string, P3> = {};
  const labels: Scene["labels"] = [];
  const h = 0.95;
  const gap = 0.32;
  const low = Math.min(...m.floors.map((f) => f.level));
  for (const f of m.floors) {
    const z = (f.level - low) * (h + gap);
    boxes.push({ id: f.id, x: 0, y: 0, z, w: 8, d: 5.2, h, zone: f.id, label: f.label, dashed: f.level < 0 });
    // markers step along the right face, so the pins of neighbouring floors never stand on each other
    anchors[f.id] = [8, 0.9 + ((f.level - low) % 3) * 1.7, z + h / 2];
    labels.push({ id: `label-${f.id}`, text: f.label, at: [0, 5.2, z + h / 2], anchor: "end" });
  }
  return { boxes, patches: [], lines: [], anchors, labels };
}

/** Altbau and Zubau side by side, the Untergeschoß of the Zubau exploded below it. */
function partsScene(m: Extract<BuildingModel, { kind: "teile" }>): Scene {
  const boxes: Box[] = [];
  const anchors: Record<string, P3> = {};
  const labels: Scene["labels"] = [];
  const lift = m.untergeschoss ? 1.6 : 0;
  if (m.parts.includes("altbau")) {
    boxes.push({ id: "altbau", x: 0, y: 0, z: lift, w: 5, d: 5, h: 3.2, zone: "altbau", label: "Altbau" });
    anchors.altbau = [2.2, 5, lift + 1.6];
    labels.push({ id: "label-altbau", text: "Altbau", at: [2.5, 2.5, lift + 3.2], anchor: "middle" });
  }
  if (m.parts.includes("zubau")) {
    if (m.untergeschoss) boxes.push({ id: "zubau-ug", x: 5.8, y: 0.8, z: 0, w: 4.6, d: 4.2, h: 0.9, zone: null, label: "Untergeschoß", dashed: true });
    boxes.push({ id: "zubau", x: 5.8, y: 0.8, z: lift, w: 4.6, d: 4.2, h: 2.2, zone: "zubau", label: "Zubau" });
    anchors.zubau = [10.4, 2.9, lift + 1.1];
    labels.push({ id: "label-zubau", text: "Zubau", at: [8.1, 2.9, lift + 2.2], anchor: "middle" });
  }
  return { boxes, patches: [], lines: [], anchors, labels };
}

/** The scene of a model; `tops` and `typeStiegen` come from the places of the finds. */
export function sceneOf(m: BuildingModel, places: { zone: string; stiegen: number[]; top: number | null; kind: string }[]): Scene {
  if (m.kind === "geschosse") return floorsScene(m);
  if (m.kind === "teile") return partsScene(m);
  const tops = places.filter((p) => p.kind === "top" && p.top !== null).map((p) => ({ zone: p.zone, stiege: p.stiegen[0] ?? 1, top: p.top! }));
  const typeStiegen = [...new Set(places.filter((p) => p.kind === "wohnungen").flatMap((p) => (p.stiegen.length ? p.stiegen : Array.from({ length: m.stiegen }, (_, i) => i + 1))))];
  return stiegenScene(m, tops, typeStiegen);
}

/** Painting order: lower boxes first, then from the back (small x + y) to the front. */
export function paintOrder(boxes: Box[]): Box[] {
  return [...boxes].sort((a, b) => a.z - b.z || a.x + a.y - (b.x + b.y));
}

/** The 2D bounds of a scene, with room around it for markers and labels. */
export function bounds(s: Scene, u: number = ISO.unit, pad = 28): { x: number; y: number; w: number; h: number } {
  const pts = [
    ...s.boxes.flatMap((b) => Object.values(faces(b)).flat()),
    ...s.labels.map((l) => l.at),
  ].map((p) => project(p, u));
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x = Math.min(...xs) - pad * 1.6;
  const y = Math.min(...ys) - pad * 1.9;
  return { x, y, w: Math.max(...xs) - x + pad * 1.6, h: Math.max(...ys) - y + pad * 0.6 };
}
