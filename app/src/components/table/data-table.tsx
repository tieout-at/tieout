"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  Eye,
  EyeOff,
  Kanban,
  ListFilter,
  Minus,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Table,
  X,
  type LucideIcon,
} from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  applyFilters,
  applySort,
  countText,
  filterOptions,
  footerSum,
  readState,
  uniformColumns,
  type Access,
  type Calculation,
  type Noun,
  type Row,
  type View,
  type ViewState,
} from "@/lib/table";

/** A quick filter of a table: a word, an optional dot colour (a CSS colour or variable) and which rows it keeps. */
export type QuickFilter<R> = { id: string; title: string; dot?: string; match: (r: R) => boolean };

export type Column<R> = Access<R> & {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Width in px (Attio's default is 180 to 288); the first column stays fixed at the left (132 px on phones, so the amounts stay in view). */
  width: number;
  align?: "right";
  cell: (r: R) => ReactNode;
  /** Fixed sums from `kern/` this column's footer can show. */
  calculations?: Calculation[];
  /** A second fixed sum shown under the chosen one in the same footer cell, never added to it ("in Klärung" under
   * "zusätzlich verrechenbar"); shown only when the rows in view have it. */
  alsoSum?: string;
  /** The column whose first sum this column's sum is a part of ("davon mit Kürzungsrisiko" under "zusätzlich
   * verrechenbar"): in the phone list it stands right under that sum, indented, before any sum that is not added. */
  sumUnder?: string;
};

/**
 * Table in Attio's layout (measured 24.10.2026 on app.attio.com, "Companies"): view bar and sort and filter bar of
 * 48 px, header 40 px, rows 36 px with 1 px lines, the first column 250 px and fixed, checkboxes, a "+" to add a
 * column, and the footer with the counter and a sum per column. The view is remembered in the browser. A view of the
 * kind "board" shows the same sorted and filtered rows as Attio's kanban ("Pipeline"), drawn by the page.
 */
export function DataTable<R extends Row>({
  name,
  rows,
  columns,
  views,
  noun,
  board,
  phoneRow,
  selectable = true,
  quick,
  onOpen,
  openId = null,
  sumsBelow = false,
}: {
  /** Key under which the browser remembers the view. */
  name: string;
  rows: R[];
  columns: Column<R>[];
  views: View[];
  noun: Noun;
  /** Draws the rows of a board view, sorted and filtered like the table. */
  board?: (visible: R[]) => ReactNode;
  /** Below 768 px the rows become a list, each row drawn by the page, instead of the wide grid (customer test 2). */
  phoneRow?: (r: R) => ReactNode;
  /** false for a table without any action on a selection (Positionen): no checkboxes, more room for the columns. */
  selectable?: boolean;
  /** Quick filters as one segmented row with counts (step 8d), on top of the view's own filters; the first shows all. */
  quick?: QuickFilter<R>[];
  /** A click on a row opens its peek (the page draws it in a SideWindow) instead of leaving the page; links in it still lead on. */
  onOpen?: (r: R) => void;
  /** The row whose peek is open, marked like a selected row. */
  openId?: string | null;
  /** The footer sums in one row over the full width (label beside amount) instead of in their narrow columns. */
  sumsBelow?: boolean;
}) {
  const storageKey = `tieout.tabelle.${name}`;
  const ids = columns.map((c) => c.id);
  const [viewId, setViewId] = useState(views[0].id);
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const [state, setState] = useState<ViewState>(view.state);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [quickId, setQuickId] = useState<string | null>(null);
  const loaded = useRef(false);

  // The static page renders the view's own state; a saved one replaces it after the first paint.
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as { view?: string; state?: unknown } | null;
      const v = views.find((x) => x.id === saved?.view);
      if (v) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
        setViewId(v.id);
        setState(readState(JSON.stringify(saved?.state ?? null), v.state, ids));
      }
    } catch {
      // no storage: keep the view as built
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ view: viewId, state }));
    } catch {
      // storage blocked: the view still works for this visit
    }
  }, [storageKey, viewId, state]);

  const access = useMemo(() => Object.fromEntries(columns.map((c) => [c.id, c])), [columns]);
  const filtered = useMemo(() => applySort(applyFilters(rows, state.filters, access), state.sort, access), [rows, state.filters, state.sort, access]);
  const quickOn = quick?.find((q) => q.id === quickId) ?? null;
  const visible = useMemo(() => (quickOn ? filtered.filter(quickOn.match) : filtered), [filtered, quickOn]);
  // a column with the same value in every row hides itself until it is asked for ("+" or "Ansicht")
  const uniform = useMemo(() => uniformColumns(rows, columns.slice(1)), [rows, columns]);
  const [forced, setForced] = useState<string[]>([]);
  const hidden = [...state.hidden, ...uniform.filter((id) => !forced.includes(id) && !state.hidden.includes(id))];
  const shown = columns.filter((c, i) => i === 0 || !hidden.includes(c.id));
  const isBoard = view.kind === "board" && board !== undefined;

  const switchView = (v: View) => {
    setViewId(v.id);
    setState(v.state);
    setSelected(new Set());
    // the quick filters are not shown on the board, so none may stay on unseen
    setQuickId(null);
  };
  const update = (patch: Partial<ViewState>) => {
    if (patch.hidden) setForced(uniform.filter((id) => !patch.hidden!.includes(id)));
    setState((s) => ({ ...s, ...patch }));
  };
  const toggleRow = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allSelected = visible.length > 0 && visible.every((r) => selected.has(r.id));
  const someSelected = visible.some((r) => selected.has(r.id));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ViewBar
        views={views}
        view={view}
        onView={switchView}
        columns={columns}
        state={{ ...state, hidden }}
        onState={update}
        onReset={() => setState(view.state)}
        board={isBoard}
        selected={selected.size}
        onClearSelection={() => setSelected(new Set())}
        quick={quick?.map((q) => ({ id: q.id, title: q.title, dot: q.dot, count: filtered.filter(q.match).length }))}
        quickId={quickOn?.id ?? quick?.[0]?.id ?? null}
        onQuick={(id) => setQuickId(id === quick?.[0]?.id ? null : id)}
      />
      <SortFilterBar rows={rows} columns={columns} state={state} onState={update} />

      {isBoard ? (
        <div className="relative flex min-h-0 flex-1 flex-col">{board(visible)}</div>
      ) : (
        <>
          {phoneRow && list(phoneRow)}
          {grid()}
        </>
      )}
    </div>
  );

  function empty(className: string) {
    return (
      <div className={cn("flex flex-col items-center gap-3 px-4 py-16 text-center", className)}>
        <p className="text-fg-secondary">Keine {noun.many} für diesen Filter.</p>
        <button
          type="button"
          onClick={() => update({ filters: [] })}
          className="flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 shadow-button hover:bg-row-hover max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0"
        >
          <RotateCcw className="size-4 text-fg-secondary" aria-hidden />
          Filter entfernen
        </button>
      </div>
    );
  }

  // the phone list: one row per entry as the page draws it, then the counter and the fixed sums the footer would show
  function list(row: (r: R) => ReactNode) {
    type PhoneSum = { id: string; title: string; text: string | null; part?: boolean };
    const firsts = new Map<string, PhoneSum>();
    const alsos: PhoneSum[] = [];
    for (const c of shown) {
      const result = c.calculations?.length ? footerSum(c.calculations, state.calculations[c.id] ?? null, visible) : null;
      if (!result) continue;
      const chosen = c.calculations!.find((x) => x.id === state.calculations[c.id])?.title ?? c.title;
      // without the column head above it, a plain "Summe" says which column it adds up
      firsts.set(c.id, "cut" in result ? { id: c.id, title: chosen, text: null } : { id: c.id, title: result.calculation.title === "Summe" ? c.title : result.calculation.title, text: result.sum.text });
      const also = alsoResult(c, state.calculations[c.id] ?? null, visible);
      if (also) alsos.push({ id: `${c.id}-also`, title: `${also.calculation.title}, nicht addiert`, text: also.sum.text });
    }
    // a part stands right under the sum it belongs to; the sums that are not added come last
    const parts = new Set(shown.filter((c) => c.sumUnder && firsts.has(c.id) && firsts.has(c.sumUnder)).map((c) => c.id));
    const sums: PhoneSum[] = [
      ...shown.flatMap((c) => {
        if (!firsts.has(c.id) || parts.has(c.id)) return [];
        const under = shown.filter((p) => parts.has(p.id) && p.sumUnder === c.id).map((p) => ({ ...firsts.get(p.id)!, part: true }));
        return [firsts.get(c.id)!, ...under];
      }),
      ...alsos,
    ];
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:hidden">
        <ul aria-label={view.title}>
          {visible.map((r) => (
            <li key={r.id} className="shadow-line-bottom">
              {row(r)}
            </li>
          ))}
        </ul>
        {visible.length === 0 && empty("")}
        <div className="flex-1" />
        <div className="sticky bottom-0 flex flex-col gap-0.5 bg-surface px-4 py-2 shadow-[inset_0_1px_0_var(--color-line)]">
          <span className="text-fg-secondary">{countText(visible.length, rows.length, noun)}</span>
          {sums.map((s) => (
            <span key={s.id} className={cn("flex items-baseline justify-between gap-3", s.part && "pl-3")}>
              <span className="text-xs text-fg-secondary">{s.title}</span>
              {s.text ? <span className="tabular-nums">{s.text}</span> : <span className="text-xs text-fg-muted">nicht gerechnet</span>}
            </span>
          ))}
        </div>
      </div>
    );
  }

  // a plain function, not a component, so the grid keeps its scroll position between renders
  function grid() {
    return (
      <div
        role="table"
        aria-label={view.title}
        style={{ "--first-column": `${columns[0].width}px` } as React.CSSProperties}
        aria-rowcount={visible.length + 2}
        className={cn("relative min-h-0 flex-1 overflow-auto overscroll-x-none", phoneRow && "max-md:hidden")}
      >
        <div className="flex min-h-full w-max min-w-full flex-col">
          <div role="rowgroup" className="sticky top-0 z-20 bg-surface">
            <div role="row" className="flex h-10">
              {shown.map((c, i) => (
                <HeaderCell
                  key={c.id}
                  column={c}
                  first={i === 0}
                  sort={state.sort?.column === c.id ? state.sort.direction : null}
                  onSort={(direction) => update({ sort: { column: c.id, direction } })}
                  onHide={() => update({ hidden: [...hidden, c.id] })}
                >
                  {i === 0 && selectable && (
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "mixed" : false}
                      label="Alle auswählen"
                      onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((r) => r.id)))}
                    />
                  )}
                </HeaderCell>
              ))}
              <div role="columnheader" className="flex min-w-14 flex-1 items-center border-b border-line px-2">
                <AddColumn columns={columns} hidden={hidden} onShow={(id) => update({ hidden: hidden.filter((h) => h !== id) })} />
              </div>
            </div>
          </div>

          <div role="rowgroup">
            {visible.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <div
                  key={r.id}
                  role="row"
                  aria-selected={isSelected || openId === r.id}
                  tabIndex={onOpen ? 0 : undefined}
                  onClick={onOpen ? (e) => !(e.target as HTMLElement).closest("a,button,input,label") && onOpen(r) : undefined}
                  onKeyDown={onOpen ? (e) => e.key === "Enter" && e.target === e.currentTarget && onOpen(r) : undefined}
                  className={cn("group flex h-9 outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent max-md:h-11", (isSelected || openId === r.id) && "is-selected", onOpen && "cursor-pointer")}
                >
                  {shown.map((c, i) => (
                    <div
                      key={c.id}
                      role={i === 0 ? "rowheader" : "cell"}
                      style={i === 0 ? undefined : { width: c.width }}
                      className={cn(
                        "flex shrink-0 items-center overflow-hidden border-r border-b border-line bg-surface px-3 whitespace-nowrap group-hover:bg-row-hover group-[.is-selected]:bg-row-selected",
                        i === 0 && "sticky left-0 z-10 w-[132px] gap-2.5 md:w-[var(--first-column)]",
                        c.align === "right" && "justify-end text-right tabular-nums",
                      )}
                    >
                      {i === 0 && selectable && <Checkbox checked={isSelected} label="Auswählen" onChange={() => toggleRow(r.id)} />}
                      {c.cell(r)}
                    </div>
                  ))}
                  <div role="cell" className="min-w-14 flex-1 border-b border-line group-hover:bg-row-hover group-[.is-selected]:bg-row-selected" />
                </div>
              );
            })}
          </div>

          {visible.length === 0 && empty("sticky left-0 w-[min(100%,100vw)]")}
          <div className="flex-1" />

          <div role="rowgroup" className="sticky bottom-0 z-20 bg-surface">
            <div role="row" className="flex min-h-9 shadow-[inset_0_1px_0_var(--color-line)] max-md:min-h-11">
              {sumsBelow ? (
                <>
                  <div role="cell" className="sticky left-0 z-10 flex w-[132px] shrink-0 items-center justify-end border-r border-line bg-surface px-3 text-fg-secondary md:w-[var(--first-column)]">
                    <span aria-live="polite">{countText(visible.length, rows.length, noun)}</span>
                  </div>
                  <div role="cell" className="flex min-w-0 flex-1 flex-wrap items-center gap-x-6 gap-y-1 px-3 py-1">
                    {/* each sum, a part right after the sum it belongs to, the sums that are not added last */}
                    {shown
                      .filter((c) => c.calculations?.length && !(c.sumUnder && shown.some((u) => u.id === c.sumUnder)))
                      .flatMap((c) => [c, ...shown.filter((p) => p.sumUnder === c.id && p.calculations?.length)])
                      // only sums that are chosen: an empty "+ Summe" would leave a gap in the row
                      .filter((c) => footerSum(c.calculations!, state.calculations[c.id] ?? null, visible))
                      .map((c) => (
                        <FooterSum key={c.id} inline noAlso column={c} chosen={state.calculations[c.id] ?? null} visible={visible} onChoose={(id) => update({ calculations: { ...state.calculations, [c.id]: id } })} />
                      ))}
                    {shown.map((c) => {
                      const also = alsoResult(c, state.calculations[c.id] ?? null, visible);
                      return also ? (
                        <span key={`${c.id}-also`} className="px-2">
                          <SumLine inline title={`${also.calculation.title}, nicht addiert`} text={also.sum.text} />
                        </span>
                      ) : null;
                    })}
                  </div>
                </>
              ) : (
                shown.map((c, i) =>
                i === 0 ? (
                  <div
                    key={c.id}
                    role="cell"
                    className="sticky left-0 z-10 flex w-[132px] shrink-0 items-center justify-end border-r border-line bg-surface px-3 text-fg-secondary md:w-[var(--first-column)]"
                  >
                    <span aria-live="polite">{countText(visible.length, rows.length, noun)}</span>
                  </div>
                ) : (
                  <div key={c.id} role="cell" style={{ width: c.width }} className="flex shrink-0 border-r border-line">
                    {c.calculations?.length ? (
                      <FooterSum
                        column={c}
                        chosen={state.calculations[c.id] ?? null}
                        visible={visible}
                        onChoose={(id) => update({ calculations: { ...state.calculations, [c.id]: id } })}
                      />
                    ) : null}
                  </div>
                ),
                )
              )}
              {!sumsBelow && <div role="cell" className="min-w-14 flex-1" />}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function ViewBar<R>({
  views,
  view,
  onView,
  columns,
  state,
  onState,
  onReset,
  board,
  selected,
  onClearSelection,
  quick,
  quickId,
  onQuick,
}: {
  views: View[];
  view: View;
  onView: (v: View) => void;
  columns: Column<R>[];
  state: ViewState;
  onState: (patch: Partial<ViewState>) => void;
  onReset: () => void;
  board: boolean;
  selected: number;
  onClearSelection: () => void;
  quick?: { id: string; title: string; dot?: string; count: number }[];
  quickId: string | null;
  onQuick: (id: string) => void;
}) {
  const changed = JSON.stringify(state) !== JSON.stringify(view.state);
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 px-3 max-xl:h-auto max-xl:min-h-12 max-xl:flex-wrap max-xl:py-2">
      <DropdownMenu>
        <DropdownMenuTrigger className={barButton}>
          <span className="flex size-4 items-center justify-center rounded-xs bg-fg text-white" aria-hidden>
            {view.icon ? <view.icon className="size-3" /> : board ? <Kanban className="size-3" /> : <Table className="size-3" />}
          </span>
          <span className="max-w-56 truncate">{view.title}</span>
          <ChevronDown className="size-4 text-fg-secondary" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ansichten</DropdownMenuLabel>
            {views.map((v) => (
              <DropdownMenuItem key={v.id} onClick={() => onView(v)}>
                {v.icon ? <v.icon /> : v.kind === "board" ? <Kanban /> : <Table />}
                <span className="flex-1">{v.title}</span>
                {v.id === view.id && <Check aria-label="gewählt" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {!board && (
        <Popover>
          <PopoverTrigger className={barButton}>
            <SlidersHorizontal className="size-4 text-fg-secondary" aria-hidden />
            Ansicht
            <ChevronDown className="size-4 text-fg-secondary" aria-hidden />
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <PopoverTitle>Spalten</PopoverTitle>
            <ul>
              {columns.slice(1).map((c) => {
                const hidden = state.hidden.includes(c.id);
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      aria-pressed={!hidden}
                      onClick={() => onState({ hidden: hidden ? state.hidden.filter((h) => h !== c.id) : [...state.hidden, c.id] })}
                      className={menuItem}
                    >
                      <c.icon className="size-4 text-fg-secondary" aria-hidden />
                      <span className={cn("flex-1 text-left", hidden && "text-fg-muted")}>{c.title}</span>
                      {hidden ? <EyeOff className="size-4 text-fg-faint" aria-label="ausgeblendet" /> : <Eye className="size-4 text-fg-secondary" aria-label="sichtbar" />}
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="-mx-1 my-1 h-px bg-line" />
            <button type="button" disabled={!changed} onClick={onReset} className={cn(menuItem, "disabled:text-fg-muted")}>
              <RotateCcw className="size-4 text-fg-secondary" aria-hidden />
              Ansicht zurücksetzen
            </button>
          </PopoverContent>
        </Popover>
      )}

      {quick && quick.length > 0 && !board && (
        // a segmented control from 1280 px; below that chips that wrap (nothing hidden at the edge), each with a 44 px tap
        <div role="radiogroup" aria-label="Schnellfilter" className="flex h-8 max-w-full items-center gap-0.5 rounded-lg bg-fill-hover p-0.5 max-xl:order-last max-xl:h-auto max-xl:w-full max-xl:flex-wrap max-xl:gap-1.5 max-xl:bg-transparent max-xl:p-0">
          {quick.map((q) => (
            <button
              key={q.id}
              type="button"
              role="radio"
              aria-checked={quickId === q.id}
              onClick={() => onQuick(q.id)}
              className={cn(
                "flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:outline-accent max-xl:relative max-xl:h-9 max-xl:rounded-lg max-xl:px-2.5 max-xl:before:absolute max-xl:before:-inset-y-1 max-xl:before:inset-x-0",
                quickId === q.id ? "bg-surface text-fg shadow-button max-xl:shadow-[inset_0_0_0_1.5px_var(--color-fg)]" : "text-fg-secondary hover:text-fg max-xl:bg-fill-subtle max-xl:shadow-ring",
              )}
            >
              {q.dot && <span aria-hidden className="size-2 shrink-0 rounded-full" style={{ background: q.dot }} />}
              {q.title}
              <span className="text-xs text-fg-muted tabular-nums">{q.count}</span>
            </button>
          ))}
        </div>
      )}

      {selected > 0 && (
        <div className="ml-auto flex items-center gap-2">
          <span className="text-fg-secondary">{selected} ausgewählt</span>
          <button type="button" onClick={onClearSelection} className={cn(barButton, "bg-transparent shadow-none hover:bg-fill-hover")}>
            <X className="size-4 text-fg-secondary" aria-hidden />
            Auswahl aufheben
          </button>
        </div>
      )}
    </div>
  );
}

function SortFilterBar<R>({ rows, columns, state, onState }: { rows: R[]; columns: Column<R>[]; state: ViewState; onState: (patch: Partial<ViewState>) => void }) {
  const sortable = columns.filter((c) => c.sortValue);
  const sortColumn = columns.find((c) => c.id === state.sort?.column);
  const filters = state.filters.filter((f) => f.values.length);
  return (
    <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-3 py-2.5 shadow-line-bottom">
      <Popover>
        <PopoverTrigger className={cn(barButton, "px-2")}>
          <ArrowUpDown className="size-4 text-fg-secondary" aria-hidden />
          {sortColumn ? (
            <>
              <span className="text-fg-secondary">Sortiert nach</span>
              <span>{sortColumn.title}</span>
              <span className="sr-only">{state.sort?.direction === "asc" ? "aufsteigend" : "absteigend"}</span>
            </>
          ) : (
            <span className="text-fg-secondary">Sortieren</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <PopoverTitle>Sortieren nach</PopoverTitle>
          <ul>
            {sortable.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => onState({ sort: { column: c.id, direction: state.sort?.direction ?? "asc" } })} className={menuItem}>
                  <c.icon className="size-4 text-fg-secondary" aria-hidden />
                  <span className="flex-1 text-left">{c.title}</span>
                  {state.sort?.column === c.id && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
                </button>
              </li>
            ))}
          </ul>
          {state.sort && (
            <>
              <div className="-mx-1 my-1 h-px bg-line" />
              <div className="grid grid-cols-2 gap-1">
                {(["asc", "desc"] as const).map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={state.sort?.direction === d}
                    onClick={() => onState({ sort: { column: state.sort!.column, direction: d } })}
                    className={cn(menuItem, "justify-center", state.sort?.direction === d && "bg-fill-hover")}
                  >
                    {d === "asc" ? <ArrowUpNarrowWide className="size-4 text-fg-secondary" aria-hidden /> : <ArrowDownWideNarrow className="size-4 text-fg-secondary" aria-hidden />}
                    {d === "asc" ? "Aufsteigend" : "Absteigend"}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => onState({ sort: null })} className={menuItem}>
                <X className="size-4 text-fg-secondary" aria-hidden />
                Sortierung entfernen
              </button>
            </>
          )}
        </PopoverContent>
      </Popover>

      <span aria-hidden className="h-4 w-px bg-line" />

      {filters.map((f) => {
        const c = columns.find((x) => x.id === f.column)!;
        return (
          <div key={f.column} className="flex h-7 items-center rounded-md bg-surface shadow-button max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0">
            <Popover>
              <PopoverTrigger className="flex h-full max-w-72 items-center gap-1.5 rounded-l-md pr-1 pl-2 outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent">
                <c.icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                <span className="text-fg-secondary">{c.title}</span>
                <span className="truncate">{f.values.join(", ")}</span>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <FilterValues rows={rows} column={c} values={f.values} onValues={(values) => onState({ filters: setFilter(state.filters, c.id, values) })} />
              </PopoverContent>
            </Popover>
            <button
              type="button"
              aria-label={`Filter ${c.title} entfernen`}
              onClick={() => onState({ filters: state.filters.filter((x) => x.column !== f.column) })}
              className="flex h-full items-center rounded-r-md px-1.5 text-fg-secondary outline-none hover:bg-row-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:px-3"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
        );
      })}

      <FilterButton rows={rows} columns={columns} state={state} onState={onState} />
    </div>
  );
}

function setFilter(filters: ViewState["filters"], column: string, values: string[]): ViewState["filters"] {
  const rest = filters.filter((f) => f.column !== column);
  return values.length ? [...rest, { column, values }] : rest;
}

function FilterButton<R>({ rows, columns, state, onState }: { rows: R[]; columns: Column<R>[]; state: ViewState; onState: (patch: Partial<ViewState>) => void }) {
  const [open, setOpen] = useState(false);
  const [column, setColumn] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const filterable = columns.filter((c) => c.filterValue && c.title.toLowerCase().includes(query.trim().toLowerCase()));
  const chosen = columns.find((c) => c.id === column);
  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) {
          setColumn(null);
          setQuery("");
        }
      }}
    >
      <PopoverTrigger className={cn(barButton, "bg-fill-subtle px-2 text-fg-muted shadow-none hover:bg-fill-hover")}>
        <ListFilter className="size-4" aria-hidden />
        Filter
      </PopoverTrigger>
      <PopoverContent className="w-72">
        {chosen ? (
          <>
            <button type="button" onClick={() => setColumn(null)} className={cn(menuItem, "text-fg-secondary")}>
              <ChevronLeft className="size-4" aria-hidden />
              {chosen.title}
            </button>
            <div className="-mx-1 my-1 h-px bg-line" />
            <FilterValues
              rows={rows}
              column={chosen}
              values={state.filters.find((f) => f.column === chosen.id)?.values ?? []}
              onValues={(values) => onState({ filters: setFilter(state.filters, chosen.id, values) })}
            />
          </>
        ) : (
          <>
            <label className="flex h-9 items-center gap-2 px-2">
              <Search className="size-4 text-fg-muted" aria-hidden />
              <span className="sr-only">Spalte suchen</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Spalte suchen"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-muted max-md:text-base"
              />
            </label>
            <div className="-mx-1 my-1 h-px bg-line" />
            <ul>
              {filterable.map((c) => (
                <li key={c.id}>
                  <button type="button" onClick={() => setColumn(c.id)} className={menuItem}>
                    <c.icon className="size-4 text-fg-secondary" aria-hidden />
                    <span className="flex-1 text-left">{c.title}</span>
                  </button>
                </li>
              ))}
              {filterable.length === 0 && <li className="px-2 py-2 text-fg-muted">Keine Spalte gefunden</li>}
            </ul>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function FilterValues<R>({ rows, column, values, onValues }: { rows: R[]; column: Column<R>; values: string[]; onValues: (values: string[]) => void }) {
  const options = filterOptions(rows, column.filterValue!);
  return (
    <ul aria-label={`${column.title} filtern`}>
      {options.map((o) => {
        const on = values.includes(o.value);
        return (
          <li key={o.value}>
            <button
              type="button"
              role="menuitemcheckbox"
              aria-checked={on}
              onClick={() => onValues(on ? values.filter((v) => v !== o.value) : [...values, o.value])}
              className={menuItem}
            >
              <CheckMark checked={on} />
              <span className="flex-1 truncate text-left">{o.value}</span>
              <span className="text-xs text-fg-muted tabular-nums">{o.count}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function HeaderCell<R>({
  column,
  first,
  sort,
  onSort,
  onHide,
  children,
}: {
  column: Column<R>;
  first: boolean;
  sort: "asc" | "desc" | null;
  onSort: (direction: "asc" | "desc") => void;
  onHide: () => void;
  children?: ReactNode;
}) {
  const Icon = column.icon;
  const canSort = Boolean(column.sortValue);
  return (
    <div
      role="columnheader"
      aria-sort={sort === "asc" ? "ascending" : sort === "desc" ? "descending" : undefined}
      style={first ? undefined : { width: column.width }}
      className={cn(
        "flex shrink-0 items-center gap-2.5 border-r border-b border-line bg-surface px-3",
        first && "sticky left-0 z-10 w-[132px] md:w-[var(--first-column)]",
      )}
    >
      {children}
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "-mx-1.5 flex h-7 min-w-0 flex-1 items-center gap-1.5 rounded-md px-1.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover",
          )}
        >
          <Icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
          <span className="truncate">{column.title}</span>
          {sort && (sort === "asc" ? <ArrowUpNarrowWide className="size-3.5 shrink-0 text-fg-secondary" aria-hidden /> : <ArrowDownWideNarrow className="size-3.5 shrink-0 text-fg-secondary" aria-hidden />)}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-52">
          {canSort && (
            <>
              <DropdownMenuItem onClick={() => onSort("asc")}>
                <ArrowUpNarrowWide />
                Aufsteigend sortieren
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSort("desc")}>
                <ArrowDownWideNarrow />
                Absteigend sortieren
              </DropdownMenuItem>
            </>
          )}
          {!first && (
            <>
              {canSort && <DropdownMenuSeparator />}
              <DropdownMenuItem onClick={onHide}>
                <EyeOff />
                Spalte ausblenden
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function AddColumn<R>({ columns, hidden, onShow }: { columns: Column<R>[]; hidden: string[]; onShow: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const candidates = columns.slice(1).filter((c) => hidden.includes(c.id) && c.title.toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <Popover onOpenChange={(o) => !o && setQuery("")}>
      <PopoverTrigger
        aria-label="Spalte hinzufügen"
        className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11"
      >
        <Plus className="size-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <label className="flex h-9 items-center gap-2 px-2">
          <Search className="size-4 text-fg-muted" aria-hidden />
          <span className="sr-only">Spalte suchen</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Spalte suchen"
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-fg-muted max-md:text-base"
          />
        </label>
        <div className="-mx-1 my-1 h-px bg-line" />
        <ul>
          {candidates.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onShow(c.id)} className={menuItem}>
                <c.icon className="size-4 text-fg-secondary" aria-hidden />
                <span className="flex-1 text-left">{c.title}</span>
                <Plus className="size-4 text-fg-muted" aria-hidden />
              </button>
            </li>
          ))}
          {candidates.length === 0 && <li className="px-2 py-2 text-fg-muted">{query ? "Keine Spalte gefunden" : "Alle Spalten sind sichtbar"}</li>}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

/**
 * The second sum of a column (`alsoSum`), when it is not the chosen one and the rows in view have it; not when the
 * footer already shows it in place of the chosen one (a quick filter "in Klärung" leaves no row of the chosen sum).
 */
function alsoResult<R extends Row>(column: Column<R>, chosen: string | null, visible: R[]) {
  if (!column.alsoSum || column.alsoSum === chosen || !column.calculations?.length) return null;
  const first = footerSum(column.calculations, chosen, visible);
  if (first && !("cut" in first) && first.calculation.id === column.alsoSum) return null;
  const r = footerSum(column.calculations, column.alsoSum, visible);
  return r && !("cut" in r) && r.calculation.id === column.alsoSum ? r : null;
}

/** One sum in a footer cell: its money word above the amount, never cut (it wraps), so it is never read as another sum. */
function SumLine({ title, text, inline = false }: { title: string; text: string | null; inline?: boolean }) {
  if (inline)
    return (
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="text-xs text-fg-secondary">{title}</span>
        {text ? <span className="text-sm text-fg tabular-nums">{text}</span> : <span className="text-xs text-fg-muted">nicht gerechnet</span>}
      </span>
    );
  return (
    <span className="flex flex-col items-end text-right leading-4">
      <span className="text-xs text-balance text-fg-secondary">{title}</span>
      {text ? <span className="text-sm text-fg tabular-nums whitespace-nowrap">{text}</span> : <span className="text-xs whitespace-nowrap text-fg-muted">nicht gerechnet</span>}
    </span>
  );
}

function FooterSum<R extends Row>({ column, chosen, visible, onChoose, inline = false, noAlso = false }: { column: Column<R>; chosen: string | null; visible: R[]; onChoose: (id: string | null) => void; inline?: boolean; noAlso?: boolean }) {
  const result = footerSum(column.calculations ?? [], chosen, visible);
  const also = noAlso ? null : alsoResult(column, chosen, visible);
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "group/sum flex h-full min-w-0 justify-center text-fg-muted outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover",
          inline ? "flex-row items-center gap-5 rounded-md px-2 py-1" : "flex-1 flex-col items-end gap-1 px-3 py-1.5",
        )}
        title={result && "cut" in result ? "Für genau diese Einträge liefert der Rechenkern keine Summe: ein Filter teilt die Gruppe." : undefined}
      >
        {result ? (
          "cut" in result ? (
            <SumLine inline={inline} title={column.calculations?.find((c) => c.id === chosen)?.title ?? ""} text={null} />
          ) : (
            <SumLine inline={inline} title={result.calculation.title} text={result.sum.text} />
          )
        ) : (
          <span className="flex items-center gap-1.5">
            <Plus className="size-4 opacity-0 group-hover/sum:opacity-100" aria-hidden />
            <span className="opacity-0 group-hover/sum:opacity-100 group-focus-visible/sum:opacity-100">Summe</span>
          </span>
        )}
        {also && <SumLine inline={inline} title={`${also.calculation.title}, nicht addiert`} text={also.sum.text} />}
      </PopoverTrigger>
      <PopoverContent align="end" side="top" className="w-64">
        <PopoverTitle>Summe {column.title}</PopoverTitle>
        <ul>
          {column.calculations!.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => onChoose(c.id)} className={menuItem}>
                <span className="flex-1 text-left">{c.title}</span>
                {c.id === chosen && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="-mx-1 my-1 h-px bg-line" />
        <button type="button" onClick={() => onChoose(null)} className={menuItem}>
          <span className="flex-1 text-left">Keine Summe</span>
          {chosen === null && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
        </button>
      </PopoverContent>
    </Popover>
  );
}

function Checkbox({ checked, label, onChange }: { checked: boolean | "mixed"; label: string; onChange: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="relative flex size-4 shrink-0 items-center justify-center rounded-[6px] outline-none before:absolute before:-inset-2 focus-visible:outline-2 focus-visible:outline-accent max-md:before:-inset-3.5"
    >
      <CheckMark checked={checked} />
    </button>
  );
}

export function CheckMark({ checked }: { checked: boolean | "mixed" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-4 shrink-0 items-center justify-center rounded-[6px] bg-surface shadow-[inset_0_0_0_1px_var(--color-check)]",
        checked && "bg-accent text-white shadow-none",
      )}
    >
      {checked === "mixed" ? <Minus className="size-3" strokeWidth={3} /> : checked ? <Check className="size-3" strokeWidth={3} /> : null}
    </span>
  );
}

export const barButton =
  "flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 shadow-button outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0";

export const menuItem =
  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-fill-hover focus-visible:bg-fill-hover max-md:h-11";
