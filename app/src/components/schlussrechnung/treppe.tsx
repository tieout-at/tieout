"use client";

import { ChevronRight } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";

import { keep } from "@/components/charts/tones";
import { InfoTip } from "@/components/ui/info-tip";
import { useReducedMotion } from "@/components/ui/use-media";
import { ownEntryAt, type DecisionState } from "@/lib/decisions";
import type { InvoiceFind, InvoiceView } from "@/lib/invoice";
import { stairs, type Mode, type Stairs } from "@/lib/stairs";
import { cn } from "@/lib/utils";

const euroText = (cent: number) => {
  const abs = Math.abs(cent);
  const whole = Math.floor(abs / 100)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${cent < 0 ? "−" : ""}${whole},${String(abs % 100).padStart(2, "0")} €`;
};

/** A step on its way: where it stands, in columns and cents. */
type Pose = { col: number; from: number; to: number };
type Poses = Record<string, Pose>;

const posesOf = (s: Stairs): Poses => {
  const poses: Poses = {};
  const lastFind = s.steps.findLastIndex((x) => x.kind === "fund" || x.kind === "more");
  const after = lastFind < 0 ? 0 : lastFind;
  s.steps.forEach((x, i) => (poses[x.id] = { col: i > after ? i + s.pending.length : i, from: x.from, to: x.to }));
  s.pending.forEach((x, i) => (poses[x.id] = { col: after + 1 + i, from: x.from, to: x.to }));
  poses.end = { col: s.steps.length + s.pending.length, from: s.end.cent, to: s.end.cent };
  return poses;
};

/**
 * The steps walk to their new place one after the other, each a little after the one before: the money runs down the
 * stairs. With reduced motion they stand there at once.
 */
function useWalk(target: Poses): Poses {
  const still = useReducedMotion();
  const [shown, setShown] = useState(target);
  const from = useRef(target);
  useEffect(() => {
    if (still) {
      from.current = target;
      return;
    }
    const start = performance.now();
    const old = from.current;
    const ids = Object.keys(target);
    let frame = 0;
    const step = (t: number) => {
      const next: Poses = {};
      let moving = false;
      ids.forEach((id, i) => {
        const a = old[id] ?? { ...target[id], to: target[id].from };
        const k = Math.min(1, Math.max(0, (t - start - i * 28) / 420));
        if (k < 1) moving = true;
        const e = 1 - (1 - k) ** 3;
        next[id] = { col: a.col + (target[id].col - a.col) * e, from: a.from + (target[id].from - a.from) * e, to: a.to + (target[id].to - a.to) * e };
      });
      setShown(next);
      from.current = next;
      if (moving) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, still]);
  return still ? target : shown;
}

function useCounting(cent: number): number {
  const still = useReducedMotion();
  const [shown, setShown] = useState(cent);
  const from = useRef(cent);
  useEffect(() => {
    if (still || from.current === cent) {
      from.current = cent;
      setShown(cent);
      return;
    }
    const start = performance.now();
    const a = from.current;
    let frame = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / 520);
      const now = Math.round(a + (cent - a) * (1 - (1 - k) ** 3));
      setShown(now);
      from.current = now;
      if (k < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [cent, still]);
  return shown;
}

function useWidth<T extends HTMLElement>(fallback: number) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    if (!ref.current) return;
    const o = new ResizeObserver((e) => setWidth(Math.round(e[0].contentRect.width)));
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return [ref, width] as const;
}

/** How a step of a find shows its decision: empty, light, full; the word stands in the window and in the list. */
const FUND_STYLE: Record<DecisionState, { fill: string; stroke: string }> = {
  gefunden: { fill: "var(--color-surface)", stroke: "var(--color-state-green-edge)" },
  geprueft: { fill: "var(--color-money-soft)", stroke: "var(--color-state-green-edge)" },
  freigegeben: { fill: "var(--color-state-green)", stroke: "var(--color-state-green-edge)" },
  in_schlussrechnung: { fill: "var(--color-state-green-edge)", stroke: "var(--color-state-green-edge)" },
  nicht_verrechnen: { fill: "var(--color-surface)", stroke: "var(--color-state-grey)" },
};

const HEIGHT = 262;
const FOOT = 46;
const ROOF = 30;
const SOLID = "var(--color-fg)";
const QUIET = "rgb(10 16 32 / 0.2)";
const short = (text: string) => text.replace(" €", "");

/** The torn foot of a bar that does not start at zero: the axis is cut there, and the picture says so. */
function Torn({ x, w, y }: { x: number; w: number; y: number }) {
  return <path d={`M${x - 1} ${y} l${w / 4} -4 l${w / 4} 4 l${w / 4} -4 l${w / 4 + 2} 4 v6 h-${w + 2} z`} fill="var(--color-surface)" />;
}

function Chart({ s, width, onFind }: { s: Stairs; width: number; onFind: (f: InvoiceFind) => void }) {
  const target = useMemo(() => posesOf(s), [s]);
  const p = useWalk(target);
  const cols = s.steps.length + s.pending.length + 1;
  const left = 6;
  const cw = (width - left * 2) / cols;
  const bw = Math.min(cw * 0.7, 64);
  const plot = HEIGHT - FOOT - ROOF;
  const y = (c: number) => ROOF + plot - ((c - s.base) / (s.top - s.base)) * plot;
  const floor = HEIGHT - FOOT;
  const x = (col: number) => left + col * cw + (cw - bw) / 2;
  const small = cw < 74;
  const amount = (text: string, cx: number, top: number, muted = false) => (
    <text x={cx} y={top - 6} textAnchor="middle" className={cn("font-mono tabular-nums", muted ? "fill-fg-secondary" : "fill-fg")} fontSize={cw < 52 ? 8.5 : small ? 9 : 10.5}>
      {short(text)}
    </text>
  );
  const label = (lines: string[], cx: number) =>
    lines.map((l, i) => (
      <text key={l} x={cx} y={floor + 15 + i * 12} textAnchor="middle" className="fill-fg-secondary" fontSize={small ? 9.5 : 11}>
        {l}
      </text>
    ));
  const lines = (t: string) => (t === "Baustrom und Bauwasser" ? (cw < 52 ? ["Bau-", "strom"] : ["Baustrom,", "Bauwasser"]) : t === "Bauschadensumlage" ? (cw < 52 ? ["Bau-", "schaden"] : ["Bauschaden-", "umlage"]) : t === "Haftrücklass" ? ["Haft-", "rücklass"] : t === "Deckungsrücklass" ? ["Deckungs-", "rücklass"] : [t]);

  const firstWaiting = s.pending[0] ? p[s.pending[0].id] : undefined;
  const band = firstWaiting ? { x: left + firstWaiting.col * cw, w: s.pending.length * cw } : null;
  const clickable = (f: InvoiceFind, text: string, body: React.ReactNode) => (
    <g
      key={f.key}
      role="button"
      tabIndex={0}
      aria-label={`${f.number} ${f.name}, ${text}`}
      onClick={() => onFind(f)}
      onKeyDown={(e) => {
        if (e.key !== "Enter" && e.key !== " ") return;
        e.preventDefault();
        onFind(f);
      }}
      className="cursor-pointer outline-none [&:focus-visible_.hit]:stroke-accent [&:hover_.hit]:fill-fill-hover"
    >
      {body}
    </g>
  );

  return (
    <svg width={width} height={HEIGHT} viewBox={`0 0 ${width} ${HEIGHT}`} role="group" aria-label={`Treppe vom Entwurf zum Betrag der Schlussrechnung ${s.end.text}`} className="block">
      {band && <rect x={band.x} y={8} width={band.w} height={floor - 8} rx={6} fill="var(--color-fill-subtle)" />}
      <line x1={left} x2={width - left} y1={floor} y2={floor} stroke="var(--color-line)" />
      {s.steps.map((st, i) => {
        const a = p[st.id];
        if (!a) return null;
        const cx = x(a.col) + bw / 2;
        const prev = s.steps[i - 1];
        const link = prev && p[prev.id] ? <line x1={x(p[prev.id].col) + bw} x2={x(a.col)} y1={y(prev.kind === "start" ? p[prev.id].to : p[prev.id].to)} y2={y(prev.kind === "start" ? p[prev.id].to : p[prev.id].to)} stroke="var(--color-fg-faint)" strokeDasharray="2 2" /> : null;
        if (st.kind === "start") {
          const top = y(a.to);
          return (
            <g key={st.id}>
              <rect x={x(a.col)} y={top} width={bw} height={floor - top} rx={2} fill={SOLID} />
              <Torn x={x(a.col)} w={bw} y={floor - 4} />
              {amount(st.text, cx, top)}
              {label(["Ihr Entwurf"], cx)}
            </g>
          );
        }
        const up = y(Math.max(a.from, a.to));
        const down = y(Math.min(a.from, a.to));
        const h = Math.max(down - up, 3);
        if (st.kind === "abzug")
          return (
            <g key={st.id}>
              {link}
              <rect x={x(a.col)} y={up} width={bw} height={h} rx={2} fill={QUIET} />
              {st.noClause && <circle cx={cx} cy={up - 21} r={3} fill="var(--color-state-red)" />}
              {amount(st.text, cx, up)}
              {label(lines(st.label), cx)}
            </g>
          );
        const style = st.find ? FUND_STYLE[st.find.decision] : FUND_STYLE.freigegeben;
        const body = (
          <>
            {link}
            <rect className="hit" x={x(a.col) - (cw - bw) / 2 + 1} y={ROOF - 26} width={cw - 2} height={floor - ROOF + 26 + 28} rx={5} fill="transparent" stroke="transparent" strokeWidth={1.5} />
            <rect x={x(a.col)} y={up} width={bw} height={h} rx={2} fill={style.fill} stroke={style.stroke} strokeWidth={1.2} />
            {st.risk && <circle cx={cx} cy={up - 21} r={3} fill="var(--color-state-red)" />}
            {st.text && amount(st.text, cx, up)}
            {label([st.label], cx)}
          </>
        );
        return st.find ? clickable(st.find, st.text, body) : <g key={st.id}>{body}</g>;
      })}
      {s.pending.map((st) => {
        const a = p[st.id];
        if (!a || !st.find) return null;
        const up = y(Math.max(a.from, a.to));
        const h = Math.max(y(Math.min(a.from, a.to)) - up, 3);
        const cx = x(a.col) + bw / 2;
        const edge = st.stand === "Nachtrag nicht gelegt" ? "var(--color-state-orange)" : "var(--color-state-yellow-edge)";
        return clickable(
          st.find,
          `${st.text}, in Klärung, nicht addiert`,
          <>
            <rect className="hit" x={x(a.col) - (cw - bw) / 2 + 1} y={ROOF - 26} width={cw - 2} height={floor - ROOF + 26 + 28} rx={5} fill="transparent" stroke="transparent" strokeWidth={1.5} />
            <rect x={x(a.col)} y={up} width={bw} height={h} rx={2} fill="var(--color-surface)" stroke={edge} strokeWidth={1.2} strokeDasharray="3 2" />
            {amount(st.text, cx, up, true)}
            {label([st.label], cx)}
          </>,
        );
      })}
      {band && (
        <text x={band.x + band.w / 2} y={floor + 39} textAnchor="middle" className="fill-fg-muted" fontSize={small ? 9.5 : 11}>
          in Klärung, nicht addiert
        </text>
      )}
      {p.end && (
        <g>
          <line x1={x(p.end.col) - cw + bw} x2={x(p.end.col)} y1={y(p.end.to)} y2={y(p.end.to)} stroke="var(--color-fg-faint)" strokeDasharray="2 2" />
          <rect x={x(p.end.col)} y={y(p.end.to)} width={bw} height={floor - y(p.end.to)} rx={2} fill={SOLID} />
          <Torn x={x(p.end.col)} w={bw} y={floor - 4} />
          {amount(s.end.text, x(p.end.col) + bw / 2, y(p.end.to))}
          {label(["Betrag"], x(p.end.col) + bw / 2)}
        </g>
      )}
    </svg>
  );
}

const STATE_DOT: Record<DecisionState, string> = {
  gefunden: "bg-surface shadow-[inset_0_0_0_1.2px_var(--color-state-green-edge)]",
  geprueft: "bg-money-soft shadow-[inset_0_0_0_1.2px_var(--color-state-green-edge)]",
  freigegeben: "bg-state-green",
  in_schlussrechnung: "bg-state-green-edge",
  nicht_verrechnen: "bg-fill-hover",
};

/** The same steps as a list, on phones and in the print: money in plain rows, no axis. */
function Rows({ s, v, onFind }: { s: Stairs; v: InvoiceView; onFind: (f: InvoiceFind) => void }) {
  const pay = v.settlement;
  const ok = pay.payments.every((p) => p.ok);
  const row = "flex min-h-11 w-full items-center gap-2 px-4 py-1.5 text-left";
  return (
    <ul>
      {s.steps.map((st) => {
        const minus = st.kind === "abzug";
        const text = (
          <>
            {st.find && <span aria-hidden className={cn("size-2.5 shrink-0 rounded-[3px]", STATE_DOT[st.find.decision])} />}
            <span className={cn("min-w-0 flex-1", st.kind === "start" && "font-medium")}>
              {st.find ? <span className="font-mono">{st.find.number}</span> : st.label}
              {st.find && <span className="pl-1.5 text-fg-secondary">{st.find.name}</span>}
              {st.check && <span className={cn("block text-xs", st.noClause ? "text-state-red-edge" : "text-fg-muted")}>{st.check}</span>}
            </span>
            {(st.risk || st.noClause) && <span aria-label={st.risk ? "mit Kürzungsrisiko" : "Abzug ohne Vertragspunkt"} role="img" className="size-1.5 shrink-0 rounded-full bg-state-red" />}
            <span className="shrink-0 tabular-nums">{keep(minus ? `−${st.text.replace("−", "")}` : st.text)}</span>
          </>
        );
        return (
          <Fragment key={st.id}>
            <li className="shadow-line-bottom">
              {st.find ? (
                <button type="button" onClick={() => onFind(st.find!)} className={cn(row, "outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent")}>
                  {text}
                </button>
              ) : (
                <span className={row}>{text}</span>
              )}
            </li>
            {s.sums
              .filter((x) => x.after === st.id)
              .map((x) => (
                <li key={x.label} className="flex min-h-9 items-center justify-between gap-2 px-4 py-1 font-medium shadow-line-bottom">
                  <span>{x.label}</span>
                  <span className="shrink-0 tabular-nums">{keep(x.text)}</span>
                </li>
              ))}
          </Fragment>
        );
      })}
      <li className="flex min-h-11 items-center justify-between gap-2 px-4 py-1.5 font-medium shadow-line-bottom">
        <span>Betrag der Schlussrechnung vor Zahlungen</span>
        <span className="shrink-0 tabular-nums">{keep(s.end.text)}</span>
      </li>
      <li className="px-4 py-2 shadow-line-bottom">
        <p className="flex items-center justify-between gap-2">
          <span>
            Schon bezahlt <span className="text-xs text-fg-muted">{ok ? `${pay.payments.length} Zahlungen, nachgerechnet` : "weicht vom Zahlungsavis ab"}</span>
          </span>
          <span className="shrink-0 tabular-nums">{keep(`−${s.paid.text}`)}</span>
        </p>
        <ul className="flex flex-col pt-1">
          {pay.payments.map((p) => (
            <li key={p.invoice} className="flex min-h-6 items-center gap-2 text-xs text-fg-secondary">
              <span className="min-w-0 flex-1">
                {p.invoice} <span className="text-fg-muted">bezahlt am {p.paidOn}</span>
              </span>
              <span className="tabular-nums">{keep(p.paid.text)}</span>
            </li>
          ))}
          {pay.withheld.map((w) => (
            <li key={w.kind} className="flex items-start gap-1.5 pt-1 text-xs text-fg-secondary">
              <span aria-hidden className="mt-1 size-1.5 shrink-0 rounded-full bg-state-red" />
              Davon schon einbehalten: {w.kind} {keep(w.amount.text)}, ohne Vertragspunkt.
            </li>
          ))}
        </ul>
      </li>
      {s.pending.length > 0 && (
        <li className="bg-fill-subtle py-1">
          <p className="px-4 pt-1 text-xs text-fg-secondary">In Klärung, nicht addiert</p>
          <ul>
            {s.pending.map((st) => (
              <li key={st.id}>
                <button type="button" onClick={() => onFind(st.find!)} className={cn(row, "text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent")}>
                  <span className="min-w-0 flex-1">
                    <span className="font-mono">{st.find!.number}</span>
                    <span className="pl-1.5">{st.find!.name}</span>
                  </span>
                  <span className="shrink-0 tabular-nums">{keep(st.text)}</span>
                </button>
              </li>
            ))}
          </ul>
        </li>
      )}
    </ul>
  );
}

function Legend({ axis }: { axis: string }) {
  const item = (dot: string, text: string) => (
    <span className="flex items-center gap-1.5">
      <span aria-hidden className={cn("size-2.5 rounded-[3px]", dot)} />
      {text}
    </span>
  );
  return (
    <p className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 pb-2 text-xs text-fg-secondary max-md:hidden print:hidden">
      {item(STATE_DOT.gefunden, "gefunden")}
      {item(STATE_DOT.geprueft, "geprüft")}
      {item(STATE_DOT.freigegeben, "freigegeben")}
      {item(STATE_DOT.in_schlussrechnung, "in der Schlussrechnung")}
      <span className="flex items-center gap-1.5">
        <span aria-hidden className="size-1.5 rounded-full bg-state-red" />
        Kürzungsrisiko oder Abzug ohne Vertragspunkt
      </span>
      <span className="text-fg-muted">Achse ab {axis}</span>
    </p>
  );
}

/** Below this width the labels of the steps would touch: the steps are a list then, as on phones. */
const NARROW = 620;
/** From this width of the card the sum stands beside the stairs, below it above them (a window open, a small screen). */
const BESIDE = 900;

/**
 * "Restforderung Schritt für Schritt" as a staircase: each find a step that shows its decision and opens in a window,
 * what is in Klärung dashed beside it, the deductions in the order of the core, and beside the stairs what is paid and
 * the Restforderung. Every decision changes a step; "Nicht verrechnen" and a signature that came back also move the
 * money, and the whole staircase walks to its new place. The switch "Laut Vertrag" takes out what has no contract item.
 */
export function Treppe({ v, mode, setMode, onFind }: { v: InvoiceView; mode: Mode; setMode: (m: Mode) => void; onFind: (f: InvoiceFind) => void }) {
  const s = useMemo(() => stairs(v, mode), [v, mode]);
  const [box, card] = useWidth<HTMLElement>(1100);
  const beside = card >= BESIDE;
  const width = (beside ? card - 216 : card) - 16;
  const counting = useCounting(s.rest.cent);
  // what the last change did to the Restforderung: new minus old, both figures of the core
  const marks = v.status.all.map((f) => f.decision).join();
  const seen = useRef({ mode, cent: s.rest.cent, marks });
  const [change, setChange] = useState(0);
  useEffect(() => {
    const was = seen.current;
    seen.current = { mode, cent: s.rest.cent, marks };
    // only what this page did right now: a list that arrives after loading is no change
    if (was.mode === mode && was.cent !== s.rest.cent && Date.now() - ownEntryAt() < 5000) setChange(s.rest.cent - was.cent);
    else if (was.mode !== mode || was.cent !== s.rest.cent || was.marks !== marks) setChange(0);
  }, [mode, s.rest.cent, marks]);
  const axis = euroText(s.base).replace(",00", "");
  const [lines, setLines] = useState(false);
  const tight = width < NARROW;

  return (
    <section ref={box} id="rechnungsabschluss" aria-label="Restforderung Schritt für Schritt" className="flex min-w-0 flex-col rounded-xl bg-surface shadow-ring">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 pt-3.5 pb-1">
        <span className="flex items-center gap-1.5 text-fg-secondary">
          Restforderung Schritt für Schritt
          <InfoTip label="Restforderung Schritt für Schritt">
            So rechnet {v.project.client.name} voraussichtlich ab. Jeder belegte Fund zählt, solange er nicht auf Nicht verrechnen steht; die Stufe zeigt seine Entscheidung. Laut Vertrag nimmt die Abzüge heraus, für die der Vertrag keinen Punkt nennt; ob Sie widersprechen, entscheiden Sie.
          </InfoTip>
        </span>
        <div role="radiogroup" aria-label="Rechnung" className="inline-flex h-8 shrink-0 items-center rounded-lg bg-fill-hover p-0.5 print:hidden max-md:h-11">
          {(
            [
              ["announced", "Wie angekündigt"],
              ["contract", "Laut Vertrag"],
            ] as const
          ).map(([id, text]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              onClick={() => setMode(id)}
              className={cn("h-7 rounded-md px-2.5 text-sm whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:outline-accent max-md:h-10", mode === id ? "bg-surface text-fg shadow-button" : "text-fg-secondary hover:text-fg")}
            >
              {text}
            </button>
          ))}
        </div>
      </header>
      <div className={cn("grid min-w-0 print:block", beside && "md:grid-cols-[minmax(0,1fr)_216px]")}>
        <div className={cn("flex min-w-0 flex-col", !beside && "order-2")}>
          <div className="min-w-0 overflow-hidden px-2 max-md:hidden print:hidden">
            {!tight && <Chart s={s} width={width} onFind={onFind} />}
          </div>
          {!tight && <Legend axis={axis} />}
          {!tight && (
            <button type="button" aria-expanded={lines} onClick={() => setLines(!lines)} className="flex min-h-9 w-fit items-center gap-1 px-4 pb-1 text-xs text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:hidden print:hidden">
              <ChevronRight className={cn("size-3.5 transition-transform", lines && "rotate-90")} aria-hidden />
              Jeder Schritt mit Vertragspunkt und Zahlungen
            </button>
          )}
          <div className={cn("shadow-[inset_0_1px_0_0_var(--color-line)] print:block", lines || tight ? "block" : "hidden max-md:block")}>
            <Rows s={s} v={v} onFind={onFind} />
          </div>
        </div>
        <div className={cn("flex flex-col gap-1.5 px-4 pt-3 pb-3.5 max-md:sticky max-md:top-0 max-md:z-10 max-md:bg-surface max-md:shadow-line-bottom", beside ? "md:shadow-[inset_1px_0_0_0_var(--color-line)]" : "order-1 md:flex-row md:flex-wrap md:items-baseline md:gap-x-3 md:pt-1")}>
          <span className="font-medium">{s.rest.label}</span>
          <span className="sr-only" aria-live="polite">
            {s.rest.label} {s.rest.text}
          </span>
          <span aria-hidden className="text-2xl font-semibold tracking-tight tabular-nums">
            {keep(euroText(counting))}
          </span>
          <span className="text-xs text-fg-secondary tabular-nums">
            {s.other.label} {keep(s.other.text)}
          </span>
          <span className={cn("w-fit rounded-sm px-1.5 text-xs font-medium tabular-nums transition-opacity duration-300", change ? "opacity-100" : "opacity-0", change > 0 ? "bg-money-soft text-state-green-edge" : "bg-fill-hover text-fg-secondary")}>{change ? keep(`${change > 0 ? "+" : ""}${euroText(change)}`) : " "}</span>
          <p className={cn("flex justify-between gap-2 text-xs text-fg-secondary max-md:hidden", beside ? "mt-2" : "md:ml-auto")}>
            <span>Betrag</span>
            <span className="tabular-nums">{keep(s.end.text)}</span>
          </p>
          <p className="flex justify-between gap-2 text-xs text-fg-secondary max-md:hidden">
            <span>Schon bezahlt</span>
            <span className="tabular-nums">{keep(`−${s.paid.text}`)}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
