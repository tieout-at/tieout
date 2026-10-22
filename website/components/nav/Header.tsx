"use client";

import { useEffect, useState } from "react";
import { homePath, type Locale, type Messages } from "@/lib/i18n";

export function Header({ locale, t }: { locale: Locale; t: Messages["nav"] }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  // Sprachwechsel bleibt im aktuellen Abschnitt.
  const switchTo = (target: Locale) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (target === locale) return;
    window.location.href = homePath(target) + window.location.hash;
  };

  return (
    <header className={`header ${scrolled ? "header--scrolled" : ""}`}>
      <a className="skip" href="#inhalt">{t.skip}</a>
      <div className="wrap header__inner">
        <a className="wordmark" href={homePath(locale)} aria-label="EndPoint.">
          <span className="wordmark__sq" aria-hidden="true" />
          <span>
            EndPoint<span className="wordmark__dot">.</span>
          </span>
        </a>
        <div className="header__right">
          <div className="langsw" data-locale={locale} role="group" aria-label={t.lang}>
            <span className="langsw__thumb" aria-hidden="true" />
            <a href={homePath("de")} onClick={switchTo("de")} aria-current={locale === "de"} lang="de">DE</a>
            <a href={homePath("en")} onClick={switchTo("en")} aria-current={locale === "en"} lang="en">EN</a>
          </div>
          <a className="btn btn--sm" href={`${homePath(locale)}#demo`}>
            {t.cta} <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
