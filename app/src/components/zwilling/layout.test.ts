/**
 * Tests of the pure layout of the page "Übersicht". The fixtures live here, never in the app: the real view of
 * Wohnpark Mooshaim and variants built from it: small, large (deterministic seed), long words and amounts, empty.
 * `fakeGeo` lays a model out the way the page does, without a browser.
 */

import { describe, expect, it } from "vitest";

import { twinView, type TwinBeleg, type TwinCell, type TwinFind, type TwinView } from "@/lib/twin";
import { CFG } from "./config";
import {
  baseRoutes,
  blockHeight,
  buildGeo,
  cardHeight,
  planCards,
  bundleEdges,
  cellAt,
  cellBox,
  columns,
  fanIn,
  fitRows,
  gridFit,
  nearestRow,
  readoutHeight,
  stackCards,
  tickLayout,
  traceRoutes,
  type Box,
  type Geo,
  type Measured,
  type Route,
} from "./layout";
import { buildModel, findDetail, resolveTrace, type BlockKey, type Model } from "./model";

function realView(id = "p1"): TwinView {
  return structuredClone(twinView(id)!);
}

/** Mulberry32: the same numbers on every run. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const euro = (cent: number) => `${String(Math.floor(cent / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${String(cent % 100).padStart(2, "0")} €`;

function smallView(): TwinView {
  const v = realView();
  const f = { ...v.finds[0], cells: [v.abgleich.positions[5].id] };
  v.abgleich.positions = v.abgleich.positions.slice(0, 24).map((c, i) => ({ ...c, state: i === 5 ? "fund" : c.state === "fund" ? "verrechnet" : c.state, find: i === 5 ? f.number : null }));
  v.abgleich.withoutPosition = [];
  v.belege = v.belege.filter((b) => b.id === "lv" || b.id === "ab-12").map((b) => ({ ...b, finds: [f.number], shows: [] }));
  v.finds = [f];
  return v;
}

function emptyView(): TwinView {
  const v = realView();
  v.finds = [];
  v.belege = v.belege.map((b) => ({ ...b, finds: [], shows: [] }));
  const calm = (c: TwinCell): TwinCell => (c.state === "fund" ? { ...c, state: "verrechnet", find: null } : c);
  v.abgleich.positions = v.abgleich.positions.map(calm);
  v.abgleich.withoutPosition = v.abgleich.withoutPosition.map(calm);
  return v;
}

function longView(): TwinView {
  const v = realView();
  const tail = " mit sehr langer Bezeichnung aus dem Ordner, drittes Obergeschoss Stiege 2, Nachtrag zum Nachtrag";
  v.belege = v.belege.map((b) => ({ ...b, title: b.title + tail, detail: b.detail ? b.detail + tail : null }));
  v.finds = v.finds.map((f, i) => (i === 0 ? { ...f, label: `${f.label} mit sehr langer Bezeichnung Wohnungstyp C`, amount: { cent: 123456789, text: "1.234.567,89 €" } } : f));
  v.money = { ...v.money, extra: "1.242.539,44 €", unclear: "998.877.665,43 €", atRisk: "1.111.111,11 €" };
  return v;
}

/** 2.000 Belege, 1.200 positions, 30 findings; some without a cell, some proven through the Vertrag. */
function largeView(seed = 20261024): TwinView {
  const R = rng(seed);
  const v = realView();
  const pick = <T,>(a: readonly T[]) => a[Math.floor(R() * a.length)];
  const t0 = Date.UTC(2025, 9, 1);
  const kinds = [
    ["systeme", "abschlagsrechnung"],
    ["dokumente", "aufmassblatt"],
    ["dokumente", "regiebericht"],
    ["dokumente", "plan"],
    ["kommunikation", "email"],
    ["kommunikation", "foto"],
  ] as const;
  const belege: TwinBeleg[] = Array.from({ length: 2000 }, (_, i) => {
    const [groupKey, art] = pick(kinds);
    const iso = new Date(t0 + Math.floor(R() * 385) * 864e5).toISOString().slice(0, 10);
    return {
      id: `b${i}`,
      art,
      title: `Beleg ${i + 1}`,
      detail: null,
      kind: art,
      group: groupKey,
      groupKey,
      date: { iso, text: iso.split("-").reverse().join(".") },
      copy: R() < 0.03,
      node: art === "abschlagsrechnung" ? "verrechnet" : "fund",
      finds: [],
      shows: [],
    };
  });
  belege.push({ ...belege[0], id: "vertrag", art: "vertrag", title: "Bauvertrag", groupKey: "dokumente", node: "vertrag", finds: [], shows: [] });
  for (let w = 0; w < 60; w++) {
    const iso = new Date(t0 + Math.floor(R() * 385) * 864e5).toISOString().slice(0, 10);
    belege.push({ ...belege[0], id: `w${w}`, art: "whatsapp", title: `WhatsApp-Meldung W${w + 1}`, groupKey: "whatsapp", node: "fund", date: { iso, text: iso }, finds: [], shows: [] });
  }
  const positions: TwinCell[] = Array.from({ length: 1200 }, (_, i) => {
    const x = R();
    return { id: `P${String(i + 1).padStart(4, "0")}`, index: i, label: `P${i + 1} Leistung`, state: x < 0.06 ? "pauschale" : x < 0.11 ? "menge_abweichend" : "verrechnet", find: null, cells: { beauftragt: "10 m", erbracht: "10 m", verrechnet: "10 m" } };
  });
  const ohne: TwinCell[] = Array.from({ length: 40 }, (_, i) => ({ id: `ohne-${i}`, index: null, label: `Regiebericht ${i + 1}`, state: "verrechnet", find: null, cells: { beauftragt: "–", erbracht: "4 h", verrechnet: "4 h" } }));
  const stands = ["belegt", "belegt", "belegt", "beleg_fehlt", "nachtrag_nicht_gelegt"] as const;
  const finds: TwinFind[] = [];
  for (let k = 0; k < 30; k++) {
    const nr = `F${k + 1}`;
    const state = pick(stands);
    const cent = 20000 + Math.floor(R() * 900000);
    const cells: string[] = [];
    if (R() < 0.7) {
      for (let q = 0, n = 1 + Math.floor(R() * 3); q < n; q++) {
        const idx = Math.floor(R() * 1200);
        if (positions[idx].find) continue;
        positions[idx] = { ...positions[idx], state: "fund", find: nr, cells: { beauftragt: "10 m", erbracht: "14 m", verrechnet: "10 m" } };
        cells.push(positions[idx].id);
      }
    }
    if (!cells.length && R() < 0.8) {
      ohne.push({ id: `ohne-${ohne.length}`, index: null, label: `Regie ${nr}`, state: "fund", find: nr, cells: { beauftragt: "–", erbracht: "6 h", verrechnet: "0 h" } });
      cells.push(ohne[ohne.length - 1].id);
    }
    finds.push({
      ...v.finds[0],
      number: nr,
      label: `Position mit Mehrmenge ${k + 1}`,
      bucket: state === "belegt" ? "zusaetzlich" : "klaerung",
      belegstand: { state, text: state === "belegt" ? "belegt" : state === "beleg_fehlt" ? "Beleg fehlt" : "Nachtrag nicht gelegt" },
      amount: { cent, text: euro(cent) },
      cells,
      sameReason: null,
      risk: null,
      remedy: state === "belegt" ? null : "Regiebericht unterschreiben lassen",
    });
    for (let s = 0, m = 3 + Math.floor(R() * 10); s < m; s++) {
      const b = belege[Math.floor(R() * 2000)];
      if (b.node === "verrechnet") b.shows = [...new Set([...b.shows, nr])];
      else b.finds = [...new Set([...b.finds, nr])];
    }
    if (R() < 0.3) belege.find((b) => b.id === "vertrag")!.finds.push(nr);
    if (R() < 0.3) belege[2001 + Math.floor(R() * 60)].finds.push(nr);
  }
  v.belege = belege;
  v.abgleich = { positions, withoutPosition: ohne, counts: v.abgleich.counts };
  v.finds = finds;
  v.money = { ...v.money, extra: euro(1), unclear: euro(2), atRisk: null };
  return v;
}

