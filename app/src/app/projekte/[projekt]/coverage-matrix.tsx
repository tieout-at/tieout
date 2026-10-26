"use client";

import Link from "next/link";
import { ArrowRight, CirclePlus, ListOrdered, Wallet, X } from "lucide-react";
import { createElement, useState } from "react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { belegIcon } from "@/components/fund/icons";
import { Tag } from "@/components/table/tag";
import { Button, buttonVariants } from "@/components/ui/button";
import { InfoTip } from "@/components/ui/info-tip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/components/ui/use-media";
import { COVERAGE_ICON, COVERAGE_KINDS, type CoverageKind, type PositionRow, type PositionsView } from "@/lib/positions-shared";
import type { TaskTarget } from "@/lib/tasks";
import { cn } from "@/lib/utils";

const GAP = { beleg_fehlt: "yellow", nachtrag_nicht_gelegt: "orange" } as const;
const chip = "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring";
const SPALTEN = [
  { id: "beauftragt", title: "beauftragt" },
  { id: "erbracht", title: "erbracht" },
  { id: "verrechnet", title: "verrechnet" },
] as const;

type Cell = { state: "ok" | "weak" | "missing" | "none"; colour: "red" | "yellow" | "orange" | null; count: number; title: string };

/** One cell: a Beleg is there (grey), there but weak (red for a Kürzungsrisiko, else the gap's colour), missing (dashed), or none. */
function cellOf(r: PositionRow, k: CoverageKind): Cell {
  const items = r.coverage[k];
  const gapColour = r.belegstand && r.belegstand.state !== "belegt" ? GAP[r.belegstand.state] : null;
  if (!items.length) {
    if (r.missing?.kind === k) return { state: "missing", colour: gapColour, count: 0, title: `${r.missing.text} fehlt` };
    return { state: "none", colour: null, count: 0, title: "kein Beleg" };
  }
  const weak = items.find((x) => x.weak);
  const title = items.map((x) => `${x.title}${x.weak ? `, ${x.weak}` : ""}`).join("; ");
  if (weak) return { state: "weak", colour: gapColour ?? "red", count: items.length, title };
  return { state: "ok", colour: null, count: items.length, title };
}

const FILL = { red: "bg-state-red", yellow: "bg-state-yellow", orange: "bg-state-orange" };
const EDGE = { red: "border-state-red-edge", yellow: "border-state-yellow-edge", orange: "border-state-orange-edge" };

function Mark({ c }: { c: Cell }) {
  if (c.state === "none") return <span aria-hidden className="size-1 rounded-full bg-fg-faint" />;
  if (c.state === "missing") return <span aria-hidden className={cn("size-3 rounded-[3px] border-[1.5px] border-dashed", c.colour ? EDGE[c.colour] : "border-fg-secondary")} />;
  return (
    <span className="flex items-center gap-1">
      <span aria-hidden className={cn("size-3 rounded-[3px]", c.state === "weak" && c.colour ? FILL[c.colour] : "bg-fg/25")} />
      {c.count > 1 && <span className="text-xs text-fg-muted tabular-nums">{c.count}</span>}
    </span>
  );
}

