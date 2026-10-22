"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import data from "@/data/zwilling.json";
import type { Locale, Messages } from "@/lib/i18n";

type T = Messages["twin"];
type Project = (typeof data.projects)[number];
type Ev = (typeof data.events)[number];
type EvType = keyof T["types"];

const W = 1000;
const H = 600;
const INK = "#0a1020";
const ULTRA = "#1d3bff";
const GRID = "#d5dce6";

/** Isometrische Projektion (2:1). x nach rechts unten, y nach links unten, z nach oben. */
function makeIso(cx: number, cy: number, a: number, b: number, h: number) {
  return (x: number, y: number, z = 0): [number, number] => [cx + (x - y) * a, cy + (x + y) * b - z * h];
}
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const isoFirm = makeIso(560, 150, 40, 20, 34);
const isoProj = makeIso(600, 112, 42, 21, 1);

const TYPE_LETTER: Record<EvType, string> = { mail: "M", foto: "F", zuruf: "Z", regie: "R", plan: "P", erp: "E" };
const SOURCE_ORDER: EvType[] = ["erp", "plan", "mail", "foto", "zuruf", "regie"];

function eur(n: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "de" ? "de-AT" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

function useInView<T extends Element>(ref: React.RefObject<T | null>) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);
  return reduced;
}

/* ---------- Firmenebene ---------- */

const bldHeight = (volume: number) => 1 + (volume / 1650000) * 3.2;

function Building({
  p,
  index,
  maxOpen,
  active,
  onEnter,
  onLeave,
  onOpen,
  label,
}: {
  p: Project;
  index: number;
  maxOpen: number;
  active: boolean;
  onEnter: () => void;
  onLeave: () => void;
  onOpen: () => void;
  label: string;
}) {
  const h = bldHeight(p.volume);
  const x0 = p.gx,
    y0 = p.gy,
    x1 = p.gx + p.w,
    y1 = p.gy + p.d;
  const top = [isoFirm(x0, y0, h), isoFirm(x1, y0, h), isoFirm(x1, y1, h), isoFirm(x0, y1, h)];
  const right = [isoFirm(x1, y0, 0), isoFirm(x1, y1, 0), isoFirm(x1, y1, h), isoFirm(x1, y0, h)];
  const left = [isoFirm(x0, y1, 0), isoFirm(x1, y1, 0), isoFirm(x1, y1, h), isoFirm(x0, y1, h)];
  const closed = p.status === "abgeschlossen";
  const openShare = maxOpen ? p.open / maxOpen : 0;
  const stroke = active ? ULTRA : INK;
  // Geschosslinien als Andeutung
  const floors = Math.max(2, Math.round(h / 1.1));
  const floorLines = Array.from({ length: floors - 1 }, (_, i) => (h / floors) * (i + 1));

  return (
    <g
      className="bld"
      tabIndex={0}
      role="button"
      aria-label={label}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      onClick={onOpen}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onOpen())}
      style={{
        transformBox: "fill-box",
        transformOrigin: "50% 100%",
        animation: `rise .9s cubic-bezier(.2,.7,.2,1) ${0.15 + index * 0.09}s both`,
      }}
    >
      <polygon points={pts(left)} fill={closed ? "#eef1f5" : "#ffffff"} stroke={stroke} strokeWidth="1.3" className="bld__edge" />
      <polygon points={pts(right)} fill={closed ? "#e4e8ee" : "#f4f6f9"} stroke={stroke} strokeWidth="1.3" className="bld__edge" />
      {floorLines.map((z) => (
        <polyline
          key={z}
          points={pts([isoFirm(x0, y1, z), isoFirm(x1, y1, z), isoFirm(x1, y0, z)])}
          stroke={INK}
          strokeOpacity=".25"
          strokeWidth="1"
          fill="none"
        />
      ))}
      <polygon
        points={pts(top)}
        fill={openShare > 0 ? ULTRA : "#ffffff"}
        fillOpacity={openShare > 0 ? 0.18 + openShare * 0.72 : 1}
        stroke={stroke}
        strokeWidth="1.3"
        className="bld__edge"
      />
      {closed && <polygon points={pts(top)} fill="url(#hatch)" stroke="none" />}
    </g>
  );
}

/* ---------- Projektebene ---------- */

const SLAB_W = 6.4;
const SLAB_D = 4.2;
const SLAB_GAP = 80;
const slabOrigin = { x: -SLAB_W / 2 + 2.2, y: -SLAB_D / 2 + 2.6 };

function slabPoint(floor: number, fx: number, fy: number, lift = 0): [number, number] {
  const [x, y] = isoProj(slabOrigin.x + fx * SLAB_W, slabOrigin.y + fy * SLAB_D, 0);
  return [x, y + (3 - floor) * SLAB_GAP - lift];
}

