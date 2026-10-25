"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarDays, Construction, FileCheck, FolderInput, Gavel, ShieldAlert, Shapes, SearchCheck, Text, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import { currentState, decide, DECISION_TEXT, localTime, onStorageChange, readDecisions, readTasks, type Decision, type Task } from "@/lib/decisions";
import type { FindRow } from "@/lib/kern-data";
import type { Calculation, View } from "@/lib/table";
import { FindsBoard } from "./finds-board";

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
  rows,
  calculations,
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
  // a decision made in this browser shows at once; a find set to "Nicht verrechnen" here leaves its group, so no fixed sum of
  // `kern/` (which still counts it) fits any more and the footer says "keine feste Summe"
  const shown = decisions.length
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
      width: 250,
      sortValue: (r) => r.title,
      cell: (r) => (
        <Link
          href={r.href}
          title={r.title}
          className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
        >
          <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{r.number}</span>
          <span className="truncate">{r.title}</span>
        </Link>
      ),
    },
    {
      id: "amount",
      title: "Betrag",
      icon: Wallet,
      width: 256,
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
      id: "risk",
      title: "Kürzungsrisiko",
      icon: ShieldAlert,
      width: 330,
      sortValue: (r) => r.risk?.amount.cent ?? null,
      filterValue: (r) => r.risk?.reason ?? null,
      calculations: calculations.risk,
      cell: (r) =>
        r.risk && (
          <span className="flex min-w-0 gap-1.5" title={`${r.risk.number}: ${r.risk.reason}`}>
            <span className="truncate">{r.risk.reason}</span>
            <span className="shrink-0 text-fg-secondary tabular-nums">{r.risk.alreadyCut ? `schon gekürzt ${r.risk.amount.text}` : r.risk.amount.text}</span>
          </span>
        ),
    },
    {
      id: "project",
      title: "Projekt",
      icon: Construction,
      width: 200,
      sortValue: (r) => r.project.name,
      filterValue: (r) => r.project.name,
      cell: (r) => (
        <Link href={`/projekte/${r.project.slug}/`} className="-mx-1 truncate rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
          {r.project.name}
        </Link>
      ),
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
      id: "decision",
      title: "Entscheidung",
      icon: Gavel,
      width: 160,
      sortValue: (r) => r.decision,
      filterValue: (r) => r.decision,
      cell: (r) => <Tag>{r.decision}</Tag>,
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
  const hidden = project ? ["sources", "workDate", "project"] : ["sources", "workDate"];
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
      phoneRow={(r) => <PhoneRow row={r} withProject={!project} />}
      board={(visible) => (
        <FindsBoard
          rows={visible}
          calculations={calculations.amount.filter((c) => c.id === "zusaetzlich" || c.id === "klaerung")}
          stateOf={stateOf}
          tasksOf={(r) => tasksOf(r).length}
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

/**
 * A find in the phone list (below 768 px, customer test 2: the wide table showed four letters of the name): number,
 * the short name with the word that matters and the amount on top, then Belegstand and Entscheidung, then where it
 * belongs and what it risks. The whole row opens the find page.
 */
function PhoneRow({ row, withProject }: { row: FindRow; withProject: boolean }) {
  const facts = [
    ...(withProject ? [row.project.name] : []),
    row.kind,
    ...(row.risk ? [row.risk.alreadyCut ? `schon gekürzt ${row.risk.amount.text}` : `Kürzungsrisiko ${row.risk.amount.text}`] : []),
  ];
  return (
    <Link href={row.href} className="flex flex-col gap-1.5 px-4 py-3 outline-none active:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
      <span className="flex items-start gap-2">
        <span className="mt-px flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{row.number}</span>
        <span className="line-clamp-2 min-w-0 flex-1">{row.name}</span>
        <span className="shrink-0 whitespace-nowrap tabular-nums">{row.amount.text}</span>
      </span>
      <span className="flex flex-wrap items-center gap-1.5 pl-9">
        {row.belegstand && <Tag colour={EVIDENCE[row.belegstand.state].colour}>{row.belegstand.text}</Tag>}
        <Tag>{row.decision}</Tag>
      </span>
      <span className="line-clamp-2 pl-9 text-xs text-fg-secondary">{facts.join(" · ")}</span>
    </Link>
  );
}
