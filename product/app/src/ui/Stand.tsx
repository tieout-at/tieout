"use client";

// Stand eines Postens (Vorlage: Linear-Statusspalte, reebuild-Freigabe): Symbol plus Wort, ohne Rahmen.
// Nur „Freigegeben“ ist farbig (pos), „Braucht Anwalt“ in law; der Akzent wird nie für Status verwendet.

import { CircleCheck, CircleDashed, CircleX, Pause, Scale, UserCheck, type LucideIcon } from "lucide-react";
import type { Liste } from "@/engine/typen";
import { standAus, type Stand } from "@/zustand/freigabe";
import { useVerlauf } from "@/zustand/speicher";
import { Ico } from "./Ico";

const ANZEIGE: Record<Stand, { icon: LucideIcon; text: string; klasse?: string }> = {
  pruefen: { icon: CircleDashed, text: "Prüfen" },
  uebernommen: { icon: UserCheck, text: "Übernommen" },
  freigegeben: { icon: CircleCheck, text: "Freigegeben", klasse: "sw-status--done" },
  verworfen: { icon: CircleX, text: "Verworfen" },
  anwalt: { icon: Scale, text: "Braucht Anwalt", klasse: "sw-status--law" },
  zurueckgestellt: { icon: Pause, text: "Zurückgestellt" },
};

export function StandMarke({ stand }: { stand: Stand }) {
  const a = ANZEIGE[stand];
  return (
    <span className={a.klasse ? `sw-status ${a.klasse}` : "sw-status"}>
      <Ico icon={a.icon} />
      {a.text}
    </span>
  );
}

/** In Listen bleibt „Prüfen“ leer (Linear: nur abweichende Stände fallen auf); entschiedene Posten zeigen ihren Stand. */
export function StandZelle({ projektId, schluessel, liste, leerBeiPruefen = false }: { projektId: string; schluessel: string; liste: Liste; leerBeiPruefen?: boolean }) {
  const verlauf = useVerlauf(projektId);
  const stand = standAus(verlauf, schluessel, liste);
  if (leerBeiPruefen && stand === "pruefen") return null;
  return <StandMarke stand={stand} />;
}

/** Zählt Posten im Stand „Freigegeben“ (nur Stufe 2 zählt). */
export function FreigegebenZaehler({ projektId, posten }: { projektId: string; posten: { schluessel: string; liste: Liste }[] }) {
  const verlauf = useVerlauf(projektId);
  const frei = posten.filter((p) => standAus(verlauf, p.schluessel, p.liste) === "freigegeben").length;
  return (
    <>
      {frei} von {posten.length} Posten freigegeben
    </>
  );
}

/** Posten, die noch auf eine Entscheidung warten (Prüfen oder Zurückgestellt). */
export function OffeneEntscheidungen({ projektId, posten }: { projektId: string; posten: { schluessel: string; liste: Liste }[] }) {
  const verlauf = useVerlauf(projektId);
  const n = posten.filter((p) => {
    const s = standAus(verlauf, p.schluessel, p.liste);
    return s === "pruefen" || s === "zurueckgestellt";
  }).length;
  return <>{n === 1 ? "1 Posten wartet" : `${n} Posten warten`} auf eine Entscheidung</>;
}
