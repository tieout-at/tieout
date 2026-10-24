import { describe, expect, it } from "vitest";

import { ENTSCHEIDUNG_TEXT } from "@tieout/kern";

import { currentState, DECISION_TEXT, localTime, nextStep, type Decision } from "./decisions";

const d = (zeit: string, stand: Decision["stand"], key = "p1/plan:H-201:D"): Decision => ({ fundSchluessel: key, zeit, wer: "Abrechnung", stand });

describe("decisions on a find (append only)", () => {
  it("is Gefunden without any entry, and the latest entry counts", () => {
    expect(currentState([], ["p1/plan:H-201:D"])).toBe("gefunden");
    const list = [d("2026-10-24T10:00", "geprueft"), d("2026-10-24T11:00", "nicht_verrechnen"), d("2026-10-24T09:00", "freigegeben")];
    expect(currentState(list, ["p1/plan:H-201:D"])).toBe("nicht_verrechnen");
  });

  it("ignores other finds and carries a decision over from an earlier key of the same work", () => {
    const list = [d("2026-10-24T10:00", "geprueft", "p2/meldung:W1"), d("2026-10-24T11:00", "freigegeben", "p1/regie:9")];
    expect(currentState(list, ["p2/regie:6", "p2/meldung:W1"])).toBe("geprueft");
  });

  it("offers check, then release, and a way back from Nicht verrechnen", () => {
    expect(nextStep("gefunden")).toMatchObject({ stand: "geprueft", label: "Prüfen", wer: "Abrechnung" });
    expect(nextStep("geprueft")).toMatchObject({ stand: "freigegeben", wer: "Geschäftsführung" });
    expect(nextStep("freigegeben")).toBeNull();
    expect(nextStep("nicht_verrechnen")?.stand).toBe("geprueft");
  });

  it("uses the words of the core", () => {
    expect(DECISION_TEXT).toEqual(ENTSCHEIDUNG_TEXT);
  });

  it("writes local time to the minute", () => {
    expect(localTime(new Date(2026, 9, 24, 9, 5))).toBe("2026-10-24T09:05");
  });
});
