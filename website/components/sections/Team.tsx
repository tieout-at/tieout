import type { Messages } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";
import { Fit } from "@/components/ui/Fit";

const LOGO_ALT: Record<string, string> = {
  wu: "WU Wien",
  tuwien: "TU Wien",
  tacto: "Tacto",
  enpal: "Enpal",
  hanswomen: "Hans(wo)men Group",
  simonkucher: "Simon-Kucher",
  icons: "icons consulting by students",
  start: "START Vienna",
  feldwerke: "Feldwerke",
};

export function Team({ t }: { t: Messages["team"] }) {
  return (
    <section id="team" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <Fit width={760}>
        <div className="team">
          {t.members.map((m, i) => (
            <Reveal key={m.name} as="article" className="member" delay={i * 80}>
              <div className="member__img">
                <img src={m.photo} alt={m.name} loading="lazy" />
              </div>
              <div className="member__body">
                <div className="member__name">{m.name}</div>
                <div className="member__role">{t.role} · {m.title}</div>
              </div>
              <div className="member__logos">
                {m.logos.map((l) => (
                  <img key={l} src={`/logos/${l}.svg`} alt={LOGO_ALT[l] ?? l} loading="lazy" />
                ))}
              </div>
              <a className="member__li" href={m.linkedin} target="_blank" rel="noopener noreferrer">
                {t.linkedin} <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          ))}
        </div>
        </Fit>
      </div>
    </section>
  );
}
