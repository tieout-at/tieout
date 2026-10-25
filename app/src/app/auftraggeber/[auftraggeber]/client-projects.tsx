"use client";

import Link from "next/link";

import { MiniTable } from "@/components/record/mini-table";
import { Tag, type TagColour } from "@/components/table/tag";
import type { ProjectRow } from "@/lib/kern-data";
import { useLive } from "@/lib/live";

const COLOUR: Record<string, TagColour> = { rot: "red", gelb: "yellow", gruen: "green", grau: "grey" };

/** The projects of an Auftraggeber with their money words; with a decision in this browser computed again by the core (live.ts). */
export function ClientProjects({ rows: built }: { rows: ProjectRow[] }) {
  const live = useLive();
  const rows = live ? live.projectRows().filter((p) => built.some((b) => b.id === p.id)) : built;
  return (
    <MiniTable
      title="Projekte"
      rows={rows}
      columns={[
        {
          id: "name",
          title: "Projekt",
          className: "whitespace-nowrap",
          cell: (p) => (
            <Link href={`/projekte/${p.slug}/`} className="rounded-xs outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
              {p.name}
            </Link>
          ),
        },
        { id: "status", title: "Status", className: "whitespace-nowrap", cell: (p) => <Tag colour={COLOUR[p.status.colour]}>{p.status.text}</Tag> },
        { id: "date", title: "Datum", cell: (p) => p.date && <span className="text-fg-secondary">{p.date.label} <span className="text-fg tabular-nums">{p.date.text}</span></span> },
        { id: "extra", title: "Zusätzlich verrechenbar", align: "right", cell: (p) => p.extra?.text },
        { id: "unclear", title: "In Klärung", align: "right", cell: (p) => p.unclear?.text },
      ]}
    />
  );
}
