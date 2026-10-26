"use client";

import Link from "next/link";
import { useState } from "react";
import { Building2, CalendarDays, CircleDot, Construction, FileSignature, Hourglass, Milestone, SearchCheck, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { DotText, PeekAction, PeekFacts, PeekFigure, PeekHeader } from "@/components/table/peek";
import { SideWindow } from "@/components/ui/side-window";
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
  const [peek, setPeek] = useState<string | null>(null);
  const peeked = rows.find((r) => r.id === peek) ?? null;
  const columns: Column<ProjectRow>[] = [
    {
      id: "name",
      title: "Projekt",
      icon: Construction,
      width: 226,
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
      width: 150,
      sortValue: (r) => r.client,
      filterValue: (r) => r.client,
      cell: (r) => <span className="truncate">{r.client}</span>,
    },
    {
      id: "extra",
      title: "Zusätzlich verrechenbar",
      icon: Wallet,
      width: 214,
      align: "right",
      sortValue: (r) => r.extra?.cent ?? null,
      calculations: calculations.extra,
      // money as a dot and its amount (step 8d): green belegt, as everywhere
      cell: (r) => r.extra && <DotText colour="var(--color-data-money)">{r.extra.text}</DotText>,
    },
    {
      id: "unclear",
      title: "In Klärung",
      icon: Hourglass,
      width: 130,
      align: "right",
      sortValue: (r) => r.unclear?.cent ?? null,
      calculations: calculations.unclear,
      cell: (r) => (r.unclear?.cent ? <DotText colour="var(--color-data-gap)">{r.unclear.text}</DotText> : r.unclear && <span className="text-fg-muted">nichts</span>),
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
      width: 440,
      sortValue: (r) => r.date?.iso ?? null,
      // the date as a chip with the status word and its dot (step 8d), so the deadline and how near it is read as one
      cell: (r) =>
        r.date ? (
          <Tag colour={COLOUR[r.status.colour]} className="min-w-0">
            <span className="text-fg-secondary">{r.status.text}, </span>
            {r.date.label} <span className="tabular-nums">{r.date.text}</span>
          </Tag>
        ) : (
          <Tag colour={COLOUR[r.status.colour]}>{r.status.text}</Tag>
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
    { id: "alle", title: "Alle Projekte", state: { sort: { column: "status", direction: "asc" }, filters: [], hidden: ["contractSum", "status", "stage"], calculations: sums } },
    {
      id: "offen",
      title: "Offene Projekte",
      state: { sort: { column: "date", direction: "asc" }, filters: [{ column: "stage", values: OPEN_STAGES }], hidden: ["contractSum", "status", "stage"], calculations: sums },
    },
  ];

  return (
    <>
    <DataTable
      onOpen={(r) => setPeek((cur) => (cur === r.id ? null : r.id))}
      openId={peek}
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
    <SideWindow open={peeked !== null} onClose={() => setPeek(null)} title="Projekt" width={400}>
      {peeked && (
        <div className="flex h-full min-h-0 flex-col overflow-y-auto">
          <PeekHeader title={peeked.name} sub={`${peeked.client}, ${peeked.stage}`} onClose={() => setPeek(null)} />
          {peeked.extra ? (
            <PeekFigure label="zusätzlich verrechenbar" value={peeked.extra.text} line={peeked.unclear?.cent ? `in Klärung ${peeked.unclear.text}, nicht addiert` : "nichts in Klärung"} />
          ) : (
            <PeekFigure label="Auftragssumme" value={peeked.contractSum.text} line="tieout gleicht hier nicht mehr ab" />
          )}
          <PeekFacts
            rows={[
              { label: "Status", value: <Tag colour={COLOUR[peeked.status.colour]}>{peeked.status.text}</Tag> },
              ...(peeked.date ? [{ label: peeked.date.label, value: peeked.date.text }] : []),
              ...(peeked.extra ? [{ label: "Funde", value: String(peeked.finds) }] : []),
              { label: "Auftraggeber", value: peeked.client },
              ...(peeked.extra ? [{ label: "Auftragssumme", value: peeked.contractSum.text }] : []),
            ]}
          />
          <PeekAction href={`/projekte/${peeked.slug}/`}>Projekt öffnen</PeekAction>
        </div>
      )}
    </SideWindow>
    </>
  );
}