const FIXTURES: Record<string, () => TwinView> = { real: () => realView(), small: smallView, large: largeView, long: longView, empty: emptyView };

/**
 * Lays a model out like the page does (column widths, tick strips, the twin's text, the money rows), so the pure
 * routing can be tested without a browser. Heights of text are the ones the page uses.
 */
function fakeGeo(model: Model, width = 1165, height = 790): { geo: Geo; visible: Record<BlockKey, number> } {
  const cols = columns(width);
  if (cols.stacked) throw new Error("stacked stage has no lines");
  const H = height - CFG.pad.top - CFG.pad.bottom - CFG.stepsH;
  const top = CFG.pad.top + CFG.stepsH;
  const strips = tickLayout(
    model.groups.map((g) => ({ rows: g.rows.length, wa: g.wa })),
    H,
    model.dense,
  );
  const x0 = cols.pad;
  const stripBoxes: Record<string, Box> = {};
  let y = top;
  let waHead: Box | null = null;
  model.groups.forEach((g, i) => {
    if (g.wa) {
      y += 10;
      stripBoxes[g.key] = { x: x0, y, w: CFG.ruler, h: strips[i].height };
      waHead = { x: x0, y: y + strips[i].height, w: 240, h: CFG.ticks.headH };
      y += strips[i].height + CFG.ticks.headH + CFG.ticks.groupGap;
    } else {
      y += CFG.ticks.headH;
      stripBoxes[g.key] = { x: x0, y, w: CFG.ruler, h: strips[i].height };
      y += strips[i].height + CFG.ticks.groupGap;
    }
  });
  const twinX = x0 + cols.ruler + cols.cards + cols.gapL;
  const minCols = cols.narrow ? CFG.grid.minColsNarrow : CFG.grid.minCols;
  const chrome = 400;
  const fit = gridFit(model.grid.length + (model.ohne.length ? model.ohne.length + minCols : 0), cols.twin, Math.max(H - chrome, CFG.grid.minH), minCols);
  const grid: Box = { x: twinX, y: top + 190, w: fit.width, h: fit.height };
  const ohneRows = Math.ceil(model.ohne.length / fit.cols);
  const ohne: Box | null = model.ohne.length ? { x: twinX, y: grid.y + fit.height + 14, w: fit.width, h: ohneRows * fit.pitch - fit.gap } : null;
  const nodes = { auftraggeber: { x: twinX, y: top + 60, w: 200, h: 24 }, vertrag: { x: twinX, y: top + 86, w: 200, h: 24 }, preisbasis: { x: twinX, y: top + 112, w: 200, h: 24 } };
  const outX = twinX + cols.twin + cols.gapR;
  const counts = fitRows(
    model.blocks.map((b) => ({ rows: b.finds.length, quiet: !!b.quiet })),
    H,
  );
  const visible = Object.fromEntries(model.blocks.map((b, i) => [b.key, counts[i]])) as Record<BlockKey, number>;
  const rows: Measured["rows"] = {};
  const more: Measured["more"] = {};
  let ry = top;
  model.blocks.forEach((b) => {
    ry += CFG.result.blockHead + (b.quiet ? CFG.result.quietH : 0) + CFG.result.rowsTop;
    b.finds.slice(0, visible[b.key]).forEach((nr) => {
      rows[nr] = { x: outX + 8, y: ry + 13, w: 6, h: 6 };
      ry += CFG.result.rowH;
    });
    if (visible[b.key] < b.finds.length) {
      more[b.key] = { x: outX, y: ry, w: 200, h: CFG.result.moreH };
      ry += CFG.result.moreH;
    }
    ry += CFG.result.blockGap;
  });
  const m: Measured = {
    width,
    height: Math.max(height, y, ry),
    strips: stripBoxes,
    docs: { x: x0, y: top, w: cols.ruler + cols.cards, h: y - top },
    grid,
    ohne,
    nodes,
    rows,
    more,
    waHead,
    font: { sans: "sans-serif", mono: "monospace" },
  };
  return { geo: buildGeo(m, model, { fit, strips, cols, visible }), visible };
}

