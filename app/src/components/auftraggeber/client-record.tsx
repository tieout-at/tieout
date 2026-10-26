"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";

import { KpiRow, type KpiItem } from "@/components/charts/kpi";
import { keep } from "@/components/charts/tones";
import { InfoTip } from "@/components/ui/info-tip";
import { SideWindow, toggleOpen } from "@/components/ui/side-window";
import { useMediaQuery, useReducedMotion } from "@/components/ui/use-media";
import type { ClientView, ReasonMark } from "@/lib/client-view";
import type { ProjectRow } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { Highlight } from "@/lib/records";
import { cn } from "@/lib/utils";

/**
 * The three figures of an Auftraggeber (step 8d, after the councils: no ring that only repeats a number): Kürzungen and
 * Abzug ohne Vertragspunkt as their amount with the single cuts or projects listed under it, Nachträge beauftragt as
 * "2 von 3" with the amounts.
 */
export function ClientFigures({ highlights, v }: { highlights: Highlight[]; v: ClientView }) {
  const h = (id: string) => highlights.find((x) => x.id === id)!;
  const { cuts, deductionsByProject: ded } = v.parts;
  const items: KpiItem[] = [
    {
      id: "kuerzungen",
      label: "Kürzungen",
      value: cuts.length ? h("kuerzungen").value : "keine",
      info: "Positionen, die der Auftraggeber auf Korrekturblättern und Schlussrechnungen gestrichen hat, aus allen Projekten.",
      lines: cuts.length ? cuts.slice(0, 3).map((c) => ({ text: `${c.label}, ${c.amount.text}` })) : [{ text: "keine Kürzung" }],
    },
    {
      id: "abzuege",
      label: "Abzug ohne Vertragspunkt",
      value: ded.length ? h("abzuege").value : "keiner",
      info: "Sätze auf Zahlungsavisos und Schlussrechnungen, die der Vertrag des Projekts nicht nennt.",
      lines: ded.length ? ded.map((d) => ({ text: `${d.project}, ${d.amount.text}` })) : [{ text: "kein Abzug ohne Vertragspunkt" }],
    },
    {
      id: "nachtraege",
      label: "Nachträge beauftragt",
      value: h("nachtraege").value,
      lines: h("nachtraege").lines.map((text) => ({ text })),
    },
  ];
  return <KpiRow items={items} />;
}

