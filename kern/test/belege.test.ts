// The Belege list of "Ihre Daten" against the folder of solution list v3 (SPEZIFIKATION.md 1.5): 77 Belege with 4
// duplicates, 18 corrected fields, the website's groups, and every find traced back to at least one Beleg.

import { describe, expect, it } from "vitest";
import { belegListe, BELEG_GRUPPE, korrekturen } from "../src/belege";
import { beispielFirma } from "../src/beispiel";
import { pruefeFirma } from "../src/firma";
import type { BelegArt } from "../src/modell";

const firma = beispielFirma();
const f = pruefeFirma(firma);
const p1 = firma.projekte[0];
const liste = belegListe(p1, f.ergebnisse.p1);

describe("Belege of Wohnpark Mooshaim", () => {
  it("77 Belege in date order, 4 of them duplicates pointing to their original", () => {
    expect(liste).toHaveLength(77);
    expect(liste.map((b) => b.datum)).toEqual([...liste.map((b) => b.datum)].sort());
    const kopien = liste.filter((b) => b.duplikatVon);
    expect(kopien.map((b) => b.id).sort()).toEqual(["foto-0515-kopie", "foto-0714-kopie", "mail-0407-kopie", "mail-0702-kopie"]);
    for (const k of kopien) {
      const original = liste.find((b) => b.id === k.duplikatVon)!;
      expect(original.duplikatVon).toBeNull();
      expect(original.art).toBe(k.art);
      expect(k.titel).toBe(original.titel);
    }
  });

  it("18 corrected fields, the same number 'Ordner lesen' counts, each with the value before and after", () => {
    expect(liste.reduce((s, b) => s + b.felder.korrigiert, 0)).toBe(18);
    expect(f.ergebnisse.p1.ordner.korrigierteFelder).toBe(18);
    const k = korrekturen(p1);
    expect(k).toHaveLength(18);
    expect(k.every((x) => x.vorher !== x.wert && x.wer === "Abrechnung")).toBe(true);
    expect(k.map((x) => x.zeit)).toEqual([...k.map((x) => x.zeit)].sort());
    expect(liste.filter((b) => b.felder.korrigiert > 0).every((b) => b.pruefstand === "korrigiert")).toBe(true);
  });

  it("the website's groups: systems are the ERP and AVA exports in the folder", () => {
    const je = (g: string) => liste.filter((b) => b.gruppe === g).length;
    expect([je("systeme"), je("dokumente"), je("kommunikation")]).toEqual([7, 44, 26]);
    const systeme = (Object.keys(BELEG_GRUPPE) as BelegArt[]).filter((a) => BELEG_GRUPPE[a].gruppe === "systeme").sort();
    expect(systeme).toEqual(["abschlagsrechnung", "preisbasis", "schlussrechnung", "zahlungsavis"]);
  });

  it("readable titles instead of file names", () => {
    const titel = (id: string) => liste.find((b) => b.id === id)?.titel;
    expect(titel("vertrag")).toBe("Bauvertrag");
    expect(titel("rb-9")).toBe("Regiebericht 9");
    expect(liste.some((b) => b.titel === "Plan H-201 Index D")).toBe(true);
    expect(liste.some((b) => b.titel === "Zahlungsavis zu Abschlagsrechnung 3")).toBe(true);
  });

  it("every find of the project is proved by at least one Beleg of the folder or a WhatsApp-Meldung", () => {
    const belegt = new Set(liste.flatMap((b) => b.funde));
    const ausMeldung = new Set(
      f.ergebnisse.p1.abgleich.funde.filter((x) => x.nachweise.some((n) => p1.meldungen.some((m) => m.id === n.quelle.belegId))).map((x) => x.nr),
    );
    expect(f.ergebnisse.p1.abgleich.funde.every((x) => belegt.has(x.nr) || ausMeldung.has(x.nr))).toBe(true);
    expect(liste.find((b) => b.id === "rb-9")?.funde).toContain("F2");
  });
});
