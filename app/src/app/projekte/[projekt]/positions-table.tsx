"use client";

import Link from "next/link";
import { Coins, FileCheck, Grid3x3, Hash, Layers, ListOrdered, PackageCheck, ReceiptText, ScanSearch, SearchCheck, Shapes, TriangleAlert, Wallet } from "lucide-react";

import { useState } from "react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import { useLive } from "@/lib/live";
import type { PositionRow, PositionsView } from "@/lib/positions-shared";
import type { View } from "@/lib/table";
import type { TaskTarget } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import { CoverageMatrix, PositionWindow } from "./coverage-matrix";

const DOT = { belegt: "bg-data-money", beleg_fehlt: "bg-data-gap", nachtrag_nicht_gelegt: "bg-data-change" } as const;

const EVIDENCE: Record<NonNullable<PositionRow["belegstand"]>["state"], { colour: TagColour; rank: number }> = {
  belegt: { colour: "green", rank: 0 },
  beleg_fehlt: { colour: "yellow", rank: 1 },
  nachtrag_nicht_gelegt: { colour: "orange", rank: 2 },
};

function FindChip({ find }: { find: NonNullable<PositionRow["find"]> }) {
  return (
    <Link
      href={find.href}
      className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring outline-none hover:bg-fill-selected focus-visible:outline-2 focus-visible:outline-accent"
    >
      {find.number}
    </Link>
  );
}

/** Number in the brand's mono and the short text, then the chip of its find; a service without a position is named by itself. */
function PositionName({ r }: { r: PositionRow }) {
  return (
    <span className="flex min-w-0 flex-1 items-center gap-2">
      {r.number && <span className="shrink-0 font-mono text-xs text-fg-secondary">{r.number}</span>}
      <span className="min-w-0 flex-1 truncate" title={r.number ? `${r.number} ${r.text}` : r.text}>
        {r.text}
      </span>
      {r.find && <FindChip find={r.find} />}
    </span>
  );
}

/** A quantity cell; the hours of a Regiebericht are long, so they take the small size instead of being cut. */
const Quantity = ({ text }: { text: string }) => (
  <span className={cn("truncate", text.length > 14 && "text-xs")} title={text}>
    {text}
  </span>
);

/**
 * Project tab "Positionen" (SPEZIFIKATION.md 2.3): the website table "beauftragt, erbracht, verrechnet" with what is open.
 * The view "Offen" leads (the rows a find lies in); "Auffällig" adds the rows above the Leistungsverzeichnis or not
 * measured; "Alle Positionen" is the whole Leistungsverzeichnis. The footer keeps "zusätzlich verrechenbar" and
 * "in Klärung" apart, both the core's.
 */
