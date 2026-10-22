"use client";

import { useEffect, useRef, useState } from "react";
import type { Messages } from "@/lib/i18n";

type T = Messages["solution"]["flow"];

const INK = "#0a1020";
const ULTRA = "#1d3bff";
const LOOP = 9; // Sekunden pro Durchlauf
const STEP = 0.9; // Abstand zwischen zwei Eingängen

/* Maße der Eingangsspalte, damit die Verbindungslinien exakt an den Kacheln ansetzen. */
const H = 452;
const CHIP = 40;
const GAP = 6;
const GROUP_GAP = 14;

function chipCenters(groupSizes: number[]): number[] {
  const total = groupSizes.reduce((s, n) => s + n * CHIP + (n - 1) * GAP, 0) + (groupSizes.length - 1) * GROUP_GAP;
  let y = (H - total) / 2;
  const centers: number[] = [];
  groupSizes.forEach((n) => {
    for (let i = 0; i < n; i++) centers.push(y + i * (CHIP + GAP) + CHIP / 2);
    y += n * CHIP + (n - 1) * GAP + GROUP_GAP;
  });
  return centers;
}

function Icon({ k }: { k: string }) {
  const s = { stroke: INK, strokeWidth: 1.4, fill: "none" };
  const u = { stroke: ULTRA, strokeWidth: 1.4, fill: "none" };
  switch (k) {
    case "erp":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><ellipse cx="11" cy="5" rx="7" ry="2.5" {...s} /><path d="M4 5v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5M4 11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" {...s} /></svg>);
    case "ava":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="4" y="2.5" width="14" height="17" {...s} /><path d="M7 6h8" {...u} /><path d="M7.5 10h1M10.5 10h1M13.5 10h1M7.5 13h1M10.5 13h1M13.5 13h1M7.5 16h1M10.5 16h1M13.5 16h1" {...s} /></svg>);
    case "mail":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="5" width="17" height="12" {...s} /><path d="M3 6l8 6 8-6" {...u} /></svg>);
    case "pdf":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M5 2.5h8l4 4v13H5z" {...s} /><path d="M13 2.5v4h4" {...s} /><path d="M8 11h6M8 14h6M8 17h4" {...u} /></svg>);
    case "plan":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="3.5" width="17" height="15" {...s} /><path d="M9 3.5v8H2.5M9 11.5h5v7M14 3.5v4h5.5" {...u} /></svg>);
    case "xls":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="3" y="3" width="16" height="16" {...s} /><path d="M3 8h16M3 13h16M9 3v16" {...s} /><path d="M12 15.5l4-4" {...u} /></svg>);
    case "regie":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M5 2.5h12v17H5z" {...s} /><path d="M8 7h6M8 10h6" {...s} /><path d="M8 15.5c1.5-2 2.5 1 4-1s2 1 3 0" {...u} /></svg>);
    case "foto":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="6" width="17" height="12" {...s} /><path d="M7.5 6l1.5-2.5h4L14.5 6" {...s} /><circle cx="11" cy="12" r="3.2" {...u} /></svg>);
    default:
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 2.8a8.2 8.2 0 0 0-7.1 12.3L2.8 19.2l4.2-1.1A8.2 8.2 0 1 0 11 2.8z" {...s} /><path d="M8 9.5c.5 2 2.2 3.8 4.5 4.5l1.3-1.3 1.8 1" {...u} /></svg>);
  }
}

/**
 * Der Zwilling in zwei Ebenen: oben der Betrieb (Firmenwissen und alle Projekte),
 * darunter ein Projekt bis zur einzelnen Position mit ihren Belegen.
 * Inhalte folgen der Schräge der Ebene, damit nichts über den Rand ragt.
 */
const SKEW = 56;
const P1 = { y: 14, h: 162 };
const P2 = { y: 246, h: 180 };
const shift = (plane: { y: number; h: number }, y: number) => -SKEW * ((y - plane.y) / plane.h);

