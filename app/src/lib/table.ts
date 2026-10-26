/**
 * Logic of the tables (Attio's view bar, sort, filter, columns, footer), free of React so it can be tested. Rows come
 * from `kern/` at build time and the app never adds amounts up: a footer sum is one of the fixed sums `kern/`
 * delivers, shown only while the visible rows are exactly the rows that sum covers (SPEZIFIKATION.md 4.2: "Add
 * calculation" only as fixed sums from `kern/`, never "zusätzlich verrechenbar" plus "in Klärung").
 */

import type { LucideIcon } from "lucide-react";

export type Row = {
  id: string;
  /** Groups a fixed sum can cover ("zusaetzlich", "klaerung", "offen", …). */
  groups: string[];
};

/** A fixed sum from `kern/`, valid for exactly these rows of one group. */
export type Sum = { group: string; ids: string[]; text: string };

/** One choice of footer sum in a column, for example "zusätzlich verrechenbar", with its sums per scope. */
export type Calculation = { id: string; title: string; sums: Sum[] };

export type Sort = { column: string; direction: "asc" | "desc" };
export type Filter = { column: string; values: string[] };

export type ViewState = {
  sort: Sort | null;
  filters: Filter[];
  hidden: string[];
  /** Chosen footer sum per column; null switches it off. */
  calculations: Record<string, string | null>;
};

/** A saved view (Attio's view switcher): its name, the state it starts with, and whether it is a table or a board; `icon` marks a board view that is no kanban (the matrix of the Belegabdeckung). */
export type View = { id: string; title: string; state: ViewState; kind?: "table" | "board"; icon?: LucideIcon };

export type SortValue = string | number | null;

export type Access<R> = {
  sortValue?: (r: R) => SortValue;
  /** Label the filter offers for a row; null when the row has no value. */
  filterValue?: (r: R) => string | null;
};

/**
 * Columns whose value is the same in every row (step 8a: a column that says the same 124 times says nothing). Compared
 * by the label the filter offers, else by the sort value; a column with neither, or a table of one row, keeps them all.
 */
export function uniformColumns<R>(rows: R[], columns: ({ id: string } & Access<R>)[]): string[] {
  if (rows.length < 2) return [];
  return columns
    .filter((c) => {
      const value = c.filterValue ?? c.sortValue;
      if (!value) return false;
      const first = value(rows[0]);
      return rows.every((r) => value(r) === first);
    })
    .map((c) => c.id);
}

export function applyFilters<R>(rows: R[], filters: Filter[], access: Record<string, Access<R>>): R[] {
  const active = filters.filter((f) => f.values.length && access[f.column]?.filterValue);
  if (!active.length) return rows;
  return rows.filter((r) =>
    active.every((f) => {
      const value = access[f.column].filterValue!(r);
      return value !== null && f.values.includes(value);
    }),
  );
}

const collator = new Intl.Collator("de", { numeric: true });

/** Stable sort; rows without a value go last in both directions, as in Attio. */
export function applySort<R>(rows: R[], sort: Sort | null, access: Record<string, Access<R>>): R[] {
  const value = sort && access[sort.column]?.sortValue;
  if (!sort || !value) return rows;
  const factor = sort.direction === "asc" ? 1 : -1;
  return rows
    .map((r, i) => ({ r, i, v: value(r) }))
    .sort((a, b) => {
      if (a.v === null || b.v === null) return a.v === b.v ? a.i - b.i : a.v === null ? 1 : -1;
      const d = typeof a.v === "number" && typeof b.v === "number" ? a.v - b.v : collator.compare(String(a.v), String(b.v));
      return d === 0 ? a.i - b.i : d * factor;
    })
    .map((x) => x.r);
}

/** Every label the filter of a column offers, in the order of the rows, with how many rows carry it. */
export function filterOptions<R>(rows: R[], filterValue: (r: R) => string | null): { value: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const v = filterValue(r);
    if (v !== null) counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts].map(([value, count]) => ({ value, count }));
}

/**
 * The fixed sum that fits the visible rows: the visible rows of its group must be exactly the rows the sum covers.
 * Returns null when a filter cuts a group apart; the footer then shows no amount rather than a new one.
 */
export function matchingSum(calculation: Calculation, visible: Row[]): Sum | null {
  for (const s of calculation.sums) {
    const ids = new Set(visible.filter((r) => r.groups.includes(s.group)).map((r) => r.id));
    if (ids.size === s.ids.length && s.ids.every((id) => ids.has(id))) return s;
  }
  return null;
}

/**
 * The fixed sums of one column of a board: for each calculation whose group has cards in the column, its sum when the
 * column holds exactly the rows that sum covers, otherwise "cut" (the board says "nicht gerechnet"). Never a new sum.
 */
export function columnSums(calculations: Calculation[], cards: Row[]): ({ title: string; text: string } | { title: string; cut: true })[] {
  return calculations
    .filter((c) => c.sums.some((s) => cards.some((r) => r.groups.includes(s.group))))
    .map((c) => {
      const sum = matchingSum(c, cards);
      return sum ? { title: c.title, text: sum.text } : { title: c.title, cut: true as const };
    });
}

export type FooterResult = { calculation: Calculation; sum: Sum } | { cut: true } | null;

/**
 * What a column footer shows: the chosen sum if it fits; if the filter leaves none of its rows, another fixed sum of
 * the column that fits the visible rows ("Beleg fehlt" when only those finds are shown); "cut" when a filter splits
 * a group, so the footer can say there is no fixed sum; null when nothing applies.
 */
export function footerSum(calculations: Calculation[], chosen: string | null, visible: Row[]): FooterResult {
  const own = calculations.find((c) => c.id === chosen);
  if (!own) return null;
  const has = (c: Calculation) => c.sums.some((s) => visible.some((r) => r.groups.includes(s.group)));
  if (has(own)) {
    const sum = matchingSum(own, visible);
    return sum ? { calculation: own, sum } : { cut: true };
  }
  for (const c of calculations) {
    if (c === own || !has(c)) continue;
    const sum = matchingSum(c, visible);
    if (sum) return { calculation: c, sum };
  }
  return null;
}

export type Noun = { one: string; many: string; dative: string };

/** "1 Fund", "14 Funde", "3 von 14 Funden". */
export function countText(visible: number, total: number, noun: Noun): string {
  if (visible === total) return `${total} ${total === 1 ? noun.one : noun.many}`;
  return `${visible} von ${total} ${total === 1 ? noun.one : noun.dative}`;
}

/** Reads a saved state; whatever is unreadable or names an unknown column falls back to the view's own state. */
export function readState(text: string | null, view: ViewState, columns: string[]): ViewState {
  if (!text) return view;
  try {
    const s = JSON.parse(text) as Partial<ViewState>;
    const known = (id: unknown) => typeof id === "string" && columns.includes(id);
    const sort =
      s.sort === null
        ? null
        : s.sort && known(s.sort.column) && (s.sort.direction === "asc" || s.sort.direction === "desc")
          ? s.sort
          : view.sort;
    return {
      sort,
      filters: Array.isArray(s.filters) ? s.filters.filter((f) => known(f?.column) && Array.isArray(f.values)) : view.filters,
      hidden: Array.isArray(s.hidden) ? s.hidden.filter(known) : view.hidden,
      calculations: s.calculations && typeof s.calculations === "object" ? { ...view.calculations, ...s.calculations } : view.calculations,
    };
  } catch {
    return view;
  }
}
