"use client";

import { useState } from "react";
import { legalPath, type Locale, type Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Dim } from "@/components/ui/Dim";

type Errors = Partial<Record<"name" | "message" | "consent", string>>;

export function Contact({ t, locale }: { t: Messages["contact"]; locale: Locale }) {
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);

  // Vorschau: validiert, versendet aber nichts. Backend ist Platzhalter.
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const next: Errors = {};
    if (!String(fd.get("name") ?? "").trim()) next.name = t.errorName;
    if (!String(fd.get("message") ?? "").trim()) next.message = t.errorMessage;
    if (!fd.get("consent")) next.consent = t.errorConsent;
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };

  const clear = (key: keyof Errors) => () => errors[key] && setErrors((er) => ({ ...er, [key]: undefined }));

  return (
    <section id="kontakt" className="section">
      <div className="wrap contact">
        <div>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h-section">{t.title}</h2>
          <p className="lead">{t.sub}</p>
          <p className="mail-line">
            <span className="muted">{t.mailLabel}: </span>
            <Ph text={t.mail} />
          </p>
        </div>

        {sent ? (
          <div className="form">
            <Dim label={t.success} draw />
            <div className="success">
              <Ph text={t.successNote} />
            </div>
          </div>
        ) : (
          <form className="form" onSubmit={onSubmit} noValidate>
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
            <div className="field">
              <label htmlFor="f-role">{t.fields.role}</label>
              <input id="f-role" name="role" placeholder={t.rolePlaceholder} />
            </div>
            <div className="field">
              <label htmlFor="f-msg">{t.fields.message} *</label>
              <textarea id="f-msg" name="message" aria-invalid={!!errors.message} aria-describedby="e-msg" onChange={clear("message")} />
              {errors.message && <span id="e-msg" className="field__err">{errors.message}</span>}
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
