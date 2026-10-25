"use client";

import Link from "next/link";
import { Ban, Check, ListTodo } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { moves, nextStep, type Decision, type DecisionState, type Task } from "@/lib/decisions";
import { DecisionConfirm, field } from "./decision-confirm";

const ROLES = ["Abrechnung", "Bauleitung", "Geschäftsführung"];

/**
 * The decision bar of a find (Attio's action bar under the record name, SPEZIFIKATION.md 4.2): the next step of
 * "Gefunden" → "Geprüft" → "Freigegeben", "Nicht verrechnen" with a reason, and "Aufgabe anlegen". Each is confirmed in
 * a small popup and appended, never changed; one find at a time, never in bulk.
 */
export function DecisionBar({
  state,
  amount,
  taskText,
  deadline,
  open,
  onDecide,
  onTask,
}: {
  state: DecisionState;
  amount: string;
  taskText: string;
  deadline: string | null;
  /** What is still open on the find, shown before it is released: the risk and the tasks. */
  open: string[];
  onDecide: (stand: Decision["stand"], wer: string, grund?: string) => void;
  onTask: (t: Pick<Task, "text" | "zustaendig" | "bis">) => void;
}) {
  const next = nextStep(state);
  const notBilled = moves(state).find((m) => m.stand === "nicht_verrechnen");
  const [openNext, setOpenNext] = useState(false);
  const [openNo, setOpenNo] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  // the Abhilfe is site work (joint Aufmaß, a signature) in most finds, so the Bauleitung is proposed
  const [task, setTask] = useState({ text: taskText, zustaendig: "Bauleitung", bis: "" });
  const [made, setMade] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-1.5 px-6 pb-4 max-md:px-4">
      <div className="flex flex-wrap items-center gap-2">
        {next && (
          <Popover open={openNext} onOpenChange={setOpenNext}>
            <PopoverTrigger render={<Button variant="primary" />}>
              <Check aria-hidden />
              {next.label}
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <DecisionConfirm
                move={next}
                amount={amount}
                open={open}
                title={PopoverTitle}
                onConfirm={(grund) => {
                  onDecide(next.stand, next.wer, grund);
                  setOpenNext(false);
                }}
                onCancel={() => setOpenNext(false)}
              />
            </PopoverContent>
          </Popover>
        )}
        {notBilled && (
          <Popover open={openNo} onOpenChange={setOpenNo}>
            <PopoverTrigger render={<Button />}>
              <Ban aria-hidden />
              Nicht verrechnen
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <DecisionConfirm
                move={notBilled}
                amount={amount}
                open={open}
                title={PopoverTitle}
                onConfirm={(grund) => {
                  onDecide(notBilled.stand, notBilled.wer, grund);
                  setOpenNo(false);
                }}
                onCancel={() => setOpenNo(false)}
              />
            </PopoverContent>
          </Popover>
        )}
        <Popover open={openTask} onOpenChange={setOpenTask}>
          <PopoverTrigger render={<Button />}>
            <ListTodo aria-hidden />
            Aufgabe anlegen
          </PopoverTrigger>
          <PopoverContent className="w-80 p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!task.text.trim()) return;
                onTask({ text: task.text.trim(), zustaendig: task.zustaendig, bis: task.bis || null });
                setMade(`Aufgabe für ${task.zustaendig} angelegt.`);
                setOpenTask(false);
              }}
              className="flex flex-col gap-2"
            >
              <PopoverTitle className="p-0 text-sm text-fg">Aufgabe anlegen</PopoverTitle>
              <label className="flex flex-col gap-1 text-xs text-fg-secondary">
                Was ist zu tun
                <textarea value={task.text} onChange={(e) => setTask({ ...task, text: e.target.value })} rows={3} required className={field} />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs text-fg-secondary">
                  Zuständig
                  <select value={task.zustaendig} onChange={(e) => setTask({ ...task, zustaendig: e.target.value })} className={field}>
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-fg-secondary">
                  Erledigen bis
                  <input type="date" value={task.bis} onChange={(e) => setTask({ ...task, bis: e.target.value })} className={field} />
                </label>
              </div>
              <p className="text-xs text-fg-muted">{deadline ? `${deadline}. ` : ""}Bis zur Anmeldung nur in diesem Browser.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" onClick={() => setOpenTask(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" variant="primary" disabled={!task.text.trim()}>
                  Anlegen
                </Button>
              </div>
            </form>
          </PopoverContent>
        </Popover>
      </div>
      {made && (
        <p role="status" className="text-xs text-fg">
          {made}{" "}
          <Link href="/aufgaben/" className="rounded-xs text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            Aufgaben öffnen
          </Link>
        </p>
      )}
    </div>
  );
}
