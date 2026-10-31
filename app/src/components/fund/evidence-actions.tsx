"use client";

import { BUSINESS } from "@/lib/example";
import { readDecisions, readEingaenge } from "@/lib/decisions";
import { outwardFinds, packageOpen } from "@/lib/evidence";
import type { FindRecord } from "@/lib/finds";
import { useLive } from "@/lib/live";
import { loadScan } from "@/lib/scans";
import { serverComplete } from "@/lib/server-store";
import { EvidencePackage } from "./evidence-package";
import { PdfButton } from "./pdf-button";
import { PrintBar } from "./print-bar";

/**
 * The button "PDF" of a Beweispaket: everything comes from the core over the decisions and signatures of this moment, so
 * the finds, their words and the sum belong together. Refused while a company's entries are still on their way: a
 * document for the Auftraggeber must not miss a "Nicht verrechnen".
 */
function EvidencePdfButton({ slugs, asOf, projektId, sample }: { slugs: string[]; asOf: string; projektId?: string; sample: boolean }) {
  const make = async () => {
    const [{ evidencePdf }, { browserSheets }, { savePdf }] = await Promise.all([import("@/lib/beweispaket-pdf"), import("@/lib/sheet-pdf"), import("@/lib/pdf")]);
    if (!serverComplete()) throw new Error("Die Einträge der Firma laden noch");
    const core = (await import("@/lib/kern-live")).live(readDecisions(), readEingaenge());
    const view = projektId ? core.invoiceView(projektId) : null;
    const finds = outwardFinds((view ? view.changes.entries.map((c) => c.find.href.split("/")[2]) : slugs).map((s) => core.findRecord(s)));
    if (!finds.length) throw new Error("Kein Fund");
    const { project, client } = finds[0].record;
    const bytes = await evidencePdf({ business: BUSINESS.name, project: project.name, client: client.name, asOf, finds, total: finds.length > 1 ? (view?.changes.total.text ?? null) : null, sample }, browserSheets(loadScan));
    const slug = project.name.replace(/[^\p{L}\p{N}]+/gu, "_");
    savePdf(bytes, finds.length > 1 ? `Beweispakete_${slug}.pdf` : `Beweispaket_${finds[0].record.number}_${slug}.pdf`);
  };
  return <PdfButton make={make} />;
}

/** One find: the bar with its PDF, and the package. */
export function OnePackage({ record, asOf, sample }: { record: FindRecord; asOf: string; sample: boolean }) {
  const now = useLive()?.findRecord(record.slug) ?? record;
  return (
    <>
      <PrintBar back={{ href: `/funde/${record.slug}/`, label: `Zurück zu ${record.number}` }}>{packageOpen(now) && <EvidencePdfButton slugs={[record.slug]} asOf={asOf} sample={sample} />}</PrintBar>
      <EvidencePackage record={record} asOf={asOf} />
    </>
  );
}

/** Every Beweispaket of the Änderungsliste as it stands now: a find that came into it or left it comes and goes here too. */
export function AllPackages({ records, projektId, back, asOf, sample }: { records: FindRecord[]; projektId: string; back: string; asOf: string; sample: boolean }) {
  const live = useLive();
  const view = live?.invoiceView(projektId);
  const list = live && view ? view.changes.entries.map((c) => live.findRecord(c.find.href.split("/")[2])) : records;
  return (
    <>
      <PrintBar back={{ href: back, label: "Zurück zur Schlussrechnung" }} count={list.length}>
        {list.length > 0 && <EvidencePdfButton slugs={list.map((r) => r.slug)} asOf={asOf} projektId={projektId} sample={sample} />}
      </PrintBar>
      {list.map((r, i) => (
        <EvidencePackage key={r.slug} record={r} asOf={asOf} first={i === 0} />
      ))}
    </>
  );
}
