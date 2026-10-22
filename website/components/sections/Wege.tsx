"use client";

import { useEffect, useState } from "react";
import type { Messages } from "@/lib/i18n";

type T = Messages["wege"];

function Wave() {
  const bars = [6, 12, 8, 14, 5, 10, 13, 7, 11, 4, 9, 12, 6];
  return (
    <span className="wave" aria-hidden="true">
      {bars.map((h, i) => <i key={i} style={{ height: h }} />)}
    </span>
  );
}

/** WhatsApp-Verlauf, der sich selbst abspielt: Foto, Sprachnachricht, Rückmeldung, Bestätigung, Eintrag. */
function Chat({ c }: { c: T["chat"] }) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setStep(0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setStep(5);
      return;
    }
    const timers = [700, 1700, 3300, 4700, 5600].map((ms, i) => window.setTimeout(() => setStep(i + 1), ms));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  return (
    <div className="chat">
      <div className="chat__head"><span>{c.title}</span><span>●</span></div>
      <div className="chat__body" aria-live="polite">
        {step >= 1 && (
          <div className="bubble bubble--me">
            <div className="photo">IMG_2417.jpg</div>
          </div>
        )}
        {step >= 2 && (
          <div className="bubble bubble--me">
            <div className="bubble__voice"><span>▶</span><Wave /><span>{c.voice}</span></div>
            <div style={{ marginTop: 6, opacity: 0.75, fontSize: 13 }}>„{c.transcript}“</div>
          </div>
        )}
        {step >= 3 && <div className="bubble bubble--bot">{c.agent}</div>}
        {step >= 4 && (
          <div className="quick" style={{ alignSelf: "flex-end" }}>
            <span style={{ background: "#1d3bff", color: "#fff" }}>{c.confirm} ✓</span>
          </div>
        )}
        {step >= 5 && (
          <div className="entry">
            <b>✓ {c.entry}</b>
            {c.entryDetail}
          </div>
        )}
      </div>
      <button type="button" className="replay" onClick={() => setRun((r) => r + 1)}>↻ {c.replay}</button>
    </div>
  );
}

/** Schema für Anbinden und Einspielen: Quellen laufen in den Zwilling. */
function FlowMap({ items, mode }: { items: string[]; mode: string }) {
  return (
    <div className="flowmap">
      <svg viewBox="0 0 420 330" role="img" aria-label={items.join(", ")}>
        {items.map((it, i) => {
          const y = 50 + i * 76;
          const path = `M150,${y} C230,${y} 230,165 300,165`;
          return (
            <g key={it}>
              <rect x="10" y={y - 18} width="140" height="36" fill="#fff" stroke="#0a1020" strokeWidth="1.2" />
              <text x="22" y={y + 4} fontFamily="var(--font-mono)" fontSize="12" fill="#0a1020">{it}</text>
              <path d={path} fill="none" stroke="#1d3bff" strokeOpacity=".35" strokeDasharray={mode === "einspielen" ? "4 4" : "0"} />
              <circle r="3.5" fill="#1d3bff">
                <animateMotion dur="2.4s" repeatCount="indefinite" path={path} begin={`${i * 0.45}s`} />
              </circle>
            </g>
          );
        })}
        <rect x="300" y="115" width="110" height="100" fill="#1d3bff" />
        <text x="355" y="160" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="#fff">ENDPOINT.</text>
        <text x="355" y="180" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="#fff" fillOpacity=".75">TWIN</text>
      </svg>
    </div>
  );
}

export function Wege({ t }: { t: T }) {
  const [tab, setTab] = useState(2);
  const cur = t.tabs[tab];
  return (
    <section id="wege" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className="wege">
          <div>
            <div className="tabs" role="tablist">
              {t.tabs.map((tb, i) => (
                <button key={tb.key} role="tab" type="button" aria-selected={i === tab} aria-controls="wege-panel" onClick={() => setTab(i)}>
                  {String(i + 1).padStart(2, "0")} {tb.title}
                </button>
              ))}
            </div>
            <p className="wege__text">{cur.text}</p>
            <ul className="chips">
              {cur.items.map((it) => <li key={it}>{it}</li>)}
            </ul>
          </div>
          <div className="stage" id="wege-panel" role="tabpanel">
            {cur.key === "zurufen" ? <Chat c={t.chat} /> : <FlowMap key={cur.key} items={cur.items} mode={cur.key} />}
          </div>
        </div>
      </div>
    </section>
  );
}