function Plane({ y, h, label, active }: { y: number; h: number; label: string; active?: boolean }) {
  const pts = `${10 + SKEW},${y} ${430},${y} ${430 - SKEW},${y + h} ${10},${y + h}`;
  return (
    <g>
      <polygon points={pts} fill={active ? "#f5f7ff" : "#ffffff"} stroke={active ? ULTRA : INK} strokeOpacity={active ? 0.9 : 0.5} strokeWidth="1.2" />
      <polygon points={`${10},${y + h} ${430 - SKEW},${y + h} ${430 - SKEW},${y + h + 6} ${10},${y + h + 6}`} fill={active ? "#dde3ff" : "#e3e8f0"} stroke={INK} strokeOpacity=".25" />
      <text x={10 + SKEW + 16} y={y + 22} fontFamily="var(--font-mono)" fontSize="10.5" fill={ULTRA} letterSpacing="1">
        {label.toUpperCase()}
      </text>
    </g>
  );
}

function Box({ x, y, w, h, top, bottom, hi, flash }: { x: number; y: number; w: number; h: number; top: string; bottom?: string; hi?: boolean; flash?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={hi ? ULTRA : "#ffffff"} stroke={hi ? ULTRA : INK} strokeOpacity={hi ? 1 : 0.35} />
      {flash !== undefined && <rect x={x} y={y} width={w} height={h} fill={ULTRA} style={{ animation: `evFlash ${LOOP}s ease ${flash.toFixed(1)}s infinite`, fillOpacity: 0 }} />}
      {bottom ? (
        <>
          <text x={x + 7} y={y + 11} fontFamily="var(--font-mono)" fontSize="8" letterSpacing=".6" fill={hi ? "#ffffff" : INK} fillOpacity={hi ? 0.8 : 0.5}>
            {top}
          </text>
          <text x={x + 7} y={y + h - 7} fontFamily="var(--font-sans)" fontSize="11" fontWeight="600" fill={hi ? "#ffffff" : INK}>
            {bottom}
          </text>
        </>
      ) : (
        <text x={x + w / 2} y={y + h / 2 + 3.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={hi ? "#ffffff" : INK}>
          {top}
        </text>
      )}
    </g>
  );
}

function Twin({ t }: { t: T }) {
  const projectWord = t.projectWord.toUpperCase();
  // Ebene 1: Firmenwissen und Projekte
  const colBase = [98, 202, 306];
  const w1 = 96;
  const knowY = 64;
  const rowsY = [98, 134];
  const tile = (i: number) => {
    const y = rowsY[Math.floor(i / 3)];
    return { x: colBase[i % 3] + shift(P1, y), y };
  };
  const wien = tile(0);

  // Ebene 2: das Projekt als einfache Aufstellung seiner Leistungen
  const left = (y: number) => 86 + shift(P2, y);
  const tw = 326;
  const cols = [0, 128, 178, 240, tw]; // Position links, Zahlen rechtsbündig
  const headY = 300;
  const rowY = [322, 344, 366, 388];
  const totalY = 414;

  return (
    <svg viewBox="0 0 440 452" role="img" aria-label={`${t.twin}: ${t.level1}, ${t.level2}`}>
      {/* Verbindung: Projekt aus Ebene 1 öffnet Ebene 2 */}
      <path d={`M${wien.x},${wien.y + 30} L${left(headY)},${headY - 12}`} stroke={ULTRA} strokeOpacity=".55" strokeDasharray="3 4" />
      <path d={`M${wien.x + w1},${wien.y + 30} L${left(headY) + tw},${headY - 12}`} stroke={ULTRA} strokeOpacity=".55" strokeDasharray="3 4" />

      {/* Ebene 2: Projekt */}
      <Plane y={P2.y} h={P2.h} label={t.level2} active />
      <text x={left(282)} y="282" fontFamily="var(--font-mono)" fontSize="9" fill={INK} fillOpacity=".45" letterSpacing=".8">
        {t.level2Caption.toUpperCase()}
      </text>
      {t.tableHead.map((h, i) => (
        <text key={h} x={left(headY) + cols[i]} y={headY} textAnchor={i === 0 ? "start" : "end"} fontFamily="var(--font-mono)" fontSize="8" fill={INK} fillOpacity=".5" letterSpacing=".6">
          {h.toUpperCase()}
        </text>
      ))}
      <line x1={left(headY + 6)} y1={headY + 6} x2={left(headY + 6) + tw} y2={headY + 6} stroke={INK} strokeOpacity=".6" />
      {t.tableRows.map((r, ri) => {
        const y = rowY[ri];
        const x0 = left(y);
        const open = r[4] !== "✓";
        return (
          <g key={r[0]}>
            {open && <rect x={x0 - 6} y={y - 14} width={tw + 12} height="20" fill={ULTRA} fillOpacity=".08" style={{ animation: `evFlash ${LOOP}s ease ${(2.4 + ri * 0.7).toFixed(1)}s infinite` }} />}
            <text x={x0} y={y} fontFamily="var(--font-sans)" fontSize="10.5" fontWeight="600" fill={INK}>
              {r[0]}
            </text>
            {r.slice(1).map((v, ci) => (
              <text key={ci} x={x0 + cols[ci + 1]} y={y} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill={ci === 3 ? ULTRA : INK} fillOpacity={ci === 3 ? 1 : 0.75} fontWeight={ci === 3 ? 600 : 400}>
                {v}
              </text>
            ))}
            <line x1={x0} y1={y + 7} x2={x0 + tw} y2={y + 7} stroke={INK} strokeOpacity=".1" />
          </g>
        );
      })}
      <text x={left(totalY)} y={totalY} fontFamily="var(--font-mono)" fontSize="9" fill={INK} fillOpacity=".6" letterSpacing=".6">
        {t.tableTotalLabel.toUpperCase()}
      </text>
      <text x={left(totalY) + tw} y={totalY} textAnchor="end" fontFamily="var(--font-sans)" fontSize="13" fontWeight="600" fill={ULTRA}>
        {t.tableTotal}
      </text>

      {/* Ebene 1: Betrieb */}
      <Plane y={P1.y} h={P1.h} label={t.level1} />
      <text x={98 + shift(P1, 56)} y="56" fontFamily="var(--font-mono)" fontSize="9" fill={INK} fillOpacity=".45" letterSpacing="1">
        {t.companyKnowledge.toUpperCase()}
      </text>
      {t.companyTags.map((tag, i) => (
        <g key={tag}>
          <rect x={colBase[i] + shift(P1, knowY)} y={knowY} width={w1} height="20" fill="#f4f6f9" stroke={INK} strokeOpacity=".35" />
          <text x={colBase[i] + shift(P1, knowY) + w1 / 2} y={knowY + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill={INK}>
            {tag}
          </text>
        </g>
      ))}
      {t.projects.map((p, i) => {
        const [name] = p as [string, number, number];
        const { x, y } = tile(i);
        return <Box key={name} x={x} y={y} w={w1} h={30} top={projectWord} bottom={name} hi={i === 0} />;
      })}

      {/* Punkt, der von Ebene 1 in Ebene 2 wandert */}
      <circle r="3.5" fill={ULTRA}>
        <animateMotion dur="2.2s" repeatCount="indefinite" path={`M${wien.x + w1 / 2},${wien.y + 30} L${left(headY) + tw / 2},${headY - 12}`} />
      </circle>
    </svg>
  );
}

function useCountUp(target: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / 1600);
        setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [target]);
  return { ref, value };
}

