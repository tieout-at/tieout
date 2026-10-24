"use client";

import Link from "next/link";
import { Ban, Check, ListTodo } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { nextStep, type Decision, type DecisionState, type Task } from "@/lib/decisions";

const field =
  "w-full rounded-md bg-surface px-2 py-1.5 text-sm shadow-[inset_0_0_0_1px_var(--color-line)] outline-none focus-visible:shadow-[inset_0_0_0_1px_var(--color-accent)] max-md:text-base";

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
  const [openNext, setOpenNext] = useState(false);
  const [openNo, setOpenNo] = useState(false);
  const [openTask, setOpenTask] = useState(false);
  const [reason, setReason] = useState("");
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
              <PopoverTitle className="p-0 pb-1 text-sm text-fg">{next.label === "Freigeben" ? "Für die Schlussrechnung freigeben?" : next.label === "Prüfen" ? "Rechenweg und Belege geprüft?" : "Wieder aufnehmen?"}</PopoverTitle>
              <p className="text-xs text-fg-secondary">
                {next.label === "Freigeben"
                  ? `${amount} werden für die Schlussrechnung freigegeben.`
                  : next.label === "Prüfen"
                    ? "Danach gibt die Geschäftsführung frei."
                    : "Der Fund zählt wieder und geht zur Freigabe."}{" "}
                Vermerkt als {next.wer}; bis die Anmeldung kommt, unterscheidet die App noch keine Personen.
              </p>
              {next.label === "Freigeben" && open.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1 rounded-md bg-fill-subtle px-2 py-1.5 text-xs shadow-ring">
                  {open.map((o) => (
                    <li key={o}>
                      <span className="text-fg-secondary">Noch offen: </span>
                      {o}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-3 flex justify-end gap-2">
                <Button onClick={() => setOpenNext(false)}>Abbrechen</Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    onDecide(next.stand, next.wer, next.label === "Wieder aufnehmen" ? "wieder aufgenommen" : undefined);
                    setOpenNext(false);
                  }}
                >
                  {next.label === "Prüfen" ? "Als geprüft vermerken" : next.label}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        )}
        {state !== "nicht_verrechnen" && state !== "in_schlussrechnung" && (
          <Popover open={openNo} onOpenChange={setOpenNo}>
            <PopoverTrigger render={<Button />}>
              <Ban aria-hidden />
              Nicht verrechnen
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!reason.trim()) return;
                  onDecide("nicht_verrechnen", "Abrechnung", reason.trim());
                  setReason("");
                  setOpenNo(false);
                }}
                className="flex flex-col gap-2"
              >
                <PopoverTitle className="p-0 text-sm text-fg">Nicht verrechnen</PopoverTitle>
                <label className="flex flex-col gap-1 text-xs text-fg-secondary">
                  Grund
                  <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} required placeholder="Zum Beispiel: schon mit einem Nachtrag verrechnet" className={field} />
                </label>
                <p className="text-xs text-fg-muted">Der Fund zählt dann in keiner Summe. Vermerkt als Abrechnung.</p>
                <div className="flex justify-end gap-2">
                  <Button type="button" onClick={() => setOpenNo(false)}>
                    Abbrechen
                  </Button>
                  <Button type="submit" variant="primary" disabled={!reason.trim()}>
                    Nicht verrechnen
                  </Button>
                </div>
              </form>
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
              {deadline && <p className="text-xs text-fg-muted">{deadline}</p>}
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
      {made ? (
        <p role="status" className="text-xs text-fg">
          {made}{" "}
          <Link href="/aufgaben/" className="rounded-xs text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
            Aufgaben öffnen
          </Link>
        </p>
      ) : (
        <p className="text-xs text-fg-muted">Entscheidungen und Aufgaben bleiben vorerst in diesem Browser, bis die Anmeldung kommt.</p>
      )}
    </div>
  );
}
