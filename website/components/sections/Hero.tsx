import type { Messages } from "@/lib/i18n";

/**
 * Einstieg: kurzer Text links, rechts drei Fotos. Jedes Foto zeigt einen Nutzen auf einen Blick:
 * vergessene Leistung gefunden, Mehrmenge aus Planänderung, alle Belege an einem Ort.
 */
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
        </div>

        <div className="photos">
          <span className="photos__tag">{c.sample}</span>

          <figure className="photo photo--tall">
            <img src="/hero/steckdose.jpg" alt="" />
            <div className="vcard vcard--big" style={{ animationDelay: ".5s" }}>
              <span className="vcard__tag">
                <i>01</i> {c.c1Tag}
              </span>
              <b className="vcard__title">{c.c1Title}</b>
              <p className="vcard__text">{c.c1Text}</p>
              <div className="vcard__value">
                <strong>{c.c1Value}</strong>
                <span>{c.c1Note}</span>
              </div>
            </div>
          </figure>

          <figure className="photo">
            <img src="/hero/plaene.jpg" alt="" />
            <div className="vcard" style={{ animationDelay: "1s" }}>
              <span className="vcard__tag">
                <i>02</i> {c.c2Tag}
              </span>
              <div className="vcard__row">
                <b className="vcard__title">{c.c2Title}</b>
                <strong className="vcard__pill">{c.c2Value}</strong>
              </div>
            </div>
          </figure>

          <figure className="photo">
            <img src="/hero/tablet.jpg" alt="" />
            <div className="vcard" style={{ animationDelay: "1.5s" }}>
              <span className="vcard__tag">
                <i>03</i> {c.c3Tag}
              </span>
              <div className="vcard__row">
                <b className="vcard__title">{c.c3Title}</b>
                <strong className="vcard__pill vcard__pill--ink">{c.c3Value}</strong>
              </div>
            </div>
          </figure>
        </div>
      </div>
    </section>
  );
}
