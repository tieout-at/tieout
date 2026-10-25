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
  type Access,
  type Calculation,
  type Noun,
  type Row,
  type View,
  type ViewState,
} from "@/lib/table";

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
}) {
  const storageKey = `tieout.tabelle.${name}`;
  const ids = columns.map((c) => c.id);
  const [viewId, setViewId] = useState(views[0].id);
  const view = views.find((v) => v.id === viewId) ?? views[0];
  const [state, setState] = useState<ViewState>(view.state);
  const [selected, setSelected] = useState<Set<string>>(new Set());
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
  const visible = useMemo(() => applySort(applyFilters(rows, state.filters, access), state.sort, access), [rows, state.filters, state.sort, access]);
  const shown = columns.filter((c, i) => i === 0 || !state.hidden.includes(c.id));
  const isBoard = view.kind === "board" && board !== undefined;

  const switchView = (v: View) => {
    setViewId(v.id);
    setState(v.state);
    setSelected(new Set());
  };
  const update = (patch: Partial<ViewState>) => setState((s) => ({ ...s, ...patch }));
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
        state={state}
        onState={update}
        onReset={() => setState(view.state)}
        board={isBoard}
        selected={selected.size}
        onClearSelection={() => setSelected(new Set())}
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
          className="flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 shadow-button hover:bg-row-hover max-md:h-11"
        >
          <RotateCcw className="size-4 text-fg-secondary" aria-hidden />
          Filter entfernen
        </button>
      </div>
    );
  }

  // the phone list: one row per entry as the page draws it, then the counter and the fixed sums the footer would show
  function list(row: (r: R) => ReactNode) {
    const sums = shown.flatMap((c): { id: string; title: string; text: string | null }[] => {
      const result = c.calculations?.length ? footerSum(c.calculations, state.calculations[c.id] ?? null, visible) : null;
      if (!result) return [];
      const chosen = c.calculations!.find((x) => x.id === state.calculations[c.id])?.title ?? c.title;
      return "cut" in result ? [{ id: c.id, title: chosen, text: null }] : [{ id: c.id, title: result.calculation.title, text: result.sum.text }];
    });
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
            <span key={s.id} className="flex items-baseline justify-between gap-3">
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
                  onHide={() => update({ hidden: [...state.hidden, c.id] })}
                >
                  {i === 0 && (
                    <Checkbox
                      checked={allSelected ? true : someSelected ? "mixed" : false}
                      label="Alle auswählen"
                      onChange={() => setSelected(allSelected ? new Set() : new Set(visible.map((r) => r.id)))}
                    />
                  )}
                </HeaderCell>
              ))}
              <div role="columnheader" className="flex min-w-14 flex-1 items-center border-b border-line px-2">
                <AddColumn columns={columns} hidden={state.hidden} onShow={(id) => update({ hidden: state.hidden.filter((h) => h !== id) })} />
              </div>
            </div>
          </div>

          <div role="rowgroup">
            {visible.map((r) => {
              const isSelected = selected.has(r.id);
              return (
                <div key={r.id} role="row" aria-selected={isSelected} className={cn("group flex h-9 max-md:h-11", isSelected && "is-selected")}>
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
                      {i === 0 && <Checkbox checked={isSelected} label="Auswählen" onChange={() => toggleRow(r.id)} />}
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
            <div role="row" className="flex h-9 shadow-[inset_0_1px_0_var(--color-line)] max-md:h-11">
              {shown.map((c, i) =>
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
              )}
              <div role="cell" className="min-w-14 flex-1" />
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
}) {
  const changed = JSON.stringify(state) !== JSON.stringify(view.state);
  return (
    <div className="flex h-12 shrink-0 items-center gap-2 px-3 max-md:h-auto max-md:flex-wrap max-md:py-2">
      <DropdownMenu>
        <DropdownMenuTrigger className={barButton}>
          <span className="flex size-4 items-center justify-center rounded-xs bg-fg text-white" aria-hidden>
            {board ? <Kanban className="size-3" /> : <Table className="size-3" />}
          </span>
          <span className="max-w-56 truncate">{view.title}</span>
          <ChevronDown className="size-4 text-fg-secondary" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Ansichten</DropdownMenuLabel>
            {views.map((v) => (
              <DropdownMenuItem key={v.id} onClick={() => onView(v)}>
                {v.kind === "board" ? <Kanban /> : <Table />}
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
          <div key={f.column} className="flex h-7 items-center rounded-md bg-surface shadow-button max-md:h-11">
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

function FooterSum<R extends Row>({ column, chosen, visible, onChoose }: { column: Column<R>; chosen: string | null; visible: R[]; onChoose: (id: string | null) => void }) {
  const result = footerSum(column.calculations ?? [], chosen, visible);
  return (
    <Popover>
      <PopoverTrigger
        className="group/sum flex h-full min-w-0 flex-1 items-center justify-end gap-1.5 px-3 text-fg-muted outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover"
        title={
          result && "cut" in result
            ? "Für genau diese Einträge liefert der Rechenkern keine Summe: ein Filter teilt die Gruppe, oder eine Entscheidung ist nur in diesem Browser vermerkt und wird erst mit der Anmeldung gerechnet."
            : result
              ? `${result.calculation.title} ${result.sum.text}`
              : undefined
        }
      >
        {result ? (
          "cut" in result ? (
            <>
              <span className="min-w-0 truncate text-xs text-fg-secondary">{column.calculations?.find((c) => c.id === chosen)?.title}</span>
              <span className="shrink-0 text-xs whitespace-nowrap">nicht gerechnet</span>
            </>
          ) : (
            <>
              <span className="min-w-0 truncate text-xs text-fg-secondary">{result.calculation.title}</span>
              <span className="shrink-0 whitespace-nowrap text-fg tabular-nums">{result.sum.text}</span>
            </>
          )
        ) : (
          <>
            <Plus className="size-4 opacity-0 group-hover/sum:opacity-100" aria-hidden />
            <span className="opacity-0 group-hover/sum:opacity-100 group-focus-visible/sum:opacity-100">Summe</span>
          </>
        )}
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

function CheckMark({ checked }: { checked: boolean | "mixed" }) {
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

const barButton =
  "flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 shadow-button outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover max-md:h-11";

const menuItem =
  "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-fill-hover focus-visible:bg-fill-hover max-md:h-11";
