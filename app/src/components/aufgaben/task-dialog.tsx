"use client";

import { CalendarDays, Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";

import { field } from "@/components/fund/decision-confirm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { appendTask, localTime, type Task } from "@/lib/decisions";
import { ROLES, type TaskTarget } from "@/lib/tasks";
import { SavedWhere } from "@/components/shell/saved-where";

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
  defaults,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** One find when the task is made on it; every find when it is made on "Aufgaben". */
  targets: TaskTarget[];
  onMade?: (task: Task) => void;
  /** Who gets the task and by when, as a task block of "Abläufe" sets it. */
  defaults?: { zustaendig: string; bis: string };
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dim className="max-w-[520px] p-4">
        {/* a fresh form each time the modal opens */}
        {open && (
          <TaskForm
            targets={targets}
            defaults={defaults}
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

function TaskForm({ targets, onCancel, onMade, defaults }: { targets: TaskTarget[]; onCancel: () => void; onMade: (task: Task) => void; defaults?: { zustaendig: string; bis: string } }) {
  const fixed = targets.length === 1 ? targets[0] : null;
  const [key, setKey] = useState(fixed?.key ?? "");
  const target = targets.find((t) => t.key === key) ?? null;
  // the Abhilfe is site work (joint Aufmaß, a signature) in most finds, so the Bauleitung is proposed
  const [task, setTask] = useState({ text: fixed?.taskText ?? "", zustaendig: defaults?.zustaendig ?? "Bauleitung", bis: defaults?.bis ?? "" });
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
          <Select value={key} onChange={(e) => choose(e.target.value)} required>
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
          </Select>
        </label>
      )}
      <label className="flex flex-col gap-1 text-xs text-fg-secondary">
        Was ist zu tun
        <textarea
          value={task.text}
          onChange={(e) => setTask({ ...task, text: e.target.value })}
          rows={3}
          required
          // as long as the database takes it (2000 characters)
          maxLength={2000}
          placeholder={!target ? "Zuerst den Fund wählen, dann steht hier seine Abhilfe." : target.taskText ? undefined : "Für diesen Fund gibt es keine Abhilfe. Was ist zu tun?"}
          className={field}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col gap-1 text-xs text-fg-secondary">
          Zuständig
          <Select value={task.zustaendig} onChange={(e) => setTask({ ...task, zustaendig: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
        </label>
        <div className="flex flex-col gap-1 text-xs text-fg-secondary">
          <span aria-hidden>Erledigen bis</span>
          <DuePicker value={task.bis} onChange={(bis) => setTask({ ...task, bis })} />
        </div>
      </div>
      <p className="text-xs text-fg-muted">{target?.deadline ? `${target.deadline}. ` : ""}<SavedWhere variant="satz" /></p>
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

/** A native select (the phone's own picker) drawn as our field, with Lucide's up-down chevrons instead of the browser's arrow. */
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <span className="relative flex">
      <select {...props} className={cn(field, "h-8 cursor-pointer appearance-none pr-8 text-fg max-md:h-11", className)}>
        {children}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
    </span>
  );
}

const plus = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localTime(d).slice(0, 10);
};
const dayText = (iso: string) => new Intl.DateTimeFormat("de-AT", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${iso}T12:00`));

/** The due date as Attio picks it: a field that says "Ohne Frist" or the day, and a popup with the usual choices and a calendar. */
function DuePicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const [open, setOpen] = useState(false);
  const choices = [
    { label: "Ohne Frist", iso: "" },
    { label: "Heute", iso: plus(0) },
    { label: "Morgen", iso: plus(1) },
    { label: "In drei Tagen", iso: plus(3) },
    { label: "In einer Woche", iso: plus(7) },
  ];
  const pick = (iso: string) => {
    onChange(iso);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger aria-label={`Erledigen bis: ${value ? dayText(value) : "Ohne Frist"}`} className={cn(field, "flex h-8 items-center gap-2 text-left text-fg max-md:h-11")}>
        <CalendarDays className="size-4 shrink-0 text-fg-muted" aria-hidden />
        <span className={cn("flex-1 truncate", !value && "text-fg-muted")}>{value ? dayText(value) : "Ohne Frist"}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60">
        <ul>
          {choices.map((c) => (
            <li key={c.label}>
              <button type="button" onClick={() => pick(c.iso)} className="flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm outline-none hover:bg-fill-hover focus-visible:bg-fill-hover max-md:h-11">
                <span className="flex-1 text-left">{c.label}</span>
                {c.iso && <span className="text-xs text-fg-muted tabular-nums">{dayText(c.iso)}</span>}
                {value === c.iso && <Check className="size-4 text-fg-secondary" aria-label="gewählt" />}
              </button>
            </li>
          ))}
        </ul>
        <div className="-mx-1 my-1 h-px bg-line" />
        <label className="flex flex-col gap-1 px-2 pt-1 pb-1.5 text-xs text-fg-secondary">
          Anderes Datum
          <input type="date" value={value} min={plus(0)} onChange={(e) => onChange(e.target.value)} className={cn(field, "text-fg")} />
        </label>
      </PopoverContent>
    </Popover>
  );
}
