"use client";

import Link from "next/link";
import { Coins, FileCheck, Grid3x3, Hash, Layers, ListOrdered, PackageCheck, ReceiptText, ScanSearch, SearchCheck, Shapes, TriangleAlert, Wallet } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import { useLive } from "@/lib/live";
import type { PositionRow, PositionsView } from "@/lib/positions-shared";
import type { View } from "@/lib/table";
import type { TaskTarget } from "@/lib/tasks";
import { CoverageMatrix } from "./coverage-matrix";

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

/** A quantity cell; hours of a Regiebericht are long, so a cut one keeps its full text on hover. */
const Quantity = ({ text }: { text: string }) => (
  <span className="truncate" title={text}>
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

  const columns: Column<PositionRow>[] = [
    {
      id: "position",
      title: "Position",
      icon: ListOrdered,
      width: 266,
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
    { id: "ordered", title: "Beauftragt", icon: ReceiptText, width: 120, align: "right", cell: (r) => <Quantity text={r.ordered} /> },
    { id: "done", title: "Erbracht", icon: PackageCheck, width: 206, align: "right", sortValue: (r) => r.doneValue, cell: (r) => <Quantity text={r.done} /> },
    { id: "invoiced", title: "Verrechnet", icon: ReceiptText, width: 130, align: "right", cell: (r) => <Quantity text={r.invoiced} /> },
    {
      id: "open",
      title: "Offen",
      icon: Wallet,
      width: 256,
      align: "right",
      sortValue: (r) => r.open?.cent ?? null,
      filterValue: (r) => (r.open ? "ja" : "nein"),
      calculations: calculations.open,
      cell: (r) => r.open?.text,
    },
    {
      id: "belegstand",
      title: "Belegstand",
      icon: FileCheck,
      width: 186,
      sortValue: (r) => (r.belegstand ? EVIDENCE[r.belegstand.state].rank : null),
      filterValue: (r) => r.belegstand?.text ?? null,
      calculations: calculations.belegstand,
      // "belegt" is the rule; only a gap is named (step 8a)
      cell: (r) => r.belegstand && r.belegstand.state !== "belegt" && <Tag colour={EVIDENCE[r.belegstand.state].colour}>{r.belegstand.text}</Tag>,
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
  const calc = { open: "zusaetzlich", belegstand: "klaerung" };
  const lvOrder = { column: "position", direction: "asc" } as const;
  const views: View[] = [
    // each view shows the column that answers it: Belegstand for what is open, the reason for what stands out
    { id: "offen", title: "Offen", state: { sort: lvOrder, filters: [{ column: "open", values: ["ja"] }], hidden: [...hidden, "note"], calculations: calc } },
    {
      id: "auffaellig",
      title: "Auffällig",
      state: { sort: lvOrder, filters: [{ column: "note", values: ["mehr als beauftragt", "nicht aufgemessen", "nach der letzten Abschlagsrechnung"] }], hidden: [...hidden, "belegstand"], calculations: calc },
    },
    { id: "alle", title: "Alle Positionen", state: { sort: lvOrder, filters: [], hidden, calculations: calc } },
    {
      id: "abdeckung",
      title: "Belegabdeckung",
      kind: "board",
      icon: Grid3x3,
      state: { sort: lvOrder, filters: [{ column: "check", values: ["mit Fund oder Lücke"] }], hidden, calculations: calc },
    },
  ];

  return (
    <DataTable
      name={`positionen.${project}`}
      rows={rows}
      columns={columns}
      views={views}
      noun={{ one: "Eintrag", many: "Einträge", dative: "Einträgen" }}
      selectable={false}
      board={(visible) => <CoverageMatrix rows={visible} view={view} targets={targets} project={project} />}
      phoneRow={(r) => (
        <div className="flex flex-col gap-1 px-4 py-2.5">
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
            {r.belegstand && r.belegstand.state !== "belegt" && <Tag colour={EVIDENCE[r.belegstand.state].colour}>{r.belegstand.text}</Tag>}
            {r.note && <span>{r.note}</span>}
          </span>
        </div>
      )}
    />
  );
}
