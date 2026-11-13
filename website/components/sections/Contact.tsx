"use client";

import { useEffect, useRef, useState } from "react";
import { legalPath, type Locale, type Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Dim } from "@/components/ui/Dim";

type T = Messages["contact"];
type ChoiceKey = "need" | "trade" | "size";
type StepKey = ChoiceKey | "details";
type Errors = Partial<Record<"email" | "consent", string>>;

const STEPS: StepKey[] = ["need", "trade", "size", "details"];
const CHOICES: ChoiceKey[] = ["need", "trade", "size"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isChoice = (k: StepKey): k is ChoiceKey => (CHOICES as StepKey[]).includes(k);

/**
 * Section 06 offers two ways to a demo, side by side:
 * the booking in Calendly for visitors who want a time right away, and a short request
 * (three questions answered by click, then the email address) for those who want us to write.
 */
export function Contact({ t, locale }: { t: T; locale: Locale }) {
  return (
    <section id="demo" className="section">
      <div className="wrap contact">
        <div className="contact__intro">
          <p className="eyebrow">{t.eyebrow}</p>
          <div className="contact__headline">
            <h2 className="h-section">{t.title}</h2>
            <p className="lead">{t.sub}</p>
          </div>
          <ul className="contact__points">
            {t.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
          <p className="mail-line">
            <span>{t.mailLabel}: </span>
            <a href={`mailto:${t.mail}`}>{t.mail}</a>
          </p>
        </div>
        <Booking t={t} />
        <Request t={t} locale={locale} />
      </div>
    </section>
  );
}

/**
 * Calendly needs several seconds to start. It is loaded as soon as the visitor comes near
 * this section, so the calendar is there on arrival, and not at all for visitors who leave
 * at the top of the page.
 */
function Booking({ t }: { t: T }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState("");
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState<number | null>(null);
  const linked = /^https:\/\/calendly\.com\//.test(t.calendlyUrl);

  useEffect(() => {
    const card = cardRef.current;
    if (!linked || !card) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        const u = new URL(t.calendlyUrl);
        u.searchParams.set("embed_domain", window.location.hostname);
        u.searchParams.set("embed_type", "Inline");
        // The card already says what is being booked, so Calendly shows only the calendar.
        u.searchParams.set("hide_event_type_details", "1");
        u.searchParams.set("utm_source", "website");
        setSrc(u.toString());
        io.disconnect();
      },
      { rootMargin: "1500px 0px" },
    );
    io.observe(card);
    return () => io.disconnect();
  }, [linked, t.calendlyUrl]);

  // Calendly reports when its calendar is shown and how high its page is, so the booking
  // appears without a second scrollbar.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== "https://calendly.com") return;
      if (e.data?.event === "calendly.event_type_viewed") setReady(true);
      if (e.data?.event !== "calendly.page_height") return;
      const h = parseInt(String(e.data.payload?.height ?? ""), 10);
      if (h >= 400 && h < 4000) setHeight(h);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className="form book" ref={cardRef}>
      <div className="book__head">
        <h3 className="wiz__title">{t.book.title}</h3>
        <p>{t.book.sub}</p>
      </div>
      {linked ? (
        <div className="book__frame">
          {!ready && <p className="book__loading">{t.loading}</p>}
          {src && <iframe src={src} title={t.book.title} style={height ? { height } : undefined} />}
        </div>
      ) : (
        <p style={{ margin: 0 }}>
          <Ph text={t.calendlyUrl} />
        </p>
      )}
    </div>
  );
}

