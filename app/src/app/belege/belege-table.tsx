"use client";

import Link from "next/link";
import { createElement, useState } from "react";
import { BookOpen, CalendarDays, Construction, File, FileText, Layers, ScanText, SearchCheck, Shapes } from "lucide-react";

import { belegIconByText } from "@/components/fund/icons";
import { loadOriginals, OriginalWindow } from "@/components/fund/original-sheet";
import { DataTable, type Column, type QuickFilter } from "@/components/table/data-table";
import type { OriginalPage } from "@/lib/originals";
import { Tag, type TagColour } from "@/components/table/tag";
import type { BelegRow } from "@/lib/kern-data";
import type { View } from "@/lib/table";

const REVIEW: Record<BelegRow["review"]["state"], { colour?: TagColour; rank: number }> = {
  korrigiert: { rank: 0 },
  bestaetigt: { rank: 1 },
  kopie: { rank: 2 },
  maschinell: { rank: 3 },
};

/** The number chips of the finds a Beleg proves; on a list of all projects with the project's place name ("F3 Kiefernau"), since F1 to F3 exist in every project. */
function FindChips({ finds, project }: { finds: string[]; project?: string }) {
  return (
    <span className="flex min-w-0 gap-1">
      {finds.map((f) => (
        <span key={f} className="flex h-5 min-w-7 shrink-0 items-center justify-center gap-1 rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">
          {f}
          {project && <span className="text-fg-muted">{project}</span>}
        </span>
      ))}
    </span>
  );
}

/** "Wohnpark Mooshaim" → "Mooshaim": the place name tells the projects apart. */
const placeOf = (name: string) => name.split(" ").at(-1) ?? name;

/** The icon of the Beleg's kind, as on the find page. */
function KindIcon({ kind, className }: { kind: string; className?: string }) {
  return createElement(belegIconByText(kind), { className, "aria-hidden": true });
}

/** What a human did with the Beleg; nothing for one only read by the machine, which is most of them (step 8a). */
function Review({ r }: { r: BelegRow }) {
  if (r.review.state === "maschinell") return null;
  return (
    <span className="flex min-w-0 items-center gap-1.5">
      <Tag colour={REVIEW[r.review.state].colour}>{r.review.text}</Tag>
      {r.copyOf ? (
        <span className="truncate text-fg-secondary" title={`doppelt, gleich wie ${r.copyOf}`}>
          wie {r.copyOf}
        </span>
      ) : (
        r.fields.corrected > 0 && <span className="shrink-0 text-fg-secondary tabular-nums">{r.fields.corrected === 1 ? "1 Feld" : `${r.fields.corrected} Felder`}</span>
      )}
    </span>
  );
}

const GROUPS = ["Systeme", "Dokumente", "Kommunikation"];

/**
 * "Belege" (SPEZIFIKATION.md 1.2 and 4.3): every file of the project folders with its kind, the website's group, the
 * review state of the fields read from it and the finds it proves. `project` hides the project column on a project page.
 */
