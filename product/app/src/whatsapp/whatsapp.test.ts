// Einbau des WhatsApp-Agenten: Firma für den Agenten, Abbildung Leistungsereignis → Zuruf, Wortlaut der Szene.
import { describe, expect, it } from "vitest";
import { erzeugeFirma } from "@/demo/firma/erzeuge";
import { meldungAntwort } from "@/ui/meldung-text";
import type { Leistungsereignis, Nachricht } from "../../../zuruf/src/typen";
import { alsZuruf, offenText } from "./abbildung";
import { agentFirma } from "./firma";

const daten = erzeugeFirma();

describe("Firma für den WhatsApp-Agenten", () => {
  const f = agentFirma(daten);

  it("kommt aus dem Firmenzwilling: alle Projekte mit denselben Kennungen", () => {
    expect(f.name).toBe(daten.firma.name);
    expect(f.projekte.map((p) => p.id)).toEqual(daten.projekte.map((p) => p.projekt.id));
  });

  it("laufend sind nur Projekte in Ausführung oder vor der Schlussrechnung", () => {
    const laufend = daten.projekte.filter((p) => p.projekt.status === "in_ausfuehrung" || p.projekt.status === "sr_vorbereiten").map((p) => p.projekt.id);
    expect(f.projekte.filter((p) => p.status === "laufend").map((p) => p.id)).toEqual(laufend);
  });

  it("Rufnamen wie auf der Baustelle, Gebäudeart nur wenn eindeutig", () => {
    const w21 = f.projekte.find((p) => p.id === "w21-b-hkls")!;
    expect(w21.rufnamen).toEqual(["W21", "Wien 21", "21er"]);
    expect(f.projekte.find((p) => p.kurz === "Hotel Wien 2")?.rufnamen).toContain("Hotel");
  });
});

describe("Abbildung Leistungsereignis → Zuruf", () => {
  const n: Nachricht = { id: "m1", absenderId: "demo", zeit: "2026-10-22T14:30:00+02:00", art: "text", inhalt: "Wien 21, Top 5: Heizkörper versetzt, zu zweit sechs Stunden" };
  const e: Leistungsereignis = {
    id: "ev-1",
    version: 1,
    absenderId: "demo",
    rolle: "monteur",
    kanal: "simulator",
    erfasst: "2026-10-22T14:31:00+02:00",
    eintrag: {
      projektId: { wert: "w21-b-hkls", zitat: "Wien 21", nachrichtId: "m1" },
      ort: { wert: "Top 5", zitat: "Top 5", nachrichtId: "m1" },
      leistung: { wert: "Heizkörper versetzt", zitat: "Heizkörper versetzt", nachrichtId: "m1" },
      personen: { wert: 2, zitat: "zu zweit", nachrichtId: "m1" },
      dauerStunden: { wert: 6, zitat: "sechs Stunden", nachrichtId: "m1" },
    },
    offen: ["angewiesenVon"],
    status: "bestaetigt",
    hinweise: [],
    nachrichtIds: ["m1"],
  };
  const z = alsZuruf({ nr: "Z7", ereignis: e, nachrichten: [n] });

  it("ein App-Zuruf mit Zitat als Quelle", () => {
    expect(z).toMatchObject({ id: "zuruf-neu-ev-1", nr: "Z7", zeitpunkt: "2026-10-22T14:31", absender: "Monteur", foto: null, bezugRegie: null });
    expect(z.taetigkeit.wert).toBe("Heizkörper versetzt");
    expect(z.ort.quelle).toEqual({ dokumentId: "zuruf-neu-ev-1", seite: 1, stelle: "„Top 5“" });
    expect(z.transkript.wert).toBe(n.inhalt);
  });

  it("ohne Stunden für den Rechenkern: kein Betrag, Stunden und Regiebericht stehen als offen da", () => {
    expect(z.stundenMonteur.wert + z.stundenHelfer.wert).toBe(0);
    expect(offenText(e)).toBe("Stunden, Regiebericht, Anweiser");
  });
});

describe("Wortlaut der Szene", () => {
  it("Szene und Belegseite sagen dasselbe wie die Lösungsliste (Demo_Faelle.md, Szene Schritt 2)", () => {
    const w21 = daten.projekte[0]!;
    const z6 = w21.zurufe.find((z) => z.nr === "Z6")!;
    expect(meldungAntwort(z6, w21.projekt.name)).toBe(
      "Danke. So habe ich es verstanden: Wohnhausanlage Wien 21, Stiege 2, Top 9. Heizkörper im Wohnzimmer versetzt, keine LV-Position. 6 h Monteur, 6 h Helfer. Angewiesen vom Polier GU. Regiebericht: keiner. Stimmt das?",
    );
  });
});
