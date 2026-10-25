"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type DragEvent } from "react";
import { Ban, Check, CircleCheck, CircleCheckBig, CircleDashed, Construction, Ellipsis, FileCheck, ListTodo, ReceiptText, ShieldAlert, Wallet, type LucideIcon } from "lucide-react";

import { DecisionConfirm } from "@/components/fund/decision-confirm";
import { Tag, type TagColour } from "@/components/table/tag";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DECISION_TEXT, moves, refusal, type DecisionState, type Move } from "@/lib/decisions";
import type { FindRow } from "@/lib/kern-data";
import { columnSums, type Calculation } from "@/lib/table";
import { cn } from "@/lib/utils";

const EVIDENCE: Record<NonNullable<FindRow["belegstand"]>["state"], TagColour> = { belegt: "green", beleg_fehlt: "yellow", nachtrag_nicht_gelegt: "orange" };

/** The columns of the board: the decision flow of SPEZIFIKATION.md 3.2, "Nicht verrechnen" set apart at the end. */
const LANES: { state: DecisionState; icon: LucideIcon; empty: string }[] = [
  { state: "gefunden", icon: CircleDashed, empty: "Kein Fund mehr offen" },
  { state: "geprueft", icon: CircleCheck, empty: "Noch kein Fund geprüft" },
  { state: "freigegeben", icon: CircleCheckBig, empty: "Noch kein Fund freigegeben" },
  { state: "in_schlussrechnung", icon: ReceiptText, empty: "Kommt mit der Schlussrechnung" },
  { state: "nicht_verrechnen", icon: Ban, empty: "Kein Fund ausgeschlossen" },
];

type Pending = { row: FindRow; move: Move };

/**
 * "Funde" as a board by Entscheidung (Attio's "Pipeline" on Deals, measured 25.10.2026): columns of 268 px on the
 * sidebar grey with a radius of 16, cards of 246 px with a radius of 12, the fixed sums of `kern/` under each column.
 * Moving a card is a decision: it opens the same confirmation as the decision bar, one find and one step at a time,
 * never in bulk. The menu on each card offers the same moves for the keyboard and for phones.
 */
