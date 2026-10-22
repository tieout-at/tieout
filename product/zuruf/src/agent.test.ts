// Gesprächsregeln ohne KI: Der Versteher wird durch feste Antworten ersetzt.
import { describe, expect, it } from "vitest";
import { ZurufAgent } from "./agent.ts";
import { Arbeitsspeicher } from "./speicher.ts";
import type { Nachricht } from "./typen.ts";
import type { Verstaendnis, Versteher } from "./verstehen.ts";

let nr = 0;
const msg = (inhalt: string, extra: Partial<Nachricht> = {}): Nachricht => ({
  id: `m${++nr}`,
  absenderId: "a1",
  zeit: "2026-10-22T14:32:00+02:00",
  art: "sprache",
  inhalt,
  ...extra,
});
const knopf = (knopfId: string, inhalt: string) => msg(inhalt, { art: "knopf", knopfId });

function stub(...antworten: ((n: Nachricht) => Verstaendnis)[]): Versteher {
  let i = 0;
  return async (e) => antworten[Math.min(i++, antworten.length - 1)]!(e.neu);
}

const zuruf = (felder: Record<string, [unknown, string]>, opts: Partial<{ kandidaten: string[]; zusatz: boolean }> = {}) =>
  (n: Nachricht): Verstaendnis => ({
    absicht: "zuruf",
    enthaeltFrageGeldRecht: false,
    eintraege: [
      {
        eintrag: Object.fromEntries(Object.entries(felder).map(([k, [wert, zitat]]) => [k, { wert, zitat, nachrichtId: n.id }])),
        projektKandidaten: opts.kandidaten ?? [],
        art: opts.zusatz ? "zusatz_aenderung" : "auftrag",
        unklar: [],
      },
    ],
  });

function neu(versteher: Versteher, einwilligung = true) {
  const speicher = new Arbeitsspeicher();
  if (einwilligung) speicher.setzeEinwilligung("a1", "monteur");
  return { agent: new ZurufAgent(speicher, versteher), speicher };
}

