// Feste Begriffe für Befunde und Listen (UI-Fundament, „Sprache und Inhalt“). Immer genau so schreiben.

import type { BefundArt, Liste } from "@/engine/typen";
import type { Ton } from "./Statusmarke";

export const ART_TEXT: Record<BefundArt, string> = {
  mehrmenge_plan: "Mehrmenge aus Planänderung",
  mehrmenge: "Mehrmenge",
  nicht_verrechnet: "Erbracht, nicht verrechnet",
  regie: "Regie",
  regie_zuruf: "Regie aus WhatsApp",
  preisumrechnung: "Preisumrechnung",
  aenderung: "Änderung",
  pauschale: "Pauschale",
  terminaenderung: "Terminänderung",
  behinderung: "Behinderung",
};

export const LISTEN: { liste: Liste; text: string; ton: Ton }[] = [
  { liste: "jetzt", text: "Jetzt verrechenbar", ton: "pos" },
  { liste: "offen", text: "Angemeldet und offen", ton: "warn" },
  { liste: "verloren", text: "Verloren", ton: "neutral" },
  { liste: "anwalt", text: "Hinweis, braucht Anwalt", ton: "law" },
];

/** „22.04.12B Plattenheizkörper …“ → Kennung „22.04.12B“ (mono, gedämpft) und Text. */
export function teileTitel(titel: string): { kennung: string | null; text: string } {
  const m = titel.match(/^(\d\d\.\d\d\.\d\d[A-Z]|RB-\d+|Z\d+)\s+(.*)$/);
  return m ? { kennung: m[1], text: m[2] } : { kennung: null, text: titel };
}

/** Tooltip zu „Nur außerhalb ERP“: die Zahl beruht auf einer Annahme (Demo_Faelle.md, Firmenzahlen). */
export const HINWEIS_ERP = "Annahme: was als Datei vorliegt, steht auch im ERP";
