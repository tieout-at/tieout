import { getMessages, type Locale } from "@/lib/i18n";
import { Header } from "@/components/nav/Header";
import { MeasureNav } from "@/components/nav/MeasureNav";
import { Hero } from "@/components/sections/Hero";
import { Problem } from "@/components/sections/Problem";
import { TwinSection } from "@/components/sections/TwinSection";
import { Wege } from "@/components/sections/Wege";
import { Apps } from "@/components/sections/Apps";
import { Video } from "@/components/sections/Video";
import { Principles } from "@/components/sections/Principles";
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
        <Problem t={t.problem} />
        <TwinSection t={t.twin} locale={locale} />
        <Wege t={t.wege} />
        <Apps t={t.apps} />
        <Video t={t.video} />
        <Principles t={t.principles} />
        <Team t={t.team} locale={locale} />
        <Contact t={t.contact} locale={locale} />
      </main>
      <Footer t={t.footer} locale={locale} />
      <div className="preview-flag">{t.footer.preview}</div>
    </>
  );
}
