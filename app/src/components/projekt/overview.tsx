"use client";

import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";

import { KpiRow, type KpiItem } from "@/components/charts/kpi";
import { keep, TONE_VAR } from "@/components/charts/tones";
import { Activity } from "@/components/record/activity";
import { AttributeList } from "@/components/record/attribute-list";
import { InfoTip } from "@/components/ui/info-tip";
import { SideWindow } from "@/components/ui/side-window";
import { currentState, onStorageChange, readDecisions, type Decision, type DecisionState } from "@/lib/decisions";
import type { StartProject } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { Mark, OverviewFind, ProjectOverview } from "@/lib/project-view";
import { cn } from "@/lib/utils";
import { Building, toneOf } from "./building";

/** The decisions of this browser over the core's states, as the tab "Schlussrechnung" counts them. */
function useStates(finds: OverviewFind[]): Map<string, DecisionState> {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  useEffect(() => {
    const load = () => setDecisions(readDecisions());
    load();
    return onStorageChange(load);
  }, []);
  return new Map(finds.map((f) => [f.id, currentState(decisions, [f.id, ...f.earlierIds], f.decisionState)]));
}

/** Auftragssumme, Leistung and Vertrag in one quiet line; every Angabe one click away in a window. */
function FactsLine({ v }: { v: ProjectOverview }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-fg-secondary">
      {v.facts.map((f) => (
        <span key={f.label} className="flex min-w-0 items-center gap-1.5">
          <span className="text-fg-muted">{f.label}</span>
          <span className="text-fg tabular-nums">{f.value}</span>
        </span>
      ))}
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="link-quiet ml-auto flex min-h-6 items-center gap-0.5 outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:ml-0 max-md:min-h-11">
        Alle Angaben
        <ChevronRight aria-hidden className="size-3.5" />
      </button>
      <SideWindow open={open} onClose={() => setOpen(false)} title="Angaben" width={420}>
        <header className="flex h-12 shrink-0 items-center justify-between gap-2 pr-2.5 pl-4 shadow-line-bottom">
          <h2 className="text-sm font-medium">Angaben</h2>
          <button type="button" aria-label="Angaben schließen" onClick={() => setOpen(false)} className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11">
            <X aria-hidden className="size-4" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AttributeList title="Angaben" attributes={v.attributes} />
          <Link href={`/projekte/${v.slug}/vertrag/`} className="link-quiet mx-4 mb-4 flex w-fit items-center gap-0.5 text-xs text-fg-secondary">
            Vertrag Punkt für Punkt
            <ChevronRight aria-hidden className="size-3.5" />
          </Link>
        </div>
      </SideWindow>
    </div>
  );
}

/** "0 von 8 entschieden": the decisions of this browser over the core's, said once in the head of the building or the strip. */
function decidedText(finds: OverviewFind[], states: Map<string, DecisionState>): string {
  const done = finds.filter((f) => states.get(f.id) !== "gefunden").length;
  return `${done} von ${finds.length} entschieden`;
}

/**
 * The figures of an open project: zusätzlich verrechenbar with the part that has a Kürzungsrisiko (no ring: it would
 * only repeat that line), in Klärung with its two parts, never added, and, where the core has the own Entwurf, the Restforderung
 * with "laut Vertrag", explained step by step on the tab Schlussrechnung. The money follows a decision in this browser.
 */