export function PositionsTable({ built, projektId, project, targets }: { built: PositionsView; projektId: string; project: string; targets: Record<string, TaskTarget> }) {
  const live = useLive();
  const view = (live && live.positionsView(projektId)) || built;
  const { rows, calculations } = view;
  const [peek, setPeek] = useState<string | null>(null);

  const columns: Column<PositionRow>[] = [
    {
      id: "position",
      title: "Position",
      icon: ListOrdered,
      width: 274,
      sortValue: (r) => r.order,
      cell: (r) => <PositionName r={r} />,
    },
    {
      id: "find",
      title: "Fund",
      icon: SearchCheck,
      width: 110,
      sortValue: (r) => (r.find ? Number(r.find.number.slice(1)) : null),
      filterValue: (r) => (r.find ? "mit Fund" : "ohne Fund"),
      cell: (r) => r.find && <FindChip find={r.find} />,
    },
    // widths so that at 1440 px every head and value of the view "Offen" fits without cutting (step 8d)
    { id: "ordered", title: "Beauftragt", icon: ReceiptText, width: 112, align: "right", cell: (r) => <Quantity text={r.ordered} /> },
    { id: "done", title: "Erbracht", icon: PackageCheck, width: 156, align: "right", sortValue: (r) => r.doneValue, cell: (r) => <Quantity text={r.done} /> },
    { id: "invoiced", title: "Verrechnet", icon: ReceiptText, width: 112, align: "right", cell: (r) => <Quantity text={r.invoiced} /> },
    {
      id: "open",
      title: "Offen",
      icon: Wallet,
      width: 128,
      align: "right",
      sortValue: (r) => r.open?.cent ?? null,
      filterValue: (r) => (r.open ? "ja" : "nein"),
      calculations: calculations.open,
      alsoSum: "klaerung",
      cell: (r) => r.open?.text,
    },
    {
      id: "risk",
      title: "Kürzungsrisiko",
      icon: TriangleAlert,
      width: 130,
      align: "right",
      sortValue: (r) => (r.risk ? 0 : 1),
      filterValue: (r) => r.risk?.reason ?? null,
      // the part amount where only a part of the row is at risk (Regiebericht 9), else the whole row; the reason on hover and in the window
      cell: (r) =>
        r.risk && (
          <span className="flex items-center gap-1.5 whitespace-nowrap" title={`Kürzungsrisiko: ${r.risk.reason}`}>
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-data-risk" />
            <span className={cn("tabular-nums", !r.risk.part && "text-fg-secondary")}>{r.risk.part ? r.risk.amount : "ganze Position"}</span>
          </span>
        ),
    },
    {
      id: "belegstand",
      title: "Belegstand",
      icon: FileCheck,
      width: 188,
      sortValue: (r) => (r.belegstand ? EVIDENCE[r.belegstand.state].rank : null),
      filterValue: (r) => r.belegstand?.text ?? null,
      calculations: calculations.belegstand,
      // every Belegstand written with its dot, never cut; the Kürzungsrisiko has its own column
      cell: (r) =>
        r.belegstand && (
          <span className="flex shrink-0 items-center gap-1.5 whitespace-nowrap">
            <span aria-hidden className={cn("size-2 rounded-full", DOT[r.belegstand.state])} />
            {r.belegstand.text}
          </span>
        ),
    },
    {
      id: "note",
      title: "Auffällig",
      icon: TriangleAlert,
      width: 192,
      sortValue: (r) => r.note,
      filterValue: (r) => (r.note ? r.note.split(",")[0] : null),
      cell: (r) => r.note && <span className="truncate text-fg-secondary" title={r.note}>{r.note}</span>,
    },
    {
      id: "group",
      title: "Leistungsgruppe",
      icon: Layers,
      width: 220,
      sortValue: (r) => r.group,
      filterValue: (r) => r.group,
      cell: (r) => <span className="truncate">{r.group}</span>,
    },
    { id: "kind", title: "Art", icon: Shapes, width: 180, sortValue: (r) => r.kind, filterValue: (r) => r.kind, cell: (r) => <span className="truncate">{r.kind}</span> },
    { id: "price", title: "Einheitspreis", icon: Coins, width: 160, align: "right", sortValue: (r) => r.price?.cent ?? null, cell: (r) => r.price?.text },
    {
      id: "check",
      title: "Belegabdeckung",
      icon: ScanSearch,
      width: 220,
      sortValue: (r) => (r.check === "luecke" ? 0 : r.check === "risiko" ? 1 : 2),
      filterValue: (r) => (r.check || r.find ? "mit Fund oder Lücke" : "ohne Auffälligkeit"),
      cell: (r) => (r.check === "luecke" ? "Lücke" : r.check === "risiko" ? "Kürzungsrisiko" : null),
    },
    { id: "unit", title: "Einheit", icon: Hash, width: 110, sortValue: (r) => r.unit, filterValue: (r) => r.unit, cell: (r) => r.unit },
  ];

  // the find is a chip in the row's name; its column stays for sorting and the filter "mit Fund"
  const hidden = ["find", "group", "kind", "price", "unit", "check"];
  const calc = { open: "zusaetzlich", belegstand: null };
  const lvOrder = { column: "position", direction: "asc" } as const;
  // the number of entries stands in the view's name, so the answer shows before the click
  const count = (f: (r: PositionRow) => boolean) => rows.filter(f).length;
  const views: View[] = [
    // each view shows the column that answers it: Belegstand for what is open, the reason for what stands out
    { id: "offen", title: `Offen ${count((r) => !!r.open)}`, state: { sort: lvOrder, filters: [{ column: "open", values: ["ja"] }], hidden: [...hidden, "note"], calculations: calc } },
    {
      id: "auffaellig",
      title: `Auffällig ${count((r) => !!r.note)}`,
      state: { sort: lvOrder, filters: [{ column: "note", values: ["mehr als beauftragt", "nicht aufgemessen", "nach der letzten Abschlagsrechnung"] }], hidden: [...hidden, "belegstand"], calculations: calc },
    },
    { id: "alle", title: `Alle Positionen ${rows.length}`, state: { sort: lvOrder, filters: [], hidden, calculations: calc } },
    {
      id: "abdeckung",
      title: `Belegabdeckung ${count((r) => !!r.check || !!r.find)}`,
      kind: "board",
      icon: Grid3x3,
      state: { sort: lvOrder, filters: [{ column: "check", values: ["mit Fund oder Lücke"] }], hidden, calculations: calc },
    },
  ];

  return (
    <>
    <DataTable
      onOpen={(r) => setPeek((cur) => (cur === r.id ? null : r.id))}
      openId={peek}
      name={`positionen.${project}`}
      rows={rows}
      columns={columns}
      views={views}
      noun={{ one: "Eintrag", many: "Einträge", dative: "Einträgen" }}
      selectable={false}
      sumsBelow
      board={(visible) => <CoverageMatrix rows={visible} view={view} targets={targets} project={project} />}
      phoneRow={(r) => (
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => !(e.target as HTMLElement).closest("a") && setPeek(r.id)}
          onKeyDown={(e) => e.key === "Enter" && setPeek(r.id)}
          className="flex flex-col gap-1 px-4 py-2.5 outline-none active:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          <span className="flex items-start gap-2">
            <span className="line-clamp-2 min-w-0 flex-1">
              {r.number && <span className="mr-1.5 font-mono text-xs text-fg-secondary">{r.number}</span>}
              {r.text}
            </span>
            {r.find && <FindChip find={r.find} />}
            {r.open && <span className="shrink-0 whitespace-nowrap tabular-nums">{r.open.text}</span>}
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-secondary">
            {r.ordered && <span>beauftragt {r.ordered}</span>}
            {r.done && <span>erbracht {r.done}</span>}
            {r.invoiced && <span>verrechnet {r.invoiced}</span>}
            {r.belegstand && <Tag colour={EVIDENCE[r.belegstand.state].colour}>{r.belegstand.text}</Tag>}
            {/* the reason once in the window, not four times down the list of one find */}
            {r.risk && (
              <span className="flex items-center gap-1">
                <span aria-hidden className="size-2 rounded-full bg-data-risk" />
                Kürzungsrisiko{r.risk.part ? ` ${r.risk.amount}` : ""}
              </span>
            )}
            {r.note && <span>{r.note}</span>}
          </span>
        </div>
      )}
    />
    <PositionWindow rows={rows} chosen={rows.find((r) => r.id === peek) ?? null} onOpen={setPeek} targets={targets} project={project} />
    </>
  );
}
