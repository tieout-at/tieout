/**
 * Names of the sample company, taken from docs/Demo_Faelle.md (solution list v3). No amounts here: amounts only come
 * from `kern/` (step 2) and the solution list.
 */

export const BUSINESS = {
  name: "Kronfeld Haustechnik",
  initial: "K",
  trade: "Heizung, Klima, Lüftung, Sanitär",
  place: "Wien",
} as const;

export type ProjectTab = { slug: string; title: string };

export type Step = {
  id: string;
  title: string;
  /** Run steps of the Abschluss-Lauf that belong to this step (SPEZIFIKATION.md 5.1). */
  run: string[];
  tabs: ProjectTab[];
};

/** The three steps of the website section 03, each with its run steps and project tabs (SPEZIFIKATION.md 4.1). */
export const STEPS: Step[] = [
  {
    id: "ihre-daten",
    title: "Ihre Daten",
    run: ["Ordner lesen"],
    tabs: [
      { slug: "", title: "Zeitstrahl" },
      { slug: "belege", title: "Belege" },
    ],
  },
  {
    id: "digitaler-zwilling",
    title: "Digitaler Zwilling",
    run: ["Abgleich"],
    tabs: [
      { slug: "positionen", title: "Positionen" },
      { slug: "vertrag", title: "Vertrag" },
    ],
  },
  {
    id: "ergebnis",
    title: "Ergebnis",
    run: ["Vorprüfung", "Entwurf", "Ausgaben"],
    tabs: [
      { slug: "funde", title: "Funde" },
      { slug: "schlussrechnung", title: "Schlussrechnung" },
    ],
  },
];

export const PROJECT_TABS: ProjectTab[] = STEPS.flatMap((s) => s.tabs);

export type Project = {
  slug: string;
  name: string;
  client: string;
  /** "Schlussrechnung legen bis", a plain date (never a countdown). */
  finalInvoiceBy: string;
};

export const PROJECTS: Project[] = [
  { slug: "wohnpark-mooshaim", name: "Wohnpark Mooshaim", client: "Hornfeld Bau", finalInvoiceBy: "30.10.2026" },
];

export function projectHref(project: Project, tab = ""): string {
  return `/projekte/${project.slug}/${tab ? `${tab}/` : ""}`;
}

export const BUSINESS_TABS: ProjectTab[] = [
  { slug: "", title: "Verträge" },
  { slug: "preisbasis", title: "Preisbasis" },
  { slug: "mitglieder", title: "Mitglieder" },
];
