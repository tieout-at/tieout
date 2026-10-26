"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";

import { CFG } from "./config";
import { buildGeo, columns, fitRows, gridFit, tickLayout, type Box, type Columns, type Fit, type Geo, type Measured, type NodeKey, type StripLayout } from "./layout";
import type { BlockKey, Model } from "./model";

export type Sizes = { fit: Fit; strips: StripLayout[]; visible: Record<BlockKey, number> };
export type StageGeometry = {
  cols: Columns | null;
  availH: number;
  sizes: Sizes | null;
  geo: Geo | null;
  /** True once everything is measured: the stage is shown from then on. */
  ready: boolean;
};

type Base = { width: number; availH: number };

const sameSizes = (a: Sizes | null, b: Sizes) => !!a && JSON.stringify(a) === JSON.stringify(b);

function rel(el: Element | null, origin: DOMRect): Box | null {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { x: r.left - origin.left, y: r.top - origin.top, w: r.width, h: r.height };
}

/**
 * Measures the stage once per layout: its width and the height left in the scroll area (ResizeObserver, one
 * animation frame), then the text around the grid, then the boxes the lines need. Everything else is computed by the
 * pure functions in `layout.ts`. Cleans up its observer and frame.
 */
export function useStageGeometry(
  model: Model,
  unfolded: boolean,
  wrapRef: React.RefObject<HTMLDivElement | null>,
  stageRef: React.RefObject<HTMLDivElement | null>,
): StageGeometry {
  const [base, setBase] = useState<Base | null>(null);
  const [fonts, setFonts] = useState(0);
  const [sizes, setSizes] = useState<Sizes | null>(null);
  const [geo, setGeo] = useState<Geo | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const area = wrap.closest<HTMLElement>("[data-scroll-area]");
    let raf = 0;
    let alive = true;
    const read = () => {
      raf = 0;
      const width = wrap.clientWidth;
      const top = area ? wrap.getBoundingClientRect().top - area.getBoundingClientRect().top + area.scrollTop : wrap.offsetTop;
      const availH = Math.max(0, Math.round((area?.clientHeight ?? window.innerHeight) - top));
      setBase((b) => (b && b.width === width && b.availH === availH ? b : { width, availH }));
    };
    const ro = new ResizeObserver(() => {
      if (!raf) raf = requestAnimationFrame(read);
    });
    ro.observe(wrap);
    if (area) ro.observe(area);
    // text widths change once the font is there; measure the text again then
    document.fonts?.ready.then(() => alive && setFonts((n) => n + 1));
    return () => {
      alive = false;
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [wrapRef]);

  const cols = useMemo(() => (base ? columns(base.width) : null), [base]);

  // 1. sizes: grid, tick rows and money rows for the height that is left
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!base || !cols || !stage) return;
    const H = base.availH - CFG.pad.top - CFG.pad.bottom - CFG.stepsH;
    const all = Object.fromEntries(model.blocks.map((b) => [b.key, b.finds.length])) as Record<BlockKey, number>;
    let next: Sizes;
    if (cols.stacked) {
      next = { fit: gridFit(model.grid.length, base.width - 2 * cols.pad, Infinity, CFG.grid.minCols), strips: [], visible: all };
    } else {
      const twin = stage.querySelector<HTMLElement>('[data-zone="zwilling"]');
      const grid = stage.querySelector<HTMLElement>('[data-zone="grid"]');
      const ohne = stage.querySelector<HTMLElement>('[data-zone="ohne"]');
      // everything in the twin column but the cells
      const chrome = (twin?.offsetHeight ?? 0) - (grid?.offsetHeight ?? 0) - (ohne?.offsetHeight ?? 0);
      const minCols = cols.narrow ? CFG.grid.minColsNarrow : CFG.grid.minCols;
      // the cells without position start a row of their own below the grid
      const cells = model.grid.length + (model.ohne.length ? model.ohne.length + minCols : 0);
      const fit = gridFit(cells, cols.twin, Math.max(H - chrome, CFG.grid.minH), minCols);
      const visible = unfolded ? all : (Object.fromEntries(fitRows(model.blocks.map((b) => ({ rows: b.finds.length, quiet: !!b.quiet })), H).map((v, i) => [model.blocks[i].key, v])) as Record<BlockKey, number>);
      next = { fit, strips: tickLayout(model.groups.map((g) => ({ rows: g.rows.length, wa: g.wa })), H, model.dense), visible };
    }
    setSizes((prev) => (sameSizes(prev, next) ? prev : next));
  }, [base, cols, fonts, model, unfolded, stageRef]);

  // 2. geometry: the boxes the lines start and end at, measured in one pass
  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage || !cols || cols.stacked || !sizes || !base) {
      setGeo(null);
      return;
    }
    const o = stage.getBoundingClientRect();
    const q = (sel: string) => stage.querySelector(sel);
    const strips: Measured["strips"] = {};
    for (const g of model.groups) {
      const b = rel(q(`[data-strip="${g.key}"]`), o);
      if (b) strips[g.key] = b;
    }
    const nodes = {} as Record<NodeKey, Box | null>;
    for (const k of ["auftraggeber", "vertrag", "preisbasis"] as const) nodes[k] = rel(q(`[data-node="${k}"]`), o);
    const rows: Measured["rows"] = {};
    stage.querySelectorAll<HTMLElement>("[data-dot]").forEach((el) => {
      const b = rel(el, o);
      if (b && el.dataset.dot) rows[el.dataset.dot] = b;
    });
    const more: Measured["more"] = {};
    stage.querySelectorAll<HTMLElement>("[data-more]").forEach((el) => {
      const b = rel(el, o);
      if (b) more[el.dataset.more as BlockKey] = b;
    });
    const grid = rel(q('[data-zone="grid"]'), o);
    const docs = rel(q("[data-docs]"), o);
    if (!grid || !docs) return;
    const m: Measured = {
      width: stage.scrollWidth,
      height: stage.scrollHeight,
      strips,
      docs,
      grid,
      ohne: rel(q('[data-zone="ohne"]'), o),
      nodes,
      rows,
      more,
      waHead: rel(q("[data-wa-head]"), o),
      font: { sans: getComputedStyle(stage).fontFamily, mono: getComputedStyle(q("[data-mono]") ?? stage).fontFamily },
    };
    setGeo(buildGeo(m, model, { fit: sizes.fit, strips: sizes.strips, cols, visible: sizes.visible }));
  }, [sizes, cols, base, model, fonts, stageRef]);

  const ready = !!sizes && (cols?.stacked ? true : !!geo);
  return { cols, availH: base?.availH ?? 0, sizes, geo, ready };
}