function models(): [string, Model][] {
  return Object.entries(FIXTURES).map(([k, f]) => [k, buildModel(f())]);
}

/* ------------------------------------------------------------------ tests */

const WIDTHS = [749, 1005, 1165, 1637]; // stage width at 1024, 1280, 1440 and 1912 px with the sidebar

describe("columns", () => {
  it("stacks below the breakpoint and keeps three columns from 740 px stage width (1024 px viewport)", () => {
    expect(columns(739).stacked).toBe(true);
    expect(columns(390).stacked).toBe(true);
    expect(columns(749).stacked).toBe(false);
  });

  it("always adds up to the inner width and never goes below a minimum", () => {
    for (let w = CFG.stackBelow; w <= 2600; w += 7) {
      const c = columns(w);
      if (c.stacked) throw new Error("stacked");
      expect(c.ruler + c.cards + c.gapL + c.twin + c.gapR + c.out).toBe(w - 2 * c.pad);
      expect(c.cards).toBeGreaterThanOrEqual(CFG.cards.min);
      expect(c.twin).toBeGreaterThanOrEqual(CFG.twin.min);
      expect(c.out).toBeGreaterThanOrEqual(CFG.out.min);
      expect(Math.min(c.gapL, c.gapR)).toBeGreaterThanOrEqual(CFG.gap.minNarrow);
    }
  });
});

