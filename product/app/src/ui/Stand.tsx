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

/** Zählt Posten im Stand „Freigegeben“ (nur Stufe 2 zählt) als „x von y“ für den Ablauf. */
export function FreigegebenZahl({ projektId, posten }: { projektId: string; posten: { schluessel: string; liste: Liste }[] }) {
  const verlauf = useVerlauf(projektId);
  const frei = posten.filter((p) => standAus(verlauf, p.schluessel, p.liste) === "freigegeben").length;
  return (
    <>
      {frei} von {posten.length}
    </>
  );
}

const STRICH_TEXT: Record<Stand, string> = {
  pruefen: "offen",
  zurueckgestellt: "zurückgestellt",
  uebernommen: "übernommen",
  freigegeben: "freigegeben",
  verworfen: "verworfen",
  anwalt: "braucht Anwalt",
};

/** Ein Strich je Posten in fester Reihenfolge, gefärbt nach Stand (Vorlage: Linear-Fortschritt, aber mit Inhalt statt Prozent). */
export function FreigabeStriche({ projektId, posten }: { projektId: string; posten: { schluessel: string; liste: Liste }[] }) {
  const verlauf = useVerlauf(projektId);
  const staende = posten.map((p) => standAus(verlauf, p.schluessel, p.liste));
  const zaehler = new Map<string, number>();
  for (const s of staende) zaehler.set(STRICH_TEXT[s], (zaehler.get(STRICH_TEXT[s]) ?? 0) + 1);
  const text = [...zaehler].map(([t, n]) => `${n} ${t}`).join(", ");
  return (
    <span className="ab-striche" role="img" aria-label={text} title={text}>
      {staende.map((s, i) => (
        <span key={posten[i].schluessel} className={`ab-strich ab-strich--${s}`} />
      ))}
    </span>
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
