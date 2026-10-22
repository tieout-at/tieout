import type { Messages } from "@/lib/i18n";
import { Dim } from "@/components/ui/Dim";

/** Grundriss, der sich beim Laden zeichnet: Plan, Maßketten, Messpunkte. */
function PlanDrawing({ labels }: { labels: string[] }) {
  return (
    <svg className="hero__plan draw" viewBox="0 0 560 440" fill="none" role="img" aria-label="Grundriss mit Maßketten">
      {/* Außenwände */}
      <rect x="40" y="60" width="420" height="300" stroke="#0a1020" strokeWidth="3" style={{ ["--len" as string]: 1440 }} />
      {/* Innenwände */}
      <path d="M200 60V230M200 280V360M40 210H140M180 210H200M200 160H330M370 160H460M330 160V360" stroke="#0a1020" strokeWidth="2" style={{ ["--len" as string]: 900, animationDelay: ".4s" }} />
      {/* Türbögen */}
      <path d="M140 210A40 40 0 0 1 180 250M330 160A40 40 0 0 0 370 200" stroke="#0a1020" strokeWidth="1" strokeDasharray="0" style={{ ["--len" as string]: 140, animationDelay: "1s" }} />
      {/* Leitungen in Ultramarin */}
      <path d="M60 330H300V190H430M300 330V250H250" stroke="#1d3bff" strokeWidth="2" style={{ ["--len" as string]: 720, animationDelay: "1.2s" }} />
      {/* Maßkette oben */}
      <path d="M40 30H460M40 22V38M200 22V38M460 22V38" stroke="#1d3bff" strokeWidth="1" style={{ ["--len" as string]: 600, animationDelay: ".8s" }} />
      {/* Maßkette rechts */}
      <path d="M490 60V360M482 60H498M482 160H498M482 360H498" stroke="#1d3bff" strokeWidth="1" style={{ ["--len" as string]: 400, animationDelay: "1s" }} />
      <g fontFamily="var(--font-mono)" fontSize="11" fill="#1d3bff" style={{ animation: "fadeUp .6s 1.6s both" }}>
        <text x="110" y="22">8,40</text>
        <text x="320" y="22">13,20</text>
        <text x="500" y="114">5,00</text>
        <text x="500" y="264">10,00</text>
      </g>
      <g fontFamily="var(--font-mono)" fontSize="12" fill="#0a1020" style={{ animation: "fadeUp .6s 1.8s both" }}>
        <text x="60" y="100">{labels[1]}</text>
        <text x="220" y="100">{labels[2]}</text>
      </g>
      {/* Messpunkte (Belege) */}
      {[
        [300, 190],
        [250, 250],
        [430, 190],
        [60, 330],
      ].map(([x, y], i) => (
        <g key={i} style={{ animation: `fadeUp .5s ${2 + i * 0.15}s both` }}>
          <circle cx={x} cy={y} r="7" fill="#f4f6f9" stroke="#1d3bff" strokeWidth="1.5" />
          <circle cx={x} cy={y} r="2" fill="#1d3bff" />
        </g>
      ))}
      <text x="40" y="400" fontFamily="var(--font-mono)" fontSize="11" fill="rgba(10,16,32,.5)" style={{ animation: "fadeUp .6s 2.2s both" }}>
        E-201 · INDEX D · 1:100
      </text>
    </svg>
  );
}

export function Hero({ t }: { t: Messages["hero"] }) {
  return (
    <section id="start" className="hero">
      <div className="wrap hero__grid">
        <div style={{ animation: "fadeUp .8s ease both" }}>
          <p className="eyebrow">01 · {t.eyebrow}</p>
          <h1 className="h-display hero__title">
            {t.title1}
            <br />
            <span className="l2">{t.title2}</span>
          </h1>
          <p className="lead hero__sub">{t.sub}</p>
          <div className="hero__actions">
            <a className="btn" href="#kontakt">
              {t.cta} <span className="arrow">→</span>
            </a>
            <a className="btn btn--line" href="#zwilling">
              {t.secondary} <span className="arrow">↓</span>
            </a>
          </div>
          <Dim label={t.dim} draw className="hero__dim" />
        </div>
        <PlanDrawing labels={t.planLabels} />
      </div>
    </section>
  );
}
