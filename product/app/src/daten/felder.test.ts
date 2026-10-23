import { describe, expect, it } from "vitest";
import { erzeugeW21 } from "@/demo/w21/erzeuge";
import { geleseneFelder } from "./felder";

describe("Gelesene Felder je Beleg (a6)", () => {
  const d = erzeugeW21();

  it("über alle Belege genau die 25 Korrekturen des Einlesens", () => {
    const ids = [...d.dokumente.map((x) => x.id), ...d.zurufe.map((z) => z.id)];
    expect(ids.reduce((s, id) => s + geleseneFelder(d, id).korrekturen.length, 0)).toBe(25);
  });

  it("AB-05: fünf korrigierte Mengen mit altem Wert, Regiebericht RB-07: Stunden 18 statt 13", () => {
    expect(geleseneFelder(d, "ab-05").korrekturen.map((k) => k.feld)).toEqual(["menge", "menge", "menge", "menge", "menge"]);
    expect(geleseneFelder(d, "rb-07").korrekturen).toEqual([{ feld: "stundenMonteur", stelle: "Stunden Monteur", seite: 1, wert: 1_800, vorher: 1_300 }]);
  });

  it("Beleg ohne Korrektur: Felder gezählt, keine Korrektur", () => {
    const ab12 = geleseneFelder(d, "ab-12");
    expect(ab12.gelesen).toBeGreaterThan(0);
    expect(ab12.korrekturen).toEqual([]);
  });
});
