/**
 * Decisions and tasks on finds: append only. Without an account they are kept in this browser (the demo); with one
 * they live in the company's database (server-store.ts, step 10), which also decides who may take which step. The
 * shape is the core's `Entscheidung` (kern/src/modell.ts) with the business key ("p1/plan:H-201:D"). Nothing here is
 * ever edited or removed; a later entry counts.
 */

import { currentState, DECISION_TEXT, refusal, type DecisionState } from "./decision-rules";
import { CHANGED, refuse, serverAppend, serverRead, serverWaiting, WAITING, type ListKey } from "./server-store";

export { currentState, DECISION_TEXT, gapBeforeRelease, moves, nextStep, refusal, type DecisionState, type Move } from "./decision-rules";

export type Decision = {
  fundSchluessel: string;
  /** Local time, "2026-10-24T21:40". */
  zeit: string;
  /**
   * Who took the step. In the demo the role it needs ("Abrechnung" checks, "Geschäftsführung" releases); with an
   * account the person and that role, as the database stamped them ("Maximilian Seipl (Abrechnung)").
   */
  wer: string;
  /** With an account: the id of that person, so the page knows who checked before a release (four eyes). */
  von?: string;
  stand: Exclude<DecisionState, "gefunden">;
  grund?: string;
};

export type Task = {
  id: string;
  fundSchluessel: string;
  /** "F1 Wohnpark Mooshaim" and the find page, so the list of tasks can name and open the find. */
  fund: string;
  href: string;
  zeit: string;
  wer: string;
  text: string;
  zustaendig: string;
  bis: string | null;
};

/**
 * A setting of an Abläufe block (step 9): who gets its tasks and by when, or the threshold of a check. Appended, never
 * changed; the latest entry of a block and field counts. Stage 0: this browser only, per company from step 10.
 */
export type Setting = {
  /** "aufgabe-bauleitung", "aufgabe-abrechnung" of an Ablauf, or the id of a check. */
  block: string;
  feld: "zustaendig" | "frist" | "schwelle";
  wert: string;
  zeit: string;
};

/**
 * Ticking a task off, or opening it again: appended, never changed; the latest entry of a task counts. Noted as the
 * role in charge of the task (no persons before sign-in, step 10).
 */
export type TaskCheck = {
  aufgabeId: string;
  zeit: string;
  wer: string;
  erledigt: boolean;
};

const KEYS = { decisions: "tieout.entscheidungen.v1", tasks: "tieout.aufgaben.v1", checks: "tieout.aufgaben-erledigt.v1", settings: "tieout.ablauf-einstellungen.v1" } as const;

export function localTime(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Lists this browser could not keep (private window): they live for this visit, and every page of the visit reads them. */
const memory = new Map<string, unknown[]>();

/** The list of each key in the database once signed in (server-store.ts); without an account the browser keeps it. */
const SERVER_LIST: Record<string, ListKey> = {
  [KEYS.decisions]: "entscheidungen",
  [KEYS.tasks]: "aufgaben",
  [KEYS.checks]: "erledigt",
  [KEYS.settings]: "einstellungen",
};

function read<T>(key: string): T[] {
  const server = typeof window === "undefined" ? null : serverRead(SERVER_LIST[key]);
  if (server) return server as T[];
  if (memory.has(key)) return memory.get(key) as T[];
  try {
    const raw = window.localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(list) ? (list as T[]) : [];
  } catch {
    return [];
  }
}

/** Appends one entry; returns the whole list. If the browser keeps nothing (private window), the entry lives for this visit. */
function append<T>(key: string, entry: T): T[] {
  if (typeof window !== "undefined" && serverWaiting()) {
    refuse(WAITING);
    return read<T>(key);
  }
  if (typeof window !== "undefined" && serverAppend(SERVER_LIST[key], entry)) return read<T>(key);
  const list = [...read<T>(key), entry];
  try {
    window.localStorage.setItem(key, JSON.stringify(list));
  } catch {
    memory.set(key, list);
  }
  if (typeof window !== "undefined") window.dispatchEvent(new Event(CHANGED));
  return list;
}

export const readDecisions = () => read<Decision>(KEYS.decisions);
export const appendDecision = (d: Decision) => append(KEYS.decisions, d);

/**
 * Records a decision only if the find can still take it in the latest list of this browser: another tab may have
 * decided in the meantime, and an older page must not set a released find back. Returns the list and, if refused, why.
 */
export function decide(keys: readonly string[], fallback: DecisionState, entry: Decision): { list: Decision[]; refused: string | null } {
  const fresh = readDecisions();
  if (typeof window !== "undefined" && serverWaiting()) {
    refuse(WAITING);
    return { list: fresh, refused: WAITING };
  }
  const from = currentState(fresh, keys, fallback);
  const why = from === entry.stand ? `Der Fund steht schon auf ${DECISION_TEXT[from]}.` : refusal(from, entry.stand);
  return why ? { list: fresh, refused: why } : { list: appendDecision(entry), refused: null };
}

/**
 * "In der Schlussrechnung" is never a move of the board or the find page: it is noted on the tab "Schlussrechnung" when
 * the business takes the Änderungsliste over into its own invoice, and only for a find that is released in the latest
 * list of this browser. Noted as the Abrechnung, which writes the invoice.
 */
export function takeIntoInvoice(keys: readonly string[], fallback: DecisionState, zeit: string): { list: Decision[]; refused: string | null } {
  const fresh = readDecisions();
  const from = currentState(fresh, keys, fallback);
  if (from === "in_schlussrechnung") return { list: fresh, refused: "Der Fund steht schon in der Schlussrechnung." };
  if (from !== "freigegeben") return { list: fresh, refused: "Nur freigegebene Funde kommen in die Schlussrechnung." };
  return { list: appendDecision({ fundSchluessel: keys[0], zeit, wer: "Abrechnung", stand: "in_schlussrechnung" }), refused: null };
}

/**
 * Calls back when this page or another tab of this browser records a decision or a task, so a page never decides on an
 * old state and every sum on it follows at once.
 */
export function onStorageChange(callback: () => void): () => void {
  const listener = (e: StorageEvent) => {
    if (e.key === null || Object.values(KEYS).includes(e.key as (typeof KEYS)[keyof typeof KEYS])) callback();
  };
  window.addEventListener("storage", listener);
  window.addEventListener(CHANGED, callback);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(CHANGED, callback);
  };
}
export const readTasks = () => read<Task>(KEYS.tasks);
export const appendTask = (t: Task) => append(KEYS.tasks, t);
export const readTaskChecks = () => read<TaskCheck>(KEYS.checks);
const FELDER: readonly Setting["feld"][] = ["zustaendig", "frist", "schwelle"];
/** Only well-formed entries: a foreign or broken value in the browser's storage never breaks the page. */
export const readSettings = () =>
  read<unknown>(KEYS.settings).filter(
    (x): x is Setting => !!x && typeof x === "object" && typeof (x as Setting).block === "string" && typeof (x as Setting).wert === "string" && typeof (x as Setting).zeit === "string" && FELDER.includes((x as Setting).feld),
  );
export const appendSetting = (x: Setting) => append(KEYS.settings, x);
export const appendTaskCheck = (c: TaskCheck) => append(KEYS.checks, c);
