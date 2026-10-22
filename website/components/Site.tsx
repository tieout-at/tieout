import { getMessages, type Locale } from "@/lib/i18n";
import { Header } from "@/components/nav/Header";
import { MeasureNav } from "@/components/nav/MeasureNav";
import { Hero } from "@/components/sections/Hero";
import { Solution } from "@/components/sections/Solution";
import { Video } from "@/components/sections/Video";
import { Team } from "@/components/sections/Team";
import { Contact } from "@/components/sections/Contact";
import { Footer } from "@/components/Footer";

export function Site({ locale }: { locale: Locale }) {
  const t = getMessages(locale);
  return (
    <>
      <Header locale={locale} t={t.nav} />
      <MeasureNav labels={t.measure.labels} aria={t.measure.aria} />
      <main id="inhalt">
        <Hero t={t.hero} />
        <Solution t={t.solution} />
        <Video t={t.video} />
        <Team t={t.team} />
        <Contact t={t.contact} locale={locale} />
      </main>
      <Footer t={t.footer} locale={locale} />
      <div className="preview-flag">{t.footer.preview}</div>
    </>
  );
}
