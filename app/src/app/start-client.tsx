"use client";

import Link from "next/link";
import { CircleCheck, CircleCheckBig } from "lucide-react";
import { useSyncExternalStore } from "react";

import { HBarChart } from "@/components/charts/axis-charts";
import { KpiRow } from "@/components/charts/kpi";
import { Legend } from "@/components/charts/legend";
import { SectionEmpty } from "@/components/shell/empty-state";
import { InfoTip } from "@/components/ui/info-tip";
import { cn } from "@/lib/utils";
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

/** The day the twin was compared, the same "Stand" as on every other page (not the day of the visit). */
export function AsOf({ text }: { text: string }) {
  return <span className="text-xs text-fg-muted tabular-nums">Stand {text}, Beispieldaten</span>;
}

/**
 * The money of the business (step 8d): two figures with a ring for their parts instead of a thin bar, never added.
 * From the core; after a decision in this browser the core's sums over it (live.ts).
 */
export function StartMoney({ built }: { built: StartView }) {
  const view = useLive()?.startView() ?? built;
  return (
    <KpiRow
      items={[
        {
          id: "extra",
          label: "zusätzlich verrechenbar",
          value: view.extra.text,
          lead: true,
          href: "/funde/",
          lines: view.risk.cent ? [{ text: `davon mit Kürzungsrisiko ${view.risk.text}`, tone: "risk" }] : [{ text: "ohne Kürzungsrisiko" }],
        },
        {
          id: "unclear",
          label: "in Klärung, nicht addiert",
          value: view.unclear.text,
          lead: true,
          href: "/funde/",
          lines: [
            ...(view.gap.cent ? [{ text: `Beleg fehlt ${view.gap.text}`, tone: "gap" as const }] : []),
            ...(view.change.cent ? [{ text: `Nachtrag nicht gelegt ${view.change.text}`, tone: "change" as const }] : []),
          ],
        },
      ]}
    />
  );
}

const DOT_COLOUR = { rot: "bg-state-red", gelb: "bg-state-yellow", gruen: "bg-state-green", grau: "bg-state-grey" } as const;

/**
 * "Geld je Projekt" (step 8d, asked for by the Geschäftsführer in test 8c): one row per open project on a real axis,
 * "zusätzlich verrechenbar" with its Kürzungsrisiko hatched, and under it, apart, "in Klärung" in its two parts.
 */
export function ProjectMoney({ built }: { built: StartView }) {
  const view = useLive()?.startView() ?? built;
  return (
    <section aria-labelledby="geld-je-projekt" className="flex flex-col rounded-xl bg-surface shadow-ring">
      <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 pt-4 pb-1">
        <h2 id="geld-je-projekt" className="flex items-center gap-1.5 text-fg-secondary">
          Geld je Projekt
          <InfoTip label="Geld je Projekt">Je offenem Projekt die belegten Funde (zusätzlich verrechenbar) und darunter, getrennt, was noch in Klärung ist. Die beiden werden nie addiert. Schraffiert: der Teil mit Kürzungsrisiko.</InfoTip>
        </h2>
        <Legend
          items={[
            { tone: "money", label: "zusätzlich verrechenbar" },
            { tone: "risk", label: "davon mit Kürzungsrisiko", hatched: true },
            { tone: "gap", label: "Beleg fehlt" },
            { tone: "change", label: "Nachtrag nicht gelegt" },
          ]}
        />
      </header>
      <div className="px-3 pt-2 pb-3">
        <HBarChart
          label="Geld je Projekt"
          groups={view.projects.map((p) => ({
            id: p.id,
            name: p.name,
            href: p.href,
            sub: p.date ? (
              <span className="flex items-center gap-1.5">
                {(p.status.colour === "rot" || p.status.colour === "gelb") && <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", DOT_COLOUR[p.status.colour])} />}
                {p.date.label === "Schlussrechnung legen bis" ? `Schlussrechnung legen bis ${p.date.text}` : `${p.date.label} ${p.date.text}`}
              </span>
            ) : (
              p.client
            ),
            bars: [
              {
                id: "extra",
                label: "zusätzlich verrechenbar",
                text: p.extra.text,
                parts: [
                  { id: "risk", label: "mit Kürzungsrisiko", cent: p.risk.cent, text: p.risk.text, tone: "risk", hatched: true },
                  { id: "money", label: "ohne Kürzungsrisiko", cent: Math.max(0, p.extra.cent - p.risk.cent), text: "", tone: "money" },
                ],
              },
              ...(p.unclear.cent
                ? [
                    {
                      id: "unclear",
                      label: "in Klärung",
                      text: p.unclear.text,
                      parts: [
                        { id: "gap", label: "Beleg fehlt", cent: p.gap.cent, text: p.gap.text, tone: "gap" as const },
                        { id: "change", label: "Nachtrag nicht gelegt", cent: p.change.cent, text: p.change.text, tone: "change" as const },
                      ],
                    },
                  ]
                : []),
            ],
          }))}
        />
      </div>
      {view.closed > 0 && (
        <footer className="px-5 py-2.5 text-xs text-fg-secondary shadow-[inset_0_1px_0_0_var(--color-line)]">
          <Link href="/projekte/" className="link-quiet">
            {view.closed === 1 ? "1 abgeschlossenes Projekt" : `${view.closed} abgeschlossene Projekte`}
          </Link>
          , dort gleicht tieout nicht mehr ab.
        </footer>
      )}
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
                      {s.who} {s.step === "Prüfen" ? "prüft" : "gibt frei"} · {s.find.project.name}{s.deadline ? `, ${s.deadline}` : ""}
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
