"use client";

import { Construction } from "lucide-react";
import { createElement } from "react";

import { keep } from "@/components/charts/tones";
import { belegIcon } from "@/components/fund/icons";
import { byMoment, dayShort, monthOf, monthTitle } from "@/lib/calendar";
import type { TimelineEvent, TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { Mark, type Selection } from "./detail";
import { isMissing, meaningOf, statusWord } from "./marks";

const chip = "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring";
const iconOf = (art: string) => belegIcon(art as Parameters<typeof belegIcon>[0]) ?? Construction;

/**
 * "Chronik" (v1's Zeitachse, made calm in step 8d): every event in order under a head per month that stays at the top
 * while its month scrolls by; each row with its day and time, kind, title, what it means for the invoice and its find as
 * a chip (the find's amount stands once, in the window, never at each of its Belege). Invoices, payments and cuts stand
 * between as quiet rows with their printed amount and its word, so the order of site and Rechnung reads in one column.
 * It opens at the top on phones too, so the heading and the switch stay in view (customer test 8e). A click opens the
 * event in the window at the right.
 */
export function Chronik({ view, shown, chosen, onSelect }: { view: TimelineView; shown: TimelineEvent[]; chosen: string | null; onSelect: (s: Selection) => void }) {
  const list = [...shown].sort(byMoment);
  const months: { first: string; events: TimelineEvent[] }[] = [];
  for (const e of list) {
    const first = monthOf(e.date.iso);
    if (months.at(-1)?.first !== first) months.push({ first, events: [] });
    months.at(-1)!.events.push(e);
  }
  if (!months.length) return <p className="py-12 text-center text-fg-muted">Nichts zu zeigen.</p>;
  return (
    <ol className="flex flex-col">
      {months.map((m) => (
        <li key={m.first} className="flex flex-col">
          <h3 className="sticky top-10 z-10 flex h-9 items-center gap-2 bg-surface/95 px-6 text-xs backdrop-blur-sm shadow-line-bottom max-md:top-11 max-md:px-4">
            <span className="font-medium whitespace-nowrap text-fg">{monthTitle(m.first)}</span>
            <span className="whitespace-nowrap text-fg-muted tabular-nums">{m.events.length === 1 ? "1 Ereignis" : `${m.events.length} Ereignisse`}</span>
            {view.deadline && monthOf(view.deadline.iso) === m.first && (
              <span className="ml-auto flex items-center gap-1.5 whitespace-nowrap text-fg-secondary">
                <span aria-hidden className="size-1.5 rounded-full bg-data-risk" />
                <span className="max-md:hidden">Schlussrechnung</span> legen bis {dayShort(view.deadline.iso)}
              </span>
            )}
          </h3>
          <ul className="flex flex-col py-1">
            {m.events.map((e, i) => (
              <li key={e.id}>
                <Row e={e} view={view} chosen={chosen === e.id} onSelect={onSelect} sameDay={i > 0 && m.events[i - 1].date.iso === e.date.iso} />
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ol>
  );
}

function Row({ e, view, chosen, onSelect, sameDay }: { e: TimelineEvent; view: TimelineView; chosen: boolean; onSelect: (s: Selection) => void; sameDay: boolean }) {
  const meaning = meaningOf(e, view.finds);
  const word = statusWord(meaning, view.target);
  const invoice = e.lane === "rechnung";
  return (
    <button
      type="button"
      onClick={() => onSelect({ kind: "event", id: e.id })}
      aria-pressed={chosen}
      className={cn(
        "grid w-full grid-cols-[64px_16px_minmax(0,1fr)_auto] items-center gap-x-3 px-6 text-left outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent max-md:grid-cols-[52px_16px_minmax(0,1fr)_auto] max-md:gap-x-2 max-md:px-4",
        invoice ? "min-h-11 py-1.5" : "min-h-14 py-2",
        chosen && "bg-row-selected hover:bg-row-selected",
      )}
    >
      {/* the day once per day, the time of a message under it */}
      <span className="flex flex-col text-xs tabular-nums">
        <span className={cn(sameDay ? "text-transparent" : "text-fg-secondary")}>{dayShort(e.date.iso)}</span>
        {e.time && <span className="text-[11px] text-fg-muted">{e.time}</span>}
      </span>
      <span className="flex justify-center">
        <Mark e={e} view={view} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={cn("flex min-w-0 items-center gap-1.5", invoice && "text-fg-secondary")}>
          {createElement(iconOf(e.art), { className: "size-3.5 shrink-0 text-fg-muted", "aria-hidden": true })}
          <span className="truncate max-md:line-clamp-2 max-md:whitespace-normal">{e.title}</span>
        </span>
        {invoice && e.amount && <span className="text-xs text-fg-secondary tabular-nums md:hidden">{keep(e.amount)}</span>}
        {!invoice && (
          <span className="flex min-w-0 items-center gap-1.5 text-xs">
            {word && <span className={cn("shrink-0 max-md:shrink", isMissing(meaning) ? "text-fg" : "text-fg-muted")}>{word}</span>}
            {e.text && e.text !== e.title && <span className="truncate text-fg-muted max-md:hidden">· {e.text}</span>}
          </span>
        )}
      </span>
      <span className="flex items-center gap-2 justify-self-end">
        {invoice ? e.amount && <span className="text-xs whitespace-nowrap text-fg-secondary tabular-nums max-md:hidden">{keep(e.amount)}</span> : e.finds[0] ? <span className={chip}>{e.finds[0]}</span> : null}
      </span>
    </button>
  );
}
