// Tieout-Marke: zwei Plan-Ecken mit einem Quadrat in der Mitte, daneben die Wortmarke wie im Kopf der Website.
// Gleiche Geometrie wie website/components/ui/Logo.tsx; Farben aus tokens.css (--brand-ink, --brand),
// damit die Ecken im dunklen Thema hell werden.

export function LogoMark({ size = 20 }: { size?: number }) {
  return (
    <svg className="logo-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <path className="logo-mark__ecken" d="M4 14V4h10M28 18v10H18" strokeWidth="3.2" fill="none" strokeLinecap="square" />
      <rect className="logo-mark__punkt" x="12" y="12" width="8" height="8" />
    </svg>
  );
}

export function Wortmarke() {
  return <span className="logo-wort">Tieout</span>;
}
