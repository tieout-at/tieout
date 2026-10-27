"use client";

import Link from "next/link";
import { ArrowRight, Check, ChevronLeft, CircleDashed, Info, LoaderCircle, ShieldCheck, X } from "lucide-react";

import { CHECK_TEXT, PALETTE } from "@/lib/flow-catalogue";
import type { FlowRun, FlowView } from "@/lib/flows";
import { cn } from "@/lib/utils";
import { Chip, Dot, KIND_TEXT, Lines, ResultLine } from "./parts";

const PANEL_FOOT = "Ein Block rechnet keinen Betrag und schickt nichts an den Auftraggeber. Beträge kommen aus dem Rechenkern.";

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
      <h3 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold">
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
            <p className="mt-2 text-xs leading-4 text-fg-muted">Ein Klick auf einen Block zeigt, was er gelesen und gefunden hat.</p>
          </>
        ) : (
          <p className="text-fg-secondary">Noch kein Lauf. Der erste Lauf startet, sobald der Auslöser eintritt.</p>
        )}
      </Section>
      <Section title="Ein und aus" last>
        <p className="text-fg-secondary">Dieser Ablauf ist eingeschaltet. Abläufe und Prüfungen selbst ein- und ausschalten kommt mit der Anmeldung.</p>
      </Section>
      <Foot />
    </>
  );
}

export function BlockDetail({ view, run, id, onBack, onClose }: { view: FlowView; run: FlowRun | null; id: string; onBack?: () => void; onClose?: () => void }) {
  if (id === "pruefungen" || id.startsWith("pruefung:")) return <CheckDetail run={run} id={id} onBack={onBack} onClose={onClose} />;
  const n = view.nodes.find((x) => x.id === id);
  if (!n) return null;
  const r = run?.results[id];
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
      <Section title="Liest">
        <div className="flex flex-wrap gap-1.5">
          {n.reads.map((x) => (
            <span key={x} className="inline-flex h-6 items-center rounded-sm bg-fill-subtle px-1.5 text-xs font-medium shadow-ring">
              {x}
            </span>
          ))}
        </div>
      </Section>
      <Section title={run ? "Ergebnis im Lauf" : "Ergebnis"} count={run ? `${run.title}, ${run.on}` : undefined}>
        {r ? (
          <>
            <ResultLine node={n} result={r} state="done" className="font-medium" />
            <Lines lines={r.lines} />
            {r.link && <GoTo {...r.link} />}
          </>
        ) : (
          <p className="text-fg-secondary">Noch kein Lauf.</p>
        )}
      </Section>
      <Section title="Wer bestätigt" last>
        <p className="text-fg-secondary">{n.confirms}</p>
      </Section>
      <Foot />
    </>
  );
}

function CheckDetail({ run, id, onBack, onClose }: { run: FlowRun | null; id: string; onBack?: () => void; onClose?: () => void }) {
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
            <p className="text-xs leading-4 text-fg-muted">{one ? "Prüfung der Vorprüfung" : `${checks.length} Prüfungen, alle eingeschaltet`}</p>
          </div>
        </div>
        <p className="mt-3 text-fg-secondary">{one ? CHECK_TEXT[one.id] : "Jede Regel des Prüfkatalogs ist ein Block. Neue Regeln kommen von Fachleuten aus dem Bau."}</p>
      </Head>
      <Section title="Treffer im Lauf" count={run ? `${run.title}, ${run.on}` : undefined}>
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
        {run && <GoTo href={`/projekte/${run.project.slug}/schlussrechnung/`} label="Vorprüfung öffnen" />}
      </Section>
      <Section title="Ein und aus" last>
        <div className="flex items-center gap-2.5">
          <span aria-hidden className="relative h-4 w-7 shrink-0 rounded-full bg-fg opacity-50 after:absolute after:top-0.5 after:right-0.5 after:size-3 after:rounded-full after:bg-surface" />
          <span className="text-fg-secondary">Eingeschaltet. Selbst ausschalten kommt mit der Anmeldung.</span>
        </div>
      </Section>
      <Foot />
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
        Gezeigt wird je Projekt der Lauf zum heutigen Stand der Daten.
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
        <p className="mt-1 text-fg-secondary">Jede Regel, die Fachleute aus dem Bau dazugeben, wird hier ein Baustein. Eigene Abläufe zusammenstellen kommt mit der Anmeldung.</p>
      </Head>
      <div className="px-3 py-2">
        {PALETTE.map((g) => (
          <section key={g.title} className="py-1.5">
            <h3 className="px-2 pb-1 text-xs text-fg-secondary">{g.title}</h3>
            <ul className="flex flex-col gap-1">
              {g.items.map((t) => (
                <li key={t} className="flex h-10 items-center gap-2.5 rounded-[10px] px-2.5 shadow-button">
                  <span className="min-w-0 flex-1 truncate">{t}</span>
                  {used.has(t) && <span className="shrink-0 text-xs text-fg-muted">in diesem Ablauf</span>}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
