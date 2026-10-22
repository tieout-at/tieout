// Route ohne echte KI: Schalter, Obergrenze, Gespräch über mehrere Anfragen mit mitgeschicktem Stand.
import { describe, expect, it } from "vitest";
import { FIRMA } from "../src/firma.ts";
import type { KiFrage } from "../src/ki.ts";
import { speicherZaehler, wienZeit, zurufAnfrage, zurufRoute, type RoutenAntwort, type RoutenOptionen } from "./route.ts";

// Feste KI-Antwort im Schema von verstehen.ts: ein vollständiger Zuruf auf Wien 21, Zitate aus der Nachricht „id“.
const kiAntwort = (id: string) => ({
  absicht: "zuruf",
  enthaeltFrageGeldRecht: false,
  ungeduldig: false,
  angekuendigtePunkte: null,
  eintraege: [
    {
      projektId: { wert: "w21", zitat: "Wien 21", nachrichtId: id },
      ort: { wert: "Top 5", zitat: "Top 5", nachrichtId: id },
      leistung: { wert: "Heizkörper versetzt", zitat: "Heizkörper versetzt", nachrichtId: id },
      menge: null,
      personen: null,
      dauerStunden: null,
      angewiesenVon: null,
      datum: null,
      material: null,
      grund: null,
      projektKandidaten: [],
      art: "auftrag",
      unklar: [],
      bezugId: null,
    },
  ],
});

let aufrufe = 0;
let zurufId = "";
const frage: KiFrage = async () => {
  aufrufe++;
  return kiAntwort(zurufId) as never;
};

const optionen = (extra: Partial<RoutenOptionen> = {}): RoutenOptionen => ({
  echt: true,
  firma: FIRMA,
  frage,
  zaehler: speicherZaehler(),
  jetzt: () => new Date("2026-10-22T12:30:00Z"),
  ...extra,
});

let nr = 0;
async function senden(opts: RoutenOptionen, inhalt: string, stand?: RoutenAntwort["stand"], knopfId?: string) {
  const id = `n${++nr}`;
  if (!knopfId) zurufId = id;
  const body = {
    stand,
    nachrichten: [{ id, absenderId: "demo", zeit: "", art: knopfId ? "knopf" : "text", inhalt, knopfId }],
  };
  const r = await zurufRoute(new Request("https://demo.test/api/zuruf/nachricht", { method: "POST", body: JSON.stringify(body) }), opts);
  return { status: r.status, daten: (await r.json()) as RoutenAntwort };
}

describe("Route /api/zuruf/nachricht", () => {
  it("gibt es nicht, solange der Schalter aus ist", async () => {
    const { status } = await senden(optionen({ echt: false }), "Hallo");
    expect(status).toBe(404);
  });

  it("Begrüßung, Einwilligung, Zuruf, Passt: Ereignis kommt als neu zurück, Zeit in Wiener Ortszeit", async () => {
    const opts = optionen();
    const a = await senden(opts, "Wien 21 Top 5 Heizkörper versetzt");
    expect(a.daten.antworten[0]?.zweck).toBe("begruessung");
    const b = await senden(opts, "Ja, passt", a.daten.stand, "einw_ja");
    const c = b.daten.antworten.some((x) => x.zweck === "zusammenfassung") ? b : await senden(opts, "Wien 21 Top 5 Heizkörper versetzt", b.daten.stand);
    expect(c.daten.antworten.at(-1)?.zweck).toBe("zusammenfassung");
    const d = await senden(opts, "Passt", c.daten.stand, "passt");
    expect(d.daten.antworten[0]?.zweck).toBe("gespeichert");
    expect(d.daten.neu).toHaveLength(1);
    expect(d.daten.neu[0]?.eintrag.leistung?.wert).toBe("Heizkörper versetzt");
    expect(d.daten.neu[0]?.erfasst).toBe("2026-10-22T14:30:00+02:00");
  });

  it("stoppt bei der Tagesgrenze ohne KI-Aufruf", async () => {
    const opts = optionen({ grenze: 0 });
    const vorher = aufrufe;
    const { daten } = await senden(opts, "Wien 21 Top 5 Heizkörper versetzt");
    expect(daten.obergrenze).toBe(true);
    expect(aufrufe).toBe(vorher);
  });

  it("lehnt kaputte Anfragen ab", async () => {
    const r = await zurufRoute(new Request("https://demo.test/api/zuruf/nachricht", { method: "POST", body: "{}" }), optionen());
    expect(r.status).toBe(400);
  });
});

describe("Einstieg für den Worker", () => {
  const anfrage = (pfad: string) => new Request(`https://demo.test${pfad}`, { method: "POST", body: "{}" });
  it("antwortet nur auf /api/zuruf/", async () => {
    expect(await zurufAnfrage(anfrage("/api/mitglieder"), {}, FIRMA, speicherZaehler())).toBeNull();
  });
  it("aus, solange ZURUF_ECHT nicht „an“ ist", async () => {
    expect((await zurufAnfrage(anfrage("/api/zuruf/nachricht"), { ANTHROPIC_API_KEY: "x" }, FIRMA, speicherZaehler()))?.status).toBe(404);
  });
  it("an, aber ohne Schlüssel oder Zähler: nicht eingerichtet, keine KI", async () => {
    expect((await zurufAnfrage(anfrage("/api/zuruf/nachricht"), { ZURUF_ECHT: "an" }, FIRMA, speicherZaehler()))?.status).toBe(503);
    expect((await zurufAnfrage(anfrage("/api/zuruf/nachricht"), { ZURUF_ECHT: "an", ANTHROPIC_API_KEY: "x" }, FIRMA, null))?.status).toBe(503);
  });
});

describe("wienZeit", () => {
  it("Sommer- und Winterzeit", () => {
    expect(wienZeit(new Date("2026-07-01T10:00:00Z"))).toBe("2026-07-01T12:00:00+02:00");
    expect(wienZeit(new Date("2026-12-01T23:30:00Z"))).toBe("2026-12-02T00:30:00+01:00");
  });
});
