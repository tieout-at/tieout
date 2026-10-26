/**
 * The Auftraggeber page of step 8d: the history of one Auftraggeber as marks per project and reason, the chains of
 * "Gleicher Grund", and the parts of its three figures. Every amount is the core's (`historie`, `vorpruefung`,
 * `rechnungsabschluss`, the Nachträge of the twin); the view only picks, dates and labels them.
 */

import { ABZUG_TEXT, datumText, euro, KUERZUNGSGRUND_TEXT, type FirmenErgebnis, type Kuerzungsgrund } from "@tieout/kern";

import { projectSlug } from "./example";
import { invoiceList } from "./invoice";
import { business, firm, type Amount } from "./kern-data";

type Named = { name: string; href: string };
const projectLink = (name: string): Named => ({ name, href: `/projekte/${projectSlug(name)}/` });
const amount = (cent: number): Amount => ({ cent, text: euro(cent) });

/** One mark of the matrix: cut or deducted by the Auftraggeber, announced by him, or threatening by our Vorprüfung. */
export type ReasonMark = {
  kind: "gekuerzt" | "abgezogen" | "angekuendigt" | "droht";
  amount: Amount;
  what: string;
  /** An announced deduction of which a part was already withheld on the Abschlagsrechnungen: that part, inside `amount`. */
  withheld?: { amount: Amount; what: string };
};

export type ClientView = {
  /** Reasons the Auftraggeber already cut or deducted for, then those only our Vorprüfung sees. */
  reasons: { key: string; label: string; own: boolean }[];
  projects: (Named & { id: string; closed: boolean; marks: Record<string, ReasonMark[]> })[];
  /** "Gleicher Grund": the earlier project where it happened, the running one where it stands again. */
  chains: { key: string; reason: string; before: Named & { kind: "gekuerzt" | "abgezogen"; amount: Amount }; now: Named & { kind: "droht" | "angekuendigt"; amount: Amount; withheld?: Amount } }[];
  /** Parts of the three figures: each cut, each deduction by project, each Nachtrag. */
  parts: {
    cuts: { key: string; label: string; project: string; amount: Amount }[];
    deductionsByProject: { project: string; amount: Amount }[];
    changeOrders: { id: string; label: string; project: string; accepted: boolean; amount: Amount }[];
  };
  /** Closed projects: the Schlusszahlung with its label, as on "Schlussrechnungen". */
  closing: Record<string, { label: string; amount: Amount }>;
};

