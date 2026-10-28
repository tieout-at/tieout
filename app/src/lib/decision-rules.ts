/**
 * The rules of the decision bar without any storage: the states, their words, which step a find can take next and
 * who takes it, and why a move is refused. `decisions.ts` keeps the entries; the database holds the same rules
 * (`backend/migrations/001_basis.sql`, `entscheidung_pruefen`).
 */

import type { Account, Role } from "./account";
import type { Decision } from "./decisions";

export type DecisionState = "gefunden" | "geprueft" | "freigegeben" | "in_schlussrechnung" | "nicht_verrechnen";

/** The words of the core for each state (`ENTSCHEIDUNG_TEXT` in kern/; a test keeps both equal). */
export const DECISION_TEXT: Record<DecisionState, string> = {
  gefunden: "Gefunden",
  geprueft: "Geprüft",
  freigegeben: "Freigegeben",
  in_schlussrechnung: "In der Schlussrechnung",
  nicht_verrechnen: "Nicht verrechnen",
};

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
 * Said before a release when the find has a gap (step 8a, SPEZIFIKATION.md 3.2): a find in Klärung may be released,
 * but it reaches the Änderungsliste only once the gap is closed. Null for a find that is "belegt".
 */
export function gapBeforeRelease(belegstand: "belegt" | "beleg_fehlt" | "nachtrag_nicht_gelegt" | null | undefined): string | null {
  if (belegstand === "beleg_fehlt") return "Beleg fehlt: der Fund kommt erst mit dem Beleg in die Änderungsliste";
  if (belegstand === "nachtrag_nicht_gelegt") return "Nachtrag nicht gelegt: der Fund kommt erst mit dem gelegten Nachtrag in die Änderungsliste";
  return null;
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

/** Who acts in this browser, as far as the decision bar is concerned. */
export type Actor =
  /** The demo without an account: every step is offered, noted as the role it needs. */
  | { kind: "beispiel" }
  /** A member of a company: only the steps of their roles, never the release of what they checked themselves. */
  | { kind: "person"; id: string; rollen: readonly Role[] }
  /** Signed in, but nothing can be decided (yet): why. */
  | { kind: "none"; why: string };

export function actorOf(account: Account): Actor {
  switch (account.stand) {
    // while the account is read, and in the built page: as the demo, so the page does not jump on first paint; a
    // signed-in person sees their own steps a moment later, and the database refuses a step that is not theirs
    case "beispiel":
    case "laden":
      return { kind: "beispiel" };
    case "konto":
      return { kind: "person", id: account.id, rollen: account.rollen };
    case "ohne_firma":
      return { kind: "none", why: "Ihr Konto gehört noch zu keiner Firma. Entscheiden geht erst danach." };
  }
}

const ROLE_OF_STEP: Record<string, Role> = { Abrechnung: "abrechnung", Geschäftsführung: "geschaeftsfuehrung" };

/** The person who checked a find last (the id the database stamped), or null in the demo and before a check. */
export function checkedBy(list: readonly Decision[], keys: readonly string[]): string | null {
  let who: string | null = null;
  let time = "";
  for (const d of list) if (keys.includes(d.fundSchluessel) && d.stand === "geprueft" && d.zeit >= time) [who, time] = [d.von ?? null, d.zeit];
  return who;
}

/**
 * Why a step is not this person's, in the words the page shows instead of the step; null when they may take it. The
 * same rules as the database (`entscheidung_pruefen`): the Abrechnung checks, takes up again and sets "Nicht
 * verrechnen", the Geschäftsführung releases, and nobody releases what they checked.
 */
export function notYours(move: Move, actor: Actor, checker: string | null): string | null {
  if (actor.kind === "beispiel") return null;
  if (actor.kind === "none") return actor.why;
  const role = ROLE_OF_STEP[move.wer];
  if (!role || !actor.rollen.includes(role)) return `${move.label} ist ein Schritt der ${move.wer}.`;
  if (move.stand === "freigegeben" && checker === actor.id) return "Vier Augen: Sie haben geprüft, freigeben muss eine andere Person.";
  return null;
}

/**
 * The moves this person may take, and one sentence for the others ("Prüfen und Nicht verrechnen sind Schritte der
 * Abrechnung."), so a page offers only their steps and says why the rest is not theirs.
 */
export function yourMoves(list: readonly Move[], actor: Actor, checker: string | null): { allowed: Move[]; why: string | null } {
  const allowed: Move[] = [];
  const byRole = new Map<string, string[]>();
  const other = new Set<string>();
  for (const m of list) {
    const why = notYours(m, actor, checker);
    if (!why) allowed.push(m);
    else if (why.endsWith(` ist ein Schritt der ${m.wer}.`)) byRole.set(m.wer, [...(byRole.get(m.wer) ?? []), m.label]);
    else other.add(why);
  }
  const roleText = [...byRole].map(([wer, labels]) => (labels.length > 1 ? `${labels.join(" und ")} sind Schritte der ${wer}.` : `${labels[0]} ist ein Schritt der ${wer}.`));
  const why = [...new Set([...other, ...roleText])].join(" ");
  return { allowed, why: why || null };
}

/**
 * How a company checks its invoices (who gets the tasks of an Ablauf, by when, the threshold of a check) is set by the
 * Abrechnung or the Geschäftsführung, as the database's policy says; null when this person may set it.
 */
export function settingsRefused(actor: Actor): string | null {
  if (actor.kind === "beispiel") return null;
  if (actor.kind === "none") return actor.why;
  return actor.rollen.includes("abrechnung") || actor.rollen.includes("geschaeftsfuehrung") ? null : "Einstellen ist ein Schritt der Abrechnung oder der Geschäftsführung.";
}
