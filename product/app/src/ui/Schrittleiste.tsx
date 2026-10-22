// Schrittleiste (Vorlage: reebuild-Ablauf, Kuro „x von y“): vier feste Schritte, erledigt mit Häkchen, der aktuelle gefüllt.

import { Check } from "lucide-react";
import { Ico } from "./Ico";

export interface Schritt {
  titel: string;
  zeile: React.ReactNode;
  erledigt: boolean;
}

export function Schrittleiste({ schritte }: { schritte: Schritt[] }) {
  const aktuell = schritte.findIndex((s) => !s.erledigt);
  return (
    <div className="sw-steps">
      {schritte.map((s, i) => (
        <div key={s.titel} className={`sw-step${s.erledigt ? " sw-step--done" : i === aktuell ? " sw-step--now" : ""}`}>
          <span className="sw-step__n">{s.erledigt ? <Ico icon={Check} /> : i + 1}</span>
          <div className="sw-step__t">
            <b>{s.titel}</b>
            <span className="meta">{s.zeile}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
