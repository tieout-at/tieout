// Gruppenkopf zum Ein- und Ausklappen (Vorlage: Linear „Group by“: Klick auf den Kopf klappt die Gruppe zu, erneuter Klick auf).
// Jede Gruppe steht in einem eigenen <tbody data-gruppe>. Das Umschalten macht Zeilennavigation (ein Klick-Hörer je Tabelle),
// damit Server-Tabellen ohne eigenen Zustand auskommen. Spalten sind fest (colgroup), beim Klappen verschiebt sich nichts.

import { ChevronDown } from "lucide-react";
import { Ico } from "./Ico";

export function GruppenTitel({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" className="grp-knopf" aria-expanded="true">
      <Ico icon={ChevronDown} />
      {children}
    </button>
  );
}
