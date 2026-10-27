/**
 * What this browser adds to the runs of "Abläufe" (step 9): the tasks already created from a task block and the
 * settings of the blocks (who gets the tasks and by when, the threshold of a check). Pure functions over the built
 * view, without the core, so the canvas stays light; `use-flow-settings.ts` reads the settings.
 */

import type { Setting, Task } from "./decisions";
import type { CheckItem, FlowRun, FlowTask, NodeResult } from "./flows";
import { ROLES } from "./tasks";

/** The days a task block gives its tasks, and the thresholds of "Mengenänderung über 20 %" (percent). */
export const DEADLINE_DAYS = ["0", "1", "3", "7", "14"] as const;
export const DEADLINE_TEXT: Record<(typeof DEADLINE_DAYS)[number], string> = { "0": "Ohne Frist", "1": "Morgen", "3": "In drei Tagen", "7": "In einer Woche", "14": "In zwei Wochen" };
export const THRESHOLDS = ["20", "25", "30", "50"] as const;
export const THRESHOLD_CHECK = "mengenaenderung_ueber_20";

export type BlockSettings = { zustaendig: string; frist: (typeof DEADLINE_DAYS)[number] };

const DEFAULT_ROLE: Record<string, string> = { "aufgabe-bauleitung": "Bauleitung", "aufgabe-abrechnung": "Abrechnung" };

/** The latest value per block and field. */
function latest(list: readonly Setting[], block: string, feld: Setting["feld"]): string | null {
  let best: Setting | null = null;
  for (const x of list) if (x.block === block && x.feld === feld && (!best || x.zeit >= best.zeit)) best = x;
  return best?.wert ?? null;
}

/** The settings of a task block; `block` is "<Ablauf>/<block>", so each Ablauf keeps its own. */
export function blockSettings(list: readonly Setting[], block: string): BlockSettings {
  const frist = latest(list, block, "frist");
  const role = latest(list, block, "zustaendig");
  return {
    zustaendig: role && (ROLES as readonly string[]).includes(role) ? role : (DEFAULT_ROLE[block.split("/").pop() ?? ""] ?? "Bauleitung"),
    frist: (DEADLINE_DAYS as readonly string[]).includes(frist ?? "") ? (frist as BlockSettings["frist"]) : "3",
  };
}

export function threshold(list: readonly Setting[]): number {
  const v = latest(list, THRESHOLD_CHECK, "schwelle");
  return (THRESHOLDS as readonly string[]).includes(v ?? "") ? Number(v) : 20;
}

/** The pages a check's hits lead to, each once: the find of a hit, else the tab where its line is. */
export function checkLinks(items: readonly CheckItem[]): { href: string; label: string }[] {
  const seen = new Map<string, string>();
  for (const i of items) if (!seen.has(i.href)) seen.set(i.href, i.label);
  return [...seen].map(([href, label]) => ({ href, label }));
}

/** "In drei Tagen" from today as "2026-10-30"; null for "Ohne Frist". */
export function dueDate(frist: BlockSettings["frist"], today: Date = new Date()): string | null {
  if (frist === "0") return null;
  const d = new Date(today);
  d.setDate(d.getDate() + Number(frist));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** The newest task made on a find, under its key or an earlier key of the same work. */
export function taskOf(t: FlowTask, tasks: readonly Task[]): Task | null {
  let best: Task | null = null;
  for (const x of tasks) if (t.keys.includes(x.fundSchluessel) && (!best || x.zeit >= best.zeit)) best = x;
  return best;
}

function tasksDone(r: NodeResult, tasks: readonly Task[]): NodeResult {
  const open = (r.tasks ?? []).filter((t) => !t.excluded);
  const made = open.filter((t) => taskOf(t, tasks)).length;
  const n = open.length;
  if (!n || !made) return r;
  if (made === n) return { ...r, proposed: false, text: `${n} ${n === 1 ? "Aufgabe" : "Aufgaben"} angelegt`, link: { href: "/aufgaben/", label: "Aufgaben öffnen" } };
  return { ...r, text: `${made} von ${n} angelegt` };
}

/** The run as this browser sees it: tasks created from it marked, the threshold of the quantity check applied. */
export function localRun(run: FlowRun, tasks: readonly Task[] | null, settings: readonly Setting[]): FlowRun {
  const limit = threshold(settings) * 100;
  const results = Object.fromEntries(Object.entries(run.results).map(([id, r]) => [id, tasks ? tasksDone(r, tasks) : r]));
  // a find set to "Nicht verrechnen" needs no task; one made on it before is named in the panel, never counted
  const checks =
    run.checks?.map((c) => {
      if (c.id !== THRESHOLD_CHECK || limit === 2000) return c;
      const items = c.items.filter((i) => i.change === null || i.change > limit);
      const below = c.items.filter((i) => !items.includes(i));
      return { ...c, title: `Mengenänderung über ${limit / 100} %`, hits: items.length, items, links: checkLinks(items), below };
    }) ?? null;
  return { ...run, results, checks };
}
