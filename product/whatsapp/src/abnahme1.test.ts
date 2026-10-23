// Regressionstests zu den Mustern aus der ersten Abnahme (LERNEN.md, A1 bis A12). Der Versteher ist durch feste Antworten ersetzt.
import { describe, expect, it } from "vitest";
import { WhatsAppAgent } from "./agent.ts";
import { aktuellerStand, Arbeitsspeicher } from "./speicher.ts";
import type { Eintrag, Nachricht } from "./typen.ts";
import type { Art, EintragMitHinweis, Verstaendnis, Versteher, VerstehenEingabe } from "./verstehen.ts";

let nr = 0;
const msg = (inhalt: string, extra: Partial<Nachricht> = {}): Nachricht => ({
  id: `a${++nr}`,
  absenderId: "a1",
  zeit: "2026-10-27T09:00:00+01:00",
  art: "sprache",
  inhalt,
  ...extra,
});
const knopf = (knopfId: string, inhalt: string) => msg(inhalt, { art: "knopf", knopfId });

function stub(...antworten: ((n: Nachricht, e: VerstehenEingabe) => Verstaendnis)[]): Versteher {
  let i = 0;
  return async (e) => antworten[Math.min(i++, antworten.length - 1)]!(e.neu, e);
}

function neu(versteher: Versteher, einwilligung = true) {
  const speicher = new Arbeitsspeicher();
  if (einwilligung) speicher.setzeEinwilligung("a1", "monteur");
  return { agent: new WhatsAppAgent(speicher, versteher), speicher };
}

const a = <T,>(wert: T, zitat: string, nachrichtId: string) => ({ wert, zitat, nachrichtId });
const punkt = (eintrag: Eintrag, art: Art = "auftrag"): EintragMitHinweis => ({ eintrag, projektKandidaten: [], art, unklar: [] });
const v = (absicht: Verstaendnis["absicht"], eintraege: EintragMitHinweis[], extra: Partial<Verstaendnis> = {}): Verstaendnis => ({
  absicht,
  enthaeltFrageGeldRecht: false,
  eintraege,
  ...extra,
});

