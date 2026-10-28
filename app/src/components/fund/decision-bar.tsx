"use client";

import Link from "next/link";
import { Ban, Check, ListTodo } from "lucide-react";
import { useState } from "react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { useActor } from "@/lib/account";
import { moves, yourMoves } from "@/lib/decision-rules";
import type { Decision, DecisionState } from "@/lib/decisions";
import type { TaskTarget } from "@/lib/tasks";
import { DecisionConfirm } from "./decision-confirm";

/**
 * The decision bar of a find (Attio's action bar under the record name, SPEZIFIKATION.md 4.2): the next step of
 * "Gefunden" → "Geprüft" → "Freigegeben", "Nicht verrechnen" with a reason, and "Aufgabe anlegen". Each is confirmed in
 * a small popup and appended, never changed; one find at a time, never in bulk. With an account only the steps of the
 * person's roles are offered, and one quiet line says whose the others are (the database refuses them anyway).
 */
export function DecisionBar({
  state,
  checker,
  amount,
  target,
  open,
  onDecide,
}: {
  state: DecisionState;
  /** Who checked the find last (with an account), so nobody is offered the release of their own check. */
  checker: string | null;
  amount: string;
  /** The find as "Aufgabe anlegen" names it, with its Abhilfe as the text. */
  target: TaskTarget;
  /** What is still open on the find, shown before it is released: the risk and the tasks. */
  open: string[];
  onDecide: (stand: Decision["stand"], wer: string, grund?: string) => void;
}) {
  const { allowed, why } = yourMoves(moves(state), useActor(), checker);
  const next = allowed.find((m) => m.stand !== "nicht_verrechnen");
  const notBilled = allowed.find((m) => m.stand === "nicht_verrechnen");
  const [openNext, setOpenNext] = useState(false);
  const [openNo, setOpenNo] = useState(false);
  const [openTask, setOpenTask] = useState(false);
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
        <Button onClick={() => setOpenTask(true)}>
          <ListTodo aria-hidden />
          Aufgabe anlegen
        </Button>
        <TaskDialog open={openTask} onOpenChange={setOpenTask} targets={[target]} onMade={(t) => setMade(`Aufgabe für ${t.zustaendig} angelegt.`)} />
      </div>
      {why && <p className="text-xs text-fg-secondary">{why}</p>}
      {made && (
        <p role="status" className="text-xs text-fg">
          {made}{" "}
          <Link href="/aufgaben/" className="link-quiet">
            Aufgaben öffnen
          </Link>
        </p>
      )}
    </div>
  );
}
