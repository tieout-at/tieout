"use client";

import { useEffect, useState } from "react";
import type { Locale, Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";

const TIMES = ["09:00", "09:30", "10:30", "11:00", "13:00", "14:00", "14:30", "16:00"];
const HORIZON_DAYS = 60;

type T = Messages["contact"];
export type Slot = { date: Date; time: string } | null;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Dummy-Verfügbarkeit: Werktage ab morgen, die Uhrzeiten wechseln je Tag, damit es echt wirkt. */
function timesFor(d: Date): string[] {
  const seed = d.getDate() + d.getMonth() * 31;
  return TIMES.filter((_, i) => (seed + i * 3) % 4 !== 0);
}

/**
 * Terminwahl: links ein Monatskalender zum Durchblättern, rechts die freien Zeiten am gewählten Tag.
 * Vorschau ohne echte Verfügbarkeit, die Kalender-Anbindung ist Platzhalter.
 */
export function Calendar({ t, locale, value, onChange, error }: { t: T; locale: Locale; value: Slot; onChange: (s: Slot) => void; error?: string }) {
  const [today, setToday] = useState<Date | null>(null);
  const [month, setMonth] = useState<Date | null>(null);
  const [day, setDay] = useState<Date | null>(null);
  const lang = locale === "de" ? "de-AT" : "en-GB";

  // Erst im Browser rechnen, sonst weicht das Datum vom statischen Build ab.
  useEffect(() => {
    const now = startOfDay(new Date());
    setToday(now);
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
  }, []);

  if (!today || !month) return <div className="cal cal--loading" />;

  const last = new Date(today);
  last.setDate(last.getDate() + HORIZON_DAYS);
  const bookable = (d: Date) => {
    const wd = d.getDay();
    return d > today && d <= last && wd !== 0 && wd !== 6;
  };

  const first = new Date(month);
  const offset = (first.getDay() + 6) % 7; // Montag zuerst
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  while (cells.length % 7) cells.push(null);

  const canPrev = month > new Date(today.getFullYear(), today.getMonth(), 1);
  const canNext = new Date(month.getFullYear(), month.getMonth() + 1, 1) <= last;
  const shift = (n: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + n, 1));
  const same = (a: Date | null, b: Date | null) => !!a && !!b && a.getTime() === b.getTime();
  const monthName = new Intl.DateTimeFormat(lang, { month: "long", year: "numeric" }).format(month);
  const dayName = day ? new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" }).format(day) : "";

  return (
    <fieldset className="cal">
      <legend>
        {t.slotLabel} * <small>{t.slotTimezone}</small>
      </legend>
      <div className="cal__body">
        <div className="cal__month">
          <div className="cal__nav">
            <button type="button" onClick={() => shift(-1)} disabled={!canPrev} aria-label={t.prevMonth}>←</button>
            <b>{monthName}</b>
            <button type="button" onClick={() => shift(1)} disabled={!canNext} aria-label={t.nextMonth}>→</button>
          </div>
          <div className="cal__grid" role="grid">
            {t.weekdays.map((w) => (
              <span key={w} className="cal__wd">{w}</span>
            ))}
            {cells.map((d, i) =>
              d ? (
                <button
                  key={i}
                  type="button"
                  className={`cal__day ${same(d, today) ? "is-today" : ""}`}
                  disabled={!bookable(d)}
                  aria-pressed={same(d, day)}
                  onClick={() => {
                    setDay(d);
                    if (value && !same(value.date, d)) onChange(null);
                  }}
                >
                  {d.getDate()}
                </button>
              ) : (
                <span key={i} />
              ),
            )}
          </div>
        </div>
        <div className="cal__times">
          {day ? (
            <>
              <p className="cal__dayname">
                {t.slotTimesFor} <b>{dayName}</b>
              </p>
              <div className="cal__list">
                {timesFor(day).map((tm) => (
                  <button key={tm} type="button" className="cal__time" aria-pressed={same(value?.date ?? null, day) && value?.time === tm} onClick={() => onChange({ date: day, time: tm })}>
                    {tm}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="cal__empty">{t.slotNoDay}</p>
          )}
        </div>
      </div>
      {error && <span className="field__err">{error}</span>}
      <small className="slots__note">
        <Ph text={t.slotPlaceholder} />
      </small>
    </fieldset>
  );
}
