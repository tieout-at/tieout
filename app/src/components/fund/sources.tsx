"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { createElement } from "react";

import { InfoTip } from "@/components/ui/info-tip";
import { useMediaQuery } from "@/components/ui/use-media";
import type { EvidenceGroups, FindRecord, SourceRef, StepQuantities } from "@/lib/finds";
import { cn } from "@/lib/utils";
import { belegIcon } from "./icons";

export type OpenSource = (s: SourceRef) => void;

const same = (a: SourceRef | null, b: SourceRef) => !!a && a.page === b.page && a.place === b.place;
const keep = (text: string) => text.replace(/ €/g, " €");

/** A place in a Beleg as a small button: opens the original in its window with the place marked; again, closes it. */
export function SourceChip({ source, active, onOpen }: { source: SourceRef; active: SourceRef | null; onOpen: OpenSource }) {
  const on = same(active, source);
  return (
    <button
      type="button"
      onClick={() => onOpen(source)}
      aria-pressed={on}
      title={`${source.label}, ${source.detail}`}
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1 rounded-sm px-1.5 text-xs shadow-ring outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:relative max-md:before:absolute max-md:before:-inset-y-2.5 max-md:before:inset-x-0",
        on ? "bg-accent-soft text-accent shadow-[inset_0_0_0_1px_rgb(29_59_255/0.25)]" : "bg-fill-subtle text-fg-secondary hover:bg-fill-hover hover:text-fg",
      )}
    >
      {source.kind && createElement(belegIcon(source.kind), { className: cn("size-3.5 shrink-0", on ? "text-accent" : "text-fg-muted"), "aria-hidden": true })}
      <span className="truncate">{source.short}</span>
    </button>
  );
}

/**
 * "Rechenweg" (SPEZIFIKATION.md 4.3, step 8d): one row per step with the position, the formula once, the amount, and for
 * a position its quantities in words ("verrechnet 1.512 m, aufgemessen 1.638 m") with what is billed on top of them
 * ("+126 m") marked once. Every source chip opens its original.
 */
export function CalcPath({ calc, active, onOpen }: { calc: FindRecord["calc"]; active: SourceRef | null; onOpen: OpenSource }) {
  return (
    <section aria-labelledby="rechenweg">
      <h2 id="rechenweg" className="mb-2 flex items-center gap-1.5 text-fg-secondary">
        Rechenweg
        <InfoTip label="Rechenweg">Jede Zahl führt mit einem Klick ins Original. Bei einer Position steht, was verrechnet und was aufgemessen ist; der Unterschied ist, was dazukommt.</InfoTip>
      </h2>
      <ol className="overflow-hidden rounded-xl bg-surface shadow-ring">
        {calc.steps.map((s) => {
          const pos = s.quantities ? s.title.split(" ")[0] : null;
          return (
            <li key={s.id} className="flex flex-col gap-1.5 px-4 py-3 shadow-line-bottom">
              <span className="flex items-baseline gap-4">
                <span className="line-clamp-2 min-w-0 flex-1">
                  {pos && <span className="mr-1.5 font-mono text-xs text-fg-secondary">{pos}</span>}
                  {pos ? s.title.slice(pos.length + 1) : s.title}
                </span>
                <span className="shrink-0 text-sm whitespace-nowrap tabular-nums">{keep(s.amount)}</span>
              </span>
              <span className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-xs text-fg-secondary tabular-nums">
                {s.quantities ? <Quantities q={s.quantities} formula={s.formula} /> : <span>{keep(s.formula)}</span>}
              </span>
              {s.sources.length > 0 && (
                <span className="flex flex-wrap gap-1 pt-0.5">
                  {s.sources.map((x) => (
                    <SourceChip key={`${x.page}-${x.place}`} source={x} active={active} onOpen={onOpen} />
                  ))}
                </span>
              )}
            </li>
          );
        })}
        <li className="flex items-baseline gap-3 bg-sidebar px-4 py-3">
          <span className="min-w-0 flex-1 font-semibold">{calc.total.label}</span>
          <span className="font-semibold whitespace-nowrap tabular-nums">{keep(calc.total.amount)}</span>
        </li>
      </ol>
      {calc.check && (
        <details className="mt-2 px-1 text-xs text-fg-secondary">
          <summary className="w-fit cursor-pointer rounded-xs outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:py-3">Gegenprobe mit der Preisbasis</summary>
          <p className="mt-1 tabular-nums">Formblatt K7, nicht Teil des Betrags: {calc.check.replace(/^K7 /, "")}</p>
        </details>
      )}
    </section>
  );
}

/**
 * "verrechnet 1.512 m, aufgemessen 1.638 m · +126 m × 13,90 €": the core's quantities in words, and the formula with its
 * quantity marked as what is billed on top, so "126 m" stands once.
 */
function Quantities({ q, formula }: { q: StepQuantities; formula: string }) {
  const rest = formula.startsWith(q.diffText) ? formula.slice(q.diffText.length) : null;
  return (
    <span className="flex flex-wrap items-baseline gap-x-1.5">
      <span>verrechnet {q.invoicedText},</span>
      <span>aufgemessen {q.doneText}</span>
      <span aria-hidden className="text-fg-faint">·</span>
      {rest !== null ? (
        <span>
          <span className="rounded-[4px] bg-money-soft px-1 font-medium text-state-green-edge">+{q.diffText}</span>
          {keep(rest)}
        </span>
      ) : (
        <span>{keep(formula)}</span>
      )}
    </span>
  );
}

/** The Belege as one calm list, what proves the work first; only the exception is named ("belegt den Preis"). A row
 * opens its original in the window, a second click closes it. Folded on phones. */
