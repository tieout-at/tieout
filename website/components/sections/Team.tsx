import type { Locale, Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Reveal } from "@/components/ui/Reveal";

export function Team({ t, locale }: { t: Messages["team"]; locale: Locale }) {
  const photo = locale === "de" ? "[[PLATZHALTER: Foto]]" : "[[PLACEHOLDER: photo]]";
  return (
    <section id="team" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <p className="lead">
          <Ph text={t.sub} />
        </p>
        <div className="team">
          {t.members.map((m, i) => (
            <Reveal key={m.name} as="article" className="member" delay={i * 70}>
              <div className="member__img">
                <span aria-hidden="true">{m.initials}</span>
                <Ph text={photo} />
              </div>
              <div className="member__body">
                <div className="member__name">{m.name}</div>
                <p>
                  <Ph text={t.role} />
                </p>
                <p className="muted">
                  <Ph text={t.bio} />
                </p>
              </div>
              <a className="member__li" href={m.linkedin} target="_blank" rel="noopener noreferrer">
                {t.linkedin} <span aria-hidden="true">↗</span>
              </a>
            </Reveal>
          ))}
          <Reveal as="article" className="member member--insider" delay={t.members.length * 70}>
            <div className="member__img">
              <span aria-hidden="true">?</span>
            </div>
            <div className="member__body">
              <div className="member__name">{t.insider.title}</div>
              <p style={{ color: "#1d3bff" }}>{t.insider.role}</p>
              <p className="muted">{t.insider.text}</p>
            </div>
            <a className="member__li" href="#kontakt">
              {t.insider.cta} <span aria-hidden="true">→</span>
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
