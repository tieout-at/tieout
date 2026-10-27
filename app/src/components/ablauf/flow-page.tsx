"use client";

import { ChevronDown, ChevronRight, List, Play, ShieldCheck, Square, Workflow } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { UnderlineTabs } from "@/components/shell/underline-tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InfoTip } from "@/components/ui/info-tip";
import { SideWindow } from "@/components/ui/side-window";
import { useMediaQuery } from "@/components/ui/use-media";
import type { FlowView } from "@/lib/flows";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";
import { FlowCanvas } from "./flow-canvas";
import { AblaufInfo, BlockDetail, Palette, RunList } from "./flow-panel";
import { Chip, playOrder, ResultLine, runLabel, type NodeState } from "./parts";

const STEP_MS = 650;

/** Plays a run: each block in turn runs, then shows what it produced. Without motion the run ends at once. */
function usePlay(order: string[]) {
  const [at, setAt] = useState<number | null>(null);
  const [still, setStill] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setAt(null);
  }, []);
  const play = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setAt(null);
      return setStill((n) => n + 1);
    }
    setAt(0);
    timer.current = setInterval(() => {
      setAt((i) => {
        if (i === null || i + 1 >= order.length) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          return null;
        }
        return i + 1;
      });
    }, STEP_MS);
  }, [order.length]);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);
  const states = useMemo(() => {
    const s: Record<string, NodeState> = {};
    order.forEach((id, i) => (s[id] = at === null ? "idle" : i < at ? "done" : i === at ? "run" : "wait"));
    return s;
  }, [order, at]);
  return { playing: at !== null, still, states, play, stop };
}