describe("gridFit", () => {
  it("never gets wider than its box and fits the height whenever a legible cell can", () => {
    for (const n of [0, 2, 24, 48, 303, 1240, 2000]) {
      for (const [w, h] of [
        [200, 200],
        [402, 330],
        [560, 600],
        [358, 900],
      ]) {
        const f = gridFit(n, w, h, CFG.grid.minCols);
        expect(f.width).toBeLessThanOrEqual(w);
        expect(f.pitch).toBeLessThanOrEqual(CFG.grid.pitchMax);
        expect(f.cell + f.gap).toBe(f.pitch);
        const smallest = Math.ceil(n / Math.floor((w + 1) / CFG.grid.pitchMin)) * CFG.grid.pitchMin;
        if (smallest <= h) expect(f.height).toBeLessThanOrEqual(h);
      }
    }
  });

  it("grows to the largest cell when there is room (1912 px)", () => {
    expect(gridFit(303 + 22, 560, 600, 22).pitch).toBe(CFG.grid.pitchMax);
  });

  it("finds the cell under a point for every cell", () => {
    const f = gridFit(286, 402, 330, 22);
    for (let i = 0; i < 286; i++) expect(cellAt(f, 286, (i % f.cols) * f.pitch + 1, Math.floor(i / f.cols) * f.pitch + 1)).toBe(i);
    expect(cellAt(f, 286, -1, 0)).toBeNull();
    expect(cellAt(f, 286, f.cols * f.pitch + 1, 0)).toBeNull();
  });
});

describe("ticks", () => {
  it("fill the height without overlapping rows, for every fixture", () => {
    for (const [, model] of models()) {
      const strips = tickLayout(
        model.groups.map((g) => ({ rows: g.rows.length, wa: g.wa })),
        720,
        model.dense,
      );
      for (const s of strips) s.rows.forEach((r, i) => i && expect(r.top).toBeGreaterThanOrEqual(s.rows[i - 1].top + s.rows[i - 1].h));
      const total = strips.reduce((a, s) => a + s.height, 0) + model.groups.length * CFG.ticks.headH;
      expect(total).toBeLessThanOrEqual(720 + 40);
    }
  });

  it("aggregate a large folder into calendar weeks", () => {
    const large = buildModel(largeView());
    expect(large.dense).toBe(true);
    expect(large.groups.find((g) => g.key === "dokumente")!.rows.length).toBeLessThan(60);
    expect(buildModel(realView()).dense).toBe(false);
  });

  it("take the exact row; the magnet only fills the gaps", () => {
    const rows = [
      { top: 0, h: 4, linked: false },
      { top: 4, h: 4, linked: false },
      { top: 8, h: 4, linked: true },
      { top: 40, h: 4, linked: false },
    ];
    // a Beleg without a finding next to a linked one stays itself ("Abschlagsrechnung 1" next to the Preisbasis)
    expect(nearestRow(rows, 1, CFG.magnet)).toBe(0);
    expect(nearestRow(rows, 14, CFG.magnet)).toBe(2);
    expect(nearestRow(rows, 41, CFG.magnet)).toBe(3);
    expect(nearestRow(rows, 80, CFG.magnet)).toBeNull();
  });
});

