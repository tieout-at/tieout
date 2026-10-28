import { describe, expect, it } from "vitest";

import { actorOf, checkedBy, moves, notYours, settingsRefused, yourMoves, type Actor } from "./decision-rules";
import type { Decision } from "./decisions";
import { refusalReason } from "./server-store";

const abrechnung: Actor = { kind: "person", id: "u-a", rollen: ["abrechnung"] };
const gf: Actor = { kind: "person", id: "u-g", rollen: ["geschaeftsfuehrung"] };
const both: Actor = { kind: "person", id: "u-b", rollen: ["abrechnung", "geschaeftsfuehrung"] };
const bau: Actor = { kind: "person", id: "u-x", rollen: ["bauleitung"] };
const demo: Actor = { kind: "beispiel" };

const labels = (a: Actor, state: Parameters<typeof moves>[0], checker: string | null = null) => yourMoves(moves(state), a, checker).allowed.map((m) => m.label);

describe("roles in the interface (step 10, part D)", () => {
  it("the demo offers every step, as before", () => {
    expect(labels(demo, "gefunden")).toEqual(["Prüfen", "Nicht verrechnen"]);
    expect(labels(demo, "geprueft")).toEqual(["Freigeben", "Nicht verrechnen"]);
    expect(yourMoves(moves("geprueft"), demo, null).why).toBeNull();
  });

  it("the Abrechnung checks, takes up again and sets Nicht verrechnen; the release is not theirs", () => {
    expect(labels(abrechnung, "gefunden")).toEqual(["Prüfen", "Nicht verrechnen"]);
    expect(labels(abrechnung, "nicht_verrechnen")).toEqual(["Wieder aufnehmen"]);
    expect(yourMoves(moves("geprueft"), abrechnung, null)).toMatchObject({ allowed: [{ label: "Nicht verrechnen" }], why: "Freigeben ist ein Schritt der Geschäftsführung." });
  });

  it("the Geschäftsführung releases, and is told whose the other steps are in one sentence", () => {
    expect(yourMoves(moves("gefunden"), gf, null)).toEqual({ allowed: [], why: "Prüfen und Nicht verrechnen sind Schritte der Abrechnung." });
    expect(labels(gf, "geprueft", "u-a")).toEqual(["Freigeben"]);
  });

  it("four eyes: nobody releases what they checked, even with both roles", () => {
    expect(yourMoves(moves("geprueft"), both, "u-b")).toMatchObject({ allowed: [{ label: "Nicht verrechnen" }], why: "Vier Augen: Sie haben geprüft, freigeben muss eine andere Person." });
    expect(labels(both, "geprueft", "u-a")).toEqual(["Freigeben", "Nicht verrechnen"]);
  });

  it("the Bauleitung decides nothing and sets nothing; without a company nobody does", () => {
    expect(labels(bau, "gefunden")).toEqual([]);
    expect(settingsRefused(bau)).toMatch(/Abrechnung oder der Geschäftsführung/);
    expect(settingsRefused(abrechnung)).toBeNull();
    const none = actorOf({ stand: "ohne_firma", email: "x@example.org" });
    expect(notYours(moves("gefunden")[0], none, null)).toMatch(/keiner Firma/);
    expect(settingsRefused(none)).toMatch(/keiner Firma/);
  });

  it("while the account is read the page looks like the demo (no jump on first paint); the database still decides", () => {
    expect(actorOf({ stand: "laden" })).toEqual({ kind: "beispiel" });
    expect(actorOf({ stand: "konto", id: "u-a", email: "", person: "A", firma: "Testfirma A", rollen: ["abrechnung"] })).toEqual(abrechnung);
  });

  it("checkedBy: the person of the latest check of the work, under any of its keys", () => {
    const d = (fundSchluessel: string, zeit: string, stand: Decision["stand"], von?: string): Decision => ({ fundSchluessel, zeit, stand, wer: "x", ...(von ? { von } : {}) });
    const list = [d("p2/meldung:P2-W1", "2026-10-28T10:00", "geprueft", "u-a"), d("p2/regie:6", "2026-10-28T10:05", "nicht_verrechnen", "u-a"), d("p2/regie:6", "2026-10-28T10:07", "geprueft", "u-b")];
    expect(checkedBy(list, ["p2/regie:6", "p2/meldung:P2-W1"])).toBe("u-b");
    expect(checkedBy(list.slice(0, 1), ["p2/regie:6", "p2/meldung:P2-W1"])).toBe("u-a");
    expect(checkedBy([d("p1/x", "2026-10-28T10:00", "geprueft")], ["p1/x"])).toBeNull();
  });
});

describe("refusalReason: the database's refusal in the app's words", () => {
  it("names the states with the words of the decision bar, never the raw state words", () => {
    expect(refusalReason("Von geprueft geht es nicht zu geprueft.")).toBe("Der Fund steht schon auf Geprüft.");
    expect(refusalReason("Von freigegeben geht es nicht zu geprueft.")).toBe(
      "Der Fund steht inzwischen auf Freigegeben. Eine Entscheidung wird nicht zurückgenommen. Der Fund kann auf Nicht verrechnen gesetzt werden, mit Grund.",
    );
    expect(refusalReason("Von gefunden geht es nicht zu freigegeben.")).toBe("Der Fund steht inzwischen auf Gefunden. Erst prüfen, dann freigeben: ein Fund geht einen Schritt nach dem anderen.");
    expect(refusalReason("Von gefunden geht es nicht zu in_schlussrechnung.")).toMatch(/^Der Fund steht inzwischen auf Gefunden\. Freigegebene Funde/);
  });

  it("keeps the database's own German sentences and says anything technical in one line", () => {
    expect(refusalReason("Diesen Schritt macht die Geschäftsführung.")).toBe("Diesen Schritt macht die Geschäftsführung.");
    expect(refusalReason("Vier Augen: wer geprüft hat, gibt nicht frei.")).toBe("Vier Augen: wer geprüft hat, gibt nicht frei.");
    expect(refusalReason("Von xyz geht es nicht zu geprueft.")).toBe("Der Server hat den Eintrag nicht gespeichert. Bitte die Seite neu laden.");
    expect(refusalReason('new row violates check constraint "entscheidung_check"')).toMatch(/Regeln der Datenbank/);
  });
});
