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

/** The words of the core for each state (`ENTSCHEIDUNG_TEXT` in kern/; a test keeps both equal). */
export const DECISION_TEXT: Record<DecisionState, string> = {
  gefunden: "Gefunden",
  geprueft: "Geprüft",
  freigegeben: "Freigegeben",
  in_schlussrechnung: "In der Schlussrechnung",
  nicht_verrechnen: "Nicht verrechnen",
};

const KEYS = { decisions: "tieout.entscheidungen.v1", tasks: "tieout.aufgaben.v1" } as const;

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

export function localTime(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function read<T>(key: string): T[] {
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
    // stays in memory for this visit
  }
  return list;
}

export const readDecisions = () => read<Decision>(KEYS.decisions);
export const appendDecision = (d: Decision) => append(KEYS.decisions, d);
export const readTasks = () => read<Task>(KEYS.tasks);
export const appendTask = (t: Task) => append(KEYS.tasks, t);
