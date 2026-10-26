/**
 * Calendar arithmetic of the Zeitstrahl (step 8d): days as ISO dates ("2026-09-08"), weeks from Monday, month grids and
 * events grouped by day. Pure and in UTC, so the static page and the browser count the same days.
 */

export const DAY_MS = 86_400_000;
export const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
export const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const MONTHS = ["Jänner", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export const dayMs = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
export const isoOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (iso: string, n: number) => isoOf(dayMs(iso) + n * DAY_MS);

/** 0 for Monday up to 6 for Sunday. */
export const weekdayOf = (iso: string) => (new Date(dayMs(iso)).getUTCDay() + 6) % 7;
export const isWeekend = (iso: string) => weekdayOf(iso) >= 5;
export const mondayOf = (iso: string) => addDays(iso, -weekdayOf(iso));

/** ISO 8601 week number (the week with the year's first Thursday is week 1). */
export function weekNumber(iso: string): number {
  const thursday = addDays(iso, 3 - weekdayOf(iso));
  const jan1 = `${thursday.slice(0, 4)}-01-01`;
  return Math.floor((dayMs(thursday) - dayMs(jan1)) / DAY_MS / 7) + 1;
}

/** The Mondays of every week that touches [from, to). */
export function weeksBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = mondayOf(from); m < to; m = addDays(m, 7)) out.push(m);
  return out;
}

export const monthOf = (iso: string) => `${iso.slice(0, 7)}-01`;
export const nextMonthOf = (iso: string) => {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, "0")}-01`;
};

/** The first days of every month that touches [from, to). */
export function monthsBetween(from: string, to: string): string[] {
  const out: string[] = [];
  for (let m = monthOf(from); m < to; m = nextMonthOf(m)) out.push(m);
  return out;
}

/** A month as full weeks from Monday: each day with whether it belongs to the month. */
export function monthGrid(first: string): { iso: string; inMonth: boolean }[][] {
  const end = nextMonthOf(first);
  return weeksBetween(first, end).map((monday) => Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((iso) => ({ iso, inMonth: iso >= first && iso < end })));
}

export const monthTitle = (first: string) => `${MONTHS[Number(first.slice(5, 7)) - 1]} ${first.slice(0, 4)}`;
export const dayTitle = (iso: string) => `${WEEKDAYS[weekdayOf(iso)]}, ${Number(iso.slice(8, 10))}. ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;
export const dayShort = (iso: string) => `${WEEKDAYS_SHORT[weekdayOf(iso)]} ${Number(iso.slice(8, 10))}.`;

/** "7. bis 13. September 2026", or across months "28. September bis 4. Oktober 2026". */
export function weekTitle(monday: string): string {
  const sunday = addDays(monday, 6);
  const d = (iso: string) => Number(iso.slice(8, 10));
  const m = (iso: string) => MONTHS[Number(iso.slice(5, 7)) - 1];
  if (monday.slice(0, 7) === sunday.slice(0, 7)) return `${d(monday)}. bis ${d(sunday)}. ${m(sunday)} ${sunday.slice(0, 4)}`;
  if (monday.slice(0, 4) === sunday.slice(0, 4)) return `${d(monday)}. ${m(monday)} bis ${d(sunday)}. ${m(sunday)} ${sunday.slice(0, 4)}`;
  return `${d(monday)}. ${m(monday)} ${monday.slice(0, 4)} bis ${d(sunday)}. ${m(sunday)} ${sunday.slice(0, 4)}`;
}

type Dated = { date: { iso: string }; time: string | null; lane?: string };

/** Within one day: events without a time first (all day), then the timed ones by their time, the site before the invoices. */
export function byMoment<T extends Dated>(a: T, b: T): number {
  return a.date.iso.localeCompare(b.date.iso) || (a.time ?? "").localeCompare(b.time ?? "") || (a.lane === b.lane ? 0 : a.lane === "baustelle" ? -1 : 1);
}

/** Events grouped by their day, the days in the given order, each day's events by moment. */
export function groupByDay<T extends Dated>(events: T[], newestFirst = false): { iso: string; events: T[] }[] {
  const days = new Map<string, T[]>();
  for (const e of [...events].sort(byMoment)) {
    const list = days.get(e.date.iso) ?? [];
    list.push(e);
    days.set(e.date.iso, list);
  }
  const out = [...days.entries()].map(([iso, list]) => ({ iso, events: list }));
  return newestFirst ? out.reverse() : out;
}
