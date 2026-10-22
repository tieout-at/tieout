"use client";

// Primäraktion der Projekt-Übersicht (Seitenkopf: „eine Primäraktion“): führt zum ersten Posten, der noch auf eine
// Entscheidung wartet. Sind alle entschieden, verschwindet der Knopf.

import Link from "next/link";
import type { Liste } from "@/engine/typen";
import { standAus } from "@/zustand/freigabe";
import { useVerlauf } from "@/zustand/speicher";

export function WeiterPruefen({ projektId, posten }: { projektId: string; posten: { schluessel: string; liste: Liste; href: string }[] }) {
  const verlauf = useVerlauf(projektId);
  const offen = posten.filter((p) => {
    const s = standAus(verlauf, p.schluessel, p.liste);
    return s === "pruefen" || s === "zurueckgestellt";
  });
  if (!offen.length) return null;
  return (
    <Link href={offen[0].href} className="sw-btn sw-btn--primary sw-btn--sm">
      Weiter prüfen
    </Link>
  );
}
