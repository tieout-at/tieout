"use client";

import Link from "next/link";
import { BookOpen, CalendarDays, Construction, File, FileText, Layers, ScanText, SearchCheck, Shapes } from "lucide-react";

import { DataTable, type Column } from "@/components/table/data-table";
import { Tag, type TagColour } from "@/components/table/tag";
import type { BelegRow } from "@/lib/kern-data";
import type { View } from "@/lib/table";

const REVIEW: Record<BelegRow["review"]["state"], { colour?: TagColour; rank: number }> = {
  korrigiert: { colour: "green", rank: 0 },
  bestaetigt: { colour: "green", rank: 1 },
  maschinell: { colour: "grey", rank: 2 },
  kopie: { rank: 3 },
};

const GROUPS = ["Systeme", "Dokumente", "Kommunikation"];

/**
 * "Belege" (SPEZIFIKATION.md 1.2 and 4.3): every file of the project folders with its kind, the website's group, the
 * review state of the fields read from it and the finds it proves. `project` hides the project column on a project page.
 */
export function BelegeTable({ rows, project }: { rows: BelegRow[]; project?: string }) {
  const columns: Column<BelegRow>[] = [
    {
      id: "beleg",
      title: "Beleg",
      icon: FileText,
      width: 250,
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-1.5" title={r.title}>
          <FileText className="size-4 shrink-0 text-fg-secondary" aria-hidden />
          <span className="truncate">{r.title}</span>
        </span>
      ),
    },
    {
      id: "kind",
      title: "Art",
      icon: Shapes,
      width: 200,
      sortValue: (r) => r.kind,
      filterValue: (r) => r.kind,
      cell: (r) => <Tag>{r.kind}</Tag>,
    },
    {
      id: "group",
      title: "Herkunft",
      icon: Layers,
      width: 160,
      sortValue: (r) => GROUPS.indexOf(r.group),
      filterValue: (r) => r.group,
      cell: (r) => <span className="truncate">{r.group}</span>,
    },
    {
      id: "date",
      title: "Datum",
      icon: CalendarDays,
      width: 130,
      sortValue: (r) => r.date.iso,
      cell: (r) => <span className="tabular-nums">{r.date.text}</span>,
    },
    {
      id: "project",
      title: "Projekt",
      icon: Construction,
      width: 220,
      sortValue: (r) => r.project.name,
      filterValue: (r) => r.project.name,
      cell: (r) => (
        <Link href={`/projekte/${r.project.slug}/`} className="-mx-1 truncate rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
          {r.project.name}
        </Link>
      ),
    },
    {
      id: "review",
      title: "Prüfstand",
      icon: ScanText,
      width: 210,
      sortValue: (r) => REVIEW[r.review.state].rank,
      filterValue: (r) => r.review.text,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-1.5">
          <Tag colour={REVIEW[r.review.state].colour}>{r.review.text}</Tag>
          {r.copyOf ? (
            <span className="truncate text-fg-secondary" title={`Kopie von ${r.copyOf}`}>
              von {r.copyOf}
            </span>
          ) : (
            r.fields.corrected > 0 && <span className="shrink-0 text-fg-secondary tabular-nums">{r.fields.corrected === 1 ? "1 Feld" : `${r.fields.corrected} Felder`}</span>
          )}
        </span>
      ),
    },
    {
      id: "finds",
      title: "Funde",
      icon: SearchCheck,
      width: 170,
      sortValue: (r) => (r.finds.length ? r.finds.join(" ") : null),
      filterValue: (r) => (r.finds.length ? "mit Fund" : "ohne Fund"),
      cell: (r) => (
        <span className="flex min-w-0 gap-1">
          {r.finds.map((f) => (
            <span key={f} className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">
              {f}
            </span>
          ))}
        </span>
      ),
    },
    {
      id: "pages",
      title: "Seiten",
      icon: BookOpen,
      width: 110,
      align: "right",
      sortValue: (r) => r.pages,
      cell: (r) => r.pages,
    },
    {
      id: "file",
      title: "Datei",
      icon: File,
      width: 280,
      sortValue: (r) => r.file,
      cell: (r) => <span className="truncate text-fg-secondary">{r.file}</span>,
    },
  ];

  const hidden = project ? ["project", "file"] : ["file"];
  const views: View[] = [
    { id: "alle", title: "Alle Belege", state: { sort: { column: "date", direction: "asc" }, filters: [], hidden, calculations: {} } },
    { id: "funde", title: "Belege mit Funden", state: { sort: { column: "finds", direction: "asc" }, filters: [{ column: "finds", values: ["mit Fund"] }], hidden, calculations: {} } },
    { id: "korrigiert", title: "Korrigiert", state: { sort: { column: "date", direction: "asc" }, filters: [{ column: "review", values: ["korrigiert"] }], hidden, calculations: {} } },
  ];

  return <DataTable name={project ? `belege.${project}` : "belege"} rows={rows} columns={columns} views={views} noun={{ one: "Beleg", many: "Belege", dative: "Belegen" }} />;
}
