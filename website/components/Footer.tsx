import { homePath, legalPath, type Locale, type Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { LogoMark } from "@/components/ui/Logo";

export function Footer({ t, locale }: { t: Messages["footer"]; locale: Locale }) {
  return (
    <footer className="footer">
      <div className="wrap footer__grid">
        <div>
          <a className="wordmark" href={homePath(locale)}>
            <LogoMark size={26} />
            <span>tieout</span>
          </a>
          <small>{t.claim}</small>
          <small>
            <Ph text={t.legal} />
          </small>
          <small>© 2026 tieout</small>
        </div>
        <nav className="footer__links" aria-label="Footer">
          <a href={legalPath(locale, "impressum")}>{t.impressum}</a>
          <a href={legalPath(locale, "datenschutz")}>{t.datenschutz}</a>
          <a href={t.linkedinUrl} target="_blank" rel="noopener noreferrer">
            {t.linkedin} <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </div>
    </footer>
  );
}
