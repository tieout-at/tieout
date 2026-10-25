"use client";

import Link from "next/link";
import { Briefcase, ChartColumn, Construction, Layers } from "lucide-react";

import { Tag } from "@/components/table/tag";
import type { Amount } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { FindLink, ReportsView } from "@/lib/reports";
import { cn } from "@/lib/utils";

type Stand = "belegt" | "beleg_fehlt" | "nachtrag_nicht_gelegt";
const STAND_FILL: Record<Stand, string> = { belegt: "bg-state-green", beleg_fehlt: "bg-state-yellow", nachtrag_nicht_gelegt: "bg-state-orange" };
const STANDS: Stand[] = ["belegt", "beleg_fehlt", "nachtrag_nicht_gelegt"];

const OBJECT_ICON = { Projekte: Construction, Funde: Layers, Auftraggeber: Briefcase } as const;

/** The reports of one dashboard; after a decision in this browser the core's figures over it (live.ts). */
export function DashboardReports({ slug, built }: { slug: string; built: ReportsView }) {
  const v = useLive()?.reportsView() ?? built;
  return (
    <div className="flex flex-col gap-5 p-5 max-md:gap-4 max-md:px-4 max-md:py-4">
      {slug === "geld-je-projekt" && (
        <>
          <ExtraReport v={v} />
          <EvidenceReport v={v} />
        </>
      )}
      {slug === "luecken-in-den-belegen" && (
        <>
          <RegieReport v={v} />
          <ErpReport v={v} />
        </>
      )}
      {slug === "kuerzungen-und-abzuege" && (
        <>
          <CutsReport v={v} />
          <DeductionsReport v={v} />
        </>
      )}
    </div>
  );
}

