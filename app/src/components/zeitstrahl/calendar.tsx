"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import { keep, TONE_VAR } from "@/components/charts/tones";
import { useReducedMotion } from "@/components/ui/use-media";
import { addDays, dayShort, groupByDay, isWeekend, mondayOf, monthGrid, monthOf, monthsBetween, monthTitle, weekNumber, weekTitle, weeksBetween, WEEKDAYS_SHORT } from "@/lib/calendar";
import type { TimelineEvent, TimelineView } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { Mark, type Selection } from "./detail";
import { meaningOf, toneOf } from "./marks";

const iconButton =
  "relative flex size-8 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-35 max-md:before:absolute max-md:before:-inset-1.5";
const quietButton = "h-8 rounded-md px-2.5 text-sm text-fg-secondary shadow-button outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent";

/** A light wash of the event's tone behind a card, so what is missing reads at a glance. */
const wash = (e: TimelineEvent, view: TimelineView) => {
  const tone = toneOf(meaningOf(e, view.finds));
  return tone ? { background: `color-mix(in srgb, ${TONE_VAR[tone]} 12%, var(--color-surface))` } : undefined;
};

/** The page of a snapping scroller in view, kept in state while it scrolls; `go` scrolls smoothly to another page. */
function usePager(count: number, start: number, axis: "x" | "y") {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(start);
  const still = useReducedMotion();
  const size = useCallback((el: HTMLElement) => (axis === "x" ? el.clientWidth : el.clientHeight), [axis]);
  const offsetOf = useCallback(
    (el: HTMLElement, i: number) => {
      const child = el.children[i] as HTMLElement | undefined;
      return child ? (axis === "x" ? child.offsetLeft : child.offsetTop) : 0;
    },
    [axis],
  );
  // open on the start page without a visible scroll
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTo({ [axis === "x" ? "left" : "top"]: offsetOf(el, start), behavior: "instant" as ScrollBehavior });
    setIndex(start);
  }, [start, axis, offsetOf]);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const pos = axis === "x" ? el.scrollLeft : el.scrollTop;
        let best = 0;
        for (let i = 0; i < el.children.length; i++) if (Math.abs(offsetOf(el, i) - pos) < Math.abs(offsetOf(el, best) - pos)) best = i;
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [axis, offsetOf, size]);
  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const to = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ [axis === "x" ? "left" : "top"]: offsetOf(el, to), behavior: still ? "auto" : "smooth" });
    setIndex(to);
  };
  return { ref, index, go };
}

function Toolbar({ title, sub, onPrev, onNext, onToday, prevLabel, nextLabel, vertical, canPrev, canNext, extra }: { title: string; sub?: string; onPrev: () => void; onNext: () => void; onToday: () => void; prevLabel: string; nextLabel: string; vertical?: boolean; canPrev: boolean; canNext: boolean; extra?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex items-center">
        <button type="button" aria-label={prevLabel} disabled={!canPrev} onClick={onPrev} className={iconButton}>
          {vertical ? <ChevronUp className="size-4" aria-hidden /> : <ChevronLeft className="size-4" aria-hidden />}
        </button>
        <button type="button" aria-label={nextLabel} disabled={!canNext} onClick={onNext} className={iconButton}>
          {vertical ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
        </button>
      </span>
      <button type="button" onClick={onToday} className={quietButton}>
        Heute
      </button>
      <span className={cn("ml-1 flex min-w-0 items-baseline gap-2", vertical && "max-md:hidden")} aria-live="polite">
        <span className="truncate font-medium">{title}</span>
        {sub && <span className="shrink-0 text-xs text-fg-muted tabular-nums">{sub}</span>}
      </span>
      {extra && <span className="ml-auto shrink-0">{extra}</span>}
    </div>
  );
}

function EventCard({ e, view, chosen, onSelect }: { e: TimelineEvent; view: TimelineView; chosen: string | null; onSelect: (s: Selection) => void }) {
  const isChosen = chosen === e.id;
  return (
    <button
      type="button"
      onClick={() => onSelect({ kind: "event", id: e.id })}
      aria-pressed={isChosen}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg px-2 py-1.5 text-left shadow-ring outline-none transition-shadow hover:shadow-[inset_0_0_0_1px_var(--color-fg-faint)] focus-visible:outline-2 focus-visible:outline-accent",
        e.lane === "rechnung" ? "bg-sidebar" : "bg-surface",
        isChosen && "shadow-[inset_0_0_0_1.5px_var(--color-fg)]",
      )}
      style={wash(e, view)}
    >
      <span className="flex items-center gap-1.5">
        <Mark e={e} view={view} size={9} />
        {e.time && <span className="text-[11px] text-fg-secondary tabular-nums">{e.time}</span>}
        {e.finds[0] && <span className="ml-auto rounded-[4px] bg-surface/80 px-1 text-[11px] text-count shadow-ring">{e.finds[0]}</span>}
      </span>
      <span className={cn("line-clamp-2 text-xs leading-4", e.lane === "rechnung" && "text-fg-secondary")}>{e.lane === "rechnung" && e.amount ? `${e.title}, ${keep(e.amount)}` : e.title}</span>
    </button>
  );
}

