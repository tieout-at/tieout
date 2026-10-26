import { describe, expect, it } from "vitest";
import { ALL } from "./navigation";
import { expand, normalise, score } from "./search";

function best(query: string): string | undefined {
  return ALL.map((d) => ({ d, s: score(query, [d.title, ...(d.keywords ?? [])]) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)[0]?.d.title;
}

describe("expand", () => {
  it("writes out the abbreviations from SPEZIFIKATION.md 4.1", () => {
    expect(expand("LV").text).toBe("Leistungsverzeichnis");
    expect(expand("AR 3").text).toBe("Abschlagsrechnung 3");
    expect(expand("RB 11").text).toBe("Regiebericht 11");
    expect(expand("AB 12").text).toBe("Aufmaßblatt 12");
  });

  it("accepts lower case and no space", () => {
    expect(expand("rb11").text).toBe("Regiebericht 11");
    expect(expand("ar-3").expansions).toEqual([{ short: "ar-3", full: "Abschlagsrechnung 3" }]);
  });

  it("leaves words alone that only start like an abbreviation", () => {
    expect(expand("Abschlag").text).toBe("Abschlag");
    expect(expand("Arbeit").expansions).toEqual([]);
  });

  it("takes lower case for an abbreviation only with a number", () => {
    expect(expand("ab").expansions).toEqual([]);
    expect(expand("ag").text).toBe("ag");
    expect(expand("AB").text).toBe("Aufmaßblatt");
    expect(expand("ab 12").text).toBe("Aufmaßblatt 12");
  });
});

describe("normalise", () => {
  it("folds umlauts both ways", () => {
    expect(normalise("Abläufe")).toBe(normalise("Ablaeufe"));
    expect(normalise("Abläufe")).toBe("ablaufe");
    expect(normalise("Aufmaßblatt")).toBe("aufmassblatt");
  });
});

describe("score", () => {
  it("finds the pages by title, keyword and abbreviation", () => {
    expect(best("Belege")).toBe("Belege");
    expect(best("abla")).toBe("Abläufe");
    expect(best("ab")).toBe("Abläufe");
    expect(best("RB 11")).toBe("Belege");
    expect(best("Mooshaim")).toBe("Projekte");
    expect(best("Hornfeld")).toBe("Auftraggeber");
    expect(best("Restforderung")).toBe("Schlussrechnungen");
  });

  it("finds nothing for unknown words", () => {
    expect(best("Zahnarzt")).toBeUndefined();
  });

  it("ranks a title match above a keyword match", () => {
    const funde = score("Funde", ["Funde", "Vorprüfung"]);
    const other = score("Funde", ["Schlussrechnungen", "Funde der Vorprüfung"]);
    expect(funde).toBeGreaterThan(other);
  });

  it("finds a date typed as numbers only, as on the title of a find (customer test 3)", () => {
    expect(score("08.09", ["F7 WhatsApp-Meldung 08.09.2026, Heizkörper Top 9 versetzt"])).toBeGreaterThan(0);
    expect(score("08.09", ["Belege"])).toBe(0);
  });
});