/** A report card (Attio: white, radius 12, 1 px line, head of 40 px with the title in 14/600 and the object chip). */
function Card({ title, object, children, note }: { title: string; object: keyof typeof OBJECT_ICON; children: React.ReactNode; note?: React.ReactNode }) {
  const Icon = OBJECT_ICON[object];
  const id = `bericht-${title.toLowerCase().replace(/[^a-zäöüß]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="rounded-lg bg-surface shadow-ring">
      <header className="flex min-h-10 items-center gap-2 px-3 pt-1">
        <ChartColumn className="size-4 shrink-0 text-fg-secondary" aria-hidden />
        <h2 id={id} className="font-semibold">
          {title}
        </h2>
        <span className="inline-flex h-5 items-center gap-1 rounded-sm bg-fill-subtle px-1.5 text-xs text-fg-secondary shadow-ring">
          <Icon className="size-3" aria-hidden />
          {object}
        </span>
      </header>
      <div className="flex flex-col gap-4 px-4 pt-2 pb-4">{children}</div>
      {note && <div className="px-4 pb-3 text-xs text-fg-muted shadow-[inset_0_1px_0_0_var(--color-line)] [&>p]:pt-2.5">{note}</div>}
    </section>
  );
}

function Metric({ label, amount, line }: { label: string; amount: Amount; line?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-fg-secondary">{label}</span>
      <span className="text-xl font-semibold tabular-nums">{amount.text}</span>
      {line && <span className="text-xs text-fg-muted">{line}</span>}
    </div>
  );
}

/** A bar as long as its share of the longest one; a picture only, every figure stands next to it in letters. */
function Bar({ share, part = 0, className }: { share: number; part?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-3 w-full overflow-hidden rounded-[3px] bg-fill-hover", className)}>
      <span className="flex h-full overflow-hidden rounded-[3px] bg-fg/25" style={{ width: `${Math.max(share, share > 0 ? 0.01 : 0) * 100}%` }}>
        {part > 0 && <span className="h-full bg-state-red/70" style={{ width: `${(part / share) * 100}%` }} />}
      </span>
    </span>
  );
}

const quiet = "link-quiet";

function FindChip({ f, withProject = true }: { f: FindLink; withProject?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <Link href={f.href} className="inline-flex h-5 shrink-0 items-center rounded-xs bg-fill-subtle px-1 font-mono text-xs shadow-ring outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
        {f.number}
      </Link>
      <Link href={f.href} className={cn(quiet, "min-w-0 truncate max-md:line-clamp-2 max-md:whitespace-normal")}>
        {f.name}
      </Link>
      {withProject && <span className="shrink-0 text-xs text-fg-muted max-md:hidden">{f.project.name}</span>}
    </span>
  );
}

function ExtraReport({ v }: { v: ReportsView }) {
  const max = Math.max(...v.extra.rows.map((r) => r.amount.cent), 1);
  return (
    <Card
      title="Zusätzlich verrechenbar je Projekt"
      object="Projekte"
      note={
        <p>
          Funde mit Belegstand „belegt“, die niemand auf „Nicht verrechnen“ gesetzt hat. „Davon mit Kürzungsrisiko“ ist ein Teil davon, kein eigener Betrag.
          {v.extra.notCompared.length > 0 && ` ${v.extra.notCompared.map((p) => p.name).join(" und ")}: Schlussrechnung gelegt oder abgeschlossen, nicht mehr abgeglichen.`}
        </p>
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <Metric label="zusätzlich verrechenbar, alle offenen Projekte" amount={v.extra.total} line={v.extra.risk.cent ? `davon mit Kürzungsrisiko ${v.extra.risk.text}` : undefined} />
        <ul className="flex flex-col">
          {v.extra.rows.map((r) => (
            <li key={r.href} className="grid min-h-11 grid-cols-[220px_minmax(0,1fr)_170px] items-center gap-x-4 py-1 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-y-1.5">
              <span className="flex min-w-0 flex-col">
                <Link href={r.href} className={cn(quiet, "truncate")}>
                  {r.name}
                </Link>
                <span className="text-xs text-fg-muted">
                  {r.client}, {r.finds === 1 ? "1 Fund" : `${r.finds} Funde`}
                </span>
              </span>
              <Bar share={r.amount.cent / max} part={r.risk.cent / max} className="max-md:order-3 max-md:col-span-2" />
              <span className="flex flex-col items-end text-right tabular-nums">
                <span>{r.amount.text}</span>
                {r.risk.cent > 0 && <span className="text-xs whitespace-nowrap text-state-red-edge">Kürzungsrisiko {r.risk.text}</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <Legend indent items={[{ fill: "bg-fg/25", label: "zusätzlich verrechenbar" }, { fill: "bg-state-red/70", label: "davon mit Kürzungsrisiko" }]} />
    </Card>
  );
}

function Legend({ items, indent = false }: { items: { fill: string; label: string }[]; indent?: boolean }) {
  return (
    <ul aria-hidden className={cn("flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-secondary", indent && "lg:pl-[244px]")}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className={cn("size-2 rounded-[2px]", i.fill)} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

function EvidenceReport({ v }: { v: ReportsView }) {
  const t = v.evidence.totals;
  return (
    <Card
      title="Belegstand je Projekt"
      object="Funde"
      note={<p>Jedes Kästchen ist ein Fund. „Zusätzlich verrechenbar“ und „in Klärung“ werden nie zusammengezählt: was in Klärung ist, braucht erst einen Beleg oder einen Nachtrag.</p>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {STANDS.map((st) => (
          <div key={st} className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
              <span aria-hidden className={cn("size-2 rounded-full", STAND_FILL[st])} />
              {t[st].label}
            </span>
            <span className="text-xl font-semibold tabular-nums">{t[st].text}</span>
            <span className="text-xs text-fg-muted">{t[st].finds === 1 ? "1 Fund" : `${t[st].finds} Funde`}</span>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-md shadow-ring">
        <div className="grid h-9 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_repeat(3,170px)] items-center text-xs text-fg-secondary shadow-line-bottom max-lg:hidden">
          <span className="px-3">Projekt</span>
          <span className="px-3">Funde</span>
          {STANDS.map((st) => (
            <span key={st} className="px-3 text-right">
              {t[st].label}
            </span>
          ))}
        </div>
        <ul>
          {v.evidence.rows.map((r) => (
            <li
              key={r.href}
              className="grid min-h-11 grid-cols-[minmax(0,1fr)_minmax(0,1fr)_repeat(3,170px)] items-center [&:not(:last-child)]:shadow-line-bottom max-lg:grid-cols-3 max-lg:gap-y-1.5 max-lg:px-3 max-lg:py-2.5"
            >
              <span className="min-w-0 px-3 max-lg:col-span-3 max-lg:px-0">
                <Link href={r.href} className={cn(quiet, "truncate")}>
                  {r.name}
                </Link>
              </span>
              <span className="flex flex-wrap items-center gap-1 px-3 max-lg:col-span-3 max-lg:px-0">
                <span className="sr-only">
                  {STANDS.map((st) => `${r.parts[st].finds} ${t[st].label}`).join(", ")}
                  {r.skipped > 0 && `, ${r.skipped} nicht verrechnen`}
                </span>
                {STANDS.flatMap((st) => Array.from({ length: r.parts[st].finds }, (_, i) => <span key={`${st}${i}`} aria-hidden className={cn("size-3 rounded-[3px]", STAND_FILL[st])} />))}
                {Array.from({ length: r.skipped }, (_, i) => (
                  <span key={`n${i}`} aria-hidden className="size-3 rounded-[3px] bg-state-grey" />
                ))}
              </span>
              {STANDS.map((st) => (
                <span key={st} className="px-3 text-right tabular-nums max-lg:px-0 max-lg:text-left">
                  <span className="block text-xs text-fg-muted lg:hidden">{t[st].label}</span>
                  <span className={cn(r.parts[st].cent === 0 && "text-fg-muted")}>{r.parts[st].text}</span>
                </span>
              ))}
            </li>
          ))}
        </ul>
      </div>
      <Legend
        items={[
          ...STANDS.map((st) => ({ fill: STAND_FILL[st], label: t[st].label })),
          ...(v.evidence.rows.some((r) => r.skipped) ? [{ fill: "bg-state-grey", label: "Nicht verrechnen" }] : []),
        ]}
      />
    </Card>
  );
}

function RegieReport({ v }: { v: ReportsView }) {
  const r = v.regie;
  return (
    <Card
      title="Regieberichte ohne Unterschrift"
      object="Funde"
      note={
        r.cutBefore.length > 0 && (
          <p>
            {r.cutBefore.map((c, i) => (
              <span key={i}>
                Gleicher Grund schon einmal gekürzt:{" "}
                <Link href={c.client.href} className={quiet}>
                  {c.client.name}
                </Link>{" "}
                im {c.project}, „Regie nicht unterschrieben“, {c.amount.text}.{" "}
              </span>
            ))}
          </p>
        )
      }
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        {r.total ? <Metric label="Beleg fehlt" amount={r.total} line={`${r.finds.length} Funde in Klärung`} /> : <span />}
        <ul className="flex flex-col">
          {r.finds.map((f) => (
            <li key={f.href} className="flex min-h-11 flex-col justify-center gap-0.5 py-1.5 [&:not(:last-child)]:shadow-line-bottom">
              <span className="flex items-center gap-3">
                <FindChip f={f} />
                <span className="ml-auto shrink-0 tabular-nums">{f.amount.text}</span>
              </span>
              <span className="pl-9 text-xs text-fg-muted">
                <Tag colour="yellow" className="mr-2 h-5 text-xs">
                  {f.kind}
                </Tag>
                {f.remedy && `Abhilfe: ${f.remedy}`}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="overflow-hidden rounded-md shadow-ring">
        <div className="grid h-9 grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,150px))] items-center text-xs text-fg-secondary shadow-line-bottom max-lg:hidden">
          <span className="px-3">Regieberichte je Projekt</span>
          <span className="px-3 text-right">im Ordner</span>
          <span className="px-3 text-right">verrechnet</span>
          <span className="px-3 text-right">unterschrieben, nicht verrechnet</span>
          <span className="px-3 text-right">nicht unterschrieben</span>
        </div>
        <ul>
          {r.projects.map((p) => (
            <li
              key={p.href}
              className="grid min-h-11 grid-cols-[minmax(0,1fr)_repeat(4,minmax(0,150px))] items-center tabular-nums [&:not(:last-child)]:shadow-line-bottom max-lg:grid-cols-1 max-lg:gap-y-0.5 max-lg:px-3 max-lg:py-2.5"
            >
              <span className="min-w-0 px-3 max-lg:px-0">
                <Link href={p.href} className={cn(quiet, "truncate")}>
                  {p.name}
                </Link>
                {p.later > 0 && <span className="block text-xs text-fg-muted">{p.later === 1 ? "1 weiterer nach der letzten Abschlagsrechnung" : `${p.later} weitere nach der letzten Abschlagsrechnung`}</span>}
              </span>
              {(
                [
                  ["im Ordner", p.all],
                  ["verrechnet", p.invoiced],
                  ["unterschrieben, nicht verrechnet", p.signedOpen],
                  ["nicht unterschrieben", p.unsigned],
                ] as const
              ).map(([label, n]) => (
                <span key={label} className={cn("px-3 text-right max-lg:hidden", n === 0 && "text-fg-muted")}>
                  {n}
                </span>
              ))}
              <span className="text-xs text-fg-secondary lg:hidden">
                {p.all} im Ordner, {p.invoiced} verrechnet, {p.signedOpen} unterschrieben und nicht verrechnet, {p.unsigned} nicht unterschrieben
              </span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function ErpReport({ v }: { v: ReportsView }) {
  const e = v.erp;
  const parts = [
    { label: "von zusätzlich verrechenbar", x: e.extra },
    { label: "von in Klärung", x: e.unclear },
  ];
  return (
    <Card
      title="Nur außerhalb ERP"
      object="Funde"
      note={
        <p>
          Annahme der Beispieldaten: was als Aufmaßblatt erfasst ist, steht im ERP; ein Regiebericht auf Papier, eine E-Mail, ein Foto oder eine WhatsApp-Meldung nicht. Gezählt wird nur der
          Beleg der Leistung, nicht der Preis.
        </p>
      }
    >
      <p className="max-w-[720px]">
        Diese Leistung ist in Ihrem ERP nicht zu sehen. Sie steht nur auf Papier, in einer E-Mail, auf einem Foto oder in einer WhatsApp-Meldung. Genau diese Leistung bleibt beim Schreiben der
        Schlussrechnung am leichtesten liegen.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {parts.map(({ label, x }) => (
          <div key={label} className="flex flex-col gap-2">
            <Metric label={`nur außerhalb ERP, ${label}`} amount={x.amount} line={`${x.finds} von ${x.ofFinds} Funden, von ${x.of.text}`} />
            <Bar share={x.of.cent ? x.amount.cent / x.of.cent : 0} />
          </div>
        ))}
      </div>
      <ul className="flex flex-col">
        {e.finds.map((f) => (
          <li key={f.href} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto_120px] items-center gap-x-4 py-1.5 [&:not(:last-child)]:shadow-line-bottom max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-y-1">
            <FindChip f={f} />
            <span className="flex flex-wrap gap-1 max-md:order-3 max-md:col-span-2 max-md:pl-9">
              {f.sources.map((s) => (
                <Tag key={s} className="h-5 text-xs">
                  {s}
                </Tag>
              ))}
              {f.money === "in Klärung" && (
                <Tag colour="yellow" className="h-5 text-xs">
                  in Klärung
                </Tag>
              )}
            </span>
            <span className="text-right tabular-nums">{f.amount.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function ClientBars({ rows, empty }: { rows: { name: string; href: string; total: Amount | null; projects: number }[]; empty: string }) {
  const max = Math.max(...rows.map((r) => r.total?.cent ?? 0), 1);
  return (
    <ul className="flex flex-col">
      {rows.map((r) => (
        <li key={r.href} className="grid min-h-11 grid-cols-[220px_minmax(0,1fr)_170px] items-center gap-x-4 py-1 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-y-1.5">
          <span className="flex min-w-0 flex-col">
            <Link href={r.href} className={cn(quiet, "truncate")}>
              {r.name}
            </Link>
            {r.total && <span className="text-xs text-fg-muted">{r.projects === 1 ? "in 1 Projekt" : `in ${r.projects} Projekten`}</span>}
          </span>
          <Bar share={(r.total?.cent ?? 0) / max} className="max-md:order-3 max-md:col-span-2" />
          <span className={cn("text-right tabular-nums", !r.total && "text-fg-muted")}>{r.total?.text ?? empty}</span>
        </li>
      ))}
    </ul>
  );
}

function CutsReport({ v }: { v: ReportsView }) {
  const items = v.cuts.flatMap((c) => c.items.map((i) => ({ ...i, client: c })));
  return (
    <Card title="Kürzungen je Auftraggeber" object="Auftraggeber" note={<p>Aus den Korrekturblättern aller Projekte. Fakten aus den Belegen, keine Bewertung des Auftraggebers.</p>}>
      <ClientBars rows={v.cuts} empty="keine Kürzung" />
      <Details
        head={["Auftraggeber und Projekt", "Rechnung", "Position", "Grund", "Betrag"]}
        cols="lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,0.8fr)_minmax(0,1.3fr)_120px]"
        rows={items.map((i) => ({
          key: `${i.client.href}${i.invoice}${i.position}`,
          cells: [
            <span key="a" className="flex min-w-0 flex-col">
              <Link href={i.client.href} className={cn(quiet, "truncate")}>
                {i.client.name}
              </Link>
              <span className="text-xs text-fg-muted">{i.project}</span>
            </span>,
            <span key="b" className="flex flex-col">
              {i.invoice}
              <span className="text-xs text-fg-muted">{i.date}</span>
            </span>,
            <span key="c" className={cn(/^S+$/.test(i.position) && "font-mono text-xs")}>
              {i.position}
            </span>,
            i.reason,
            i.amount.text,
          ],
        }))}
      />
    </Card>
  );
}

function DeductionsReport({ v }: { v: ReportsView }) {
  const items = v.deductions.flatMap((c) => c.items.map((i) => ({ ...i, client: c })));
  return (
    <Card
      title="Abzüge ohne Vertragspunkt je Auftraggeber"
      object="Auftraggeber"
      note={<p>Sätze auf den Zahlungsavisos, die der Vertrag des Projekts nicht nennt. Ob Sie widersprechen, entscheiden Sie; tieout bewertet das nicht rechtlich.</p>}
    >
      <ClientBars rows={v.deductions} empty="kein Abzug" />
      <Details
        head={["Auftraggeber und Projekt", "Abzug", "einbehalten bei", "Betrag"]}
        cols="lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_minmax(0,1.6fr)_120px]"
        rows={items.map((i) => ({
          key: `${i.client.href}${i.project}${i.kind}`,
          cells: [
            <span key="a" className="flex min-w-0 flex-col">
              <Link href={i.client.href} className={cn(quiet, "truncate")}>
                {i.client.name}
              </Link>
              <span className="text-xs text-fg-muted">{i.project}</span>
            </span>,
            i.kind,
            i.invoices,
            i.amount.text,
          ],
        }))}
      />
      {v.announced.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-xs text-fg-secondary">Angekündigt für die nächste Schlussrechnung</h3>
          <ul className="flex flex-col">
            {v.announced.map((a) => (
              <li key={`${a.project.href}${a.kind}`} className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-3 py-2 shadow-ring">
                <Tag colour="red" className="h-5 text-xs">
                  Abzug ohne Vertragspunkt
                </Tag>
                <span>
                  {a.kind} {a.rate}
                </span>
                <span className="text-fg-muted">
                  <Link href={a.client.href} className={quiet}>
                    {a.client.name}
                  </Link>
                  ,{" "}
                  <Link href={a.project.href} className={quiet}>
                    {a.project.name}
                  </Link>
                </span>
                <span className="ml-auto tabular-nums">{a.amount.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

/** Detail list under a chart: a small table from 1024 px, one block per entry below. The last cell is the amount. */
function Details({ head, rows, cols }: { head: string[]; rows: { key: string; cells: React.ReactNode[] }[]; cols: string }) {
  return (
    <div className="overflow-hidden rounded-md shadow-ring">
      <div className={cn("grid h-9 items-center text-xs text-fg-secondary shadow-line-bottom max-lg:hidden", cols)}>
        {head.map((h, i) => (
          <span key={i} className={cn("px-3", i === head.length - 1 && "text-right")}>
            {h}
          </span>
        ))}
      </div>
      <ul>
        {rows.map((r) => (
          <li key={r.key} className={cn("grid min-h-11 items-center py-1.5 [&:not(:last-child)]:shadow-line-bottom max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:gap-1 max-lg:px-3", cols)}>
            {r.cells.map((c, i) => {
              const last = i === r.cells.length - 1;
              return (
                <span key={i} className={cn("min-w-0 px-3 max-lg:px-0", last && "text-right tabular-nums max-lg:order-first max-lg:col-start-2 max-lg:row-start-1", !last && i > 0 && "max-lg:col-span-2 max-lg:text-xs max-lg:text-fg-secondary")}>
                  {c}
                </span>
              );
            })}
          </li>
        ))}
      </ul>
    </div>
  );
}
