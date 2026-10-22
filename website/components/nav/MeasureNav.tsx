"use client";

import { useEffect, useRef, useState } from "react";

export const SECTION_IDS = ["start", "problem", "loesung", "video", "team", "demo"];
/** Abschnitte mit blauem Grund: dort wird die Navigation hell dargestellt. */
const DARK_IDS = ["video"];

/**
 * Messpunkt-Navigation am rechten Rand: senkrechte Maßkette mit allen Abschnitten.
 * Namen sind immer sichtbar, der aktive in Ultramarin mit Fadenkreuz, die anderen grau.
 */
export function MeasureNav({ labels, aria }: { labels: string[]; aria: string }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [ticks, setTicks] = useState<number[]>([]);
  const [dark, setDark] = useState(false);
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
      // Liegt die Mitte des Bildschirms in einem blauen Abschnitt?
      const mid = window.innerHeight / 2;
      setDark(
        DARK_IDS.some((id) => {
          const r = document.getElementById(id)?.getBoundingClientRect();
          return !!r && r.top < mid && r.bottom > mid;
        }),
      );
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
  const progLen = ((ticks[active + 1] ?? tickTop) - tickTop) * progress;

  return (
    <nav className={`mnav ${dark ? "mnav--dark" : ""}`} aria-label={aria}>
      <div className="mnav__rail" ref={railRef}>
        <span className="mnav__progress" style={{ top: tickTop, height: progLen }} aria-hidden="true" />
        <svg className="mnav__cross" style={{ top: tickTop - 11 }} viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="6" fill={dark ? "#1d3bff" : "#f4f6f9"} stroke={dark ? "#ffffff" : "#1d3bff"} strokeWidth="1.5" />
          <path d="M11 0v7M11 15v7M0 11h7M15 11h7" stroke={dark ? "#ffffff" : "#1d3bff"} strokeWidth="1.5" />
          <circle cx="11" cy="11" r="1.6" fill={dark ? "#ffffff" : "#1d3bff"} />
        </svg>
        <ol className="mnav__list">
          {SECTION_IDS.map((id, i) => (
            <li key={id} className="mnav__item" aria-current={i === active ? "true" : undefined}>
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
