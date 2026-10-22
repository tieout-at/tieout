"use client";

import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { Locale, Messages } from "@/lib/i18n";

type T = Messages["solution"]["timeline"];

/**
 * Problem als Projektverlauf: oben die Änderungen auf der Baustelle über die Wochen,
 * unten, was davon in der Schlussrechnung landet. Umschalter vergleicht heute mit Tieout.
 */
export function Timeline({ t, locale }: { t: T; locale: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0); // wie viele Ereignisse schon sichtbar sind
  const [withEp, setWithEp] = useState(false);
  const [run, setRun] = useState(0);
  const [started, setStarted] = useState(false);
  const events = t.events;
  const fmt = (n: number) =>
    locale === "de" ? `${new Intl.NumberFormat("de-DE").format(n)} €` : new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);
  // Reihenfolge für schmale Raster (3 bzw. 2 Spalten): Betrag steht direkt unter seinem Ereignis.
  const ord = (i: number, slot: boolean) =>
    ({ "--o3": Math.floor(i / 3) * 6 + (slot ? 3 : 0) + (i % 3), "--o2": Math.floor(i / 2) * 4 + (slot ? 2 : 0) + (i % 2) }) as React.CSSProperties;

  // Startet, sobald die Zeitleiste im Bild ist.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setStarted(true), io.disconnect()), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(events.length);
      return;
    }
    setWithEp(false);
    setStep(0);
    const timers = events.map((_, i) => window.setTimeout(() => setStep(i + 1), 500 + i * 650));
    // Nach dem Durchlauf einmal automatisch auf „Mit Tieout“ umschalten.
    timers.push(window.setTimeout(() => setWithEp(true), 500 + events.length * 650 + 1800));
    return () => timers.forEach(clearTimeout);
  }, [started, run, events]);

  const missing = events.filter((e) => !e.billed);
  const missingSum = missing.reduce((s, e) => s + e.amount, 0);
  const done = step >= events.length;
  const summary = (withEp ? t.summaryWith : t.summaryWithout).replace("{n}", String(missing.length)).replace("{total}", String(events.length));

  return (
    <div className="tl" ref={ref}>
      <div className="tl__head">
        <span className="tl__title">{t.timelineTitle}</span>
        <div className="tl__switch" role="group" aria-label={t.hint} data-on={withEp ? "with" : "without"}>
          <span className="tl__thumb" aria-hidden="true" />
          <button type="button" aria-pressed={!withEp} onClick={() => setWithEp(false)}>{t.without}</button>
          <button type="button" aria-pressed={withEp} onClick={() => setWithEp(true)}>{t.with}</button>
        </div>
      </div>

      <div className="tl__grid">
        <span className="tl__track">{t.trackSite}</span>
        {events.map((e, i) => (
          <div key={i} className={`tl__event ${i < step ? "is-in" : ""}`} style={ord(i, false)}>
            <span className="tl__week">{e.week}</span>
            <span className="tl__type">{e.type}</span>
            <p>{e.text}</p>
          </div>
        ))}

        <span className="tl__axis" aria-hidden="true" />
        {events.map((e, i) => {
          const ok = e.billed || withEp;
          return (
            <div key={i} className={`tl__link ${i < step ? "is-in" : ""} ${ok ? "is-ok" : "is-miss"}`} aria-hidden="true">
              <span />
            </div>
          );
        })}

        <span className="tl__track">{t.trackInvoice}</span>
        {events.map((e, i) => {
          const found = !e.billed && withEp;
          const ok = e.billed || withEp;
          return (
            <div key={i} className={`tl__slot ${i < step ? "is-in" : ""} ${ok ? "is-ok" : "is-miss"} ${found ? "is-found" : ""}`} style={ord(i, true)}>
              <b>{fmt(e.amount)}</b>
              <span>{found ? t.found : ok ? t.billed : t.missing}</span>
            </div>
          );
        })}
      </div>

      <div className={`tl__foot ${done ? "is-in" : ""}`}>
        <p className="tl__summary" aria-live="polite">{summary}</p>
        <p className={`tl__total ${withEp ? "is-with" : ""}`}>{withEp ? `+ ${fmt(missingSum)}` : `− ${fmt(missingSum)}`}</p>
        <button type="button" className="tl__replay" onClick={() => { setStarted(true); setRun((r) => r + 1); }}>↻ {t.replay}</button>
      </div>
      <span className="tl__sample">{t.sample}</span>
    </div>
  );
}
