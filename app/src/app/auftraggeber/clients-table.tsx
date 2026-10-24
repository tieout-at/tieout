"use client";

import Link from "next/link";
import { Briefcase, Clock, Construction, FilePlus2, Landmark, Scissors, TicketMinus } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag } from "@/components/table/tag";
import type { ClientRow } from "@/lib/kern-data";
import type { View } from "@/lib/table";

/**
 * "Auftraggeber" (SPEZIFIKATION.md 2.2): per Auftraggeber the projects and what the documents of all projects show,
 * cuts, deductions without a contract item, Nachträge and days until the final payment. Facts only, no assessment.
 */
export function ClientsTable({ rows }: { rows: ClientRow[] }) {
  const columns: Column<ClientRow>[] = [
    {
      id: "name",
      title: "Auftraggeber",
      icon: Briefcase,
      width: 250,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link
          href={`/auftraggeber/${r.slug}/`}
          className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
        >
          <Briefcase className="size-4 shrink-0 text-fg-secondary" aria-hidden />
          <span className="truncate">{r.name}</span>
        </Link>
      ),
    },
    {
      id: "kind",
      title: "Art",
      icon: Landmark,
      width: 230,
      sortValue: (r) => r.kind,
      filterValue: (r) => r.kind,
      cell: (r) => <Tag>{r.kind}</Tag>,
    },
    {
      id: "projects",
      title: "Projekte",
      icon: Construction,
      width: 190,
      align: "right",
      sortValue: (r) => r.projects,
      cell: (r) => (
        <span className="flex min-w-0 items-baseline justify-end gap-1.5">
          {r.closed > 0 && <span className="truncate text-fg-secondary">{r.closed} abgeschlossen</span>}
          <span className="tabular-nums">{r.projects}</span>
        </span>
      ),
    },
    {
      id: "cuts",
      title: "Kürzungen",
      icon: Scissors,
      width: 250,
      align: "right",
      sortValue: (r) => r.cuts?.cent ?? null,
      cell: (r) =>
        r.cuts && (
          <span className="flex min-w-0 items-baseline justify-end gap-1.5">
            <span className="truncate text-fg-secondary">{r.cuts.projects === 1 ? "1 Projekt" : `${r.cuts.projects} Projekte`}</span>
            <span className="tabular-nums">{r.cuts.text}</span>
          </span>
        ),
    },
    {
      id: "deductions",
      title: "Abzug ohne Vertragspunkt",
      icon: TicketMinus,
      width: 260,
      align: "right",
      sortValue: (r) => r.deductions?.cent ?? null,
      cell: (r) =>
        r.deductions && (
          <span className="flex min-w-0 items-baseline justify-end gap-1.5">
            <span className="truncate text-fg-secondary">{r.deductions.projects === 1 ? "1 Projekt" : `${r.deductions.projects} Projekte`}</span>
            <span className="tabular-nums">{r.deductions.text}</span>
          </span>
        ),
    },
    {
      id: "changeOrders",
      title: "Nachträge beauftragt",
      icon: FilePlus2,
      width: 210,
      align: "right",
      sortValue: (r) => r.changeOrders?.offered ?? null,
      cell: (r) =>
        r.changeOrders && (
          <span className="flex min-w-0 items-baseline justify-end gap-1.5">
            {r.changeOrders.share && <span className="truncate text-fg-secondary">{r.changeOrders.share} des Betrags</span>}
            <span className="tabular-nums">{r.changeOrders.text}</span>
          </span>
        ),
    },
    {
      id: "paymentDays",
      title: "Tage bis Schlusszahlung",
      icon: Clock,
      width: 300,
      align: "right",
      sortValue: (r) => r.paymentDays[0]?.days ?? null,
      cell: (r) =>
        r.paymentDays.length > 0 && (
          <span className="flex min-w-0 items-baseline justify-end gap-1.5">
            <span className="truncate text-fg-secondary">{r.paymentDays.map((p) => p.project).join(", ")}</span>
            <span className="tabular-nums">{r.paymentDays.map((p) => p.days).join(", ")}</span>
          </span>
        ),
    },
  ];

  const views: View[] = [{ id: "alle", title: "Alle Auftraggeber", state: { sort: { column: "projects", direction: "desc" }, filters: [], hidden: [], calculations: {} } }];

  return <DataTable name="auftraggeber" rows={rows} columns={columns} views={views} noun={{ one: "Auftraggeber", many: "Auftraggeber", dative: "Auftraggebern" }} />;
}
