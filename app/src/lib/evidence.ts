/**
 * What of a find goes to the Auftraggeber, for the page "Beweispaket" and its PDF alike (SPEZIFIKATION.md 3.3 and 4.3).
 * Left out, customer test 3, all three roles: Kürzungsrisiko, Abhilfe, "Gleicher Grund", the Gegenprobe with the
 * Preisbasis, the decision, and the pages of the Entwurf, the Preisbasis and the Stundenzettel. The Stundenzettel is
 * never handed out (SPEZIFIKATION.md 1.3); the other two show the own calculation.
 */

import type { EvidenceItem, FindRecord, SourceRef } from "./finds";
import type { OriginalPage } from "./originals";

const INTERNAL = new Set<string>(["entwurf", "preisbasis", "stundenzettel"]);

/** Whether an Aufmaßblatt was entered into the own invoicing program is a note for the business, not for the Auftraggeber. */
export const outward = (text: string) => text.replace(/, (?:nicht im Rechnungsprogramm erfasst|erfasst am \d{2}\.\d{2}\.\d{4})/, "");

/** A find whose Nachtrag is not laid stands on the own calculation only: it has no Beweispaket until the Nachtrag is laid. */
export const packageOpen = (r: FindRecord) => r.belegstand?.state !== "nachtrag_nicht_gelegt";

/** The Rechenweg as it goes out: every step without its internal sources, the quantity invoiced so far in plain words. */
export function outwardSteps(r: FindRecord) {
  return r.calc.steps.map((s) => ({ ...s, title: s.title.replace("Verrechnet im Entwurf", "Bisher verrechnet"), sources: s.sources.filter((x) => !isInternal(r, x)) }));
}

/** The finds of a PDF, each with whether it is still a draft: none on "Nicht verrechnen", none without a Beweispaket. */
export const outwardFinds = (records: readonly FindRecord[]) =>
  records.filter((r) => r.decision !== "nicht_verrechnen" && packageOpen(r)).map((record) => ({ record, draft: record.decision !== "freigegeben" && record.decision !== "in_schlussrechnung" }));

const isInternal = (r: FindRecord, s: SourceRef) => INTERNAL.has(r.originals[s.page]?.art ?? "");

export function outwardEvidence(r: FindRecord): { work: EvidenceItem[]; price: EvidenceItem[] } {
  return { work: r.evidence.work.filter((e) => !isInternal(r, e.source)), price: r.evidence.price.filter((e) => !isInternal(r, e.source)) };
}

/** A photo and a WhatsApp-Meldung have no sheet yet (ordner/README.md), so nobody asks for one. */
export const hasSheet = (o: OriginalPage) => o.art !== "foto" && o.art !== "whatsapp";

/** A page of a Beleg in the package, with every place on it the Rechenweg or the Belege point to. */
export type PackagePage = { page: OriginalPage; places: string[]; first: SourceRef };

/** Each page once, in the order of the Rechenweg, then the Belege. */
export function packagePages(r: FindRecord): PackagePage[] {
  const seen = new Map<string, PackagePage>();
  const all = [...r.calc.steps.flatMap((s) => s.sources), ...r.evidence.work.map((e) => e.source), ...r.evidence.price.map((e) => e.source)];
  for (const s of all) {
    const page = r.originals[s.page];
    if (!page || isInternal(r, s)) continue;
    const entry = seen.get(s.page) ?? { page, places: [], first: s };
    if (s.place && !entry.places.includes(s.place)) entry.places.push(s.place);
    seen.set(s.page, entry);
  }
  return [...seen.values()];
}