export function FindsBoard({
  rows,
  calculations,
  stateOf,
  tasksOf,
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
  /** What is still open before a release, as on the find page. */
  openOf: (r: FindRow) => string[];
  withProject: boolean;
  /** Records the decision; returns why it was refused when another tab decided first. */
  onDecide: (r: FindRow, move: Move, grund?: string) => string | null;
}) {
  const [dragging, setDragging] = useState<FindRow | null>(null);
  const [over, setOver] = useState<DecisionState | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [message, setMessage] = useState<{ text: string; href?: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);
  const say = (text: string, href?: string) => {
    clearTimeout(timer.current);
    setMessage({ text, href });
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

  return (
    <>
      {/* as tall as the screen below the two bars; inside a project page, which scrolls as a whole, it fills the screen once scrolled to */}
      <div className="flex h-[calc(100dvh-var(--header-height)-6rem)] min-h-[420px] shrink-0 max-md:h-[calc(100dvh-var(--header-height)-8rem)] gap-2 overflow-x-auto px-2.5 pt-3 pb-2 max-md:snap-x max-md:snap-mandatory max-md:scroll-px-4 max-md:px-4">
        {LANES.map((lane) => {
          const cards = rows.filter((r) => stateOf(r) === lane.state);
          const target = dragging ? stateOf(dragging) !== lane.state && refusal(stateOf(dragging), lane.state) === null : false;
          const apart = lane.state === "nicht_verrechnen";
          return (
            <section
              key={lane.state}
              aria-label={`${DECISION_TEXT[lane.state]}, ${cards.length} ${cards.length === 1 ? "Fund" : "Funde"}`}
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
              className={cn("flex w-[268px] shrink-0 snap-start flex-col max-md:w-[min(300px,calc(100vw-56px))]", apart && "md:ml-4")}
            >
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
                  <span className={cn("truncate font-semibold", apart && "text-fg-secondary")}>{DECISION_TEXT[lane.state]}</span>
                  <span className="flex h-4 min-w-4 items-center justify-center rounded-sm bg-fill-hover px-1 text-xs text-count tabular-nums">{cards.length}</span>
                </h2>
                <ul className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-[11px] pt-2 pb-3 [scrollbar-width:thin]">
                  {cards.map((r) => (
                    <li key={r.id}>
                      <Card
                        row={r}
                        moves={moves(stateOf(r))}
                        tasks={tasksOf(r)}
                        about={about(r)}
                        withProject={withProject}
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
                      />
                    </li>
                  ))}
                  {cards.length === 0 && (
                    <li className="flex h-9 items-center justify-center rounded-md px-2 text-center text-fg-muted shadow-[inset_0_0_0_1px_var(--color-line)]">{lane.empty}</li>
                  )}
                </ul>
              </div>
              <ColumnFooter state={lane.state} cards={cards} calculations={calculations} />
            </section>
          );
        })}
      </div>

      {/* fixed to the screen: inside a project page the bottom of the board can lie below it */}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
        {message && (
          <p className="pointer-events-auto max-w-[480px] rounded-lg bg-fg px-3 py-2 text-white shadow-popup">
            {message.text}
            {message.href && (
              <>
                {" "}
                <Link href={message.href} className="underline underline-offset-2 outline-none focus-visible:outline-2 focus-visible:outline-white">
                  Fund öffnen
                </Link>
              </>
            )}
          </p>
        )}
      </div>

      <Dialog open={pending !== null} onOpenChange={(o) => !o && setPending(null)}>
        <DialogContent className="top-[24vh] max-w-80 p-3">
          {pending && (
            <DecisionConfirm
              move={pending.move}
              amount={pending.row.amount.text}
              open={openOf(pending.row)}
              subject={`${about(pending.row)}: ${pending.row.name}`}
              title={DialogTitle}
              onConfirm={(grund) => {
                const refused = onDecide(pending.row, pending.move, grund);
                if (refused) say(refused, pending.row.href);
                else say(`${about(pending.row)} steht jetzt auf ${DECISION_TEXT[pending.move.stand]}.`, pending.row.href);
                setPending(null);
              }}
              onCancel={() => setPending(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function Card({
  row,
  moves,
  tasks,
  about,
  withProject,
  dragging,
  onDragStart,
  onDragEnd,
  onMove,
}: {
  row: FindRow;
  moves: Move[];
  tasks: number;
  /** "F1" or "F1 Wohnpark Mooshaim" on the board of the business. */
  about: string;
  withProject: boolean;
  dragging: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragEnd: () => void;
  onMove: (m: Move) => void;
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
      <Link href={row.href} draggable={false} className="block rounded-[12px] outline-none focus-visible:outline-2 focus-visible:outline-accent">
        <span className="flex gap-2 py-2.5 pr-9 pl-3 max-md:pr-12">
          <span className="flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">{row.number}</span>
          <span className="line-clamp-3 min-w-0" title={row.name}>
            {row.name}
          </span>
        </span>
        <span className="flex flex-col pb-0.5">
          <Attribute icon={Wallet} label="Betrag">
            <span className="tabular-nums">{row.amount.text}</span>
          </Attribute>
          {row.belegstand && (
            <Attribute icon={FileCheck} label="Belegstand">
              <Tag colour={EVIDENCE[row.belegstand.state]}>{row.belegstand.text}</Tag>
            </Attribute>
          )}
          <Attribute icon={ShieldAlert} label="Kürzungsrisiko" wrap={Boolean(row.risk)}>
            {row.risk ? (
              <span className="line-clamp-2 min-w-0" title={`${row.risk.number}: ${row.risk.reason}`}>
                {row.risk.reason},{" "}
                <span className="whitespace-nowrap text-fg-secondary tabular-nums">{row.risk.alreadyCut ? `schon gekürzt ${row.risk.amount.text}` : row.risk.amount.text}</span>
              </span>
            ) : (
              <span className="text-fg-muted">kein Kürzungsrisiko</span>
            )}
          </Attribute>
          {withProject && (
            <Attribute icon={Construction} label="Projekt">
              <span className="truncate">{row.project.name}</span>
            </Attribute>
          )}
        </span>
        <span className="flex h-[34px] items-center gap-2 px-3 pt-1.5 pb-2 text-xs text-fg-secondary">
          <span className="min-w-0 flex-1 truncate">{row.kind}</span>
          {tasks > 0 && (
            <span className="flex shrink-0 items-center gap-1" title={`${tasks} ${tasks === 1 ? "Aufgabe" : "Aufgaben"}`}>
              <ListTodo className="size-3.5" aria-hidden />
              <span className="tabular-nums">{tasks}</span>
              <span className="sr-only">{tasks === 1 ? "Aufgabe" : "Aufgaben"}</span>
            </span>
          )}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Entscheidung zu ${about}`}
          className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-md text-fg-secondary opacity-0 outline-none group-hover/card:opacity-100 hover:bg-fill-hover hover:text-fg focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover data-popup-open:opacity-100 max-md:top-0.5 max-md:right-0.5 max-md:size-11 max-md:opacity-100"
        >
          <Ellipsis className="size-4" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-52">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Entscheidung</DropdownMenuLabel>
            {moves.map((m) => (
              <DropdownMenuItem key={m.stand} onClick={() => onMove(m)}>
                {m.stand === "nicht_verrechnen" ? <Ban /> : <Check />}
                {m.label}
              </DropdownMenuItem>
            ))}
            {moves.length === 0 && <DropdownMenuItem disabled>Steht in der Schlussrechnung</DropdownMenuItem>}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/** One attribute of a card (Attio: 32 px, icon and value); `wrap` lets a longer value take a second line. */
function Attribute({ icon: Icon, label, wrap, children }: { icon: LucideIcon; label: string; wrap?: boolean; children: React.ReactNode }) {
  return (
    <span className={cn("flex min-w-0 gap-2 px-3", wrap ? "min-h-8 items-start py-1.5 [&>svg]:mt-0.5" : "h-8 items-center")}>
      <Icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />
      <span className="sr-only">{label}: </span>
      <span className="flex min-w-0 flex-1">{children}</span>
    </span>
  );
}

/** Under each column, as Attio's "Add calculation": the fixed sums of `kern/` for exactly these cards, else none. */
function ColumnFooter({ state, cards, calculations }: { state: DecisionState; cards: FindRow[]; calculations: Calculation[] }) {
  const sums = state === "nicht_verrechnen" ? [] : columnSums(calculations, cards);
  return (
    <div className="flex min-h-[34px] flex-col items-end justify-center gap-0.5 px-2 pt-1.5">
      {state === "nicht_verrechnen" && cards.length > 0 && <span className="text-xs text-fg-muted">zählt in keiner Summe</span>}
      {sums.map((s) => (
        <span
          key={s.title}
          className="flex max-w-full items-baseline gap-1.5"
          title={"cut" in s ? "Die Spalte hält nur einen Teil dieser Funde. Summen kommen nur aus dem Rechenkern, die App zählt keine Beträge zusammen." : undefined}
        >
          <span className="truncate text-xs text-fg-secondary" title={s.title}>
            {s.title}
          </span>
          {"cut" in s ? <span className="shrink-0 text-xs text-fg-muted">keine feste Summe</span> : <span className="shrink-0 tabular-nums">{s.text}</span>}
        </span>
      ))}
    </div>
  );
}
