"use client";

import Link from "next/link";
import { Fragment, useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Ban, CircleCheck, CircleCheckBig, CircleDashed, Ellipsis, ListTodo, ReceiptText, type LucideIcon } from "lucide-react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { DecisionConfirm } from "@/components/fund/decision-confirm";
import { Tag, type TagColour } from "@/components/table/tag";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DECISION_TEXT, moves, refusal, type DecisionState, type Move } from "@/lib/decisions";
import type { FindRow } from "@/lib/kern-data";
import { columnSums, type Calculation } from "@/lib/table";
import { targetOf } from "@/lib/tasks";
import { cn } from "@/lib/utils";

export const EVIDENCE: Record<NonNullable<FindRow["belegstand"]>["state"], TagColour> = { belegt: "green", beleg_fehlt: "yellow", nachtrag_nicht_gelegt: "orange" };

/** The columns of the board: the decision flow of SPEZIFIKATION.md 3.2, "Nicht verrechnen" set apart at the end. */
const LANES: { state: DecisionState; icon: LucideIcon; empty: string; done: string; foldable?: boolean }[] = [
  { state: "gefunden", icon: CircleDashed, empty: "Kein Fund mehr offen", done: "steht wieder auf Gefunden" },
  { state: "geprueft", icon: CircleCheck, empty: "Noch kein Fund geprüft", done: "ist geprüft" },
  { state: "freigegeben", icon: CircleCheckBig, empty: "Noch kein Fund freigegeben", done: "ist freigegeben" },
  { state: "in_schlussrechnung", icon: ReceiptText, empty: "Kommt mit der Schlussrechnung", done: "steht in der Schlussrechnung", foldable: true },
  { state: "nicht_verrechnen", icon: Ban, empty: "Kein Fund ausgeschlossen", done: "wird nicht verrechnet", foldable: true },
];
const LANE = Object.fromEntries(LANES.map((l) => [l.state, l])) as Record<DecisionState, (typeof LANES)[number]>;

/** Explains a column without a fixed sum; the same words as under the tables. */
export const NOT_COMPUTED = "Für genau diese Funde liefert der Rechenkern keine Summe: ein Filter teilt die Gruppe.";

/** The Kürzungsrisiko of a find in one form on every screen: its red dot, the reason, and the amount where it is only part of the find. */
export function RiskText({ risk, amount, className, label = true, wrap = false }: { risk: NonNullable<FindRow["risk"]>; amount: FindRow["amount"]; className?: string; label?: boolean; wrap?: boolean }) {
  const part = risk.amount.cent !== amount.cent;
  return (
    <span className={cn("flex min-w-0 items-baseline gap-1.5", className)} title={`${risk.number}: ${risk.reason}`}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", wrap ? "translate-y-[-1px]" : "self-center", risk.alreadyCut ? "bg-state-grey" : "bg-state-red")} />
      <span className={cn("min-w-0", wrap ? "line-clamp-2" : "truncate")}>
        {risk.alreadyCut ? "Schon gekürzt: " : label ? "Kürzungsrisiko: " : ""}
        {risk.reason}
        {part && <span className="whitespace-nowrap tabular-nums">, {risk.amount.text}</span>}
      </span>
    </span>
  );
}

type Pending = { row: FindRow; move: Move };

/**
 * "Funde" as a board by Entscheidung (Attio's "Pipeline" on Deals, measured 25.10.2026): columns of 268 px on the
 * sidebar grey with a radius of 16, cards of 246 px with a radius of 12, the fixed sums of `kern/` under each column.
 * "In der Schlussrechnung" and "Nicht verrechnen" fold to a 44 px strip while empty (as Linear's folded groups), so the
 * whole flow fits at 1440 px. Moving a card is a decision: it opens the same confirmation as the decision bar, one find
 * and one step at a time, never in bulk; until it is confirmed a dashed card marks the target. The menu on each card
 * offers the same moves for the keyboard and for phones. Below 768 px the board is a list grouped by Entscheidung.
 */
/** Cards a group shows before "weitere zeigen" (a run of one more is shown whole). */
const FOLD = 4;