function OpenFigures({ v, built }: { v: ProjectOverview; built: StartProject }) {
  const live = useLive();
  const p = live?.startView().projects.find((x) => x.id === v.id) ?? built;
  const invoice = live?.invoiceView(v.id) ?? null;
  const rest = invoice ? { announced: invoice.settlement.restforderung, contract: invoice.settlement.contract.restforderung } : v.rest;
  const findsHref = `/projekte/${v.slug}/funde/`;
  const items: KpiItem[] = [
    {
      id: "extra",
      label: "zusätzlich verrechenbar",
      value: p.extra.text,
      lead: true,
      href: findsHref,
      lines: p.risk.cent ? [{ text: `davon mit Kürzungsrisiko ${p.risk.text}`, tone: "risk" }] : [{ text: "ohne Kürzungsrisiko" }],
    },
    {
      id: "unclear",
      label: "in Klärung, nicht addiert",
      value: p.unclear.cent ? p.unclear.text : "nichts",
      lead: true,
      href: p.unclear.cent ? findsHref : undefined,
      lines: [
        ...(p.gap.cent ? [{ text: `Beleg fehlt ${p.gap.text}`, tone: "gap" as const }] : []),
        ...(p.change.cent ? [{ text: `Nachtrag nicht gelegt ${p.change.text}`, tone: "change" as const }] : []),
        ...(p.unclear.cent ? [] : [{ text: "kein Fund wartet auf Beleg oder Nachtrag" }]),
      ],
    },
    ...(rest
      ? [
          {
            id: "rest",
            label: "Restforderung",
            value: rest.announced.text,
            lead: true,
            href: `/projekte/${v.slug}/schlussrechnung/#rechnungsabschluss`,
            info: "So rechnet der Auftraggeber Ihre Schlussrechnung voraussichtlich ab: Entwurf mit den Funden, abzüglich Nachlass, angekündigter Abzüge, Haftrücklass und der schon bezahlten Abschlagsrechnungen. Laut Vertrag ohne die Abzüge, für die der Vertrag keinen Punkt nennt. Schritt für Schritt auf dem Reiter Schlussrechnung.",
            lines: [{ text: `laut Vertrag ${rest.contract.text}` }, { text: "Schritt für Schritt in der Schlussrechnung" }],
          } satisfies KpiItem,
        ]
      : []),
  ];
  return <KpiRow items={items} />;
}

/** A closed project: what the Auftraggeber cut, by reason as plain lines (done, not a risk), the Schlusszahlung, the Haftrücklass. */
function ClosedFigures({ v }: { v: ProjectOverview }) {
  const c = v.closing!;
  return (
    <KpiRow
      items={[
        {
          id: "gekuerzt",
          label: "Gekürzt",
          value: c.cut.text,
          lead: true,
          lines: [...c.reasons.map((r) => ({ text: `${r.label} ${r.amount.text}` })), ...c.deductions.map((d) => ({ text: `dazu abgezogen: ${d.label} ${d.amount.text}` }))],
        },
        { id: "schlusszahlung", label: "Schlusszahlung", value: c.final.text, lead: true, lines: [{ text: `nach ${c.days} Tagen, von der Schlussrechnung ${c.invoice.text}` }] },
        { id: "einbehalten", label: "Haftrücklass einbehalten", value: c.kept.text, lead: true, lines: [{ text: "laut Zahlungsavis" }] },
      ]}
    />
  );
}

