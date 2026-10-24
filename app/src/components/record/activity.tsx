"use client";

import { Gavel, ListTodo, MessageCircle, PencilLine } from "lucide-react";
import { useState } from "react";

import type { ActivityEntry } from "@/lib/records";

const ICON = { korrektur: PencilLine, meldung: MessageCircle, entscheidung: Gavel, aufgabe: ListTodo } as const;

/**
 * "Verlauf" of a record (Attio's "Activity" with "View all"): append only, newest first. Shows the first entries and
 * the rest after "Alle anzeigen".
 */
export function Activity({ entries, first = 5 }: { entries: ActivityEntry[]; first?: number }) {
  const [all, setAll] = useState(false);
  const shown = all ? entries : entries.slice(0, first);
  return (
    <section aria-label="Verlauf">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm text-fg-secondary">
          Verlauf <span className="text-fg-muted tabular-nums">{entries.length}</span>
        </h2>
        {entries.length > first && (
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="flex h-7 items-center rounded-md px-2 text-xs text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
          >
            {all ? "Weniger anzeigen" : "Alle anzeigen"}
          </button>
        )}
      </div>
      {entries.length === 0 && <p className="rounded-lg px-3 py-2.5 text-fg-muted shadow-ring">Noch keine Änderung von Hand.</p>}
      <ol className={entries.length ? "rounded-lg bg-surface px-1 py-1 shadow-ring" : "hidden"}>
        {shown.map((e) => {
          const Icon = ICON[e.kind];
          return (
            <li key={e.id} className="flex min-h-9 items-start gap-2.5 rounded-md px-2 py-2">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs bg-fill-hover text-fg-secondary shadow-ring" aria-hidden>
                <Icon className="size-3" />
              </span>
              <p className="min-w-0 flex-1">
                <span className="font-medium">{e.who}</span> <span className="text-fg-secondary">{e.text}</span>
                <span className="block text-xs text-fg-muted tabular-nums sm:hidden">{e.timeText}</span>
              </p>
              <time dateTime={e.time} className="shrink-0 pt-px text-xs text-fg-muted tabular-nums max-sm:hidden">
                {e.timeText}
              </time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
