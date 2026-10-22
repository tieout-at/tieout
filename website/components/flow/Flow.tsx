import type { Messages } from "@/lib/i18n";

type T = Messages["solution"]["flow"];

const INK = "#0a1020";
const ULTRA = "#1d3bff";
const LOOP = 8; // Sekunden pro Durchlauf
const STEP = 0.85; // Abstand zwischen zwei Eingängen

/* Maße der Eingangsspalte, damit die Verbindungslinien exakt an den Kacheln ansetzen. */
const H = 452;
const CHIP = 40;
const GAP = 6;
const GROUP_GAP = 14;

function chipCenters(groupSizes: number[]): number[] {
  const total = groupSizes.reduce((s, n) => s + n * CHIP + (n - 1) * GAP, 0) + (groupSizes.length - 1) * GROUP_GAP;
  let y = (H - total) / 2;
  const centers: number[] = [];
  groupSizes.forEach((n) => {
    for (let i = 0; i < n; i++) centers.push(y + i * (CHIP + GAP) + CHIP / 2);
    y += n * CHIP + (n - 1) * GAP + GROUP_GAP;
  });
  return centers;
}

function Icon({ k }: { k: string }) {
  const s = { stroke: INK, strokeWidth: 1.4, fill: "none" };
  const u = { stroke: ULTRA, strokeWidth: 1.4, fill: "none" };
  switch (k) {
    case "erp":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><ellipse cx="11" cy="5" rx="7" ry="2.5" {...s} /><path d="M4 5v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V5M4 11c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5" {...s} /></svg>);
    case "mail":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="5" width="17" height="12" {...s} /><path d="M3 6l8 6 8-6" {...u} /></svg>);
    case "pdf":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M5 2.5h8l4 4v13H5z" {...s} /><path d="M13 2.5v4h4" {...s} /><path d="M8 11h6M8 14h6M8 17h4" {...u} /></svg>);
    case "plan":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="3.5" width="17" height="15" {...s} /><path d="M9 3.5v8H2.5M9 11.5h5v7M14 3.5v4h5.5" {...u} /></svg>);
    case "xls":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="3" y="3" width="16" height="16" {...s} /><path d="M3 8h16M3 13h16M9 3v16" {...s} /><path d="M12 15.5l4-4" {...u} /></svg>);
    case "foto":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><rect x="2.5" y="6" width="17" height="12" {...s} /><path d="M7.5 6l1.5-2.5h4L14.5 6" {...s} /><circle cx="11" cy="12" r="3.2" {...u} /></svg>);
    case "voice":
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M4 11h1.5M7 8v6M10 5v12M13 7.5v7M16 9.5v3M18.5 11H20" {...u} strokeLinecap="round" /></svg>);
    default:
      return (<svg viewBox="0 0 22 22" aria-hidden="true"><path d="M11 2.8a8.2 8.2 0 0 0-7.1 12.3L2.8 19.2l4.2-1.1A8.2 8.2 0 1 0 11 2.8z" {...s} /><path d="M8 9.5c.5 2 2.2 3.8 4.5 4.5l1.3-1.3 1.8 1" {...u} /></svg>);
  }
}

/** Isometrische Projektion für den Zwilling (2:1). */
const iso = (x: number, y: number, z = 0): [number, number] => [230 + (x - y) * 28, 150 + (x + y) * 14 - z];
const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

const PROJECTS = [
  { x: 0.6, y: 0.6, w: 1.6, d: 1.2, h: 30 },
  { x: 3.0, y: 0.5, w: 1.4, d: 1.4, h: 44 },
  { x: 5.2, y: 0.8, w: 1.2, d: 1.2, h: 22 },
  { x: 0.7, y: 3.0, w: 1.4, d: 1.6, h: 38 },
  { x: 3.1, y: 3.0, w: 1.6, d: 1.6, h: 58, hi: true },
  { x: 5.3, y: 3.2, w: 1.2, d: 1.4, h: 26 },
  { x: 1.0, y: 5.4, w: 1.6, d: 1.1, h: 20 },
  { x: 4.0, y: 5.4, w: 1.4, d: 1.1, h: 32 },
].sort((a, b) => a.x + a.y - (b.x + b.y));