export function BelegeTable({ rows, project }: { rows: BelegRow[]; project?: string }) {
  // a click on a row opens the Beleg's first page in the window at the right; again, closes it (step 8d)
  const [open, setOpen] = useState<BelegRow | null>(null);
  const [pages, setPages] = useState<Record<string, OriginalPage> | null>(null);
  const openRow = (r: BelegRow) => {
    setOpen((cur) => (cur?.id === r.id ? null : r));
    setPages(null);
    void loadOriginals(r.project.slug).then(setPages);
  };
  // quick filters by kind, the kinds with the most Belege first (step 8d)
  const kinds = [...rows.reduce((m, r) => m.set(r.kind, (m.get(r.kind) ?? 0) + 1), new Map<string, number>())].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const top = new Set(kinds.map(([k]) => k));
  const quick: QuickFilter<BelegRow>[] = [
    { id: "alle", title: "Alle", match: () => true },
    ...kinds.map(([k]) => ({ id: k, title: k, match: (r: BelegRow) => r.kind === k })),
    // every other kind in one chip, so no Beleg is out of reach of the chips
    ...(rows.some((r) => !top.has(r.kind)) ? [{ id: "weitere", title: "Weitere", match: (r: BelegRow) => !top.has(r.kind) }] : []),
  ];
  const columns: Column<BelegRow>[] = [
    {
      id: "beleg",
      title: "Beleg",
      icon: FileText,
      width: 340,
      sortValue: (r) => r.title,
      cell: (r) => (
        <span className="flex min-w-0 items-center gap-1.5" title={r.title}>
          <KindIcon kind={r.kind} className="size-4 shrink-0 text-fg-secondary" />
          <span className="truncate">{r.title}</span>
        </span>
      ),
    },
    {
      id: "finds",
      title: "Funde",
      icon: SearchCheck,
      width: project ? 140 : 190,
      sortValue: (r) => (r.finds.length ? r.finds.join(" ") : null),
      filterValue: (r) => (r.finds.length ? "mit Fund" : "ohne Fund"),
      cell: (r) => <FindChips finds={r.finds} project={project ? undefined : placeOf(r.project.name)} />,
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
      title: "Prüfung",
      icon: ScanText,
      width: 190,
      sortValue: (r) => REVIEW[r.review.state].rank,
      filterValue: (r) => r.review.text,
      cell: (r) => <Review r={r} />,
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

  // Art mostly repeats the name and Herkunft is the website's group: both one click away in "Ansicht" (step 8a); Prüfung is
  // empty for most Belege, so it shows in the view "Korrigiert" and comes back with "+" elsewhere (step 8d)
  const hidden = project ? ["kind", "group", "project", "file"] : ["kind", "group", "file"];
  const views: View[] = [
    { id: "alle", title: "Alle Belege", state: { sort: { column: "date", direction: "desc" }, filters: [], hidden: [...hidden, "review"], calculations: {} } },
    { id: "funde", title: "Belege mit Funden", state: { sort: { column: "finds", direction: "asc" }, filters: [{ column: "finds", values: ["mit Fund"] }], hidden: [...hidden, "review"], calculations: {} } },
    { id: "korrigiert", title: "Korrigiert", state: { sort: { column: "date", direction: "desc" }, filters: [{ column: "review", values: ["korrigiert"] }], hidden, calculations: {} } },
  ];

  const belegId = open ? open.id.slice(open.id.indexOf("/") + 1) : "";
  return (
    <>
    <DataTable
      quick={quick}
      onOpen={openRow}
      openId={open?.id ?? null}
      name={project ? `belege.${project}` : "belege"}
      rows={rows}
      columns={columns}
      views={views}
      noun={{ one: "Beleg", many: "Belege", dative: "Belegen" }}
      phoneRow={(r) => (
        <button type="button" onClick={() => openRow(r)} className="flex w-full flex-col gap-1 px-4 py-2.5 text-left outline-none active:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
          <span className="flex items-start gap-2">
            <KindIcon kind={r.kind} className="mt-0.5 size-4 shrink-0 text-fg-secondary" />
            <span className="line-clamp-2 min-w-0 flex-1">{r.title}</span>
            <FindChips finds={r.finds} />
          </span>
          <span className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-6 text-xs text-fg-secondary">
            <span className="tabular-nums">{r.date.text}</span>
            {!project && <span>{r.project.name}</span>}
            <Review r={r} />
          </span>
        </button>
      )}
    />
    <OriginalWindow
      open={open !== null}
      onClose={() => setOpen(null)}
      pages={open?.copyOf ? {} : pages}
      pageKey={`${belegId}:1`}
      label={open ? (open.copyOf ? `${open.title}, doppelt, gleich wie ${open.copyOf}` : open.title) : "Beleg"}
    />
    </>
  );
}
