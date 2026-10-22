import type { Locale, Messages } from "@/lib/i18n";
import { Flow } from "@/components/flow/Flow";
import { Timeline } from "@/components/problem/Timeline";

/** Problem als Projektverlauf, darunter die Lösung mit dem laufenden Ablauf. */
export function Solution({ t, locale }: { t: Messages["solution"]; locale: Locale }) {
  return (
    <>
      <section id="problem" className="section">
        <div className="wrap">
          <p className="eyebrow">{t.problemEyebrow}</p>
          <div className="problem__head">
            <h2 className="h-section">{t.title}</h2>
            <p className="ps__problem">{t.problem}</p>
          </div>
          <Timeline t={t.timeline} locale={locale} />
        </div>
      </section>
      <section id="loesung" className="section">
        <div className="wrap">
          <p className="eyebrow">{t.solutionEyebrow}</p>
          <p className="ps__solution">{t.solution}</p>
          <Flow t={t.flow} locale={locale} />
        </div>
      </section>
    </>
  );
}
