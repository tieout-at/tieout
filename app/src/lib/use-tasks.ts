"use client";

import { useEffect, useState } from "react";

import { appendTaskCheck, localTime, onStorageChange, readTaskChecks, readTasks } from "./decisions";
import { withChecks, type TaskItem } from "./tasks";

/** The tasks of this browser with their ticks; null before the first read (the static page knows none). */
export function useTasks(): TaskItem[] | null {
  const [items, setItems] = useState<TaskItem[] | null>(null);
  useEffect(() => {
    const load = () => setItems(withChecks(readTasks(), readTaskChecks()));
    load();
    return onStorageChange(load);
  }, []);
  return items;
}

/**
 * Ticks a task off or opens it again, noted as the role in charge of it. Reads the latest list first, so a second tab
 * that already ticked it adds no second entry.
 */
export function checkTask(task: TaskItem, erledigt: boolean): void {
  const fresh = withChecks(readTasks(), readTaskChecks()).find((t) => t.id === task.id);
  if (fresh && Boolean(fresh.done) === erledigt) return;
  appendTaskCheck({ aufgabeId: task.id, zeit: localTime(), wer: task.zustaendig, erledigt });
}

/** Today as "2026-10-25" in this browser; null in the static HTML. */
export function useToday(): string | null {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- the date exists only in the browser
    setToday(localTime().slice(0, 10));
  }, []);
  return today;
}
