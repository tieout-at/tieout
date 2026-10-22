import type { Messages } from "@/lib/i18n";
import { Reveal } from "@/components/ui/Reveal";

export function Problem({ t }: { t: Messages["problem"] }) {
  return (
    <section id="problem" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className="cards4">
          {t.items.map((it, i) => (
            <Reveal key={it.title} className="card" delay={i * 90}>
              <span className="card__num">{String(i + 1).padStart(2, "0")} / 04</span>
              <h3 className="h-card">{it.title}</h3>
              <p>{it.text}</p>
              {"source" in it && it.source ? (
                <a className="src" href={it.source.url} target="_blank" rel="noopener noreferrer">
                  ↗ {it.source.label}
                </a>
              ) : null}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