describe("Zuruf-Agent", () => {
  it("vollständiger Zuruf: keine Rückfrage, Zusammenfassung, nach Passt gespeichert", async () => {
    const text = "Wien 21, Top 5, Heizkörper versetzt, der Bauleiter vom GU hat des so wollen, zu zweit, sechs Stunden";
    const { agent, speicher } = neu(
      stub(zuruf({ projektId: ["w21", "Wien 21"], ort: ["Top 5", "Top 5"], leistung: ["Heizkörper versetzt", "Heizkörper versetzt"], personen: [2, "zu zweit"], dauerStunden: [6, "sechs Stunden"], angewiesenVon: ["Bauleiter des GU", "der Bauleiter vom GU"] }, { zusatz: true })),
    );
    const a1 = await agent.verarbeite(msg(text));
    expect(a1.map((a) => a.zweck)).toEqual(["zusammenfassung"]);
    expect(a1[0]!.text).toContain("Wien 21, Top 5");
    expect(a1[0]!.text).toContain("2 Leute, 6 Stunden");
    const a2 = await agent.verarbeite(knopf("passt", "Passt"));
    expect(a2[0]!.zweck).toBe("gespeichert");
    const [e] = speicher.ereignisse();
    expect(e?.status).toBe("bestaetigt");
    expect(e?.offen).toEqual([]);
  });

  it("verwirft erfundene Angaben", async () => {
    const { agent, speicher } = neu(stub(zuruf({ projektId: ["w21", "Wien 21"], leistung: ["WC montiert", "WC montiert"], angewiesenVon: ["Bauherr", "der Bauherr"] })));
    await agent.verarbeite(msg("Wien 21 WC montiert"));
    await agent.verarbeite(msg("passt"));
    expect(speicher.ereignisse()[0]?.eintrag.angewiesenVon).toBeUndefined();
    expect(agent.protokoll.verworfen[0]?.feld).toBe("angewiesenVon");
  });

  it("fragt nach der Baustelle mit Knöpfen und übernimmt die Wahl", async () => {
    const { agent, speicher } = neu(stub(zuruf({ leistung: ["Kernbohrung", "Kernbohrung"] }, { kandidaten: ["w21", "w10"] })));
    const a1 = await agent.verarbeite(msg("in Wien a Kernbohrung gmacht"));
    expect(a1[0]!.zweck).toBe("rueckfrage");
    expect(a1[0]!.knoepfe?.map((k) => k.id)).toEqual(["projekt:w21", "projekt:w10"]);
    const a2 = await agent.verarbeite(knopf("projekt:w10", "Wien 10"));
    expect(a2[0]!.zweck).toBe("zusammenfassung");
    await agent.verarbeite(knopf("passt", "Passt"));
    expect(speicher.ereignisse()[0]?.eintrag.projektId?.wert).toBe("w10");
  });

  it("höchstens zwei Rückfragen, danach Zusammenfassung mit Offenem", async () => {
    const leer = (): Verstaendnis => ({ absicht: "zuruf", enthaeltFrageGeldRecht: false, eintraege: [{ eintrag: {}, projektKandidaten: [], art: "zusatz_aenderung", unklar: [] }] });
    const { agent } = neu(stub(leer));
    const zwecke: string[] = [];
    for (const t of ["hab was gmacht", "keine ahnung", "egal"]) zwecke.push(...(await agent.verarbeite(msg(t))).map((a) => a.zweck));
    expect(zwecke.filter((z) => z === "rueckfrage").length).toBe(2);
    expect(zwecke.at(-1)).toBe("zusammenfassung");
  });

  it("fragt bei Zusatzarbeit nach dem Anweiser, bei normaler Arbeit nicht", async () => {
    const felder = { projektId: ["mod", "Mödling"], leistung: ["Waschtisch montiert", "Waschtisch montiert"] } as Record<string, [unknown, string]>;
    const normal = neu(stub(zuruf(felder, { zusatz: false })));
    expect((await normal.agent.verarbeite(msg("Mödling Waschtisch montiert")))[0]!.zweck).toBe("zusammenfassung");
    const zusatz = neu(stub(zuruf(felder, { zusatz: true })));
    const a = await zusatz.agent.verarbeite(msg("Mödling Waschtisch montiert"));
    expect(a[0]!.text).toBe("Wer hat das angeschafft?");
  });

  it("Erstkontakt: Nachricht wartet, nach Zustimmung wird sie verarbeitet", async () => {
    const { agent } = neu(stub(zuruf({ projektId: ["bad", "Baden"], leistung: ["Lüftungskanal", "Lüftungskanal"] })), false);
    const a1 = await agent.verarbeite(msg("Baden Lüftungskanal montiert"));
    expect(a1[0]!.zweck).toBe("begruessung");
    const a2 = await agent.verarbeite(knopf("einw_ja", "Ja, passt"));
    expect(a2[0]!.zweck).toBe("zusammenfassung");
  });

  it("Erstkontakt abgelehnt: nichts gespeichert", async () => {
    const { agent, speicher } = neu(stub(zuruf({ leistung: ["x", "x"] })), false);
    await agent.verarbeite(msg("x"));
    await agent.verarbeite(knopf("einw_nein", "Nein danke"));
    expect(speicher.ereignisse()).toEqual([]);
  });

  it("stopp verwirft den offenen Zuruf und speichert danach nichts", async () => {
    const { agent, speicher } = neu(stub(zuruf({ projektId: ["w21", "Wien 21"], leistung: ["Steigleitung", "Steigleitung"] })));
    await agent.verarbeite(msg("Wien 21 Steigleitung"));
    expect((await agent.verarbeite(msg("Stopp")))[0]!.zweck).toBe("stopp");
    expect((await agent.verarbeite(msg("Wien 21 Steigleitung fertig")))[0]!.zweck).toBe("gestoppt_hinweis");
    expect(speicher.ereignisse()).toEqual([]);
  });

  it("doppelt gelieferte Nachricht wird ignoriert", async () => {
    const { agent } = neu(stub(zuruf({ projektId: ["w21", "Wien 21"], leistung: ["WC", "WC"] })));
    const m = msg("Wien 21 WC");
    await agent.verarbeite(m);
    expect(await agent.verarbeite(m)).toEqual([]);
  });

  it("Korrektur nach dem Speichern: neue Version, alte bleibt", async () => {
    const korrektur = (n: Nachricht): Verstaendnis => ({
      absicht: "korrektur_gespeichert",
      enthaeltFrageGeldRecht: false,
      eintraege: [{ eintrag: { projektId: { wert: "w21", zitat: "Wien 21", nachrichtId: "x" }, leistung: { wert: "WC", zitat: "WC", nachrichtId: "x" }, dauerStunden: { wert: 3, zitat: "drei Stunden", nachrichtId: n.id } }, projektKandidaten: [], art: "auftrag", unklar: [] }],
    });
    const { agent, speicher } = neu(stub(zuruf({ projektId: ["w21", "Wien 21"], leistung: ["WC", "WC"], dauerStunden: [2, "zwei Stunden"] }), korrektur));
    await agent.verarbeite(msg("Wien 21 WC zwei Stunden"));
    await agent.verarbeite(knopf("passt", "Passt"));
    const a = await agent.verarbeite(msg("na, warn drei Stunden"));
    expect(a[0]!.text).toContain("Geändert");
    await agent.verarbeite(knopf("passt", "Passt"));
    const liste = speicher.ereignisse();
    expect(liste.map((e) => [e.version, e.eintrag.dauerStunden?.wert])).toEqual([[1, 2], [2, 3]]);
    expect(liste[1]?.id).toBe(liste[0]?.id);
  });

  it("Tagesabschluss legt offenen Zuruf unbestätigt ab", async () => {
    const { agent, speicher } = neu(stub(zuruf({ projektId: ["w21", "Wien 21"], leistung: ["WC", "WC"] })));
    await agent.verarbeite(msg("Wien 21 WC"));
    agent.tagesabschluss(speicher.zustand("a1", "monteur"));
    expect(speicher.ereignisse()[0]?.status).toBe("unbestaetigt");
  });
});