describe("money rows", () => {
  it("fit the height; the rest folds into a button", () => {
    const blocks = [
      { rows: 20, quiet: true },
      { rows: 10, quiet: false },
    ];
    const visible = fitRows(blocks, 600);
    const height = blockHeight(20, visible[0], true) + blockHeight(10, visible[1], false) + CFG.result.blockGap;
    expect(height).toBeLessThanOrEqual(600);
    expect(visible.every((v) => v >= 1)).toBe(true);
    expect(fitRows([{ rows: 5, quiet: true }], 2000)).toEqual([5]);
  });
});

describe("cards", () => {
  const check = (r: ReturnType<typeof stackCards>, items: { h: number }[], H: number, moreH: number, obstacles: { top: number; bottom: number }[]) => {
    const boxes = r.tops.map((t, i) => ({ top: t, bottom: t + items[i].h }));
    if (r.moreTop !== null) boxes.push({ top: r.moreTop, bottom: r.moreTop + moreH });
    boxes.forEach((b, i) => {
      expect(b.top).toBeGreaterThanOrEqual(0);
      expect(b.bottom).toBeLessThanOrEqual(H);
      if (i) expect(b.top).toBeGreaterThanOrEqual(boxes[i - 1].bottom + CFG.cards.gap);
      for (const o of obstacles) expect(b.bottom <= o.top || b.top >= o.bottom).toBe(true);
    });
  };

  it("never overlap each other, the WhatsApp heading or the edges, the 'weitere' card included", () => {
    const R = rng(7);
    for (let run = 0; run < 300; run++) {
      const H = 200 + Math.floor(R() * 700);
      const n = Math.floor(R() * 9);
      const items = Array.from({ length: n }, () => ({ want: Math.floor(R() * H), h: R() < 0.5 ? 24 : 40 })).sort((a, b) => a.want - b.want);
      const ob = R() < 0.5 ? [{ top: H - 40, bottom: H - 16 }] : [];
      const folded = R() < 0.3 ? 3 : 0;
      const r = stackCards(items, H, { gap: CFG.cards.gap, moreH: CFG.cards.moreH, folded, obstacles: ob });
      check(r, items, H, CFG.cards.moreH, ob);
      if (folded || r.shown < n) expect(r.moreTop).not.toBeNull();
    }
  });

  it("fold what does not fit a short column into 'und N weitere'", () => {
    const items = Array.from({ length: 8 }, (_, i) => ({ want: i * 10, h: 40 }));
    const r = stackCards(items, 150, { gap: 6, moreH: 24, folded: 0 });
    expect(r.shown).toBeLessThan(8);
    check(r, items, 150, 24, []);
  });
});

/** Horizontal pieces of a lane route must run in the gaps between rows, never through a row of cells. */
function laneProblems(geo: Geo, routes: Route[]): string[] {
  const problems: string[] = [];
  const bands = (g: Geo["grid"] | null) => {
    if (!g) return [] as { top: number; bottom: number; x0: number; x1: number }[];
    return Array.from({ length: Math.ceil(g.n / g.cols) }, (_, r) => ({ top: g.y + r * g.pitch, bottom: g.y + r * g.pitch + g.cell, x0: g.x, x1: g.x + g.cols * g.pitch }));
  };
  const all = [...bands(geo.grid), ...bands(geo.ohne)];
  for (const r of routes) {
    for (const s of r.segs ?? []) {
      if (Math.abs(s.a.y - s.b.y) > 0.01) continue;
      const lo = Math.min(s.a.x, s.b.x);
      const hi = Math.max(s.a.x, s.b.x);
      for (const b of all) if (s.a.y > b.top && s.a.y < b.bottom && hi > b.x0 && lo < b.x1) problems.push(`${r.kind} at y ${s.a.y} runs through a row`);
    }
  }
  return problems;
}

