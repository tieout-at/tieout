/**
 * Tieout.-Bildmarke „Tie-Point“: zwei Linien laufen in einem Punkt zusammen, wie Zahl und Beleg.
 * Linien in Tinte (oder Weiß), Verbindung und Punkt in Ultramarin.
 */
export function LogoMark({ size = 22, ink = "#0a1020" }: { size?: number; ink?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M3 6l13 10M3 26l13-10" stroke={ink} strokeWidth="3" strokeLinecap="square" fill="none" />
      <path d="M16 16h11" stroke="#1d3bff" strokeWidth="3" />
      <circle cx="27" cy="16" r="3.5" fill="#1d3bff" />
    </svg>
  );
}
