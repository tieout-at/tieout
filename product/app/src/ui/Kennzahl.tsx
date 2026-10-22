// Kennzahl (Vorlage: reebuild-Projektübersicht R-C): Label, großer Wert, eine Kontextzeile. Rand statt Schatten.

export function Kennzahlen({ children }: { children: React.ReactNode }) {
  return <div className="sw-kpis">{children}</div>;
}

export function Kennzahl({ label, wert, kontext }: { label: string; wert: string; kontext: React.ReactNode }) {
  return (
    <div className="sw-kpi">
      <span className="label">{label}</span>
      <span className="kpi">{wert}</span>
      <span className="sw-kpi__ctx meta">{kontext}</span>
    </div>
  );
}
