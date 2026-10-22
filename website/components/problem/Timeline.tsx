"use client";

import { useEffect, useRef, useState } from "react";
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
  const armed = useRef(true); // erst nach dem Verlassen wieder startbereit
  const events = t.events;
  const fmt = (n: number) =>
    locale === "de" ? `${new Intl.NumberFormat("de-DE").format(n)} €` : new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

  // Startet jedes Mal neu, wenn die Zeitleiste ins Bild kommt; beim Verlassen zurück auf Anfang.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.35 && armed.current) {
          armed.current = false;
          setRun((r) => r + 1);
        } else if (!e.isIntersecting) {
          armed.current = true;
          setRun(0);
        }
      },
      { threshold: [0, 0.35] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ablauf in rund 3 Sekunden: Ereignisse nacheinander, danach Umschalten auf „Mit tieout“.
  useEffect(() => {
    setWithEp(false);
    if (run === 0) {
      setStep(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(events.length);
      setWithEp(true);
      return;
    }
    setStep(0);
    const timers = events.map((_, i) => window.setTimeout(() => setStep(i + 1), 150 + i * 260));
    timers.push(window.setTimeout(() => setWithEp(true), 150 + events.length * 260 + 900));
    return () => timers.forEach(clearTimeout);
  }, [run, events]);

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
          <div key={i} className={`tl__event ${i < step ? "is-in" : ""}`}>
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
            <div key={i} className={`tl__slot ${i < step ? "is-in" : ""} ${ok ? "is-ok" : "is-miss"} ${found ? "is-found" : ""}`}>
              <b>{fmt(e.amount)}</b>
              <span>{found ? t.found : ok ? t.billed : t.missing}</span>
            </div>
          );
        })}
      </div>

      <div className={`tl__foot ${done ? "is-in" : ""}`}>
        <p className="tl__summary" aria-live="polite">{summary}</p>
        <p className={`tl__total ${withEp ? "is-with" : ""}`}>{withEp ? `+ ${fmt(missingSum)}` : `− ${fmt(missingSum)}`}</p>
      </div>
      <span className="tl__sample">{t.sample}</span>
    </div>
  );
}
