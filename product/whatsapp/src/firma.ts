// Kleiner synthetischer Firmen-Zwilling für den WhatsApp-Agenten. Alles fiktiv.
// Vorläufig: Sobald die Lösungsliste v2 (Firma mit 8 Projekten) im Generator der App steht, kommt die Projektliste von dort.

export type ProjektStatus = "laufend" | "abgeschlossen";

export interface FirmenProjekt {
  id: string;
  /** Langer Name wie im Firmen-Zwilling. */
  name: string;
  /** So nennen es die Leute auf der Baustelle. */
  kurz: string;
  /** Weitere Namen, unter denen es gerufen wird. */
  rufnamen: string[];
  ort: string;
  auftraggeber: string;
  status: ProjektStatus;
  /** Bereiche, Stiegen, Tops, Räume. Nur Orientierung für den Agenten, keine Pflichtliste. */
  bereiche: string[];
}

export interface Firma {
  name: string;
  gewerk: string;
  projekte: FirmenProjekt[];
}

export const FIRMA: Firma = {
  name: "Haustechnik Beispiel GmbH (fiktiv)",
  gewerk: "HKLS (Heizung, Klima, Lüftung, Sanitär)",
  projekte: [
    {
      id: "w21",
      name: "Wohnhausanlage Wien 21, Bauplatz B, HKLS-Los",
      kurz: "Wien 21",
      rufnamen: ["Floridsdorf", "Bauplatz B", "21er"],
      ort: "Wien 21 (fiktive Adresse)",
      auftraggeber: "Hochbau Beispiel GmbH (fiktiv)",
      status: "laufend",
      bereiche: ["Stiege 1", "Stiege 2", "Stiege 3", "Top 1 bis Top 24", "Keller", "Technikraum", "Tiefgarage", "Dach"],
    },
    {
      id: "w10",
      name: "Wohnbau Wien 10, Favoritner Höfe, Haustechnik",
      kurz: "Wien 10",
      rufnamen: ["Favoriten", "Favoritner Höfe", "10er"],
      ort: "Wien 10 (fiktive Adresse)",
      auftraggeber: "Bau Muster AG (fiktiv)",
      status: "laufend",
      bereiche: ["Haus A", "Haus B", "Top 1 bis Top 40", "Keller", "Müllraum", "Fahrradraum"],
    },
    {
      id: "mod",
      name: "Pflegeheim Mödling, Zubau Nord",
      kurz: "Mödling",
      rufnamen: ["Pflegeheim", "Zubau Nord"],
      ort: "Mödling (fiktiv)",
      auftraggeber: "Hochbau Beispiel GmbH (fiktiv)",
      status: "laufend",
      bereiche: ["EG", "1. OG", "2. OG", "Zimmer 101 bis 124", "Zimmer 201 bis 224", "Küche", "Pflegebad", "Technikzentrale"],
    },
    {
      id: "bad",
      name: "Volksschule Baden, Sanierung Sanitär und Lüftung",
      kurz: "Baden",
      rufnamen: ["Volksschule", "Schule Baden"],
      ort: "Baden (fiktiv)",
      auftraggeber: "Generalbau Fiktiv GmbH",
      status: "laufend",
      bereiche: ["Turnsaal", "Garderoben", "Klasse 1 bis Klasse 12", "Lehrer-WC", "Schüler-WC EG", "Schüler-WC OG", "Dachboden"],
    },
    {
      id: "tul",
      name: "Reihenhäuser Tulln, Heizung",
      kurz: "Tulln",
      rufnamen: ["Reihenhäuser"],
      ort: "Tulln (fiktiv)",
      auftraggeber: "Bau Muster AG (fiktiv)",
      status: "abgeschlossen",
      bereiche: ["Haus 1 bis Haus 8"],
    },
  ],
};

export function laufendeProjekte(firma: Firma = FIRMA): FirmenProjekt[] {
  return firma.projekte.filter((p) => p.status === "laufend");
}

export function projektNachId(id: string, firma: Firma = FIRMA): FirmenProjekt | undefined {
  return firma.projekte.find((p) => p.id === id);
}

/** Kurzbeschreibung für den Prompt. Stabil sortiert, damit der Prompt-Cache greift. */
export function firmaAlsText(firma: Firma = FIRMA): string {
  const zeilen = firma.projekte.map(
    (p) =>
      `- id: ${p.id} | ${p.kurz} | ${p.name} | auch genannt: ${p.rufnamen.join(", ")} | Status: ${p.status} | Bereiche: ${p.bereiche.join(", ")}`,
  );
  return `Firma: ${firma.name}, Gewerk: ${firma.gewerk}\nProjekte:\n${zeilen.join("\n")}`;
}