describe("routing", () => {
  for (const [name, model] of models()) {
    for (const width of WIDTHS) {
      it(`${name} at ${width} px: no line runs through a cell, and every coloured cell has its line`, () => {
        const { geo } = fakeGeo(model, width);
        const routes = baseRoutes(model, geo);
        expect(laneProblems(geo, routes)).toEqual([]);
        const through = routes.filter((r) => r.kind === "through");
        for (const f of model.finds.values()) {
          for (const ref of f.cells) {
            const g = ref.area === "grid" ? geo.grid : geo.ohne!;
            const b = cellBox(g, ref.index);
            const end = `L${Math.round((b.x + b.w / 2) * 10) / 10},${Math.round((b.y + b.h / 2) * 10) / 10}`;
            expect(through.some((r) => r.d.endsWith(end))).toBe(true);
          }
        }
        for (const p of routes.flatMap((r) => r.d.match(/-?[\d.]+/g) ?? [])) expect(Number.isFinite(+p)).toBe(true);
      });
    }
  }

  it("bundles a group above the threshold into one line per target, with its count", () => {
    const model = buildModel(largeView());
    const { geo } = fakeGeo(model, 1165);
    const evidence = baseRoutes(model, geo).filter((r) => r.kind === "proof");
    expect(evidence.some((r) => (r.count ?? 0) > 1)).toBe(true);
    expect(evidence.length).toBeLessThan(200);
    const edges = Array.from({ length: 50 }, (_, i) => ({ group: "g", src: { x: 0, y: i }, port: { x: 10, y: i % 2 }, key: `k${i % 2}`, tone: "belegt" as const, count: 1 }));
    expect(bundleEdges(edges, 40, { g: { x: 0, y: 25 } }).map((e) => e.count)).toEqual([25, 25]);
  });

  it("orders the arrivals at a port by where they come from, so they never cross", () => {
    const port = { x: 100, y: 50 };
    const ends = fanIn(
      [
        { from: 90, port },
        { from: 10, port },
        { from: 50, port },
      ],
      2,
    );
    expect(ends.map((e) => e.y)).toEqual([52, 48, 50]);
  });

  it("traces every finding, block and tick of every fixture without a crash", () => {
    for (const [, model] of models()) {
      const { geo } = fakeGeo(model, 1165);
      const targets = [
        ...model.order.map((id) => ({ kind: "fund" as const, id })),
        ...model.blocks.map((b) => ({ kind: "block" as const, id: b.key })),
        ...[...model.rows.keys()].slice(0, 80).map((id) => ({ kind: "tick" as const, id })),
        { kind: "fund" as const, id: "F999" },
      ];
      for (const t of targets) {
        const trace = resolveTrace(model, t);
        const d = traceRoutes(model, geo, trace, { ports: {}, more: { x: geo.cards.x + 100, y: geo.cards.y + 20 }, folded: trace.sources });
        expect(laneProblems(geo, d.routes)).toEqual([]);
      }
    }
  });

  it("survives a finding without a cell in a reverse trace", () => {
    const v = realView();
    v.finds[0] = { ...v.finds[0], cells: [] };
    v.abgleich.positions = v.abgleich.positions.map((c) => (c.find === v.finds[0].number ? { ...c, find: null, state: "verrechnet" } : c));
    const model = buildModel(v);
    const { geo } = fakeGeo(model, 1165);
    const trace = resolveTrace(model, { kind: "tick", id: model.rowOf.get("ab-12")! });
    expect(trace.finds).toEqual(["F1"]);
    expect(() => traceRoutes(model, geo, trace, { ports: {}, more: null, folded: [] })).not.toThrow();
    expect(() => baseRoutes(model, geo)).not.toThrow();
  });

  it("draws the memory of the Auftraggeber dashed and the own Entwurf as 'verrechnet laut', never as proof", () => {
    const model = buildModel(realView());
    const { geo } = fakeGeo(model, 1165);
    const more = { x: 300, y: 300 };
    const f1 = resolveTrace(model, { kind: "fund", id: "F1" });
    expect(traceRoutes(model, geo, f1, { ports: {}, more, folded: f1.sources }).routes.filter((r) => r.kind === "memory")).toHaveLength(1);
    const f4 = resolveTrace(model, { kind: "fund", id: "F4" });
    expect(f4.shows.map((l) => l.beleg)).toEqual(["entwurf"]);
    expect(f4.proof.map((l) => l.beleg)).not.toContain("entwurf");
    expect(traceRoutes(model, geo, f4, { ports: {}, more, folded: f4.sources }).routes.filter((r) => r.kind === "shows")).toHaveLength(1);
  });

  it("lets a Beleg without a finding light only its own tick and card", () => {
    const model = buildModel(realView());
    const quiet = [...model.rows.values()].find((r) => !r.linked && !r.docs.some((d) => d.shows.length))!;
    const trace = resolveTrace(model, { kind: "tick", id: quiet.key });
    expect(trace.dims).toBe(false);
    expect(trace.sources).toEqual([quiet.docs[0].id]);
  });
});