export function Flow({ t, locale }: { t: T; locale: "de" | "en" }) {
  const groups = t.groups.map((g, gi) => ({ label: g, items: t.items.filter((it) => it.g === gi) }));
  const centers = chipCenters(groups.map((g) => g.items.length));
  const mid = H / 2;
  const bars = [0.35, 0.6, 0.25, 0.8, 1, 0.45, 0.3];
  const [hover, setHover] = useState<number | null>(null);
  const [pulse, setPulse] = useState<number | null>(null);
  const dotRefs = useRef<(SVGGElement | null)[]>([]);
  const count = t.items.length;

  // Gemeinsamer Takt: Kachel leuchtet auf und im selben Moment startet ihr Punkt Richtung Zwilling.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const fire = () => {
      setPulse(i);
      dotRefs.current[i]?.querySelectorAll<SVGAnimationElement>("animate, animateMotion").forEach((a) => a.beginElement());
      i = (i + 1) % count;
    };
    fire();
    const id = window.setInterval(fire, STEP * 1000);
    return () => window.clearInterval(id);
  }, [count]);
  const { ref: totalRef, value } = useCountUp(t.openValue);
  const money = locale === "de" ? `${new Intl.NumberFormat("de-DE").format(value)} €` : new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
  let n = -1;

  return (
    <div className="flow">
      <div className="flow__cols" aria-hidden="true">
        <div className="flow__head">01 · {t.inputs}</div>
        <div />
        <div className="flow__head" style={{ textAlign: "center" }}>02 · {t.twin}</div>
        <div />
        <div className="flow__head">03 · {t.output}</div>
      </div>

      <div className="flow__grid">
        {/* Eingänge */}
        <div>
          <p className="flow__mhead">01 · {t.inputs}</p>
          <div className="inputs">
            {groups.map((g) => (
              <div className="ingroup" key={g.label}>
                <span className="ingroup__label">{g.label}</span>
                <div className="ingroup__items">
                  {g.items.map((it) => {
                    n += 1;
                    const idx = n;
                    return (
                      <div
                        className={`chip ${hover === idx ? "chip--on" : ""} ${pulse === idx ? "chip--pulse" : ""}`}
                        key={it.k}
                        onMouseEnter={() => setHover(idx)}
                        onMouseLeave={() => setHover(null)}
                      >
                        <Icon k={it.k} />
                        <span>
                          {it.label}
                          {it.detail && <small>{it.detail}</small>}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verbindungen Eingänge → Zwilling */}
        <svg className="connector connector--h" viewBox={`0 0 80 ${H}`} preserveAspectRatio="none" style={{ height: H }} aria-hidden="true">
          {centers.map((y, i) => {
            const d = `M0,${y} C40,${y} 40,${mid} 80,${mid}`;
            const on = hover === i || pulse === i;
            return (
              <g key={i} ref={(el) => { dotRefs.current[i] = el; }}>
                <path d={d} fill="none" stroke={ULTRA} strokeOpacity={on ? 0.9 : 0.22} strokeWidth={on ? 1.8 : 1} vectorEffect="non-scaling-stroke" style={{ transition: "stroke-opacity .3s" }} />
                <circle r="3.2" fill={ULTRA} opacity="0">
                  <animateMotion begin="indefinite" dur={`${STEP * 1.1}s`} path={d} fill="freeze" />
                  <animate attributeName="opacity" begin="indefinite" dur={`${STEP * 1.1}s`} values="1;1;0" keyTimes="0;0.92;1" fill="freeze" />
                </circle>
              </g>
            );
          })}
        </svg>
        <svg className="connector connector--v" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50,0 V56" stroke={ULTRA} strokeOpacity=".35" strokeDasharray="3 4" />
          <circle r="3" fill={ULTRA}>
            <animateMotion dur="1.6s" repeatCount="indefinite" path="M50,0 V56" />
          </circle>
        </svg>

        {/* Zwilling */}
        <div className="twin">
          <p className="flow__mhead">02 · {t.twin}</p>
          <Twin t={t} />
        </div>

        {/* Verbindungen Zwilling → Ergebnis */}
        <svg className="connector connector--h" viewBox={`0 0 80 ${H}`} preserveAspectRatio="none" style={{ height: H }} aria-hidden="true">
          {[-46, 0, 46].map((dy, i) => {
            const d = `M0,${mid} C40,${mid} 40,${mid + dy} 80,${mid + dy}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={ULTRA} strokeOpacity=".3" vectorEffect="non-scaling-stroke" />
                <circle r="3" fill={ULTRA}>
                  <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
                </circle>
              </g>
            );
          })}
        </svg>
        <svg className="connector connector--v" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50,0 V56" stroke={ULTRA} strokeOpacity=".35" strokeDasharray="3 4" />
          <circle r="3" fill={ULTRA}>
            <animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M50,0 V56" />
          </circle>
        </svg>

        {/* Ergebnis: Schlussrechnung */}
        <div>
          <p className="flow__mhead">03 · {t.output}</p>
          <div className="out">
            <div className="out__head">
              <span>{t.outputTitle}</span>
              <b>{t.outputProject}</b>
            </div>
            <ul className="checks">
              {t.checks.map((c, i) => (
                <li key={c}>
                  <span className="tick" style={{ animationDelay: `${(2.2 + i * 0.6).toFixed(1)}s` }} aria-hidden="true">
                    ✓
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="out__foot" ref={totalRef}>
              <div className="out__total">
                <span>{t.openLabel}</span>
                <b aria-label={String(t.openValue)}>+ {money}</b>
              </div>
              <div className="bars" aria-hidden="true">
                {bars.map((h, i) => (
                  <i key={i} className={i === 4 ? "hi" : undefined} style={{ height: `${h * 100}%`, animationDelay: `${(i * 0.12).toFixed(2)}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <p className="twin__caption">{t.caption}</p>
      <span className="flow__sample">{t.sample}</span>
    </div>
  );
}