/** Projects whose finds name fewer than two places: the finds as one calm strip, colour by Belegstand. */
function FindStrip({ finds, decided }: { finds: OverviewFind[]; decided: string }) {
  if (!finds.length) return null;
  return (
    <section aria-labelledby="funde-streifen" className="flex flex-col gap-2">
      <h2 id="funde-streifen" className="flex items-center justify-between gap-3 text-fg-secondary">
        Funde
        <span className="text-xs text-fg-muted tabular-nums">{decided}</span>
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {finds.map((f) => (
          <li key={f.id}>
            <Link href={f.href} className="flex h-full min-h-24 flex-col justify-between gap-2 rounded-xl bg-surface p-3 shadow-ring outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent">
              <span className="flex items-center gap-2">
                <span className="flex h-5 min-w-7 items-center justify-center rounded-[5px] bg-fill-hover px-1 font-mono text-[11px] text-count shadow-ring">{f.number}</span>
                <span aria-hidden className="size-2 rounded-full" style={{ background: TONE_VAR[toneOf(f)] }} />
                <span className="text-xs text-fg-muted">{f.belegstand?.text ?? "belegt"}</span>
              </span>
              <span className="line-clamp-2 text-sm">{f.name}</span>
              <span className="text-sm font-medium tabular-nums">{keep(f.amount.text)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const day = (iso: string) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
const MONTHS = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
const LEVEL = 24;

/** Finds on nearby days stand on levels, so their chips never cover each other (pure, so the page stays calm). */
function levelsOf(finds: OverviewFind[], at: (iso: string) => number): Map<string, number> {
  const sorted = [...finds].sort((a, b) => a.workDate.iso.localeCompare(b.workDate.iso));
  return sorted.reduce(
    (acc, f) => {
      const x = at(f.workDate.iso);
      const free = acc.last.findIndex((p) => x - p > 46);
      const level = free < 0 ? acc.last.length : free;
      return { map: new Map(acc.map).set(f.number, level), last: Object.assign([...acc.last], { [level]: x }) };
    },
    { map: new Map<string, number>(), last: [] as number[] },
  ).map;
}

/** Runs of three or more finds within 46 px become one bundle; the others stay single (pure). */
function bundlesOf(finds: OverviewFind[], at: (iso: string) => number): OverviewFind[][] {
  const sorted = [...finds].sort((a, b) => a.workDate.iso.localeCompare(b.workDate.iso));
  return sorted.reduce<OverviewFind[][]>((runs, f) => {
    const last = runs.at(-1);
    if (last && at(f.workDate.iso) - at(last.at(-1)!.workDate.iso) <= 46) return [...runs.slice(0, -1), [...last, f]];
    return [...runs, [f]];
  }, []);
}

/**
 * The Bauzeit as one strip: the Abschlagsrechnungen, the Entwurf, the deadline, the Schlusszahlung, the day of the
 * comparison ("Stand"), and each find on the day its work was done. Every mark names its date on hover and on focus.
 */
function BuildStrip({ v }: { v: ProjectOverview }) {
  const t = v.time;
  const [label, setLabel] = useState<string | null>(null);
  const [w, setW] = useState(640);
  const [hot, setHot] = useState<string | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  if (!t.start) return null;
  const from = day(`${t.start.iso.slice(0, 7)}-01`);
  const lastIso = [t.deadline?.iso, t.paid?.iso, t.end?.iso, t.asOf.iso].filter((x): x is string => !!x).sort().at(-1)!;
  const to = day(lastIso) + 20;
  const x = (iso: string) => Math.min(100, Math.max(0, ((day(iso) - from) / (to - from)) * 100));
  const at = (iso: string) => (x(iso) / 100) * w;
  const runs = bundlesOf(v.finds, at);
  const bundled = runs.filter((r) => r.length >= 3);
  const single = runs.filter((r) => r.length < 3).flat();
  const levels = levelsOf(single, at);
  const maxLevel = Math.max(0, ...levels.values());
  const months = Array.from({ length: Math.ceil((to - from) / 30.44) + 1 }, (_, i) => {
    const d = new Date(Date.UTC(+t.start!.iso.slice(0, 4), +t.start!.iso.slice(5, 7) - 1 + i, 1));
    return d.toISOString().slice(0, 10);
  }).filter((iso) => day(iso) < to);
  const showMonth = (i: number) => months.length <= 12 || i % 2 === 0;
  const marks: { m: Mark; kind: "invoice" | "draft" | "deadline" | "paid" | "submitted" }[] = [
    ...t.invoices.map((m) => ({ m, kind: "invoice" as const })),
    ...(t.draft ? [{ m: t.draft, kind: "draft" as const }] : []),
    ...(t.submitted ? [{ m: t.submitted, kind: "submitted" as const }] : []),
    ...(t.deadline ? [{ m: t.deadline, kind: "deadline" as const }] : []),
    ...(t.paid ? [{ m: t.paid, kind: "paid" as const }] : []),
  ];
  const endIso = t.end?.iso ?? t.asOf.iso;
  return (
    <section aria-labelledby="bauzeit" className="flex flex-col gap-2 rounded-xl bg-surface p-4 shadow-ring">
      <header className="flex items-center justify-between gap-3">
        <h2 id="bauzeit" className="flex items-center gap-1.5 text-fg-secondary">
          Bauzeit
          <InfoTip label="Bauzeit">Jeder Fund steht am Datum seines Belegs, an dem Tag, an dem die Arbeit gemacht wurde. Zeigen Sie auf eine Marke oder wählen Sie sie mit der Tastatur, dann steht ihr Datum oben rechts.</InfoTip>
        </h2>
        <span className="min-h-4 truncate text-xs text-fg-secondary tabular-nums">{label ?? (t.end ? `${t.start.text} bis ${t.end.text}` : `${t.start.label} ${t.start.text}`)}</span>
      </header>
      <div
        ref={(el) => {
          if (el && Math.abs(el.clientWidth - w) > 2) setW(el.clientWidth);
        }}
        className="relative mt-2"
        style={{ height: 70 + LEVEL * maxLevel }}
        onPointerLeave={() => {
          setLabel(null);
          setHot(null);
        }}
      >
        {months.map((iso, i) => (
          <span key={iso} className="absolute top-0 bottom-5 border-l border-line" style={{ left: `${x(iso)}%` }}>
            {showMonth(i) && <span className="absolute bottom-[-18px] left-1 text-[11px] whitespace-nowrap text-fg-muted">{iso.slice(5, 7) === "01" ? iso.slice(0, 4) : MONTHS[+iso.slice(5, 7) - 1]}</span>}
          </span>
        ))}
        <span className="absolute bottom-[30px] h-2 rounded-full bg-track" style={{ left: `${x(t.start.iso)}%`, width: `${x(endIso) - x(t.start.iso)}%` }} />
        <span className="absolute bottom-[30px] h-2 rounded-l-full bg-bar" style={{ left: `${x(t.start.iso)}%`, width: `${Math.min(x(endIso), x(t.asOf.iso)) - x(t.start.iso)}%` }} />
        {marks.map((k) => (
          <button
            key={`${k.kind}-${k.m.iso}`}
            type="button"
            aria-label={`${k.m.label} ${k.m.text}`}
            onPointerEnter={() => setLabel(`${k.m.label} ${k.m.text}`)}
            onFocus={() => setLabel(`${k.m.label} ${k.m.text}`)}
            onBlur={() => setLabel(null)}
            className="absolute bottom-[34px] flex size-6 -translate-x-1/2 translate-y-1/2 items-center justify-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-accent"
            style={{ left: `${x(k.m.iso)}%` }}
          >
            <MarkShape kind={k.kind} />
          </button>
        ))}
        {/* the day of the comparison: a thin grey line with a small grey label, never the darkest mark of the page */}
        <span className="absolute top-0 bottom-5 border-l border-dashed border-fg-faint" style={{ left: `${x(t.asOf.iso)}%` }}>
          {w >= 520 && <span className={cn("absolute -top-1 bg-surface px-1 text-[10px] leading-4 whitespace-nowrap text-fg-muted tabular-nums", x(t.asOf.iso) > 92 ? "right-1" : "left-1")}>Stand {t.asOf.text.slice(0, 6)}</span>}
        </span>
        {bundled.map((run) => {
          const id = run.map((f) => f.number).join("-");
          const mid = run[Math.floor(run.length / 2)].workDate.iso;
          const open = opened === id;
          return (
            <span key={id} className="absolute flex -translate-x-1/2 flex-col items-center" style={{ left: `${x(mid)}%`, top: LEVEL * maxLevel }} onPointerEnter={() => setOpened(id)} onPointerLeave={() => setOpened(null)}>
              <button
                type="button"
                aria-expanded={open}
                aria-label={`${run.length} Funde: ${run.map((f) => f.number).join(", ")}`}
                onClick={() => setOpened(open ? null : id)}
                onFocus={() => setOpened(id)}
                className="relative flex h-5 items-center gap-1 rounded-[5px] bg-surface px-1.5 text-[11px] whitespace-nowrap text-fg shadow-ring outline-none focus-visible:outline-2 focus-visible:outline-accent max-md:before:absolute max-md:before:-inset-3"
              >
                <span aria-hidden className="flex -space-x-0.5">
                  {run.map((f) => (
                    <span key={f.id} className="size-1.5 rounded-full ring-1 ring-surface" style={{ background: TONE_VAR[toneOf(f)] }} />
                  ))}
                </span>
                {run.length} Funde
              </button>
              <span className="h-2.5 w-px bg-fg-faint" />
              {open && (
                <ul className="absolute bottom-full z-30 mb-1 flex w-max min-w-44 flex-col rounded-lg bg-surface p-1 text-xs shadow-popup">
                  {run.map((f) => (
                    <li key={f.id}>
                      <Link href={f.href} className="flex min-h-8 items-center gap-2 rounded-md px-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
                        <span aria-hidden className="size-1.5 rounded-full" style={{ background: TONE_VAR[toneOf(f)] }} />
                        <span className="font-mono">{f.number}</span>
                        <span className="text-fg-muted tabular-nums">{f.workDate.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </span>
          );
        })}
        {single.map((f) => {
          const lvl = levels.get(f.number) ?? 0;
          const tone = toneOf(f);
          return (
            <Link
              key={f.id}
              href={f.href}
              aria-label={`${f.number} ${f.name}, Arbeit am ${f.workDate.text}`}
              onPointerEnter={() => {
                setHot(f.number);
                setLabel(`${f.number}, Arbeit am ${f.workDate.text}`);
              }}
              onFocus={() => {
                setHot(f.number);
                setLabel(`${f.number}, Arbeit am ${f.workDate.text}`);
              }}
              onBlur={() => setHot(null)}
              className={cn("absolute flex -translate-x-1/2 flex-col items-center outline-none transition-opacity focus-visible:outline-2 focus-visible:outline-accent", hot && hot !== f.number && "opacity-30")}
              style={{ left: `${x(f.workDate.iso)}%`, top: LEVEL * (maxLevel - lvl) }}
            >
              <span className="flex h-5 min-w-7 items-center justify-center gap-1 rounded-[5px] bg-surface px-1 font-mono text-[11px] text-fg shadow-ring">
                <span aria-hidden className="size-1.5 rounded-full" style={{ background: TONE_VAR[tone] }} />
                {f.number}
              </span>
              <span className="w-px bg-fg-faint" style={{ height: 10 + LEVEL * lvl }} />
            </Link>
          );
        })}
      </div>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-fg-muted">
        {marks.some((k) => k.kind === "invoice") && <LegendItem kind="invoice" text="Abschlagsrechnung" />}
        {t.draft && <LegendItem kind="draft" text="Entwurf" />}
        {t.submitted && <LegendItem kind="submitted" text="Schlussrechnung gelegt" />}
        {t.deadline && <LegendItem kind="deadline" text="Schlussrechnung legen bis" />}
        {t.paid && <LegendItem kind="paid" text="Schlusszahlung" />}
        <li className="flex items-center gap-1.5 tabular-nums">
          <span aria-hidden className="h-3.5 border-l border-dashed border-fg-faint" />
          Stand {t.asOf.text}
        </li>
        {v.finds.length > 0 && (
          <li className="flex items-center gap-1.5">
            <span className="flex h-4 items-center rounded-[4px] bg-surface px-1 font-mono text-[10px] text-fg shadow-ring">F</span>
            Fund am Datum seines Belegs
          </li>
        )}
      </ul>
    </section>
  );
}

function MarkShape({ kind }: { kind: "invoice" | "draft" | "deadline" | "paid" | "submitted" }) {
  if (kind === "invoice") return <span className="h-5 w-0.5 rounded-full bg-fg/60" />;
  if (kind === "draft") return <span className="size-2.5 rounded-full bg-surface ring-2 ring-fg/60" />;
  if (kind === "submitted") return <span className="size-2.5 rounded-[2px] bg-fg/60" />;
  if (kind === "paid") return <span className="size-2.5 rounded-full bg-data-money ring-2 ring-surface" />;
  return <span className="size-3 rotate-45 rounded-[2px] bg-fg/70 ring-2 ring-surface" />;
}

function LegendItem({ kind, text }: { kind: "invoice" | "draft" | "deadline" | "paid" | "submitted"; text: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span className="flex size-4 items-center justify-center [&>span]:scale-75">
        <MarkShape kind={kind} />
      </span>
      {text}
    </li>
  );
}

/**
 * "Überblick" of a project (step 8d): the facts in one line, the figures with rings, the building with the place of
 * every find (or the finds as a strip where they name fewer than two places), then the Bauzeit and the Verlauf side by side.
 */
export function ProjectOverviewView({ v, start }: { v: ProjectOverview; start: StartProject | null }) {
  const states = useStates(v.finds);
  const decided = decidedText(v.finds, states);
  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-5 px-6 py-5 max-md:gap-4 max-md:px-4 max-md:py-4">
      <FactsLine v={v} />
      {v.closing ? <ClosedFigures v={v} /> : start ? <OpenFigures v={v} built={start} /> : null}
      {v.building ? <Building model={v.building} finds={v.finds} decided={decided} /> : <FindStrip finds={v.finds} decided={decided} />}
      {v.activity.length ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <BuildStrip v={v} />
          <div className="min-w-0">
            <Activity entries={v.activity} first={4} />
          </div>
        </div>
      ) : (
        <BuildStrip v={v} />
      )}
    </div>
  );
}
