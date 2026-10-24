import { describe, expect, it } from "vitest";
import { PROJECT_TABS, STEPS } from "./example";
import { ALL, SECTIONS, TOP, activeDestination } from "./navigation";

describe("navigation", () => {
  it("has the sidebar of SPEZIFIKATION.md 4.1 in this order", () => {
    expect(TOP.map((d) => d.title)).toEqual(["Start", "Aufgaben", "Berichte", "Abläufe"]);
    expect(SECTIONS.map((s) => s.title)).toEqual(["Ihre Daten", "Digitaler Zwilling", "Ergebnis"]);
    expect(SECTIONS.map((s) => s.destinations.map((d) => d.title))).toEqual([
      ["Belege", "E-Mails", "WhatsApp-Meldungen"],
      ["Übersicht", "Betrieb", "Auftraggeber", "Projekte"],
      ["Funde", "Schlussrechnungen"],
    ]);
  });

  it("gives every page its own address", () => {
    const hrefs = ALL.map((d) => d.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    for (const h of hrefs) expect(h).toMatch(/^\/([a-z-]+\/)?$/);
  });

  it("marks the owning sidebar entry", () => {
    expect(activeDestination("/")?.id).toBe("start");
    expect(activeDestination("/belege")?.id).toBe("belege");
    expect(activeDestination("/projekte/wohnpark-mooshaim/funde/")?.id).toBe("projekte");
    expect(activeDestination("/betrieb/mitglieder/")?.id).toBe("betrieb");
    expect(activeDestination("/gibt-es-nicht/")).toBeUndefined();
  });

  it("orders the project tabs by the three steps", () => {
    expect(STEPS.map((s) => s.title)).toEqual(["Ihre Daten", "Digitaler Zwilling", "Ergebnis"]);
    expect(PROJECT_TABS.map((t) => t.title)).toEqual(["Überblick", "Zeitstrahl", "Belege", "Positionen", "Vertrag", "Funde", "Schlussrechnung"]);
    expect(STEPS.flatMap((s) => s.run)).toEqual(["Ordner lesen", "Abgleich", "Vorprüfung", "Entwurf", "Ausgaben"]);
  });
});