describe("readout", () => {
  it("reserves enough room for every finding and stays within its maximum", () => {
    for (const [, model] of models()) {
      for (const nr of model.order) {
        const h = readoutHeight(findDetail(model, nr)!, 402);
        expect(h).toBeGreaterThan(0);
        expect(h).toBeLessThanOrEqual(CFG.readout.max);
      }
    }
    const model = buildModel(realView());
    expect(readoutHeight(findDetail(model, "F1")!, 402)).toBeGreaterThan(readoutHeight(findDetail(model, "F3")!, 402));
  });
});

describe("planCards", () => {
  const width = (text: string, mono: boolean) => text.length * (mono ? 6.6 : 6.4);
  it("places the cards of every trace of every fixture without overlap, at every width, long titles included", () => {
    for (const [name, model] of models()) {
      for (const w of WIDTHS) {
        const { geo } = fakeGeo(model, w);
        const c = columns(w);
        const narrow = !c.stacked && c.narrow;
        const targets = [...model.order.map((id) => ({ kind: "fund" as const, id })), ...model.blocks.map((b) => ({ kind: "block" as const, id: b.key }))];
        for (const t of targets) {
          const trace = resolveTrace(model, t);
          const plan = planCards(model, geo, trace, width, narrow);
          const boxes = plan.cards.map((c) => ({ top: c.top, bottom: c.top + c.h }));
          if (plan.moreTop !== null) boxes.push({ top: plan.moreTop, bottom: plan.moreTop + CFG.cards.moreH });
          boxes.forEach((b, i) => {
            expect(b.top, `${name} ${w} ${t.id}`).toBeGreaterThanOrEqual(0);
            expect(b.bottom).toBeLessThanOrEqual(geo.cards.h);
            if (i) expect(b.top).toBeGreaterThanOrEqual(boxes[i - 1].bottom);
            if (geo.waHead) expect(b.bottom <= geo.waHead.top || b.top >= geo.waHead.bottom).toBe(true);
          });
          expect(plan.cards.length + plan.moreCount).toBe(trace.sources.length);
          expect(plan.cards.length).toBeLessThanOrEqual(CFG.cards.maxShown);
        }
      }
    }
  });

  it("gives a long title two lines and a short one one", () => {
    const short = cardHeight({ lines: 1, narrow: false, chain: false, shows: false });
    const model = buildModel(longView());
    const { geo } = fakeGeo(model, 1165);
    const plan = planCards(model, geo, resolveTrace(model, { kind: "fund", id: "F3" }), (t) => t.length * 6.4, false);
    expect(plan.cards.every((c) => c.h > short)).toBe(true);
  });
});
