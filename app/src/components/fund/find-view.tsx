"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, SearchCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Kpi, type KpiItem } from "@/components/charts/kpi";
import { Activity } from "@/components/record/activity";
import { GapWindow } from "@/components/schlussrechnung/gap-window";
import { RecordHead } from "@/components/shell/record-head";
import { SideWindow, toggleOpen, useSheetWidth } from "@/components/ui/side-window";
import { checkedBy } from "@/lib/decision-rules";
import { currentState, decide, gapBeforeRelease, localTime, onStorageChange, readDecisions, type Decision, type DecisionState } from "@/lib/decisions";
import type { FindRecord, SourceRef } from "@/lib/finds";
import { useLive } from "@/lib/live";
import type { ActivityEntry } from "@/lib/records";
import { taskWords } from "@/lib/tasks";
import { useTasks } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";
import { DecisionBar } from "./decision-bar";
import { OriginalViewer } from "./original-viewer";
import { CalcPath, EvidenceTiles, WeakSpot } from "./sources";

const zeitText = (z: string) => `${z.slice(8, 10)}.${z.slice(5, 7)}.${z.slice(0, 4)}, ${z.slice(11, 16)}`;
const sameSource = (a: SourceRef, b: SourceRef) => a.page === b.page && a.place === b.place;
/** Euro text to cents, only to size the ring of a partial Kürzungsrisiko (never shown). */
const cents = (t: string) => Number(t.replace(/[^\d,]/g, "").replace(",", ".")) * 100;

const navButton =
  "flex size-7 items-center justify-center rounded-md text-fg-secondary shadow-button outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11";

const STAND_TONE: Record<string, "money" | "gap" | "change" | undefined> = { belegt: "money", beleg_fehlt: "gap", nachtrag_nicht_gelegt: "change" };

const STEPS: { id: DecisionState; title: string }[] = [
  { id: "gefunden", title: "Gefunden" },
  { id: "geprueft", title: "Geprüft" },
  { id: "freigegeben", title: "Freigegeben" },
  { id: "in_schlussrechnung", title: "In der Schluss­rechnung" },
];

/**
 * The find page (SPEZIFIKATION.md 4.2 and 7.3, calmer in step 8d): name, decision bar, then one column with the figures
 * (Betrag with a ring for a partial Kürzungsrisiko, Belegstand, the decision as four steps), the weak spot as one
 * quiet line that opens, the Rechenweg with the quantities in words, the Belege as one list and the Verlauf. The original
 * is no longer built into the page: a source opens it in a window at the right, a second click on the same source, its X or Escape
 * closes it.
 */
