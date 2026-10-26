"use client";

import Link from "next/link";
import { Building2, CalendarDays, CircleDot, Construction, FileSignature, Hourglass, Milestone, SearchCheck, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import type { ProjectRow, StatusColour } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { Calculation, View } from "@/lib/table";

const COLOUR: Record<StatusColour, TagColour> = { rot: "red", gelb: "yellow", gruen: "green", grau: "grey" };

const OPEN_STAGES = ["in Ausführung", "Schlussrechnung vorbereiten"];

/** "Projekte" (SPEZIFIKATION.md 2.2 and 7.2): one row per project, amounts and status colour from `kern/`. */
export function ProjectsTable({ rows: built, calculations: builtCalculations }: { rows: ProjectRow[]; calculations: Record<"extra" | "unclear" | "contractSum", Calculation[]> }) {
  // with a decision in this browser the core runs here too (live.ts)
  const live = useLive();
  const rows = live ? live.projectRows() : built;
  const calculations = live ? live.projectCalculations() : builtCalculations;
  const columns: Column<ProjectRow>[] = [
    {
      id: "name",
      title: "Projekt",
      icon: Construction,
      width: 250,
      sortValue: (r) => r.name,
      cell: (r) => (
        <Link href={`/projekte/${r.slug}/`} className="-mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
          <Construction className="size-4 shrink-0 text-fg-secondary" aria-hidden />
          <span className="truncate">{r.name}</span>
        </Link>
      ),
    },
    {
      id: "client",
      title: "Auftraggeber",
      icon: Building2,
      width: 200,
      sortValue: (r) => r.client,
      filterValue: (r) => r.client,
      cell: (r) => <span className="truncate">{r.client}</span>,
    },
    {
      id: "extra",
      title: "Zusätzlich verrechenbar",
      icon: Wallet,
      width: 220,
      align: "right",
      sortValue: (r) => r.extra?.cent ?? null,
      calculations: calculations.extra,
      cell: (r) => r.extra?.text,
    },
    {
      id: "unclear",
      title: "In Klärung",
      icon: Hourglass,
      width: 180,
      align: "right",
      sortValue: (r) => r.unclear?.cent ?? null,
      calculations: calculations.unclear,
      cell: (r) => r.unclear?.text,
    },
    {
      id: "status",
      title: "Status",
      icon: CircleDot,
      width: 170,
      sortValue: (r) => r.status.rank,
      filterValue: (r) => r.status.text,
      cell: (r) => <Tag colour={COLOUR[r.status.colour]}>{r.status.text}</Tag>,
    },
    {
      id: "date",
      title: "Datum",
      icon: CalendarDays,
      width: 290,
      sortValue: (r) => r.date?.iso ?? null,
      cell: (r) =>
        r.date && (
          <span className="flex min-w-0 gap-1.5">
            <span className="truncate text-fg-secondary">{r.date.label}</span>
            <span className="tabular-nums">{r.date.text}</span>
          </span>
        ),
    },
    {
      id: "stage",
      title: "Stufe",
      icon: Milestone,
      width: 230,
      sortValue: (r) => r.stage,
      filterValue: (r) => r.stage,
      cell: (r) => <Tag>{r.stage}</Tag>,
    },
    {
      id: "finds",
      title: "Funde",
      icon: SearchCheck,
      width: 120,
      align: "right",
      sortValue: (r) => (r.extra === null ? null : r.finds),
      cell: (r) => (r.extra === null ? null : r.finds),
    },
    {
      id: "contractSum",
      title: "Auftragssumme",
      icon: FileSignature,
      width: 230,
      align: "right",
      sortValue: (r) => r.contractSum.cent,
      calculations: calculations.contractSum,
      cell: (r) => r.contractSum.text,
    },
  ];

  const sums = { extra: "summe", unclear: "summe", contractSum: "summe" };
  const views: View[] = [
    { id: "alle", title: "Alle Projekte", state: { sort: { column: "status", direction: "asc" }, filters: [], hidden: ["contractSum"], calculations: sums } },
    {
      id: "offen",
      title: "Offene Projekte",
      state: { sort: { column: "date", direction: "asc" }, filters: [{ column: "stage", values: OPEN_STAGES }], hidden: ["contractSum"], calculations: sums },
    },
  ];

  return (
    <DataTable
      name="projekte"
      rows={rows}
      columns={columns}
      views={views}
      noun={{ one: "Projekt", many: "Projekte", dative: "Projekten" }}
      phoneRow={(r) => (
        <Link href={`/projekte/${r.slug}/`} className="flex flex-col gap-1 px-4 py-3 outline-none active:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
          <span className="flex items-start gap-2">
            <Construction className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
            <span className="min-w-0 flex-1">{r.name}</span>
            {r.extra && <span className="shrink-0 tabular-nums">{r.extra.text}</span>}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-6 text-xs text-fg-secondary">
            <span>{r.client}</span>
            {r.date && (
              <span>
                {r.date.label} <span className="text-fg tabular-nums">{r.date.text}</span>
              </span>
            )}
            {r.unclear && r.unclear.cent > 0 && <span>in Klärung <span className="text-fg tabular-nums">{r.unclear.text}</span></span>}
          </span>
        </Link>
      )}
    />
  );
}
