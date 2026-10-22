// Statusmarke (Vorlage: Linear-Labels): Pille mit Punkt und Wort. Nie nur Farbe.

export type Ton = "pos" | "warn" | "neg" | "law" | "neutral" | "plain";

export function Statusmarke({ ton = "neutral", children, titel }: { ton?: Ton; children: React.ReactNode; titel?: string }) {
  const klasse = ton === "neutral" ? "sw-chip" : `sw-chip sw-chip--${ton}`;
  return (
    <span className={klasse} title={titel}>
      {children}
    </span>
  );
}
