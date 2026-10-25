"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Construction, FileCheck, FolderInput, Gavel, ShieldAlert, Shapes, SearchCheck, Text, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import { currentState, decide, DECISION_TEXT, localTime, onStorageChange, readDecisions, readTasks, type Decision, type Task } from "@/lib/decisions";
import type { FindRow } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { Calculation, View } from "@/lib/table";
import { FindsBoard, PhoneRow, RiskText } from "./finds-board";

const EVIDENCE: Record<NonNullable<FindRow["belegstand"]>["state"], { colour: TagColour; rank: number }> = {
  belegt: { colour: "green", rank: 0 },
  beleg_fehlt: { colour: "yellow", rank: 1 },
  nachtrag_nicht_gelegt: { colour: "orange", rank: 2 },
};

/**
 * "Funde" (SPEZIFIKATION.md 3.2 and 4.2): every find of the open projects with Art, Belegstand, Betrag, Kürzungsrisiko
 * from the Vorprüfung and Entscheidung. The footer keeps "zusätzlich verrechenbar" and "in Klärung" in two columns.
 * The view "Nach Entscheidung" shows the same finds as a board (Attio's "Pipeline"), where moving a card decides.
 */
export function FindsTable({
  rows: built,
  calculations: builtCalculations,
  project,
}: {
  rows: FindRow[];
  calculations: Record<"amount" | "belegstand" | "risk", Calculation[]>;
  /** On a project page: the project column is hidden and the view is remembered per project. */
  project?: string;
}) {
  // decisions recorded in this browser replace the core's state after the first paint (stage 0, until the backend)
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  useEffect(() => {
    const load = () => {
      setDecisions(readDecisions());
      setTasks(readTasks());
    };
    load();
    return onStorageChange(load);
  }, []);
  const keys = (r: FindRow) => [r.id, ...r.earlierIds];
  const stateOf = (r: FindRow) => currentState(decisions, keys(r), r.decisionState);
  const tasksOf = (r: FindRow) => tasks.filter((t) => keys(r).includes(t.fundSchluessel));
  // with a decision in this browser the core runs here too (live.ts): rows, groups and sums over these decisions
  const live = useLive();
  const rows = live ? live.findRows().filter((r) => !project || r.project.slug === project) : built;
  const calculations = live ? live.findCalculations() : builtCalculations;
  const reasonOf = (r: FindRow) =>
    decisions
      .filter((d) => keys(r).includes(d.fundSchluessel) && d.stand === "nicht_verrechnen")
      .sort((a, b) => a.zeit.localeCompare(b.zeit))
      .at(-1)?.grund ?? null;
  // until the core is loaded, a decision made here shows at once; a find set to "Nicht verrechnen" leaves its group, so
  // no fixed sum fits it for that moment and the footer says "nicht gerechnet"
  const shown = decisions.length && !live
    ? rows.map((r) => {
        const state = stateOf(r);
        return { ...r, decision: DECISION_TEXT[state], groups: state === "nicht_verrechnen" ? [] : r.countedGroups };
      })
    : rows;

  const columns: Column<FindRow>[] = [
    {
      id: "find",
      title: "Fund",
      icon: SearchCheck,
      width: 270,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={r.href}
          title={r.title}
          className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{r.number}</span>
          <span className="truncate">{r.name}</span>
        </Link>
      ),
    },
    {
      id: "project",
      title: "Projekt",
      icon: Construction,
      width: 180,
      sortValue: (r) => r.project.name,
      filterValue: (r) => r.project.name,
      cell: (r) => (
        <Link href={`/projekte/${r.project.slug}/`} className="-mx-1 truncate rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
          {r.project.name}
        </Link>
      ),
    },
    {
      id: "amount",
      title: "Betrag",
      icon: Wallet,
      width: 260,
      align: "right",
      sortValue: (r) => r.amount.cent,
      calculations: calculations.amount,
      cell: (r) => r.amount.text,
    },
    {
      id: "belegstand",
      title: "Belegstand",
      icon: FileCheck,
      width: 200,
      sortValue: (r) => (r.belegstand ? EVIDENCE[r.belegstand.state].rank : null),
      filterValue: (r) => r.belegstand?.text ?? null,
      calculations: calculations.belegstand,
      cell: (r) => r.belegstand && <Tag colour={EVIDENCE[r.belegstand.state].colour}>{r.belegstand.text}</Tag>,
    },
    {
      id: "decision",
      title: "Entscheidung",
      icon: Gavel,
      width: 170,
      sortValue: (r) => r.decision,
      filterValue: (r) => r.decision,
      cell: (r) => <Tag>{r.decision}</Tag>,
    },
    {
      id: "risk",
      title: "Kürzungsrisiko",
      icon: ShieldAlert,
      width: 270,
      sortValue: (r) => r.risk?.amount.cent ?? null,
      filterValue: (r) => r.risk?.reason ?? null,
      calculations: calculations.risk,
      cell: (r) => r.risk && <RiskText risk={r.risk} amount={r.amount} label={false} />,
    },
    {
      id: "kind",
      title: "Art",
      icon: Shapes,
      width: 220,
      sortValue: (r) => r.kind,
      filterValue: (r) => r.kind,
      cell: (r) => <span className="truncate">{r.kind}</span>,
    },
    {
      id: "detail",
      title: "Beschreibung",
      icon: Text,
      width: 320,
      cell: (r) => (
        <span className="truncate text-fg-secondary" title={r.detail}>
          {r.detail}
        </span>
      ),
    },
    {
      id: "sources",
      title: "Belegquelle",
      icon: FolderInput,
      width: 220,
      sortValue: (r) => r.sources.join(", "),
      cell: (r) => <span className="truncate">{r.sources.join(", ")}</span>,
    },
    {
      id: "workDate",
      title: "Arbeitsdatum",
      icon: CalendarDays,
      width: 160,
      sortValue: (r) => r.workDate.iso,
      cell: (r) => <span className="tabular-nums">{r.workDate.text}</span>,
    },
  ];

  const sums = { amount: "zusaetzlich", belegstand: "klaerung", risk: "risiko" };
  // the table shows what a decision needs; Art, Beschreibung, Belegquelle and Arbeitsdatum come back through "Ansicht" or "+"
  const hidden = project ? ["kind", "detail", "sources", "workDate", "project"] : ["kind", "detail", "sources", "workDate"];
  const views: View[] = [
    { id: "alle", title: "Alle Funde", state: { sort: null, filters: [], hidden, calculations: sums } },
    { id: "entscheidung", title: "Nach Entscheidung", kind: "board", state: { sort: null, filters: [], hidden, calculations: sums } },
    {
      id: "zusaetzlich",
      title: "Zusätzlich verrechenbar",
      state: { sort: { column: "amount", direction: "desc" }, filters: [{ column: "belegstand", values: ["belegt"] }], hidden, calculations: { ...sums, belegstand: null } },
    },
    {
      id: "klaerung",
      title: "In Klärung",
      state: {
        sort: { column: "amount", direction: "desc" },
        filters: [{ column: "belegstand", values: ["Beleg fehlt", "Nachtrag nicht gelegt"] }],
        hidden,
        calculations: { amount: "klaerung", belegstand: null, risk: null },
      },
    },
  ];

  return (
    <DataTable
      name={project ? `funde.${project}` : "funde"}
      rows={shown}
      columns={columns}
      views={views}
      noun={{ one: "Fund", many: "Funde", dative: "Funden" }}
      phoneRow={(r) => <PhoneRow row={r} withProject={!project} decision={r.decision} reason={stateOf(r) === "nicht_verrechnen" ? reasonOf(r) : null} />}
      board={(visible) => (
        <FindsBoard
          rows={visible}
          calculations={calculations.amount.filter((c) => c.id === "zusaetzlich" || c.id === "klaerung")}
          stateOf={stateOf}
          tasksOf={(r) => tasksOf(r).length}
          reasonOf={reasonOf}
          openOf={(r) => [
            ...(r.risk && !r.risk.alreadyCut ? [`Kürzungsrisiko ${r.risk.reason}, ${r.risk.amount.text}`] : []),
            ...(r.remedy ? [r.remedy] : []),
            ...tasksOf(r).map((t) => `Aufgabe für ${t.zustaendig}: ${t.text}`),
          ]}
          withProject={!project}
          onDecide={(r, move, grund) => {
            const { list, refused } = decide(keys(r), r.decisionState, { fundSchluessel: r.id, zeit: localTime(), wer: move.wer, stand: move.stand, ...(grund ? { grund } : {}) });
            setDecisions(list);
            return refused;
          }}
        />
      )}
    />
  );
}

