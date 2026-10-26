"use client";

import Link from "next/link";
import { ArrowUpDown, CalendarDays, Check, ChevronRight, Construction, ListFilter, Plus, SearchCheck, SquareCheck, Text, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { EmptyState, SectionEmpty } from "@/components/shell/empty-state";
import { barButton, CheckMark, menuItem } from "@/components/table/data-table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { byDue, byMade, doneTasks, dueText, groupOpen, ROLES, type TaskItem, type TaskTarget } from "@/lib/tasks";
import { checkTask, useTasks, useToday } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";

const datum = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

/** The circle of a task (Attio's), ticks it off or opens it again; both are appended. */
function TaskCircle({ task, onChange }: { task: TaskItem; onChange: (done: boolean) => void }) {
  const done = Boolean(task.done);
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={done ? `Wieder öffnen: ${task.text}` : `Abhaken: ${task.text}`}
      onClick={() => onChange(!done)}
      className="group/circle relative flex size-4 shrink-0 items-center justify-center rounded-full outline-none before:absolute before:-inset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent max-md:before:-inset-3.5"
    >
      <span
        aria-hidden
        className={cn(
          "flex size-4 items-center justify-center rounded-full shadow-[inset_0_0_0_1px_var(--color-fg-faint)]",
          done ? "bg-state-green text-white shadow-none" : "text-transparent group-hover/circle:text-fg-muted",
        )}
      >
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
    </button>
  );
}

/** The due date; `word` says "überfällig" in letters where no group heading says it (Start). */
function Due({ task, today, word = false }: { task: TaskItem; today: string; word?: boolean }) {
  if (task.done) return <span className="whitespace-nowrap text-fg-muted">erledigt {datum(task.done.zeit)}</span>;
  const due = dueText(task.bis, today);
  if (!due) return <span className="text-fg-muted">ohne Frist</span>;
  return (
    <span className={cn("tabular-nums", due.tone === "red" && "text-state-red-edge", due.tone === "orange" && "text-state-orange-edge")}>
      {due.tone === "red" && <span className={word ? undefined : "sr-only"}>überfällig, </span>}
      {due.text}
    </span>
  );
}

/**
 * The find of a task as Attio names a record: its number chip and the project, in ink, never as a blue link. `small`
 * is the 12 px form inside a line of facts; its tap target still reaches 44 px on phones.
 */
function FindLink({ task, small = false }: { task: TaskItem; small?: boolean }) {
  const [number, ...project] = task.fund.split(" ");
  return (
    <Link
      href={task.href}
      className={cn(
        "relative -mx-1 flex min-w-0 items-center gap-1.5 rounded-md px-1 py-0.5 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent",
        small && "text-fg-secondary hover:text-fg max-md:before:absolute max-md:before:-inset-y-3",
      )}
    >
      <span className={cn("flex shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-count shadow-ring", small ? "h-4 min-w-6 text-[11px]" : "h-5 min-w-7 text-xs")}>{number}</span>
      <span className="truncate">{project.join(" ")}</span>
    </Link>
  );
}

const GRID = "md:grid md:grid-cols-[minmax(0,1fr)_170px_minmax(0,240px)_160px]";

/** One row of the list (Attio's task row): circle and text; due date, find and role in columns, on phones in one line below. */
function TaskRow({ task, today, onCheck }: { task: TaskItem; today: string; onCheck: (t: TaskItem, done: boolean) => void }) {
  return (
    <li className={cn("flex min-h-[42px] items-start gap-3 px-3 py-2.5 shadow-line-bottom md:items-center md:gap-0 md:py-1.5", GRID)}>
      <div className="flex min-w-0 items-start gap-2.5 md:items-center md:pr-3">
        <span className="pt-0.5 md:pt-0">
          <TaskCircle task={task} onChange={(done) => onCheck(task, done)} />
        </span>
        <span className="flex min-w-0 flex-col gap-1">
          <span className={cn("line-clamp-2", task.done && "text-fg-muted line-through decoration-fg-faint")} title={task.text}>
            {task.text}
          </span>
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-fg-secondary md:hidden">
            <Due task={task} today={today} />
            <span aria-hidden className="text-fg-faint">
              ·
            </span>
            <span>{task.zustaendig}</span>
            <span aria-hidden className="text-fg-faint">
              ·
            </span>
            <FindLink task={task} small />
          </span>
        </span>
      </div>
      <div className="px-3 max-md:hidden">
        <Due task={task} today={today} />
      </div>
      <div className="min-w-0 px-3 max-md:hidden">
        <FindLink task={task} />
      </div>
      <div className="truncate px-3 max-md:hidden">{task.zustaendig}</div>
    </li>
  );
}

