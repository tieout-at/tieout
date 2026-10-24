// Ported from v1 (geld.test.ts) with the example values switched to solution list v3.

import { describe, expect, it } from "vitest";
import { betragAusMenge, centAus, euro, menge, prozent, prozentText, rundeHalbAuf, stundenBetrag } from "../src/geld";

describe("rounding and cent arithmetic", () => {
  it("rounds commercially, from ,5 away from zero", () => {
    expect(rundeHalbAuf(5, 10)).toBe(1);
    expect(rundeHalbAuf(4, 10)).toBe(0);
    expect(rundeHalbAuf(15, 10)).toBe(2);
    expect(rundeHalbAuf(-15, 10)).toBe(-2);
    expect(rundeHalbAuf(-14, 10)).toBe(-1);
  });

  it("rejects fractions instead of rounding them silently", () => {
    /* eslint-disable no-restricted-syntax -- fractions on purpose */
    expect(() => rundeHalbAuf(1.5, 10)).toThrow();
    expect(() => euro(0.1)).toThrow();
    /* eslint-enable no-restricted-syntax */
  });

  it("quantity × Einheitspreis and percentages per line", () => {
    expect(betragAusMenge(1_400, 28_640)).toBe(400_960); // 14 × 286,40 €
    expect(betragAusMenge(12_600, 1_390)).toBe(175_140); // 126 m × 13,90 €
    expect(prozent(31_260, 1_500)).toBe(4_689); // 15 % of 312,60 € = 46,89 €
    expect(prozent(9_640, 1_500)).toBe(1_446); // 15 % of 96,40 € = 14,46 €
    expect(prozent(4_260, 1_500)).toBe(639); // 6,39 €: 638,99 rounded up
    expect(prozent(23_262_928, 60)).toBe(139_578); // 0,6 % of 232.629,28 € = 1.395,78 € (1.395,7757 rounded up)
    expect(prozent(23_262_928, 50)).toBe(116_315); // 0,5 % = 1.163,15 € (1.163,1464 rounded down)
    expect(stundenBetrag(110, 5_860)).toBe(6_446); // 1,10 h × 58,60 € = 64,46 €
    expect(stundenBetrag(1_200, 6_480)).toBe(77_760);
  });

  it("German (Austrian) formatting and its reverse", () => {
    expect(euro(1_462_015)).toBe("14.620,15 €");
    expect(euro(-2_300_805)).toBe("−23.008,05 €");
    expect(menge(8_600, "Stk")).toBe("86 Stk");
    expect(menge(163_800, "m")).toBe("1.638 m");
    expect(menge(3_746, "m")).toBe("37,46 m");
    expect(prozentText(380)).toBe("3,8 %");
    expect(prozentText(300, 2)).toBe("3,00 %");
    expect(centAus("14.620,15 €")).toBe(1_462_015);
    expect(centAus("−23.008,05 €")).toBe(-2_300_805);
    expect(centAus("0,00 €")).toBe(0);
    expect(() => centAus("14.620 €")).toThrow();
  });
});
