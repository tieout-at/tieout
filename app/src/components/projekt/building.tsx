"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { Legend } from "@/components/charts/legend";
import { keep, TONE_VAR, type ChartTone } from "@/components/charts/tones";
import { InfoTip } from "@/components/ui/info-tip";
import { useMediaQuery, useReducedMotion } from "@/components/ui/use-media";
import type { BuildingModel } from "@/lib/building";
import type { OverviewFind } from "@/lib/project-view";
import { cn } from "@/lib/utils";
import { bounds, faces, ISO, paintOrder, project, sceneOf, type Box, type P3 } from "./scene";

const STAND_TONE: Record<string, ChartTone> = { belegt: "money", beleg_fehlt: "gap", nachtrag_nicht_gelegt: "change" };
export const toneOf = (f: OverviewFind): ChartTone => STAND_TONE[f.belegstand?.state ?? "belegt"];

const pts = (poly: P3[]) => poly.map((p) => project(p).join(",")).join(" ");
const mix = (colour: string, pct: number, base = "var(--color-surface)") => `color-mix(in srgb, ${colour} ${pct}%, ${base})`;
const INK = "var(--color-fg)";
// the three faces of an untouched block: white top, the two sides a little darker, as daylight from the upper left
const FACE = { top: "var(--color-surface)", left: mix(INK, 3.5), right: mix(INK, 7) };
const EDGE = mix(INK, 26, "transparent");
const SEEN = "tieout.gebaeude.auftritt";

/**
 * "Wo im Gebäude" (step 8d): the building as an isometric schema drawn from the project's facts, each find standing in
 * the zone its Belege name, with the list of finds beside it. Pointing at a find (in the list, on its marker or its
 * zone) lifts its zone, draws a hairline from the marker to its row with a light that runs along it, and dims the rest;
 * a click opens the find. On phones the first tap lights a zone, the second opens it. The blocks rise once per session.
 */
