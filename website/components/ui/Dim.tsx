/** Maßkette: |← LABEL →| */
export function Dim({ label, draw = false, className = "" }: { label: string; draw?: boolean; className?: string }) {
  return (
    <div className={`dim ${draw ? "dim--draw" : ""} ${className}`} aria-hidden="true">
      <span className="dim__end" />
      <span className="dim__line" />
      <span className="dim__label">{label}</span>
      <span className="dim__line" />
      <span className="dim__end" />
    </div>
  );
}
