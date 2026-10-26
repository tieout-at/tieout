// The day heads of the message lists (step 8d): weekday and date of the twin, read as a calendar day in any time zone.

import { describe, expect, it } from "vitest";

import { dayText } from "./inbox";

describe("dayText", () => {
  it("names the weekday and writes the date as the app does", () => {
    expect(dayText("2026-09-24")).toBe("Donnerstag, 24.09.2026");
    expect(dayText("2026-09-08")).toBe("Dienstag, 08.09.2026");
  });
});
