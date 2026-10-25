"use client";

import { ChevronRight } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useReducer, useRef, useState } from "react";

import { useLive } from "@/lib/live";
import type { TwinView } from "@/lib/twin";
import { cn } from "@/lib/utils";
import { CFG } from "./config";
import { EvidenceColumn } from "./evidence-column";
import { gridTemplate, nearestRow, planCards, readoutHeight } from "./layout";
import { BaseLines, TraceLayer, useSvgId } from "./lines";
import { buildModel, findDetail, resolveTrace, targetKey, traceSentence, type Target } from "./model";
import { Cards, CellTip } from "./overlays";
import { ProjectHead, type ProjectLink } from "./project-head";
import { ResultColumn } from "./result-column";
import { TraceSheet } from "./trace-sheet";
import { Readout, TwinColumn, type TipCell } from "./twin-column";
import { useReducedMotion } from "./use-media";
import { useStageGeometry } from "./use-stage-geometry";
import { useTextWidth } from "./use-text-width";
import { useTraceLines } from "./use-trace-lines";

export type { ProjectLink } from "./project-head";

type State = {
  hovered: Target | null;
  pinned: Target | null;
  /** The control that started the pinned trace; Escape and the sheet give focus back to it. */
  trigger: string | null;
  announce: string;
  unfolded: boolean;
  tip: TipCell | null;
};

type Action =
  | { type: "hover"; target: Target | null }
  | { type: "focus"; target: Target; announce: string }
  | { type: "pin"; target: Target; trigger: string | null; announce: string; dropHover: boolean }
  | { type: "reset" }
  | { type: "unfold" }
  | { type: "tip"; tip: TipCell | null };

const INITIAL: State = { hovered: null, pinned: null, trigger: null, announce: "", unfolded: false, tip: null };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "hover":
      return targetKey(s.hovered) === targetKey(a.target) ? s : { ...s, hovered: a.target };
    case "focus":
      return { ...s, hovered: a.target, announce: a.announce };
    case "pin": {
      const same = targetKey(s.pinned) === targetKey(a.target);
      return { ...s, pinned: same ? null : a.target, hovered: a.dropHover ? null : s.hovered, trigger: a.trigger, announce: same ? "" : a.announce };
    }
    case "reset":
      return s.hovered || s.pinned || s.announce ? { ...s, hovered: null, pinned: null, announce: "" } : s;
    case "unfold":
      return { ...s, unfolded: true };
    case "tip":
      return s.tip?.area === a.tip?.area && s.tip?.index === a.tip?.index ? s : { ...s, tip: a.tip };
  }
}

function parseTarget(value: string | undefined): Target | null {
  if (!value) return null;
  const i = value.indexOf(":");
  const kind = value.slice(0, i);
  const id = value.slice(i + 1);
  if (kind === "fund" || kind === "tick") return { kind, id };
  if (kind === "block" && (id === "zusaetzlich" || id === "klaerung" || id === "pauschale" || id === "nicht_verrechnen")) return { kind, id };
  if (kind === "gruppe" && (id === "systeme" || id === "dokumente" || id === "kommunikation" || id === "whatsapp")) return { kind, id };
  return null;
}

function Step({ n, title, id, column, chevron, className }: { n: number; title: string; id: string; column?: string; chevron?: boolean; className?: string }) {
  return (
    <div className={cn("flex h-7 min-w-0 items-center gap-2 self-start", className)} style={column ? { gridColumn: column, gridRow: 2 } : undefined}>
      <span data-mono="" className="flex size-5 shrink-0 items-center justify-center rounded-[5px] bg-fill-hover font-mono text-[11px] leading-none text-count shadow-ring">{n}</span>
      <h2 id={id} className="text-sm font-medium whitespace-nowrap">
        {title}
      </h2>
      <span aria-hidden className="h-px min-w-3 flex-1 bg-line" />
      {chevron && <ChevronRight aria-hidden className="mr-2 size-4 shrink-0 text-fg-faint" />}
    </div>
  );
}

/**
 * The page "Übersicht" (Digitaler Zwilling): Ihre Daten, the twin, the money, and the line from every finding back
 * to the Belege that prove it. The view comes computed from `kern/`, with a decision in this browser computed again by
 * the core (live.ts); this component only draws and links it.
 */
