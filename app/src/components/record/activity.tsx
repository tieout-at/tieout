"use client";

import { ChevronRight, CircleCheck, Gavel, ListTodo, MessageCircle, PencilLine } from "lucide-react";
import { useState } from "react";

import type { ActivityEntry } from "@/lib/records";
import { cn } from "@/lib/utils";

const ICON = { korrektur: PencilLine, meldung: MessageCircle, entscheidung: Gavel, aufgabe: ListTodo, erledigt: CircleCheck } as const;

/** A run of entries of one kind in one line ("korrigierte 5 Felder"). */
const SUMMARY = {
  korrektur: (n: number) => `änderte ${n} Felder`,
  meldung: (n: number) => `bestätigte ${n} WhatsApp-Meldungen`,
  entscheidung: (n: number) => `traf ${n} Entscheidungen`,
  aufgabe: (n: number) => `legte ${n} Aufgaben an oder öffnete sie wieder`,
  erledigt: (n: number) => `hakte ${n} Aufgaben ab`,
} as const;

/** Inside a group the verb is said once, in the summary: "änderte Datum in Foto …" shows as "Datum in Foto …". */
const without = (text: string) => {
  const rest = text.replace(/^(änderte|bestätigte) /, "");
  return rest.charAt(0).toUpperCase() + rest.slice(1);
};

type Group = { id: string; kind: ActivityEntry["kind"]; who: string; day: string; entries: ActivityEntry[] };

/** Entries in a row of the same kind, day and role become one group. */
export function groupActivity(entries: ActivityEntry[]): Group[] {
  const groups: Group[] = [];
  for (const e of entries) {
    const day = e.timeText.split(",")[0];
    const last = groups.at(-1);
    if (last && last.kind === e.kind && last.who === e.who && last.day === day) last.entries.push(e);
    else groups.push({ id: e.id, kind: e.kind, who: e.who, day, entries: [e] });
  }
  return groups;
}

function Entry({ e, nested = false }: { e: ActivityEntry; nested?: boolean }) {
  const Icon = ICON[e.kind];
  return (
    <li className={cn("flex min-h-9 items-start gap-2.5 rounded-md px-2 py-2", nested && "py-1.5 pl-9")}>
      {!nested && (
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs bg-fill-hover text-fg-secondary shadow-ring" aria-hidden>
          <Icon className="size-3" />
        </span>
      )}
      <p className={cn("min-w-0 flex-1", nested && "text-fg-secondary")}>
        {!nested && <span className="font-medium">{e.who} </span>}
        <span className={nested ? "" : "text-fg-secondary"}>{nested ? without(e.text) : e.text}</span>
        <span className="block text-xs text-fg-muted tabular-nums sm:hidden">{e.timeText}</span>
      </p>
      <time dateTime={e.time} className="shrink-0 pt-px text-xs text-fg-muted tabular-nums max-sm:hidden">
        {nested ? e.timeText.split(", ")[1] : e.timeText}
      </time>
    </li>
  );
}

function GroupRow({ g }: { g: Group }) {
  const [open, setOpen] = useState(false);
  if (g.entries.length === 1) return <Entry e={g.entries[0]} />;
  const Icon = ICON[g.kind];
  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex min-h-9 w-full items-start gap-2.5 rounded-md px-2 py-2 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11"
      >
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs bg-fill-hover text-fg-secondary shadow-ring" aria-hidden>
          <Icon className="size-3" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="font-medium">{g.who} </span>
          <span className="text-fg-secondary">{SUMMARY[g.kind](g.entries.length)}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 pt-px text-xs text-fg-muted tabular-nums">
          {g.day}
          <ChevronRight aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-90")} />
        </span>
      </button>
      {open && (
        <ol>
          {g.entries.map((e) => (
            <Entry key={e.id} e={e} nested />
          ))}
        </ol>
      )}
    </li>
  );
}

/**
 * "Verlauf" of a record (Attio's "Activity" with "View all"): append only, newest first. Calmer in step 8a: entries of
 * one kind, day and role are one line that opens ("Abrechnung korrigierte 5 Felder, 19.10.2026"); the first groups show, the
 * rest after "Alle anzeigen".
 */
export function Activity({ entries, first = 4 }: { entries: ActivityEntry[]; first?: number }) {
  const [all, setAll] = useState(false);
  const groups = groupActivity(entries);
  const shown = all ? groups : groups.slice(0, first);
  if (entries.length === 0) return null;
  return (
    <section aria-label="Verlauf">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm text-fg-secondary">
          Verlauf <span className="text-fg-muted tabular-nums">{entries.length}</span>
        </h2>
        {groups.length > first && (
          <button
            type="button"
            onClick={() => setAll(!all)}
            className="flex h-7 items-center rounded-md px-2 text-xs text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
          >
            {all ? "Weniger anzeigen" : "Alle anzeigen"}
          </button>
        )}
      </div>
      <ol className="rounded-lg bg-surface px-1 py-1 shadow-ring">
        {shown.map((g) => (
          <GroupRow key={g.id} g={g} />
        ))}
      </ol>
    </section>
  );
}