function Box({ p, i }: { p: (typeof PROJECTS)[number]; i: number }) {
  const x1 = p.x + p.w;
  const y1 = p.y + p.d;
  const top = [iso(p.x, p.y, p.h), iso(x1, p.y, p.h), iso(x1, y1, p.h), iso(p.x, y1, p.h)];
  const right = [iso(x1, p.y), iso(x1, y1), iso(x1, y1, p.h), iso(x1, p.y, p.h)];
  const left = [iso(p.x, y1), iso(x1, y1), iso(x1, y1, p.h), iso(p.x, y1, p.h)];
  return (
    <g>
      <polygon points={pts(left)} fill="#ffffff" stroke={INK} strokeWidth="1.1" />
      <polygon points={pts(right)} fill="#eef1f6" stroke={INK} strokeWidth="1.1" />
      <polygon points={pts(top)} fill="#ffffff" stroke={INK} strokeWidth="1.1" />
      <polygon
        points={pts(top)}
        fill={ULTRA}
        fillOpacity={p.hi ? 0.9 : 0.08}
        stroke="none"
        style={p.hi ? undefined : { animation: `projPulse ${LOOP}s ease-in-out ${(1.2 + i * 0.7).toFixed(2)}s infinite` }}
      />
    </g>
  );
}

function Twin({ t }: { t: T }) {
  const plate = [iso(0, 0), iso(7, 0), iso(7, 7), iso(0, 7)];
  const thick = plate.map(([x, y]) => [x, y + 10] as [number, number]);
  const hi = PROJECTS.find((p) => p.hi)!;
  const [hx, hy] = iso(hi.x + hi.w / 2, hi.y + hi.d / 2, hi.h);
  // Netz zwischen den Projekten: der Betrieb besteht aus Projekten, die zusammenhängen.
  const centers = PROJECTS.map((p) => iso(p.x + p.w / 2, p.y + p.d / 2));
  const links = [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [1, 4], [3, 6], [4, 7], [6, 7], [2, 5]];
  const tags = t.companyTags.map((label, i) => ({ label, x: 70 + i * 120, y: 26 }));

  return (
    <svg viewBox="24 2 412 392" role="img" aria-label={`${t.twin}: ${t.company}, ${t.projects}`}>
      {/* Firmenwissen über der Platte */}
      {tags.map((g, i) => {
        const [tx, ty] = iso(1 + i * 2.5, 0);
        return (
          <g key={g.label}>
            <path d={`M${g.x + 45},${g.y + 12} L${tx},${ty}`} stroke={INK} strokeOpacity=".25" strokeDasharray="3 4" />
            <rect x={g.x} y={g.y - 12} width="90" height="24" fill="#ffffff" stroke={INK} strokeWidth="1" />
            <text x={g.x + 45} y={g.y + 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={INK}>
              {g.label}
            </text>
          </g>
        );
      })}
      {/* Platte: Ihr Betrieb */}
      <polygon points={pts([plate[3], plate[2], thick[2], thick[3]])} fill="#e3e8f0" stroke={INK} strokeWidth="1" />
      <polygon points={pts([plate[1], plate[2], thick[2], thick[1]])} fill="#d9dfe9" stroke={INK} strokeWidth="1" />
      <polygon points={pts(plate)} fill="#f8f9fb" stroke={INK} strokeWidth="1.2" />
      {Array.from({ length: 6 }, (_, i) => (
        <g key={i} stroke={INK} strokeOpacity=".08">
          <line x1={iso(i + 1, 0)[0]} y1={iso(i + 1, 0)[1]} x2={iso(i + 1, 7)[0]} y2={iso(i + 1, 7)[1]} />
          <line x1={iso(0, i + 1)[0]} y1={iso(0, i + 1)[1]} x2={iso(7, i + 1)[0]} y2={iso(7, i + 1)[1]} />
        </g>
      ))}
      {links.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={centers[a][0]} y1={centers[a][1]} x2={centers[b][0]} y2={centers[b][1]} stroke={ULTRA} strokeOpacity=".35" strokeDasharray="2 4" />
      ))}
      {PROJECTS.map((p, i) => (
        <Box key={i} p={p} i={i} />
      ))}
      {/* Hervorgehobenes Projekt mit Ausschlag nach oben */}
      <circle cx={hx} cy={hy - 6} r="4" fill={ULTRA}>
        <animate attributeName="r" values="4;12;4" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="fill-opacity" values="1;0;1" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx={hx} cy={hy - 6} r="3.5" fill={ULTRA} />
      <text x={iso(7, 7)[0]} y={iso(7, 7)[1] + 34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill={ULTRA} letterSpacing="1.5">
        {t.company.toUpperCase()}
      </text>
    </svg>
  );
}