function sourcePos(i: number): [number, number] {
  return [92, 108 + i * 66];
}

function flowPath(e: Ev): string {
  const [px, py] = slabPoint(e.floor, e.x, e.y);
  const [sx, sy] = sourcePos(SOURCE_ORDER.indexOf(e.type as EvType));
  const hy = py - 26;
  return `M${sx - 4},${sy} C${sx + 220},${sy} ${px - 200},${hy} ${px},${hy}`;
}

/* ---------- Komponente ---------- */

export function Twin({ t, locale }: { t: T; locale: Locale }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef);
  const reduced = usePrefersReducedMotion();
  const [view, setView] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [day, setDay] = useState(data.days);
  const [selected, setSelected] = useState<Ev | null>(null);

  const projects = useMemo(() => [...data.projects].sort((a, b) => a.gx + a.gy - (b.gx + b.gy)), []);
  const maxOpen = Math.max(...data.projects.map((p) => p.open));
  const totalVolume = data.projects.reduce((s, p) => s + p.volume, 0);
  const totalOpen = data.projects.reduce((s, p) => s + p.open, 0);
  const project = data.projects.find((p) => p.id === view) ?? null;
  const events = project?.detail ? data.events : [];
  const visible = events.filter((e) => e.day <= day);

  // Zeitachse spielt beim Öffnen eines Projekts einmal durch.
  useEffect(() => {
    if (!view) return;
    setSelected(null);
    if (reduced) {
      setDay(data.days);
      return;
    }
    setDay(0);
    let d = 0;
    const id = window.setInterval(() => {
      d += 2;
      setDay(Math.min(d, data.days));
      if (d >= data.days) window.clearInterval(id);
    }, 45);
    return () => window.clearInterval(id);
  }, [view, reduced]);

  const hovered = data.projects.find((p) => p.id === hover);
  const tipAnchor = hovered ? isoFirm(hovered.gx + hovered.w / 2, hovered.gy + hovered.d / 2, bldHeight(hovered.volume)) : null;
  const clientName = (id: string) => data.clients.find((c) => c.id === id)?.name ?? "";

  const close = () => {
    setView(null);
    setSelected(null);
  };

  return (
    <div className="twin">
      <div className="twin__bar">
        <nav className="crumb" aria-label="Breadcrumb">
          {view ? (
            <button type="button" onClick={close}>
              {data.firma[locale]}
            </button>
          ) : (
            <span aria-current="page">{data.firma[locale]}</span>
          )}
          {project && (
            <>
              <span aria-hidden="true">/</span>
              {selected ? (
                <button type="button" onClick={() => setSelected(null)}>
                  {project.name[locale]}
                </button>
              ) : (
                <span aria-current="page">{project.name[locale]}</span>
              )}
            </>
          )}
          {selected && (
            <>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{t.evidence}</span>
            </>
          )}
        </nav>
        <span className="twin__hint">{view ? t.hintProject : t.hintFirm}</span>
      </div>

      <div className="twin__stage" ref={stageRef}>
        {inView && (
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={project ? project.name[locale] : data.firma[locale]}>
            <defs>
              <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="6" stroke={INK} strokeOpacity=".25" strokeWidth="1" />
              </pattern>
            </defs>

            {!project && (
              <g key="firm">
                {/* Raster der Firmenebene */}
                <g className="draw">
                  {Array.from({ length: 9 }, (_, i) => (
                    <g key={i}>
                      <line
                        x1={isoFirm(i, 0)[0]}
                        y1={isoFirm(i, 0)[1]}
                        x2={isoFirm(i, 8)[0]}
                        y2={isoFirm(i, 8)[1]}
                        stroke={GRID}
                        strokeWidth="1"
                        style={{ ["--len" as string]: 420, animationDelay: `${i * 0.03}s` }}
                      />
                      <line
                        x1={isoFirm(0, i)[0]}
                        y1={isoFirm(0, i)[1]}
                        x2={isoFirm(8, i)[0]}
                        y2={isoFirm(8, i)[1]}
                        stroke={GRID}
                        strokeWidth="1"
                        style={{ ["--len" as string]: 420, animationDelay: `${i * 0.03}s` }}
                      />
                    </g>
                  ))}
                </g>
                {/* Auftraggeber */}
                {data.clients.map((c, i) => {
                  const [sx, sy] = [70, 150 + i * 92];
                  return (
                    <g key={c.id} style={{ animation: `fadeUp .6s ${0.8 + i * 0.1}s both` }}>
                      {data.projects
                        .filter((p) => p.client === c.id)
                        .map((p) => {
                          const [bx, by] = isoFirm(p.gx + p.w / 2, p.gy + p.d / 2);
                          const on = hover === p.id;
                          return (
                            <path
                              key={p.id}
                              d={`M${sx + 8},${sy} C${sx + 160},${sy} ${bx - 160},${by} ${bx},${by}`}
                              fill="none"
                              stroke={on ? ULTRA : INK}
                              strokeOpacity={on ? 0.9 : 0.18}
                              strokeWidth={on ? 1.5 : 1}
                              strokeDasharray="3 4"
                            />
                          );
                        })}
                      <rect x={sx - 6} y={sy - 6} width="12" height="12" fill="#fff" stroke={INK} strokeWidth="1.2" />
                      <text x={sx + 16} y={sy - 12} fontFamily="var(--font-mono)" fontSize="11" fill={INK} fillOpacity=".7">
                        {c.name}
                      </text>
                    </g>
                  );
                })}
                <text x="58" y="112" fontFamily="var(--font-mono)" fontSize="11" fill={ULTRA} letterSpacing="1">
                  {t.clients.toUpperCase()}
                </text>
                {/* Projekte */}
                {projects.map((p, i) => (
                  <Building
                    key={p.id}
                    p={p}
                    index={i}
                    maxOpen={maxOpen}
                    active={hover === p.id}
                    onEnter={() => setHover(p.id)}
                    onLeave={() => setHover((h) => (h === p.id ? null : h))}
                    onOpen={() => {
                      setHover(null);
                      setView(p.id);
                    }}
                    label={`${p.name[locale]}, ${t.volume} ${eur(p.volume, locale)}, ${t.open} ${eur(p.open, locale)}`}
                  />
                ))}
              </g>
            )}

            {project && (
              <g key={`proj-${project.id}`}>
                {/* Quellen */}
                <text x="58" y="72" fontFamily="var(--font-mono)" fontSize="11" fill={ULTRA} letterSpacing="1">
                  {t.sources.toUpperCase()}
                </text>
                {SOURCE_ORDER.map((type, i) => {
                  const [sx, sy] = sourcePos(i);
                  const count = visible.filter((e) => e.type === type).length;
                  return (
                    <g key={type} style={{ animation: `fadeUp .5s ${i * 0.06}s both` }}>
                      <rect x={sx - 34} y={sy - 15} width="30" height="30" fill={count ? ULTRA : "#fff"} stroke={INK} strokeWidth="1.2" />
                      <text
                        x={sx - 19}
                        y={sy + 4}
                        textAnchor="middle"
                        fontFamily="var(--font-mono)"
                        fontSize="12"
                        fill={count ? "#fff" : INK}
                      >
                        {TYPE_LETTER[type]}
                      </text>
                      <text x={sx + 6} y={sy + 4} fontFamily="var(--font-mono)" fontSize="11" fill={INK} fillOpacity=".7">
                        {t.types[type]} · {count}
                      </text>
                    </g>
                  );
                })}

                {/* Datenströme unter allem */}
                {visible.map((e) => {
                  const path = flowPath(e);
                  const isSel = selected?.id === e.id;
                  return (
                    <g key={`f-${e.id}`}>
                      <path d={path} fill="none" stroke={ULTRA} strokeOpacity={isSel ? 0.8 : 0.16} strokeWidth="1" />
                      {!reduced && (
                        <circle r="3" fill={ULTRA}>
                          <animateMotion dur="2.8s" repeatCount="indefinite" path={path} begin={`${(e.day % 7) * 0.35}s`} />
                        </circle>
                      )}
                    </g>
                  );
                })}

                {/* Geschosse als Explosionszeichnung: unten zuerst, obere Geschosse verdecken untere */}
                {data.floors.map((f, fi) => {
                  const c = [slabPoint(fi, 0, 0), slabPoint(fi, 1, 0), slabPoint(fi, 1, 1), slabPoint(fi, 0, 1)];
                  const thick = c.map(([x, y]) => [x, y + 8] as [number, number]);
                  return (
                    <g key={f.id} style={{ animation: `fadeUp .6s ${0.1 + (3 - fi) * 0.08}s both` }}>
                      <polygon points={pts([c[3], c[2], thick[2], thick[3]])} fill="#e8ecf2" stroke={INK} strokeWidth="1" />
                      <polygon points={pts([c[1], c[2], thick[2], thick[1]])} fill="#dfe4ec" stroke={INK} strokeWidth="1" />
                      <polygon points={pts(c)} fill="#ffffff" fillOpacity=".86" stroke={INK} strokeWidth="1.3" />
                      <polyline
                        points={pts([slabPoint(fi, 0.42, 0), slabPoint(fi, 0.42, 1)])}
                        stroke={INK}
                        strokeOpacity=".3"
                        fill="none"
                      />
                      <polyline
                        points={pts([slabPoint(fi, 0.42, 0.5), slabPoint(fi, 1, 0.5)])}
                        stroke={INK}
                        strokeOpacity=".3"
                        fill="none"
                      />
                      <text
                        x={c[3][0] - 14}
                        y={c[3][1] + 4}
                        textAnchor="end"
                        fontFamily="var(--font-mono)"
                        fontSize="11"
                        fill={INK}
                        fillOpacity=".6"
                      >
                        {f[locale]}
                      </text>
                    </g>
                  );
                })}

                {/* Belege über allen Geschossen, damit keiner verdeckt wird */}
                {visible.map((e) => {
                  const [px, py] = slabPoint(e.floor, e.x, e.y);
                  const [hx, hy] = [px, py - 26];
                  const isSel = selected?.id === e.id;
                  return (
                    <g
                      key={e.id}
                      className="pin"
                      tabIndex={0}
                      role="button"
                      aria-label={`${t.types[e.type as EvType]}: ${e[locale]}`}
                      onClick={() => setSelected(e)}
                      onKeyDown={(k) => (k.key === "Enter" || k.key === " ") && (k.preventDefault(), setSelected(e))}
                      style={{ animation: "fadeUp .35s ease both" }}
                    >
                      <line x1={px} y1={py} x2={hx} y2={hy + 9} stroke={ULTRA} strokeWidth="1.2" />
                      <ellipse cx={px} cy={py} rx="5" ry="2.5" fill={ULTRA} fillOpacity=".35" />
                      <circle className="pin__ring" cx={hx} cy={hy} r="10" fill={isSel ? ULTRA : "#fff"} stroke={ULTRA} strokeWidth="1.5" />
                      <text x={hx} y={hy + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill={isSel ? "#fff" : ULTRA}>
                        {TYPE_LETTER[e.type as EvType]}
                      </text>
                    </g>
                  );
                })}
              </g>
            )}
          </svg>
        )}

        {/* Kennzahlen */}
        {!selected && (
          <div className="twin__stats" aria-live="polite">
            {project ? (
              <>
                <div>
                  <b>{eur(project.volume, locale)}</b>
                  <span>{t.volume}</span>
                </div>
                <div>
                  <b>{eur(project.open, locale)}</b>
                  <span>{t.open}</span>
                </div>
                <div>
                  <b>{visible.length}</b>
                  <span>{t.evidence}</span>
                </div>
              </>
            ) : (
              <>
                <div>
                  <b>{data.projects.length}</b>
                  <span>{t.projects}</span>
                </div>
                <div>
                  <b>{eur(totalVolume, locale)}</b>
                  <span>{t.volume}</span>
                </div>
                <div>
                  <b>{eur(totalOpen, locale)}</b>
                  <span>{t.open}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tooltip Firmenebene */}
        {!project && hovered && tipAnchor && (
          <div className="tip" style={{ left: `${(tipAnchor[0] / W) * 100}%`, top: `${(tipAnchor[1] / H) * 100}%` }}>
            <b>{hovered.name[locale]}</b>
            <div className="row">
              <span>{t.volume}</span>
              <em>{eur(hovered.volume, locale)}</em>
            </div>
            <div className="row">
              <span>{t.open}</span>
              <em>{eur(hovered.open, locale)}</em>
            </div>
            <div className="row">
              <span>Status</span>
              <em>{t.status[hovered.status as keyof T["status"]]}</em>
            </div>
            <div className="row">
              <span>{t.clients}</span>
              <em>{clientName(hovered.client)}</em>
            </div>
          </div>
        )}

        {/* Beleg-Karte */}
        {selected && (
          <div className="evidence" role="dialog" aria-label={t.evidence}>
            <div className="evidence__head">
              <span>
                {t.evidence} · {t.types[selected.type as EvType]}
              </span>
              <button type="button" onClick={() => setSelected(null)}>
                {t.close} ×
              </button>
            </div>
            <div className="evidence__body">
              <h4>{selected[locale]}</h4>
              <div className="doc">
                <div>{selected.src[locale]}</div>
                <div style={{ marginTop: 8 }}>
                  <mark>{selected[locale]}</mark>
                </div>
              </div>
              {"amount" in selected && selected.amount ? (
                <div className="link-line">
                  <span>
                    {t.position} {selected.pos}
                  </span>
                  <span className="dim__line" />
                  <b>{selected.amount}</b>
                </div>
              ) : null}
            </div>
          </div>
        )}

        <span className="twin__tag">{t.synthetic}</span>
      </div>

      {project && (
        <div className="timeline">
          <label htmlFor="tl">{t.timeline}</label>
          <input id="tl" type="range" min={0} max={data.days} step={1} value={day} onChange={(e) => setDay(Number(e.target.value))} />
          <span style={{ minWidth: 70, textAlign: "right" }}>
            {locale === "de" ? "Tag" : "Day"} {day}
          </span>
          <button type="button" className="btn btn--line btn--sm" onClick={close}>
            ← {t.back}
          </button>
        </div>
      )}
    </div>
  );
}