export function FlowPage({ built }: { built: FlowView }) {
  const live = useLive();
  const view = live?.flowView(built.slug) ?? built;
  const [tab, setTab] = useState<"ablauf" | "laeufe">("ablauf");
  const [runId, setRunId] = useState<string | null>(built.runs[0]?.id ?? null);
  const [selected, setSelected] = useState<string | null>(null);
  const [panel, setPanel] = useState<"open" | "palette" | "closed">("open");
  const [sheet, setSheet] = useState<string | null>(null);
  const run = view.runs.find((r) => r.id === runId) ?? view.runs[0] ?? null;
  const order = useMemo(() => playOrder(view.nodes, view.checksAt), [view.nodes, view.checksAt]);
  const { playing, still, states, play, stop } = usePlay(order);
  const wide = useMediaQuery("(min-width: 1024px)", true);
  // a sheet opened on a narrow screen stays closed once the canvas with its own panel takes over
  const sheetOpen = sheet !== null && !wide;

  const pickRun = (id: string) => {
    stop();
    setRunId(id);
  };
  const select = (id: string | null) => {
    setSelected(id);
    if (!id) return;
    setPanel("open");
    // on "Läufe" the panel holds the runs: a block opens its details on "Ablauf", for the chosen run
    setTab("ablauf");
  };
  const openPalette = useCallback(() => {
    setSelected(null);
    setPanel("palette");
    setTab("ablauf");
  }, []);
  const close = () => setPanel("closed");

  const panelBody =
    tab === "laeufe" ? (
      <RunList view={view} runId={run?.id ?? null} playing={playing} onPick={pickRun} onClose={close} />
    ) : panel === "palette" ? (
      <Palette view={view} onBack={() => setPanel("open")} onClose={close} />
    ) : selected ? (
      <BlockDetail view={view} run={run} id={selected} onBack={() => setSelected(null)} onClose={close} />
    ) : (
      <AblaufInfo view={view} run={run} onClose={close} />
    );

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center gap-2 pr-3 shadow-line-bottom max-lg:flex-col max-lg:items-stretch max-lg:pr-0">
        <UnderlineTabs
          label="Ansicht des Ablaufs"
          className="min-w-0 flex-1 px-3"
          groups={[
            {
              items: [
                { key: "ablauf", title: "Ablauf", icon: Workflow, active: tab === "ablauf", controls: "ablauf-inhalt", onSelect: () => setTab("ablauf") },
                { key: "laeufe", title: "Läufe", icon: List, count: view.runs.length, active: tab === "laeufe", controls: "ablauf-inhalt", onSelect: () => { setTab("laeufe"); setPanel("open"); } },
              ],
            },
          ]}
        />
        <div className="flex items-center gap-2 max-lg:px-4 max-lg:pb-3">
          {view.runs.length === 1 && run && <span className="min-w-0 truncate text-sm text-fg-secondary max-lg:hidden">{runLabel(run)}</span>}
          {view.runs.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-surface py-1 pr-1.5 pl-2 text-sm font-medium shadow-button outline-none focus-visible:outline-2 focus-visible:outline-accent max-lg:h-8 max-lg:flex-1 max-lg:justify-between">
                <span className="truncate">{run ? runLabel(run) : "Lauf wählen"}</span>
                <ChevronDown className="size-4 shrink-0 text-fg-secondary" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="max-w-[min(360px,calc(100vw-32px))]">
                {view.runs.map((r) => (
                  <DropdownMenuItem key={r.id} onClick={() => pickRun(r.id)} className={cn(r.id === run?.id && "bg-fill-selected")}>
                    <span className="truncate">{runLabel(r)}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span className="flex shrink-0 items-center gap-1.5 text-sm text-fg-secondary max-lg:hidden">
            An
            <span aria-hidden className="relative h-4 w-7 rounded-full bg-fg opacity-50 after:absolute after:top-0.5 after:right-0.5 after:size-3 after:rounded-full after:bg-surface" />
            <InfoTip label="Ein und aus">Dieser Ablauf ist eingeschaltet. Selbst ein- und ausschalten kommt mit der Anmeldung.</InfoTip>
          </span>
          <button
            type="button"
            disabled={!run}
            onClick={() => (playing ? stop() : play())}
            className="flex h-7 shrink-0 items-center gap-1.5 rounded-md bg-accent py-1 pr-2 pl-1.5 text-sm font-medium text-white shadow-primary outline-none hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50 max-lg:h-8"
          >
            {playing ? <Square className="size-3.5" aria-hidden /> : <Play className="size-4" aria-hidden />}
            {playing ? "Anhalten" : "Lauf abspielen"}
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">
        {playing ? "Der Lauf spielt." : still ? `Lauf gezeigt: ${run ? run.summary : ""}` : ""}
      </p>

      {/* desktop: Attio's canvas with its floating panel */}
      <div id="ablauf-inhalt" role="tabpanel" className="hidden min-h-0 flex-1 flex-col lg:flex">
        <FlowCanvas view={view} run={run} states={states} selected={selected} onSelect={select} panel={panel !== "closed"} readonly={tab === "laeufe"} onPalette={openPalette}>
          {panel !== "closed" && (
            <aside aria-label="Einstellungen des Blocks" data-no-pan className="absolute top-3 right-3 bottom-3 flex w-[400px] flex-col overflow-y-auto rounded-2xl bg-surface shadow-button" onPointerDown={(e) => e.stopPropagation()}>
              {panelBody}
            </aside>
          )}
        </FlowCanvas>
      </div>

      {/* phones and tablets: the blocks as one column, each opens its details from the bottom */}
      <div className="min-h-0 flex-1 overflow-y-auto lg:hidden">
        {tab === "laeufe" ? (
          <RunList view={view} runId={run?.id ?? null} playing={playing} onPick={(id) => { pickRun(id); setTab("ablauf"); }} />
        ) : (
          <ol className="px-4 pt-4 pb-6">
            {order.map((id, i) => {
              const n = view.nodes.find((x) => x.id === id);
              const state = states[id] ?? "idle";
              const last = i === order.length - 1;
              const checks = id === "pruefungen" ? run?.checks : null;
              if (id === "pruefungen" && !checks) return null;
              const result = n ? run?.results[id] : undefined;
              const dim = state === "wait" || (state !== "run" && result && !result.ran);
              return (
                <li key={id} className={cn("relative flex gap-3 pb-3", n?.side === "left" || id === "pruefungen" ? "pl-6" : "")}>
                  {!last && <span aria-hidden className="absolute top-11 bottom-0 left-[21px] w-px bg-[#d9dade]" />}
                  <button type="button" onClick={() => setSheet(id)} className={cn("flex min-h-14 min-w-0 flex-1 items-center gap-3 rounded-[14px] bg-surface px-3 py-2.5 text-left shadow-button outline-none transition-opacity focus-visible:outline-2 focus-visible:outline-accent", dim && "opacity-55", state === "run" && "shadow-[inset_0_0_0_1.5px_var(--color-accent)]")}>
                    {n ? <Chip icon={n.icon} className="size-8 rounded-lg" /> : <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-fill-hover text-fg-secondary shadow-ring"><ShieldCheck className="size-4" aria-hidden /></span>}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{n ? n.title : "Prüfungen"}</span>
                      {n ? (
                        <ResultLine node={n} result={result} state={state} className="text-xs leading-4" />
                      ) : (
                        <span className="block truncate text-xs leading-4 text-fg-secondary">{checks!.filter((c) => c.hits).length} von {checks!.length} mit Treffer</span>
                      )}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-fg-muted" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ol>
        )}
        <SideWindow open={sheetOpen} onClose={() => setSheet(null)} title={view.nodes.find((n) => n.id === sheet)?.title ?? "Prüfungen"}>
          {sheetOpen && sheet && <BlockDetail view={view} run={run} id={sheet} onClose={() => setSheet(null)} />}
        </SideWindow>
      </div>
    </div>
  );
}
