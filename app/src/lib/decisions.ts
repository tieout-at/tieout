/**
 * Decisions and tasks on finds in stage 0: append only, kept in this browser until sign-in and the backend come
 * (step 10). The shape is the core's `Entscheidung` (kern/src/modell.ts) with the business key ("p1/plan:H-201:D"), so
 * the backend can take the list over unchanged. Nothing here is ever edited or removed; a later entry counts.
 */

export type DecisionState = "gefunden" | "geprueft" | "freigegeben" | "in_schlussrechnung" | "nicht_verrechnen";

export type Decision = {
  fundSchluessel: string;
  /** Local time, "2026-10-24T21:40". */
  zeit: string;
  /** Role, never a person's name: "Abrechnung" checks, "Geschäftsführung" releases. */
  wer: string;
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
 * Ticking a task off, or opening it again: appended, never changed; the latest entry of a task counts. Noted as the
 * role in charge of the task (no persons before sign-in, step 10).
 */
export type TaskCheck = {
  aufgabeId: string;
  zeit: string;
  wer: string;
  erledigt: boolean;
};

/** The words of the core for each state (`ENTSCHEIDUNG_TEXT` in kern/; a test keeps both equal). */
export const DECISION_TEXT: Record<DecisionState, string> = {
  gefunden: "Gefunden",
  geprueft: "Geprüft",
  freigegeben: "Freigegeben",
  in_schlussrechnung: "In der Schlussrechnung",
  nicht_verrechnen: "Nicht verrechnen",
};

const KEYS = { decisions: "tieout.entscheidungen.v1", tasks: "tieout.aufgaben.v1", checks: "tieout.aufgaben-erledigt.v1" } as const;

/** The current decision of a find: the latest entry for it or an earlier key of the same work, "gefunden" without any (as `entscheidungsstand` in kern/). */
export function currentState(list: readonly Decision[], keys: readonly string[], fallback: DecisionState = "gefunden"): DecisionState {
  let state = fallback;
  let time = "";
  for (const d of list) if (keys.includes(d.fundSchluessel) && d.zeit >= time) [state, time] = [d.stand, d.zeit];
  return state;
}

/** What the decision bar offers next: check, then release; a find set to "Nicht verrechnen" can be taken up again. */
export function nextStep(state: DecisionState): { stand: Decision["stand"]; label: string; wer: string } | null {
  switch (state) {
    case "gefunden":
      return { stand: "geprueft", label: "Prüfen", wer: "Abrechnung" };
    case "geprueft":
      return { stand: "freigegeben", label: "Freigeben", wer: "Geschäftsführung" };
    case "nicht_verrechnen":
      return { stand: "geprueft", label: "Wieder aufnehmen", wer: "Abrechnung" };
    default:
      return null;
  }
}

export type Move = { stand: Decision["stand"]; label: string; wer: string };

/** Every decision a find can take from its state, as the decision bar offers them: the next step and "Nicht verrechnen". */
export function moves(state: DecisionState): Move[] {
  const next = nextStep(state);
  const no: Move[] = state === "nicht_verrechnen" || state === "in_schlussrechnung" ? [] : [{ stand: "nicht_verrechnen", label: "Nicht verrechnen", wer: "Abrechnung" }];
  return [...(next ? [next] : []), ...no];
}

/**
 * Why a card cannot be moved to a column of the board, or null when the move is a decision the find can take. One step
 * at a time and never back: the Verlauf keeps what was decided, and "In der Schlussrechnung" is set by the invoice.
 */
export function refusal(from: DecisionState, to: DecisionState): string | null {
  if (from === to || moves(from).some((m) => m.stand === to)) return null;
  if (to === "in_schlussrechnung") return "Freigegebene Funde kommen in die Schlussrechnung, wenn sie erstellt wird. Von Hand geht das nicht.";
  if (from === "in_schlussrechnung") return "Der Fund steht schon in der Schlussrechnung.";
  if (to === "freigegeben") return "Erst prüfen, dann freigeben: ein Fund geht einen Schritt nach dem anderen.";
  if (from === "nicht_verrechnen") return "Ein ausgeschlossener Fund wird zuerst wieder aufgenommen und geht dann als geprüft zur Freigabe.";
  return "Eine Entscheidung wird nicht zurückgenommen. Der Fund kann auf Nicht verrechnen gesetzt werden, mit Grund.";
}

export function localTime(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Lists this browser could not keep (private window): they live for this visit, and every page of the visit reads them. */
const memory = new Map<string, unknown[]>();
/** Tells the other parts of this page that an entry was appended; the "storage" event reaches only other tabs. */
const CHANGED = "tieout:entries";

function read<T>(key: string): T[] {
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
  const from = currentState(fresh, keys, fallback);
  const why = from === entry.stand ? `Der Fund steht schon auf ${DECISION_TEXT[from]}.` : refusal(from, entry.stand);
  return why ? { list: fresh, refused: why } : { list: appendDecision(entry), refused: null };
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
export const appendTaskCheck = (c: TaskCheck) => append(KEYS.checks, c);
