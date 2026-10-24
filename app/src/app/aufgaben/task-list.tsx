"use client";

import Link from "next/link";
import { ListTodo, SquareCheck } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyState, SectionEmpty } from "@/components/shell/empty-state";
import { readTasks, type Task } from "@/lib/decisions";

const datum = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

function useTasks(): Task[] | null {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of a browser-only value
    setTasks(readTasks());
  }, []);
  return tasks;
}

/** The three newest tasks for the section on Start, or its empty state. */
export function TaskPreview() {
  const tasks = useTasks();
  if (!tasks?.length) return <SectionEmpty title="Keine offenen Aufgaben" text="Aus jeder Lücke wird eine Aufgabe mit Frist." />;
  return <Rows tasks={tasks.toReversed().slice(0, 3)} />;
}

function Rows({ tasks }: { tasks: Task[] }) {
  return (
    <ul className="rounded-lg bg-surface p-1 shadow-ring">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-start gap-2.5 rounded-md px-2 py-2.5 [&:not(:last-child)]:shadow-line-bottom">
          <span aria-hidden className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-xs bg-fill-hover text-fg-secondary shadow-ring">
            <ListTodo className="size-3" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span>{t.text}</span>
            <span className="text-xs text-fg-secondary">
              {t.zustaendig}
              {t.bis ? `, bis ${datum(t.bis)}` : ""} ·{" "}
              <Link href={t.href} className="rounded-xs text-accent outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent">
                {t.fund}
              </Link>
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * "Aufgaben" in stage 0: the tasks laid out on finds in this browser, newest first, each with its find; the empty state
 * when there are none. The full page (Attio's Tasks with modal, filters and done) follows in step 7.
 */
export function TaskList() {
  const tasks = useTasks();
  if (!tasks?.length) {
    return <EmptyState icon={SquareCheck} title="Aufgaben" text="Aus jeder Lücke wird eine Aufgabe, zum Beispiel „Regiebericht schreiben und vom Polier unterschreiben lassen“." />;
  }
  return (
    <div className="mx-auto flex w-full max-w-[760px] flex-col gap-2 px-6 py-5 max-md:px-4">
      <h2 className="text-sm text-fg-secondary">
        {tasks.length === 1 ? "1 Aufgabe" : `${tasks.length} Aufgaben`}
      </h2>
      <p className="text-xs text-fg-muted">Angelegt auf Funden, vorerst in diesem Browser gespeichert, bis die Anmeldung kommt.</p>
      <div className="mt-2">
        <Rows tasks={tasks.toReversed()} />
      </div>
    </div>
  );
}
