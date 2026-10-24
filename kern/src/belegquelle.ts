// "Belegquelle" (SPEZIFIKATION.md 3.2): where the proof of the work done comes from, "Datei", "Papier", "E-Mail",
// "Foto", "WhatsApp". Evidence of the price (Leistungsverzeichnis, Vertrag, wholesaler invoice) does not count.
// "Nur außerhalb ERP": no proof of work in the business's ERP or AVA (assumption of the solution list: an entered
// Aufmaßblatt is in the AVA; an Excel file or a sheet never entered is not). Reported per money word, never on the sum
// of "zusätzlich verrechenbar" and "in Klärung" (E15, only in "Berichte"). Ported from the v1 core (belegquelle.ts).

import type { Cent } from "./modell";
import type { Fund, Nachweis } from "./typen";

export type Belegquelle = "datei" | "papier" | "email" | "foto" | "whatsapp";

export const BELEGQUELLE_TEXT: Record<Belegquelle, string> = { datei: "Datei", papier: "Papier", email: "E-Mail", foto: "Foto", whatsapp: "WhatsApp" };

const REIHE: Belegquelle[] = ["datei", "papier", "email", "foto", "whatsapp"];

function quelleVon(n: Nachweis): Belegquelle {
  if (n.art === "whatsapp") return "whatsapp";
  if (n.art === "regiebericht" || n.art === "stundenzettel") return "papier";
  if (n.art === "email") return "email";
  if (n.art === "foto" || n.art === "fotodokumentation") return "foto";
  return "datei";
}

export function belegquellen(f: Pick<Fund, "nachweise">): Belegquelle[] {
  const gefunden = new Set(f.nachweise.filter((n) => n.rolle === "leistung").map(quelleVon));
  return REIHE.filter((q) => gefunden.has(q));
}

export function nurAusserhalbErp(f: Pick<Fund, "nachweise">): boolean {
  const leistung = f.nachweise.filter((n) => n.rolle === "leistung");
  return leistung.length > 0 && !leistung.some((n) => n.imErp);
}

export interface AusserhalbErp {
  betrag: Cent;
  anzahl: number;
  /** Of how much and how many finds of the same money word. */
  vonBetrag: Cent;
  vonAnzahl: number;
}

/** "Nur außerhalb ERP" over a set of finds of one money word. */
export function ausserhalbErp(funde: readonly Fund[]): AusserhalbErp {
  const aus = funde.filter(nurAusserhalbErp);
  return { betrag: aus.reduce((s, f) => s + f.betrag, 0), anzahl: aus.length, vonBetrag: funde.reduce((s, f) => s + f.betrag, 0), vonAnzahl: funde.length };
}
