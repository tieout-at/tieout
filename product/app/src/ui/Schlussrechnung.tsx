"use client";

// Bausteine der Schlussrechnungs-Seite, die den Browser brauchen: Drucken des Beweispakets und der Stand der
// zweistufigen Freigabe über die Posten der Liste 1 (Stand aus dem Browser, wie überall in der Demo).

import { Printer } from "lucide-react";
import Link from "next/link";
import type { Liste } from "@/engine/typen";
import { standAus } from "@/zustand/freigabe";
import { useVerlauf } from "@/zustand/speicher";
import { Ico } from "./Ico";

export function DruckKnopf({ text = "Beweispaket drucken" }: { text?: string }) {
  return (
    <button type="button" className="sw-btn sw-btn--sm" onClick={() => window.print()}>
      <Ico icon={Printer} />
      {text}
    </button>
  );
}

/** Zwei Stufen wie bei jedem Posten: die Prüfung übernimmt (Stufe 1), die Freigabe gibt frei (Stufe 2). Beide führen zu den Posten. */
export function FreigabeStufen({ projektId, posten, href }: { projektId: string; posten: { schluessel: string; liste: Liste }[]; href: string }) {
  const verlauf = useVerlauf(projektId);
  const staende = posten.map((p) => standAus(verlauf, p.schluessel, p.liste));
  const freigegeben = staende.filter((s) => s === "freigegeben").length;
  const uebernommen = staende.filter((s) => s === "uebernommen").length + freigegeben;
  const stufen = [
    { nr: 1, rolle: "Prüfung", wort: "übernommen", n: uebernommen },
    { nr: 2, rolle: "Freigabe", wort: "freigegeben", n: freigegeben },
  ];
  return (
    <ol className="sr-stufen" aria-label="Freigabe der Liste 1">
      {stufen.map((s) => (
        <li key={s.nr}>
          <Link href={href} className={s.n === posten.length ? "sr-stufe sr-stufe--fertig" : "sr-stufe"}>
            <span className="sr-stufe__nr">{s.nr}</span>
            <span className="sr-stufe__rolle">{s.rolle}</span>
            <span className="sr-stufe__stand">
              {s.n} von {posten.length} {s.wort}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  );
}
