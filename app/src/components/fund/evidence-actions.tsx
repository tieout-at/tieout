"use client";

import { BUSINESS } from "@/lib/example";
import { currentState, readDecisions, readEingaenge } from "@/lib/decisions";
import type { FindRecord } from "@/lib/finds";
import { loadScan } from "@/lib/scans";
import { PdfButton } from "./pdf-button";

/**
 * The button "PDF" of a Beweispaket: takes the decisions of this moment, leaves out a find set to "Nicht verrechnen",
 * and marks every find that is not released. With `projektId` the sum of the Änderungsliste comes from the core over
 * those decisions.
 */
export function EvidencePdfButton({ records, asOf, projektId, sample }: { records: FindRecord[]; asOf: string; projektId?: string; sample: boolean }) {
  const make = async () => {
    const [{ evidencePdf }, { browserSheets }, { savePdf }] = await Promise.all([import("@/lib/beweispaket-pdf"), import("@/lib/sheet-pdf"), import("@/lib/pdf")]);
    const decisions = readDecisions();
    const eingaenge = readEingaenge();
    const finds = records
      .map((record) => ({ record, state: currentState(decisions, [record.key, ...record.earlierKeys], record.decision) }))
      .filter((f) => f.state !== "nicht_verrechnen")
      .map((f) => ({ record: f.record, draft: f.state !== "freigegeben" && f.state !== "in_schlussrechnung" }));
    if (!finds.length) throw new Error("Kein Fund");
    const view = projektId ? (await import("@/lib/kern-live")).live(decisions, eingaenge).invoiceView(projektId) : null;
    const bytes = await evidencePdf({ business: BUSINESS.name, project: records[0].project.name, client: records[0].client.name, asOf, finds, total: finds.length > 1 ? (view?.changes.total.text ?? null) : null, sample }, browserSheets(loadScan));
    const slug = records[0].project.name.replace(/[^\p{L}\p{N}]+/gu, "_");
    savePdf(bytes, finds.length > 1 ? `Beweispakete_${slug}.pdf` : `Beweispaket_${finds[0].record.number}_${slug}.pdf`);
  };
  return <PdfButton make={make} />;
}
