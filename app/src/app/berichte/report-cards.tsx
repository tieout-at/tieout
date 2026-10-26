"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Tag } from "@/components/table/tag";
import { InfoTip } from "@/components/ui/info-tip";
import type { Amount } from "@/lib/kern-data";
import { useLive } from "@/lib/live";
import type { FindLink, ReportsView } from "@/lib/reports";
import { cn } from "@/lib/utils";

type Stand = "belegt" | "beleg_fehlt" | "nachtrag_nicht_gelegt";
const STAND_FILL: Record<Stand, string> = { belegt: "bg-state-green", beleg_fehlt: "bg-state-yellow", nachtrag_nicht_gelegt: "bg-state-orange" };
const STANDS: Stand[] = ["belegt", "beleg_fehlt", "nachtrag_nicht_gelegt"];
const quiet = "link-quiet";
const finds = (n: number) => (n === 1 ? "1 Fund" : `${n} Funde`);

/**
 * The reports of one dashboard, chosen with Maxi S. after the design round of step 8 (draft B): each card asks one
 * question, answers with one big figure and one statement written from the core's figures, and shows one picture next to
 * it; the rule behind a figure sits behind an info icon. After a decision in this browser the core's figures (live.ts).
 */
export function DashboardReports({ slug, built }: { slug: string; built: ReportsView }) {
  const v = useLive()?.reportsView() ?? built;
  return (
    <div className="flex flex-col gap-4 p-5 max-md:px-4 max-md:py-4">
      {slug === "geld-je-projekt" && (
        <>
          <ExtraReport v={v} />
          <UnclearReport v={v} />
        </>
      )}
      {slug === "luecken-in-den-belegen" && (
        <>
          <RegieReport v={v} />
          <FolderReport v={v} />
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

/** A report: the question, the figure and its statement on the left (300 px), the picture on the right. */
function Card({ question, info, figure, label, says, children }: { question: string; info?: React.ReactNode; figure: string; label: React.ReactNode; says?: string | null; children: React.ReactNode }) {
  const id = `bericht-${question.toLowerCase().replace(/[^a-zäöüß]+/g, "-")}`;
  return (
    <section aria-labelledby={id} className="grid gap-x-10 gap-y-5 rounded-lg bg-surface p-6 shadow-ring max-md:p-4 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="flex flex-col gap-1">
        <h2 id={id} className="flex items-center gap-1.5 text-fg-secondary">
          {question}
          {info && <InfoTip label={question}>{info}</InfoTip>}
        </h2>
        <span className="text-[28px] leading-9 font-semibold tracking-tight tabular-nums">{figure}</span>
        <span className="text-xs text-fg-secondary">{label}</span>
        {says && <p className="mt-3 font-semibold">{says}</p>}
      </div>
      <div className="flex min-w-0 flex-col gap-3">{children}</div>
    </section>
  );
}

/** A bar as long as its share; a picture only, the figure stands next to it in letters. */
function Bar({ share, part = 0, fill = "bg-fg/35", className }: { share: number; part?: number; fill?: string; className?: string }) {
  return (
    <span aria-hidden className={cn("flex h-1.5 w-full overflow-hidden rounded-full bg-fill-hover", className)}>
      <span className={cn("flex h-full overflow-hidden rounded-full", fill)} style={{ width: `${Math.max(share, share > 0 ? 0.02 : 0) * 100}%` }}>
        {part > 0 && <span className="h-full bg-state-red" style={{ width: `${(part / share) * 100}%` }} />}
      </span>
    </span>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return <li className={cn("grid min-h-12 items-center gap-x-4 py-1.5 [&:not(:last-child)]:shadow-line-bottom", className)}>{children}</li>;
}

function FindName({ f }: { f: FindLink }) {
  return (
    <span className="flex min-w-0 items-start gap-2">
      <span className="mt-0.5 inline-flex h-5 shrink-0 items-center rounded-xs bg-fill-subtle px-1 font-mono text-xs shadow-ring">{f.number}</span>
      <span className="flex min-w-0 flex-col">
        <Link href={f.href} className={cn(quiet, "truncate max-md:line-clamp-2 max-md:whitespace-normal")}>
          {f.name}
        </Link>
        <span className="truncate text-xs text-fg-muted">{f.project.name}</span>
      </span>
    </span>
  );
}

function Fold({ summary, children }: { summary: string; children: React.ReactNode }) {
  return (
    <details className="group">
      <summary className="flex h-8 w-fit cursor-pointer list-none items-center gap-1 rounded-md pr-2 text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent [&::-webkit-details-marker]:hidden">
        <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden />
        {summary}
      </summary>
      <div className="pt-1">{children}</div>
    </details>
  );
}

function ExtraReport({ v }: { v: ReportsView }) {
  const max = Math.max(...v.extra.rows.map((r) => r.amount.cent), 1);
  return (
    <Card
      question="Was ist zusätzlich verrechenbar?"
      info={
        <>
          Funde mit Belegstand „belegt“, die niemand auf „Nicht verrechnen“ gesetzt hat. „Davon mit Kürzungsrisiko“ ist ein Teil davon.
          {v.extra.notCompared.length > 0 && ` ${v.extra.notCompared.map((p) => p.name).join(" und ")}: Schlussrechnung gelegt, nicht mehr abgeglichen.`}
        </>
      }
      figure={v.extra.total.text}
      label={`zusätzlich verrechenbar in ${v.extra.rows.length} offenen Projekten`}
      says={v.says.extra}
    >
      <div className="flex flex-col gap-1.5">
        <Bar share={1} part={v.extra.total.cent ? v.extra.risk.cent / v.extra.total.cent : 0} />
        <span className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-fg-secondary">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 rounded-full bg-state-red" />
            davon mit Kürzungsrisiko <span className="text-fg tabular-nums">{v.extra.risk.text}</span>
          </span>
          <span>
            zusätzlich verrechenbar <span className="text-fg tabular-nums">{v.extra.total.text}</span>
          </span>
        </span>
      </div>
      <ul>
        {v.extra.rows.map((r) => (
          <Row key={r.href} className="grid-cols-[minmax(0,1fr)_140px_120px] max-md:grid-cols-[minmax(0,1fr)_auto]">
            <span className="flex min-w-0 flex-col">
              <Link href={r.href} className={cn(quiet, "truncate")}>
                {r.name}
              </Link>
              <span className="truncate text-xs text-fg-muted">
                {r.client}, {finds(r.finds)}
              </span>
            </span>
            <Bar share={r.amount.cent / max} part={r.risk.cent / max} className="max-md:hidden" />
            <span className="flex flex-col items-end tabular-nums">
              {r.amount.text}
              {r.risk.cent > 0 && <span className="text-xs text-state-red-edge">{r.risk.text}</span>}
            </span>
          </Row>
        ))}
      </ul>
    </Card>
  );
}

function UnclearReport({ v }: { v: ReportsView }) {
  const t = v.evidence.totals;
  const total = t.beleg_fehlt.cent + t.nachtrag_nicht_gelegt.cent;
  return (
    <Card
      question="Was ist noch in Klärung?"
      info="Funde, denen ein Beleg oder ein Nachtrag fehlt. Sie werden nie zu zusätzlich verrechenbar addiert und kommen erst in die Änderungsliste, wenn die Lücke geschlossen ist."
      figure={v.unclear.text}
      label={`in Klärung, ${finds(t.beleg_fehlt.finds + t.nachtrag_nicht_gelegt.finds)}`}
      says={v.says.unclear}
    >
      <div className="flex flex-col gap-1.5">
        <span aria-hidden className="flex h-1.5 w-full overflow-hidden rounded-full bg-fill-hover">
          {(["beleg_fehlt", "nachtrag_nicht_gelegt"] as const).map((st) => (
            <span key={st} className={STAND_FILL[st]} style={{ width: `${total ? (t[st].cent / total) * 100 : 0}%` }} />
          ))}
        </span>
        <span className="flex flex-wrap items-center justify-between gap-x-3 text-xs text-fg-secondary">
          {(["beleg_fehlt", "nachtrag_nicht_gelegt"] as const).map((st) => (
            <span key={st} className="flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 rounded-full", STAND_FILL[st])} />
              {t[st].label} <span className="text-fg tabular-nums">{t[st].text}</span>
            </span>
          ))}
        </span>
      </div>
      <ul>
        {v.evidence.rows.map((r) => (
          <Row key={r.href} className="grid-cols-[minmax(0,1fr)_auto_140px] max-md:grid-cols-[minmax(0,1fr)_auto]">
            <span className="flex min-w-0 flex-col">
              <Link href={r.href} className={cn(quiet, "truncate")}>
                {r.name}
              </Link>
              <span className="text-xs text-fg-muted">{finds(r.finds + r.skipped)}</span>
            </span>
            <span className="flex flex-wrap gap-1 max-md:order-3 max-md:col-span-2" role="img" aria-label={STANDS.map((st) => `${r.parts[st].finds} ${t[st].label}`).join(", ")}>
              {STANDS.flatMap((st) => Array.from({ length: r.parts[st].finds }, (_, i) => <span key={`${st}${i}`} className={cn("size-3 rounded-[3px]", STAND_FILL[st])} />))}
              {Array.from({ length: r.skipped }, (_, i) => (
                <span key={`n${i}`} className="size-3 rounded-[3px] bg-state-grey" />
              ))}
            </span>
            <span className={cn("text-right tabular-nums", !r.unclear.cent && "text-xs text-fg-muted")}>{r.unclear.cent ? r.unclear.text : "nichts in Klärung"}</span>
          </Row>
        ))}
      </ul>
      <span className="text-xs text-fg-muted">Ein Kästchen je Fund: grün belegt, gelb Beleg fehlt, orange Nachtrag nicht gelegt{v.evidence.rows.some((r) => r.skipped) ? ", grau nicht verrechnen" : ""}.</span>
    </Card>
  );
}

function RegieReport({ v }: { v: ReportsView }) {
  const r = v.regie;
  if (!r.total) return null;
  return (
    <Card
      question="Welche Regie hat keine Unterschrift?"
      info="Regieberichte ohne Unterschrift des Auftraggebers und Stunden, zu denen es nur eine WhatsApp-Meldung gibt. Mit Unterschrift kommen sie in die Änderungsliste."
      figure={r.total.text}
      label={`Beleg fehlt, ${finds(r.finds.length)}`}
      says={v.says.regie}
    >
      <ul>
        {r.finds.map((f) => (
          <Row key={f.href} className="grid-cols-[minmax(0,1fr)_120px]">
            <span className="flex min-w-0 flex-col gap-0.5">
              <FindName f={f} />
              {f.remedy && <span className="pl-9 text-xs text-fg-secondary">{f.remedy}</span>}
            </span>
            <span className="self-start pt-0.5 text-right tabular-nums">{f.amount.text}</span>
          </Row>
        ))}
      </ul>
    </Card>
  );
}

function FolderReport({ v }: { v: ReportsView }) {
  const r = v.regie;
  const signedOpen = r.projects.reduce((n, p) => n + p.signedOpen, 0);
  const box = (kind: "invoiced" | "signedOpen" | "unsigned" | "later") =>
    cn("size-3 rounded-[3px]", kind === "invoiced" && "bg-fg/15", kind === "signedOpen" && "bg-state-green", kind === "unsigned" && "bg-state-yellow", kind === "later" && "shadow-[inset_0_0_0_1px_var(--color-fg-faint)]");
  return (
    <Card
      question="Was liegt im Ordner und ist nicht verrechnet?"
      info="Alle Regieberichte im Ordner je Projekt. Regieberichte nach der letzten Abschlagsrechnung kommen in die nächste und sind noch kein Fund."
      figure={`${signedOpen} Regieberichte`}
      label="unterschrieben, nicht verrechnet"
      says={signedOpen ? "Sie sind unterschrieben und stehen noch in keiner Rechnung." : null}
    >
      <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-fg-secondary" aria-hidden>
        {(
          [
            ["invoiced", "verrechnet"],
            ["signedOpen", "unterschrieben, nicht verrechnet"],
            ["unsigned", "nicht unterschrieben"],
            ["later", "nach der letzten Abschlagsrechnung"],
          ] as const
        ).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={box(k)} />
            {label}
          </span>
        ))}
      </span>
      <ul>
        {r.projects.map((p) => (
          <Row key={p.href} className="grid-cols-[180px_minmax(0,1fr)_40px] max-md:grid-cols-[minmax(0,1fr)_auto]">
            <Link href={p.href} className={cn(quiet, "truncate")}>
              {p.name}
            </Link>
            <span
              role="img"
              className="flex flex-wrap gap-1 max-md:order-3 max-md:col-span-2"
              aria-label={`${p.invoiced} verrechnet, ${p.signedOpen} unterschrieben und nicht verrechnet, ${p.unsigned} nicht unterschrieben, ${p.later} nach der letzten Abschlagsrechnung`}
            >
              {(
                [
                  ["invoiced", p.invoiced],
                  ["signedOpen", p.signedOpen],
                  ["unsigned", p.unsigned],
                  ["later", p.later],
                ] as const
              ).flatMap(([k, n]) => Array.from({ length: n }, (_, i) => <span key={`${k}${i}`} className={box(k)} />))}
            </span>
            <span className="text-right tabular-nums">{p.all}</span>
          </Row>
        ))}
      </ul>
    </Card>
  );
}

function ErpReport({ v }: { v: ReportsView }) {
  const e = v.erp;
  const group = (money: string) => e.finds.filter((f) => f.money === money);
  return (
    <Card
      question="Was steht nur außerhalb des ERP?"
      info="Annahme der Beispieldaten: was als Aufmaßblatt erfasst ist, steht im ERP; ein Regiebericht auf Papier, eine E-Mail, ein Foto oder eine WhatsApp-Meldung nicht. Gezählt wird nur der Beleg der Leistung, nicht der Preis."
      figure={e.extra.amount.text}
      label={`von ${e.extra.of.text} zusätzlich verrechenbar, ${e.extra.finds} von ${e.extra.ofFinds} Funden`}
      says="Diese Leistung steht nur auf Papier, in E-Mails, auf Fotos oder in WhatsApp-Meldungen, nicht in Ihrem ERP."
    >
      <div className="grid gap-5 sm:grid-cols-2">
        {(
          [
            ["zusätzlich verrechenbar", e.extra],
            ["in Klärung", e.unclear],
          ] as const
        ).map(([label, x]) => (
          <div key={label} className="flex flex-col gap-1.5">
            <span className="flex justify-between gap-3 text-xs text-fg-secondary">
              <span>
                {label} <span className="text-fg tabular-nums">{x.amount.text}</span>
              </span>
              <span>
                {x.finds} von {x.ofFinds} Funden
              </span>
            </span>
            <Bar share={x.of.cent ? x.amount.cent / x.of.cent : 0} />
          </div>
        ))}
      </div>
      <Fold summary={`${e.finds.length} Funde zeigen`}>
        {(["zusätzlich verrechenbar", "in Klärung"] as const).map((money) => (
          <div key={money} className="flex flex-col">
            <h3 className="pt-2 text-xs text-fg-secondary">{money}</h3>
            <ul>
              {group(money).map((f) => (
                <Row key={f.href} className="grid-cols-[minmax(0,1fr)_auto_120px] max-md:grid-cols-[minmax(0,1fr)_auto]">
                  <FindName f={f} />
                  <span className="flex flex-wrap gap-1 max-md:order-3 max-md:col-span-2 max-md:pl-9">
                    {f.sources.map((s) => (
                      <Tag key={s} className="h-5 text-xs">
                        {s}
                      </Tag>
                    ))}
                  </span>
                  <span className="text-right tabular-nums">{f.amount.text}</span>
                </Row>
              ))}
            </ul>
          </div>
        ))}
      </Fold>
    </Card>
  );
}

function ClientBars({ rows, empty }: { rows: { name: string; href: string; total: Amount | null; projects: number }[]; empty: string }) {
  const max = Math.max(...rows.map((r) => r.total?.cent ?? 0), 1);
  return (
    <ul>
      {rows.map((r) => (
        <Row key={r.href} className="grid-cols-[minmax(0,1fr)_200px_120px] max-md:grid-cols-[minmax(0,1fr)_auto]">
          <span className="flex min-w-0 flex-col">
            <Link href={r.href} className={cn(quiet, "truncate")}>
              {r.name}
            </Link>
            {r.total && <span className="text-xs text-fg-muted">{r.projects === 1 ? "in 1 Projekt" : `in ${r.projects} Projekten`}</span>}
          </span>
          <Bar share={(r.total?.cent ?? 0) / max} className="max-md:hidden" />
          <span className={cn("text-right tabular-nums", !r.total && "text-xs text-fg-muted")}>{r.total?.text ?? empty}</span>
        </Row>
      ))}
    </ul>
  );
}

function CutsReport({ v }: { v: ReportsView }) {
  const lead = v.says.cuts?.lead;
  const items = v.cuts.flatMap((c) => c.items.map((i) => ({ ...i, client: c })));
  return (
    <Card
      question="Wer hat bisher gekürzt?"
      info="Aus den Korrekturblättern aller Projekte. Fakten aus den Belegen, keine Bewertung des Auftraggebers."
      figure={lead?.total.text ?? "keine Kürzung"}
      label={lead ? `am meisten: ${lead.name}, in ${lead.projects === 1 ? "1 Projekt" : `${lead.projects} Projekten`}` : "in keinem Projekt"}
      says={v.says.cuts?.text}
    >
      <ClientBars rows={v.cuts} empty="keine Kürzung" />
      {items.length > 0 && (
        <Fold summary={`${items.length} Kürzungen einzeln`}>
          <ul>
            {items.map((i) => (
              <Row key={`${i.client.href}${i.invoice}${i.position}`} className="grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1.3fr)_110px] max-md:grid-cols-[minmax(0,1fr)_auto]">
                <span className="flex min-w-0 flex-col">
                  <Link href={i.client.href} className={cn(quiet, "truncate")}>
                    {i.client.name}
                  </Link>
                  <span className="truncate text-xs text-fg-muted">{i.project}</span>
                </span>
                <span className="flex min-w-0 flex-col text-xs max-md:order-3 max-md:col-span-2">
                  <span>
                    {i.invoice}, <span className={cn(/^\S+$/.test(i.position) && "font-mono")}>{i.position}</span>
                  </span>
                  <span className="text-fg-muted">{i.date}</span>
                </span>
                <span className="text-xs text-fg-secondary max-md:order-4 max-md:col-span-2">{i.reason}</span>
                <span className="text-right tabular-nums max-md:col-start-2 max-md:row-start-1">{i.amount.text}</span>
              </Row>
            ))}
          </ul>
        </Fold>
      )}
    </Card>
  );
}

function DeductionsReport({ v }: { v: ReportsView }) {
  const d = v.says.deductions;
  const items = v.deductions.flatMap((c) => c.items.map((i) => ({ ...i, client: c })));
  const max = Math.max(...items.map((i) => i.amount.cent), ...v.announced.map((a) => a.amount.cent), 1);
  const none = v.deductions.filter((c) => !c.total).map((c) => c.name);
  return (
    <Card
      question="Was wird ohne Vertragspunkt abgezogen?"
      info="Sätze auf den Zahlungsavisos, die der Vertrag des Projekts nicht nennt. Ob Sie widersprechen, entscheiden Sie; tieout bewertet das nicht rechtlich."
      figure={d?.lead.total.text ?? "kein Abzug"}
      label={d ? `${d.lead.kinds} von ${d.lead.name}, in ${d.lead.projects === 1 ? "1 Projekt" : `${d.lead.projects} Projekten`}` : "in keinem Projekt"}
      says={d?.text}
    >
      <ul>
        {items.map((i) => (
          <Row key={`${i.client.href}${i.project}${i.kind}`} className="grid-cols-[minmax(0,1fr)_200px_120px] max-md:grid-cols-[minmax(0,1fr)_auto]">
            <span className="flex min-w-0 flex-col">
              <span className="truncate">{i.project}</span>
              <span className="text-xs text-fg-muted">
                {i.kind}, {i.invoices}
              </span>
            </span>
            <Bar share={i.amount.cent / max} className="max-md:hidden" />
            <span className="text-right tabular-nums">{i.amount.text}</span>
          </Row>
        ))}
        {v.announced.map((a) => (
          <Row key={`${a.project.href}${a.kind}`} className="grid-cols-[minmax(0,1fr)_200px_120px] max-md:grid-cols-[minmax(0,1fr)_auto]">
            <span className="flex min-w-0 flex-col">
              <Link href={a.project.href} className={cn(quiet, "truncate")}>
                {a.project.name}
              </Link>
              <span className="text-xs text-fg-muted">
                angekündigt, {a.kind} {a.rate}
              </span>
            </span>
            <span aria-hidden className="h-1.5 rounded-full bg-[repeating-linear-gradient(135deg,var(--color-fg-faint)_0_2px,transparent_2px_5px)] shadow-[inset_0_0_0_1px_var(--color-fg-faint)] max-md:hidden" style={{ width: `${(a.amount.cent / max) * 100}%` }} />
            <span className="flex flex-col items-end tabular-nums">
              {a.amount.text}
              <span className="flex items-center gap-1 text-xs whitespace-nowrap text-state-red-edge">
                <span aria-hidden className="size-2 rounded-full bg-state-red" />
                Abzug ohne Vertragspunkt
              </span>
            </span>
          </Row>
        ))}
      </ul>
      {none.length > 0 && <span className="text-xs text-fg-muted">{none.join(" und ")}: kein Abzug.</span>}
    </Card>
  );
}
