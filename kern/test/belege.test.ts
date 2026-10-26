// The Belege list of "Ihre Daten" against the folder of solution list v3 (SPEZIFIKATION.md 1.5): 77 Belege with 4
// duplicates, 18 corrected fields, the website's groups, and every find traced back to at least one Beleg.

import { describe, expect, it } from "vitest";
import { belegListe, BELEG_GRUPPE, gelesen, korrekturen } from "../src/belege";
import { zeitstrahl as zeitstrahlVon } from "../src/zeitstrahl";
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

  it("one date per Beleg: the date written on it, as Zeitstrahl and Belegabdeckung show it; the file date apart", () => {
    const ab13 = liste.find((b) => b.titel === "Aufmaßblatt 13")!;
    expect(ab13.datum).toBe("2026-09-24");
    expect(ab13.dateidatum).toBe("2026-10-20");
    const zeitstrahl = new Map(zeitstrahlVon(p1, f.ergebnisse.p1).ereignisse.map((x) => [x.id, x.datum]));
    for (const b of liste) if (zeitstrahl.has(b.id)) expect(b.datum).toBe(zeitstrahl.get(b.id));
    for (const k of liste.filter((b) => b.duplikatVon)) expect(k.datum).toBe(liste.find((b) => b.id === k.duplikatVon)!.datum);
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

describe("values read from one Beleg (the original viewer)", () => {
  it("Aufmaßblatt 12: the four rows of F1 on page 1, the missing countersignature on page 2", () => {
    const werte = gelesen(p1, "ab-12");
    expect(werte.find((w) => w.stelle === "Zeile 22.04.12B" && w.schluessel === "menge")?.text).toBe("14 Stk");
    expect(werte.find((w) => w.stelle === "Zeile 22.03.02A" && w.schluessel === "menge")?.text).toBe("126 m");
    expect(werte.find((w) => w.stelle === "Unterschrift Auftraggeber")).toMatchObject({ seite: 2, text: "nein" });
    expect(werte.map((w) => w.seite)).toEqual([...werte.map((w) => w.seite)].sort());
  });

  it("a corrected field keeps the value read before", () => {
    expect(gelesen(p1, "mail-0407").find((w) => w.stelle === "Kopf, Datum")).toMatchObject({ text: "07.04.2026", vorher: "01.04.2026", pruefstand: "korrigiert" });
  });

  it("the Leistungsverzeichnis names the Einheitspreis of 22.04.12B on page 9, a WhatsApp-Meldung its transcript", () => {
    expect(gelesen(p1, "lv").find((w) => w.stelle === "Pos. 22.04.12B, Einheitspreis")).toMatchObject({ seite: 9, text: "286,40 €" });
    expect(gelesen(p1, "w1").find((w) => w.stelle === "Transkript")?.text).toContain("Plan D sind montiert");
  });
});

describe("rates read from the Bauvertrag", () => {
  it("shows basis points as a percentage, as the Vertrag writes it", () => {
    const werte = gelesen(p1, "vertrag");
    expect(werte.find((w) => w.schluessel === "regiematerialZuschlag")?.text).toBe("15 %");
    expect(werte.find((w) => w.schluessel === "regiesatzMonteur")?.text).toBe("64,80 €");
  });
});
