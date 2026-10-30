"use client";

import { useEffect, useState } from "react";

import { BUSINESS } from "@/lib/example";
import { currentState, onStorageChange, readDecisions, type Decision } from "@/lib/decisions";
import { outward, outwardEvidence, outwardSteps, packagePages, type PackagePage } from "@/lib/evidence";
import type { FindRecord } from "@/lib/finds";
import { markOf } from "@/lib/originals";
import { marksOf, scanUrl, useScan } from "@/lib/scans";
import { cn } from "@/lib/utils";
import { OriginalPaper } from "./original-paper";

/** A real sheet with every place the package points to; the drawn page where a Beleg has none. */
function PackageSheet({ p }: { p: PackagePage }) {
  const scan = useScan(p.page.project, p.page.belegId)?.seiten[String(p.page.page)];
  if (!scan) return <OriginalPaper page={p.page} mark={markOf(p.page, p.places[0] ?? null)} />;
  return (
    <div className="relative mx-auto w-full" style={{ aspectRatio: `${scan.b} / ${scan.h}`, maxWidth: scan.b > scan.h ? undefined : 620 }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image server */}
      <img src={scanUrl(p.page.project, scan.bild)} alt={`${p.page.title}, Seite ${p.page.page}`} width={scan.b} height={scan.h} className="block h-full w-full" />
      {p.places
        .flatMap((x) => marksOf(scan, x))
        .map((b, i) => (
          <span key={i} aria-hidden className="absolute rounded-xs bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)] mix-blend-multiply" style={{ left: `${b[0] * 100}%`, top: `${b[1] * 100}%`, width: `${b[2] * 100}%`, height: `${b[3] * 100}%` }} />
        ))}
    </div>
  );
}

/**
 * "Beweispaket" of one find (SPEZIFIKATION.md 3.3 and 4.3), the evidence that goes with the Schlussrechnung to the
 * Auftraggeber: the page before the PDF (`beweispaket-pdf.ts`), with the same content: the find with its amount, the
 * Rechenweg with the source of every number, the Belege, and every sheet they point to with the place marked. What
 * stays inside is in `evidence.ts`. Until the find is released it carries "Entwurf, nicht freigegeben" (SPEZIFIKATION.md 5.1).
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

  const evidence = outwardEvidence(record);
  const pages = packagePages(record);

  return (
    <article aria-label={`Beweispaket ${record.number}`} className={cn("mx-auto flex w-full max-w-[820px] flex-col gap-6 px-6 py-6 max-md:px-4 print:max-w-none print:px-0 print:py-0", !first && "print:break-before-page")}>
      <header className="flex flex-col gap-3 pb-4 shadow-line-bottom">
        <div className="flex flex-wrap items-center gap-2 text-xs text-fg-secondary">
          <span>Beweispaket zur Schlussrechnung</span>
          <span aria-hidden>·</span>
          <span>{BUSINESS.name}</span>
          <span aria-hidden>·</span>
          <span>Belege abgeglichen am {asOf}</span>
          {draft && <span className="ml-auto rounded-sm px-1.5 py-0.5 font-medium text-fg shadow-[inset_0_0_0_1px_var(--color-fg-faint)]">Entwurf, nicht freigegeben</span>}
        </div>
        <h1 className="flex items-baseline gap-2 text-lg font-semibold">
          <span className="font-mono text-base font-medium">{record.number}</span>
          <span>{record.name}</span>
        </h1>
        <p className="text-fg-secondary">{record.facts.join(" · ")}</p>
        <dl className="grid grid-cols-3 gap-4 max-md:grid-cols-2">
          {[
            ["Projekt", record.project.name],
            ["Auftraggeber", record.client.name],
            ["Betrag, netto", record.amount],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="text-xs text-fg-secondary">{label}</dt>
              <dd className={cn(label.startsWith("Betrag") && "font-semibold tabular-nums")}>{value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-fg-muted print:hidden">
          Für den Auftraggeber: ohne Kürzungsrisiko, eigene Kalkulation, Stundenzettel und Entwurf. Diese internen Angaben stehen auf der Fundseite.
        </p>
      </header>

      <section aria-labelledby={`rechenweg-${record.number}`} className="flex flex-col gap-2 print:break-inside-avoid">
        <h2 id={`rechenweg-${record.number}`} className="text-sm font-semibold">
          Rechenweg
        </h2>
        <ol className="rounded-lg shadow-ring">
          {outwardSteps(record).map((s) => (
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
      </section>

      <section aria-labelledby={`belege-${record.number}`} className="flex flex-col gap-2 print:break-inside-avoid">
        <h2 id={`belege-${record.number}`} className="text-sm font-semibold">
          Belege <span className="font-normal text-fg-muted tabular-nums">{evidence.work.length + evidence.price.length}</span>
        </h2>
        {(
          [
            ["Belegen die Leistung", evidence.work],
            ["Belegen den Preis", evidence.price],
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
                        {outward(x.text)} · {x.source.detail}
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
          {pages.map((p) => (
            <figure key={p.page.key} className="flex flex-col gap-1 print:break-inside-avoid">
              <figcaption className="text-xs text-fg-secondary">
                {p.page.title}, Seite {p.page.page} von {p.page.pages}
              </figcaption>
              <PackageSheet p={p} />
            </figure>
          ))}
        </div>
      </section>
    </article>
  );
}
