// Einstellungen (Vorlage: Linear „Settings“, Attio „Workspace settings“): Profil, Darstellung, Mitglieder, Daten.

import type { Metadata } from "next";
import { Einstellungen } from "@/ui/Einstellungen";
import { Seitenkopf } from "@/ui/Seitenkopf";

export const metadata: Metadata = { title: "Einstellungen" };

export default function EinstellungenSeite() {
  return (
    <>
      <Seitenkopf pfad={[]} titel="Einstellungen" />
      <main className="scr-body">
        <Einstellungen />
      </main>
    </>
  );
}