export function Flow({ t }: { t: T }) {
  const groups = t.groups.map((g, gi) => ({ label: g, items: t.items.filter((it) => it.g === gi) }));
  const centers = chipCenters(groups.map((g) => g.items.length));
  const mid = H / 2;
  const bars = [0.35, 0.6, 0.25, 0.8, 1, 0.45, 0.3];
  let n = -1;

  return (
    <div className="flow">
      <div className="flow__cols" aria-hidden="true">
        <div className="flow__head">01 · {t.inputs}</div>
        <div />
        <div className="flow__head" style={{ textAlign: "center" }}>02 · {t.twin}</div>
        <div />
        <div className="flow__head">03 · {t.output}</div>
      </div>

      <div className="flow__grid">
        {/* Eingänge */}
        <div>
          <p className="flow__mhead">01 · {t.inputs}</p>
          <div className="inputs">
            {groups.map((g) => (
              <div className="ingroup" key={g.label}>
                <span className="ingroup__label">{g.label}</span>
                <div className="ingroup__items">
                  {g.items.map((it) => {
                    n += 1;
                    return (
                      <div className="chip" key={it.k} style={{ animationDelay: `${(n * STEP).toFixed(2)}s` }}>
                        <Icon k={it.k} />
                        <span>
                          {it.label}
                          <small>{it.detail}</small>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verbindungen Eingänge → Zwilling */}
        <svg className="connector connector--h" viewBox={`0 0 80 ${H}`} preserveAspectRatio="none" style={{ height: H }} aria-hidden="true">
          {centers.map((y, i) => {
            const d = `M0,${y} C40,${y} 40,${mid} 80,${mid}`;
            const begin = `${(i * STEP).toFixed(2)}s`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={ULTRA} strokeOpacity=".25" />
                <circle r="3" fill={ULTRA} opacity="0">
                  <animateMotion dur={`${LOOP}s`} begin={begin} repeatCount="indefinite" path={d} keyPoints="0;1;1" keyTimes="0;0.11;1" calcMode="linear" />
                  <animate attributeName="opacity" dur={`${LOOP}s`} begin={begin} repeatCount="indefinite" values="1;1;0;0" keyTimes="0;0.11;0.12;1" />
                </circle>
              </g>
            );
          })}
        </svg>
        <svg className="connector connector--v" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50,0 V56" stroke={ULTRA} strokeOpacity=".35" strokeDasharray="3 4" />
          <circle r="3" fill={ULTRA}>
            <animateMotion dur="1.6s" repeatCount="indefinite" path="M50,0 V56" />
          </circle>
        </svg>

        {/* Zwilling */}
        <div className="twin">
          <p className="flow__mhead">02 · {t.twin}</p>
          <Twin t={t} />
          <div className="twin__caption">{t.projects}</div>
        </div>

        {/* Verbindungen Zwilling → Schlussrechnung */}
        <svg className="connector connector--h" viewBox={`0 0 80 ${H}`} preserveAspectRatio="none" style={{ height: H }} aria-hidden="true">
          {[-46, 0, 46].map((dy, i) => {
            const d = `M0,${mid} C40,${mid} 40,${mid + dy} 80,${mid + dy}`;
            return (
              <g key={i}>
                <path d={d} fill="none" stroke={ULTRA} strokeOpacity=".3" />
                <circle r="3" fill={ULTRA}>
                  <animateMotion dur="1.8s" begin={`${i * 0.6}s`} repeatCount="indefinite" path={d} />
                </circle>
              </g>
            );
          })}
        </svg>
        <svg className="connector connector--v" viewBox="0 0 100 56" preserveAspectRatio="none" aria-hidden="true">
          <path d="M50,0 V56" stroke={ULTRA} strokeOpacity=".35" strokeDasharray="3 4" />
          <circle r="3" fill={ULTRA}>
            <animateMotion dur="1.6s" begin="0.8s" repeatCount="indefinite" path="M50,0 V56" />
          </circle>
        </svg>

        {/* Ergebnis: Schlussrechnung */}
        <div>
          <p className="flow__mhead">03 · {t.output}</p>
          <div className="out">
            <div className="out__head">
              <span>{t.output}</span>
              <b>{t.outputProject}</b>
            </div>
            <ul className="checks">
              {t.checks.map((c, i) => (
                <li key={c}>
                  <span className="tick" style={{ animationDelay: `${(2.2 + i * 0.6).toFixed(1)}s` }} aria-hidden="true">
                    ✓
                  </span>
                  <span>{c}</span>
                </li>
              ))}
            </ul>
            <div className="out__foot">
              <div className="out__total">
                <span>{t.openLabel}</span>
                <b>{t.openValue}</b>
              </div>
              <div className="bars" aria-hidden="true">
                {bars.map((h, i) => (
                  <i key={i} className={i === 4 ? "hi" : undefined} style={{ height: `${h * 100}%`, animationDelay: `${(i * 0.12).toFixed(2)}s` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <span className="flow__sample">{t.sample}</span>
    </div>
  );
}
