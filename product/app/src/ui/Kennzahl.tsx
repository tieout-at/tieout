// Kennzahl (Vorlage: reebuild-Projektübersicht R-C): Label, großer Wert, eine Kontextzeile. Ohne Rand und Trenner, nur Abstand.

export function Kennzahlen({ children }: { children: React.ReactNode }) {
  return <div className="sw-kpis">{children}</div>;
}

export function Kennzahl({ label, wert, kontext, hinweis }: { label: string; wert: string; kontext: React.ReactNode; hinweis?: string }) {
  return (
    <div className="sw-kpi" title={hinweis}>
      <span className="label">{label}</span>
      <span className="kpi">{wert}</span>
      <span className="sw-kpi__ctx meta">{kontext}</span>
    </div>
  );
}
