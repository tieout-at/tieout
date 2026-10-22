// Anmeldeseite (Vorlage: Website Tieout, Papier mit Planraster; Linear und Attio: eine Spalte, ein Weg nach vorn).
// Ohne Seitenleiste und ohne Seitenkopf, zeigt keine Daten.

import type { Metadata } from "next";
import { Anmelden } from "@/ui/Anmelden";

export const metadata: Metadata = { title: "Anmelden" };

export default function AnmeldenSeite() {
  return <Anmelden />;
}