/** Three questions answered with one click each, then the email address. */
function Request({ t, locale }: { t: T; locale: Locale }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<Record<ChoiceKey, number>>>({});
  const [errors, setErrors] = useState<Errors>({});
  const [sent, setSent] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);
  // The typed address survives a step back, the field is unmounted in between.
  const details = useRef<{ email?: string; consent?: boolean }>({});
  const key = STEPS[step];

  // After a step change the question gets the focus, so keyboard and screen reader follow along.
  useEffect(() => {
    if (moved.current) titleRef.current?.focus({ preventScroll: true });
  }, [step]);

  const go = (n: number) => {
    moved.current = true;
    setErrors({});
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
  };
  const choose = (k: ChoiceKey, i: number) => {
    setAnswers((a) => ({ ...a, [k]: i }));
    go(step + 1);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (key !== "details") return;
    const next: Errors = {};
    if (!EMAIL.test((details.current.email ?? "").trim())) next.email = t.errorEmail;
    if (!details.current.consent) next.consent = t.errorConsent;
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  };
  const answered = isChoice(key) && answers[key] !== undefined;

  if (sent) {
    return (
      <div className="form wiz">
        <Dim label={t.success} draw />
        <div className="success">
          <Ph text={t.successNote} />
        </div>
      </div>
    );
  }

  return (
    <form className="form wiz" onSubmit={onSubmit} noValidate>
      <div className="wiz__head">
        <p className="wiz__kicker">{t.ask.title}</p>
        <p className="wiz__count" aria-live="polite">
          {t.progress.replace("{n}", String(step + 1)).replace("{total}", String(STEPS.length))}
        </p>
        <ol className="wiz__rail">
          {STEPS.map((k, i) => (
            <li key={k} className={i < step ? "is-done" : i === step ? "is-now" : ""} aria-current={i === step ? "step" : undefined}>
              <span>{t.steps[k].label}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="wiz__step" key={key}>
        <h3 className="wiz__title" ref={titleRef} tabIndex={-1}>
          {t.steps[key].title}
        </h3>

        {isChoice(key) && (
          <div className="wiz__options" role="group" aria-label={t.steps[key].title}>
            {t.steps[key].options.map((o, i) => (
              <button key={o} type="button" className="wiz__option" aria-pressed={answers[key] === i} onClick={() => choose(key, i)}>
                <i aria-hidden="true">{String.fromCharCode(65 + i)}</i>
                <span>{o}</span>
              </button>
            ))}
          </div>
        )}

        {key === "details" && (
          <>
            <div className="field">
              <label htmlFor="f-email">{t.email}</label>
              <input
                id="f-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby="e-email"
                defaultValue={details.current.email}
                onChange={(e) => {
                  details.current.email = e.target.value;
                  if (errors.email) setErrors((er) => ({ ...er, email: undefined }));
                }}
              />
              {errors.email && <span id="e-email" className="field__err">{errors.email}</span>}
            </div>
            <div>
              <label className="consent">
                <input
                  type="checkbox"
                  name="consent"
                  aria-invalid={!!errors.consent}
                  defaultChecked={!!details.current.consent}
                  onChange={(e) => {
                    details.current.consent = e.target.checked;
                    if (errors.consent) setErrors((er) => ({ ...er, consent: undefined }));
                  }}
                />
                <span>
                  {t.consent} <a href={legalPath(locale, "datenschutz")}>↗</a>
                </span>
              </label>
              {errors.consent && <span className="field__err">{errors.consent}</span>}
            </div>
          </>
        )}
      </div>

      {(step > 0 || answered) && (
        <div className="wiz__nav">
          {step > 0 ? (
            <button type="button" className="wiz__back" onClick={() => go(step - 1)}>
              <span aria-hidden="true">←</span> {t.back}
            </button>
          ) : (
            <span />
          )}
          {/* Separate keys: without them React turns the pressed Weiter button into the submit button mid-click. */}
          {key === "details" ? (
            <button key="submit" type="submit" className="btn">
              {t.submit} <span className="arrow">→</span>
            </button>
          ) : (
            answered && (
              <button key="next" type="button" className="btn btn--line" onClick={() => go(step + 1)}>
                {t.next} <span className="arrow">→</span>
              </button>
            )
          )}
        </div>
      )}
    </form>
  );
}
