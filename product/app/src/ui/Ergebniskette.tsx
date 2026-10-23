// Ergebniskette der Projekt-Übersicht (UI-Runde 1, Schritt 3, Option A; ersetzt die Schrittleiste mit Maschinenraum-Zahlen).
// Vier Glieder, die in Ergebnissen sprechen: gefunden, abgesichert, freigegeben, Schlussrechnung. Jedes Glied ist ein
// Link zum Ort, an dem man es nachprüft. Erledigt trägt einen vollen Strich in Ultramarin, „jetzt“ ist hinterlegt.
// Vorlage: Stripe-Zahlungsfortschritt, Linear-Projektmeilensteine; Planraster-Ziffern der Website.

import Link from "next/link";
import { Check } from "lucide-react";
import { Ico } from "./Ico";

export interface Glied {
  titel: string;
  wert: React.ReactNode;
  zeile: React.ReactNode;
  href: string;
  stand: "erledigt" | "jetzt" | "offen";
}

export function Ergebniskette({ glieder }: { glieder: Glied[] }) {
  return (
    <ol className="ek" aria-label="Stand des Projekts">
      {glieder.map((g, i) => (
        <li key={g.titel} className={`ek-glied ek-glied--${g.stand}`}>
          <Link href={g.href} className="ek-glied__a" aria-current={g.stand === "jetzt" ? "step" : undefined}>
            <span className="ek-glied__kopf">
              <span className="ek-glied__nr" aria-hidden="true">
                {g.stand === "erledigt" ? <Ico icon={Check} /> : i + 1}
              </span>
              {g.titel}
            </span>
            <span className="ek-glied__wert">{g.wert}</span>
            <span className="ek-glied__zeile">{g.zeile}</span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
