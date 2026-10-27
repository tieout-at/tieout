"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, ChevronsUpDown, CircleDashed, Info, LoaderCircle, Plus, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import { TaskDialog } from "@/components/aufgaben/task-dialog";
import { appendTask, localTime, readTasks } from "@/lib/decisions";
import { CHECK_TEXT, PALETTE } from "@/lib/flow-catalogue";
import { blockSettings, DEADLINE_DAYS, DEADLINE_TEXT, dueDate, taskOf, threshold, THRESHOLD_CHECK, THRESHOLDS, type BlockSettings } from "@/lib/flow-state";
import type { FlowRun, FlowTask, FlowView, RunMoney } from "@/lib/flows";
import { ROLES } from "@/lib/tasks";
import { saveSetting, useFlowSettings } from "@/lib/use-flow-settings";
import { useTasks } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";
import { Chip, Dot, KIND_TEXT, Lines, ResultLine } from "./parts";

const PANEL_FOOT = "Kein Block rechnet einen Betrag oder schreibt dem Auftraggeber.";

function Head({ onBack, onClose, children }: { onBack?: () => void; onClose?: () => void; children: React.ReactNode }) {
  return (
    <div className="border-b border-line px-5 pt-4 pb-3.5">
      {(onBack || onClose) && (
        <div className="-mx-1.5 mb-2 flex items-center justify-between">
          {onBack ? (
            <button type="button" onClick={onBack} aria-label="Zurück zum Ablauf" className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
              <ChevronLeft className="size-4" aria-hidden />
            </button>
          ) : (
            <span />
          )}
          {onClose && (
            <button type="button" onClick={onClose} aria-label="Feld schließen" className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function Section({ title, count, children, last }: { title: string; count?: string; children: React.ReactNode; last?: boolean }) {
  return (
    <section className={cn("px-5 py-3.5", !last && "border-b border-line")}>
      <h3 className="mb-2 flex flex-wrap items-baseline gap-x-1.5 text-[13px] font-semibold">
        {title}
        {count && <span className="font-medium text-fg-muted">{count}</span>}
      </h3>
      {children}
    </section>
  );
}

function Foot() {
  return (
    <p className="flex gap-1.5 px-5 py-3.5 text-xs leading-4 text-fg-muted">
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      {PANEL_FOOT}
    </p>
  );
}

function GoTo({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 text-sm font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
      <ArrowRight className="size-4 text-fg-secondary" aria-hidden />
      {label}
    </Link>
  );
}

/** A native select (the phone's own picker) drawn as our field. */
function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="flex min-h-9 items-center justify-between gap-3">
      <span className="text-fg-secondary">{label}</span>
      <span className="relative flex">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="h-8 min-w-40 cursor-pointer appearance-none rounded-md bg-surface py-1 pr-8 pl-2 text-sm shadow-[inset_0_0_0_1px_#e3e4e8] outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:h-11 max-md:text-base">
          {children}
        </select>
        <ChevronsUpDown className="pointer-events-none absolute top-1/2 right-2 size-4 -translate-y-1/2 text-fg-muted" aria-hidden />
      </span>
    </label>
  );
}

/** What the project's Abgleich found, from the core: the two money words apart, never added, the risk as "davon". */
export function Money({ money, href }: { money: RunMoney; href: string }) {
  return (
    <>
      <dl>
        <div className="flex min-h-7 items-center justify-between gap-3">
          <dt className="flex items-center gap-2 text-fg-secondary">
            <Dot tone="green" />
            zusätzlich verrechenbar
          </dt>
          <dd className="font-mono text-[13px] whitespace-nowrap tabular-nums">{money.extra.text}</dd>
        </div>
        {money.risk && (
          <div className="flex min-h-7 items-center justify-between gap-3 pl-4">
            <dt className="text-fg-secondary">davon mit Kürzungsrisiko</dt>
            <dd className="font-mono text-[13px] whitespace-nowrap tabular-nums">{money.risk.text}</dd>
          </div>
        )}
        {money.unclear && (
          <div className="flex min-h-7 items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-fg-secondary">
              <Dot tone="yellow" />
              in Klärung
            </dt>
            <dd className="font-mono text-[13px] whitespace-nowrap tabular-nums">{money.unclear.text}</dd>
          </div>
        )}
      </dl>
      <GoTo href={href} label="Schlussrechnung öffnen" />
    </>
  );
}

/** Nothing chosen: the Ablauf itself (Attio shows the workflow's description). */
export function AblaufInfo({ view, run, onClose }: { view: FlowView; run: FlowRun | null; onClose?: () => void }) {
  return (
    <>
      <Head onClose={onClose}>
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-fill-hover text-fg-secondary shadow-ring">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <h2 className="font-semibold">{view.title}</h2>
        </div>
        <p className="mt-3 text-fg-secondary">{view.description}</p>
      </Head>
      <Section title="Letzter Lauf" count={run ? run.date : undefined}>
        {run ? (
          <>
            <p className="font-medium">{run.title}</p>
            <p className="text-fg-secondary">{run.summary}</p>
          </>
        ) : (
          <p className="text-fg-secondary">Noch kein Lauf. Der erste Lauf startet, sobald der Auslöser eintritt.</p>
        )}
      </Section>
      {run?.money && (
        <Section title="Was der Lauf gefunden hat">
          <Money money={run.money} href={`/projekte/${run.project.slug}/schlussrechnung/`} />
        </Section>
      )}
      <Foot />
    </>
  );
}

const day = (iso: string) => `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}`;

/** The finds a task block proposes tasks for: each created here with one click, or all at once, as the block is set. */
function TaskList({ targets, settings }: { targets: FlowTask[]; settings: BlockSettings }) {
  const tasks = useTasks();
  const [one, setOne] = useState<FlowTask | null>(null);
  const made = (t: FlowTask) => (tasks ? taskOf(t, tasks) : null);
  // a find set to "Nicht verrechnen" is shown only when a task was made on it, so it can be ticked off
  const shown = targets.filter((t) => !t.excluded || made(t));
  const open = targets.filter((t) => !t.excluded && !made(t));
  const createAll = () => {
    // read the stored tasks again: a double click or another tab must not create a task twice
    const stored = new Set(readTasks().map((x) => x.fundSchluessel));
    const zeit = localTime();
    open.filter((t) => !t.keys.some((k) => stored.has(k))).forEach((t, i) =>
      appendTask({ id: `aufgabe-${Date.now()}-${i}`, fundSchluessel: t.key, fund: t.label, href: t.href, zeit, wer: "Abrechnung", text: t.taskText, zustaendig: settings.zustaendig, bis: dueDate(settings.frist) }),
    );
  };
  return (
    <>
      <ul>
        {shown.map((t) => {
          const m = made(t);
          return (
            <li key={t.key} className="flex items-start gap-2.5 py-2 [&:not(:last-child)]:shadow-line-bottom">
              <Link href={t.href} aria-label={`${t.label.split(" ")[0]} öffnen`} className="mt-0.5 flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
                {t.label.split(" ")[0]}
              </Link>
              <span className="min-w-0 flex-1">
                <span className={cn("block", t.excluded && "text-fg-muted line-through")}>{t.taskText}</span>
                {t.excluded && <span className="block text-xs text-fg-secondary">Fund steht auf „Nicht verrechnen“: Aufgabe auf der Seite „Aufgaben“ abhaken.</span>}
                {m && (
                  <span className="mt-0.5 flex items-center gap-1.5 text-xs text-fg-secondary">
                    <Check className="size-3.5" aria-hidden />
                    angelegt, {m.zustaendig}, {m.bis ? `bis ${day(m.bis)}` : "ohne Frist"}
                  </span>
                )}
              </span>
              {!m && tasks && !t.excluded && (
                <button type="button" onClick={() => setOne(t)} aria-label={`Aufgabe anlegen: ${t.taskText}`} className="inline-flex h-7 shrink-0 items-center rounded-md bg-surface px-2 text-sm font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
                  Anlegen
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {tasks && open.length > 1 && (
        <button type="button" onClick={createAll} className="mt-2.5 inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 text-sm font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
          <Plus className="size-4 text-fg-secondary" aria-hidden />
          Alle {open.length} anlegen
        </button>
      )}
      <p className="mt-2 text-xs leading-4 text-fg-muted">Nur in diesem Browser gespeichert, abhaken unter „Aufgaben“.</p>
      <TaskDialog open={one !== null} onOpenChange={(o) => !o && setOne(null)} targets={one ? [one] : []} defaults={{ zustaendig: settings.zustaendig, bis: dueDate(settings.frist) ?? "" }} />
    </>
  );
}

/** Who gets the tasks of a block and by when; appended in this browser, used for every task made from the block. */
function TaskSettings({ block, settings }: { block: string; settings: BlockSettings }) {
  return (
    <>
      <Select label="Zuständig" value={settings.zustaendig} onChange={(v) => saveSetting(block, "zustaendig", v)}>
        {ROLES.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </Select>
      <Select label="Frist" value={settings.frist} onChange={(v) => saveSetting(block, "frist", v)}>
        {DEADLINE_DAYS.map((d) => (
          <option key={d} value={d}>
            {DEADLINE_TEXT[d]}
          </option>
        ))}
      </Select>
    </>
  );
}

export function BlockDetail({ view, run, id, onBack, onClose }: { view: FlowView; run: FlowRun | null; id: string; onBack?: () => void; onClose?: () => void }) {
  const list = useFlowSettings();
  if (id === "pruefungen" || id.startsWith("pruefung:")) return <CheckDetail run={run} id={id} onBack={onBack} onClose={onClose} />;
  const n = view.nodes.find((x) => x.id === id);
  if (!n) return null;
  const r = run?.results[id];
  const taskBlock = n.id.startsWith("aufgabe-");
  const block = `${view.id}/${n.id}`;
  const settings = blockSettings(list, block);
  return (
    <>
      <Head onBack={onBack} onClose={onClose}>
        <div className="flex items-center gap-2.5">
          <Chip icon={n.icon} className="size-7 rounded-lg" />
          <div className="min-w-0">
            <h2 className="leading-5 font-semibold">{n.title}</h2>
            <p className="text-xs leading-4 text-fg-muted">{KIND_TEXT[n.kind]}</p>
          </div>
        </div>
        <p className="mt-3 text-fg-secondary">{n.text}</p>
      </Head>
      {(n.kind === "schritt" || n.kind === "bedingung") && (
        <Section title="Liest">
          <div className="flex flex-wrap gap-1.5">
            {n.reads.map((x) => (
              <span key={x} className="inline-flex h-6 items-center rounded-sm bg-fill-subtle px-1.5 text-xs font-medium shadow-ring">
                {x}
              </span>
            ))}
          </div>
        </Section>
      )}
      <Section title={run ? "Ergebnis im Lauf" : "Ergebnis"} count={run ? `${run.title}, ${run.on}` : undefined}>
        {r ? (
          <>
            <ResultLine node={n} result={r} state="done" className="font-medium" />
            <Lines lines={r.lines} />
            {r.note && <p className="mt-2 text-xs leading-4 text-fg-muted">{r.note}</p>}
            {r.tasks?.length ? <TaskList targets={r.tasks} settings={settings} /> : r.link && <GoTo {...r.link} />}
          </>
        ) : (
          <p className="text-fg-secondary">Noch kein Lauf.</p>
        )}
      </Section>
      {taskBlock && (
        <Section title="Einstellen">
          <TaskSettings block={block} settings={settings} />
        </Section>
      )}
      <Section title="Wer bestätigt" last>
        <p className="text-fg-secondary">{n.confirms}</p>
      </Section>
    </>
  );
}

function CheckDetail({ run, id, onBack, onClose }: { run: FlowRun | null; id: string; onBack?: () => void; onClose?: () => void }) {
  const list = useFlowSettings();
  const checks = run?.checks ?? [];
  const one = id.startsWith("pruefung:") ? checks.find((c) => `pruefung:${c.id}` === id) : null;
  return (
    <>
      <Head onBack={onBack} onClose={onClose}>
        <div className="flex items-center gap-2.5">
          <span className="flex size-7 items-center justify-center rounded-lg bg-fill-hover text-fg-secondary shadow-ring">
            <ShieldCheck className="size-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="leading-5 font-semibold">{one ? one.title : "Prüfungen"}</h2>
            <p className="text-xs leading-4 text-fg-muted">{one ? "Prüfung der Vorprüfung, aktiv" : `${checks.length} Prüfungen, alle aktiv`}</p>
          </div>
        </div>
        <p className="mt-3 text-fg-secondary">{one ? CHECK_TEXT[one.id] : "Jede Regel des Prüfkatalogs ist ein Block. Neue Regeln kommen von Fachleuten aus dem Bau."}</p>
      </Head>
      <Section title="Treffer im Lauf" count={run ? `${run.title}, ${run.on}` : undefined} last={one?.id !== THRESHOLD_CHECK}>
        <dl>
          {(one ? [one] : checks).map((c) => (
            <div key={c.id} className="flex min-h-7 items-center justify-between gap-3 py-0.5">
              <dt className="min-w-0 text-fg-secondary">{one ? "Treffer" : c.title}</dt>
              <dd className="flex shrink-0 items-center gap-1.5 text-[13px]">
                {c.threat > 0 && <Dot tone="red" />}
                {c.hits === 0 ? <span className="text-fg-muted">kein Treffer</span> : <span className="font-mono tabular-nums">{c.hits}</span>}
              </dd>
            </div>
          ))}
          {one && one.threat > 0 && (
            <div className="flex min-h-7 items-center justify-between gap-3 py-0.5">
              <dt className="flex items-center gap-2 text-fg-secondary">
                <Dot tone="red" />
                Kürzungsrisiko droht
              </dt>
              <dd className="font-mono text-[13px] tabular-nums">{one.threat}</dd>
            </div>
          )}
        </dl>
        {one?.below?.length ? (
          <p className="mt-1 text-xs leading-4 text-fg-muted">
            Unter dem Schwellwert:{" "}
            {one.below.map((b, i) => (
              <span key={i}>
                {i > 0 && ", "}
                <Link href={b.href} className="link-quiet">
                  {b.label.replace(" öffnen", "")}
                </Link>
                {b.change !== null && ` (+${(b.change / 100).toLocaleString("de-AT", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %)`}
              </span>
            ))}
          </p>
        ) : null}
        {one ? (
          <div className="flex flex-wrap gap-2">
            {one.links.map((l, i) => (
              <GoTo key={i} {...l} />
            ))}
          </div>
        ) : (
          run && <GoTo href={`/projekte/${run.project.slug}/schlussrechnung/`} label="Vorprüfung öffnen" />
        )}
      </Section>
      {one?.id === THRESHOLD_CHECK && (
        <Section title="Einstellen" last>
          <Select label="Melden über" value={String(threshold(list))} onChange={(v) => saveSetting(THRESHOLD_CHECK, "schwelle", v)}>
            {THRESHOLDS.map((t) => (
              <option key={t} value={t}>
                {t} %
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs leading-4 text-fg-muted">Höher heißt weniger Treffer. Kein Betrag ändert sich.</p>
        </Section>
      )}
    </>
  );
}

/** Attio's run history: every run of this Ablauf, the latest first; the chosen one lights the blocks it reached. */
export function RunList({ view, runId, playing, onPick, onClose }: { view: FlowView; runId: string | null; playing: boolean; onPick: (id: string) => void; onClose?: () => void }) {
  return (
    <>
      <Head onClose={onClose}>
        <h2 className="font-semibold">Läufe</h2>
        <p className="mt-1 text-fg-secondary">{view.runs.length ? `${view.runs.length === 1 ? "1 Lauf" : `${view.runs.length} Läufe`}, der letzte zuerst` : "Noch kein Lauf"}</p>
      </Head>
      {view.runs.length ? (
        <ul className="flex flex-col gap-0.5 p-2">
          {view.runs.map((r) => {
            const on = r.id === runId;
            return (
              <li key={r.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onPick(r.id)}
                  className={cn("flex w-full items-start gap-2.5 rounded-[10px] px-3 py-2.5 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11", on && "bg-fill-selected shadow-ring")}
                >
                  <span className={cn("mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full", on && playing ? "text-accent shadow-[inset_0_0_0_1.5px_var(--color-accent)]" : "bg-fill-hover text-fg")}>
                    {on && playing ? <LoaderCircle className="size-3 animate-spin motion-reduce:animate-none" aria-hidden /> : <Check className="size-3" strokeWidth={2.5} aria-hidden />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate font-medium">{r.title}</span>
                      <span className="shrink-0 text-xs text-fg-muted tabular-nums">{on && playing ? "spielt" : r.date}</span>
                    </span>
                    <span className="block text-xs leading-4 text-fg-secondary">{r.on}: {r.summary}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="px-5 py-4 text-fg-secondary">Der erste Lauf startet, sobald der Auslöser eintritt.</p>
      )}
      <p className="flex gap-1.5 px-5 pt-1 pb-4 text-xs leading-4 text-fg-muted">
        <CircleDashed className="mt-px size-3.5 shrink-0" aria-hidden />
        Ein neuer Lauf startet, sobald neue Belege kommen.
      </p>
    </>
  );
}

/** "Bausteine": the block palette is the check catalogue (SPEZIFIKATION.md 5.2); blocks used here are marked. */
export function Palette({ view, onBack, onClose }: { view: FlowView; onBack?: () => void; onClose?: () => void }) {
  const used = new Set([...view.nodes.map((n) => n.title), ...(view.checksAt ? PALETTE[2].items : [])]);
  return (
    <>
      <Head onBack={onBack} onClose={onClose}>
        <h2 className="font-semibold">Bausteine</h2>
        <p className="mt-1 text-fg-secondary">Jede Regel, die Fachleute aus dem Bau dazugeben, wird hier ein Baustein. Die Abläufe sind fest, damit Vorprüfung und Freigabe nie fehlen; eingestellt wird im jeweiligen Block.</p>
      </Head>
      <div className="px-3 py-2">
        {PALETTE.map((g) => (
          <section key={g.title} className="py-1.5">
            <h3 className="px-2 pb-1 text-xs text-fg-secondary">{g.title}</h3>
            <ul className="flex flex-col gap-1">
              {g.items.map((t) => (
                <li key={t} className="flex h-10 items-center gap-2.5 rounded-[10px] px-2.5 shadow-button">
                  <span className="min-w-0 flex-1 truncate">{t}</span>
                  {used.has(t) && (
                    <span className="flex shrink-0 items-center gap-1 text-xs text-fg-muted">
                      <Check className="size-3.5" aria-hidden />
                      <span className="max-md:sr-only">hier</span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
