/** Tieout.-Bildmarke: zwei Plan-Ecken mit einem Punkt in der Mitte. Ecken in Tinte (oder Weiß), Punkt in Ultramarin. */
export function LogoMark({ size = 22, ink = "#0a1020" }: { size?: number; ink?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" style={{ flex: "none" }}>
      <path d="M4 14V4h10M28 18v10H18" stroke={ink} strokeWidth="3.2" fill="none" strokeLinecap="square" />
      <rect x="12" y="12" width="8" height="8" fill="#1d3bff" />
    </svg>
  );
}
