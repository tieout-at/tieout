import { describe, expect, it } from "vitest";
import { bestaetige, entscheidungsstand, gelesenerWert, korrigiere } from "../src/modell";
import { ordnerLesen } from "../src/ordner";
import { f, kleinerDatensatz } from "./hilfen";

describe("field with source, review state and Verlauf", () => {
  it("a correction keeps the old value and never overwrites", () => {
    const gelesen = f(9_800);
    const neu = korrigiere(gelesen, 10_000, "Abrechnung", "2026-10-20T09:15");
    expect(neu.wert).toBe(10_000);
    expect(neu.pruefstand).toBe("korrigiert");
    expect(neu.verlauf).toEqual([{ zeit: "2026-10-20T09:15", wer: "Abrechnung", art: "korrigiert", vorher: 9_800, wert: 10_000 }]);
    expect(gelesenerWert(neu)).toBe(9_800);
    expect(gelesen.wert).toBe(9_800); // the original object is untouched
    expect(gelesen.verlauf).toEqual([]);
  });

  it("a confirmation is an entry of its own, the value stays", () => {
    const b = bestaetige(korrigiere(f("2026-04-07"), "2026-04-08", "Abrechnung", "2026-10-20T09:00"), "Geschäftsführung", "2026-10-21T08:00");
    expect(b.pruefstand).toBe("bestaetigt");
    expect(b.verlauf.map((v) => v.art)).toEqual(["korrigiert", "bestaetigt"]);
    expect(gelesenerWert(b)).toBe("2026-04-07");
  });

  it("the latest decision per find counts, without one it is 'Gefunden'", () => {
    const e = [
      { fundSchluessel: "F1", zeit: "2026-10-22T08:00", wer: "Abrechnung", stand: "geprueft" as const },
      { fundSchluessel: "F1", zeit: "2026-10-22T09:00", wer: "Geschäftsführung", stand: "freigegeben" as const },
      { fundSchluessel: "F4", zeit: "2026-10-22T08:30", wer: "Abrechnung", stand: "nicht_verrechnen" as const, grund: "doppelt" },
    ];
    expect(entscheidungsstand(e, "F1")).toBe("freigegeben");
    expect(entscheidungsstand(e, "F4")).toBe("nicht_verrechnen");
    expect(entscheidungsstand(e, "F2")).toBe("gefunden");
  });
});

describe("Ordner lesen", () => {
  it("counts files, duplicates by checksum, corrected fields and plan index chains", () => {
    const d = kleinerDatensatz();
    d.belege.push({ id: "ab-1-kopie", art: "aufmassblatt", dateiname: "ab1 (1).pdf", datum: "2026-03-05", seiten: 1, inhaltHash: "b" });
    d.aufmass[0].zeilen[0].menge = korrigiere(f(9_800), 10_000, "Abrechnung", "2026-10-20T09:15");
    d.plaene.push(
      { belegId: "p-d", planNr: f("H-201"), index: f("D"), datum: f("2026-04-03"), titel: f("Heizung"), aenderung: f("1 Heizkörper mehr"), vermerke: [] },
      { belegId: "p-c", planNr: f("H-201"), index: f("C"), datum: f("2026-02-12"), titel: f("Heizung"), aenderung: null, vermerke: [] },
    );
    const s = ordnerLesen(d);
    expect([s.belege, s.duplikate, s.eindeutig, s.korrigierteFelder]).toEqual([3, 1, 2, 1]);
    expect(s.duplikatIds).toEqual(["ab-1-kopie"]);
    expect(s.nachArt).toEqual({ leistungsverzeichnis: 1, aufmassblatt: 2 });
    expect(s.planketten.map((k) => [k.planNr, k.indizes.map((i) => i.index)])).toEqual([["H-201", ["C", "D"]]]);
  });
});