export function FindsBoard({
  rows,
  calculations,
  stateOf,
  tasksOf,
  reasonOf,
  openOf,
  withProject,
  onDecide,
}: {
  /** Sorted and filtered like the table. */
  rows: FindRow[];
  /** "zusätzlich verrechenbar" and "in Klärung"; a column shows them only where `kern/` has the sum for exactly its cards. */
  calculations: Calculation[];
  stateOf: (r: FindRow) => DecisionState;
  tasksOf: (r: FindRow) => number;
  /** The reason given for the latest "Nicht verrechnen" of a find. */
  reasonOf: (r: FindRow) => string | null;
  /** What is still open before a release, as on the find page. */
  openOf: (r: FindRow) => string[];
  withProject: boolean;
  /** Records the decision; returns why it was refused when another tab decided first. */
  onDecide: (r: FindRow, move: Move, grund?: string) => string | null;
}) {
  const [dragging, setDragging] = useState<FindRow | null>(null);
  const [over, setOver] = useState<DecisionState | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [taskFor, setTaskFor] = useState<FindRow | null>(null);
  const [message, setMessage] = useState<{ text: string; href?: string; link?: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (text: string, href?: string, link = "Fund öffnen") => {
    clearTimeout(timer.current);
    setMessage({ text, href, link });
    timer.current = setTimeout(() => setMessage(null), 6000);
  };

  // on the board of the business three finds are called F1: name the project with the number
  const about = (r: FindRow) => (withProject ? `${r.number} ${r.project.name}` : r.number);

  const ask = (row: FindRow, to: DecisionState) => {
    const from = stateOf(row);
    if (from === to) return;
    const why = refusal(from, to);
    if (why) return say(why);
    setPending({ row, move: moves(from).find((m) => m.stand === to)! });
  };

  const drop = (e: DragEvent, to: DecisionState) => {
    e.preventDefault();
    setOver(null);
    const row = dragging ?? rows.find((r) => r.id === e.dataTransfer.getData("text/plain"));
    setDragging(null);
    if (row) ask(row, to);
  };

  // step 8a: on the board of the business a column names each project once, with its cards below, and folds a long run
  const [unfolded, setUnfolded] = useState<Set<string>>(new Set());
  const groupsOf = (cards: FindRow[]) =>
    withProject
      ? [...new Set(cards.map((r) => r.project.name))].map((name) => ({ name, cards: cards.filter((r) => r.project.name === name) }))
      : [{ name: "", cards }];

  const card = (r: FindRow, lane: DecisionState, inGroup = false) => (
    <Card
      row={r}
      moves={moves(stateOf(r))}
      tasks={tasksOf(r)}
      reason={lane === "nicht_verrechnen" ? reasonOf(r) : null}
      about={about(r)}
      withProject={withProject && !inGroup}
      dragging={dragging?.id === r.id}
      onDragStart={(e) => {
        e.dataTransfer.setData("text/plain", r.id);
        e.dataTransfer.effectAllowed = "move";
        setDragging(r);
      }}
      onDragEnd={() => {
        // a column that takes no card gets no drop event: say why when the card was let go over it
        const why = over && over !== stateOf(r) ? refusal(stateOf(r), over) : null;
        if (why) say(why);
        setDragging(null);
        setOver(null);
      }}
      onMove={(m) => setPending({ row: r, move: m })}
      onTask={() => setTaskFor(r)}
    />
  );

  return (
    <>
      {/* as tall as the screen below the two bars; inside a project page, which scrolls as a whole, it fills the screen once scrolled to */}
      <div className="flex h-[calc(100dvh-var(--header-height)-6rem)] min-h-[420px] shrink-0 gap-2 overflow-x-auto px-2.5 pt-3 pb-2 max-md:hidden">
        {LANES.map((lane) => {
          const cards = rows.filter((r) => stateOf(r) === lane.state);
          const target = dragging ? stateOf(dragging) !== lane.state && refusal(stateOf(dragging), lane.state) === null : false;
          const waiting = pending?.move.stand === lane.state ? pending.row : null;
          const folded = lane.foldable && cards.length === 0 && !waiting && !(dragging && target);
          const label = `${DECISION_TEXT[lane.state]}, ${cards.length} ${cards.length === 1 ? "Fund" : "Funde"}`;
          return (
            <section
              key={lane.state}
              aria-label={label}
              onDragOver={(e) => {
                if (!dragging) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = target ? "move" : "none";
                setOver(lane.state);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOver((o) => (o === lane.state ? null : o));
              }}
              onDrop={(e) => drop(e, lane.state)}
              className={cn("flex shrink-0 flex-col", folded ? "w-11" : "w-[268px]", lane.state === "nicht_verrechnen" && "ml-4")}
            >
              {folded ? (
                <div
                  title={lane.empty}
                  className={cn(
                    "mb-[34px] flex flex-1 flex-col items-center gap-2 rounded-[16px] bg-sidebar py-2.5 transition-opacity",
                    dragging && stateOf(dragging) !== lane.state && "opacity-60",
                  )}
                >
                  <lane.icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-fill-hover px-1 text-xs text-count tabular-nums">0</span>
                  <span className="text-fg-secondary [writing-mode:vertical-rl]">{DECISION_TEXT[lane.state]}</span>
                </div>
              ) : (
                <>
                  <div
                    className={cn(
                      "flex min-h-0 flex-1 flex-col rounded-[16px] bg-sidebar transition-[box-shadow,opacity] duration-150",
                      dragging && target && "shadow-[inset_0_0_0_1px_var(--color-accent)]",
                      dragging && target && over === lane.state && "bg-row-selected",
                      dragging && !target && stateOf(dragging) !== lane.state && "opacity-60",
                    )}
                  >
                    <h2 className="mx-2 flex h-9 shrink-0 items-center gap-1.5 p-2">
                      <lane.icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                      <span className={cn("truncate font-semibold", lane.state === "nicht_verrechnen" && "text-fg-secondary")}>{DECISION_TEXT[lane.state]}</span>
                      <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-fill-hover px-1 text-xs text-count tabular-nums">{cards.length}</span>
                    </h2>
                    <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-[11px] pt-2 pb-3 [scrollbar-width:thin]">
                      {dragging && target && (
                        <li aria-hidden className="flex h-14 shrink-0 items-center justify-center rounded-[12px] border border-dashed border-accent/50 text-accent">
                          Hier ablegen
                        </li>
                      )}
                      {waiting && (
                        <li className="flex shrink-0 flex-col gap-0.5 rounded-[12px] border border-dashed border-accent/50 bg-surface/60 px-3 py-2.5">
                          <span className="truncate">
                            {waiting.number} {waiting.name}
                          </span>
                          <span className="text-xs text-fg-secondary">wartet auf Bestätigung</span>
                        </li>
                      )}
                      {groupsOf(cards).map((g) => {
                        const key = `${lane.state}|${g.name}`;
                        const open = !g.name || unfolded.has(key) || g.cards.length <= FOLD + 1;
                        return (
                          <Fragment key={key}>
                            {g.name && (
                              <li className="flex items-center gap-1.5 px-1 pt-1 text-xs text-fg-secondary first:pt-0">
                                <span className="truncate">{g.name}</span>
                                <span className="text-fg-muted tabular-nums">{g.cards.length}</span>
                              </li>
                            )}
                            {(open ? g.cards : g.cards.slice(0, FOLD)).map((r) => (
                              <li key={r.id}>{card(r, lane.state, g.name !== "")}</li>
                            ))}
                            {!open && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => setUnfolded((u) => new Set(u).add(key))}
                                  className="flex h-8 w-full items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
                                >
                                  {g.cards.length - FOLD} weitere zeigen
                                </button>
                              </li>
                            )}
                          </Fragment>
                        );
                      })}
                      {cards.length === 0 && !waiting && !(dragging && target) && <li className="px-2 py-2 text-center text-fg-muted">{lane.empty}</li>}
                    </ul>
                  </div>
                  <ColumnFooter state={lane.state} cards={cards} calculations={calculations} />
                </>
              )}
            </section>
          );
        })}
      </div>

      {/* phones: one list, grouped by Entscheidung; the bars above stay, deciding goes through the menu of each row */}
      <div className="md:hidden">
        {LANES.map((lane) => {
          const cards = rows.filter((r) => stateOf(r) === lane.state);
          if (cards.length === 0) return null;
          const sums = lane.state === "nicht_verrechnen" ? [] : columnSums(calculations, cards);
          return (
            <section key={lane.state} aria-label={`${DECISION_TEXT[lane.state]}, ${cards.length} ${cards.length === 1 ? "Fund" : "Funde"}`}>
              <h2 className="sticky top-0 z-10 flex h-10 items-center gap-1.5 bg-sidebar px-4 shadow-line-bottom">
                <lane.icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
                <span className="font-semibold">{DECISION_TEXT[lane.state]}</span>
                <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-fill-hover px-1 text-xs text-count tabular-nums">{cards.length}</span>
              </h2>
              <ul>
                {cards.map((r) => (
                  <li key={r.id} className="relative shadow-line-bottom">
                    <PhoneRow row={r} withProject={withProject} reason={lane.state === "nicht_verrechnen" ? reasonOf(r) : null} menuSpace />
                    <DecisionMenu about={about(r)} moves={moves(stateOf(r))} onMove={(m) => setPending({ row: r, move: m })} onTask={() => setTaskFor(r)} className="absolute right-1 bottom-1 size-11" />
                  </li>
                ))}
              </ul>
              {sums.length > 0 && (
                <div className="flex flex-col gap-0.5 px-4 py-2 shadow-line-bottom">
                  {sums.map((s) => (
                    <span key={s.title} className="flex items-baseline justify-between gap-3" title={"cut" in s ? NOT_COMPUTED : undefined}>
                      <span className="text-xs text-fg-secondary">{s.title}</span>
                      {"cut" in s ? <span className="text-xs text-fg-muted">nicht gerechnet</span> : <span className="tabular-nums">{s.text}</span>}
                    </span>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* fixed to the screen at the right, above the sums under the columns */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed right-6 bottom-16 z-30 flex justify-end max-md:inset-x-4 max-md:bottom-4 max-md:justify-center">
        {message && (
          <p className="pointer-events-auto max-w-[420px] rounded-lg bg-fg px-3 py-2 text-white shadow-popup">
            {message.text}
            {message.href && (
              <>
                {" "}
                <Link href={message.href} className="underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-white">
                  {message.link}
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent dim className="top-[24vh] max-w-80 p-3">
          {pending && (
            <DecisionConfirm
              move={pending.move}
              amount={pending.row.amount.text}
              open={openOf(pending.row)}
              subject={`${about(pending.row)}: ${pending.row.name}`}
              title={DialogTitle}
              onConfirm={(grund) => {
                const refused = onDecide(pending.row, pending.move, grund);
                const again = pending.move.label === "Wieder aufnehmen";
                if (refused) say(refused, pending.row.href);
                else say(`${about(pending.row)} ${again ? "ist wieder aufgenommen und geprüft" : LANE[pending.move.stand].done}.`, pending.row.href);
                setPending(null);
              }}
              onCancel={() => setPending(null)}
            />
          )}
        </DialogContent>
      </Dialog>
      <TaskDialog
        open={taskFor !== null}
        onOpenChange={(o) => !o && setTaskFor(null)}
        targets={taskFor ? [targetOf(taskFor)] : []}
        onMade={(t) => say(`Aufgabe für ${t.zustaendig} zu ${about(taskFor!)} angelegt.`, "/aufgaben/", "Aufgaben öffnen")}
      />
    </>
  );
}

/**
 * A find in the phone list (below 768 px, customer test 2: the wide table showed four letters of the name): number,
 * the short name with the word that matters and the amount on top, then the Entscheidung (left out where a group
 * already says it) and a Belegstand only when it is not "belegt", then the Kürzungsrisiko, the project and the reason
 * of a "Nicht verrechnen". Everything else is on the find page the row opens.
 */
export function PhoneRow({ row, withProject, decision, reason, menuSpace }: { row: FindRow; withProject: boolean; decision?: string; reason?: string | null; menuSpace?: boolean }) {
  // the Belegstand always written with its dot (step 8d), "belegt" too, as in the table
  const tags = decision || row.belegstand;
  return (
    <Link href={row.href} className="flex flex-col gap-1.5 px-4 py-3 outline-none active:bg-row-hover focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
      <span className="flex items-start gap-2">
        <span className="mt-px flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{row.number}</span>
        <span className="line-clamp-2 min-w-0 flex-1">{row.name}</span>
        <span className="shrink-0 whitespace-nowrap tabular-nums">{row.amount.text}</span>
      </span>
      {tags && (
        <span className="flex flex-wrap items-center gap-1.5 pl-9">
          {row.belegstand && <Tag colour={EVIDENCE[row.belegstand.state]}>{row.belegstand.text}</Tag>}
          {decision && <Tag>{decision}</Tag>}
        </span>
      )}
      {row.risk && !reason && <RiskText wrap risk={row.risk} amount={row.amount} className={cn("pl-9 text-xs text-fg-secondary", menuSpace && "pr-10")} />}
      {reason && <span className={cn("line-clamp-2 pl-9 text-xs text-fg-secondary", menuSpace && "pr-10")}>Grund: {reason}</span>}
      {withProject && <span className={cn("truncate pl-9 text-xs text-fg-secondary", menuSpace && "pr-10")}>{row.project.name}</span>}
    </Link>
  );
}

function Card({
  row,
  moves,
  tasks,
  reason,
  about,
  withProject,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
  onTask,
}: {
  row: FindRow;
  moves: Move[];
  tasks: number;
  /** The reason of a "Nicht verrechnen", shown on the card in that column instead of the risk. */
  reason: string | null;
  /** "F1" or "F1 Wohnpark Mooshaim" on the board of the business. */
  about: string;
  withProject: boolean;
  dragging: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  onMove: (m: Move) => void;
  onTask: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "group/card relative cursor-grab rounded-[12px] bg-surface shadow-[0_0_0_1px_rgb(0_0_0/0.06)] transition-shadow hover:shadow-[0_0_0_1px_rgb(0_0_0/0.1),0_2px_4px_-2px_rgb(16_24_40/0.08)] active:cursor-grabbing",
        dragging && "opacity-50",
      )}
    >
      {/* only what a decision needs: what was found, what it is worth, what is wrong with it; the rest is on the find page */}
      <Link href={row.href} draggable={false} className="flex flex-col gap-1 rounded-[12px] px-3 pt-2.5 pb-2.5 outline-none focus-visible:outline-2 focus-visible:outline-accent">
        <span className="flex gap-2">
          <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{row.number}</span>
          <span className="line-clamp-3 min-w-0" title={row.name}>
            {row.name}
          </span>
        </span>
        <span className="truncate text-xs text-fg-secondary" title={row.detail}>
          {row.detail}
        </span>
        <span className="flex min-h-6 flex-wrap items-center gap-x-2 gap-y-1 pr-8">
          <span className="tabular-nums">
            <span className="sr-only">Betrag </span>
            {row.amount.text}
          </span>
          {row.belegstand && row.belegstand.state !== "belegt" && <Tag colour={EVIDENCE[row.belegstand.state]}>{row.belegstand.text}</Tag>}
        </span>
        {row.risk && !reason && <RiskText wrap risk={row.risk} amount={row.amount} className="pr-8 text-xs text-fg-secondary" />}
        {reason && <span className="line-clamp-2 pr-8 text-xs text-fg-secondary">Grund: {reason}</span>}
        {(withProject || tasks > 0) && (
          <span className="flex items-center gap-2 pr-8 text-xs text-fg-secondary">
            {withProject && <span className="min-w-0 truncate">{row.project.name}</span>}
            {tasks > 0 && (
              <span className="flex shrink-0 items-center gap-1" title={`${tasks} ${tasks === 1 ? "Aufgabe" : "Aufgaben"}`}>
                <ListTodo className="size-3.5" aria-hidden />
                <span className="tabular-nums">{tasks}</span>
                <span className="sr-only">{tasks === 1 ? "Aufgabe" : "Aufgaben"}</span>
              </span>
            )}
          </span>
        )}
      </Link>
      <DecisionMenu about={about} moves={moves} onMove={onMove} onTask={onTask} className="absolute right-2 bottom-2 size-7" />
    </div>
  );
}

/**
 * "…" with the decisions a find can take, each with the icon of its column, and "Aufgabe anlegen"; always visible, the
 * way for keyboard and phones.
 */
function DecisionMenu({ about, moves, onMove, onTask, className }: { about: string; moves: Move[]; onMove: (m: Move) => void; onTask: () => void; className?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Entscheidung zu ${about}`}
        className={cn(
          "flex items-center justify-center rounded-md text-fg-muted outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover data-popup-open:text-fg",
          className,
        )}
      >
        <Ellipsis className="size-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Entscheidung</DropdownMenuLabel>
          {moves.map((m) => {
            const Icon = LANE[m.stand].icon;
            return (
              <DropdownMenuItem key={m.stand} onClick={() => onMove(m)}>
                <Icon />
                {m.label}
              </DropdownMenuItem>
            );
          })}
          {moves.length === 0 && <DropdownMenuItem disabled>Steht in der Schlussrechnung</DropdownMenuItem>}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onTask}>
          <ListTodo />
          Aufgabe anlegen
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Under each column, as Attio's "Add calculation": the fixed sums of `kern/` for exactly these cards, else "nicht gerechnet". */
function ColumnFooter({ state, cards, calculations }: { state: DecisionState; cards: FindRow[]; calculations: Calculation[] }): ReactNode {
  const sums = state === "nicht_verrechnen" ? [] : columnSums(calculations, cards);
  return (
    <div className="flex min-h-[34px] flex-col items-end justify-center gap-0.5 px-2 pt-1.5">
      {state === "nicht_verrechnen" && cards.length > 0 && <span className="text-xs text-fg-muted">zählt in keiner Summe</span>}
      {sums.map((s) => (
        <span key={s.title} className="flex max-w-full items-baseline gap-1.5" title={"cut" in s ? NOT_COMPUTED : undefined}>
          <span className="truncate text-xs text-fg-secondary">{s.title}</span>
          {"cut" in s ? <span className="shrink-0 text-xs text-fg-muted">nicht gerechnet</span> : <span className="shrink-0 tabular-nums">{s.text}</span>}
        </span>
      ))}
    </div>
  );
}
