/**
 * Names of the sample company, taken from docs/Demo_Faelle.md (solution list v3). No amounts here: amounts only come
 * from `kern/` (`lib/kern-data.ts`). The names stay here so that client components (search, sidebar) need not load the core.
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
      { slug: "zeitstrahl", title: "Zeitstrahl" },
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

/** The record itself (Attio's "Overview"): Angaben, highlights and Verlauf of the project, before the step tabs. */
export const OVERVIEW_TAB: ProjectTab = { slug: "", title: "Überblick" };

export const PROJECT_TABS: ProjectTab[] = [OVERVIEW_TAB, ...STEPS.flatMap((s) => s.tabs)];

export type Project = {
  /** Id of the project in `kern/` ("p1" …). */
  id: string;
  slug: string;
  name: string;
  client: string;
  /** "Schlussrechnung legen bis", a plain date (never a countdown); only for a project whose Schlussrechnung is due. */
  finalInvoiceBy?: string;
};

/** "Bürohaus Kiefernau" becomes "buerohaus-kiefernau". */
export function projectSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** The five projects of the sample company; `example.test.ts` checks them against `kern/`, so both tell one truth. */
export const PROJECTS: Project[] = [
  { id: "p1", slug: "wohnpark-mooshaim", name: "Wohnpark Mooshaim", client: "Hornfeld Bau", finalInvoiceBy: "30.10.2026" },
  { id: "p2", slug: "buerohaus-kiefernau", name: "Bürohaus Kiefernau", client: "Hornfeld Bau" },
  { id: "p3", slug: "volksschule-ahornbrunn", name: "Volksschule Ahornbrunn", client: "Marktgemeinde Ahornbrunn" },
  { id: "p4", slug: "wohnhof-erlenhain", name: "Wohnhof Erlenhain", client: "Hornfeld Bau" },
  { id: "p5", slug: "pflegeheim-eibenau", name: "Pflegeheim Eibenau", client: "Pfeilberg Bau" },
];

export function projectHref(project: Project, tab = ""): string {
  return `/projekte/${project.slug}/${tab ? `${tab}/` : ""}`;
}

export const BUSINESS_TABS: ProjectTab[] = [
  { slug: "", title: "Verträge" },
  { slug: "preisbasis", title: "Preisbasis" },
  { slug: "mitglieder", title: "Mitglieder" },
];
