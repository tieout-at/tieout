import {
  Building2,
  ChartColumn,
  Construction,
  FileText,
  House,
  type LucideIcon,
  Mail,
  MessageCircle,
  ReceiptText,
  SearchCheck,
  SquareCheck,
  Workflow,
  Briefcase,
  Layers,
} from "lucide-react";

/**
 * Navigation of the app (SPEZIFIKATION.md 4.1, decision E2). The sidebar, the header titles and the search (Strg K)
 * all read from here, so a page exists in exactly one place.
 */

export type Destination = {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  /** Extra words the search accepts, for example abbreviations people type. */
  keywords?: string[];
};

export type Section = {
  id: string;
  title: string;
  destinations: Destination[];
};

export const TOP: Destination[] = [
  { id: "start", title: "Start", href: "/", icon: House, keywords: ["Übersicht", "Fristen"] },
  { id: "aufgaben", title: "Aufgaben", href: "/aufgaben/", icon: SquareCheck },
  { id: "berichte", title: "Berichte", href: "/berichte/", icon: ChartColumn },
  { id: "ablaeufe", title: "Abläufe", href: "/ablaeufe/", icon: Workflow, keywords: ["Abschluss-Lauf", "Läufe"] },
];

export const SECTIONS: Section[] = [
  {
    id: "ihre-daten",
    title: "Ihre Daten",
    destinations: [
      {
        id: "belege",
        title: "Belege",
        href: "/belege/",
        icon: FileText,
        keywords: ["Regiebericht", "Aufmaßblatt", "Abschlagsrechnung", "Plan", "Vertrag", "Foto", "Ordner"],
      },
      { id: "e-mails", title: "E-Mails", href: "/e-mails/", icon: Mail },
      { id: "whatsapp-meldungen", title: "WhatsApp-Meldungen", href: "/whatsapp-meldungen/", icon: MessageCircle },
    ],
  },
  {
    id: "digitaler-zwilling",
    title: "Digitaler Zwilling",
    destinations: [
      { id: "uebersicht", title: "Übersicht", href: "/uebersicht/", icon: Layers, keywords: ["Zwilling", "Abgleich", "beauftragt", "erbracht", "verrechnet"] },
      { id: "betrieb", title: "Betrieb", href: "/betrieb/", icon: Building2, keywords: ["Verträge", "Preisbasis", "Mitglieder"] },
      { id: "auftraggeber", title: "Auftraggeber", href: "/auftraggeber/", icon: Briefcase, keywords: ["Hornfeld Bau"] },
      { id: "projekte", title: "Projekte", href: "/projekte/", icon: Construction, keywords: ["Wohnpark Mooshaim"] },
    ],
  },
  {
    id: "ergebnis",
    title: "Ergebnis",
    destinations: [
      { id: "funde", title: "Funde", href: "/funde/", icon: SearchCheck, keywords: ["Vorprüfung"] },
      {
        id: "schlussrechnungen",
        title: "Schlussrechnungen",
        href: "/schlussrechnungen/",
        icon: ReceiptText,
        keywords: ["Änderungsliste", "Rechnungsabschluss", "Restforderung"],
      },
    ],
  },
];

/** Every page of the sidebar in sidebar order. */
export const ALL: Destination[] = [...TOP, ...SECTIONS.flatMap((s) => s.destinations)];

/** Normalises a path to the form used in `href` (leading and trailing slash). */
export function normalisePath(pathname: string): string {
  const withLead = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return withLead.endsWith("/") ? withLead : `${withLead}/`;
}

/** The sidebar entry that owns a path: exact for Start, by prefix for everything else (a project belongs to Projekte). */
export function activeDestination(pathname: string): Destination | undefined {
  const path = normalisePath(pathname);
  if (path === "/") return TOP[0];
  return ALL.filter((d) => d.href !== "/" && path.startsWith(d.href)).sort((a, b) => b.href.length - a.href.length)[0];
}