describe("Abnahme 1: Muster", () => {
  it("A1 Nachtrag bei offener Zusammenfassung wird angehängt, nichts still abgelegt, Baustelle nicht neu gefragt", async () => {
    let erste = "";
    const { agent, speicher } = neu(
      stub(
        (n) => ((erste = n.id), v("zuruf", [punkt({ projektId: a("mod", "Mödling", n.id), leistung: a("Pumpe getauscht", "Pumpe getauscht", n.id) })])),
        (n) => v("neuer_zuruf", [punkt({ leistung: a("Ventil getauscht", "Ventil getauscht", n.id) })]),
      ),
    );
    await agent.verarbeite(msg("Mödling Pumpe getauscht"));
    const antwort = await agent.verarbeite(msg("und no Ventil getauscht"));
    expect(erste).not.toBe("");
    expect(antwort[0]!.zweck).toBe("zusammenfassung");
    expect(antwort[0]!.text).toContain("1) Mödling");
    expect(antwort[0]!.text).toContain("2) Mödling");
    expect(speicher.ereignisse()).toEqual([]);
    await agent.verarbeite(knopf("passt", "Passt"));
    expect(speicher.ereignisse().map((e) => e.status)).toEqual(["bestaetigt", "bestaetigt"]);
  });

  it("A2 Korrektur des ersten von zwei gespeicherten Punkten ändert nur diesen, nichts geht verloren", async () => {
    const zwei = (n: Nachricht) =>
      v("zuruf", [
        punkt({ projektId: a("mod", "Mödling", n.id), leistung: a("Pumpe getauscht", "Pumpe getauscht", n.id), dauerStunden: a(2, "2 Stunden", n.id) }),
        punkt({ projektId: a("mod", "Mödling", n.id), leistung: a("Ventil getauscht", "Ventil getauscht", n.id), dauerStunden: a(1, "1 Stunde", n.id) }),
      ]);
    const korrektur = (n: Nachricht, e: VerstehenEingabe) => {
      const pumpe = e.gespeichert!.eintraege.find((g) => g.eintrag.leistung?.wert === "Pumpe getauscht")!;
      return v("korrektur_gespeichert", [{ ...punkt({ ...pumpe.eintrag, dauerStunden: a(3, "3 Stunden", n.id) }), bezugId: pumpe.id }]);
    };
    const { agent, speicher } = neu(stub(zwei, korrektur));
    await agent.verarbeite(msg("Mödling Pumpe getauscht 2 Stunden, Ventil getauscht 1 Stunde"));
    await agent.verarbeite(knopf("passt", "Passt"));
    const antwort = await agent.verarbeite(msg("bei der Pumpe warn es 3 Stunden"));
    expect(antwort[0]!.zweck).toBe("zusammenfassung");
    await agent.verarbeite(knopf("passt", "Passt"));
    const stand = aktuellerStand(speicher.ereignisse());
    expect(stand).toHaveLength(2);
    const pumpe = stand.find((e) => e.eintrag.leistung?.wert === "Pumpe getauscht")!;
    const ventil = stand.find((e) => e.eintrag.leistung?.wert === "Ventil getauscht")!;
    expect([pumpe.version, pumpe.eintrag.dauerStunden?.wert, pumpe.eintrag.projektId?.wert]).toEqual([2, 3, "mod"]);
    expect([ventil.version, ventil.eintrag.dauerStunden?.wert]).toEqual([1, 1]);
  });

  it("A4 Rückfragen-Grenze gilt pro Absender, nicht pro Entwurf", async () => {
    const { agent } = neu(stub(() => v("neuer_zuruf", [punkt({}, "zusatz_aenderung")])));
    let fragen = 0;
    for (const t of ["eins", "zwei", "drei", "vier"]) fragen += (await agent.verarbeite(msg(t))).filter((x) => x.zweck === "rueckfrage").length;
    expect(fragen).toBe(2);
  });

  it("A5 A8 Ungeduld: keine weitere Rückfrage, Offenes steht in der Zusammenfassung", async () => {
    let erste = "";
    const ohneAnweiser = (id: string) => v("zuruf", [punkt({ projektId: a("bad", "Baden", id), leistung: a("Duschköpfe getauscht", "Duschköpfe getauscht", id) }, "zusatz_aenderung")]);
    const { agent } = neu(stub((n) => ((erste = n.id), ohneAnweiser(n.id)), () => ({ ...ohneAnweiser(erste), ungeduldig: true })));
    expect((await agent.verarbeite(msg("Baden Duschköpfe getauscht")))[0]!.zweck).toBe("rueckfrage");
    const antwort = await agent.verarbeite(msg("hab ka zeit, is eh klar"));
    expect(antwort[0]!.zweck).toBe("zusammenfassung");
    expect(antwort[0]!.text).toContain("wer angeschafft hat");
  });

  it("A6 Reparatur ohne Anordnung: keine Anweiser-Frage, Hinweis fürs Büro", async () => {
    const { agent, speicher } = neu(
      stub((n) => v("zuruf", [punkt({ projektId: a("w10", "Wien 10", n.id), leistung: a("Leitung repariert", "Leitung repariert", n.id) }, "reparatur_schaden")])),
    );
    expect((await agent.verarbeite(msg("Wien 10 Leitung repariert, Trockenbauer hat angebohrt")))[0]!.zweck).toBe("zusammenfassung");
    await agent.verarbeite(knopf("passt", "Passt"));
    expect(speicher.ereignisse()[0]?.hinweise.join()).toContain("Reparatur");
  });

  it("A7 Zusatz mit Menge: keine Frage nach dem Aufwand", async () => {
    const { agent } = neu(
      stub((n) =>
        v("zuruf", [
          punkt(
            { projektId: a("mod", "Mödling", n.id), leistung: a("Kondensatleitung verlegt", "Kondensatleitung", n.id), menge: a({ wert: 14, einheit: "m" }, "14 Meter", n.id), angewiesenVon: a("Bauleiterin", "Bauleiterin", n.id) },
            "zusatz_aenderung",
          ),
        ]),
      ),
    );
    expect((await agent.verarbeite(msg("Mödling 14 Meter Kondensatleitung, hat die Bauleiterin angeschafft")))[0]!.zweck).toBe("zusammenfassung");
  });

  it("A9 Angekündigte Aufzählung: erst sammeln, dann zusammenfassen", async () => {
    let erste = "";
    const p = (n: Nachricht) => punkt({ projektId: a("w21", "21er", erste), leistung: a(n.inhalt, n.inhalt, n.id) });
    const { agent } = neu(
      stub(
        (n) => ((erste = n.id), v("zuruf", [punkt({ projektId: a("w21", "21er", n.id), leistung: a("WC", "WC", n.id) })], { angekuendigtePunkte: 3 })),
        (n) => v("neuer_zuruf", [p(n)]),
      ),
    );
    expect((await agent.verarbeite(msg("drei sachen: 21er WC")))[0]!.zweck).toBe("sammeln");
    expect((await agent.verarbeite(msg("Waschtisch")))[0]!.zweck).toBe("sammeln");
    const antwort = await agent.verarbeite(msg("Dusche"));
    expect(antwort[0]!.zweck).toBe("zusammenfassung");
    expect(antwort[0]!.text).toContain("3)");
  });

  it("A10 Foto und Text als Bündel: eine Antwort, keine Rückfrage auf das Foto", async () => {
    const { agent } = neu(
      stub((n) => v("zuruf", [punkt({ projektId: a("bad", "Baden", n.id), leistung: a("Revisionsöffnung gesetzt", "Revisionsöffnung gesetzt", n.id) })])),
    );
    const antwort = await agent.verarbeiteBuendel([msg("Foto: Dachboden", { art: "foto" }), msg("Baden Revisionsöffnung gesetzt")]);
    expect(antwort).toHaveLength(1);
    expect(antwort[0]!.zweck).toBe("zusammenfassung");
  });

  it("L17 Bündel ohne offenen Zuruf: KI sieht alle Nachrichten als eine Meldung, „Nachtrag“ wird zu „zuruf“", async () => {
    let gesehen: VerstehenEingabe | undefined;
    const versteher: Versteher = async (e) => {
      gesehen = e;
      const erste = e.mitgeschickt![0]!;
      return v("neuer_zuruf", [
        punkt({ projektId: a("w10", "Favoriten", erste.id), leistung: a("Badheizkörper höher gesetzt", "höher gsetzt", erste.id) }),
        punkt({ projektId: a("w10", "Favoriten", erste.id), leistung: a("Bodenablauf freigemacht", "bodenablauf freigmacht", e.neu.id) }),
      ]);
    };
    const { agent } = neu(versteher);
    const antwort = await agent.verarbeiteBuendel([msg("Favoriten Haus A Top 8 Badheizkörper höher gsetzt"), msg("und im müllraum noch den bodenablauf freigmacht")]);
    expect(gesehen?.mitgeschickt).toHaveLength(1);
    expect(gesehen?.entwurf).toBeUndefined();
    expect(antwort[0]!.text).toContain("1)");
    expect(antwort[0]!.text).toContain("2)");
  });

  it("Quelle pro Eintrag: nur die Nachrichten, aus denen seine Angaben stammen; Zusammenfassung mit Unterzeilen", async () => {
    const { agent, speicher } = neu(
      stub(
        (n) => v("zuruf", [punkt({ projektId: a("w21", "Wien 21", n.id), leistung: a("Heizkörper versetzt", "Heizkörper versetzt", n.id) })]),
        (n) => v("neuer_zuruf", [punkt({ projektId: a("bad", "Baden", n.id), leistung: a("WC montiert", "WC montiert", n.id) })]),
      ),
    );
    const m1 = msg("Wien 21 Heizkörper versetzt");
    const m2 = msg("und in Baden WC montiert");
    await agent.verarbeite(m1);
    const zusammenfassung = await agent.verarbeite(m2);
    expect(zusammenfassung[0]!.text).toContain("1) Wien 21\n    Heizkörper versetzt");
    await agent.verarbeite(knopf("passt", "Passt"));
    const [heizung, wc] = speicher.ereignisse();
    expect(heizung!.nachrichtIds).toEqual([m1.id]);
    expect(wc!.nachrichtIds).toEqual([m2.id]);
  });

  it("A11 Zweite Geldfrage: anderer Satz, Zusammenfassung nicht wiederholt", async () => {
    const { agent } = neu(
      stub(
        (n) => v("zuruf", [punkt({ projektId: a("w21", "Wien 21", n.id), leistung: a("Badewanne", "Badewanne", n.id) })]),
        () => v("frage_geld_recht", [], { enthaeltFrageGeldRecht: true }),
      ),
    );
    await agent.verarbeite(msg("Wien 21 Badewanne"));
    const erste = await agent.verarbeite(msg("wer zahlt ma des"));
    const zweite = await agent.verarbeite(msg("bis wann muass des beim gu gmeldet sein"));
    expect(zweite[0]!.text).not.toBe(erste[0]!.text);
    expect(zweite[0]!.text).not.toContain("Danke, hab ich so");
    expect(zweite[0]!.knoepfe?.map((k) => k.id)).toContain("passt");
  });

  it("A12 Meldung vor der Zustimmung wird quittiert", async () => {
    const { agent } = neu(stub(() => v("zuruf", [])), false);
    await agent.verarbeite(msg("Mödling Zirkulationspumpe getauscht"));
    const antwort = await agent.verarbeite(msg("und im Zimmer 105 an Spülkasten eingstellt"));
    expect(antwort[0]!.text).toContain("Deine Meldung hab ich");
  });
});
