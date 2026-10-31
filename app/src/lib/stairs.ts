/**
 * The Rechnungsabschluss as a staircase (step 14): each line of the core one step, level after level, from the Entwurf
 * down to the Betrag der Schlussrechnung; what is paid and the Restforderung stand beside it as the sum. The scale starts
 * where the data start, so the steps can be seen, and says so. Every amount is the core's; the app only places them.
 */

import type { InvoiceFind, InvoiceView, SettlementLine } from "./invoice";

export type Mode = "announced" | "contract";

export type Step = {
  id: string;
  kind: "start" | "fund" | "more" | "abzug" | "pending";
  label: string;
  /** Level before and after the step, in cents; the start and the end stand on the axis. */
  from: number;
  to: number;
  /** The amount of the line as the core gives it. */
  text: string;
  find: InvoiceFind | null;
  /** A Kürzungsrisiko lies in this find. */
  risk: boolean;
  /** A deduction without contract item. */
  noClause: boolean;
  /** "Vertragspunkt 5.1", "Abzug ohne Vertragspunkt": what the check of the line says. */
  check: string | null;
  stand: string | null;
};

export type Stairs = {
  steps: Step[];
  /** The sums of the core between the steps, each after the step it closes; the list of every line shows them. */
  sums: { after: string; label: string; text: string }[];
  /** The other Restforderung, named under the one shown. */
  other: { label: string; text: string };
  /** Finds in Klärung, drawn beside the steps and added to nothing. */
  pending: Step[];
  end: { cent: number; text: string };
  paid: { cent: number; text: string };
  rest: { cent: number; text: string; label: string };
  /** The axis, in cents: where it starts (a round figure, it is written on the page) and where it ends. */
  base: number;
  top: number;
  /** The finds folded into one step, none while they fit. */
  folded: number;
};

/** More finds than this and the smallest ones become one step "weitere". */
export const MOST_FINDS = 10;

const round = (span: number) => {
  const pow = 10 ** Math.floor(Math.log10(Math.max(span, 1)));
  return [1, 2, 5, 10].map((m) => m * pow).find((x) => x >= span / 4) ?? pow;
};

export function stairs(v: InvoiceView, mode: Mode): Stairs {
  const s = v.settlement;
  const lines: SettlementLine[] = mode === "announced" ? s.lines : s.contract.lines;
  const of = (kind: SettlementLine["kind"]) => lines.filter((l) => l.kind === kind);
  const entwurf = of("summe")[0];
  const riskOf = new Set(v.changes.entries.filter((c) => c.risk).map((c) => c.find.key));

  const steps: Step[] = [{ id: "entwurf", kind: "start", label: "Ihr Entwurf", from: 0, to: entwurf.amount.cent, text: entwurf.amount.text, find: null, risk: false, noClause: false, check: null, stand: null }];
  let level = entwurf.amount.cent;

  const finds = of("fund").toSorted((a, b) => Number(a.find?.number.slice(1)) - Number(b.find?.number.slice(1)));
  const kept = finds.length > MOST_FINDS ? new Set(finds.toSorted((a, b) => b.amount.cent - a.amount.cent).slice(0, MOST_FINDS - 1)) : new Set(finds);
  const rest = finds.filter((l) => !kept.has(l));
  for (const l of finds.filter((x) => kept.has(x))) {
    steps.push({ id: l.find?.number ?? l.label, kind: "fund", label: l.find?.number ?? l.label, from: level, to: level + l.amount.cent, text: l.amount.text, find: l.find, risk: !!l.find && riskOf.has(l.find.key), noClause: false, check: null, stand: null });
    level += l.amount.cent;
  }
  if (rest.length) {
    const cent = rest.reduce((sum, l) => sum + l.amount.cent, 0);
    // the height of the step only; no amount is written for it, the Änderungsliste names each
    steps.push({ id: "weitere", kind: "more", label: `${rest.length} weitere`, from: level, to: level + cent, text: "", find: null, risk: false, noClause: false, check: null, stand: null });
    level += cent;
  }
  const total = level;
  for (const l of of("abzug")) {
    steps.push({ id: l.label.replace(" laut Vertrag", ""), kind: "abzug", label: l.label.split(" (")[0], from: level, to: level + l.amount.cent, text: l.amount.text, find: null, risk: false, noClause: l.check?.state === "abzug_ohne_vertragspunkt", check: l.check?.text ?? null, stand: null });
    level += l.amount.cent;
  }

  let waiting = total;
  const pending = v.pending.map((x): Step => {
    const step: Step = { id: x.find.number, kind: "pending", label: x.find.number, from: waiting, to: waiting + x.amount.cent, text: x.amount.text, find: x.find, risk: false, noClause: false, check: null, stand: x.stand };
    waiting += x.amount.cent;
    return step;
  });

  // a sum closes the step before it in the core's order
  const sums: Stairs["sums"] = [];
  let before = "";
  for (const l of lines) {
    if (l.kind === "fund") before = l.find?.number ?? before;
    if (l.kind === "abzug") before = l.label.replace(" laut Vertrag", "");
    if (l.kind === "summe" && l !== entwurf && l !== of("summe").at(-1)) sums.push({ after: steps.some((x) => x.id === before) ? before : steps.at(rest.length ? steps.findIndex((x) => x.kind === "more") : 0)!.id, label: l.label, text: l.amount.text });
  }

  const end = of("summe").at(-1)!.amount;
  const paid = of("zahlung")[0]?.amount ?? { cent: 0, text: "" };
  const result = of("ergebnis")[0].amount;

  const low = Math.min(level, end.cent);
  const high = Math.max(waiting, total, entwurf.amount.cent);
  const span = Math.max(high - low, Math.round(high * 0.01), 100);
  const unit = round(span);
  const base = Math.max(0, Math.floor((low - span * 0.22) / unit) * unit);
  const top = high + span * 0.1;

  return {
    steps,
    sums,
    other: mode === "announced" ? { label: "laut Vertrag", text: s.contract.restforderung.text } : { label: "wie angekündigt", text: s.restforderung.text },
    pending,
    end: { cent: end.cent, text: end.text },
    paid: { cent: Math.abs(paid.cent), text: paid.text.replace("−", "") },
    rest: { cent: result.cent, text: result.text, label: mode === "announced" ? "Restforderung" : "Restforderung laut Vertrag" },
    base,
    top,
    folded: rest.length,
  };
}
