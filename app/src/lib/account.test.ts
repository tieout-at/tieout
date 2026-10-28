import { describe, expect, it } from "vitest";

import { mayHaveSession, rolesOf, rolesText } from "./account";

const store = (value: string | null) => ({ getItem: () => value });

describe("mayHaveSession: the client loads only where a session can be", () => {
  it("not in the demo: nothing stored, nothing in the address", () => {
    expect(mayHaveSession(store(null), "", "")).toBe(false);
    expect(mayHaveSession(store(null), "#abschnitt", "?ansicht=board")).toBe(false);
  });

  it("with a stored session, or coming back from a sign-in link", () => {
    expect(mayHaveSession(store("{}"), "", "")).toBe(true);
    expect(mayHaveSession(store(null), "#access_token=abc&type=magiclink", "")).toBe(true);
    expect(mayHaveSession(store(null), "#error_description=Email+link+is+invalid", "")).toBe(true);
    expect(mayHaveSession(store(null), "", "?code=xyz")).toBe(true);
  });

  it("a browser that keeps nothing (private window) is the demo", () => {
    const broken = { getItem: () => { throw new Error("blocked"); } };
    expect(mayHaveSession(broken, "", "")).toBe(false);
    expect(mayHaveSession(null, "", "")).toBe(false);
  });
});

describe("roles", () => {
  it("keeps the known roles in the app's order and drops the rest", () => {
    expect(rolesOf(["geschaeftsfuehrung", "abrechnung", "chef"])).toEqual(["abrechnung", "geschaeftsfuehrung"]);
    expect(rolesOf(null)).toEqual([]);
  });

  it("names them in full words", () => {
    expect(rolesText(["abrechnung"])).toBe("Abrechnung");
    expect(rolesText(["abrechnung", "geschaeftsfuehrung"])).toBe("Abrechnung und Geschäftsführung");
    expect(rolesText(["abrechnung", "geschaeftsfuehrung", "bauleitung"])).toBe("Abrechnung, Geschäftsführung und Bauleitung");
  });
});
