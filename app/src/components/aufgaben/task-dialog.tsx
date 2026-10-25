"use client";

import { useState } from "react";

import { field } from "@/components/fund/decision-confirm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { appendTask, localTime, type Task } from "@/lib/decisions";
import { ROLES, type TaskTarget } from "@/lib/tasks";

/**
 * "Aufgabe anlegen" (Attio's "Create task" modal), the same on "Aufgaben", on the find page and on a card of the board:
 * what is to be done, the find it closes a gap on, who is in charge and by when. On a find the find is set and its
 * Abhilfe is the text; on "Aufgaben" the find is chosen first and brings its Abhilfe along. Appended in this browser.
 */
export function TaskDialog({
  open,
  onOpenChange,
  targets,
  onMade,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** One find when the task is made on it; every find when it is made on "Aufgaben". */
  targets: TaskTarget[];
  onMade?: (task: Task) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dim className="max-w-[520px] p-4">
        {/* a fresh form each time the modal opens */}
        {open && (
          <TaskForm
            targets={targets}
            onCancel={() => onOpenChange(false)}
onMade={(t) => {
              onMade?.(t);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function TaskForm({ targets, onCancel, onMade }: { targets: TaskTarget[]; onCancel: () => void; onMade: (task: Task) => void }) {
  const fixed = targets.length === 1 ? targets[0] : null;
  const [key, setKey] = useState(fixed?.key ?? "");
  const target = targets.find((t) => t.key === key) ?? null;
  // the Abhilfe is site work (joint Aufmaß, a signature) in most finds, so the Bauleitung is proposed
  const [task, setTask] = useState({ text: fixed?.taskText ?? "", zustaendig: "Bauleitung", bis: "" });
  const projects = [...new Set(targets.map((t) => t.project))];

  const choose = (next: string) => {
    const chosen = targets.find((t) => t.key === next);
    // a text the user has not changed follows the find; a text of their own stays
    if (chosen && (!task.text.trim() || task.text === target?.taskText)) setTask({ ...task, text: chosen.taskText });
    setKey(next);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!target || !task.text.trim()) return;
        const made: Task = {
          id: `aufgabe-${Date.now()}`,
          fundSchluessel: target.key,
          fund: target.label,
          href: target.href,
          zeit: localTime(),
          wer: "Abrechnung",
          text: task.text.trim(),
          zustaendig: task.zustaendig,
          bis: task.bis || null,
        };
        appendTask(made);
        onMade(made);
      }}
      className="flex flex-col gap-3"
    >
      <DialogTitle className="text-sm font-semibold">Aufgabe anlegen</DialogTitle>
      {fixed ? (
        <p className="flex items-start gap-2 rounded-md bg-fill-subtle px-2 py-1.5 shadow-ring">
          <span className="text-xs text-fg-secondary">Fund</span>
          <span className="min-w-0 flex-1">
            {fixed.label}
            <span className="block truncate text-xs text-fg-secondary">{fixed.name}</span>
          </span>
        </p>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-fg-secondary">
          Fund
          <select value={key} onChange={(e) => choose(e.target.value)} required className={field}>
            <option value="" disabled>
              Fund wählen
            </option>
            {projects.map((p) => (
              <optgroup key={p} label={p}>
                {targets
                  .filter((t) => t.project === p)
                  .map((t) => (
                    <option key={t.key} value={t.key}>
                      {t.label.split(" ")[0]} {t.name}
                    </option>
                  ))}
              </optgroup>
            ))}
          </select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-fg-secondary">
        Was ist zu tun
        <textarea
          value={task.text}
          onChange={(e) => setTask({ ...task, text: e.target.value })}
          rows={3}
          required
          placeholder={!target ? "Zuerst den Fund wählen, dann steht hier seine Abhilfe." : target.taskText ? undefined : "Für diesen Fund gibt es keine Abhilfe. Was ist zu tun?"}
          className={field}
        />
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
          <input type="date" value={task.bis} min={localTime().slice(0, 10)} onChange={(e) => setTask({ ...task, bis: e.target.value })} className={field} />
        </label>
      </div>
      <p className="text-xs text-fg-muted">{target?.deadline ? `${target.deadline}. ` : ""}Vorerst nur in diesem Browser gespeichert.</p>
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" variant="primary" disabled={!target || !task.text.trim()}>
          Anlegen
        </Button>
      </div>
    </form>
  );
}
