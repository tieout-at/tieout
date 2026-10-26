import { describe, expect, it } from "vitest";

import { ENTSCHEIDUNG_TEXT } from "@tieout/kern";

import { appendDecision, currentState, decide, DECISION_TEXT, gapBeforeRelease, localTime, moves, nextStep, readDecisions, refusal, takeIntoInvoice, type Decision } from "./decisions";

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

  it("moves a card on the board only as the decision bar would, one step at a time", () => {
    expect(moves("gefunden").map((m) => m.stand)).toEqual(["geprueft", "nicht_verrechnen"]);
    expect(moves("geprueft").map((m) => m.stand)).toEqual(["freigegeben", "nicht_verrechnen"]);
    expect(moves("freigegeben").map((m) => m.stand)).toEqual(["nicht_verrechnen"]);
    expect(moves("nicht_verrechnen").map((m) => m.stand)).toEqual(["geprueft"]);
    expect(moves("in_schlussrechnung")).toEqual([]);
    expect(refusal("gefunden", "geprueft")).toBeNull();
    expect(refusal("gefunden", "gefunden")).toBeNull();
    expect(refusal("gefunden", "freigegeben")).toMatch(/Erst prüfen/);
    expect(refusal("geprueft", "gefunden")).toMatch(/nicht zurückgenommen/);
    expect(refusal("freigegeben", "in_schlussrechnung")).toMatch(/Schlussrechnung/);
    expect(refusal("nicht_verrechnen", "gefunden")).toMatch(/wieder aufgenommen/);
  });

  it("refuses a decision the find can no longer take, so an old page cannot set it back", () => {
    const entry = (stand: Decision["stand"]): Decision => ({ fundSchluessel: "p1/plan:H-201:D", zeit: "2026-10-25T10:00", wer: "Abrechnung", stand });
    expect(decide(["p1/plan:H-201:D"], "freigegeben", entry("geprueft")).refused).toMatch(/nicht zurückgenommen/);
    expect(decide(["p1/plan:H-201:D"], "geprueft", entry("geprueft")).refused).toBe("Der Fund steht schon auf Geprüft.");
    expect(decide(["p1/plan:H-201:D"], "gefunden", entry("geprueft")).refused).toBeNull();
  });

  it("uses the words of the core", () => {
    expect(DECISION_TEXT).toEqual(ENTSCHEIDUNG_TEXT);
  });

  it("writes local time to the minute", () => {
    expect(localTime(new Date(2026, 9, 24, 9, 5))).toBe("2026-10-24T09:05");
  });

  it("takes only a released find into the Schlussrechnung, once", () => {
    const keys = ["p9/regie:1"];
    expect(takeIntoInvoice(keys, "gefunden", "2026-10-25T12:00").refused).toMatch(/Nur freigegebene/);
    appendDecision(d("2026-10-25T12:01", "geprueft", keys[0]));
    appendDecision(d("2026-10-25T12:02", "freigegeben", keys[0]));
    expect(takeIntoInvoice(keys, "gefunden", "2026-10-25T12:03").refused).toBeNull();
    expect(currentState(readDecisions(), keys)).toBe("in_schlussrechnung");
    expect(takeIntoInvoice(keys, "gefunden", "2026-10-25T12:04").refused).toMatch(/schon in der Schlussrechnung/);
  });
});

describe("gapBeforeRelease (step 8a)", () => {
  it("says that a find in Klärung reaches the Änderungsliste only once its gap is closed", () => {
    expect(gapBeforeRelease("beleg_fehlt")).toMatch(/erst mit dem Beleg in die Änderungsliste$/);
    expect(gapBeforeRelease("nachtrag_nicht_gelegt")).toMatch(/erst mit dem gelegten Nachtrag/);
    expect(gapBeforeRelease("belegt")).toBeNull();
  });
});
