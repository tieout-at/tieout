import { getMessages, homePath, type Locale } from "@/lib/i18n";
import { Header } from "@/components/nav/Header";
import { Footer } from "@/components/Footer";
import { Ph } from "@/components/ui/Ph";

export function LegalPage({ locale, page }: { locale: Locale; page: "impressum" | "datenschutz" }) {
  const t = getMessages(locale);
  const rows = page === "impressum" ? t.legal.impressum.rows : t.legal.datenschutz.sections;
  const meta = page === "impressum" ? t.legal.impressum : t.legal.datenschutz;
  return (
    <>
      <Header locale={locale} t={{ ...t.nav, links: t.nav.links.map((l) => ({ ...l, href: homePath(locale) + l.href })) }} />
      <main id="inhalt" className="legal">
        <div className="wrap" style={{ maxWidth: 900 }}>
          <p className="eyebrow">
            <a href={homePath(locale)} style={{ textDecoration: "none" }}>← {t.legal.back}</a>
          </p>
          <h1 className="h-section">{meta.title}</h1>
          <p className="legal__note">{meta.note}</p>
          <table>
            <tbody>
              {rows.map(([k, v]) => (
                <tr key={k}>
                  <td>{k}</td>
                  <td>
                    <Ph text={v} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer t={t.footer} locale={locale} />
      <div className="preview-flag">{t.footer.preview}</div>
    </>
  );
}