export function Zwilling({ view: built, projects }: { view: TwinView; projects: ProjectLink[] }) {
  const recomputed = useLive();
  const view = recomputed?.twinView(built.project.slug) ?? built;
  const model = useMemo(() => buildModel(view), [view]);
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const g = useStageGeometry(model, state.unfolded, wrapRef, stageRef);
  const cols = g.cols;
  const stacked = cols?.stacked ?? false;
  const layerRef = useRef<SVGGElement | null>(null);
  const sweepRef = useRef<SVGLinearGradientElement | null>(null);
  const sweepId = useSvgId("zw-sweep");
  const ids = useId();

  const active = stacked ? state.pinned : (state.hovered ?? state.pinned);
  const key = targetKey(active);
  const trace = useMemo(() => (active ? resolveTrace(model, active) : null), [model, active]);
  const on = useMemo(() => new Set(trace?.dims ? trace.finds : []), [trace]);
  const nodesOn = useMemo(() => {
    const s = new Set<string>();
    if (!trace?.dims) return s;
    for (const l of trace.proof) {
      const node = model.belege.get(l.beleg)?.node;
      if (node === "auftraggeber" || node === "vertrag" || node === "preisbasis") s.add(node);
    }
    if (trace.memory) s.add("auftraggeber");
    return s;
  }, [model, trace]);

  // cards are planned before they are drawn: titles measured as text, stacked by the pure function
  const narrowCards = !!cols && !cols.stacked && cols.narrow;
  const textWidth = useTextWidth(g.geo?.font ?? null);
  const plan = useMemo(() => (g.geo && trace && !stacked ? planCards(model, g.geo, trace, textWidth, narrowCards) : null), [model, g.geo, trace, stacked, textWidth, narrowCards]);
  useTraceLines({ layerRef, sweepRef, sweepId, model, geo: g.geo, trace, cards: plan?.ports ?? null, reduced });

  // entrance once per session, decided on the client after the fonts; nothing moves with reduced motion
  const [phase, setPhase] = useState<"wait" | "run" | "rest">("wait");
  const decided = useRef<boolean | null>(null);
  useEffect(() => {
    if (!g.ready || phase !== "wait") return;
    if (decided.current === null) {
      let seen = true;
      try {
        seen = window.sessionStorage.getItem(CFG.storageKey) === "1";
        window.sessionStorage.setItem(CFG.storageKey, "1");
      } catch {
        // storage blocked: no entrance
      }
      decided.current = !seen && !reduced && !stacked;
    }
    if (!decided.current) {
      setPhase("rest");
      return;
    }
    let alive = true;
    (document.fonts?.ready ?? Promise.resolve()).then(() => alive && setPhase("run"));
    return () => {
      alive = false;
    };
  }, [g.ready, phase, reduced, stacked]);
  useEffect(() => {
    if (phase !== "run") return;
    const t = window.setTimeout(() => setPhase("rest"), CFG.motion.enterDone);
    return () => window.clearTimeout(t);
  }, [phase]);
  const visible = g.ready && phase !== "wait";

  const sentence = useCallback((t: Target) => traceSentence(model, resolveTrace(model, t)), [model]);
  const focusTrigger = useCallback(
    (trigger: string | null) => {
      const el = trigger ? stageRef.current?.querySelector<HTMLElement>(`[data-trigger="${CSS.escape(trigger)}"]`) : null;
      return el ?? null;
    },
    [stageRef],
  );
  const tickAt = (strip: HTMLElement, y: number): Target | null => {
    const gi = model.groups.findIndex((x) => x.key === strip.dataset.strip);
    const layout = g.sizes?.strips[gi];
    if (gi < 0 || !layout) return null;
    const rows = model.groups[gi].rows;
    const i = nearestRow(
      rows.map((r, j) => ({ ...layout.rows[j], linked: r.linked, empty: !r.docs.length })),
      y,
      CFG.magnet,
    );
    return i === null ? null : { kind: "tick", id: rows[i].key };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || stacked) return;
    const el = e.target as Element;
    const zone = el.closest<HTMLElement>("[data-zone]");
    if (zone?.dataset.zone === "grid" || zone?.dataset.zone === "ohne") return;
    if (zone?.dataset.zone === "strip") {
      dispatch({ type: "hover", target: tickAt(zone, e.nativeEvent.offsetY) });
      return;
    }
    dispatch({ type: "hover", target: parseTarget(el.closest<HTMLElement>("[data-target]")?.dataset.target) });
  };
  const onClick = (e: React.MouseEvent) => {
    const el = e.target as Element;
    const button = el.closest<HTMLElement>("[data-target]");
    let t = parseTarget(button?.dataset.target);
    let trigger = button?.dataset.trigger ?? null;
    const zone = el.closest<HTMLElement>('[data-zone="strip"]');
    if (!t && zone && e.detail > 0) {
      t = tickAt(zone, e.nativeEvent.offsetY);
      trigger = t ? `tick:${t.id}` : null;
      // the tick's button takes focus without a ring, so Escape and the arrow keys work from here
      focusTrigger(trigger)?.focus({ preventScroll: true });
    }
    if (!t) {
      dispatch({ type: "reset" });
      return;
    }
    const touch = (e.nativeEvent as PointerEvent).pointerType === "touch";
    dispatch({ type: "pin", target: t, trigger, announce: sentence(t), dropHover: e.detail === 0 || touch || stacked });
  };
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Escape" || (!state.pinned && !state.hovered)) return;
    e.preventDefault();
    dispatch({ type: "reset" });
    focusTrigger(state.trigger ?? (e.target as HTMLElement).dataset?.trigger ?? null)?.focus();
  };
  const onFocus = (e: React.FocusEvent) => {
    if (stacked) return;
    const el = e.target as HTMLElement;
    if (!el.matches(":focus-visible")) return;
    const t = parseTarget(el.closest<HTMLElement>("[data-target]")?.dataset.target);
    if (t) dispatch({ type: "focus", target: t, announce: sentence(t) });
  };
  const onBlur = (e: React.FocusEvent) => {
    if (!stageRef.current?.contains(e.relatedTarget as Node | null)) dispatch({ type: "hover", target: null });
  };
  const onCell = useCallback(
    (tip: TipCell | null) => {
      dispatch({ type: "tip", tip });
      const find = tip ? (tip.area === "grid" ? model.grid : model.ohne)[tip.index]?.find : null;
      dispatch({ type: "hover", target: find && model.finds.has(find) ? { kind: "fund", id: find } : null });
    },
    [model],
  );
  const onPick = useCallback((nr: string) => {
    const t: Target = { kind: "fund", id: nr };
    dispatch({ type: "pin", target: t, trigger: `fund:${nr}`, announce: traceSentence(model, resolveTrace(model, t)), dropHover: false });
  }, [model]);
  const onUnfold = useCallback(() => dispatch({ type: "unfold" }), []);

  const reserve = useMemo(() => {
    if (!cols || cols.stacked) return 0;
    const finds = model.order.map((nr) => findDetail(model, nr)).filter((d): d is NonNullable<typeof d> => !!d);
    return Math.max(CFG.readout.lineH * 2, ...finds.map((d) => readoutHeight(d, cols.twin)));
  }, [model, cols]);
  const detail = trace?.target.kind === "fund" ? findDetail(model, trace.target.id) : null;
  const pinnedKey = targetKey(state.pinned);
  const fit = g.sizes?.fit ?? { cols: CFG.grid.minCols, pitch: 12, cell: 9, gap: 3, rows: 0, width: CFG.grid.minCols * 12 - 3, height: 0 };

  const traceAttr = trace ? (trace.dims ? "dim" : "peek") : undefined;
  const twin = (
    <TwinColumn
      model={model}
      fit={fit}
      stacked={stacked}
      nodesOn={nodesOn}
      onCell={onCell}
      onPick={onPick}
      readout={stacked ? null : <Readout detail={detail} sentence={trace && !detail ? traceSentence(model, trace) : null} reserve={reserve} />}
    />
  );
  const result = (
    <ResultColumn
      model={model}
      visible={g.sizes?.visible ?? null}
      stacked={stacked}
      narrow={!cols || cols.stacked || cols.out < 290}
      on={on}
      dims={!!trace?.dims}
      pinned={pinnedKey}
      onUnfold={onUnfold}
    />
  );
  const live = (
    <p className="sr-only" role="status" aria-live="polite">
      {state.announce}
    </p>
  );

  return (
    <>
      <ProjectHead view={view} projects={projects} />
      <div ref={wrapRef} className="relative flex-1">
        {stacked && cols?.stacked ? (
          <div
            ref={stageRef}
            className={cn("pt-2 pb-8 transition-opacity duration-150", !visible && "opacity-0")}
            style={{ paddingInline: cols.pad }}
            onClick={onClick}
          >
            <Step n={3} title="Ergebnis" id={`${ids}-3`} className="mt-2 mb-2.5" />
            <section aria-labelledby={`${ids}-3`}>{result}</section>
            <Step n={1} title="Ihre Daten" id={`${ids}-1`} className="mt-7 mb-2.5" />
            <section aria-labelledby={`${ids}-1`}>
              <EvidenceColumn model={model} strips={null} stacked stripWidth={Math.round((cols.width - 2 * cols.pad) * 0.48)} pinnedTick={null} pinnedGroup={state.pinned?.kind === "gruppe" ? state.pinned.id : null} />
            </section>
            <Step n={2} title="Digitaler Zwilling" id={`${ids}-2`} className="mt-7 mb-2.5" />
            <section aria-labelledby={`${ids}-2`}>{twin}</section>
            {live}
          </div>
        ) : (
          <div
            ref={stageRef}
            data-enter={phase === "run" ? "run" : undefined}
            data-trace={traceAttr}
            className={cn("relative grid transition-opacity duration-150 motion-reduce:transition-none", !visible && "opacity-0")}
            style={{
              minHeight: g.availH || undefined,
              gridTemplateColumns: cols && !cols.stacked ? gridTemplate(cols) : "44px 220px 40px 360px 40px 280px",
              // spare height goes one third above, two thirds below: optically centred
              gridTemplateRows: `0px ${CFG.stepsH}px auto minmax(0,1fr)`,
              padding: `${CFG.pad.top}px ${cols && !cols.stacked ? cols.pad : CFG.pad.x}px ${CFG.pad.bottom}px`,
            }}
            onPointerMove={onPointerMove}
            onPointerLeave={() => {
              dispatch({ type: "hover", target: null });
              dispatch({ type: "tip", tip: null });
            }}
            onClick={onClick}
            onKeyDown={onKeyDown}
            onFocus={onFocus}
            onBlur={onBlur}
          >
            {g.geo && <BaseLines model={model} geo={g.geo} />}
            {g.geo && <TraceLayer geo={g.geo} layerRef={layerRef} sweepRef={sweepRef} sweepId={sweepId} />}
            <Step n={1} title="Ihre Daten" id={`${ids}-1`} column="1 / 4" chevron />
            <Step n={2} title="Digitaler Zwilling" id={`${ids}-2`} column="4 / 6" chevron />
            <Step n={3} title="Ergebnis" id={`${ids}-3`} column="6 / 7" />
            <section aria-labelledby={`${ids}-1`} className="relative min-w-0 self-start" style={{ gridColumn: "1 / 3", gridRow: 3 }}>
              <EvidenceColumn model={model} strips={g.sizes?.strips ?? null} stacked={false} stripWidth={0} pinnedTick={state.pinned?.kind === "tick" ? state.pinned.id : null} pinnedGroup={null} />
            </section>
            <section aria-labelledby={`${ids}-2`} className="relative min-w-0 self-start" style={{ gridColumn: "4 / 5", gridRow: 3 }}>
              {twin}
            </section>
            <section aria-labelledby={`${ids}-3`} className="relative min-w-0 self-start" style={{ gridColumn: "6 / 7", gridRow: 3 }}>
              {result}
            </section>
            {g.geo && <Cards model={model} geo={g.geo} trace={trace} plan={plan} narrow={narrowCards} traceKey={key} />}
            {g.geo && state.tip && <CellTip model={model} geo={g.geo} tip={state.tip} />}
            {live}
          </div>
        )}
      </div>
      <TraceSheet
        model={model}
        trace={stacked ? trace : null}
        onClose={() => dispatch({ type: "reset" })}
        onPick={onPick}
        finalFocus={() => focusTrigger(state.trigger)}
      />
    </>
  );
}

