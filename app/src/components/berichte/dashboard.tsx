"use client";

import Link from "next/link";
import { useState } from "react";

import { GroupedColumns } from "@/components/charts/grouped-columns";
import { Legend } from "@/components/charts/legend";
import { Ring } from "@/components/charts/ring";
import { keep, TONE_VAR, type ChartTone } from "@/components/charts/tones";
import { InfoTip } from "@/components/ui/info-tip";
import { useMediaQuery } from "@/components/ui/use-media";
import { useLive } from "@/lib/live";
import type { RegieCell, ReportsView } from "@/lib/reports";
import { cn } from "@/lib/utils";

/** What the pointer rests on: a project (lights it and its Auftraggeber) or an Auftraggeber (lights its projects). */
type Focus = { project?: string; client?: string } | null;

function Card({
  id,
  q,
  figure,
  sub,
  info,
  children,
  className,
}: {
  id: string;
  q: string;
  figure: React.ReactNode;
  sub?: React.ReactNode;
  info: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-frage`} className={cn("flex min-w-0 scroll-mt-4 flex-col rounded-xl bg-surface shadow-ring", className)}>
      <header className="flex flex-col gap-0.5 px-5 pt-4 pb-1">
        <h2 id={`${id}-frage`} className="flex items-center gap-1.5 text-fg-secondary">
          {q}
          <InfoTip label={q}>{info}</InfoTip>
        </h2>
        <span className="text-[26px] leading-9 font-semibold tracking-tight tabular-nums">{figure}</span>
        {sub && <span className="text-xs text-fg-secondary tabular-nums">{sub}</span>}
      </header>
      <div className="flex min-h-0 flex-1 flex-col px-4 pt-2 pb-4">{children}</div>
    </section>
  );
}

const CELL_TEXT: Record<RegieCell["state"], string> = {
  verrechnet: "verrechnet",
  offen: "unterschrieben, nicht verrechnet",
  ohne_unterschrift: "nicht unterschrieben",
  spaeter: "nach der letzten Abschlagsrechnung",
};

const CELL_LEGEND: Record<RegieCell["state"], string> = { verrechnet: "verrechnet", offen: "unterschrieben, offen", ohne_unterschrift: "ohne Unterschrift", spaeter: "nach der letzten Abschlagsrechnung" };

/**
 * "Berichte" (step 8d, after Maxi S.: the dashboard, but calm and with real charts): four cards, each one question, one
 * figure and one chart, on a 12 column grid. Every amount is the core's (`reportsView`); the app counts finds and
 * Regieberichte and adds no amount. Pointing at a project lights it in every card, pointing at an Auftraggeber lights
 * its projects. After a decision in this browser the core's figures over it (live.ts).
 */
export function ReportsDashboard({ built }: { built: ReportsView }) {
  const v = useLive()?.reportsView() ?? built;
  const [focus, setFocus] = useState<Focus>(null);
  const phone = useMediaQuery("(max-width: 639px)", false);
  const lit = (project: string) => !focus || (focus.project ? focus.project === project : v.clientOf[project] === focus.client);
  const activeClient = focus ? (focus.client ?? (focus.project ? v.clientOf[focus.project] : null)) : null;

  const cutCount = v.cuts.reduce((n, c) => n + c.items.length, 0);
  const cutClients = v.cuts.filter((c) => c.items.length).length;
  const unsigned = v.regie.projects.reduce((n, p) => n + p.unsigned, 0);
  const gapFinds = v.evidence.totals.beleg_fehlt.finds;
  const counts = { belegt: v.evidence.totals.belegt.finds, gap: gapFinds, change: v.evidence.totals.nachtrag_nicht_gelegt.finds };
  const allFinds = counts.belegt + counts.gap + counts.change;

  return (
    <div className="mx-auto flex w-full max-w-[1240px] flex-col gap-4 px-6 pt-4 pb-10 max-md:px-4">
      <p className="self-end text-xs text-fg-muted tabular-nums max-md:self-start">Stand {v.asOf}, Beispieldaten</p>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 lg:items-start">
        <Card
          id="geld"
          className="lg:col-span-7"
          q="Geld je Projekt"
          figure={
            <span className="flex flex-wrap items-baseline gap-x-2">
              {keep(v.extra.total.text)}
              <span className="text-sm font-normal tracking-normal text-fg-secondary">zusätzlich verrechenbar</span>
            </span>
          }
          sub={<>davon mit Kürzungsrisiko {keep(v.extra.risk.text)}; in Klärung {keep(v.unclear.text)}, nicht addiert</>}
          info="Je offenem Projekt links die belegten Funde (zusätzlich verrechenbar), schraffiert der Teil mit Kürzungsrisiko; rechts daneben, getrennt, was noch in Klärung ist. Die beiden Säulen werden nie addiert."
        >
          <Legend
            className="px-1 pb-2"
            items={[
              { tone: "money", label: "zusätzlich verrechenbar" },
              { tone: "risk", label: "davon mit Kürzungsrisiko", hatched: true },
              { tone: "gap", label: "Beleg fehlt" },
              { tone: "change", label: "Nachtrag nicht gelegt" },
            ]}
          />
          <GroupedColumns
            label="Zusätzlich verrechenbar und in Klärung je Projekt"
            active={focus?.project ?? (focus?.client ? (v.extra.rows.find((r) => v.clientOf[r.name] === focus.client)?.name ?? null) : null)}
            onHover={(id) => setFocus(id ? { project: id } : null)}
            groups={v.extra.rows.map((r) => {
              const e = v.evidence.rows.find((x) => x.name === r.name);
              return {
                id: r.name,
                label: r.name,
                sub: `${r.finds === 1 ? "1 Fund" : `${r.finds} Funde`} belegt`,
                href: r.href,
                stacks: [
                  {
                    id: "extra",
                    label: "zusätzlich verrechenbar",
                    text: r.amount.text,
                    parts: [
                      { id: "risk", label: "mit Kürzungsrisiko", cent: r.risk.cent, text: r.risk.text, tone: "risk", hatched: true },
                      { id: "money", label: "ohne Kürzungsrisiko", cent: Math.max(0, r.amount.cent - r.risk.cent), text: "", tone: "money" },
                    ],
                  },
                  {
                    id: "unclear",
                    label: "in Klärung",
                    text: e && e.unclear.cent ? e.unclear.text : null,
                    empty: "nichts in Klärung",
                    parts: e
                      ? [
                          { id: "gap", label: "Beleg fehlt", cent: e.parts.beleg_fehlt.cent, text: e.parts.beleg_fehlt.text, tone: "gap" },
                          { id: "change", label: "Nachtrag nicht gelegt", cent: e.parts.nachtrag_nicht_gelegt.cent, text: e.parts.nachtrag_nicht_gelegt.text, tone: "change" },
                        ]
                      : [],
                  },
                ],
              };
            })}
          />
          {v.extra.notCompared.length > 0 && (
            <p className="px-1 pt-1 text-xs text-fg-muted">
              Nicht abgeglichen, weil abgeschlossen:{" "}
              {v.extra.notCompared.map((p, i) => (
                <span key={p.name}>
                  {i > 0 && ", "}
                  <Link href={p.href} className="link-quiet">
                    {p.name}
                  </Link>
                </span>
              ))}
              .
            </p>
          )}
        </Card>

        <Card
          id="belegstand"
          className="lg:col-span-5"
          q="Wie gut ist es belegt?"
          figure={`${counts.belegt} von ${allFinds} Funden`}
          sub="belegt, die übrigen warten auf einen Beleg oder einen Nachtrag"
          info={`Ein Teil des Rings je Fund, gezählt, nicht nach Betrag. Darunter, je Geldwort getrennt, wie viel nur außerhalb Ihres ERP belegt ist (auf Papier, in Dateien, E-Mails oder WhatsApp-Meldungen): zusätzlich verrechenbar ${v.erp.extra.amount.text} von ${v.erp.extra.of.text}, in Klärung ${v.erp.unclear.amount.text} von ${v.erp.unclear.of.text}.`}
        >
          <div className="flex items-center gap-6 px-1 py-2 max-sm:gap-4">
            <Ring
              size={phone ? 96 : 148}
              thickness={phone ? 11 : 16}
              label={`${allFinds} Funde: ${counts.belegt} belegt, ${counts.gap} Beleg fehlt, ${counts.change} Nachtrag nicht gelegt`}
              parts={[
                { id: "belegt", label: "belegt", value: counts.belegt, tone: "money" },
                { id: "gap", label: "Beleg fehlt", value: counts.gap, tone: "gap" },
                { id: "change", label: "Nachtrag nicht gelegt", value: counts.change, tone: "change" },
              ]}
            >
              <span className="text-2xl leading-7 font-semibold tabular-nums max-sm:text-lg">{allFinds}</span>
              <span className="text-xs text-fg-secondary">Funde</span>
            </Ring>
            <ul className="flex flex-col gap-2 text-sm">
              {(
                [
                  ["money", "belegt", counts.belegt],
                  ["gap", "Beleg fehlt", counts.gap],
                  ["change", "Nachtrag nicht gelegt", counts.change],
                ] as [ChartTone, string, number][]
              ).map(([tone, text, n]) => (
                <li key={text} className="flex items-center gap-2">
                  <span aria-hidden className="size-2.5 rounded-[3px]" style={{ background: TONE_VAR[tone] }} />
                  <span className="text-fg-secondary">{text}</span>
                  <span className="ml-auto pl-4 font-medium tabular-nums">{n}</span>
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-2 border-t border-line pt-3 text-xs leading-5 text-fg-secondary">
            <span className="text-fg tabular-nums">
              {v.erp.extra.finds} von {v.erp.extra.ofFinds}
            </span>{" "}
            belegten Funden nur außerhalb Ihres ERP belegt, in Klärung{" "}
            <span className="text-fg tabular-nums">{v.erp.unclear.finds === v.erp.unclear.ofFinds ? `alle ${v.erp.unclear.ofFinds}` : `${v.erp.unclear.finds} von ${v.erp.unclear.ofFinds}`}</span>.
          </p>
        </Card>

        <Card
          id="kuerzungen"
          className="lg:col-span-7"
          q="Kürzungen und Abzüge je Auftraggeber"
          figure={`${cutCount} ${cutCount === 1 ? "Kürzung" : "Kürzungen"}`}
          sub={`bei ${cutClients} ${cutClients === 1 ? "Auftraggeber" : "Auftraggebern"}, je Auftraggeber eine eigene Summe`}
          info="Je Auftraggeber, in alphabetischer Reihenfolge und ohne gemeinsame Achse, die Kürzungen auf Korrekturblättern und Schlussrechnungen und die Abzüge, für die der Vertrag keinen Punkt nennt, aus allen Projekten, jeweils mit eigener Summe. Ein für eine kommende Schlussrechnung angekündigter Abzug steht bei seinem Projekt, mit dem Teil, der schon einbehalten ist."
        >
          <ClientRows v={v} active={activeClient} onHover={(c) => setFocus(c ? { client: c } : null)} />
        </Card>

        <RegieCard v={v} lit={lit} setFocus={setFocus} unsigned={unsigned} gapFinds={gapFinds} />
      </div>
    </div>
  );
}

function RegieCard({ v, lit, setFocus, unsigned, gapFinds }: { v: ReportsView; lit: (p: string) => boolean; setFocus: (f: Focus) => void; unsigned: number; gapFinds: number }) {
  const [hot, setHot] = useState<{ project: string; cell: RegieCell } | null>(null);
  // every cell has a 1 px contour in the darker step of its state, so it reads against white; "ohne Unterschrift"
  // also carries a sign, so the state is never colour alone
  const tone: Record<RegieCell["state"], string> = {
    verrechnet: "bg-bar shadow-[inset_0_0_0_1px_var(--color-cell-edge)]",
    offen: "bg-data-money shadow-[inset_0_0_0_1px_var(--color-state-green-edge)]",
    ohne_unterschrift: "bg-data-gap shadow-[inset_0_0_0_1px_var(--color-state-yellow-edge)] text-state-yellow-edge",
    spaeter: "bg-transparent shadow-[inset_0_0_0_1.5px_var(--color-bar-strong)] [background-image:repeating-linear-gradient(135deg,transparent_0_3px,var(--color-track)_3px_5px)]",
  };
  return (
    <Card
      id="belege"
      className="lg:col-span-5"
      q="Wo fehlt ein Beleg?"
      figure={keep(v.evidence.totals.beleg_fehlt.text)}
      sub={`Beleg fehlt bei ${gapFinds} ${gapFinds === 1 ? "Fund" : "Funden"}, davon ${unsigned} ${unsigned === 1 ? "Regiebericht" : "Regieberichte"} ohne Unterschrift`}
      info={`Ein Feld je Regiebericht der offenen Projekte, in der Reihenfolge der Nummern. Grau verrechnet, grün unterschrieben und noch nicht verrechnet, gelb mit Ausrufezeichen ohne Unterschrift, schraffiert nach der letzten Abschlagsrechnung (kommt in die nächste).${v.says.regie ? ` ${v.says.regie}` : ""}`}
    >
      <div className="flex flex-col gap-3 px-1 pt-1" onPointerLeave={() => setHot(null)}>
        {v.regie.projects.map((p) => (
          <div
            key={p.name}
            className={cn("flex flex-col gap-1.5 transition-opacity duration-300", !lit(p.name) && "opacity-30")}
            onPointerEnter={() => setFocus({ project: p.name })}
            onPointerLeave={() => setFocus(null)}
          >
            <span className="flex items-baseline justify-between gap-2 text-xs">
              <Link href={p.href} className="link-quiet truncate text-fg-secondary">
                {p.name}
              </Link>
              <span className="shrink-0 text-fg-muted tabular-nums">{p.all} Regieberichte</span>
            </span>
            <span role="list" aria-label={`Regieberichte ${p.name}`} className="flex flex-wrap gap-1">
              {p.cells.map((c) => {
                const cls = cn(
                  "flex size-5 items-center justify-center rounded-[5px] text-[11px] leading-none font-bold outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent max-md:size-7",
                  tone[c.state],
                  hot?.cell === c && "ring-2 ring-fg ring-offset-1 ring-offset-surface",
                );
                const label = `${c.name}, ${CELL_TEXT[c.state]}`;
                const ev = { onPointerEnter: () => setHot({ project: p.name, cell: c }), onFocus: () => setHot({ project: p.name, cell: c }), onBlur: () => setHot(null) };
                const sign = c.state === "ohne_unterschrift" ? <span aria-hidden>!</span> : null;
                return c.href ? (
                  <Link key={c.nr} role="listitem" href={c.href} aria-label={label} title={label} className={cls} {...ev}>
                    {sign}
                  </Link>
                ) : (
                  <span key={c.nr} role="listitem" tabIndex={0} aria-label={label} title={label} className={cls} {...ev}>
                    {sign}
                  </span>
                );
              })}
            </span>
          </div>
        ))}
        <p className="min-h-4 text-xs text-fg-secondary" aria-live="polite">
          {hot && (
            <>
              <span className="text-fg">{hot.cell.name}</span>, {hot.project}: {CELL_TEXT[hot.cell.state]}
              {hot.cell.href ? ", ein Klick öffnet den Fund" : ""}
            </>
          )}
        </p>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-fg-secondary">
          {(Object.keys(CELL_LEGEND) as RegieCell["state"][]).map((st) => (
            <li key={st} className="flex items-center gap-1.5">
              <span aria-hidden className={cn("flex size-3.5 items-center justify-center rounded-[4px] text-[9px] leading-none font-bold", tone[st])}>
                {st === "ohne_unterschrift" ? "!" : null}
              </span>
              {CELL_LEGEND[st]}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

/**
 * "Kürzungen und Abzüge je Auftraggeber" (step 8d, after the council: no shared axis, no ranking): one block per
 * Auftraggeber in alphabetical order with its own sums and the single cuts and deductions. A deduction announced for a
 * coming Schlussrechnung stands with its project, as one line with the part already withheld (it lies inside the
 * announced amount, never beside it). Pointing at an Auftraggeber lights its projects in the other cards.
 */
function ClientRows({ v, active, onHover }: { v: ReportsView; active: string | null; onHover: (client: string | null) => void }) {
  const clients = [...v.cuts].sort((a, b) => a.name.localeCompare(b.name, "de"));
  return (
    <ul className="flex flex-col px-1" onPointerLeave={() => onHover(null)}>
      {clients.map((c) => {
        const d = v.deductions.find((x) => x.name === c.name);
        const announced = v.announced.filter((a) => a.client.name === c.name);
        const ded = d?.items ?? [];
        // an announced deduction whose kind and project match a withheld one becomes the second line of that one
        const extra = announced.filter((a) => !ded.some((x) => x.project === a.project.name && x.kind === a.kind));
        const none = !c.items.length && !ded.length && !extra.length;
        return (
          <li key={c.name} onPointerEnter={() => onHover(c.name)} className={cn("py-3 transition-opacity duration-300 [&:not(:last-child)]:shadow-line-bottom", active && active !== c.name && "opacity-35")}>
            <span className="flex items-baseline justify-between gap-3">
              <Link href={c.href} className="link-quiet font-medium">
                {c.name}
              </Link>
              {none && <span className="text-xs text-fg-muted">keine Kürzung, kein Abzug</span>}
            </span>
            {!none && (
              <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                <Block title="Kürzungen" total={c.total?.text ?? null} empty="keine Kürzung" rows={c.items.map((k, i) => ({ key: `k${i}`, label: k.reason, sub: k.project, amount: k.amount.text }))} />
                <Block
                  title="Abzug ohne Vertragspunkt"
                  total={d?.total?.text ?? null}
                  empty="kein Abzug"
                  rows={[
                    ...ded.map((x, i) => {
                      const a = announced.find((y) => y.project.name === x.project && y.kind === x.kind);
                      return { key: `a${i}`, label: x.kind, sub: a ? `${x.project}: angekündigt ${a.amount.text}, davon schon einbehalten ${x.amount.text}` : x.project, amount: x.amount.text };
                    }),
                    ...extra.map((a, i) => ({ key: `n${i}`, label: a.kind, sub: `${a.project.name}: für die Schlussrechnung angekündigt`, amount: a.amount.text, announced: true })),
                  ]}
                />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Block({ title, total, empty, rows }: { title: string; total: string | null; empty: string; rows: { key: string; label: string; sub: string; amount: string; announced?: boolean }[] }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="flex items-baseline justify-between gap-2 text-xs text-fg-secondary">
        {title}
        <span className="text-sm text-fg tabular-nums">{total ? keep(total) : <span className="text-xs text-fg-muted">{empty}</span>}</span>
      </span>
      <ul className="mt-1 flex flex-col">
        {rows.map((r) => (
          <li key={r.key} className="flex items-start gap-2 py-1 text-xs">
            <span aria-hidden className={cn("mt-1 size-2 shrink-0 rounded-[2px]", r.announced ? "shadow-[inset_0_0_0_1.5px_var(--color-bar-strong)]" : "bg-bar-strong")} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-fg-secondary">{r.label}</span>
              <span className="text-fg-muted">{keep(r.sub)}</span>
            </span>
            <span className={cn("tabular-nums whitespace-nowrap", r.announced ? "text-fg-muted" : "text-fg-secondary")}>{keep(r.amount)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
