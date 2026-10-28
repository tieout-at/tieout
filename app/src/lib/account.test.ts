import { describe, expect, it } from "vitest";

import { mayHaveSession, refusalText, rolesOf, rolesText } from "./account";

describe("refusalText: why no link went out", () => {
  it("tells the hourly limit of the project from the minute between two links to one address", () => {
    // As Supabase answered on 28.10.2026 (auth log): the project's e-mails of the hour were sent.
    expect(refusalText({ status: 429, code: "over_email_send_rate_limit", message: "email rate limit exceeded" })).toMatch(/in einer Stunde/);
    expect(refusalText({ status: 429, code: "over_request_rate_limit", message: "For security purposes, you can only request this after 42 seconds." })).toMatch(/eine Minute/);
    expect(refusalText({ status: 500, message: "Error sending magic link email" })).toMatch(/später/);
  });
});

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
