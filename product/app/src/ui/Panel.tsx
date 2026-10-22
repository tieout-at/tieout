// Panel: Fläche mit Rand und Kopf von 44 px (überall gleich hoch).

export function Panel({ titel, rechts, children, className }: { titel?: React.ReactNode; rechts?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={className ? `sw-panel ${className}` : "sw-panel"}>
      {titel !== undefined && (
        <div className="sw-panel__head">
          <span className="section-title">{titel}</span>
          {rechts}
        </div>
      )}
      {children}
    </section>
  );
}