export function FindView({ record }: { record: FindRecord }) {
  const [source, setSource] = useState<SourceRef | null>(null);
  const [gapKey, setGapKey] = useState<string | null>(null);
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const tasks = useTasks() ?? [];
  // with a decision in this browser the core runs here too (live.ts): the money word and the Kürzungsrisiko follow it
  const live = useLive();
  const highlights = live?.findHighlights(record.slug) ?? record.highlights;

  // the static page shows the core's state; what this browser recorded replaces it after the first paint
  useEffect(() => {
    const load = () => setDecisions(readDecisions());
    load();
    return onStorageChange(load);
  }, []);

  const keys = useMemo(() => [record.key, ...record.earlierKeys], [record]);
  const mine = decisions.filter((d) => keys.includes(d.fundSchluessel));
  const myTasks = tasks.filter((t) => keys.includes(t.fundSchluessel));
  const openTasks = myTasks.filter((t) => !t.done);
  const state = currentState(decisions, keys, record.decision);
  const last = mine.toSorted((a, b) => a.zeit.localeCompare(b.zeit)).at(-1);
  const excluded = state === "nicht_verrechnen";
  // by the number: a WhatsApp-Meldung that became a Regiebericht keeps its number, not its key
  const gaps = live && record.gaps[0] ? live.gapsView(record.gaps[0].project.id).filter((g) => g.find?.number === record.number) : record.gaps;

  const activity: ActivityEntry[] = [
    ...gaps.flatMap((g) =>
      g.closed
        ? [{ id: `eingang-${g.key}`, time: g.closed.at, timeText: g.closed.when, who: g.closed.who, text: `trug ein: ${g.sheet?.title ?? "Regiebericht"}, Unterschrift liegt vor`, kind: "entscheidung" as const }]
        : [],
    ),
    ...mine.map((d, i) => ({
      id: `entscheidung-${i}`,
      time: d.zeit,
      timeText: zeitText(d.zeit),
      who: d.wer,
      text: `setzte die Entscheidung auf ${record.decisionText[d.stand]}${d.grund ? `: ${d.grund}` : ""}`,
      kind: "entscheidung" as const,
    })),
    ...myTasks.map((t) => ({
      id: t.id,
      time: t.zeit,
      timeText: zeitText(t.zeit),
      who: t.wer,
      text: `legte eine Aufgabe für ${t.zustaendig} an: ${taskWords(t)}`,
      kind: "aufgabe" as const,
    })),
    // every tick, also a task opened again later: the Verlauf keeps both
    ...myTasks.flatMap((t) =>
      t.checks.map((c, i) => ({
        id: `${t.id}-erledigt-${i}`,
        time: c.zeit,
        timeText: zeitText(c.zeit),
        who: c.wer,
        text: `${c.erledigt ? "hakte die Aufgabe ab" : "öffnete die Aufgabe wieder"}: ${t.text.replace(/\.$/, "")}`,
        kind: c.erledigt ? ("erledigt" as const) : ("aufgabe" as const),
      })),
    ),
    ...record.activity,
  ].sort((x, y) => y.time.localeCompare(x.time) || y.id.localeCompare(x.id));

  // a click opens the original, a second click on the same source closes it again
  const open = useCallback((s: SourceRef) => setSource((cur) => toggleOpen(cur, s, sameSource)), []);
  const close = useCallback(() => setSource(null), []);
  const sheetWidth = useSheetWidth();

  const betrag = highlights.find((h) => h.id === "betrag");
  const stand = highlights.find((h) => h.id === "belegstand");
  const risk = record.risk && !record.risk.alreadyCut && !excluded ? record.risk : null;
  const partial = risk && risk.amount !== record.amount;
  const figures: KpiItem[] = [
    {
      id: "betrag",
      label: "Betrag",
      value: betrag?.value ?? record.amount,
      lead: true,
      lines: [
        ...(betrag?.lines ?? []).map((text) => ({ text })),
        ...(risk ? [{ text: partial ? `davon mit Kürzungsrisiko ${risk.amount}` : "ganz mit Kürzungsrisiko", tone: "risk" as const }] : []),
      ],
      // the ring only where the risk is a part of the amount (F2); a find wholly at risk says so in its line
      ring: partial
        ? {
            label: `Betrag ${record.amount}, davon mit Kürzungsrisiko ${risk.amount}`,
            parts: [
              { id: "risk", label: "mit Kürzungsrisiko", value: cents(risk.amount), tone: "risk", hatched: true },
              { id: "rest", label: "ohne Kürzungsrisiko", value: Math.max(0, cents(record.amount) - cents(risk.amount)), tone: "money" },
            ],
          }
        : undefined,
    },
    {
      id: "belegstand",
      label: "Belegstand",
      value: stand?.value ?? "keiner",
      lines: (stand?.lines ?? []).map((text) => ({ text, tone: STAND_TONE[record.belegstand?.state ?? ""] })),
    },
  ];

  return (
    // head, decision bar and content share one width, so "1 von 8" ends where the content ends
    <div className="flex min-h-full w-full max-w-[1000px] flex-col">
      <RecordHead icon={SearchCheck} badge={record.number} title={record.name} facts={[record.project.name, ...record.facts]} wrap>
        <span className="ml-auto flex shrink-0 items-center gap-1.5 pl-2 text-xs text-fg-secondary tabular-nums max-sm:hidden">
          <span className="whitespace-nowrap">
            {record.nav.index} von {record.nav.count}
          </span>
          {[
            { slug: record.nav.prev, label: "Voriger Fund", Icon: ChevronUp },
            { slug: record.nav.next, label: "Nächster Fund", Icon: ChevronDown },
          ].map(({ slug, label, Icon }) =>
            slug ? (
              <Link key={label} href={`/funde/${slug}/`} aria-label={label} className={navButton}>
                <Icon className="size-4" aria-hidden />
              </Link>
            ) : (
              <span key={label} aria-hidden className={cn(navButton, "opacity-40")}>
                <Icon className="size-4" />
              </span>
            ),
          )}
        </span>
      </RecordHead>
      <DecisionBar
        state={state}
        checker={checkedBy(decisions, keys)}
        amount={record.amount}
        target={{ key: record.key, label: `${record.number} ${record.project.name}`, name: record.name, href: `/funde/${record.slug}/`, project: record.project.name, taskText: record.taskText, deadline: record.deadline }}
        open={[
          ...(gapBeforeRelease(record.belegstand?.state) ? [gapBeforeRelease(record.belegstand?.state)!] : []),
          ...(record.risk && !record.risk.alreadyCut ? [`Kürzungsrisiko ${record.risk.reason}, ${record.risk.amount}`] : []),
          ...(record.remedy ? [record.remedy] : []),
          ...openTasks.map((t) => `Aufgabe für ${t.zustaendig}: ${t.text}`),
        ]}
        onDecide={(stand, wer, grund) => setDecisions(decide(keys, record.decision, { fundSchluessel: record.key, zeit: localTime(), wer, stand, ...(grund ? { grund } : {}) }).list)}
      />
      <div className="flex w-full flex-col gap-6 px-6 pt-2 pb-12 max-md:gap-5 max-md:px-4">
        {/* three columns only where the content is wide enough for the amount with its ring (customer test, 28.10.2026: at 800 px the ring lay on the amount) */}
        <section aria-label="Auf einen Blick" className="@container">
          <ul className="grid overflow-hidden rounded-xl bg-surface shadow-ring @4xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.5fr)]">
            {figures.map((k) => (
              <li key={k.id} className="min-w-0 shadow-[inset_-1px_-1px_0_0_var(--color-line)]">
                <Kpi k={k} />
              </li>
            ))}
            <li className="min-w-0 shadow-[inset_0_-1px_0_0_var(--color-line)]">
              <Steps state={state} who={last ? `${last.wer}, ${zeitText(last.zeit)}` : null} reason={last?.stand === "nicht_verrechnen" ? (last.grund ?? null) : null} />
            </li>
          </ul>
        </section>
        <WeakSpot record={record} excluded={excluded} active={source} onOpen={open} gaps={gaps} onGap={(g) => setGapKey(g.key)} />
        <CalcPath calc={record.calc} active={source} onOpen={open} />
        <EvidenceTiles evidence={record.evidence} active={source} onOpen={open} />
        <Link href={`/funde/${record.slug}/beweispaket/`} className="link-quiet w-fit text-fg-secondary">
          Beweispaket als PDF
        </Link>
        <Activity entries={activity} />
      </div>

      <GapWindow gap={gaps.find((g) => g.key === gapKey) ?? null} onClose={() => setGapKey(null)} />
      <SideWindow open={source !== null} onClose={close} title="Original" width={sheetWidth}>
        {source && <OriginalViewer key={`${source.page}|${source.place}`} source={source} originals={record.originals} onClose={close} />}
      </SideWindow>
    </div>
  );
}

