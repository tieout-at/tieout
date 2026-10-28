"use client";

import { ChevronDown, Hand, LayoutGrid, MousePointer2, Search, ShieldCheck, Undo2, Zap } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import type { FlowRun, FlowView } from "@/lib/flows";
import { cn } from "@/lib/utils";
import { blockShadow, bounds, CHECK_H, dragTo, edge, GROUP, GROUP_W, H, moves, NO_MOVES, place, W, type Guide, type Moves, type Offsets, type Point } from "./flow-geometry";
import { Chip, Dot, ResultLine, type NodeState } from "./parts";

const PANEL = 424;

type Box = { x: number; y: number; k: number };

function fit(view: FlowView, moved: Offsets, width: number, height: number, panel: boolean): Box {
  const b = bounds(view, moved);
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
  // blocks moved with the hand (decided by Maxi S.: the pointer only selects), with the steps to undo them; only in this
  // browser view, back on reload. The block moved last lies on top, as in Attio.
  const [hist, setHist] = useState<{ slug: string; m: Moves; top?: string }>({ slug: view.slug, m: NO_MOVES });
  const m = hist.slug === view.slug ? hist.m : NO_MOVES;
  const moved = m.by;
  const top = (id: string) => (hist.slug === view.slug && hist.top === id ? 1 : undefined);
  const act = useCallback(
    (a: Parameters<typeof moves>[1], top?: string) => setHist((h) => ({ slug: view.slug, m: moves(h.slug === view.slug ? h.m : NO_MOVES, a), top: top ?? (h.slug === view.slug ? h.top : undefined) })),
    [view.slug],
  );
  const [guides, setGuides] = useState<Guide[]>([]);
  const drag = useRef<
    | { kind: "pan"; x: number; y: number; bx: number; by: number; moved: boolean }
    | { kind: "block"; id: string; x: number; y: number; from: Point; base: Offsets; k: number; moved: boolean }
    | null
  >(null);
  // a drag that moved a block ends without the click that would select it
  const dragged = useRef(false);

  // the view fits the Ablauf when it opens and when the canvas changes size; opening the panel, a live recompute or a
  // new run keep the user's zoom and pan
  const latest = useRef({ view, panel, moved });
  useLayoutEffect(() => {
    latest.current = { view, panel, moved };
  });
  const fitNow = useCallback(() => {
    const el = area.current;
    if (el && el.clientWidth) setBox(fit(latest.current.view, latest.current.moved, el.clientWidth, el.clientHeight, latest.current.panel));
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
  // Strg Z (⌘ Z on a Mac) undoes a move, Strg Umschalt Z or Strg Y redoes it; not while typing or in a menu
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      const t = e.target instanceof HTMLElement ? e.target : null;
      const k = e.key.toLowerCase();
      if (!(e.ctrlKey || e.metaKey) || e.altKey || (k !== "z" && k !== "y") || e.defaultPrevented) return;
      if (t?.closest("input, textarea, select, [contenteditable], [role=dialog], [role=menu], [role=listbox]")) return;
      if (!area.current?.offsetParent) return;
      e.preventDefault();
      // not in the middle of a drag: its step back is only complete once the block is let go
      if (drag.current) return;
      act({ type: k === "y" || e.shiftKey ? "redo" : "undo" });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [act]);

  // with the hand, a block (or the card of the checks) follows the pointer once it moved 3 px and snaps to straight
  // edges; a shorter press stays a click that selects it. With the pointer a block is only selected. The empty canvas
  // pans with either tool.
  const onPointerDown = (e: React.PointerEvent) => {
    if (!box || e.button !== 0) return;
    dragged.current = false;
    const block = (e.target as HTMLElement).closest<HTMLElement>("[data-move]");
    if (block?.dataset.move) {
      if (tool !== "hand") return;
      // no capture yet: the press may still be a click on the block
      drag.current = { kind: "block", id: block.dataset.move, x: e.clientX, y: e.clientY, from: moved[block.dataset.move] ?? { x: 0, y: 0 }, base: moved, k: box.k, moved: false };
      return;
    }
    drag.current = { kind: "pan", x: e.clientX, y: e.clientY, bx: box.x, by: box.y, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const endDrag = () => {
    drag.current = null;
    setGuides((g) => (g.length ? [] : g));
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!e.buttons) return endDrag();
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (!d.moved && Math.abs(dx) + Math.abs(dy) > 3) {
      d.moved = true;
      if (d.kind === "block") {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        // the arrangement before this drag becomes one step back
        act({ type: "begin" });
      }
    }
    if (d.kind === "pan") setBox((b) => (b ? { ...b, x: d.bx + dx, y: d.by + dy } : b));
    else if (d.moved) {
      const r = dragTo(view, d.base, d.id, d.from, dx, dy, d.k);
      act({ type: "set", by: r.moved }, d.id);
      setGuides(r.guides);
    }
  };
  const onPointerUp = () => {
    const d = drag.current;
    endDrag();
    if (!d) return;
    if (d.kind === "block") {
      dragged.current = d.moved;
      // the click after a drag lands on the canvas or on the block, depending on the browser: ignore it either way
      if (d.moved) setTimeout(() => (dragged.current = false));
    } else if (!d.moved && tool === "pointer") onSelect(null);
  };
  const pick = (id: string) => {
    if (dragged.current) return;
    onSelect(selected === id ? null : id);
  };

  // a block reached with Tab comes into view: the canvas pans instead of the browser scrolling the clipped area
  const onFocus = (e: React.FocusEvent) => {
    const el = area.current;
    const t = e.target;
    if (!el || !(t instanceof HTMLElement) || !t.closest("[data-block]") || !t.matches(":focus-visible")) return;
    el.scrollLeft = 0;
    el.scrollTop = 0;
    const r = t.getBoundingClientRect();
    const a = el.getBoundingClientRect();
    const right = a.right - (panel ? PANEL : 0) - 16;
    const bottom = a.bottom - 72;
    const dx = r.left < a.left + 16 ? a.left + 16 - r.left : r.right > right ? right - r.right : 0;
    const dy = r.top < a.top + 16 ? a.top + 16 - r.top : r.bottom > bottom ? bottom - r.bottom : 0;
    if (dx || dy) setBox((b) => (b ? { ...b, x: b.x + dx, y: b.y + dy } : b));
  };

  const pos = (id: string) => place(view, id, moved);
  const lit = (id: string) => states[id] === "done" || states[id] === "run";
  const side = (id: string) => view.nodes.find((n) => n.id === id)?.side;
  const group = view.checksAt ? pos(GROUP) : null;
  const hand = tool === "hand";

  return (
    <div
      ref={area}
      id="ablauf-flaeche"
      role="group"
      aria-label="Arbeitsfläche"
      className={cn("relative min-h-0 flex-1 touch-none overflow-hidden bg-surface select-none", hand ? "cursor-grab active:cursor-grabbing" : "cursor-default")}
      style={{ backgroundImage: "radial-gradient(rgb(0 0 0 / 0.16) 0.6px, transparent 0.8px)", backgroundSize: `${10 * (box?.k ?? 1)}px ${10 * (box?.k ?? 1)}px`, backgroundPosition: box ? `${box.x}px ${box.y}px` : undefined }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      onFocus={onFocus}
    >
      {box && (
        <div className="absolute top-0 left-0 origin-top-left" style={{ transform: `translate(${box.x}px, ${box.y}px) scale(${box.k})` }}>
          <svg className="absolute top-0 left-0 overflow-visible" width="1" height="1" aria-hidden>
            {view.edges.map((e) => {
              const on = lit(e.to);
              const { line, head } = edge(pos(e.from), pos(e.to), side(e.from) === side(e.to) ? "down" : "left");
              return (
                <g key={`${e.from}-${e.to}`} className={cn("fill-none transition-[stroke] duration-300 motion-reduce:transition-none", on ? "stroke-accent" : "stroke-[#d9dade]")} strokeWidth={on ? 1.6 : 1.2}>
                  <path d={line} />
                  <path d={head} />
                  {states[e.to] === "run" && <path className="animate-[flow-sweep_0.9s_ease-in-out_infinite] stroke-sweep motion-reduce:animate-none" strokeWidth={3} strokeLinecap="round" strokeDasharray="10 400" d={line} />}
                </g>
              );
            })}
            {view.checksAt && group && (
              <g className={cn("fill-none transition-[stroke] duration-300", lit(GROUP) ? "stroke-accent" : "stroke-[#d9dade]")} strokeWidth={lit(GROUP) ? 1.6 : 1.2}>
                {Object.values(edge(pos(view.checksAt), group, "right")).map((d) => (
                  <path key={d} d={d} />
                ))}
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
                data-move={n.id}
                aria-pressed={selected === n.id}
                title={selected === n.id ? undefined : "Details zeigen"}
                aria-label={`${n.title}: ${state === "run" ? "läuft" : result && state !== "wait" ? result.text : n.does}`}
                tabIndex={0}
                onClick={() => pick(n.id)}
                className={cn(
                  "absolute flex flex-col rounded-[14px] bg-surface pt-1.5 pb-1.5 text-left outline-none transition-[box-shadow,background-color,opacity] duration-200 hover:bg-fill-selected focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none",
                  blockShadow(selected === n.id, state === "run"),
                  hand && "cursor-grab active:cursor-grabbing",
                  selected === n.id && "bg-fill-selected",
                  dim && "[&>span]:opacity-50",
                )}
                style={{ left: p.x, top: p.y, width: W, height: H, zIndex: top(n.id) }}
              >
                {n.kind === "ausloeser" && (
                  <span className="absolute -top-[26px] left-0 flex h-5 items-center gap-1 rounded-[6px] bg-fg px-1.5 text-xs font-medium text-white">
                    <Zap className="size-3 fill-current" aria-hidden />
                    Auslöser: startet den Ablauf
                  </span>
                )}
                <span className="flex h-7 items-center gap-1.5 px-2.5 pt-1">
                  <Chip icon={n.icon} className={n.kind === "ausloeser" ? "bg-fg text-white shadow-none" : undefined} />
                  <span className={cn("truncate font-medium", n.title.length > 20 ? "text-[13px]" : "text-sm")}>{n.title}</span>
                </span>
                <ResultLine node={n} result={result} state={state} className="px-3 pt-1.5 text-xs leading-4 font-medium" />
              </button>
            );
          })}

          {group && run?.checks && (
            <div
              data-move={GROUP}
              className={cn("absolute rounded-[14px] bg-surface p-1.5 shadow-button transition-opacity duration-200", hand && "cursor-grab active:cursor-grabbing", states.pruefungen === "wait" && "[&>*]:opacity-50")}
              style={{ left: group.x, top: group.y, width: GROUP_W, zIndex: top(GROUP) }}
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
                        onClick={() => pick(`pruefung:${c.id}`)}
                        className={cn(
                          "flex w-full items-center gap-2 rounded-md px-1.5 text-left text-[13px] outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent",
                          hand && "cursor-grab active:cursor-grabbing",
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

          {guides.length > 0 && (
            <svg className="pointer-events-none absolute top-0 left-0 z-[2] overflow-visible stroke-accent" width="1" height="1" aria-hidden>
              {guides.map((g) => (
                <line key={`${g.x1} ${g.y1} ${g.x2} ${g.y2}`} {...g} strokeWidth={1} strokeDasharray="4 3" vectorEffect="non-scaling-stroke" />
              ))}
            </svg>
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
          <DropdownMenuTrigger className="flex h-7 items-center gap-1.5 rounded-md bg-surface px-1.5 text-sm font-medium tabular-nums shadow-button outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent" aria-label="Zoom">
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
            {Object.keys(moved).length > 0 && <DropdownMenuItem onClick={() => act({ type: "reset" })}>Blöcke zurücksetzen</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
        <button type="button" aria-label="Verschieben" aria-pressed={tool === "hand"} onClick={() => setTool("hand")} className={cn("flex size-7 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent", tool === "hand" ? "bg-fg text-white" : "text-fg-secondary hover:bg-fill-hover")}>
          <Hand className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Auswählen" aria-pressed={tool === "pointer"} onClick={() => setTool("pointer")} className={cn("flex size-7 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent", tool === "pointer" ? "bg-fg text-white" : "text-fg-secondary hover:bg-fill-hover")}>
          <MousePointer2 className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Rückgängig" title="Rückgängig (Strg Z)" disabled={!m.past.length} onClick={() => act({ type: "undo" })} className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent disabled:text-fg-faint disabled:hover:bg-transparent">
          <Undo2 className="size-4" aria-hidden />
        </button>
        {!readonly && (
          <button type="button" onClick={onPalette} className="flex h-7 items-center gap-1.5 rounded-md bg-surface pr-1.5 pl-1.5 text-sm font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-accent">
            <LayoutGrid className="size-4 text-fg-secondary" aria-hidden />
            Bausteine
            <Kbd>B</Kbd>
          </button>
        )}
      </div>
    </div>
  );
}
