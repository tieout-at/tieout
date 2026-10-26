"use client";

import Link from "next/link";
import { CircleCheck, CircleCheckBig } from "lucide-react";
import { useSyncExternalStore } from "react";

import { SectionEmpty } from "@/components/shell/empty-state";
import { BUSINESS } from "@/lib/example";
import type { StartView } from "@/lib/kern-data";
import { useLive } from "@/lib/live";

const noSubscribe = () => () => {};

// The time of day exists only in the browser; the static HTML keeps the line empty so nothing jumps.
function useNow(): Date | null {
  const stamp = useSyncExternalStore(
    noSubscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  return stamp === null ? null : new Date(stamp * 60_000);
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "Guten Abend";
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function Greeting() {
  const now = useNow();
  return (
    <h1 className="min-h-6 px-1 text-xl font-semibold">
      {now ? `${greetingFor(now.getHours())}, ${BUSINESS.name}.` : <span className="sr-only">Start</span>}
    </h1>
  );
}

export function Today() {
  const now = useNow();
  if (!now) return null;
  const label = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long" }).format(now);
  return <span className="text-xs text-fg-secondary">Heute, {label}</span>;
}

/** The money of the business, from the core; after a decision in this browser the core's sums over it (live.ts). */
export function StartMoney({ built }: { built: StartView }) {
  const view = useLive()?.startView() ?? built;
  const cards = [
    { title: "zusätzlich verrechenbar", amount: view.extra, line: view.risk.cent ? `davon mit Kürzungsrisiko ${view.risk.text}` : null },
    { title: "in Klärung", amount: view.unclear, line: "Beleg fehlt oder Nachtrag nicht gelegt" },
  ];
  return (
    <section aria-label="Ergebnis" className="grid grid-cols-2 gap-2">
      {cards.map((c) => (
        <Link
          key={c.title}
          href="/funde/"
          className="flex flex-col gap-1 rounded-lg bg-surface px-4 py-3 shadow-ring outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="text-xs text-fg-secondary">{c.title}</span>
          <span className="text-xl font-semibold tabular-nums">{c.amount.text}</span>
          {c.line && <span className="text-xs text-fg-muted">{c.line.replace(/ €/g, "\u00a0€")}</span>}
        </Link>
      ))}
    </section>
  );
}

const STEP_ICON = { Prüfen: CircleCheck, Freigeben: CircleCheckBig } as const;

/** "Als Nächstes": the next check and the next release, each a jump to its find page. */
export function NextSteps({ built }: { built: StartView }) {
  const view = useLive()?.startView() ?? built;
  return (
    <section aria-labelledby="als-naechstes" className="flex flex-col gap-2">
      <h2 id="als-naechstes" className="flex h-7 items-center px-1 text-fg-secondary">
        Als Nächstes
      </h2>
      {view.next.length === 0 ? (
        <SectionEmpty title="Jeder Fund ist entschieden" text="Freigegebene Funde kommen mit der Schlussrechnung." />
      ) : (
        <ul className="rounded-lg bg-surface p-1 shadow-ring">
          {view.next.map((s) => {
            const Icon = STEP_ICON[s.step];
            const others = s.waiting - 1;
            return (
              <li key={s.step} className="[&:not(:last-child)]:shadow-line-bottom">
                <Link
                  href={s.find.href}
                  className="flex min-h-11 items-start gap-2.5 rounded-md px-2 py-2.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="flex gap-2">
                      <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{s.find.number}</span>
                      <span className="line-clamp-3">{s.find.name}</span>
                    </span>
                    <span className="text-xs text-fg-secondary">
                      {s.who} {s.step === "Prüfen" ? "prüft" : "gibt frei"} · {s.find.project.name}
                      {others > 0 ? `, danach ${others} ${others === 1 ? "weiterer Fund" : "weitere Funde"}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 tabular-nums">{s.find.amount.text}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
