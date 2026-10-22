"use client";

import { useState } from "react";
import { legalPath, type Locale, type Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Dim } from "@/components/ui/Dim";
import { Calendar, type Slot } from "@/components/sections/Calendar";

type Errors = Partial<Record<"name" | "email" | "slot" | "consent", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function Contact({ t, locale }: { t: Messages["contact"]; locale: Locale }) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const [slot, setSlot] = useState<Slot>(null);
  const lang = locale === "de" ? "de-AT" : "en-GB";
  const fmtLong = new Intl.DateTimeFormat(lang, { weekday: "long", day: "numeric", month: "long" });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(fd.get("name") ?? "").trim()) next.name = t.errorName;
    if (!EMAIL.test(String(fd.get("email") ?? "").trim())) next.email = t.errorEmail;
    if (!slot) next.slot = t.errorSlot;
    if (!fd.get("consent")) next.consent = t.errorConsent;
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  const clear = (key: keyof Errors) => () => errors[key] && setErrors((er) => ({ ...er, [key]: undefined }));
  const pickSlot = (v: Slot) => {
    setSlot(v);
    if (v) clear("slot")();
  };

  return (
    <section id="demo" className="section">
      <div className="wrap contact">
        <div className="contact__intro">
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-section">{t.title}</h2>
          <p className="lead">{t.sub}</p>
          <ul className="contact__points">
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mail-line">
            <span>{t.mailLabel}: </span>
            <Ph text={t.mail} />
          </p>
        </div>

        {sent ? (
          <div className="form">
            <Dim label={t.success} draw />
            {slot && (
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                {fmtLong.format(slot.date)} · {slot.time} ({t.slotTimezone})
              </p>
            )}
            <div className="success">
              <Ph text={t.successNote} />
            </div>
          </div>
        ) : (
          <form className="form" onSubmit={onSubmit} noValidate>
            <Calendar t={t} locale={locale} value={slot} onChange={pickSlot} error={errors.slot} />

            <div className="form__row2">
              <div className="field">
                <label htmlFor="f-name">{t.fields.name} *</label>
                <input id="f-name" name="name" autoComplete="name" aria-invalid={!!errors.name} aria-describedby="e-name" onChange={clear("name")} />
                {errors.name && <span id="e-name" className="field__err">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="f-company">{t.fields.company}</label>
                <input id="f-company" name="company" autoComplete="organization" />
              </div>
            </div>
            <div className="form__row2">
              <div className="field">
                <label htmlFor="f-email">{t.fields.email} *</label>
                <input id="f-email" name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} aria-describedby="e-email" onChange={clear("email")} />
                {errors.email && <span id="e-email" className="field__err">{errors.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="f-phone">
                  {t.fields.phone}
                  <small>{t.optional}</small>
                </label>
                <input id="f-phone" name="phone" type="tel" autoComplete="tel" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-msg">
                {t.fields.message}
                <small>{t.optional}</small>
              </label>
              <textarea id="f-msg" name="message" placeholder={t.messagePlaceholder} />
            </div>
            <div>
              <label className="consent">
                <input type="checkbox" name="consent" aria-invalid={!!errors.consent} onChange={clear("consent")} />
                <span>
                  {t.consent} <a href={legalPath(locale, "datenschutz")}>↗</a>
                </span>
              </label>
              {errors.consent && <span className="field__err">{errors.consent}</span>}
            </div>
            <div>
              <button type="submit" className="btn">
                {t.submit} <span className="arrow">→</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
