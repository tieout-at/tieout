"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, SearchCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Activity } from "@/components/record/activity";
import { Highlights } from "@/components/record/highlights";
import { RecordHead } from "@/components/shell/record-head";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/components/zwilling/use-media";
import { currentState, decide, localTime, onStorageChange, readDecisions, type Decision } from "@/lib/decisions";
import type { FindRecord, SourceRef } from "@/lib/finds";
import { useLive } from "@/lib/live";
import type { ActivityEntry, Highlight } from "@/lib/records";
import { taskWords } from "@/lib/tasks";
import { useTasks } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";
import { DecisionBar } from "./decision-bar";
import { OriginalViewer } from "./original-viewer";
import { CalcPath, EvidenceList, WeakSpot } from "./sources";

const zeitText = (z: string) => `${z.slice(8, 10)}.${z.slice(5, 7)}.${z.slice(0, 4)}, ${z.slice(11, 16)}`;

const navButton =
  "flex size-7 items-center justify-center rounded-md text-fg-secondary shadow-button outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11";

/**
 * The find page (SPEZIFIKATION.md 4.2 and 7.3): Attio's record layout with the chat panel turned into the original.
 * Left: name, decision bar, highlights, weak spot, Rechenweg, Belege, Verlauf. Right (from 1024 px): the original of the
 * chosen source with its place marked; below 1024 px the original opens as a panel when a source is tapped.
 */
export function FindView({ record }: { record: FindRecord }) {
  const [source, setSource] = useState<SourceRef | null>(record.first);
  const [sheet, setSheet] = useState(false);
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const phone = useMediaQuery("(max-width: 767px)", false);
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

  const decisionCard: Highlight = {
    id: "entscheidung",
    title: "Entscheidung",
    value: record.decisionText[state],
    lines: last ? [`${last.wer}, ${zeitText(last.zeit)}`, ...(last.grund && last.stand === "nicht_verrechnen" ? [last.grund] : [])] : ["noch nicht geprüft"],
    status: state === "nicht_verrechnen" ? "grau" : state === "gefunden" ? undefined : "gruen",
  };

  const activity: ActivityEntry[] = [
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

  const open = (s: SourceRef) => {
    setSource(s);
    if (!wide) setSheet(true);
  };

  return (
    // shrink-0: the row grows with its content, so the original can stick to the top while the page scrolls
    <div className="flex min-h-full shrink-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <RecordHead icon={SearchCheck} badge={record.number} title={record.name} facts={record.facts} wrap>
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
          amount={record.amount}
          target={{ key: record.key, label: `${record.number} ${record.project.name}`, name: record.name, href: `/funde/${record.slug}/`, project: record.project.name, taskText: record.taskText, deadline: record.deadline }}
          open={[
            ...(record.risk && !record.risk.alreadyCut ? [`Kürzungsrisiko ${record.risk.reason}, ${record.risk.amount}`] : []),
            ...(record.remedy ? [record.remedy] : []),
            ...openTasks.map((t) => `Aufgabe für ${t.zustaendig}: ${t.text}`),
          ]}
          onDecide={(stand, wer, grund) => setDecisions(decide(keys, record.decision, { fundSchluessel: record.key, zeit: localTime(), wer, stand, ...(grund ? { grund } : {}) }).list)}
        />
        <div className="flex flex-col gap-6 px-6 pt-1 pb-10 max-md:px-4">
          <Highlights items={state === "gefunden" ? highlights : [...highlights, decisionCard]} title="Auf einen Blick" />
          <WeakSpot record={record} excluded={state === "nicht_verrechnen"} active={source} onOpen={open} />
          <CalcPath calc={record.calc} active={source} onOpen={open} />
          <EvidenceList evidence={record.evidence} active={source} onOpen={open} />
          <Link href={`/funde/${record.slug}/beweispaket/`} className="link-quiet w-fit text-fg-secondary">
            Beweispaket ansehen und drucken
          </Link>
          <Activity entries={activity} />
        </div>
      </div>

      {source && (
        <aside className="sticky top-0 h-[calc(100dvh-var(--header-height))] w-[400px] shrink-0 self-start shadow-[inset_1px_0_0_0_var(--color-line)] max-lg:hidden">
          <OriginalViewer key={`${source.page}|${source.place}`} source={source} originals={record.originals} />
        </aside>
      )}
      <Sheet open={!wide && sheet} onOpenChange={setSheet}>
        <SheetContent side={phone ? "bottom" : "right"} className={phone ? "h-[85dvh]" : ""}>
          <SheetTitle>Original</SheetTitle>
          {source && <OriginalViewer key={`${source.page}|${source.place}`} source={source} originals={record.originals} onClose={() => setSheet(false)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
