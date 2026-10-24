import { ChartGantt, FileSignature, FileText, ListOrdered, ReceiptText, SearchCheck, type LucideIcon } from "lucide-react";

import { PROJECTS, type Project } from "@/lib/example";

/** Empty state of each project tab; the words name the sample project, never an amount. */
export const TAB_EMPTY: Record<string, { icon: LucideIcon; title: string; text: (p: Project) => string }> = {
  "": { icon: ChartGantt, title: "Zeitstrahl", text: () => "Was auf der Baustelle geschah, gegen das, was verrechnet ist: verrechnet oder fehlt." },
  belege: { icon: FileText, title: "Belege", text: (p) => `Alle Belege von ${p.name}, das Original einen Klick entfernt.` },
  positionen: { icon: ListOrdered, title: "Positionen", text: () => "Jede Position des Leistungsverzeichnisses: beauftragt, erbracht, verrechnet, offen." },
  vertrag: { icon: FileSignature, title: "Vertrag", text: (p) => `Der Vertrag mit ${p.client}, Vertragspunkt für Vertragspunkt.` },
  funde: { icon: SearchCheck, title: "Funde", text: () => "Was in der Schlussrechnung fehlt, jeder Fund mit Rechenweg und Belegen." },
  schlussrechnung: { icon: ReceiptText, title: "Schlussrechnung", text: () => "Änderungsliste, Rechnungsabschluss und Vorprüfung." },
};

export function findProject(slug: string): Project {
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) throw new Error(`Unknown project ${slug}`);
  return project;
}