function GroupHead({ title, count, open, onToggle }: { title: string; count: number; open?: boolean; onToggle?: () => void }) {
  const inner = (
    <>
      {onToggle && <ChevronRight className={cn("size-3.5 text-fg-muted transition-transform", open && "rotate-90")} aria-hidden />}
      <span>{title}</span>
      <span className="flex h-4 min-w-4 items-center justify-center rounded-xs bg-surface px-1 text-[11px] text-count tabular-nums shadow-ring">{count}</span>
    </>
  );
  return (
    <div className="flex h-[26px] items-center bg-fill-subtle px-3 text-xs text-fg-secondary shadow-line-bottom max-md:h-11">
      {onToggle ? (
        <button type="button" aria-expanded={open} onClick={onToggle} className="-mx-1 flex h-full items-center gap-1.5 rounded-sm px-1 outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
          {inner}
        </button>
      ) : (
        <h3 className="flex items-center gap-1.5">{inner}</h3>
      )}
    </div>
  );
}

type Sort = "frist" | "angelegt";
type Filters = { zustaendig: string[]; projekt: string[] };

/** The note at the bottom after a task was ticked off, with a way back (appended as well). */
function useNote() {
  const [note, setNote] = useState<{ task: TaskItem } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const show = (task: TaskItem) => {
    clearTimeout(timer.current);
    setNote({ task });
    timer.current = setTimeout(() => setNote(null), 6000);
  };
  return { note, show, hide: () => setNote(null) };
}

function Note({ task, onUndo }: { task: TaskItem; onUndo: () => void }) {
  return (
    <p role="status" className="fixed right-4 bottom-4 z-40 flex max-w-[calc(100%-2rem)] items-center gap-3 rounded-lg bg-fg px-3 py-2 text-white shadow-popup">
      <span className="min-w-0 truncate">Erledigt: {task.text}</span>
      <button type="button" onClick={onUndo} className="flex min-h-7 shrink-0 items-center underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-white max-md:min-h-11">
        Rückgängig
      </button>
    </p>
  );
}

/**
 * "Aufgaben" (Attio's Tasks, SPEZIFIKATION.md 4.2): every task laid out on a find in this browser. Open tasks are
 * grouped by when they are due; done ones fold away under "Erledigt". Ticking off and opening again are appended, never
 * changed, and show in the Verlauf of the find. "Neue Aufgabe" opens the same modal as the find page and the board.
 */