/** "Gleicher Grund": earlier project, a hairline with the reason, the running project; pointing sends a light along it. */
export function SameReason({ v, name }: { v: ClientView; name: string }) {
  const [hot, setHot] = useState<string | null>(null);
  const still = useReducedMotion();
  if (!v.chains.length) return null;
  return (
    <section aria-labelledby="gleicher-grund" className="flex flex-col rounded-xl bg-surface shadow-ring">
      <header className="flex items-center gap-1.5 px-5 pt-4 pb-1">
        <h2 id="gleicher-grund" className="text-fg-secondary">
          Gleicher Grund wie in einem früheren Projekt
        </h2>
        <InfoTip label="Gleicher Grund">
          Was {name} in einem früheren Projekt gekürzt oder abgezogen hat und im laufenden Projekt wieder ansteht, abgeglichen über den festen Grund, nicht über den Text. Die Abhilfe steht beim Fund.
        </InfoTip>
      </header>
      <ul className="flex flex-col gap-2 p-3" onPointerLeave={() => setHot(null)}>
        {v.chains.map((c) => (
          <li key={c.key} onPointerEnter={() => setHot(c.key)} className={cn("flex flex-col gap-2 rounded-lg px-3 py-3 shadow-ring transition-colors", hot === c.key && "bg-fill-subtle")}>
            <span className="flex items-center gap-1.5 font-medium">
              {c.now.kind === "droht" && <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-data-risk" />}
              {c.reason}
            </span>
            <span className="grid grid-cols-[minmax(0,1fr)_minmax(48px,0.6fr)_minmax(0,1fr)] items-center gap-3 max-md:grid-cols-1 max-md:gap-1">
              <span className="flex min-w-0 flex-col">
                <Link href={c.before.href} className="link-quiet w-fit" onFocus={() => setHot(c.key)}>
                  {c.before.name}
                </Link>
                <span className="text-xs text-fg-secondary tabular-nums">
                  {c.before.kind === "gekuerzt" ? "gekürzt" : "abgezogen"} <span className="text-fg">{keep(c.before.amount.text)}</span>
                </span>
              </span>
              <span className="relative h-6 max-md:hidden">
                <svg aria-hidden className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 24">
                  <path d="M0 12 H100" stroke="var(--color-fg-faint)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
                  {hot === c.key && !still && (
                    <path d="M0 12 H100" stroke="var(--color-sweep)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" pathLength={100} strokeDasharray="18 100" className="animate-[gleich-sweep_1.4s_ease-in-out_infinite]" />
                  )}
                </svg>
              </span>
              <span className="flex min-w-0 flex-col md:items-end md:text-right">
                <Link href={c.now.href} className="link-quiet w-fit" onFocus={() => setHot(c.key)}>
                  {c.now.name}
                </Link>
                <span className="text-xs text-fg-secondary tabular-nums">
                  {c.now.kind === "droht" ? (
                    <>
                      droht laut Vorprüfung <span className="text-state-red-edge">{keep(c.now.amount.text)}</span>
                    </>
                  ) : (
                    <>
                      angekündigt <span className="text-fg">{keep(c.now.amount.text)}</span>
                      {c.now.withheld && <>, davon schon einbehalten {keep(c.now.withheld.text)}</>}
                    </>
                  )}
                </span>
              </span>
            </span>
          </li>
        ))}
      </ul>
      <style>{`@keyframes gleich-sweep { from { stroke-dashoffset: 118; } to { stroke-dashoffset: 0; } }`}</style>
    </section>
  );
}

const MARK_TEXT: Record<ReasonMark["kind"], string> = { gekuerzt: "gekürzt", abgezogen: "abgezogen", angekuendigt: "angekündigt", droht: "droht laut unserer Vorprüfung" };

/** One mark per cell; a cell that was deducted and is announced again shows the filled dot inside the dashed ring. */
function Mark({ ms }: { ms: ReasonMark[] }) {
  const past = ms.find((m) => m.kind === "gekuerzt" || m.kind === "abgezogen" || m.withheld);
  const announced = ms.find((m) => m.kind === "angekuendigt");
  const threat = ms.find((m) => m.kind === "droht");
  if (past && announced)
    return (
      <span aria-hidden className="flex size-[18px] items-center justify-center rounded-full border-[1.5px] border-dashed border-fg-secondary">
        <span className="size-2.5 rounded-full bg-fg-secondary" />
      </span>
    );
  if (past) return <span aria-hidden className="size-3 rounded-full bg-fg-secondary" />;
  if (threat) return <span aria-hidden className="size-3 rounded-full shadow-[inset_0_0_0_2px_var(--color-data-risk)]" />;
  if (announced) return <span aria-hidden className="size-3 rounded-full border-[1.5px] border-dashed border-fg-secondary" />;
  return <span aria-hidden className="size-1 rounded-full bg-fg-faint" />;
}

/** What a mark says: the kind and amount, and for an announced deduction the part already withheld inside it. */
const markLines = (m: ReasonMark, short = false): string[] =>
  m.withheld ? [`angekündigt ${m.amount.text}`, `davon ${short ? "" : "schon "}einbehalten ${m.withheld.amount.text}`] : [`${m.kind === "angekuendigt" ? "angekündigt " : ""}${m.amount.text}`];

const LEGEND = (
  <span className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-secondary">
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="size-2.5 rounded-full bg-fg-secondary" />
      gekürzt oder abgezogen
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="size-2.5 rounded-full border-[1.5px] border-dashed border-fg-secondary" />
      angekündigt
    </span>
    <span className="flex items-center gap-1.5">
      <span aria-hidden className="size-2.5 rounded-full shadow-[inset_0_0_0_2px_var(--color-data-risk)]" />
      droht laut unserer Vorprüfung
    </span>
  </span>
);

/**
 * Projects × reasons (step 8d): what the Auftraggeber cut or deducted as a filled neutral dot, what he announced as a
 * dashed ring (with the part already withheld inside it), and apart, in its own group, what only our Vorprüfung sees as a
 * red ring; the amount stands under each mark, a click opens the invoice and the detail in a window. On phones the same
 * marks as a list per project.
 */
export function ReasonMatrix({ v, name }: { v: ClientView; name: string }) {
  const [hot, setHot] = useState<{ p: string; r: string } | null>(null);
  const [open, setOpen] = useState<{ p: string; r: string } | null>(null);
  const phone = useMediaQuery("(max-width: 767px)", false);
  if (!v.reasons.length) return null;
  const openProject = open ? v.projects.find((p) => p.id === open.p) : undefined;
  const openReason = open ? v.reasons.find((r) => r.key === open.r) : undefined;
  const openMarks = open ? (openProject?.marks[open.r] ?? []) : [];
  const groups = [
    { id: "auftraggeber", title: `Von ${name}`, rows: v.reasons.filter((r) => r.own) },
    { id: "vorpruefung", title: "Nur unsere Vorprüfung", rows: v.reasons.filter((r) => !r.own) },
  ].filter((g) => g.rows.length);
  return (
    <section aria-labelledby="gruende" className="flex flex-col rounded-xl bg-surface shadow-ring">
      <header className="flex flex-col gap-2 px-5 pt-4 pb-2">
        <h2 id="gruende" className="flex items-center gap-1.5 text-fg-secondary">
          Gründe je Projekt
          <InfoTip label="Gründe je Projekt">
            Was {name} gekürzt, abgezogen oder angekündigt hat, aus den Belegen aller Projekte. Darunter getrennt, was nur unsere Vorprüfung im laufenden Projekt sieht. Fakten, keine Bewertung.
          </InfoTip>
        </h2>
        {LEGEND}
      </header>
      {phone ? (
        <ul className="flex flex-col px-3 pb-3">
          {v.projects.map((p) => {
            const rows = v.reasons.flatMap((r) => (p.marks[r.key] ?? []).map((m) => ({ r, m })));
            return (
              <li key={p.id} className="flex flex-col gap-1 py-2 [&:not(:last-child)]:shadow-line-bottom">
                <Link href={p.href} className="link-quiet w-fit font-medium">
                  {p.name}
                </Link>
                {rows.length ? (
                  rows.map(({ r, m }, i) => (
                    <span key={`${r.key}-${i}`} className="flex min-h-11 items-start gap-2.5 py-1">
                      <span className="mt-1 flex size-3 shrink-0 items-center justify-center">
                        <Mark ms={[m]} />
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm">{r.label}</span>
                        <span className="text-xs text-fg-secondary">{m.withheld ? keep(markLines(m).join(", ")) : `${MARK_TEXT[m.kind]}, ${m.what}`}</span>
                      </span>
                      <span className={cn("text-sm tabular-nums whitespace-nowrap", m.kind === "droht" && "text-state-red-edge")}>{keep(m.amount.text)}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-fg-muted">nichts gekürzt oder abgezogen</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <>
          <div className="overflow-x-auto px-3">
            <table className="w-full table-fixed border-separate border-spacing-0 text-sm" onPointerLeave={() => setHot(null)}>
              <colgroup>
                <col className="w-[30%]" />
                {v.projects.map((p) => (
                  <col key={p.id} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="h-9 px-2 text-left" />
                  {v.projects.map((p) => (
                    <th key={p.id} className={cn("h-9 px-1 text-center align-bottom text-xs font-normal", hot?.p === p.id ? "text-fg" : "text-fg-secondary")}>
                      <Link href={p.href} className="line-clamp-2 rounded-sm leading-4 outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent">
                        {p.name}
                      </Link>
                      <span className="block text-[11px] text-fg-muted">{p.closed ? "abgeschlossen" : "laufend"}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              {groups.map((g) => (
                <tbody key={g.id}>
                  <tr>
                    <th colSpan={v.projects.length + 1} className="h-8 px-2 pt-2 text-left align-bottom text-xs font-normal text-fg-muted">
                      {g.title}
                    </th>
                  </tr>
                  {g.rows.map((r) => (
                    <tr key={r.key}>
                      <td className={cn("h-11 max-w-[280px] px-2 py-1.5 leading-4 shadow-[inset_0_1px_0_0_var(--color-line)]", hot?.r === r.key ? "text-fg" : "text-fg-secondary")}>{r.label}</td>
                      {v.projects.map((p) => {
                        const ms = p.marks[r.key] ?? [];
                        return (
                          <td
                            key={p.id}
                            className={cn("h-11 px-1 text-center shadow-[inset_0_1px_0_0_var(--color-line)]", (hot?.p === p.id || hot?.r === r.key) && "bg-fill-subtle")}
                            onPointerEnter={() => setHot({ p: p.id, r: r.key })}
                          >
                            {ms.length ? (
                              <button
                                type="button"
                                aria-label={`${p.name}, ${r.label}: ${ms.flatMap((m) => markLines(m)).join(", ")}`}
                                aria-expanded={open?.p === p.id && open?.r === r.key}
                                onFocus={() => setHot({ p: p.id, r: r.key })}
                                onClick={() => setOpen(toggleOpen(open, { p: p.id, r: r.key }, (a, b) => a.p === b.p && a.r === b.r))}
                                className={cn("inline-flex min-h-9 min-w-9 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent", open?.p === p.id && open?.r === r.key && "bg-fill-hover")}
                              >
                                <Mark ms={ms} />
                                <span aria-hidden className="flex flex-col items-center">
                                  {ms.flatMap((m) => markLines(m, true).map((line, li) => ({ m, line, li }))).slice(0, 2).map(({ m, line, li }) => (
                                    <span key={`${m.kind}-${li}`} className={cn("text-[11px] leading-3.5 tabular-nums whitespace-nowrap", m.kind === "droht" ? "text-state-red-edge" : li > 0 ? "text-fg-muted" : "text-fg-secondary")}>
                                      {keep(line)}
                                    </span>
                                  ))}
                                </span>
                              </button>
                            ) : (
                              <span aria-label={`${p.name}, ${r.label}: nichts`} className="inline-flex min-h-9 min-w-9 items-center justify-center">
                                <Mark ms={ms} />
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
      <SideWindow open={!!open && openMarks.length > 0} onClose={() => setOpen(null)} title="Einzelheiten zum Grund" width={400}>
        {open && openProject && openReason && (
          <div className="flex min-h-0 flex-1 flex-col">
            <header className="flex h-12 shrink-0 items-center gap-2 pr-2.5 pl-4 shadow-line-bottom">
              <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{openReason.label}</h2>
              <button type="button" aria-label="Fenster schließen" onClick={() => setOpen(null)} className="flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:size-11">
                <X className="size-4" aria-hidden />
              </button>
            </header>
            <div className="flex flex-col gap-3 overflow-y-auto p-4">
              <Link href={openProject.href} className="link-quiet w-fit font-medium">
                {openProject.name}
              </Link>
              <ul className="flex flex-col gap-3">
                {openMarks.map((m) => (
                  <li key={`${m.kind}-${m.what}`} className="flex items-start gap-2.5">
                    <span className="mt-1 flex size-3 shrink-0 items-center justify-center">
                      <Mark ms={[m]} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5 text-sm">
                      <span className={cn("tabular-nums", m.kind === "droht" && "text-state-red-edge")}>{keep(markLines(m).join(", "))}</span>
                      <span className="text-xs text-fg-secondary">
                        {MARK_TEXT[m.kind]}, {m.what}
                      </span>
                      {m.withheld && <span className="text-xs text-fg-secondary">einbehalten auf {m.withheld.what}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </SideWindow>
    </section>
  );
}

const DOT = { rot: "bg-state-red", gelb: "bg-state-yellow", gruen: "bg-state-green", grau: "bg-state-grey" } as const;

/**
 * The projects of an Auftraggeber as clean rows (step 8d): status dot and word, the date with what it is, and the money
 * labelled; a closed project shows its Schlusszahlung. With a decision in this browser the core computes again (live.ts).
 */
export function ClientProjectRows({ rows: built, closing }: { rows: ProjectRow[]; closing: ClientView["closing"] }) {
  const live = useLive();
  const rows = live ? live.projectRows().filter((p) => built.some((b) => b.id === p.id)) : built;
  return (
    <section aria-labelledby="projekte" className="flex flex-col rounded-xl bg-surface shadow-ring">
      <h2 id="projekte" className="px-5 pt-4 pb-1 text-fg-secondary">
        Projekte <span className="text-fg-muted tabular-nums">{rows.length}</span>
      </h2>
      <ul className="flex flex-col p-2">
        {rows.map((p) => {
          const close = closing[p.id];
          return (
            <li key={p.id}>
              <Link
                href={`/projekte/${p.slug}/`}
                className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-4 max-sm:grid-cols-1 max-sm:gap-1.5 rounded-lg px-3 py-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
              >
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate font-medium">{p.name}</span>
                  <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-secondary">
                    <span className="flex items-center gap-1.5">
                      <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[p.status.colour])} />
                      {p.status.text}
                    </span>
                    {p.date && (
                      <span className="tabular-nums">
                        {p.date.label} {p.date.text}
                      </span>
                    )}
                  </span>
                </span>
                <span className="flex flex-col items-end text-right max-sm:items-start max-sm:text-left">
                  {p.extra ? (
                    <>
                      <span className="text-xs text-fg-secondary">zusätzlich verrechenbar</span>
                      <span className="tabular-nums">{keep(p.extra.text)}</span>
                      {p.unclear && p.unclear.cent > 0 && <span className="text-xs text-fg-muted tabular-nums">in Klärung {keep(p.unclear.text)}, nicht addiert</span>}
                    </>
                  ) : close ? (
                    <>
                      <span className="text-xs text-fg-secondary">{close.label}</span>
                      <span className="tabular-nums">{keep(close.amount.text)}</span>
                    </>
                  ) : null}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