/**
 * Week: seven day columns from Monday, weekends shaded; in each day the events without a time on top, the timed ones
 * (WhatsApp-Meldungen, photos) below at their hour. Weeks lie side by side and snap: a swipe, a trackpad, the arrows
 * or the arrow keys move one week; "Heute" goes to the week of the Stand.
 */
export function WeekView({ view, shown, chosen, onSelect, startDay, extra }: { view: TimelineView; shown: TimelineEvent[]; chosen: string | null; onSelect: (s: Selection) => void; startDay: string; extra?: React.ReactNode }) {
  const weeks = useMemo(() => weeksBetween(view.range.from, view.range.to > view.asOf.iso ? view.range.to : addDays(view.asOf.iso, 7)), [view]);
  const byDay = useMemo(() => new Map(groupByDay(shown).map((d) => [d.iso, d.events])), [shown]);
  const start = Math.max(0, weeks.indexOf(mondayOf(startDay)));
  const { ref, index, go } = usePager(weeks.length, start, "x");
  const monday = weeks[index] ?? weeks[0];
  // how much lies before and after this week, so an empty week still says where to go
  const before = shown.filter((e) => e.date.iso < monday).length;
  const after = shown.filter((e) => e.date.iso >= addDays(monday, 7)).length;
  const sub = [`Kalenderwoche ${weekNumber(monday)}`, before ? `${before} früher` : null, after ? `${after} später` : null].filter(Boolean).join(" · ");
  return (
    <div className="flex flex-col gap-3">
      <Toolbar
        title={weekTitle(monday)}
        sub={sub}
        prevLabel="Vorige Woche"
        nextLabel="Nächste Woche"
        canPrev={index > 0}
        canNext={index < weeks.length - 1}
        onPrev={() => go(index - 1)}
        onNext={() => go(index + 1)}
        onToday={() => go(weeks.indexOf(mondayOf(view.asOf.iso)))}
        extra={extra}
      />
      <div
        ref={ref}
        tabIndex={0}
        aria-label="Wochen, mit den Pfeiltasten blättern"
        onKeyDown={(k) => {
          if (k.key === "ArrowLeft" || k.key === "ArrowRight") {
            k.preventDefault();
            go(index + (k.key === "ArrowRight" ? 1 : -1));
          }
        }}
        className="relative flex snap-x snap-mandatory items-start overflow-x-auto overscroll-x-contain rounded-xl shadow-ring outline-none [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-accent"
      >
        {weeks.map((w) => (
          <div key={w} className="grid w-full shrink-0 snap-start grid-cols-7" aria-label={weekTitle(w)} role="group">
            {Array.from({ length: 7 }, (_, i) => addDays(w, i)).map((d, i) => {
              const events = byDay.get(d) ?? [];
              const today = d === view.asOf.iso;
              const deadline = d === view.deadline?.iso;
              return (
                <div key={d} className={cn("flex min-h-40 min-w-0 flex-col gap-1.5 p-1.5", i > 0 && "shadow-[inset_1px_0_0_0_var(--color-line)]", isWeekend(d) && "bg-fill-subtle")}>
                  <span className="flex h-7 items-center gap-1.5 px-1 text-xs text-fg-secondary">
                    <span>{WEEKDAYS_SHORT[i]}</span>
                    <span className={cn("flex h-6 min-w-6 items-center justify-center rounded-full px-1 tabular-nums", today ? "bg-fg font-medium text-surface" : "text-fg")}>{Number(d.slice(8, 10))}</span>
                    {today && <span className="truncate text-[11px] text-fg-muted">Stand</span>}
                  </span>
                  {deadline && (
                    <span className="flex items-center gap-1.5 rounded-md px-1.5 py-1 text-[11px] text-state-red-edge" style={{ background: `color-mix(in srgb, ${TONE_VAR.risk} 10%, transparent)` }}>
                      <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-data-risk" />
                      <span className="truncate">Schlussrechnung legen bis</span>
                    </span>
                  )}
                  {events.map((e) => (
                    <EventCard key={e.id} e={e} view={view} chosen={chosen} onSelect={onSelect} />
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Month: month grids stacked from top to bottom that snap like a phone calendar; each day shows its events as small
 * chips in their tone and "weitere" beyond three. A click on a chip opens the event, a click on the day its list.
 */
export function MonthView({ view, shown, chosen, onSelect, startDay, compact = false, extra }: { view: TimelineView; shown: TimelineEvent[]; chosen: string | null; onSelect: (s: Selection) => void; startDay: string; compact?: boolean; extra?: React.ReactNode }) {
  const months = useMemo(() => monthsBetween(view.range.from, view.range.to > view.asOf.iso ? view.range.to : addDays(view.asOf.iso, 1)), [view]);
  const byDay = useMemo(() => new Map(groupByDay(shown).map((d) => [d.iso, d.events])), [shown]);
  const start = Math.max(0, months.indexOf(monthOf(startDay)));
  const { ref, index, go } = usePager(months.length, start, "y");
  return (
    <div className="flex flex-col gap-3">
      <Toolbar
        title={monthTitle(months[index] ?? months[0])}
        prevLabel="Voriger Monat"
        nextLabel="Nächster Monat"
        vertical
        canPrev={index > 0}
        canNext={index < months.length - 1}
        onPrev={() => go(index - 1)}
        onNext={() => go(index + 1)}
        onToday={() => go(months.indexOf(monthOf(view.asOf.iso)))}
        extra={extra}
      />
      <div className="grid grid-cols-7 px-px text-[11px] text-fg-muted">
        {WEEKDAYS_SHORT.map((d) => (
          <span key={d} className="px-2">
            {d}
          </span>
        ))}
      </div>
      <div
        ref={ref}
        tabIndex={0}
        aria-label="Monate, mit den Pfeiltasten blättern"
        onKeyDown={(k) => {
          if (k.key === "ArrowUp" || k.key === "ArrowDown" || k.key === "PageUp" || k.key === "PageDown") {
            k.preventDefault();
            go(index + (k.key === "ArrowDown" || k.key === "PageDown" ? 1 : -1));
          }
        }}
        className={cn("relative flex snap-y snap-mandatory flex-col overflow-y-auto overscroll-y-contain rounded-xl shadow-ring outline-none [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-accent", compact ? "h-[min(70dvh,520px)]" : "h-[min(calc(100dvh-260px),640px)] min-h-[440px]")}
      >
        {months.map((first) => {
          const grid = monthGrid(first);
          return (
            <section key={first} aria-label={monthTitle(first)} className="flex shrink-0 snap-start flex-col">
              <h3 className="sticky top-0 z-10 bg-surface/95 px-3 py-2 text-sm font-medium backdrop-blur-sm shadow-line-bottom">{monthTitle(first)}</h3>
              <div className="grid grid-cols-7">
                {grid.flat().map(({ iso, inMonth }, i) => {
                  const events = inMonth ? (byDay.get(iso) ?? []) : [];
                  const today = iso === view.asOf.iso;
                  const deadline = inMonth && iso === view.deadline?.iso;
                  return (
                    <div
                      key={iso}
                      className={cn("relative flex min-w-0 flex-col gap-1 p-1 shadow-[inset_0_-1px_0_0_var(--color-line)]", compact ? "h-16" : "h-[104px]", i % 7 > 0 && "shadow-[inset_1px_-1px_0_0_var(--color-line)]", (!inMonth || isWeekend(iso)) && "bg-fill-subtle", deadline && "bg-[color-mix(in_srgb,var(--color-data-risk)_8%,transparent)]")}
                    >
                      {inMonth && (
                        <button
                          type="button"
                          onClick={() => onSelect({ kind: "day", iso })}
                          aria-label={`${dayShort(iso)} ${monthTitle(first)}, ${events.length === 1 ? "1 Ereignis" : `${events.length} Ereignisse`}`}
                          className="absolute inset-0 rounded-sm outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                        />
                      )}
                      <span className={cn("pointer-events-none relative flex h-5 w-fit min-w-5 items-center justify-center rounded-full px-1 text-xs tabular-nums", !inMonth ? "text-fg-faint" : today ? "bg-fg font-medium text-surface" : "text-fg-secondary")}>{Number(iso.slice(8, 10))}</span>
                      {compact ? (
                        <span className="pointer-events-none relative flex flex-wrap gap-0.5 px-0.5">
                          {events.slice(0, 6).map((e) => (
                            <Mark key={e.id} e={e} view={view} size={7} />
                          ))}
                        </span>
                      ) : (
                        <>
                          {events.slice(0, events.length > 3 ? 2 : 3).map((e) => (
                            <button
                              key={e.id}
                              type="button"
                              onClick={() => onSelect({ kind: "event", id: e.id })}
                              aria-pressed={chosen === e.id}
                              className={cn("relative flex h-5 min-w-0 items-center gap-1 rounded-[5px] px-1 text-left text-[11px] outline-none hover:shadow-[inset_0_0_0_1px_var(--color-fg-faint)] focus-visible:outline-2 focus-visible:outline-accent", chosen === e.id && "shadow-[inset_0_0_0_1.5px_var(--color-fg)]", e.lane === "rechnung" && "text-fg-secondary")}
                              style={wash(e, view)}
                            >
                              <Mark e={e} view={view} size={7} />
                              <span className="truncate">{e.title}</span>
                            </button>
                          ))}
                          {events.length > 3 && <span className="pointer-events-none relative px-1 text-[11px] text-fg-muted">{events.length - 2} weitere</span>}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Phones: one day per page, swiped sideways like a calendar app; above it the seven days of its week, each with a dot
 * where something happened, a tap jumps there. A day lists its events by moment.
 */
export function DayPager({ view, shown, chosen, onSelect, startDay, extra }: { view: TimelineView; shown: TimelineEvent[]; chosen: string | null; onSelect: (s: Selection) => void; startDay: string; extra?: React.ReactNode }) {
  const weeks = useMemo(() => weeksBetween(view.range.from, view.range.to > view.asOf.iso ? view.range.to : addDays(view.asOf.iso, 7)), [view]);
  const days = useMemo(() => weeks.flatMap((w) => Array.from({ length: 7 }, (_, i) => addDays(w, i))), [weeks]);
  const byDay = useMemo(() => new Map(groupByDay(shown).map((d) => [d.iso, d.events])), [shown]);
  const start = Math.max(0, days.indexOf(startDay));
  const { ref, index, go } = usePager(days.length, start, "x");
  const day = days[index] ?? days[0];
  const monday = mondayOf(day);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 px-4">
        {extra}
        <button type="button" onClick={() => go(days.indexOf(view.asOf.iso))} className={cn(quietButton, "relative shrink-0 before:absolute before:-inset-y-1.5 before:inset-x-0")}>
          Heute
        </button>
      </div>
      <p className="flex items-baseline gap-2 px-4 pt-1" aria-live="polite">
        <span className="font-medium">{weekTitle(monday)}</span>
        <span className="text-xs text-fg-muted tabular-nums">Kalenderwoche {weekNumber(monday)}</span>
      </p>
      <div className="grid grid-cols-7 px-2">
        {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((d, i) => {
          const has = (byDay.get(d) ?? []).length > 0;
          return (
            <button key={d} type="button" onClick={() => go(days.indexOf(d))} aria-pressed={d === day} className="flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-accent">
              <span className="text-[11px] text-fg-muted">{WEEKDAYS_SHORT[i]}</span>
              <span className={cn("flex size-7 items-center justify-center rounded-full text-sm tabular-nums", d === day ? "bg-fg font-medium text-surface" : d === view.asOf.iso ? "shadow-[inset_0_0_0_1px_var(--color-fg)]" : "")}>{Number(d.slice(8, 10))}</span>
              <span aria-hidden className={cn("size-1 rounded-full", has ? "bg-fg-secondary" : "bg-transparent")} />
            </button>
          );
        })}
      </div>
      <div ref={ref} className="relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
        {days.map((d) => {
          const events = byDay.get(d) ?? [];
          return (
            <div key={d} className="min-h-[260px] w-full shrink-0 snap-start px-4 pt-1" role="group" aria-label={d}>
              {d === view.deadline?.iso && (
                <p className="mb-2 flex items-center gap-1.5 text-xs text-state-red-edge">
                  <span aria-hidden className="size-1.5 rounded-full bg-data-risk" />
                  Schlussrechnung legen bis {view.deadline.text}
                </p>
              )}
              {events.length === 0 ? (
                <p className="py-10 text-center text-fg-muted">An diesem Tag ist nichts passiert.</p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {events.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => onSelect({ kind: "event", id: e.id })}
                        aria-pressed={chosen === e.id}
                        className="flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left shadow-ring outline-none focus-visible:outline-2 focus-visible:outline-accent"
                        style={wash(e, view)}
                      >
                        <Mark e={e} view={view} />
                        {e.time && <span className="shrink-0 text-xs text-fg-secondary tabular-nums">{e.time}</span>}
                        <span className="min-w-0 flex-1 truncate">{e.lane === "rechnung" && e.amount ? `${e.title}, ${keep(e.amount)}` : e.title}</span>
                        {e.finds[0] && <span className="rounded-[4px] bg-surface/80 px-1 text-xs text-count shadow-ring">{e.finds[0]}</span>}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