describe("Lernpunkte aus Lauf 1", () => {
  it("erkennt Nein im Dialekt und fragt nicht endlos (L3)", async () => {
    const { agent, speicher } = neu(stub(zuruf({ leistung: ["x", "x"] })), false);
    await agent.verarbeite(msg("Mödling WC-Spülung repariert"));
    const a = await agent.verarbeite(msg("na, des wü i ned, i schreib des eh auf an zettel"));
    expect(a[0]!.zweck).toBe("stopp");
    expect(a[0]!.text).toContain("auch nicht deine Nachricht");
    expect(speicher.ereignisse()).toEqual([]);
  });

  it("fragt nach der Begrüßung höchstens einmal nach (L3)", async () => {
    const { agent } = neu(stub(zuruf({ leistung: ["x", "x"] })), false);
    await agent.verarbeite(msg("Mödling WC"));
    expect((await agent.verarbeite(msg("hm")))[0]?.zweck).toBe("begruessung");
    expect(await agent.verarbeite(msg("was")))?.toEqual([]);
  });

  it("wiederholt bei Privatem nicht wortgleich denselben Satz (L4)", async () => {
    const kein = (): Verstaendnis => ({ absicht: "kein_zuruf", enthaeltFrageGeldRecht: false, eintraege: [] });
    const { agent } = neu(stub(kein));
    const a1 = await agent.verarbeite(msg("wer bringt die leberkässemmeln"));
    const a2 = await agent.verarbeite(msg("hoppla falscher chat"));
    expect(a2[0]!.text).not.toBe(a1[0]!.text);
  });

  it("fragt Unverständliches nach, mit Knöpfen bei Personen (L2)", async () => {
    const mitLuecke = (n: Nachricht): Verstaendnis => ({
      absicht: "zuruf",
      enthaeltFrageGeldRecht: false,
      eintraege: [{ eintrag: { projektId: { wert: "w21", zitat: "Wien 21", nachrichtId: n.id }, leistung: { wert: "Steigleitung angebunden", zitat: "Steigleitung", nachrichtId: n.id } }, projektKandidaten: [], art: "auftrag", unklar: ["personen"] }],
    });
    const { agent, speicher } = neu(stub(mitLuecke));
    const a = await agent.verarbeite(msg("Wien 21 Steigleitung [unverständlich] Mann"));
    expect(a[0]!.text).toContain("Wie viele wart ihr");
    expect(a[0]!.knoepfe?.map((k) => k.id)).toContain("personen:2");
    const b = await agent.verarbeite(knopf("personen:2", "Zu zweit"));
    expect(b[0]!.text).toContain("2 Leute");
    await agent.verarbeite(knopf("passt", "Passt"));
    expect(speicher.ereignisse()[0]?.eintrag.personen?.wert).toBe(2);
  });

  it("Geldfrage und Zusammenfassung in einer Nachricht, neutral formuliert (L5, L6)", async () => {
    const mitFrage = (n: Nachricht): Verstaendnis => ({ ...zuruf({ projektId: ["w21", "Wien 21"], ort: ["Keller", "Keller"], leistung: ["Verteiler versetzt", "Verteiler versetzt"], angewiesenVon: ["Polier", "Polier"], personen: [3, "zu dritt"] }, { zusatz: true })(n), enthaeltFrageGeldRecht: true });
    const { agent } = neu(stub(mitFrage));
    const a = await agent.verarbeite(msg("Wien 21 Keller Verteiler versetzt, Polier hat gsagt, zu dritt. Kriegn ma des zahlt?"));
    expect(a).toHaveLength(1);
    expect(a[0]!.text).toContain("das entscheide ich nicht");
    expect(a[0]!.text).toContain("Danke, hab ich so");
    const b = await agent.verarbeite(knopf("passt", "Passt"));
    expect(b[0]!.text).not.toContain("Abrechnung");
  });

  it("Behinderung: keine Frage nach dem Anweiser, Hinweis fürs Büro (L8)", async () => {
    const warten = (n: Nachricht): Verstaendnis => ({
      absicht: "zuruf",
      enthaeltFrageGeldRecht: false,
      eintraege: [{ eintrag: { projektId: { wert: "bad", zitat: "baden", nachrichtId: n.id }, ort: { wert: "Turnsaal", zitat: "turnsaal", nachrichtId: n.id }, leistung: { wert: "gewartet, Kran fehlte", zitat: "kran nicht da", nachrichtId: n.id } }, projektKandidaten: [], art: "behinderung_wartezeit", unklar: [] }],
    });
    const { agent, speicher } = neu(stub(warten));
    const a = await agent.verarbeite(msg("baden turnsaal kran nicht da, 3 mann 2 std gewartet"));
    expect(a[0]!.zweck).toBe("zusammenfassung");
    await agent.verarbeite(knopf("passt", "Passt"));
    expect(speicher.ereignisse()[0]?.hinweise).toContain("Behinderung oder Wartezeit");
  });

  it("stopp sagt, dass der angefangene Zuruf verworfen ist, und Wiedereinstieg ohne Codewort (L11)", async () => {
    const { agent } = neu(stub(zuruf({ projektId: ["w10", "wien 10"], leistung: ["Heizkörper versetzt", "heizkörper versetzt"] }, { zusatz: true })));
    await agent.verarbeite(msg("wien 10 top 30 heizkörper versetzt"));
    const a = await agent.verarbeite(msg("stopp"));
    expect(a[0]!.text).toContain("verworfen");
    const b = await agent.verarbeite(msg("wien 10 heizkörper versetzt"));
    expect(b[0]!.knoepfe?.map((k) => k.id)).toContain("einw_ja");
    const c = await agent.verarbeite(knopf("einw_ja", "Ja, aufnehmen"));
    expect(c[0]!.zweck).toBe("rueckfrage");
  });
});
