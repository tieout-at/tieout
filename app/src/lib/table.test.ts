import { describe, expect, it } from "vitest";
import { applyFilters, applySort, countText, filterOptions, footerSum, matchingSum, readState, type Access, type Calculation, type ViewState } from "./table";

type R = { id: string; groups: string[]; project: string; stand: string | null; cent: number | null };

const rows: R[] = [
  { id: "p1/a", groups: ["zusaetzlich"], project: "Wohnpark", stand: "belegt", cent: 300 },
  { id: "p1/b", groups: ["klaerung"], project: "Wohnpark", stand: "Beleg fehlt", cent: 100 },
  { id: "p2/a", groups: ["zusaetzlich"], project: "Bürohaus", stand: "belegt", cent: null },
  { id: "p2/b", groups: ["zusaetzlich"], project: "Bürohaus", stand: "belegt", cent: 200 },
];

const access: Record<string, Access<R>> = {
  project: { sortValue: (r) => r.project, filterValue: (r) => r.project },
  stand: { filterValue: (r) => r.stand },
  amount: { sortValue: (r) => r.cent },
};

const extra: Calculation = {
  id: "zusaetzlich",
  title: "zusätzlich verrechenbar",
  sums: [
    { group: "zusaetzlich", ids: ["p1/a", "p2/a", "p2/b"], text: "alle" },
    { group: "zusaetzlich", ids: ["p1/a"], text: "Wohnpark" },
    { group: "zusaetzlich", ids: ["p2/a", "p2/b"], text: "Bürohaus" },
  ],
};

describe("table", () => {
  it("filters by every active filter at once", () => {
    expect(applyFilters(rows, [{ column: "project", values: ["Wohnpark"] }], access).map((r) => r.id)).toEqual(["p1/a", "p1/b"]);
    expect(
      applyFilters(rows, [{ column: "project", values: ["Wohnpark"] }, { column: "stand", values: ["belegt"] }], access).map((r) => r.id),
    ).toEqual(["p1/a"]);
    expect(applyFilters(rows, [{ column: "stand", values: [] }], access)).toHaveLength(4);
  });

  it("sorts stably and puts rows without a value last in both directions", () => {
    expect(applySort(rows, { column: "amount", direction: "desc" }, access).map((r) => r.id)).toEqual(["p1/a", "p2/b", "p1/b", "p2/a"]);
    expect(applySort(rows, { column: "amount", direction: "asc" }, access).map((r) => r.id)).toEqual(["p1/b", "p2/b", "p1/a", "p2/a"]);
    expect(applySort(rows, { column: "project", direction: "asc" }, access).map((r) => r.id)).toEqual(["p2/a", "p2/b", "p1/a", "p1/b"]);
  });

  it("offers each filter value once with its count", () => {
    expect(filterOptions(rows, (r) => r.stand)).toEqual([
      { value: "belegt", count: 3 },
      { value: "Beleg fehlt", count: 1 },
    ]);
  });

  it("shows a fixed sum only when the visible rows of its group are exactly the rows it covers", () => {
    expect(matchingSum(extra, rows)?.text).toBe("alle");
    expect(matchingSum(extra, rows.filter((r) => r.project === "Bürohaus"))?.text).toBe("Bürohaus");
    // other groups do not matter: hiding the open find keeps the sum
    expect(matchingSum(extra, rows.filter((r) => r.stand === "belegt"))?.text).toBe("alle");
    // one row of a project cut away: no amount instead of a new one
    expect(matchingSum(extra, rows.filter((r) => r.id !== "p2/b"))).toBeNull();
  });

  it("falls back to another fixed sum of the column when the chosen one has no visible rows", () => {
    const open: Calculation = { id: "klaerung", title: "in Klärung", sums: [{ group: "klaerung", ids: ["p1/b"], text: "offen" }] };
    const calcs = [extra, open];
    expect(footerSum(calcs, "zusaetzlich", rows)).toEqual({ calculation: extra, sum: extra.sums[0] });
    expect(footerSum(calcs, "zusaetzlich", rows.filter((r) => r.stand === "Beleg fehlt"))).toEqual({ calculation: open, sum: open.sums[0] });
    expect(footerSum(calcs, "zusaetzlich", rows.filter((r) => r.id !== "p2/b"))).toEqual({ cut: true });
    expect(footerSum(calcs, null, rows)).toBeNull();
    expect(footerSum([extra], "zusaetzlich", rows.filter((r) => r.stand === "Beleg fehlt"))).toBeNull();
  });

  it("counts in full words", () => {
    const noun = { one: "Fund", many: "Funde", dative: "Funden" };
    expect(countText(14, 14, noun)).toBe("14 Funde");
    expect(countText(1, 1, noun)).toBe("1 Fund");
    expect(countText(3, 14, noun)).toBe("3 von 14 Funden");
  });

  it("reads a saved state and drops what it does not know", () => {
    const view: ViewState = { sort: { column: "amount", direction: "desc" }, filters: [], hidden: ["stand"], calculations: { amount: "zusaetzlich" } };
    const columns = ["project", "stand", "amount"];
    expect(readState(null, view, columns)).toBe(view);
    expect(readState("{kaputt", view, columns)).toBe(view);
    const saved = readState(
      JSON.stringify({ sort: { column: "weg", direction: "asc" }, filters: [{ column: "project", values: ["Wohnpark"] }, { column: "weg", values: [] }], hidden: ["weg"], calculations: { amount: null } }),
      view,
      columns,
    );
    expect(saved).toEqual({ sort: view.sort, filters: [{ column: "project", values: ["Wohnpark"] }], hidden: [], calculations: { amount: null } });
    expect(readState(JSON.stringify({ sort: null }), view, columns).sort).toBeNull();
  });
});
