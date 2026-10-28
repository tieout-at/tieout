import { beforeEach, describe, expect, it, vi } from "vitest";

// A browser with a stored session whose account is still being read (review finding, 28.10.2026).
const account = vi.hoisted(() => ({ stand: "laden" as string }));
vi.mock("./account", () => ({
  currentAccount: () => account,
  onAccountChange: () => () => {},
  supabase: () => new Promise(() => {}),
  ROLE_TEXT: { abrechnung: "Abrechnung", geschaeftsfuehrung: "Geschäftsführung", bauleitung: "Bauleitung" },
}));

const { appendTask, decide, readDecisions } = await import("./decisions");
const { REFUSED } = await import("./server-store");

const store = new Map<string, string>();
const refused: string[] = [];
beforeEach(() => {
  store.clear();
  refused.length = 0;
  vi.stubGlobal("window", {
    localStorage: { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string, v: string) => void store.set(k, v) },
    dispatchEvent: (e: Event & { detail?: string }) => (e.type === REFUSED && refused.push(e.detail ?? ""), true),
    addEventListener: () => {},
    removeEventListener: () => {},
  });
  vi.stubGlobal("CustomEvent", class extends Event { detail: unknown; constructor(t: string, i?: { detail?: unknown }) { super(t); this.detail = i?.detail; } });
});

describe("while the account is read", () => {
  it("records nothing, keeps the demo entries of this browser and says why", () => {
    const demo = [{ fundSchluessel: "p1/x", zeit: "2026-10-27T10:00", wer: "Abrechnung", stand: "geprueft" }];
    store.set("tieout.entscheidungen.v1", JSON.stringify(demo));
    store.set("tieout.aufgaben.v1", "[]");
    const r = decide(["p1/y"], "gefunden", { fundSchluessel: "p1/y", zeit: "2026-10-28T10:00", wer: "Abrechnung", stand: "geprueft" });
    appendTask({ id: "a1", fundSchluessel: "p1/y", fund: "F1", href: "/funde/", zeit: "2026-10-28T10:00", wer: "Abrechnung", text: "x", zustaendig: "Bauleitung", bis: null });
    expect(JSON.parse(store.get("tieout.entscheidungen.v1")!)).toEqual(demo);
    expect(store.get("tieout.aufgaben.v1")).toBe("[]");
    expect(r.refused).toMatch(/Konto wird noch geladen/);
    expect(refused).toEqual(["Das Konto wird noch geladen. Bitte gleich noch einmal.", "Das Konto wird noch geladen. Bitte gleich noch einmal."]);
    expect(readDecisions()).toEqual([]);
  });
});