export function EvidenceTiles({ evidence, active, onOpen }: { evidence: EvidenceGroups; active: SourceRef | null; onOpen: OpenSource }) {
  const phone = useMediaQuery("(max-width: 767px)", false);
  const items = [...evidence.work.map((x) => ({ x, price: false })), ...evidence.price.map((x) => ({ x, price: true }))];
  const list = (
    <ul className="overflow-hidden rounded-xl bg-surface shadow-ring">
      {items.map(({ x, price }) => {
        const on = same(active, x.source);
        return (
          <li key={x.id} className="[&:not(:last-child)]:shadow-line-bottom">
            <button
              type="button"
              onClick={() => onOpen(x.source)}
              aria-pressed={on}
              className={cn("flex min-h-11 w-full items-center gap-2.5 px-4 py-2 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent", on ? "bg-row-selected" : "hover:bg-row-hover")}
            >
              {createElement(belegIcon(x.kind), { className: cn("size-4 shrink-0", on ? "text-accent" : "text-fg-secondary"), "aria-hidden": true })}
              <span className="min-w-0 flex-1 truncate">{x.title}</span>
              {price && <span className="shrink-0 text-xs text-fg-muted">belegt den Preis</span>}
              {x.date && <span className="w-20 shrink-0 text-right text-xs text-fg-muted tabular-nums">{x.date}</span>}
            </button>
          </li>
        );
      })}
    </ul>
  );
  const title = (
    <>
      Belege <span className="text-fg-muted tabular-nums">{items.length}</span>
    </>
  );
  if (phone)
    return (
      <details className="group">
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-md text-fg-secondary outline-none focus-visible:outline-2 focus-visible:outline-accent">
          <ChevronRight aria-hidden className="size-4 transition-transform group-open:rotate-90" />
          {title}
        </summary>
        <div className="mt-2">{list}</div>
      </details>
    );
  return (
    <section aria-labelledby="belege">
      <h2 id="belege" className="mb-2 text-fg-secondary">
        {title}
      </h2>
      {list}
    </section>
  );
}

/**
 * The weak spot of the find as ONE quiet line (step 8d, asked smaller by Maxi S.): a dot in the colour of what it is (red
 * for a Kürzungsrisiko, yellow or orange for a gap), the reason with its part amount; a click opens the Abhilfe, "Gleicher
 * Grund" and the sources under it. No box, no edge. A find set to "Nicht verrechnen" is in no Entwurf, so its
 * Kürzungsrisiko no longer applies.
 */
export function WeakSpot({ record, excluded, active, onOpen }: { record: FindRecord; excluded: boolean; active: SourceRef | null; onOpen: OpenSource }) {
  const r = excluded ? null : record.risk;
  if (excluded && record.risk)
    return (
      <p id="kuerzungsrisiko" className="flex items-center gap-2 text-fg-secondary">
        <span aria-hidden className="size-2 rounded-full bg-state-grey" />
        Kürzungsrisiko entfällt, der Fund wird nicht verrechnet.
      </p>
    );
  if (!r && !record.remedy && !record.notes.length) return null;
  const dot = r ? (r.alreadyCut ? "bg-state-grey" : "bg-state-red") : record.belegstand?.state === "nachtrag_nicht_gelegt" ? "bg-state-orange" : "bg-state-yellow";
  const head = r ? `${r.alreadyCut ? "Schon gekürzt" : "Kürzungsrisiko"}: ${r.reason}` : "Was fehlt";
  const body = (
    <div className="flex flex-col gap-1.5 pt-1.5 pl-[18px] text-fg-secondary">
      {r ? (
        <>
          <p>
            <span className="text-fg-muted">Abhilfe </span>
            {r.remedy}
          </p>
          {r.sameReason && (
            <p className="text-xs text-fg-muted">
              {r.sameReason}{" "}
              <Link href={record.client.href} className="link-quiet">
                {record.client.name}
              </Link>
            </p>
          )}
          {r.sources.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {r.sources.map((x) => (
                <SourceChip key={`${x.page}-${x.place}`} source={x} active={active} onOpen={onOpen} />
              ))}
            </div>
          )}
        </>
      ) : null}
      {record.notes.map((n) => (
        <p key={n.id} className="text-xs">
          <span className="text-fg">{n.title}:</span> {n.text}
        </p>
      ))}
    </div>
  );
  // a gap says what is missing right in the line; a Kürzungsrisiko opens its Abhilfe on a click
  if (!r)
    return (
      <section id="kuerzungsrisiko" aria-label="Was fehlt" className="flex scroll-mt-4 flex-col">
        {record.remedy && (
          <p className="flex items-baseline gap-2">
            <span aria-hidden className={cn("size-2 shrink-0 translate-y-[-1px] rounded-full", dot)} />
            <span>
              <span className="text-fg-muted">Was fehlt: </span>
              {record.remedy}
            </span>
          </p>
        )}
        {record.notes.length > 0 && body}
      </section>
    );
  return (
    <details id="kuerzungsrisiko" className="group scroll-mt-4">
      <summary className="flex min-h-9 w-fit max-w-full cursor-pointer list-none flex-wrap items-center gap-x-2 rounded-md pr-2 outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
        <span aria-hidden className={cn("size-2 shrink-0 rounded-full", dot)} />
        <span className="font-medium">{head}</span>
        {r.amount !== record.amount && <span className="text-fg-secondary tabular-nums">betrifft {keep(r.amount)}</span>}
        <span className="flex items-center gap-0.5 text-xs text-fg-muted">
          <ChevronRight aria-hidden className="size-3.5 transition-transform group-open:rotate-90" />
          Abhilfe
        </span>
      </summary>
      {body}
    </details>
  );
}
