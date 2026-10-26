"use client";

import { Construction, ReceiptText } from "lucide-react";

import { keep } from "@/components/charts/tones";
import { byMoment, dayMs, MONTHS, monthsBetween } from "@/lib/calendar";
import { TIMELINE_ROWS, type TimelineEvent, type TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { Mark } from "./detail";
import { LEGEND, markStyle, meaningOf, statusWord } from "./marks";

const chip = "inline-flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-surface px-1 text-xs text-count shadow-ring";

/**
 * "Überblick": the whole Bauzeit on one time axis (draft A of step 8b, polished in step 8d): the site above, the
 * invoices below, the Abschlagsrechnungen as dashed dividers, the deadline as a red line. A missing event carries its
 * find number, an invoice, a payment, a cut and the Entwurf their printed amount. Rows without anything to show fold
 * away; a click opens the event in the window at the right, the arrows walk along the axis.
 */
export function Overview({ view, shown, width, chosen, onChoose }: { view: TimelineView; shown: TimelineEvent[]; width: number; chosen: string | null; onChoose: (id: string) => void }) {
  const LABEL = 188;
  const PAD = 28;
  const X0 = LABEL + 8;
  const X1 = width - PAD;
  const [t0, t1] = [dayMs(view.range.from), dayMs(view.range.to)];
  const x = (iso: string) => X0 + ((dayMs(iso) - t0) / (t1 - t0)) * (X1 - X0);
  const AXIS = 28;
  const AR = 22;
  const LANE = 32;
  const ROW = 34;
  const GAPY = 14;
  const rows = TIMELINE_ROWS.filter((r) => shown.some((e) => e.row === r.id));
  const rowsY: Record<string, number> = {};
  let y = AXIS + AR;
  const laneB = y;
  y += LANE;
  for (const r of rows.filter((r) => r.lane === "baustelle")) [rowsY[r.id], y] = [y, y + ROW];
  y += GAPY;
  const laneR = y;
  y += LANE;
  for (const r of rows.filter((r) => r.lane === "rechnung")) [rowsY[r.id], y] = [y, y + ROW];
  const bottom = y;

  // month names: as many as fit (about 72 px each); the year with the first month and with every Jänner
  const months = monthsBetween(view.range.from, view.range.to).map((iso) => ({ iso, label: MONTHS[Number(iso.slice(5, 7)) - 1] as string | null }));
  const every = Math.max(1, Math.ceil(72 / ((X1 - X0) / months.length)));
  let lastNamed = -every;
  months.forEach((m, i) => {
    const jaenner = m.iso.slice(5, 7) === "01";
    const named = i - lastNamed >= every || (jaenner && i > 0 && i - lastNamed >= 2);
    m.label = named ? (months.length > 12 && (i === 0 || jaenner) ? `${m.label} ${m.iso.slice(0, 4)}` : m.label) : null;
    if (named) lastNamed = i;
  });

  const walls = view.deadline ? [x(view.deadline.iso)] : [];
  const trace = new Set(view.events.find((e) => e.id === chosen)?.finds ?? []);
  // marks closer than 16 px in one row step up and down, so each stays clickable and never covers the next
  const nudge = new Map<string, number>();
  for (const r of rows) {
    let last = -99;
    let up = false;
    let prev: string | null = null;
    for (const e of shown.filter((e) => e.row === r.id).sort(byMoment)) {
      const at = x(e.date.iso);
      up = at - last < 16 ? !up : false;
      if (up) {
        nudge.set(e.id, 7);
        if (prev && !nudge.has(prev)) nudge.set(prev, -7);
      }
      last = at;
      prev = e.id;
    }
  }

  // labels: the find number at a missing site event, the printed amount at an invoice; right of the mark, else above, else left
  const labels: { id: string; left: number; top: number; node: React.ReactNode }[] = [];
  for (const r of rows) {
    const cy = rowsY[r.id] + ROW / 2;
    const marks = shown.filter((e) => e.row === r.id).map((e) => ({ e, x: x(e.date.iso) })).sort((a, b) => a.x - b.x);
    const taken: [number, number, number][] = [];
    const lastChip: Record<string, number> = {};
    for (const m of marks.filter((m) => (m.e.lane === "baustelle" ? m.e.stand === "fehlt" && m.e.finds.length : m.e.short || m.e.art === "abzugsschreiben"))) {
      const isChip = m.e.lane === "baustelle";
      const text = isChip ? m.e.finds[0] : m.e.short ? keep(m.e.short) : "Abzüge angekündigt";
      if (isChip && lastChip[text] !== undefined && Math.abs(m.x - lastChip[text]) < 40) continue;
      const w = isChip ? 30 : text.length * 6.3 + 8;
      const tries: [number, number][] = isChip
        ? [
            [m.x + 10, 0],
            [m.x + 4, -17],
            [m.x - 10 - w, 0],
            [m.x - 4 - w, -17],
            [m.x + 4, 17],
            [m.x - 4 - w, 17],
          ]
        : [
            [m.x + 10, 0],
            [m.x - 10 - w, 0],
            [m.x + 4, -17],
          ];
      for (const [a, dy] of tries) {
        const b = a + w;
        if (a < X0 - 4 || b > width - 2) continue;
        const hitsMark = marks.some((o) => o !== m && dy === 0 && o.x + 6 > a && o.x - 6 < b);
        // a chip is 20 px high: one 17 px above another still touches it, so both lines count
        const hitsLabel = taken.some(([p, q, ty]) => Math.abs(ty - dy) < 20 && p < b + 4 && q > a - 4);
        const hitsWall = !isChip && dy === 0 && walls.some((wx) => wx > a - 2 && wx < b + 2);
        if (hitsMark || hitsLabel || hitsWall) continue;
        taken.push([a, b, dy]);
        if (isChip) lastChip[text] = m.x;
        labels.push({
          id: `${m.e.id}-label`,
          left: a,
          top: cy - 10 + dy,
          node: isChip ? <span className={chip}>{text}</span> : <span className="text-xs whitespace-nowrap text-fg-secondary tabular-nums">{text}</span>,
        });
        break;
      }
    }
  }

  const order = [...shown].sort((a, b) => byMoment(a, b) || a.row.localeCompare(b.row));
  // the names of the Abschlagsrechnungen at their dashed line, all on one baseline: right of the line, else left of it
  const dividers: { id: string; x: number; left: number; title: string }[] = [];
  for (const e of view.events.filter((e) => e.art === "abschlagsrechnung").sort(byMoment)) {
    const at = x(e.date.iso);
    const w = e.title.length * 5.9 + 10;
    const free = (a: number) => a >= X0 - 4 && a + w <= width && !dividers.some((d) => d.left < a + w + 4 && d.left + d.title.length * 5.9 + 10 > a - 4);
    const left = [at + 4, at - w - 4].find(free) ?? Math.min(at + 4, width - w);
    dividers.push({ id: e.id, x: at, left, title: e.title });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative" style={{ height: bottom + 28 }} aria-label="Zeitstrahl über die Bauzeit" role="group">
        {months.map((m) => (
          <div key={m.iso}>
            <div className="absolute w-px bg-line" style={{ left: x(m.iso), top: AXIS - 6, height: bottom - AXIS + 6 }} />
            {m.label && (
              <div className="absolute text-xs whitespace-nowrap text-fg-muted" style={{ left: Math.min(x(m.iso) + 6, width - 64), top: 6 }}>
                {m.label}
              </div>
            )}
          </div>
        ))}
        <div className="absolute flex items-center gap-1.5 font-medium" style={{ top: laneB, height: LANE }}>
          <Construction className="size-4 text-fg-secondary" aria-hidden />
          Baustelle
        </div>
        <div className="absolute flex items-center gap-1.5 font-medium" style={{ top: laneR, height: LANE }}>
          <ReceiptText className="size-4 text-fg-secondary" aria-hidden />
          Rechnung
        </div>
        {rows.map((r) => (
          <div key={r.id}>
            <div className="absolute flex items-center pl-[22px] text-fg-secondary" style={{ top: rowsY[r.id], height: ROW, width: LABEL }}>
              <span className="truncate">{r.title}</span>
            </div>
            <div className="absolute h-px bg-fill-subtle" style={{ top: rowsY[r.id] + ROW / 2, left: X0, width: X1 - X0 }} />
          </div>
        ))}
        {view.deadline && (
          <>
            <div className="absolute w-0.5 bg-data-risk/70" style={{ left: x(view.deadline.iso), top: AXIS + 2, height: bottom - AXIS - 2 }} />
            <div className="absolute flex items-center gap-1.5 text-xs whitespace-nowrap text-state-red-edge" style={{ right: Math.max(4, width - x(view.deadline.iso) - 1), top: bottom + 8 }}>
              <span aria-hidden className="size-2 rounded-full bg-data-risk" />
              Schlussrechnung legen bis {view.deadline.text}
            </div>
          </>
        )}
        {dividers.map((d) => (
          <div key={`${d.id}-div`}>
            <div className="absolute border-l border-dashed border-fg-faint" style={{ left: d.x, top: AXIS + 2, height: bottom - AXIS - 2 }} />
            <div className="absolute bg-surface px-1 text-[11px] whitespace-nowrap text-fg-secondary" style={{ left: d.left, top: AXIS + 3 }}>
              {d.title}
            </div>
          </div>
        ))}
        {shown.map((e) => {
          const isChosen = e.id === chosen;
          const traced = !isChosen && e.finds.some((f) => trace.has(f));
          const meaning = meaningOf(e, view.finds);
          const m = markStyle(meaning, 12);
          return (
            <button
              key={e.id}
              type="button"
              onClick={() => onChoose(e.id)}
              aria-label={[e.title, e.date.text, e.time, statusWord(meaning, view.target), e.finds.join(" "), e.amount].filter(Boolean).join(", ")}
              aria-pressed={isChosen}
              data-mark={e.id}
              tabIndex={isChosen || (!chosen && e.id === order[order.length - 1]?.id) ? 0 : -1}
              className={cn(
                "absolute z-10 -translate-x-1/2 -translate-y-1/2 transition-transform after:absolute after:-inset-2 hover:scale-125 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent",
                m.className,
                isChosen && "scale-125 outline-2 outline-offset-3 outline-fg outline-solid",
                traced && "outline-[1.5px] outline-offset-2 outline-fg-faint outline-solid",
              )}
              style={{ ...m.style, left: x(e.date.iso), top: rowsY[e.row] + ROW / 2 + (nudge.get(e.id) ?? 0) }}
              onKeyDown={(k) => {
                if (k.key !== "ArrowRight" && k.key !== "ArrowLeft") return;
                k.preventDefault();
                const next = order[order.findIndex((o) => o.id === e.id) + (k.key === "ArrowRight" ? 1 : -1)];
                if (next) {
                  onChoose(next.id);
                  requestAnimationFrame(() => document.querySelector<HTMLElement>(`[data-mark="${CSS.escape(next.id)}"]`)?.focus());
                }
              }}
            />
          );
        })}
        {labels.map((l) => (
          <span key={l.id} aria-hidden className="pointer-events-none absolute z-[5] rounded-[5px] bg-surface" style={{ left: l.left, top: l.top }}>
            {l.node}
          </span>
        ))}
      </div>
      <Legend view={view} shown={shown} />
    </div>
  );
}

/**
 * The marks with their words, visible under the picture (council of step 8d): in two groups, Baustelle and Rechnung, and
 * only the marks the current filter shows, so "Nur was fehlt" lists no mark that is not there.
 */
export function Legend({ view, shown }: { view: TimelineView; shown: TimelineEvent[] }) {
  const present = new Set(shown.map((e) => meaningOf(e, view.finds)));
  const groups = (["baustelle", "rechnung"] as const)
    .map((lane) => ({ lane, items: LEGEND.filter((l) => l.lane === lane && present.has(l.m)) }))
    .filter((g) => g.items.length);
  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-2 text-xs text-fg-secondary">
      {groups.map((g) => (
        <div key={g.lane} className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-medium text-fg">{g.lane === "baustelle" ? "Baustelle" : "Rechnung"}</span>
          {g.items.map((l) => {
            const m = markStyle(l.m, 10);
            return (
              <span key={l.m} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("inline-block shrink-0", m.className)} style={m.style} />
                {l.text}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

/** Phones: the same events as a short list down the months, newest first; a tap opens the event. */
export function OverviewList({ view, shown, onChoose }: { view: TimelineView; shown: TimelineEvent[]; onChoose: (id: string) => void }) {
  const sorted = [...shown].sort((a, b) => byMoment(b, a));
  return (
    <ol className="flex flex-col">
      {sorted.map((e, i) => {
        const head = i === 0 || sorted[i - 1].date.iso.slice(0, 7) !== e.date.iso.slice(0, 7) ? e.date.iso.slice(0, 7) : null;
        return (
          <li key={e.id}>
            {head && <div className="px-4 pt-4 pb-1 text-xs text-fg-secondary">{`${MONTHS[Number(head.slice(5, 7)) - 1]} ${head.slice(0, 4)}`}</div>}
            <button type="button" onClick={() => onChoose(e.id)} className="flex min-h-11 w-full items-center gap-2.5 px-4 py-1.5 text-left outline-none active:bg-fill-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
              <Mark e={e} view={view} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className={cn("truncate", e.lane === "rechnung" && "text-fg-secondary")}>{e.title}</span>
                <span className="truncate text-xs text-fg-muted">
                  {e.date.text}
                  {e.lane === "baustelle" ? ` · ${statusWord(meaningOf(e, view.finds), view.target) ?? e.text}` : ""}
                </span>
              </span>
              {e.lane === "rechnung" && e.amount ? <span className="shrink-0 text-xs whitespace-nowrap text-fg-secondary tabular-nums">{keep(e.amount)}</span> : e.finds[0] ? <span className={chip}>{e.finds[0]}</span> : null}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
