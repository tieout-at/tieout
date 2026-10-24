"use client";

import Link from "next/link";
import { memo } from "react";

import { cn } from "@/lib/utils";
import type { TwinCell } from "@/lib/twin";
import { CFG } from "./config";
import { cellAt, type Fit } from "./layout";
import { formatInt, headline, plural, type FindDetail, type Model, type Tone } from "./model";

export type TipCell = { area: "grid" | "ohne"; index: number };

export const TONE_BG: Record<Tone, string> = {
  belegt: "bg-state-green shadow-[inset_0_0_0_1px_var(--color-state-green-edge)]",
  fehlt: "bg-state-yellow shadow-[inset_0_0_0_1px_var(--color-state-yellow-edge)]",
  nachtrag: "bg-state-orange shadow-[inset_0_0_0_1px_var(--color-state-orange-edge)]",
  pauschale: "bg-surface shadow-[inset_0_0_0_1px_var(--color-fg-secondary)]",
};
export const TONE_DOT: Record<Tone, string> = {
  belegt: "bg-state-green",
  fehlt: "bg-state-yellow",
  nachtrag: "bg-state-orange",
  pauschale: "bg-state-grey",
};

function cellClass(c: TwinCell, tone: Tone | null): string {
  if (c.state === "fund" && tone) return cn(TONE_BG[tone], "in-data-[enter=run]:animate-[zw-pop_400ms_var(--ease-soft)_700ms_backwards]");
  if (c.state === "pauschale") return TONE_BG.pauschale;
  return "bg-cell shadow-[inset_0_0_0_1px_var(--color-cell-edge)]";
}

/**
 * The cells of the Abgleich: drawn once per size, never per trace (a trace dims the whole grid through one data
 * attribute and draws its own cells on top). The pointer is resolved arithmetically, so hover costs no layout.
 */
export const CellGrid = memo(function CellGrid({
  model,
  area,
  fit,
  interactive,
  onCell,
  onPick,
}: {
  model: Model;
  area: "grid" | "ohne";
  fit: Fit;
  interactive: boolean;
  onCell: (cell: TipCell | null) => void;
  onPick: (find: string) => void;
}) {
  const cells = area === "grid" ? model.grid : model.ohne;
  const at = (e: React.PointerEvent | React.MouseEvent) => {
    const i = cellAt(fit, cells.length, e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    return i === null ? null : { area, index: i };
  };
  return (
    <div
      data-zone={area}
      data-dim=""
      role="img"
      aria-label={`${area === "grid" ? plural(cells.length, "Position", "Positionen") : `${formatInt(cells.length)} ohne Position`}, ${cells.filter((c) => c.state === "fund").length} mit Fund`}
      className="grid transition-opacity duration-200 motion-reduce:transition-none in-data-[trace=dim]:opacity-45"
      style={{ gridTemplateColumns: `repeat(${fit.cols}, ${fit.cell}px)`, gridAutoRows: `${fit.cell}px`, gap: fit.gap, width: fit.width }}
      onPointerMove={interactive ? (e) => e.pointerType !== "touch" && onCell(at(e)) : undefined}
      onPointerLeave={interactive ? () => onCell(null) : undefined}
      onClick={
        interactive
          ? (e) => {
              const c = at(e);
              const find = c && cells[c.index].find;
              if (find && model.finds.has(find)) {
                e.stopPropagation();
                onPick(find);
              }
            }
          : undefined
      }
    >
      {cells.map((c) => (
        <span
          key={c.id}
          className={cn("pointer-events-none rounded-[2px]", cellClass(c, c.find ? (model.finds.get(c.find)?.tone ?? null) : null))}
        />
      ))}
    </div>
  );
});

function Legend() {
  return (
    <div className="mt-3.5 flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-fg-secondary">
      <span className="inline-flex items-center gap-1.5">
        <i className="size-[9px] rounded-[2px] bg-cell shadow-[inset_0_0_0_1px_var(--color-cell-edge)]" />
        verrechnet
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className={cn("size-[9px] rounded-[2px]", TONE_BG.pauschale)} />
        Pauschale
      </span>
      <span className="inline-flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span className="text-fg">Fund</span>
        {(
          [
            ["belegt", "belegt"],
            ["fehlt", "Beleg fehlt"],
            ["nachtrag", "Nachtrag nicht gelegt"],
          ] as const
        ).map(([tone, word]) => (
          <span key={tone} className="inline-flex items-center gap-1.5">
            <i className={cn("size-[9px] rounded-[2px]", TONE_BG[tone])} />
            {word}
          </span>
        ))}
      </span>
    </div>
  );
}

/** Under the grid while a finding is traced: its sentence, the cells' beauftragt, erbracht, verrechnet, and why. */
export function Readout({ detail, sentence, reserve }: { detail: FindDetail | null; sentence: string | null; reserve: number }) {
  const rows = detail?.cells.slice(0, CFG.readout.tableRows) ?? [];
  const rest = (detail?.cells.length ?? 0) - rows.length;
  return (
    <div className="mt-4 text-xs leading-[18px] text-fg" style={{ minHeight: reserve }}>
      {detail ? (
        <div className="flex flex-col gap-2">
          <Link href={detail.href} className="self-start rounded-xs font-medium text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            {detail.nr} öffnen: Rechenweg, Belege, Original
          </Link>
          <div aria-hidden className="contents">
          <p>
            <span className="font-mono text-accent">{detail.nr}</span> · <span className="tabular-nums">{detail.amount}</span> ·{" "}
            {detail.proofText ?? <span className="inline-flex items-center gap-1.5"><i className={cn("size-1.5 rounded-full", TONE_DOT[detail.tone])} />{detail.stand}</span>}
            {detail.remedy && <span className="block text-fg">Abhilfe: {detail.remedy}</span>}
            {detail.present && <span className="block text-fg-secondary">{detail.present}</span>}
          </p>
          {rows.length > 0 && (
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto_auto] gap-x-3 tabular-nums">
              <span />
              <span className="text-right text-fg-secondary">beauftragt</span>
              <span className="text-right text-fg-secondary">erbracht</span>
              <span className="text-right text-fg-secondary">verrechnet</span>
              {rows.map((c, i) => (
                <Row key={`${c.id}-${i}`} c={c} />
              ))}
              {rest > 0 && <span className="col-span-4 text-fg-secondary">und {rest === 1 ? "1 weitere Position" : `${rest} weitere Positionen`}</span>}
            </div>
          )}
          {detail.risk && <p className="text-fg">{detail.risk}</p>}
          {detail.shows.map((s) => (
            <p key={s} className="text-fg-secondary">
              {s}
            </p>
          ))}
          {detail.memory && (
            <p className="rounded-md bg-row-selected px-2.5 py-2">
              <b className="font-semibold">{detail.memory.who}</b>: {detail.memory.text}
            </p>
          )}
          </div>
        </div>
      ) : (
        sentence && <p aria-hidden>{sentence}</p>
      )}
    </div>
  );
}

