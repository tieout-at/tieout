// Ablauf (Vorlage: Linear-Projekt „Milestones“ als Spalten mit Zahl, Stripe-Zahlungszeitleiste für Marke und Linie,
// reebuild R-E für feste, nummerierte Schritte): vier Schritte auf einer Linie, jeder mit der echten Zahl aus dem
// Rechenkern und als Ganzes ein Link zum Ort, an dem man es nachprüft.

import Link from "next/link";
import { Check } from "lucide-react";
import { Ico } from "./Ico";

export interface Schritt {
  titel: string;
  /** Hauptzahl des Schritts, z. B. 165 oder „3 von 14“. */
  zahl: React.ReactNode;
  einheit: string;
  zeile?: React.ReactNode;
  erledigt: boolean;
  href: string;
  /** Tooltip, wenn die Einheit allein nicht reicht. */
  hinweis?: string;
}

export function Schrittleiste({ schritte }: { schritte: Schritt[] }) {
  const aktuell = schritte.findIndex((s) => !s.erledigt);
  return (
    <ol className="ab-steps" aria-label="Ablauf">
      {schritte.map((s, i) => (
        <li key={s.titel} className={`ab-step${s.erledigt ? " ab-step--done" : i === aktuell ? " ab-step--now" : ""}`}>
          <Link href={s.href} className="ab-step__a" title={s.hinweis} aria-current={i === aktuell ? "step" : undefined}>
            <span className="ab-step__track" aria-hidden="true">
              <span className="ab-step__mark">{s.erledigt ? <Ico icon={Check} /> : i + 1}</span>
            </span>
            <span className="ab-step__titel">{s.titel}</span>
            <span className="ab-step__wert">
              <span className="ab-step__zahl">{s.zahl}</span>
              <span className="ab-step__einheit">{s.einheit}</span>
            </span>
            <span className="ab-step__zeile">{s.zeile}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
