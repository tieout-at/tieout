import type { Locale, Messages } from "@/lib/i18n";
import { Twin } from "@/components/twin/Twin";

export function TwinSection({ t, locale }: { t: Messages["twin"]; locale: Locale }) {
  return (
    <section id="zwilling" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <p className="lead">{t.sub}</p>
        <Twin t={t} locale={locale} />
      </div>
    </section>
  );
}
