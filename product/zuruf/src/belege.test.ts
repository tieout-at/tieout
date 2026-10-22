import { describe, expect, it } from "vitest";
import { normalisiere, pruefeBelege } from "./belege.ts";
import type { Nachricht } from "./typen.ts";

const n = (id: string, inhalt: string): Nachricht => ({ id, absenderId: "a", zeit: "2026-10-22T10:00:00+02:00", art: "sprache", inhalt });

describe("normalisiere", () => {
  it("entfernt Satzzeichen und Großschreibung", () => {
    expect(normalisiere("Servus, Wien 21!  Top 5.")).toBe("servus wien 21 top 5");
  });
});

describe("pruefeBelege", () => {
  const nachrichten = [n("m1", "Servus, Wien 21, Top 5, Heizkörper versetzt, waren zu zweit, sechs Stunden.")];

  it("behält belegte Angaben", () => {
    const { eintrag, verworfen } = pruefeBelege(
      {
        projektId: { wert: "w21", zitat: "Wien 21", nachrichtId: "m1" },
        personen: { wert: 2, zitat: "zu zweit", nachrichtId: "m1" },
      },
      nachrichten,
    );
    expect(eintrag.projektId?.wert).toBe("w21");
    expect(eintrag.personen?.wert).toBe(2);
    expect(verworfen).toEqual([]);
  });

  it("verwirft erfundene Angaben (Gegenprobe)", () => {
    const { eintrag, verworfen } = pruefeBelege(
      { angewiesenVon: { wert: "Bauleiter", zitat: "der Bauleiter", nachrichtId: "m1" } },
      nachrichten,
    );
    expect(eintrag.angewiesenVon).toBeUndefined();
    expect(verworfen[0]?.feld).toBe("angewiesenVon");
  });

  it("berichtigt eine falsche Nachrichten-ID", () => {
    const { eintrag } = pruefeBelege(
      { leistung: { wert: "Heizkörper versetzt", zitat: "Heizkörper versetzt", nachrichtId: "m9" } },
      nachrichten,
    );
    expect(eintrag.leistung?.nachrichtId).toBe("m1");
  });
});

describe("Lernpunkte aus Lauf 1", () => {
  it("Foto: keine Menge oder Leistung aus der Bildbeschreibung (L1)", () => {
    const foto = { ...n("f1", "Foto: Lüftungskanal mit zwei neuen Bögen um Unterzug, Zettel 'Top 9'"), art: "foto" as const };
    const { eintrag, verworfen } = pruefeBelege(
      {
        ort: { wert: "Top 9", zitat: "Top 9", nachrichtId: "f1" },
        menge: { wert: { wert: 2, einheit: "Stk" }, zitat: "zwei neuen Bögen", nachrichtId: "f1" },
        leistung: { wert: "Lüftungskanal montiert", zitat: "Lüftungskanal", nachrichtId: "f1" },
      },
      [foto],
    );
    expect(eintrag.ort?.wert).toBe("Top 9");
    expect(eintrag.menge).toBeUndefined();
    expect(eintrag.leistung).toBeUndefined();
    expect(verworfen.map((v) => v.grund)).toContain("nur aus dem Foto geschlossen");
  });

  it("Worttreue: „der vom GU“ wird nicht zum „Bauleiter vom GU“ (L10)", () => {
    const { eintrag, angepasst } = pruefeBelege(
      { angewiesenVon: { wert: "Bauleiter vom GU", zitat: "der vom GU", nachrichtId: "m1" } },
      [n("m1", "Hat der vom GU angschafft.")],
    );
    expect(eintrag.angewiesenVon?.wert).toBe("der vom GU");
    expect(angepasst).toHaveLength(1);
  });
});
