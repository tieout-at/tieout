"use client";

import { useEffect, useMemo, useState } from "react";

import { BUSINESS } from "@/lib/example";
import { currentState, DECISION_TEXT, onStorageChange, readDecisions, type Decision } from "@/lib/decisions";
import type { FindRecord, SourceRef } from "@/lib/finds";
import { markOf } from "@/lib/originals";
import { cn } from "@/lib/utils";
import { OriginalPaper } from "./original-paper";

/**
 * "Beweispaket" of one find (SPEZIFIKATION.md 3.3 and 4.3), made to be printed or saved as PDF from the browser: the
 * head with amount, Belegstand and decision, the Rechenweg with the source of every number, the weak spot and its
 * Abhilfe, the Belege, and every page of a Beleg the Rechenweg or the Belege point to, with the place marked. Until the
 * find is released it carries "Entwurf, nicht freigegeben" (SPEZIFIKATION.md 5.1).
 */
export function EvidencePackage({ record, asOf, first = true }: { record: FindRecord; asOf: string; first?: boolean }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  useEffect(() => {
    const load = () => setDecisions(readDecisions());
    load();
    return onStorageChange(load);
  }, []);
  const state = currentState(decisions, [record.key, ...record.earlierKeys], record.decision);
  const draft = state !== "freigegeben" && state !== "in_schlussrechnung";

  // each page of a Beleg once, marked at the first place that points to it, in the order of the Rechenweg, then the Belege
  const pages = useMemo(() => {
    const seen = new Map<string, SourceRef>();
    const all = [...record.calc.steps.flatMap((s) => s.sources), ...record.evidence.work.map((e) => e.source), ...record.evidence.price.map((e) => e.source)];
    for (const s of all) if (!seen.has(s.page) && record.originals[s.page]) seen.set(s.page, s);
    return [...seen.values()];
  }, [record]);

  return (
    <article aria-label={`Beweispaket ${record.number}`} className={cn("mx-auto flex w-full max-w-[820px] flex-col gap-6 px-6 py-6 max-md:px-4 print:max-w-none print:px-0 print:py-0", !first && "print:break-before-page")}>
      <header className="flex flex-col gap-3 pb-4 shadow-line-bottom">
        <div className="flex flex-wrap items-center gap-2 text-xs text-fg-secondary">
          <span>Beweispaket</span>
          <span aria-hidden>·</span>
          <span>{BUSINESS.name}</span>
          <span aria-hidden>·</span>
          <span>Stand {asOf}</span>
          {draft && <span className="ml-auto rounded-sm px-1.5 py-0.5 font-medium text-fg shadow-[inset_0_0_0_1px_var(--color-fg-faint)]">Entwurf, nicht freigegeben</span>}
        </div>
        <h1 className="flex items-baseline gap-2 text-lg font-semibold">
          <span className="font-mono text-base font-medium">{record.number}</span>
          <span>{record.name}</span>
        </h1>
        <p className="text-fg-secondary">{record.facts.join(" · ")}</p>
        <dl className="grid grid-cols-4 gap-4 max-md:grid-cols-2">
          {[
            ["Projekt", record.project.name],
            ["Auftraggeber", record.client.name],
            ["Betrag", record.amount],
            ["Belegstand", record.belegstand?.text ?? "ohne"],
            ["Entscheidung", DECISION_TEXT[state]],
            ["Zählt als", state === "nicht_verrechnen" ? "zählt in keiner Summe" : (record.money ?? "zählt erst nach einer Entscheidung")],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-fg-secondary">{label}</dt>
              <dd className={cn(label === "Betrag" && "font-semibold tabular-nums")}>{value}</dd>
            </div>
          ))}
        </dl>
      </header>

      <section aria-labelledby={`rechenweg-${record.number}`} className="flex flex-col gap-2 print:break-inside-avoid">
        <h2 id={`rechenweg-${record.number}`} className="text-sm font-semibold">
          Rechenweg
        </h2>
        <ol className="rounded-lg shadow-ring">
          {record.calc.steps.map((s) => (
            <li key={s.id} className="flex flex-col gap-0.5 px-3 py-2 shadow-line-bottom">
              <span className="flex items-baseline gap-3">
                <span className="min-w-0 flex-1">{s.title}</span>
                <span className="tabular-nums">{s.amount}</span>
              </span>
              <span className="text-xs tabular-nums">
                {s.formula}
                {s.derivation && <span className="text-fg-secondary"> · {s.derivation}</span>}
              </span>
              {s.sources.length > 0 && <span className="text-xs text-fg-secondary">Quelle: {s.sources.map((x) => `${x.label}, ${x.detail}`).join("; ")}</span>}
            </li>
          ))}
          <li className="flex items-baseline gap-3 px-3 py-2 font-semibold">
            <span className="flex-1">{record.calc.total.label}</span>
            <span className="tabular-nums">{record.calc.total.amount}</span>
          </li>
        </ol>
        {record.calc.check && <p className="text-xs text-fg-secondary tabular-nums">Gegenprobe mit der Preisbasis, nicht Teil des Betrags: {record.calc.check.replace(/^K7 /, "")}</p>}
      </section>

      {(record.risk || record.remedy) && (
        <section aria-label="Schwachstelle" className="flex flex-col gap-1 rounded-lg px-3 py-2.5 shadow-ring print:break-inside-avoid">
          {record.risk ? (
            <>
              <span className="flex items-center gap-2 font-medium">
                <span aria-hidden className={cn("size-2 rounded-full", record.risk.alreadyCut ? "bg-state-grey" : "bg-state-red")} />
                Kürzungsrisiko {record.risk.number}: {record.risk.reason}, {record.risk.amount}
              </span>
              <span className="text-xs text-fg-secondary">{record.risk.detail}</span>
              <span className="text-xs">Abhilfe: {record.risk.remedy}</span>
              {record.risk.sameReason && <span className="text-xs text-fg-secondary">{record.risk.sameReason}</span>}
            </>
          ) : (
            <span className="text-xs">Was fehlt: {record.remedy}</span>
          )}
        </section>
      )}

      <section aria-labelledby={`belege-${record.number}`} className="flex flex-col gap-2 print:break-inside-avoid">
        <h2 id={`belege-${record.number}`} className="text-sm font-semibold">
          Belege <span className="font-normal text-fg-muted tabular-nums">{record.evidence.work.length + record.evidence.price.length}</span>
        </h2>
        {(
          [
            ["Belegen die Leistung", record.evidence.work],
            ["Belegen den Preis", record.evidence.price],
          ] as const
        ).map(
          ([title, items]) =>
            items.length > 0 && (
              <div key={title} className="flex flex-col">
                <h3 className="pb-1 text-xs text-fg-secondary">{title}</h3>
                <ul className="rounded-lg shadow-ring">
                  {items.map((x) => (
                    <li key={x.id} className="flex flex-col px-3 py-1.5 [&:not(:last-child)]:shadow-line-bottom">
                      <span className="flex gap-3">
                        <span className="min-w-0 flex-1">{x.title}</span>
                        {x.date && <span className="text-xs text-fg-secondary tabular-nums">{x.date}</span>}
                      </span>
                      <span className="text-xs text-fg-secondary">
                        {x.text} · {x.source.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ),
        )}
      </section>

      <section aria-labelledby={`originale-${record.number}`} className="flex flex-col gap-3 print:break-before-page">
        <h2 id={`originale-${record.number}`} className="text-sm font-semibold">
          Die Stellen im Original <span className="font-normal text-fg-muted tabular-nums">{pages.length}</span>
        </h2>
        <p className="text-xs text-fg-secondary">Jede Seite mit der markierten Stelle, auf die der Rechenweg oder die Belege zeigen.</p>
        <div className="flex flex-col gap-4">
          {pages.map((s) => {
            const page = record.originals[s.page];
            return (
              <figure key={s.page} className="flex flex-col gap-1 print:break-inside-avoid">
                <figcaption className="text-xs text-fg-secondary">
                  {page.title}, Seite {page.page} von {page.pages}
                </figcaption>
                <OriginalPaper page={page} mark={markOf(page, s.place)} />
              </figure>
            );
          })}
        </div>
      </section>
    </article>
  );
}
