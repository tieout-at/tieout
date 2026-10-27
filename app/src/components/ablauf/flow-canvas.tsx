"use client";

import { ChevronDown, Hand, LayoutGrid, MousePointer2, Search, ShieldCheck, Zap } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import type { FlowRun, FlowView } from "@/lib/flows";
import { cn } from "@/lib/utils";
import { Chip, Dot, ResultLine, type NodeState } from "./parts";

// Attio's Workflows canvas, measured in Maxi S.'s workspace on 27.10.2026: blocks 200 × 70, radius 14, the button shadow;
// grid of dots every 10 px at 14 % on #fbfbfb; edges 1.2 px #d9dade; handles 12 px. Laid out top to bottom (decided
// with Maxi S.): 7 steps and 8 checks do not fit side by side next to the 400 px panel at a readable zoom.
export const W = 220;
export const H = 70;
const ROW = 112;
const LEFT = -290;
const GROUP_X = 290;
const GROUP_W = 310;
const CHECK_H = 34;
const PANEL = 424;

type Box = { x: number; y: number; k: number };

function bounds(view: FlowView) {
  const rows = Math.max(...view.nodes.map((n) => n.row));
  const at = view.nodes.find((n) => n.id === view.checksAt);
  const groupBottom = at ? at.row * ROW - 4 + 46 + 8 * CHECK_H : 0;
  return {
    minX: view.nodes.some((n) => n.side === "left") ? LEFT : 0,
    maxX: at ? GROUP_X + GROUP_W : W,
    minY: -32,
    maxY: Math.max(rows * ROW + H, groupBottom),
  };
}

function fit(view: FlowView, width: number, height: number, panel: boolean): Box {
  const b = bounds(view);
  const free = width - (panel ? PANEL : 0);
  const k = Math.min(1, (free - 64) / (b.maxX - b.minX), (height - 96) / (b.maxY - b.minY));
  const kk = Math.max(0.5, Math.round(k * 100) / 100);
  return { k: kk, x: (free - (b.maxX - b.minX) * kk) / 2 - b.minX * kk, y: 28 - b.minY * kk + Math.max(0, (height - 96 - (b.maxY - b.minY) * kk) / 2) };
}

