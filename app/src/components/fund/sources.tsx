"use client";

import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { belegIcon } from "@/components/zwilling/icons";
import type { EvidenceGroups, EvidenceItem, FindRecord, SourceRef } from "@/lib/finds";
import { cn } from "@/lib/utils";

export type OpenSource = (s: SourceRef) => void;

const same = (a: SourceRef | null, b: SourceRef) => !!a && a.page === b.page && a.place === b.place;

/** A place in a Beleg as a small button: opens the original on the right with the place marked. */
export function SourceChip({ source, active, onOpen }: { source: SourceRef; active: SourceRef | null; onOpen: OpenSource }) {
  const on = same(active, source);
  return (
    <button
      type="button"
      onClick={() => onOpen(source)}
      aria-pressed={on}
      title={`${source.label}, ${source.detail}`}
      className={cn(
        "inline-flex h-6 max-w-full items-center rounded-sm px-1.5 text-xs shadow-ring outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11",
        on ? "bg-accent-soft text-accent shadow-[inset_0_0_0_1px_rgb(29_59_255/0.25)]" : "bg-fill-subtle text-fg-secondary hover:bg-fill-hover hover:text-fg",
      )}
    >
      <span className="truncate">
        {source.label}, {source.detail.split(",")[0]}
      </span>
    </button>
  );
}

/** "Rechenweg" (SPEZIFIKATION.md 4.3): every step of the calculation with where its quantity and price come from. */
export function CalcPath({ calc, active, onOpen }: { calc: FindRecord["calc"]; active: SourceRef | null; onOpen: OpenSource }) {
  return (
    <section aria-labelledby="rechenweg">
      <h2 id="rechenweg" className="mb-2 text-sm text-fg-secondary">
        Rechenweg
      </h2>
      <ol className="rounded-lg bg-surface shadow-ring">
        {calc.steps.map((s) => (
          <li key={s.id} className="flex flex-col gap-1 px-3 py-2.5 shadow-line-bottom">
            <div className="flex items-baseline gap-3">
              <span className="min-w-0 flex-1">{s.title}</span>
              <span className="shrink-0 whitespace-nowrap tabular-nums">{s.amount}</span>
            </div>
            <p className="text-xs text-fg-secondary tabular-nums">
              <span className="text-fg">{s.formula}</span>
              {s.derivation && <span> · {s.derivation}</span>}
            </p>
            {s.sources.length > 0 && (
              <div className="mt-0.5 flex flex-wrap gap-1">
                {s.sources.map((x) => (
                  <SourceChip key={`${x.page}-${x.place}`} source={x} active={active} onOpen={onOpen} />
                ))}
              </div>
            )}
          </li>
        ))}
        <li className="flex items-baseline gap-3 px-3 py-2.5">
          <span className="min-w-0 flex-1 font-semibold">{calc.total.label}</span>
          <span className="shrink-0 font-semibold whitespace-nowrap tabular-nums">{calc.total.amount}</span>
        </li>
      </ol>
      {calc.check && (
        <p className="mt-2 px-1 text-xs text-fg-secondary tabular-nums">
          Gegenprobe mit der Preisbasis (Formblatt K7), nicht Teil des Betrags: {calc.check.replace(/^K7 /, "")}
        </p>
      )}
    </section>
  );
}

function EvidenceRows({ title, items, active, onOpen }: { title: string; items: EvidenceItem[]; active: SourceRef | null; onOpen: OpenSource }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="px-1 pt-1 pb-1.5 text-xs text-fg-secondary">{title}</h3>
      <ul className="flex flex-col">
        {items.map((x) => {
          const Icon = belegIcon(x.kind);
          const on = same(active, x.source);
          return (
            <li key={x.id}>
              <button
                type="button"
                onClick={() => onOpen(x.source)}
                aria-pressed={on}
                className={cn(
                  "flex w-full items-start gap-2.5 rounded-md px-2 py-2 text-left outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11",
                  on ? "bg-row-selected" : "hover:bg-row-hover",
                )}
              >
                <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs shadow-ring", on ? "bg-accent-soft text-accent" : "bg-fill-hover text-fg-secondary")} aria-hidden>
                  <Icon className="size-3" />
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="flex items-baseline gap-2">
                    <span className="min-w-0 flex-1 truncate">{x.title}</span>
                  </span>
                  <span className="line-clamp-2 text-xs text-fg-secondary">{x.text}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The Belege behind the find, split into what proves the work and what proves the price. */
export function EvidenceList({ evidence, active, onOpen }: { evidence: EvidenceGroups; active: SourceRef | null; onOpen: OpenSource }) {
  return (
    <section aria-labelledby="belege">
      <h2 id="belege" className="mb-2 text-sm text-fg-secondary">
        Belege <span className="text-fg-muted tabular-nums">{evidence.work.length + evidence.price.length}</span>
      </h2>
      <div className="flex flex-col gap-1 rounded-lg bg-surface p-1 shadow-ring">
        <EvidenceRows title="Belegen die Leistung" items={evidence.work} active={active} onOpen={onOpen} />
        <EvidenceRows title="Belegen den Preis" items={evidence.price} active={active} onOpen={onOpen} />
      </div>
    </section>
  );
}

/** The weak spot of the find: the Vorprüfung line that lies in it, with its Abhilfe; or what a find "in Klärung" lacks. */
export function WeakSpot({ record, active, onOpen }: { record: FindRecord; active: SourceRef | null; onOpen: OpenSource }) {
  const r = record.risk;
  if (!r && !record.remedy && !record.notes.length) return null;
  return (
    <section id="kuerzungsrisiko" aria-labelledby="kuerzungsrisiko-titel" className="scroll-mt-4">
      <h2 id="kuerzungsrisiko-titel" className="mb-2 text-sm text-fg-secondary">
        {r ? "Kürzungsrisiko" : record.remedy ? "Was fehlt" : "Hinweis"}
      </h2>
      <div className="flex flex-col gap-2 rounded-lg bg-surface px-3 py-2.5 shadow-ring">
        {r && (
          <>
            <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <ShieldAlert className="size-4 shrink-0 translate-y-0.5 self-start text-state-red" aria-hidden />
              <span className="min-w-0 flex-1 max-sm:basis-[calc(100%-24px)]">
                <span className="font-medium">{r.reason}</span>
                <span className="text-fg-secondary">: {r.detail}</span>
              </span>
              <span className="shrink-0 text-xs whitespace-nowrap text-fg-secondary tabular-nums max-sm:basis-full max-sm:pl-6">
                {r.number}, {r.alreadyCut ? "schon gekürzt" : "droht"} {r.amount}
              </span>
            </p>
            <p className="pl-6">
              <span className="text-fg-secondary">Abhilfe: </span>
              {r.remedy}
            </p>
            {r.sameReason && (
              <p className="pl-6 text-xs text-fg-secondary">
                {r.sameReason}{" "}
                <Link href={record.client.href} className="rounded-xs text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
                  {record.client.name} öffnen
                </Link>
              </p>
            )}
            <div className="flex flex-wrap gap-1 pl-6">
              {r.sources.map((x) => (
                <SourceChip key={`${x.page}-${x.place}`} source={x} active={active} onOpen={onOpen} />
              ))}
            </div>
          </>
        )}
        {!r && record.remedy && (
          <p>
            <span className="text-fg-secondary">Abhilfe: </span>
            {record.remedy}
          </p>
        )}
        {record.notes.map((n) => (
          <p key={n.id} className="text-xs text-fg-secondary">
            <span className="text-fg">{n.title}:</span> {n.text}
          </p>
        ))}
      </div>
    </section>
  );
}