function Row({ c }: { c: FindDetail["cells"][number] }) {
  const position = c.id === "ohne Position" ? c.label : c.id;
  return (
    <>
      <span className={cn("truncate", c.id !== "ohne Position" && "font-mono text-[11px]")} title={c.label}>
        {position}
      </span>
      <span className="truncate text-right">{c.beauftragt}</span>
      <span className="truncate text-right font-semibold text-accent">{c.erbracht}</span>
      <span className="truncate text-right">{c.verrechnet}</span>
    </>
  );
}

/**
 * "Digitaler Zwilling": what the business knows (Ebene 1) and the Abgleich of every position (Ebene 2), with the
 * legend and, while a finding is traced, the readout.
 */
export function TwinColumn({
  model,
  fit,
  stacked,
  nodesOn,
  readout,
  onCell,
  onPick,
}: {
  model: Model;
  fit: Fit;
  stacked: boolean;
  nodesOn: Set<string>;
  readout: React.ReactNode;
  onCell: (cell: TipCell | null) => void;
  onPick: (find: string) => void;
}) {
  const b = model.view.business;
  const head = headline(model);
  const node = "flex min-h-6 flex-wrap items-baseline gap-x-2 rounded-[7px] px-2 -mx-2 py-[3px] text-xs leading-[18px] transition-[background-color,opacity] duration-200 motion-reduce:transition-none data-on:bg-row-selected in-data-[trace=dim]:not-data-on:opacity-55";
  return (
    <div data-zone="zwilling" className="flex min-w-0 flex-col">
      <p className="mb-3.5 text-[13px] leading-[18px] text-fg-secondary">
        <b className="font-semibold text-fg tabular-nums">{head.count}</b> {head.done}
        <span className="whitespace-nowrap">
          <span className="text-fg-faint"> · </span>
          <b className="font-semibold text-fg tabular-nums">{head.finds}</b>
        </span>
      </p>
      <div className="mb-1.5 flex flex-wrap justify-between gap-x-2 text-xs text-fg-secondary">
        <span>Wissen aus Ihrem Betrieb</span>
        <span className="tabular-nums">
          {formatInt(b.counts.clients)} Auftraggeber · {formatInt(b.counts.contracts)} Verträge · {formatInt(b.counts.projects)} Projekte
        </span>
      </div>
      <div className="mb-4 flex flex-col gap-0.5">
        <Link href={b.client.href} data-node="auftraggeber" data-on={nodesOn.has("auftraggeber") ? "" : undefined} className={cn(node, "hover:bg-fill-hover")}>
          <span className="text-fg-secondary">Auftraggeber</span>
          <span className="font-medium text-fg in-data-on:text-accent">{b.client.name}</span>
        </Link>
        <div data-node="vertrag" data-on={nodesOn.has("vertrag") ? "" : undefined} className={node}>
          <span className="text-fg-secondary">Vertrag</span>
          <span className="text-fg in-data-on:text-accent">
            {b.contract.date}, {b.contract.kind}
          </span>
        </div>
        <div data-node="preisbasis" data-on={nodesOn.has("preisbasis") ? "" : undefined} className={node}>
          {b.priceBasis.hourly ? (
            <span className="text-fg in-data-on:text-accent" title={b.priceBasis.hourly}>
              Preisbasis
            </span>
          ) : (
            <span className="text-fg-secondary">{b.priceBasis.label}</span>
          )}
        </div>
      </div>
      <div className="mb-1.5 text-xs text-fg-secondary">
        <span className="tabular-nums">{model.counts.positionen === 1 ? "1 Position" : `${formatInt(model.counts.positionen)} Positionen`}</span>
      </div>
      <CellGrid model={model} area="grid" fit={fit} interactive={!stacked} onCell={onCell} onPick={onPick} />
      {model.ohne.length > 0 && (
        <div className="mt-3.5 flex flex-col gap-2">
          <CellGrid model={model} area="ohne" fit={fit} interactive={!stacked} onCell={onCell} onPick={onPick} />
          <span className="text-xs text-fg-secondary">ohne Position</span>
        </div>
      )}
      <Legend />
      {readout}
    </div>
  );
}