export function Building({ model, finds, decided }: { model: BuildingModel; finds: OverviewFind[]; decided: string }) {
  const router = useRouter();
  const still = useReducedMotion();
  const phone = useMediaQuery("(max-width: 767px)", false);
  const [hot, setHot] = useState<string | null>(null);
  const stage = useRef<SVGSVGElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [leader, setLeader] = useState<{ d: string; len: number } | null>(null);
  const [svgW, setSvgW] = useState(700);

  const placed = finds.filter((f) => f.place);
  const scene = useMemo(() => sceneOf(model, placed.map((f) => f.place!)), [model, placed]);
  // on phones the schema is cropped closer to the buildings, and its words and markers grow with the scale, so they
  // stay at least about 11 px on screen however small the drawing gets
  const view = bounds(scene, undefined, phone ? 16 : 28);
  const grow = Math.max(1, view.w / Math.max(svgW, 1) / 0.82);
  const risky = (f: OverviewFind) => !!f.risk && !f.risk.alreadyCut;
  const hotFind = finds.find((f) => f.number === hot) ?? null;
  const hotZone = hotFind?.place?.zone ?? null;
  const findsOf = (zone: string | null) => (zone ? placed.filter((f) => f.place!.zone === zone) : []);
  const zoneTone = (zone: string | null): ChartTone | null => {
    const f = findsOf(zone)[0];
    return f ? toneOf(f) : null;
  };

  // markers: one per find with a place; finds in the same zone stand side by side
  const raw = placed.map((f) => {
    const same = findsOf(f.place!.zone);
    const i = same.indexOf(f);
    const at = scene.anchors[f.place!.zone] ?? [0, 0, 0];
    const [x, y] = project(at);
    return { f, x, y, dx: (i - (same.length - 1) / 2) * 34 };
  });
  // phones: a numbered badge on the spot itself, pushed sideways while it would touch one already placed
  const badges = raw.reduce<((typeof raw)[number] & { bx: number })[]>((done, m) => {
    let bx = m.x;
    while (done.some((o) => Math.hypot(o.bx - bx, o.y - m.y) < 21 * grow) && bx < m.x + 120 * grow) bx += 8 * grow;
    return [...done, { ...m, bx }];
  }, []);
  const markers = raw;

  // the entrance plays once per session and never with reduced motion: the blocks start low and rise in a stagger
  // (set on the element itself, so the static HTML shows the finished schema)
  useLayoutEffect(() => {
    const el = stage.current;
    if (still || !el) return;
    try {
      if (sessionStorage.getItem(SEEN)) return;
      sessionStorage.setItem(SEEN, "1");
    } catch {
      return;
    }
    el.setAttribute("data-rise", "");
    el.setAttribute("data-entering", "");
    const t = requestAnimationFrame(() => requestAnimationFrame(() => el.removeAttribute("data-rise")));
    const done = window.setTimeout(() => el.removeAttribute("data-entering"), 1500);
    return () => {
      cancelAnimationFrame(t);
      window.clearTimeout(done);
    };
  }, [still]);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setSvgW(el.clientWidth));
    ro.observe(el);
    setSvgW(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  // the hairline from the marker of the find pointed at to its row in the list, measured after layout
  useLayoutEffect(() => {
    const el = box.current;
    if (!el || !hot || phone) return setLeader(null);
    const m = el.querySelector<SVGGElement>(`[data-marker="${hot}"]`)?.getBoundingClientRect();
    const r = el.querySelector<HTMLElement>(`[data-row="${hot}"]`)?.getBoundingClientRect();
    const o = el.getBoundingClientRect();
    if (!m || !r) return setLeader(null);
    const x0 = m.right - o.left + 2;
    const y0 = m.top + m.height / 2 - o.top;
    const x1 = r.left - o.left - 4;
    const y1 = r.top + r.height / 2 - o.top;
    const mid = (x0 + x1) / 2;
    setLeader({ d: `M${x0} ${y0}C${mid} ${y0} ${mid} ${y1} ${x1} ${y1}`, len: Math.hypot(x1 - x0, y1 - y0) * 1.25 });
  }, [hot, phone]);

  const choose = (f: OverviewFind) => {
    if (phone && hot !== f.number) {
      setHot(f.number);
      box.current?.querySelector<HTMLElement>(`[data-row="${f.number}"]`)?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
      return;
    }
    router.push(f.href);
  };
  const zoneHover = (zone: string | null) => {
    const f = findsOf(zone)[0];
    if (f && !phone) setHot(f.number);
  };

  const ordered = paintOrder(scene.boxes);
  // the blocks a zone is drawn on (a flat on its Stiege, the slabs on every Stiege): they lift with it and never dim
  const hosts = new Set<string>(
    hotZone
      ? [
          ...scene.boxes.filter((b) => b.zone === hotZone).map((b) => b.id),
          ...scene.patches.filter((p) => p.zone === hotZone).map((p) => boxOf(scene.boxes, p.poly[0])),
          ...scene.lines.filter((l) => l.zone === hotZone).map((l) => boxOf(scene.boxes, l.a)),
        ].filter((x): x is string => !!x)
      : [],
  );
  const motion = still ? "" : "transition-[transform,opacity] duration-500 ease-soft";

  return (
    <section aria-labelledby="gebaeude" className="relative flex flex-col rounded-xl bg-surface shadow-ring">
      <header className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 px-5 pt-4 max-md:px-4">
        <h2 id="gebaeude" className="flex items-center gap-1.5 text-fg-secondary">
          Wo im Gebäude
          <InfoTip label="Wo im Gebäude">
            Jeder Fund steht dort, wo seine Belege den Ort nennen: das Ort-Feld einer WhatsApp-Meldung oder eines Fotos, der Titel eines Aufmaßblatts, die Tätigkeit eines Regieberichts. Ein Fund ohne Ortsangabe steht nur in der Liste.
          </InfoTip>
        </h2>
        <span className="text-xs text-fg-muted tabular-nums">
          {decided} · {placed.length} von {finds.length} mit Ort
        </span>
      </header>
      <div ref={box} className="relative grid gap-x-6 gap-y-2 px-3 pb-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(300px,1fr)]" onPointerLeave={() => setHot(null)}>
        <figure className="relative flex min-w-0 flex-col self-start pt-1">
          <svg ref={stage} role="img" aria-label={`Schema des Gebäudes mit ${placed.length} Funden`} viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} className="gebaeude h-auto w-full" preserveAspectRatio="xMidYMin meet" style={{ maxHeight: phone ? undefined : 460 }}>
            {/* guides of the exploded base: where the blocks stand on it */}
            {model.kind === "stiegen" &&
              scene.boxes
                .filter((b) => b.zone?.startsWith("stiege-"))
                .flatMap((b) =>
                  [
                    [b.x, b.y + b.d],
                    [b.x + b.w, b.y + b.d],
                    [b.x + b.w, b.y],
                  ].map(([x, y], i) => {
                    const [ax, ay] = project([x, y, ISO.slab]);
                    const [bx, by] = project([x, y, b.z]);
                    return <line key={`${b.id}-${i}`} x1={ax} y1={ay} x2={bx} y2={by} stroke={EDGE} strokeDasharray="2 3" />;
                  }),
                )}
            {ordered.map((b, i) => (
              <Block
                key={b.id}
                b={b}
                tone={zoneTone(b.zone)}
                tintAtRest={model.kind !== "stiegen"}
                hot={hosts.has(b.id)}
                lit={!!b.zone && hotZone === b.zone}
                dim={!!hotZone && !hosts.has(b.id)}
                delay={i * 70}
                motion={motion}
                onEnter={() => zoneHover(b.zone)}
                onClick={() => findsOf(b.zone)[0] && choose(findsOf(b.zone)[0])}
              >
                {/* the footprint of each Stiege on the base: a soft shadow that shows the gap of the exploded view */}
                {b.id === "base" &&
                  scene.boxes
                    .filter((t) => t.zone?.startsWith("stiege-"))
                    .map((t) => (
                      <polygon
                        key={`shadow-${t.id}`}
                        points={pts([
                          [t.x + 0.25, t.y + 0.25, ISO.slab],
                          [t.x + t.w + 0.25, t.y + 0.25, ISO.slab],
                          [t.x + t.w + 0.25, t.y + t.d + 0.25, ISO.slab],
                          [t.x + 0.25, t.y + t.d + 0.25, ISO.slab],
                        ])}
                        style={{ fill: mix(INK, 7, "transparent") }}
                      />
                    ))}
                {/* lines and patches that sit on this block move with it */}
                {scene.lines
                  .filter((l) => boxOf(scene.boxes, l.a) === b.id)
                  .map((l) => {
                    // slabs are the texture of the Stiege; they take the tone of their zone only while it is pointed at
                    const lit = l.zone && hotZone === l.zone ? zoneTone(l.zone) : null;
                    const [ax, ay] = project(l.a);
                    const [bx, by] = project(l.b);
                    return <line key={l.id} x1={ax} y1={ay} x2={bx} y2={by} stroke={lit ? TONE_VAR[lit] : EDGE} strokeWidth={lit ? 2.4 : 0.8} strokeLinecap="round" className={motion} />;
                  })}
                {scene.patches
                  .filter((p) => boxOf(scene.boxes, p.poly[0]) === b.id)
                  .map((p) => {
                    const t = zoneTone(p.zone);
                    const on = hotZone === p.zone;
                    return (
                      <polygon
                        key={p.id}
                        points={pts(p.poly)}
                        style={{ fill: t ? mix(TONE_VAR[t], on ? 70 : 34) : mix(INK, 5, "transparent"), stroke: t ? TONE_VAR[t] : EDGE }}
                        strokeWidth={t ? 0.9 : 0.5}
                        strokeLinejoin="round"
                        className={cn(motion, t && "cursor-pointer", hotZone && !on && t && "opacity-35")}
                        onPointerEnter={() => zoneHover(p.zone)}
                        onClick={(e) => {
                          e.stopPropagation();
                          const f = findsOf(p.zone)[0];
                          if (f) choose(f);
                        }}
                      />
                    );
                  })}
              </Block>
            ))}
            {scene.labels.map((l) => {
                const [x, y] = project(l.at);
                return (
                  <text
                    key={l.id}
                    x={x + (l.anchor === "end" ? -10 : 0)}
                    y={y + 4}
                    textAnchor={l.anchor}
                    // a white halo keeps the word readable where it crosses an edge or a tinted face
                    style={{ fontSize: 10 * grow, paintOrder: "stroke", stroke: "var(--color-surface)", strokeWidth: 3 * grow, strokeLinejoin: "round" }}
                    className={cn("bld-fade pointer-events-none fill-fg-secondary font-medium tracking-wide", motion)}
                  >
                    {l.text}
                  </text>
                );
              })}
            {phone &&
              badges.map(({ f, x, y, bx }) => {
                const t = toneOf(f);
                const on = hot === f.number;
                const g = grow;
                return (
                  <g key={f.id} data-marker={f.number} role="button" tabIndex={0} aria-label={`${f.number} ${f.name}, ${f.place!.label}`} onClick={() => choose(f)} onKeyDown={(e) => e.key === "Enter" && router.push(f.href)} className={cn("bld-fade cursor-pointer outline-none", motion, hot && !on && "opacity-40")}>
                    {bx !== x && <line x1={x} y1={y} x2={bx} y2={y} stroke={TONE_VAR[t]} strokeWidth={g} />}
                    <circle cx={bx} cy={y} r={9.5 * g} style={{ fill: on ? TONE_VAR[t] : "var(--color-surface)", stroke: risky(f) ? "var(--color-state-red)" : TONE_VAR[t] }} strokeWidth={(risky(f) ? 1.8 : 1.3) * g} />
                    <text x={bx} y={y + 3.4 * g} textAnchor="middle" style={{ fontSize: 9 * g }} className={cn("font-mono font-medium", on && t === "money" ? "fill-white" : "fill-fg")}>
                      {f.number}
                    </text>
                  </g>
                );
              })}
            {!phone && markers.map(({ f, x, y, dx }) => {
              const t = toneOf(f);
              const on = hot === f.number;
              const lift = on ? -6 : 0;
              const g = grow;
              return (
                <g
                  key={f.id}
                  data-marker={f.number}
                  role="button"
                  tabIndex={0}
                  aria-label={`${f.number} ${f.name}, ${f.place!.label}`}
                  onPointerEnter={() => !phone && setHot(f.number)}
                  onFocus={() => setHot(f.number)}
                  onBlur={() => setHot(null)}
                  onClick={() => choose(f)}
                  onKeyDown={(e) => e.key === "Enter" && router.push(f.href)}
                  className={cn("bld-fade cursor-pointer outline-none", motion, hot && !on && "opacity-40")}
                  style={{ transform: `translateY(${lift}px)` }}
                >
                  <line x1={x} y1={y} x2={x + dx * g} y2={y - 26 * g} stroke={TONE_VAR[t]} strokeWidth={g} />
                  {/* a find with Kürzungsrisiko carries a red ring around its point, so the risk shows on the building too */}
                  {risky(f) && <circle cx={x} cy={y} r={5.8 * g} fill="none" style={{ stroke: "var(--color-state-red)" }} strokeWidth={1.4 * g} />}
                  <circle cx={x} cy={y} r={3 * g} style={{ fill: TONE_VAR[t], stroke: "var(--color-surface)" }} strokeWidth={1.5 * g} />
                  <rect x={x + (dx - 15) * g} y={y - 40 * g} width={30 * g} height={16 * g} rx={8 * g} style={{ fill: on ? TONE_VAR[t] : "var(--color-surface)", stroke: risky(f) ? "var(--color-state-red)" : TONE_VAR[t] }} strokeWidth={1.2 * g} />
                  <text x={x + dx * g} y={y - 28.5 * g} textAnchor="middle" style={{ fontSize: 10 * g }} className={cn("font-mono font-medium", on && t === "money" ? "fill-white" : "fill-fg")}>
                    {f.number}
                  </text>
                </g>
              );
            })}
          </svg>
          <figcaption className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 px-2 text-[11px] text-fg-muted">
            <Legend
              className="text-[11px]"
              items={[
                ...(placed.some((f) => toneOf(f) === "money") ? [{ tone: "money" as const, label: "belegt" }] : []),
                ...(placed.some((f) => toneOf(f) === "gap") ? [{ tone: "gap" as const, label: "Beleg fehlt" }] : []),
                ...(placed.some((f) => toneOf(f) === "change") ? [{ tone: "change" as const, label: "Nachtrag nicht gelegt" }] : []),
                ...(placed.some(risky) ? [{ tone: "risk" as const, label: "Kürzungsrisiko", hollow: true }] : []),
              ]}
            />
            <span>Schema aus den Ortsangaben der Belege, kein Plan.</span>
          </figcaption>
        </figure>

        <ul aria-label="Funde und ihr Ort" className="flex min-w-0 flex-col gap-0.5 self-start py-1">
          {finds.map((f) => {
            const t = toneOf(f);
            const on = hot === f.number;
            return (
              <li key={f.id}>
                <Link
                  href={f.href}
                  data-row={f.number}
                  // phones light a row by a tap only (a scroll must not light the row that slides under the finger)
                  onPointerEnter={() => !phone && setHot(f.number)}
                  onFocus={() => setHot(f.number)}
                  onBlur={() => setHot(null)}
                  onClick={(e) => {
                    if (phone && f.place && hot !== f.number) {
                      e.preventDefault();
                      setHot(f.number);
                    }
                  }}
                  className={cn(
                    "grid min-h-11 grid-cols-[32px_minmax(0,1fr)_auto] items-start gap-x-2.5 rounded-lg px-2 py-2 outline-none transition-[background,opacity] duration-200 focus-visible:outline-2 focus-visible:outline-accent",
                    on && "bg-fill-hover",
                    hot && !on && "opacity-45",
                  )}
                >
                  <span className="flex h-5 items-center justify-center gap-1 rounded-[5px] bg-fill-hover font-mono text-[11px] text-count shadow-ring">{f.number}</span>
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="line-clamp-2 leading-5">{f.name}</span>
                    <span className="flex min-w-0 items-center gap-1.5 text-xs text-fg-secondary">
                      <span aria-hidden className="size-1.5 shrink-0 rounded-full" style={{ background: TONE_VAR[t] }} />
                      {f.belegstand?.text ?? "belegt"}
                    </span>
                    <span className="text-xs text-fg-muted">{f.place ? f.place.label : "ohne Ortsangabe"}</span>
                    {risky(f) && (
                      <span className="flex items-center gap-1.5 text-xs text-state-red-edge" title={f.risk!.reason}>
                        <span aria-hidden className="size-1.5 shrink-0 rounded-full ring-[1.5px] ring-state-red ring-inset" />
                        Kürzungsrisiko {f.risk!.amount.cent !== f.amount.cent ? keep(f.risk!.amount.text) : "für den ganzen Betrag"}
                      </span>
                    )}
                  </span>
                  <span className="text-sm tabular-nums whitespace-nowrap">{keep(f.amount.text)}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {leader && hotFind && (
          <svg aria-hidden className="pointer-events-none absolute inset-0 size-full overflow-visible">
            <defs>
              <linearGradient id="gebaeude-sweep">
                <stop offset="0" stopColor="var(--color-sweep)" stopOpacity="0" />
                <stop offset="0.5" stopColor="var(--color-sweep)" />
                <stop offset="1" stopColor="var(--color-sweep)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={leader.d} fill="none" stroke={TONE_VAR[toneOf(hotFind)]} strokeWidth={1} strokeDasharray={leader.len} strokeDashoffset={0} className={still ? "" : "animate-[gebaeude-draw_420ms_var(--ease-soft)]"} style={{ ["--len" as string]: leader.len }} />
            {!still && (
              <path d={leader.d} fill="none" stroke="var(--color-sweep)" strokeWidth={2.2} strokeLinecap="round" strokeDasharray={`28 ${leader.len}`} opacity={0.9}>
                <animate attributeName="stroke-dashoffset" from={28} to={-leader.len} dur="1.6s" begin="0.25s" repeatCount="indefinite" />
              </path>
            )}
          </svg>
        )}
      </div>
      <style>{`@keyframes gebaeude-draw { from { stroke-dashoffset: var(--len); } to { stroke-dashoffset: 0; } } .gebaeude[data-rise] .bld { transform: translateY(18px) !important; opacity: 0; transition: none !important; } .gebaeude[data-rise] .bld-fade { opacity: 0; transition: none !important; } .gebaeude[data-entering] .bld { transition-delay: var(--d); } .gebaeude[data-entering] .bld-fade { transition-delay: 900ms; }`}</style>
    </section>
  );
}

/** The box a point lies on (a patch or a line belongs to the block whose face it is drawn on). */
function boxOf(boxes: Box[], [x, y, z]: P3): string | null {
  const on = boxes.find((b) => x >= b.x - 0.01 && x <= b.x + b.w + 0.01 && y >= b.y - 0.01 && y <= b.y + b.d + 0.01 && z >= b.z - 0.01 && z <= b.z + b.h + 0.01);
  return on?.id ?? null;
}

function Block({
  b,
  tone,
  tintAtRest,
  hot,
  lit,
  dim,
  delay,
  motion,
  onEnter,
  onClick,
  children,
}: {
  b: Box;
  tone: ChartTone | null;
  /** A Geschoß or the Altbau is itself the place and keeps its tone; a Stiege takes it only while pointed at (its flats and shaft carry the finds). */
  tintAtRest: boolean;
  hot: boolean;
  lit: boolean;
  dim: boolean;
  delay: number;
  motion: string;
  onEnter: () => void;
  onClick: () => void;
  children: React.ReactNode;
}) {
  const f = faces(b);
  const t = tone ? TONE_VAR[tone] : null;
  // a block that is itself a zone (a Stiege, a Geschoß, the Altbau) takes its tone softly; lifted while pointed at
  const fill = (side: "top" | "left" | "right") => (t && (lit || tintAtRest) ? mix(t, side === "top" ? (lit ? 34 : 16) : lit ? 24 : 10, FACE[side]) : FACE[side]);
  return (
    <g
      onPointerEnter={onEnter}
      onClick={onClick}
      className={cn("bld", motion, t && "cursor-pointer", dim && "opacity-55")}
      style={{ transform: hot ? "translateY(-6px)" : "translateY(0)", ["--d" as string]: `${delay}ms` }}
    >
      {(["left", "right", "top"] as const).map((side) => (
        <polygon key={side} points={pts(f[side])} style={{ fill: fill(side), stroke: t && lit ? t : EDGE }} strokeWidth={0.8} strokeLinejoin="round" strokeDasharray={b.dashed ? "3 3" : undefined} />
      ))}
      {children}
    </g>
  );
}
