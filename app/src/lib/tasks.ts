/**
 * Tasks on finds (SPEZIFIKATION.md 4.2, Attio's Tasks): what is open and what is done, grouped by when it is due. A task
 * and its ticks are appended in this browser (`decisions.ts`); nothing here changes an entry, it only reads the latest.
 */

import type { Task, TaskCheck } from "./decisions";
import type { FindRow } from "./kern-data";

/** A task with its latest tick (null while it is open) and every tick in the order they were made, for the Verlauf. */
export type TaskItem = Task & { done: TaskCheck | null; checks: TaskCheck[] };

/** The find a task is made on, as the modal names it and fills it in. */
export type TaskTarget = {
  key: string;
  /** "F1 Wohnpark Mooshaim" */
  label: string;
  name: string;
  href: string;
  project: string;
  taskText: string;
  deadline: string | null;
};

export const ROLES = ["Abrechnung", "Bauleitung", "Geschäftsführung"] as const;

export const targetOf = (r: FindRow): TaskTarget => ({
  key: r.id,
  label: `${r.number} ${r.project.name}`,
  name: r.name,
  href: r.href,
  project: r.project.name,
  taskText: r.taskText,
  deadline: r.deadline,
});

/** Each task with its latest tick; a task opened again counts as open. */
export function withChecks(tasks: readonly Task[], checks: readonly TaskCheck[]): TaskItem[] {
  return tasks.map((t) => {
    // the list is in the order of appending; the same minute keeps that order
    const mine = checks.filter((c) => c.aufgabeId === t.id).toSorted((a, b) => a.zeit.localeCompare(b.zeit));
    const latest = mine.at(-1);
    return { ...t, done: latest?.erledigt ? latest : null, checks: mine };
  });
}

export type DueGroup = "ueberfaellig" | "heute" | "woche" | "spaeter" | "ohne";

export const DUE_GROUPS: { id: DueGroup; title: string }[] = [
  { id: "ueberfaellig", title: "Überfällig" },
  { id: "heute", title: "Heute" },
  { id: "woche", title: "Nächste 7 Tage" },
  { id: "spaeter", title: "Später" },
  { id: "ohne", title: "Ohne Frist" },
];

/** Days from one calendar day to another ("2026-10-25" to "2026-10-28" is 3), free of time zones. */
function days(from: string, to: string): number {
  const at = (iso: string) => Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return Math.round((at(to) - at(from)) / 86_400_000);
}

export function dueGroup(bis: string | null, today: string): DueGroup {
  if (!bis) return "ohne";
  const d = days(today, bis);
  return d < 0 ? "ueberfaellig" : d === 0 ? "heute" : d <= 7 ? "woche" : "spaeter";
}

const datum = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

/** The due date as the list says it: "Heute" and "Morgen" in words, else the plain date; overdue and today carry a tone. */
export function dueText(bis: string | null, today: string): { text: string; tone: "red" | "orange" | null } | null {
  if (!bis) return null;
  const d = days(today, bis);
  if (d < 0) return { text: datum(bis), tone: "red" };
  if (d === 0) return { text: "Heute", tone: "orange" };
  if (d === 1) return { text: "Morgen", tone: null };
  return { text: datum(bis), tone: null };
}

/** By due date, tasks without one last; the same day by the time they were made. */
export function byDue(a: TaskItem, b: TaskItem): number {
  if (a.bis !== b.bis) return a.bis === null ? 1 : b.bis === null ? -1 : a.bis.localeCompare(b.bis);
  return a.zeit.localeCompare(b.zeit);
}

/** Newest first. */
export const byMade = (a: TaskItem, b: TaskItem) => b.zeit.localeCompare(a.zeit) || b.id.localeCompare(a.id);

/** Open tasks in the groups of their due date, in the order of `DUE_GROUPS`; empty groups are left out. */
export function groupOpen(items: readonly TaskItem[], today: string): { id: DueGroup; title: string; items: TaskItem[] }[] {
  const open = items.filter((t) => !t.done).toSorted(byDue);
  return DUE_GROUPS.map((g) => ({ ...g, items: open.filter((t) => dueGroup(t.bis, today) === g.id) })).filter((g) => g.items.length);
}

/** Done tasks, the latest tick first. */
export const doneTasks = (items: readonly TaskItem[]) => items.filter((t) => t.done).toSorted((a, b) => b.done!.zeit.localeCompare(a.done!.zeit));

/** The words of a task in the Verlauf of its find. */
export function taskWords(t: Pick<Task, "text" | "zustaendig" | "bis">): string {
  return `${t.text.replace(/\.$/, "")}${t.bis ? `, bis ${datum(t.bis)}` : ""}`;
}
