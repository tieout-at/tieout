"use client";

import Link from "next/link";
import { CalendarDays, Construction, FileCheck, FolderInput, Gavel, ShieldAlert, Shapes, SearchCheck, Text, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import type { FindRow } from "@/lib/kern-data";
import type { Calculation, View } from "@/lib/table";

const EVIDENCE: Record<NonNullable<FindRow["belegstand"]>["state"], { colour: TagColour; rank: number }> = {
  belegt: { colour: "green", rank: 0 },
  beleg_fehlt: { colour: "yellow", rank: 1 },
  nachtrag_nicht_gelegt: { colour: "orange", rank: 2 },
};

/**
 * "Funde" (SPEZIFIKATION.md 3.2 and 4.2): every find of the open projects with Art, Belegstand, Betrag, Kürzungsrisiko
 * from the Vorprüfung and Entscheidung. The footer keeps "zusätzlich verrechenbar" and "in Klärung" in two columns.
 */
export function FindsTable({ rows, calculations }: { rows: FindRow[]; calculations: Record<"amount" | "belegstand" | "risk", Calculation[]> }) {
  const columns: Column<FindRow>[] = [
    {
      id: "find",
      title: "Fund",
      icon: SearchCheck,
      width: 250,
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-1.5" title={r.title}>
          <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{r.number}</span>
          <span className="truncate">{r.title}</span>
        </span>
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
  const hidden = ["sources", "workDate"];
  const views: View[] = [
    { id: "alle", title: "Alle Funde", state: { sort: null, filters: [], hidden, calculations: sums } },
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

  return <DataTable name="funde" rows={rows} columns={columns} views={views} noun={{ one: "Fund", many: "Funde", dative: "Funden" }} />;
}
