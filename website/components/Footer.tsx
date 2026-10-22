import { homePath, legalPath, type Locale, type Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";

export function Footer({ t, locale }: { t: Messages["footer"]; locale: Locale }) {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <a className="wordmark" href={homePath(locale)}>
            <span className="wordmark__sq" aria-hidden="true" />
            <span>EndPoint<span className="wordmark__dot">.</span></span>
          </a>
          <small>{t.claim}</small>
          <small>
            <Ph text={t.legal} />
          </small>
          <small>© 2026 EndPoint.</small>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <a href={legalPath(locale, "impressum")}>{t.impressum}</a>
          <a href={legalPath(locale, "datenschutz")}>{t.datenschutz}</a>
          <span>
            {t.linkedin}: <Ph text={t.linkedinPlaceholder} />
          </span>
        </nav>
      </div>
    </footer>
  );
}
