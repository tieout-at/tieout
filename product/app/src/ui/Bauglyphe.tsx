// Bauglyphe: das Gebäude eines Projekts als kleine Plan-Skizze auf Raster (UI-Runde 1, Option C, Entscheidung Maxi S. 23.10.).
// Unterscheidet Projekte in der Seitenleiste auf einen Blick, auch eingeklappt. Bild der Website (Planraster, Ultramarin).
// Beim Überfahren zeichnet sie sich neu, im aktiven Projekt läuft ein Scan, eine drängende Frist zeigt eine Ecke.
// Farben und Bewegung in seitenleiste.css; hier nur Geometrie im Raster 20 × 20.

import type { Gebaeude } from "@/daten/demo";

function Bau({ art, geschosse }: { art: Gebaeude; geschosse: number }) {
  switch (art) {
    case "wohnhaus": {
      const h = geschosse * 2.4;
      const y = 17 - h;
      return (
        <>
          <rect className="glyphe__bau" x="5" y={y} width="10" height={h} pathLength={1} />
          {Array.from({ length: geschosse - 1 }, (_, i) => (
            <path key={i} className="glyphe__bau" d={`M5 ${y + (i + 1) * 2.4}h10`} pathLength={1} />
          ))}
          <path className="glyphe__bau" d={`M10 ${y}v${h}`} pathLength={1} />
        </>
      );
    }
    case "buero":
      return <path className="glyphe__bau" d="M7 17V4h6v13M10 4v13M7 8h6M7 12h6M10 4V2" pathLength={1} />;
    case "schule":
      return (
        <>
          <path className="glyphe__bau" d="M4 17V9.5L10 5l6 4.5V17ZM8.5 17v-3.5h3V17" pathLength={1} />
          <circle className="glyphe__bau" cx="10" cy="9" r="1.2" pathLength={1} />
        </>
      );
    case "pflege":
      return <path className="glyphe__bau" d="M4 17V6h6v6h6v5ZM4 10h6M7 6v11" pathLength={1} />;
    case "reihenhaus":
      return <path className="glyphe__bau" d="M3 17v-6l2.4-2.4L7.8 11v6M7.8 11l2.4-2.4 2.4 2.4v6M12.6 11 15 8.6l2.4 2.4v6M3 17h14.4" pathLength={1} />;
    case "hotel":
      return <path className="glyphe__bau" d="M6 17V5h8v12M8.5 8v6M11.5 8v6M8.5 11h3M10 5V2.5h2.5" pathLength={1} />;
  }
}

export function Bauglyphe({ art, geschosse, ruhig, dringend }: { art: Gebaeude; geschosse: number; ruhig?: boolean; dringend?: boolean }) {
  return (
    <svg className={ruhig ? "glyphe glyphe--ruhig" : "glyphe"} viewBox="0 0 20 20" aria-hidden="true">
      <rect className="glyphe__kachel" width="20" height="20" />
      <path className="glyphe__raster" d="M5 0v20M10 0v20M15 0v20M0 5h20M0 10h20M0 15h20" />
      <Bau art={art} geschosse={geschosse} />
      {dringend && <path className="glyphe__frist" d="M14 0h6v6z" />}
      <rect className="glyphe__scan" x="0" y="0" width="20" height="1.5" />
    </svg>
  );
}