export function TaskList({ targets }: { targets: TaskTarget[] }) {
  const tasks = useTasks();
  const today = useToday();
  const [making, setMaking] = useState(false);
  const [sort, setSort] = useState<Sort>("frist");
  const [filters, setFilters] = useState<Filters>({ zustaendig: [], projekt: [] });
  const [showDone, setShowDone] = useState(false);
  const { note, show, hide } = useNote();

  const [proposal, setProposal] = useState<TaskTarget | null>(null);
  const dialog = (
    <>
      <TaskDialog open={making} onOpenChange={setMaking} targets={targets} />
      <TaskDialog open={proposal !== null} onOpenChange={(o) => !o && setProposal(null)} targets={proposal ? [proposal] : []} />
    </>
  );
  if (!tasks?.length || !today) {
    // step 8a: an empty page that already knows work names it; the gaps with an Abhilfe are the first tasks
    const proposals = targets.filter((t) => t.taskText);
    if (!proposals.length) {
      return (
        <>
          <EmptyState icon={SquareCheck} title="Aufgaben" text="Aus jeder Lücke wird eine Aufgabe, zum Beispiel „Regiebericht schreiben und vom Polier unterschreiben lassen“.">
            <Button variant="primary" size="lg" onClick={() => setMaking(true)}>
              <Plus aria-hidden />
              Neue Aufgabe
            </Button>
          </EmptyState>
          {dialog}
        </>
      );
    }
    return (
      <>
        <div className="mx-auto flex w-full max-w-[720px] flex-col gap-4 px-6 py-8 max-md:px-4 max-md:py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold">{proposals.length === 1 ? "1 Vorschlag aus den Funden" : `${proposals.length} Vorschläge aus den Funden`}</h2>
              <p className="text-fg-secondary">Für diese Funde steht die Abhilfe schon fest. Noch keine Aufgabe angelegt.</p>
            </div>
            <Button variant="secondary" onClick={() => setMaking(true)} className="shrink-0">
              <Plus aria-hidden />
              Neue Aufgabe
            </Button>
          </div>
          <ul className="rounded-lg bg-surface shadow-ring">
            {proposals.map((t) => (
              <li key={t.key} className="flex items-start gap-3 px-4 py-3 [&:not(:last-child)]:shadow-line-bottom max-md:flex-col max-md:gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <span>{t.taskText}</span>
                  <Link href={t.href} className="flex w-fit items-center gap-1.5 rounded-xs text-xs text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
                    <span className="flex h-5 min-w-7 items-center justify-center rounded-xs bg-fill-hover px-1 text-count shadow-ring">{t.label.split(" ")[0]}</span>
                    {t.project}
                  </Link>
                </div>
                <Button variant="secondary" onClick={() => setProposal(t)} className="shrink-0">
                  Als Aufgabe anlegen
                </Button>
              </li>
            ))}
          </ul>
        </div>
        {dialog}
      </>
    );
  }

  const projectOf = (t: TaskItem) => t.fund.split(" ").slice(1).join(" ");
  const shown = tasks.filter(
    (t) => (!filters.zustaendig.length || filters.zustaendig.includes(t.zustaendig)) && (!filters.projekt.length || filters.projekt.includes(projectOf(t))),
  );
  const open = shown.filter((t) => !t.done);
  const done = doneTasks(shown);
  const onCheck = (t: TaskItem, isDone: boolean) => {
    checkTask(t, isDone);
    if (isDone) show(t);
    else hide();
  };
  const row = (t: TaskItem) => <TaskRow key={t.id} task={t} today={today} onCheck={onCheck} />;

  const options: { id: keyof Filters; title: string; icon: typeof UserRound; values: { value: string; count: number }[] }[] = [
    { id: "zustaendig", title: "Zuständig", icon: UserRound, values: ROLES.map((r) => ({ value: r, count: tasks.filter((t) => t.zustaendig === r).length })).filter((v) => v.count) },
    {
      id: "projekt",
      title: "Projekt",
      icon: Construction,
      values: [...new Set(tasks.map(projectOf))].map((p) => ({ value: p, count: tasks.filter((t) => projectOf(t) === p).length })),
    },
  ];
  const toggle = (id: keyof Filters, value: string) =>
    setFilters({ ...filters, [id]: filters[id].includes(value) ? filters[id].filter((v) => v !== value) : [...filters[id], value] });

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex min-h-12 shrink-0 flex-wrap items-center gap-2 px-3 py-2.5 shadow-line-bottom">
        <Popover>
          <PopoverTrigger className={cn(barButton, "px-2")}>
            <ArrowUpDown className="size-4 text-fg-secondary" aria-hidden />
            <span className="text-fg-secondary">Sortiert nach</span>
            <span>{sort === "frist" ? "Frist" : "Angelegt"}</span>
          </PopoverTrigger>
          <PopoverContent className="w-60">
            <PopoverTitle>Sortieren nach</PopoverTitle>
            <ul>
              {(
                [
                  { id: "frist", title: "Frist", icon: CalendarDays },
                  { id: "angelegt", title: "Angelegt, neueste zuerst", icon: Text },
                ] as const
              ).map((o) => (
                <li key={o.id}>
                  <button type="button" onClick={() => setSort(o.id)} className={menuItem}>
                    <o.icon className="size-4 text-fg-secondary" aria-hidden />
                    <span className="flex-1 text-left">{o.title}</span>
                    {sort === o.id && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
                  </button>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
        <span aria-hidden className="h-4 w-px bg-line" />
        {options
          .filter((o) => filters[o.id].length)
          .map((o) => (
            <div key={o.id} className="flex h-7 items-center rounded-md bg-surface shadow-button max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0">
              <span className="flex h-full max-w-72 items-center gap-1.5 pr-1 pl-2">
                <o.icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                <span className="text-fg-secondary">{o.title}</span>
                <span className="truncate">{filters[o.id].join(", ")}</span>
              </span>
              <button
                type="button"
                aria-label={`Filter ${o.title} entfernen`}
                onClick={() => setFilters({ ...filters, [o.id]: [] })}
                className="flex h-full items-center rounded-r-md px-1.5 text-fg-secondary outline-none hover:bg-row-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:px-3"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </div>
          ))}
        <Popover>
          <PopoverTrigger className={cn(barButton, "bg-fill-subtle px-2 text-fg-muted shadow-none hover:bg-fill-hover")}>
            <ListFilter className="size-4" aria-hidden />
            Filter
          </PopoverTrigger>
          <PopoverContent className="w-64">
            {options.map((o, i) => (
              <div key={o.id}>
                {i > 0 && <div className="-mx-1 my-1 h-px bg-line" />}
                <PopoverTitle>{o.title}</PopoverTitle>
                <ul aria-label={`${o.title} filtern`}>
                  {o.values.map((v) => {
                    const on = filters[o.id].includes(v.value);
                    return (
                      <li key={v.value}>
                        <button type="button" role="menuitemcheckbox" aria-checked={on} onClick={() => toggle(o.id, v.value)} className={menuItem}>
                          <CheckMark checked={on} />
                          <span className="flex-1 truncate text-left">{v.value}</span>
                          <span className="text-xs text-fg-muted tabular-nums">{v.count}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </PopoverContent>
        </Popover>
        <Button variant="primary" className="ml-auto max-md:w-8 max-md:px-0" onClick={() => setMaking(true)}>
          <Plus aria-hidden />
          <span className="max-md:sr-only">Neue Aufgabe</span>
        </Button>
      </div>

      <div className={cn("h-[34px] items-center text-xs text-fg-secondary shadow-line-bottom max-md:hidden", GRID)}>
        {[
          { title: "Aufgabe", icon: Text },
          { title: "Erledigen bis", icon: CalendarDays },
          { title: "Fund", icon: SearchCheck },
          { title: "Zuständig", icon: UserRound },
        ].map((c) => (
          <span key={c.title} className="flex items-center gap-1.5 px-3">
            <c.icon className="size-3.5" aria-hidden />
            {c.title}
          </span>
        ))}
      </div>

      {open.length === 0 && (
        <SectionEmpty title={shown.length ? "Alles erledigt" : "Keine Aufgabe für diesen Filter"} text={shown.length ? "Jede Aufgabe hier ist abgehakt." : undefined} />
      )}
      {sort === "frist" ? (
        groupOpen(open, today).map((g) => (
          <section key={g.id} aria-label={g.title}>
            <GroupHead title={g.title} count={g.items.length} />
            <ul>{g.items.map(row)}</ul>
          </section>
        ))
      ) : (
        <ul>{open.toSorted(byMade).map(row)}</ul>
      )}
      {done.length > 0 && (
        <section aria-label="Erledigt">
          <GroupHead title="Erledigt" count={done.length} open={showDone} onToggle={() => setShowDone(!showDone)} />
          {showDone && <ul>{done.map(row)}</ul>}
        </section>
      )}
      <p className="px-3 py-3 text-xs text-fg-muted">Angelegt auf Funden, vorerst in diesem Browser gespeichert, bis die Anmeldung kommt.</p>
      {note && (
        <Note
          task={note.task}
          onUndo={() => {
            checkTask(note.task, false);
            hide();
          }}
        />
      )}
      {dialog}
    </div>
  );
}

/** The open tasks on Start (Attio's "Tasks" on Home): the three due first, each with its circle, and "+" for a new one. */
export function TaskPreview({ targets }: { targets: TaskTarget[] }) {
  const tasks = useTasks();
  const today = useToday();
  const [making, setMaking] = useState(false);
  const open = (tasks ?? []).filter((t) => !t.done).toSorted(byDue);
  // before the first task, the finds whose Abhilfe is known are the proposals on "Aufgaben"
  const proposed = (tasks ?? []).length === 0 ? targets.filter((t) => t.taskText).length : 0;
  return (
    <section aria-labelledby="aufgaben" className="flex flex-col gap-2">
      <div className="flex h-7 items-center justify-between px-1">
        <h2 id="aufgaben" className="flex items-center gap-1.5 text-fg-secondary">
          Aufgaben
          {open.length > 0 && <span className="text-fg-muted tabular-nums">{open.length}</span>}
        </h2>
        <span className="flex items-center gap-1">
          <Link
            href="/aufgaben/"
            className="flex items-center rounded-sm px-1 text-xs text-fg-secondary hover:bg-fill-hover hover:text-fg max-md:-my-2 max-md:h-11"
          >
            Alle anzeigen
          </Link>
          <button
            type="button"
            aria-label="Neue Aufgabe"
            onClick={() => setMaking(true)}
            className="flex size-6 items-center justify-center rounded-sm text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:-my-2 max-md:size-11"
          >
            <Plus className="size-4" aria-hidden />
          </button>
        </span>
      </div>
      {open.length === 0 || !today ? (
        <SectionEmpty
          title="Keine offenen Aufgaben"
          text={proposed ? `${proposed} Vorschläge aus den Funden stehen unter Aufgaben.` : "Aus jeder Lücke wird eine Aufgabe mit Frist."}
        />
      ) : (
        <ul className="flex flex-col">
          {open.slice(0, 3).map((t) => (
            <li key={t.id} className="flex min-h-11 items-start gap-2.5 rounded-md px-1 py-2">
              <span className="pt-0.5">
                <TaskCircle task={t} onChange={(done) => checkTask(t, done)} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="line-clamp-3">{t.text}</span>
                <span className="flex flex-wrap items-center gap-x-1.5 text-xs text-fg-secondary">
                  <span>{t.zustaendig}</span>
                  <span aria-hidden className="text-fg-faint">
                    ·
                  </span>
                  <FindLink task={t} small />
                </span>
              </span>
              <span className="shrink-0 pt-px text-xs">
                <Due task={t} today={today} word />
              </span>
            </li>
          ))}
        </ul>
      )}
      <TaskDialog open={making} onOpenChange={setMaking} targets={targets} />
    </section>
  );
}