/** The chain of a row in the panel: beauftragt, erbracht, verrechnet, each with its Belege, the weak and the missing one named. */
function Chain({ r, target }: { r: PositionRow; target: TaskTarget | null }) {
  const [task, setTask] = useState(false);
  return (
    <div className="flex flex-col gap-4 p-4">
      <header className="flex flex-col gap-1">
        <span className="flex items-center gap-2">
          {r.number && <span className="font-mono text-xs text-fg-secondary">{r.number}</span>}
          {r.find && <span className={chip}>{r.find.number}</span>}
        </span>
        <h2 className="text-base font-semibold">{r.text}</h2>
        {r.open && (
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-semibold whitespace-nowrap tabular-nums">{r.open.text}</span>
            <span className="text-fg-secondary">offen</span>
            {r.belegstand && r.belegstand.state !== "belegt" && <Tag colour={GAP[r.belegstand.state]}>{r.belegstand.text}</Tag>}
          </span>
        )}
        {(r.ordered || r.done || r.invoiced) && (
          <span className="text-fg-secondary">{[r.ordered && `beauftragt ${r.ordered}`, r.done && `erbracht ${r.done}`, r.invoiced && `verrechnet ${r.invoiced}`].filter(Boolean).join(" · ")}</span>
        )}
      </header>

      <ol className="flex flex-col gap-3">
        {SPALTEN.map((s) => {
          const kinds = COVERAGE_KINDS.filter((k) => k.column === s.id);
          const items = kinds.flatMap((k) => r.coverage[k.id].map((x) => ({ ...x, kind: k.id })));
          const missing = r.missing && kinds.some((k) => k.id === r.missing!.kind) ? r.missing : null;
          return (
            <li key={s.id} className="flex flex-col gap-1">
              <span className="text-xs text-fg-secondary">{s.title}</span>
              {items.map((x) => (
                <span key={`${x.kind}-${x.belegId}`} className="flex flex-col">
                  <span className="flex items-center gap-2">
                    {createElement(COVERAGE_ICON[x.kind], { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
                    <span className="min-w-0 flex-1 truncate">{x.title}</span>
                    <span className="shrink-0 font-mono text-xs text-fg-muted">{x.date}</span>
                  </span>
                  {x.weak && (
                    <span className={cn("flex items-center gap-1.5 pl-6 text-xs", r.belegstand?.state === "belegt" ? "text-state-red-edge" : "text-fg-secondary")}>
                      <span aria-hidden className={cn("size-2 rounded-full", r.belegstand?.state === "belegt" ? "bg-state-red" : "bg-state-yellow")} />
                      {x.weak}
                      {r.belegstand?.state === "belegt" ? ", Kürzungsrisiko" : ""}
                    </span>
                  )}
                </span>
              ))}
              {missing && (
                <span className="flex items-center gap-2 rounded-md border border-dashed border-state-yellow-edge px-2 py-1">
                  {createElement(COVERAGE_ICON[missing.kind], { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
                  {missing.text} fehlt
                </span>
              )}
              {!items.length && !missing && <span className="text-fg-muted">{s.id === "beauftragt" ? "nicht im Leistungsverzeichnis" : s.id === "verrechnet" ? "in keiner Rechnung" : "kein Beleg"}</span>}
            </li>
          );
        })}
      </ol>

      {r.find?.remedy && (
        <p>
          <span className="text-fg-secondary">Abhilfe </span>
          {r.find.remedy}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {r.find?.remedy && target && (
          <Button variant="primary" onClick={() => setTask(true)}>
            <CirclePlus aria-hidden />
            Als Aufgabe anlegen
          </Button>
        )}
        {r.find && (
          <Link href={r.find.href} className={buttonVariants({ variant: "secondary" })}>
            <ArrowRight aria-hidden />
            Fund öffnen
          </Link>
        )}
      </div>
      {target && <TaskDialog open={task} onOpenChange={setTask} targets={[target]} />}
    </div>
  );
}

/**
 * The view "Belegabdeckung" of the tab "Positionen" (SPEZIFIKATION.md 4.4 candidate B; draft A "Matrix", chosen by Maxi S.
 * on 26.10.2026): "Ist alles belegt?" as one sentence, then a mark per kind of Beleg for each row, grouped as the website
 * table (beauftragt, erbracht, verrechnet). A click on a row opens its chain at the right (a sheet on phones).
 */
export function CoverageMatrix({ rows, view, targets }: { rows: PositionRow[]; view: PositionsView; targets: Record<string, TaskTarget> }) {
  const [open, setOpen] = useState<string | null>(null);
  const wide = useMediaQuery("(min-width: 768px)", true);
  const chosen = rows.find((r) => r.id === open) ?? view.rows.find((r) => r.id === open);
  const a = view.answer;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="flex items-center gap-1.5 px-3 py-2.5 shadow-line-bottom max-md:px-4">
        <span>
          <span className="text-fg-secondary">Ist alles belegt? </span>
          <span className="font-semibold">{a.gaps ? `Nein, ${a.gaps === 1 ? "1 Lücke" : `${a.gaps} Lücken`}` : "Ja"}</span>
          {a.gaps > 0 && (
            <span className="text-fg-secondary">
              {" "}
              ({[a.belegFehlt && `Beleg fehlt ${a.belegFehlt}`, a.nachtrag && `Nachtrag nicht gelegt ${a.nachtrag}`].filter(Boolean).join(", ")})
            </span>
          )}
          {a.weak > 0 && <span className="text-fg-secondary">{`, ${a.weak === 1 ? "1 Position" : `${a.weak} Positionen`} schwach belegt.`}</span>}
        </span>
        <InfoTip label="Belegabdeckung">
          Je Eintrag ein Zeichen pro Art von Beleg: grau ist da (die Zahl sagt, wie viele), rot ist da, aber schwach (Kürzungsrisiko), gelb oder orange ist schwach in einem Fund in Klärung, gestrichelt fehlt, ein Punkt heißt keiner. Ein Klick auf einen Eintrag zeigt die Belege von beauftragt bis verrechnet.
        </InfoTip>
      </p>

      {wide ? (
        <div className="min-h-0 flex-1 overflow-auto">
          <table className="w-max min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-surface">
              <tr className="h-7 text-xs text-fg-secondary">
                <th className="sticky left-0 z-10 bg-surface" />
                {SPALTEN.map((s) => (
                  <th key={s.id} colSpan={COVERAGE_KINDS.filter((k) => k.column === s.id).length} className="border-b-2 border-l border-line px-2 text-center font-medium">
                    {s.title}
                  </th>
                ))}
                <th colSpan={2} />
              </tr>
              <tr className="h-11 text-left">
                <th className="sticky left-0 z-10 w-[280px] min-w-[280px] border-r border-b border-line bg-surface px-3 font-medium">
                  <span className="flex items-center gap-1.5">
                    <ListOrdered className="size-4 text-fg-secondary" aria-hidden />
                    Position
                  </span>
                </th>
                {COVERAGE_KINDS.map((k) => (
                  <th key={k.id} className={cn("border-r border-b border-line px-2 text-xs leading-3.5 font-medium hyphens-manual", k.id === "leistungsverzeichnis" ? "w-[96px] min-w-[96px]" : "w-[66px] min-w-[66px]")}>
                    <span className="flex flex-col items-start gap-0.5">
                      {createElement(COVERAGE_ICON[k.id], { className: "size-3.5 text-fg-secondary", "aria-hidden": true })}
                      {k.short}
                    </span>
                  </th>
                ))}
                <th className="w-[120px] min-w-[120px] border-r border-b border-line px-3 text-right font-medium">
                  <span className="flex items-center justify-end gap-1.5">
                    <Wallet className="size-4 text-fg-secondary" aria-hidden />
                    Offen
                  </span>
                </th>
                <th className="w-[200px] min-w-[200px] border-b border-line px-3 font-medium">Lücke</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} onClick={() => setOpen(r.id)} className="group h-10 cursor-pointer">
                  <th scope="row" className="sticky left-0 z-10 border-r border-b border-line bg-surface px-3 text-left font-medium group-hover:bg-row-hover">
                    <button type="button" onClick={() => setOpen(r.id)} className="flex w-[254px] min-w-0 items-center gap-2 text-left outline-none focus-visible:outline-2 focus-visible:outline-accent">
                      {r.number && <span className="shrink-0 font-mono text-xs text-fg-secondary">{r.number}</span>}
                      <span className="min-w-0 flex-1 truncate">{r.text}</span>
                      {r.find && <span className={chip}>{r.find.number}</span>}
                    </button>
                  </th>
                  {COVERAGE_KINDS.map((k) => {
                    const c = cellOf(r, k.id);
                    return (
                      <td key={k.id} title={c.title} className="border-r border-b border-line px-2 group-hover:bg-row-hover">
                        <span className="flex items-center justify-center">
                          <Mark c={c} />
                        </span>
                      </td>
                    );
                  })}
                  <td className="border-r border-b border-line px-3 text-right whitespace-nowrap tabular-nums group-hover:bg-row-hover">{r.open?.text}</td>
                  <td className="border-b border-line px-3 group-hover:bg-row-hover">
                    {r.belegstand && r.belegstand.state !== "belegt" ? (
                      <Tag colour={GAP[r.belegstand.state]}>{r.belegstand.text}</Tag>
                    ) : r.check === "schwach" ? (
                      <span className="flex items-center gap-1.5">
                        <span aria-hidden className="size-2 rounded-full bg-state-red" />
                        Kürzungsrisiko
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="sticky bottom-0 z-20 bg-surface">
              <tr className="h-9 text-fg-secondary">
                <td className="sticky left-0 z-10 border-r border-line bg-surface px-3 text-right shadow-[inset_0_1px_0_var(--color-line)]">
                  {rows.length === view.rows.length ? `${rows.length} Einträge` : `${rows.length} von ${view.rows.length} Einträgen`}
                </td>
                {COVERAGE_KINDS.map((k) => (
                  <td key={k.id} title={`Einträge mit einem Beleg dieser Art, von allen ${view.rows.length}`} className="border-r border-line px-2 text-right text-xs tabular-nums shadow-[inset_0_1px_0_var(--color-line)]">
                    {view.perKind[k.id]}
                  </td>
                ))}
                <td colSpan={2} className="px-3 text-xs shadow-[inset_0_1px_0_var(--color-line)]">
                  mit Beleg je Art, von allen {view.rows.length}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <ul className="flex flex-col">
          {rows.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => setOpen(r.id)} className="flex w-full flex-col gap-1.5 px-4 py-2.5 text-left shadow-line-bottom outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
                <span className="flex items-start gap-2">
                  <span className="line-clamp-2 min-w-0 flex-1">
                    {r.number && <span className="mr-1.5 font-mono text-xs text-fg-secondary">{r.number}</span>}
                    {r.text}
                  </span>
                  {r.find && <span className={chip}>{r.find.number}</span>}
                  {r.open && <span className="shrink-0 whitespace-nowrap tabular-nums">{r.open.text}</span>}
                </span>
                <span className="flex items-center gap-1" aria-label={COVERAGE_KINDS.map((k) => `${k.title}: ${cellOf(r, k.id).title}`).join("; ")}>
                  {SPALTEN.map((s, i) => (
                    <span key={s.id} className={cn("flex items-center gap-1", i > 0 && "ml-2 border-l border-line pl-2")}>
                      {COVERAGE_KINDS.filter((k) => k.column === s.id).map((k) => {
                        const c = cellOf(r, k.id);
                        return createElement(COVERAGE_ICON[k.id], {
                          key: k.id,
                          "aria-hidden": true,
                          className: cn(
                            "size-4",
                            c.state === "none" ? "text-fg-faint opacity-50" : c.state === "ok" ? "text-fg-secondary" : c.colour === "red" ? "text-state-red-edge" : c.colour === "orange" ? "text-state-orange-edge" : "text-state-yellow-edge",
                          ),
                        });
                      })}
                    </span>
                  ))}
                </span>
              </button>
            </li>
          ))}
          <li className="px-4 py-2.5 text-right text-fg-secondary">{rows.length === view.rows.length ? `${rows.length} Einträge` : `${rows.length} von ${view.rows.length} Einträgen`}</li>
        </ul>
      )}

      <Sheet open={!!chosen} onOpenChange={(o) => !o && setOpen(null)}>
        <SheetContent side={wide ? "right" : "bottom"} className={wide ? "w-[420px]" : "h-[85dvh]"}>
          <SheetTitle>{chosen?.text}</SheetTitle>
          <div className="flex h-12 shrink-0 items-center gap-2 pr-2 pl-4 shadow-line-bottom">
            {createElement(belegIcon("leistungsverzeichnis"), { className: "size-4 text-fg-secondary", "aria-hidden": true })}
            <span className="flex-1 text-sm font-medium">Belegabdeckung</span>
            <button type="button" onClick={() => setOpen(null)} aria-label="Schließen" className="flex size-8 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover max-md:size-11">
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{chosen && <Chain r={chosen} target={chosen.find ? (targets[chosen.find.number] ?? null) : null} />}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
