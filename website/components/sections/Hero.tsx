import type { Messages } from "@/lib/i18n";

/** Einstieg: kurzer Text links, rechts drei Fotos mit Ausschnitten aus dem Produkt. */
export function Hero({ t }: { t: Messages["hero"] }) {
  const c = t.cards;
  return (
    <section id="start" className="hero">
      <div className="wrap hero__grid">
        <div style={{ animation: "fadeUp .8s ease both" }}>
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="h-display hero__title">
            {t.title1}
            <span className="l2">{t.title2}</span>
          </h1>
          <p className="lead hero__sub">{t.sub}</p>
          <div className="hero__actions">
            <a className="btn" href="#demo">
              {t.cta} <span className="arrow">→</span>
            </a>
            <a className="btn btn--line" href="#loesung">
              {t.secondary} <span className="arrow">↓</span>
            </a>
          </div>
          <ul className="hero__facts">
            {t.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>

        <div className="photos">
          <span className="photos__tag">{c.sample}</span>
          <figure className="photo photo--tall" style={{ margin: 0 }}>
            <img src="/hero/bauplan.jpg" alt="" />
            <div className="ov ov--draft">
              <div className="ov__head">{c.draftTitle}</div>
              <b>{c.draftProject}</b>
              <div className="ov__bar">
                <i />
              </div>
              <div className="ov__row">
                <span>{c.draftState}</span>
                <span>100 %</span>
              </div>
            </div>
          </figure>
          <figure className="photo" style={{ margin: 0 }}>
            <img src="/hero/elektro.jpg" alt="" />
            <div className="ov ov--chip">
              <span>{c.regie}</span>
              <strong>{c.regieAmount}</strong>
            </div>
          </figure>
          <figure className="photo" style={{ margin: 0 }}>
            <img src="/hero/rohbau.jpg" alt="" />
            <div className="ov ov--plan">
              <b>{c.plan}</b>
              <span>{c.planDetail}</span>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
