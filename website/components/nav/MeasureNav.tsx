"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";

export const SECTION_IDS = ["start", "problem", "loesung", "video", "team", "demo"];
/** Abschnitte mit blauem Grund: dort wird die Navigation hell dargestellt. */
const DARK_IDS = ["video"];

/**
 * Messpunkt-Navigation am rechten Rand: senkrechte Maßkette mit allen Abschnitten.
 * Namen sind immer sichtbar, der aktive in Ultramarin mit Fadenkreuz, die anderen grau.
 * Über blauem Grund wird jeder Eintrag einzeln hell, auch wenn die Kante mitten durch die Navigation läuft.
 */
export function MeasureNav({ labels, aria }: { labels: string[]; aria: string }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ticks, setTicks] = useState<number[]>([]);
  const [darkItems, setDarkItems] = useState<boolean[]>([]);
  const [band, setBand] = useState<[number, number] | null>(null); // blauer Bereich auf der Schiene, in px
  const railRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      if (!rail) return;
      const top = rail.getBoundingClientRect().top;
      setTicks(Array.from(rail.querySelectorAll<HTMLElement>(".mnav__tick")).map((el) => el.getBoundingClientRect().top - top));
    };
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.4;
      let idx = 0;
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) idx = i;
      });
      const cur = document.getElementById(SECTION_IDS[idx]);
      const next = document.getElementById(SECTION_IDS[idx + 1] ?? "");
      if (cur) {
        const end = next ? next.offsetTop : document.body.scrollHeight - window.innerHeight * 0.6;
        setProgress(Math.min(1, Math.max(0, (y - cur.offsetTop) / Math.max(1, end - cur.offsetTop))));
      }
      setActive(idx);
      // Welche Einträge liegen über einem blauen Abschnitt?
      const rail = railRef.current;
      if (!rail) return;
      const blue = DARK_IDS.map((id) => document.getElementById(id)?.getBoundingClientRect()).filter((r): r is DOMRect => !!r);
      const onBlue = (y: number) => blue.some((r) => r.top <= y && r.bottom >= y);
      setDarkItems(
        Array.from(rail.querySelectorAll<HTMLElement>(".mnav__item")).map((el) => {
          const r = el.getBoundingClientRect();
          return onBlue(r.top + r.height / 2);
        }),
      );
      const rr = rail.getBoundingClientRect();
      const hit = blue.find((r) => r.bottom > rr.top && r.top < rr.bottom);
      setBand(hit ? [Math.max(0, hit.top - rr.top), Math.min(rr.height, hit.bottom - rr.top)] : null);
    };
    measure();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const tickTop = ticks[active] ?? 0;
  const dark = !!darkItems[active];
  const railBg = band
    ? `linear-gradient(to bottom, var(--ink-15) ${band[0]}px, rgba(255,255,255,.45) ${band[0]}px, rgba(255,255,255,.45) ${band[1]}px, var(--ink-15) ${band[1]}px)`
    : undefined;
  const progLen = ((ticks[active + 1] ?? tickTop) - tickTop) * progress;

  return (
    <nav className="mnav" aria-label={aria}>
      <div className="mnav__rail" ref={railRef} style={railBg ? ({ "--rail": railBg } as React.CSSProperties) : undefined}>
        <span className={`mnav__progress ${dark ? "is-dark" : ""}`} style={{ top: tickTop, height: progLen }} aria-hidden="true" />
        <svg className="mnav__cross" style={{ top: tickTop - 11 }} viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="6" fill={dark ? "#1d3bff" : "#f4f6f9"} stroke={dark ? "#ffffff" : "#1d3bff"} strokeWidth="1.5" />
          <path d="M11 0v7M11 15v7M0 11h7M15 11h7" stroke={dark ? "#ffffff" : "#1d3bff"} strokeWidth="1.5" />
          <circle cx="11" cy="11" r="1.6" fill={dark ? "#ffffff" : "#1d3bff"} />
        </svg>
        <ol className="mnav__list">
          {SECTION_IDS.map((id, i) => (
            <li key={id} className={`mnav__item ${darkItems[i] ? "mnav__item--dark" : ""}`} aria-current={i === active ? "true" : undefined}>
              <a href={`#${id}`}>
                <span className="mnav__label">{labels[i]}</span>
                <span className="mnav__num">{String(i + 1).padStart(2, "0")}</span>
                <span className="mnav__tick" />
              </a>
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