export function FlowCanvas({
  view,
  run,
  states,
  selected,
  onSelect,
  panel,
  readonly,
  onPalette,
  children,
}: {
  view: FlowView;
  run: FlowRun | null;
  /** Per block (and "pruefungen") its state; "idle" outside a played run. */
  states: Record<string, NodeState>;
  selected: string | null;
  onSelect: (id: string | null) => void;
  /** The panel floats over the right of the canvas; the view keeps its room. */
  panel: boolean;
  readonly: boolean;
  onPalette: () => void;
  children?: React.ReactNode;
}) {
  const area = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<Box | null>(null);
  const [tool, setTool] = useState<"pointer" | "hand">("pointer");
  const drag = useRef<{ x: number; y: number; bx: number; by: number; moved: boolean } | null>(null);

  // the view fits the Ablauf when it opens and when the canvas changes size; opening the panel, a live recompute or a
  // new run keep the user's zoom and pan
  const latest = useRef({ view, panel });
  useLayoutEffect(() => {
    latest.current = { view, panel };
  });
  const fitNow = useCallback(() => {
    const el = area.current;
    if (el && el.clientWidth) setBox(fit(latest.current.view, el.clientWidth, el.clientHeight, latest.current.panel));
  }, []);

  useLayoutEffect(() => {
    fitNow();
    const el = area.current;
    if (!el) return;
    const ro = new ResizeObserver(fitNow);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitNow, view.slug]);

  /** Zoom to `k`, or by `factor` from the current zoom, around the centre of the free canvas. */
  const zoomTo = useCallback((k: number | null, factor = 1) => {
    const el = area.current;
    setBox((b) => {
      if (!b || !el) return b;
      const nk = Math.min(1.5, Math.max(0.5, (k ?? b.k) * factor));
      const cx = (el.clientWidth - (panel ? PANEL : 0)) / 2;
      const cy = el.clientHeight / 2;
      return { k: nk, x: cx - ((cx - b.x) / b.k) * nk, y: cy - ((cy - b.y) / b.k) * nk };
    });
  }, [panel]);

  // B opens the building blocks, as Attio's "Add block": only while the canvas is shown and editable, not while typing
  // or in a menu
  useEffect(() => {
    if (readonly) return;
    const key = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      if (e.key.toLowerCase() !== "b" || e.repeat || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
      if (t?.closest("input, textarea, select, [contenteditable], [role=dialog], [role=menu], [role=listbox]")) return;
      if (!area.current?.offsetParent) return;
      onPalette();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [onPalette, readonly]);

  // the wheel pans and Ctrl with the wheel (or a pinch) zooms the canvas, never the page; not over the panel or toolbar
  useEffect(() => {
    const el = area.current;
    if (!el) return;
    const wheel = (e: WheelEvent) => {
      if (e.target instanceof Element && e.target.closest("[data-no-pan]")) return;
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) zoomTo(null, e.deltaY > 0 ? 0.9 : 1.1);
      else setBox((b) => (b ? { ...b, x: b.x - e.deltaX, y: b.y - e.deltaY } : b));
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => el.removeEventListener("wheel", wheel);
  }, [zoomTo]);
  const onPointerDown = (e: React.PointerEvent) => {
    if (!box || e.button !== 0) return;
    const onBlock = (e.target as HTMLElement).closest("[data-block]");
    if (onBlock && tool === "pointer") return;
    drag.current = { x: e.clientX, y: e.clientY, bx: box.x, by: box.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const endDrag = () => {
    drag.current = null;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!e.buttons) return endDrag();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    setBox((b) => (b ? { ...b, x: d.bx + dx, y: d.by + dy } : b));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved && tool === "pointer") onSelect(null);
  };

  const node = (id: string) => view.nodes.find((n) => n.id === id)!;
  const pos = (id: string) => {
    const n = node(id);
    return { x: n.side === "left" ? LEFT : 0, y: n.row * ROW };
  };
  const lit = (id: string) => states[id] === "done" || states[id] === "run";
  const at = view.checksAt ? node(view.checksAt) : null;

  return (
    <div
      ref={area}
      id="ablauf-flaeche"
      role="group"
      aria-label="Arbeitsfläche"
      className={cn("relative min-h-0 flex-1 touch-none overflow-hidden bg-surface select-none", tool === "hand" ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
      style={{ backgroundImage: "radial-gradient(rgb(0 0 0 / 0.16) 0.6px, transparent 0.8px)", backgroundSize: `${10 * (box?.k ?? 1)}px ${10 * (box?.k ?? 1)}px`, backgroundPosition: box ? `${box.x}px ${box.y}px` : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
    >
      {box && (
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${box.x}px, ${box.y}px) scale(${box.k})` }}>
          <svg className="absolute top-0 left-0 overflow-visible" width="1" height="1" aria-hidden>
            {view.edges.map((e) => {
              const a = pos(e.from);
              const b = pos(e.to);
              const on = lit(e.to);
              const cls = cn("fill-none transition-[stroke] duration-300 motion-reduce:transition-none", on ? "stroke-accent" : "stroke-[#d9dade]");
              if (a.x === b.x)
                return (
                  <g key={`${e.from}-${e.to}`} className={cls} strokeWidth={on ? 1.6 : 1.2}>
                    <path d={`M${a.x + W / 2} ${a.y + H} V${b.y - 1}`} />
                    <path d={`M${a.x + W / 2 - 5} ${b.y - 6} l5 5 5-5`} />
                    {states[e.to] === "run" && <path className="animate-[flow-sweep_0.9s_ease-in-out_infinite] stroke-sweep motion-reduce:animate-none" strokeWidth={3} strokeLinecap="round" strokeDasharray="10 400" d={`M${a.x + W / 2} ${a.y + H} V${b.y - 1}`} />}
                  </g>
                );
              const y = a.y + H / 2;
              return (
                <g key={`${e.from}-${e.to}`} className={cls} strokeWidth={on ? 1.6 : 1.2}>
                  <path d={`M${a.x} ${y} H${b.x + W + 1}`} />
                  <path d={`M${b.x + W + 6} ${y - 5} l-5 5 5 5`} />
                </g>
              );
            })}
            {at && (
              <g className={cn("fill-none transition-[stroke] duration-300", lit("pruefungen") ? "stroke-accent" : "stroke-[#d9dade]")} strokeWidth={lit("pruefungen") ? 1.6 : 1.2}>
                <path d={`M${W} ${at.row * ROW + H / 2} H${GROUP_X - 1}`} />
                <path d={`M${GROUP_X - 6} ${at.row * ROW + H / 2 - 5} l5 5 -5 5`} />
              </g>
            )}
          </svg>

          {view.nodes.map((n) => {
            const p = pos(n.id);
            const state = states[n.id] ?? "idle";
            const result = run?.results[n.id];
            const dim = state === "wait" || (state !== "run" && result && !result.ran);
            return (
              <button
                key={n.id}
                type="button"
                data-block
                aria-pressed={selected === n.id}
                aria-label={`${n.title}: ${state === "run" ? "läuft" : result && state !== "wait" ? result.text : n.does}`}
                tabIndex={0}
                onClick={() => onSelect(selected === n.id ? null : n.id)}
                className={cn(
                  "absolute flex flex-col rounded-[14px] bg-surface pt-1.5 pb-1.5 text-left shadow-button outline-none transition-[box-shadow,background-color,opacity] duration-200 hover:bg-fill-selected focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
                  tool === "hand" && "pointer-events-none",
                  selected === n.id && "bg-fill-selected shadow-[inset_0_0_0_1px_var(--color-accent),0_0_2px_0_rgb(28_40_64/0.18),0_1px_3px_0_rgb(0_0_0/0.04)]",
                  state === "run" && "shadow-[inset_0_0_0_1.5px_var(--color-accent),0_0_0_4px_rgb(29_59_255/0.1)]",
                  dim && "[&>span]:opacity-50",
                )}
                style={{ left: p.x, top: p.y, width: W, height: H }}
              >
                {n.kind === "ausloeser" && (
                  <span className="absolute -top-[26px] left-0 flex h-5 items-center gap-1 rounded-[6px] bg-fg px-1.5 text-xs font-medium text-white">
                    <Zap className="size-3 fill-current" aria-hidden />
                    Auslöser: startet den Ablauf
                  </span>
                )}
                <span className="flex h-7 items-center gap-1.5 px-2.5 pt-1">
                  <Chip icon={n.icon} className={n.kind === "ausloeser" ? "bg-fg text-white shadow-none" : undefined} />
                  <span className={cn("truncate font-medium", n.title.length > 20 ? "text-[13px]" : "text-sm")} title={n.title}>{n.title}</span>
                </span>
                <ResultLine node={n} result={result} state={state} className="px-3 pt-1.5 text-xs leading-4 font-medium" />
              </button>
            );
          })}

          {at && run?.checks && (
            <div
              className={cn("absolute rounded-[14px] bg-surface p-1.5 shadow-button transition-opacity duration-200", states.pruefungen === "wait" && "[&>*]:opacity-50")}
              style={{ left: GROUP_X, top: at.row * ROW - 4, width: GROUP_W }}
            >
              <div className="flex h-[30px] items-center gap-1.5 px-1 text-sm font-medium">
                <span className="flex size-6 items-center justify-center rounded-[7px] bg-fill-hover text-fg-secondary shadow-ring">
                  <ShieldCheck className="size-4" aria-hidden />
                </span>
                Prüfungen
                <span className="ml-auto text-xs font-medium text-fg-muted">{run.checks.length} aktiv</span>
              </div>
              <ul>
                {run.checks.map((c, i) => {
                  const shown = states.pruefungen === "done" || states.pruefungen === "idle" || (states.pruefungen === "run" && i < 3);
                  return (
                    <li key={c.id}>
                      <button
                        type="button"
                        data-block
                        tabIndex={0}
                        aria-pressed={selected === `pruefung:${c.id}`}
                        onClick={() => onSelect(selected === `pruefung:${c.id}` ? null : `pruefung:${c.id}`)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-1.5 text-left text-[13px] outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent",
                          tool === "hand" && "pointer-events-none",
                          selected === `pruefung:${c.id}` && "bg-fill-selected shadow-[inset_0_0_0_1px_var(--color-accent)]",
                        )}
                        style={{ height: CHECK_H }}
                      >
                        <span className={cn("min-w-0 flex-1 truncate", shown && c.hits === 0 && "text-fg-muted")}>{c.title}</span>
                        {shown && (
                          <span className={cn("flex shrink-0 items-center gap-1.5 text-xs font-medium", c.hits ? "text-fg-secondary" : "text-fg-muted")}>
                            {c.threat > 0 && <Dot tone="red" />}
                            {c.hits === 0 ? "kein Treffer" : c.threat ? `${c.threat} droht` : `${c.hits} ${c.hits === 1 ? "Treffer" : "Treffer"}`}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {children}

      <div
        className="absolute bottom-3.5 flex h-11 -translate-x-1/2 items-center gap-2 rounded-xl bg-surface p-2 shadow-[0_0_0_1px_rgb(28_40_64/0.04),0_4px_8px_-4px_rgb(28_40_64/0.12),0_4px_12px_-2px_rgb(24_41_75/0.16)]"
        style={{ left: `calc((100% - ${panel ? PANEL : 0}px) / 2)` }}
        onPointerDown={(e) => e.stopPropagation()}
        data-no-pan
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 items-center gap-1.5 rounded-md bg-surface px-1.5 text-sm font-medium tabular-nums shadow-button outline-none focus-visible:outline-2 focus-visible:outline-accent" aria-label="Zoom">
            <Search className="size-4 text-fg-secondary" aria-hidden />
            {Math.round((box?.k ?? 1) * 100)} %
            <ChevronDown className="size-4 text-fg-secondary" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" className="min-w-44">
            <DropdownMenuItem onClick={() => zoomTo(null, 1.2)}>Vergrößern</DropdownMenuItem>
            <DropdownMenuItem onClick={() => zoomTo(null, 1 / 1.2)}>Verkleinern</DropdownMenuItem>
            <DropdownMenuItem onClick={() => zoomTo(0.5)}>Auf 50 %</DropdownMenuItem>
            <DropdownMenuItem onClick={() => zoomTo(1)}>Auf 100 %</DropdownMenuItem>
            <DropdownMenuItem onClick={fitNow}>Ganz anzeigen</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" aria-label="Verschieben" aria-pressed={tool === "hand"} onClick={() => setTool("hand")} className={cn("flex size-7 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-accent", tool === "hand" ? "bg-fg text-white" : "text-fg-secondary hover:bg-fill-hover")}>
          <Hand className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Auswählen" aria-pressed={tool === "pointer"} onClick={() => setTool("pointer")} className={cn("flex size-7 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-accent", tool === "pointer" ? "bg-fg text-white" : "text-fg-secondary hover:bg-fill-hover")}>
          <MousePointer2 className="size-4" aria-hidden />
        </button>
        {!readonly && (
          <button type="button" onClick={onPalette} className="flex h-7 items-center gap-1.5 rounded-md bg-surface pr-1.5 pl-1.5 text-sm font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent">
            <LayoutGrid className="size-4 text-fg-secondary" aria-hidden />
            Bausteine
            <Kbd>B</Kbd>
          </button>
        )}
      </div>
    </div>
  );
}
