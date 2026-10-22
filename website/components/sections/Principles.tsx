import type { Messages } from "@/lib/i18n";
import { Ph } from "@/components/ui/Ph";
import { Reveal } from "@/components/ui/Reveal";

const S = { stroke: "#0a1020", strokeWidth: 1.5, fill: "none" };
const U = { stroke: "#1d3bff", strokeWidth: 1.5, fill: "none" };

/** Plan-Legende: jedes Prinzip mit einem technischen Symbol. */
function Sym({ k }: { k: string }) {
  switch (k) {
    case "src":
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="8" y="6" width="22" height="30" {...S} />
          <path d="M13 14h12M13 20h12M13 26h7" {...S} />
          <circle cx="32" cy="32" r="7" {...U} />
          <path d="M37 37l4 4" {...U} />
        </svg>
      );
    case "human":
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <circle cx="22" cy="15" r="7" {...S} />
          <path d="M9 38c2-8 7-11 13-11s11 3 13 11" {...S} />
          <path d="M29 6l3 3 6-6" {...U} />
        </svg>
      );
    case "code":
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="5" y="9" width="34" height="26" {...S} />
          <path d="M14 18l-4 4 4 4M30 18l4 4-4 4M24 16l-4 12" {...U} />
        </svg>
      );
    case "hist":
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="12" y="6" width="22" height="28" {...S} />
          <rect x="8" y="10" width="22" height="28" {...S} fill="#f4f6f9" />
          <path d="M13 20h12M13 26h8" {...U} />
        </svg>
      );
    case "silo":
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <path d="M10 12v20c0 3 5 5 12 5s12-2 12-5V12" {...S} />
          <ellipse cx="22" cy="12" rx="12" ry="5" {...S} />
          <rect x="17" y="20" width="10" height="9" {...U} />
          <path d="M19 20v-3a3 3 0 0 1 6 0v3" {...U} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 44 44" aria-hidden="true">
          <rect x="6" y="14" width="12" height="16" {...S} />
          <rect x="26" y="14" width="12" height="16" {...S} />
          <path d="M18 22h8" {...U} />
          <path d="M15 9l14 26" stroke="#1d3bff" strokeWidth="2" />
        </svg>
      );
  }
}

export function Principles({ t }: { t: Messages["principles"] }) {
  return (
    <section id="prinzipien" className="section">
      <div className="wrap">
        <p className="eyebrow">{t.eyebrow}</p>
        <h2 className="h-section">{t.title}</h2>
        <div className="legend">
          {t.items.map((it, i) => (
            <Reveal key={it.title} className="legend__item" delay={(i % 3) * 80}>
              <Sym k={it.sym} />
              <div>
                <h3>{it.title}</h3>
                <p>{it.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <p style={{ marginTop: 24 }}>
          <Ph text={t.hosting} />
        </p>
      </div>
    </section>
  );
}
