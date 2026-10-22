import type { Messages } from "@/lib/i18n";
import { Flow } from "@/components/flow/Flow";

/** Problem und Lösung in einem Abschnitt, darunter der Ablauf als laufende Animation. */
export function Solution({ t }: { t: Messages["solution"] }) {
  return (
    <section id="loesung" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <div className="ps">
          <div>
            <h2 className="h-section">{t.title}</h2>
            <p className="ps__problem">{t.problem}</p>
          </div>
          <div className="ps__solution">
            <p className="eyebrow">{t.solutionLabel}</p>
            <p>{t.solution}</p>
          </div>
        </div>
        <Flow t={t.flow} />
      </div>
    </section>
  );
}
