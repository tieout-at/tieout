"use client";

import { useEffect, useRef, useState } from "react";

export const SECTION_IDS = ["start", "problem", "zwilling", "wege", "anwendungen", "video", "prinzipien", "team", "kontakt"];

/**
 * Messpunkt-Navigation: senkrechte Maßkette am rechten Rand.
 * Das Fadenkreuz markiert den aktiven Abschnitt, ein feiner Strich den Fortschritt darin.
 */
export function MeasureNav({ labels, aria }: { labels: string[]; aria: string }) {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [ticks, setTicks] = useState<number[]>([]);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measure = () => {
      const list = listRef.current;
      if (!list) return;
      const top = list.getBoundingClientRect().top;
      setTicks(Array.from(list.querySelectorAll<HTMLElement>(".mnav__tick")).map((el) => el.getBoundingClientRect().top - top));
    };
    const onScroll = () => {
      const y = window.scrollY + window.innerHeight * 0.35;
      let idx = 0;
      SECTION_IDS.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) idx = i;
      });
      const cur = document.getElementById(SECTION_IDS[idx]);
      const next = document.getElementById(SECTION_IDS[idx + 1] ?? "");
      if (cur) {
        const start = cur.offsetTop;
        const end = next ? next.offsetTop : document.body.scrollHeight - window.innerHeight * 0.65;
        setProgress(Math.min(1, Math.max(0, (y - start) / Math.max(1, end - start))));
      }
      setActive(idx);
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

  const crossTop = (ticks[active] ?? 0) - 11;
  const progTop = ticks[active] ?? 0;
  const progLen = ((ticks[active + 1] ?? progTop) - progTop) * progress;

  return (
    <nav className={`mnav ${open ? "mnav--open" : ""}`} aria-label={aria} onClick={() => setOpen((o) => !o)} onMouseLeave={() => setOpen(false)}>
      <div className="mnav__rail" ref={listRef}>
        <span className="mnav__progress" style={{ top: progTop, height: progLen }} aria-hidden="true" />
        <svg className="mnav__cross" style={{ top: crossTop }} viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="6" fill="#f4f6f9" stroke="#1d3bff" strokeWidth="1.5" />
          <path d="M11 0v7M11 15v7M0 11h7M15 11h7" stroke="#1d3bff" strokeWidth="1.5" />
          <circle cx="11" cy="11" r="1.6" fill="#1d3bff" />
        </svg>
        <ol className="mnav__list">
        {SECTION_IDS.map((id, i) => (
          <li key={id} className="mnav__item" aria-current={i === active ? "true" : undefined}>
            <a href={`#${id}`} onClick={(e) => e.stopPropagation()}>
              <span className="mnav__label">
                <span className="mnav__num">{String(i + 1).padStart(2, "0")}</span> {labels[i]}
              </span>
              <span className="mnav__tick" />
            </a>
          </li>
        ))}
        </ol>
      </div>
    </nav>
  );
}