/** Where the decision stands: four steps, the reached ones filled, the current one in ink; "Nicht verrechnen" apart. */
function Steps({ state, who, reason }: { state: DecisionState; who: string | null; reason: string | null }) {
  const at = STEPS.findIndex((s) => s.id === state);
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 py-3.5">
      <span className="text-xs text-fg-secondary">Entscheidung</span>
      {state === "nicht_verrechnen" ? (
        <span className="flex items-center gap-1.5 font-medium">
          <span aria-hidden className="size-2 rounded-full bg-state-grey" />
          Nicht verrechnen
        </span>
      ) : (
        <ol aria-label="Entscheidung" className="grid grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.id} aria-current={i === at ? "step" : undefined} className="relative flex min-w-0 flex-col gap-1.5">
              {/* a stepper: a dot per step, joined by a hairline, the reached steps filled */}
              {i < STEPS.length - 1 && <span aria-hidden className={cn("absolute top-[5px] left-3 right-0 h-px", i < at ? "bg-data-money" : "bg-line")} />}
              <span aria-hidden className={cn("relative size-2.5 rounded-full", i < at ? "bg-data-money" : i === at ? "bg-surface ring-2 ring-fg" : "bg-surface ring-1 ring-fg-faint")} />
              <span className={cn("pr-1 text-xs leading-4 [overflow-wrap:anywhere] hyphens-manual", i === at ? "font-medium text-fg" : "text-fg-muted")}>{s.title}</span>
            </li>
          ))}
        </ol>
      )}
      <span className="text-xs text-fg-muted">{reason ?? who ?? "noch nicht geprüft"}</span>
    </div>
  );
}
