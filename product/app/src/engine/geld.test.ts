import { describe, expect, it } from "vitest";
import { betragAusMenge, euro, menge, prozent, prozentText, rundeHalbAuf, stundenBetrag } from "./geld";

describe("Rundung und Cent-Rechnung", () => {
  it("rundet kaufmännisch ab ,5 weg von null", () => {
    expect(rundeHalbAuf(5, 10)).toBe(1);
    expect(rundeHalbAuf(4, 10)).toBe(0);
    expect(rundeHalbAuf(15, 10)).toBe(2);
    expect(rundeHalbAuf(-15, 10)).toBe(-2);
    expect(rundeHalbAuf(-14, 10)).toBe(-1);
  });

  it("lehnt Kommazahlen ab, statt still zu runden", () => {
    expect(() => rundeHalbAuf(1.5, 10)).toThrow();
    expect(() => euro(0.1)).toThrow();
  });

  it("Menge × EP und Prozente pro Zeile", () => {
    expect(betragAusMenge(1_400, 45_600)).toBe(638_400);
    expect(betragAusMenge(4_800, 11_260)).toBe(540_480);
    expect(prozent(120_866_850, 80)).toBe(966_935); // 966.934,8 → aufgerundet
    expect(prozent(120_866_850, 50)).toBe(604_334); // 604.334,25 → abgerundet
    expect(prozent(19_073_684, 380)).toBe(724_800); // 724.799,99 → 7.248,00 €
    expect(stundenBetrag(130, 5_680)).toBe(7_384);
    expect(stundenBetrag(9_600, 5_680)).toBe(545_280);
  });

  it("Formatierung deutsch (Österreich)", () => {
    expect(euro(124_605_000)).toBe("1.246.050,00 €");
    expect(euro(-3_738_150)).toBe("−37.381,50 €");
    expect(menge(8_600, "Stk")).toBe("86 Stk");
    expect(menge(81_250, "m")).toBe("812,5 m");
    expect(menge(3_746, "m")).toBe("37,46 m");
    expect(prozentText(380)).toBe("3,8 %");
    expect(prozentText(300, 2)).toBe("3,00 %");
  });
});