export function clientView(auftraggeberId: string, b: FirmenErgebnis = business()): ClientView {
  const h = b.historie.find((x) => x.auftraggeber.id === auftraggeberId);
  if (!h) throw new Error(`Unknown Auftraggeber ${auftraggeberId}`);
  const own = b.projekte.filter((p) => p.auftraggeber.id === auftraggeberId);
  const reasons = new Map<string, { label: string; own: boolean }>();
  const marks = new Map<string, Record<string, ReasonMark[]>>(own.map((p) => [p.projektId, {}]));
  const add = (projektId: string, key: string, label: string, m: ReasonMark) => {
    const known = reasons.get(key);
    reasons.set(key, { label, own: (known?.own ?? false) || m.kind === "gekuerzt" || m.kind === "abgezogen" || m.kind === "angekuendigt" });
    const row = marks.get(projektId);
    if (row) (row[key] ??= []).push(m);
  };
  for (const k of h.kuerzungen)
    add(k.projektId, k.grund, KUERZUNGSGRUND_TEXT[k.grund], { kind: "gekuerzt", amount: amount(k.betrag), what: `${k.bezug}, ${k.rechnung.nr} vom ${datumText(k.rechnung.datum)}` });
  for (const a of h.abzuege) add(a.projektId, `abzug:${a.art}`, `${ABZUG_TEXT[a.art]}, Abzug ohne Vertragspunkt`, { kind: "abgezogen", amount: amount(a.betrag), what: a.rechnungen.join(", ") });
  for (const p of own) {
    const e = b.ergebnisse[p.projektId];
    for (const z of e.rechnungsabschluss?.zeilen.filter((x) => x.art === "abzug" && x.pruefung === "abzug_ohne_vertragspunkt") ?? [])
      add(p.projektId, `abzug:${z.abzugArt}`, `${ABZUG_TEXT[z.abzugArt!]}, Abzug ohne Vertragspunkt`, { kind: "angekuendigt", amount: amount(-z.betrag), what: "für die Schlussrechnung" });
    for (const r of e.vorpruefung?.risiken.filter((x) => x.zustand === "droht") ?? [])
      add(p.projektId, r.grund, KUERZUNGSGRUND_TEXT[r.grund as Kuerzungsgrund], { kind: "droht", amount: amount(r.betrag), what: `${r.nr}, ${r.bezug}` });
  }
  // what was withheld on the Abschlagsrechnungen is part of the same deduction announced for the Schlussrechnung
  // ("Restforderung laut Vertrag" in the solution list): one mark with the withheld part inside, never two amounts side by side
  for (const row of marks.values())
    for (const [key, ms] of Object.entries(row)) {
      const announced = ms.find((m) => m.kind === "angekuendigt");
      const withheld = ms.find((m) => m.kind === "abgezogen");
      if (announced && withheld) row[key] = [...ms.filter((m) => m !== announced && m !== withheld), { ...announced, withheld: { amount: withheld.amount, what: withheld.what } }];
    }
  const projects = own.map((p) => ({ id: p.projektId, ...projectLink(p.name), closed: p.zusaetzlichVerrechenbar === null, marks: marks.get(p.projektId)! }));

  const chains: ClientView["chains"] = [];
  for (const [key, r] of reasons) {
    const now = projects.flatMap((p) => (p.marks[key] ?? []).filter((m) => m.kind === "droht" || m.kind === "angekuendigt").map((m) => ({ p, m })))[0];
    // the earlier case lies in another project, a closed one first
    const before = projects
      .filter((p) => p.id !== now?.p.id)
      .sort((x, y) => Number(y.closed) - Number(x.closed))
      .flatMap((p) => (p.marks[key] ?? []).filter((m) => m.kind === "gekuerzt" || m.kind === "abgezogen").map((m) => ({ p, m })))[0];
    if (before && now)
      chains.push({
        key,
        reason: r.label,
        before: { name: before.p.name, href: before.p.href, kind: before.m.kind as "gekuerzt" | "abgezogen", amount: before.m.amount },
        now: { name: now.p.name, href: now.p.href, kind: now.m.kind as "droht" | "angekuendigt", amount: now.m.amount, withheld: now.m.withheld?.amount },
      });
  }

  const closing = Object.fromEntries(
    invoiceList(b)
      .filter((r) => r.figure && r.state === "bezahlt" && own.some((p) => p.projektId === r.id))
      .map((r) => [r.id, r.figure!]),
  );
  return {
    reasons: [...reasons.entries()].sort((x, y) => Number(y[1].own) - Number(x[1].own)).map(([key, r]) => ({ key, ...r })),
    projects,
    chains,
    parts: {
      cuts: h.kuerzungen.map((k, i) => ({ key: `k${i}`, label: KUERZUNGSGRUND_TEXT[k.grund], project: k.projekt, amount: amount(k.betrag) })),
      deductionsByProject: h.abzuege.map((a) => ({ project: a.projekt, amount: amount(a.betrag) })),
      changeOrders: firm()
        .projekte.filter((d) => d.projekt.auftraggeberId === auftraggeberId)
        .flatMap((d) =>
          d.nachtraege.map((n) => ({ id: `${d.projekt.id}-${n.nr.wert}`, label: `${n.nr.wert} ${n.titel.wert}`, project: d.projekt.name, accepted: n.beauftragt.wert, amount: amount(n.betrag.wert) })),
        ),
    },
    closing,
  };
}
