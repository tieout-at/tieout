"use client";

import Link from "next/link";
import { FileCheck2, Printer, ReceiptText } from "lucide-react";
import { useState } from "react";

import { Tag, type TagColour } from "@/components/table/tag";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DECISION_TEXT, localTime, takeIntoInvoice, type DecisionState } from "@/lib/decisions";
import type { InvoiceFind, InvoiceView as View } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";

const quiet = "link-quiet";
const DECISION_COLOUR: Partial<Record<DecisionState, TagColour>> = { freigegeben: "green", in_schlussrechnung: "green", nicht_verrechnen: "grey" };

/**
 * The tab "Schlussrechnung" of a project (SPEZIFIKATION.md 3.3, 3.4, 4.3, 5.1): what the business enters into its own
 * invoice, how the Auftraggeber will settle it, where he is likely to cut, and the sheet for the final meeting. Every
 * figure is the core's; after a decision in this browser the core's figures over it (live.ts). Prints as it stands.
 */
export function InvoiceView({ built }: { built: View }) {
  const v = useLive()?.invoiceView(built.project.id) ?? built;
  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-10 px-6 py-5 max-md:gap-8 max-md:px-4 print:max-w-none print:px-0">
      <StatusBar v={v} />
      <ChangeList v={v} />
      <Settlement v={v} />
      <Check v={v} />
      <Meeting v={v} />
      {v.notes.length > 0 && (
        <Section id="rechtsfrage" title="Hinweis ohne Betrag">
          {v.notes.map((n) => (
            <div key={n.title} className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
              <Tag className="w-fit">{n.title}</Tag>
              <p className="text-fg-secondary">{n.text}</p>
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}

function Section({ id, title, line, aside, children }: { id: string; title: string; line?: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-3 print:break-inside-avoid-page">
      <div className="flex flex-wrap items-end gap-x-4 gap-y-1">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 id={id} className="text-base font-semibold">
            {title}
          </h2>
          {line && <p className="text-fg-secondary">{line}</p>}
        </div>
        {aside && <div className="ml-auto">{aside}</div>}
      </div>
      {children}
    </section>
  );
}

function FindChip({ f }: { f: InvoiceFind }) {
  return (
    <Link href={f.href} className="inline-flex h-5 shrink-0 items-center rounded-xs bg-fill-subtle px-1 font-mono text-xs shadow-ring outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
      {f.number}
    </Link>
  );
}

function DecisionTag({ state }: { state: DecisionState }) {
  return (
    <Tag colour={DECISION_COLOUR[state]} className="h-5 text-xs">
      {DECISION_TEXT[state]}
    </Tag>
  );
}

function StatusBar({ v }: { v: View }) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const released = v.changes.entries.filter((c) => c.find.decision === "freigegeben").map((c) => c.find);
  const take = () => {
    const zeit = localTime();
    const refused = released.map((f) => takeIntoInvoice([f.key, ...f.earlierKeys], f.decision, zeit).refused).filter(Boolean);
    setAsking(false);
    setNote(refused.length ? `${released.length - refused.length} übernommen, ${refused.length} nicht: ${refused[0]}` : `${released.length === 1 ? "1 Fund steht" : `${released.length} Funde stehen`} jetzt in der Schlussrechnung.`);
  };
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg px-4 py-3 shadow-ring">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-2 font-medium">
          <ReceiptText className="size-4 text-fg-secondary" aria-hidden />
          {v.status.final ? "Alle Funde entschieden" : "Entwurf, nicht freigegeben"}
        </span>
        <span className="text-xs text-fg-secondary">
          {v.status.final
            ? "Die Ausgaben sind endgültig."
            : `${v.status.open} von ${v.status.finds} Funden noch nicht freigegeben oder ausgeschlossen. Bis dahin trägt jeder Ausdruck den Vermerk „Entwurf, nicht freigegeben“.`}
          {v.project.deadline && ` ${v.project.deadline}.`}
        </span>
        {note && (
          <span role="status" className="text-xs text-fg">
            {note}
          </span>
        )}
      </div>
      <div className="ml-auto flex flex-wrap gap-2 print:hidden">
        <Button onClick={() => window.print()}>
          <Printer />
          Drucken
        </Button>
        <Link href={v.project.packagesHref} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
          <FileCheck2 className="size-4 text-fg-secondary" aria-hidden />
          Beweispakete
        </Link>
        {released.length > 0 && (
          <Button variant="primary" onClick={() => setAsking(true)}>
            In die Schlussrechnung übernehmen
          </Button>
        )}
      </div>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent dim className="top-[24vh] max-w-96 p-3">
          <DialogTitle className="pb-1 text-sm">In die Schlussrechnung übernehmen?</DialogTitle>
          <p className="text-xs text-fg-secondary">
            {released.length === 1 ? "1 freigegebener Fund kommt" : `${released.length} freigegebene Funde kommen`} auf „In der Schlussrechnung“. Die Positionen der Änderungsliste tragen Sie selbst in Ihr Rechnungsprogramm ein;
            tieout schreibt keine zweite Rechnung und schickt nichts an {v.project.client.name}. Vermerkt als Entscheidung der Abrechnung, vorerst nur in diesem Browser gespeichert.
          </p>
          <ul className="mt-2 flex flex-col gap-1 text-xs">
            {released.map((f) => (
              <li key={f.key} className="flex items-center gap-2">
                <span className="font-mono">{f.number}</span>
                <span className="truncate">{f.name}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-end gap-2">
            <Button onClick={() => setAsking(false)}>Abbrechen</Button>
            <Button variant="primary" onClick={take}>
              Übernehmen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const table = "overflow-hidden rounded-lg shadow-ring";
const headRow = "grid h-9 items-center text-xs text-fg-secondary shadow-line-bottom max-lg:hidden";

function ChangeList({ v }: { v: View }) {
  const cols = "lg:grid-cols-[110px_minmax(0,1fr)_110px_110px_120px]";
  return (
    <Section
      id="aenderungsliste"
      title="Änderungsliste"
      line="Neue Positionen für Ihre Schlussrechnung, jede mit ihrem Beweispaket. Sie tragen sie in Ihr Rechnungsprogramm ein; tieout schreibt keine zweite Rechnung."
    >
      <div className={table}>
        <div className={cn(headRow, cols)}>
          <span className="px-3">Position</span>
          <span className="px-3">Leistung</span>
          <span className="px-3 text-right">Menge</span>
          <span className="px-3 text-right">Einheitspreis</span>
          <span className="px-3 text-right">Betrag</span>
        </div>
        {v.changes.entries.map((c) => (
          <div key={c.find.key} className="[&:not(:last-child)]:shadow-line-bottom">
            <div className="flex min-h-10 flex-wrap items-center gap-x-2 gap-y-1 bg-fill-subtle px-3 py-1.5">
              <FindChip f={c.find} />
              <Link href={c.find.href} className={cn(quiet, "min-w-0 truncate font-medium max-md:line-clamp-2 max-md:whitespace-normal")}>
                {c.find.name}
              </Link>
              <DecisionTag state={c.find.decision} />
              {c.risk && (
                <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
                  <span aria-hidden className="size-2 rounded-full bg-state-red" />
                  Kürzungsrisiko: {c.risk.reason}
                </span>
              )}
              <Link href={c.find.packageHref} className={cn(quiet, "ml-auto text-xs print:hidden")}>
                Beweispaket
              </Link>
            </div>
            {c.items.map((i) => (
              <div key={i.position} className={cn("grid min-h-10 items-center py-1.5 max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:gap-x-3 max-lg:gap-y-0.5 max-lg:px-3", cols)}>
                <span className={cn("px-3 max-lg:px-0", /^S+$/.test(i.position) ? "font-mono text-xs" : "text-xs text-fg-secondary")}>{i.position}</span>
                <span className="min-w-0 px-3 text-fg-secondary max-lg:order-3 max-lg:col-span-2 max-lg:px-0 max-lg:text-xs">{i.text}</span>
                <span className="px-3 text-right tabular-nums max-lg:hidden">{i.quantity ?? ""}</span>
                <span className="px-3 text-right tabular-nums max-lg:hidden">{i.price?.text ?? ""}</span>
                <span className="px-3 text-right tabular-nums max-lg:col-start-2 max-lg:row-start-1 max-lg:px-0">
                  {i.amount.text}
                  {i.quantity && i.price && (
                    <span className="block text-xs text-fg-muted lg:hidden">
                      {i.quantity} × {i.price.text}
                    </span>
                  )}
                </span>
              </div>
            ))}
            {c.items.length > 1 && (
              <div className="flex min-h-9 items-center justify-end gap-3 px-3 text-xs text-fg-secondary shadow-[inset_0_1px_0_0_var(--color-line)]">
                {c.find.number} zusammen <span className="text-sm font-semibold text-fg tabular-nums">{c.amount.text}</span>
              </div>
            )}
          </div>
        ))}
        <Total label="zusätzlich verrechenbar" amount={v.changes.total.text} line={v.changes.risk.cent ? `davon mit Kürzungsrisiko ${v.changes.risk.text}` : undefined} />
      </div>
      {v.pending.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm text-fg-secondary">Noch nicht in der Änderungsliste: in Klärung</h3>
          <div className={table}>
            {v.pending.map((x) => (
              <div key={x.find.key} className="flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 px-3 py-2 [&:not(:last-child)]:shadow-line-bottom">
                <FindChip f={x.find} />
                <Link href={x.find.href} className={cn(quiet, "min-w-0 truncate max-md:line-clamp-2 max-md:whitespace-normal")}>
                  {x.find.name}
                </Link>
                <Tag colour={x.stand === "Beleg fehlt" ? "yellow" : "orange"} className="h-5 text-xs">
                  {x.stand}
                </Tag>
                <span className="ml-auto tabular-nums">{x.amount.text}</span>
                {x.remedy && <span className="w-full pl-9 text-xs text-fg-muted">Abhilfe: {x.remedy}</span>}
              </div>
            ))}
            <Total label="in Klärung" amount={v.pendingTotal.text} line="nie zu zusätzlich verrechenbar addiert" />
          </div>
        </div>
      )}
    </Section>
  );
}

function Total({ label, amount, line }: { label: string; amount: string; line?: string }) {
  return (
    <div className="flex min-h-11 flex-wrap items-center justify-end gap-x-3 px-3 py-2 shadow-[inset_0_1px_0_0_var(--color-line)]">
      <span className="text-xs text-fg-secondary">{label}</span>
      <span className="font-semibold tabular-nums">{amount}</span>
      {line && <span className="w-full text-right text-xs text-fg-muted">{line}</span>}
    </div>
  );
}

const CHECK_COLOUR = { laut_vertrag: "green", abweichung: "orange", abzug_ohne_vertragspunkt: "red" } as const;

function Settlement({ v }: { v: View }) {
  const s = v.settlement;
  return (
    <Section id="rechnungsabschluss" title="Rechnungsabschluss" line={`So wird ${v.project.client.name} die Schlussrechnung abrechnen. Alle Beträge netto.`}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ol className={table}>
          {s.lines.map((l, i) => {
            const sum = l.kind === "summe" || l.kind === "ergebnis";
            return (
              <li
                key={`${l.label}-${i}`}
                className={cn(
                  "flex min-h-10 items-center gap-x-2 gap-y-1 px-3 py-1.5 [&:not(:last-child)]:shadow-line-bottom",
                  l.kind !== "fund" && "flex-wrap",
                  sum && "bg-fill-subtle font-semibold",
                  l.kind === "fund" && "pl-6",
                  l.kind === "ergebnis" && "min-h-12 text-base",
                )}
              >
                {l.find && <FindChip f={l.find} />}
                <span className={cn("min-w-0", l.kind === "fund" && "flex-1 truncate font-normal max-md:line-clamp-2 max-md:whitespace-normal")}>
                  {l.label}
                  {l.rate && <span className="font-normal text-fg-secondary"> {l.rate}</span>}
                </span>
                {l.find && (
                  <span className="max-md:hidden">
                    <DecisionTag state={l.find.decision} />
                  </span>
                )}
                {l.check && (
                  <Tag colour={CHECK_COLOUR[l.check.state]} className="h-5 text-xs font-normal">
                    {l.check.text}
                  </Tag>
                )}
                <span className="ml-auto shrink-0 tabular-nums">{l.amount.text}</span>
              </li>
            );
          })}
        </ol>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
            <span className="text-xs text-fg-secondary">Restforderung laut Vertrag</span>
            <span className="text-xl font-semibold tabular-nums">{s.contract.restforderung.text}</span>
            <span className="text-xs text-fg-muted">
              Dieselbe Rechnung ohne {s.contract.difference.map((d) => d.label).join(" und ") || "Abzüge ohne Vertragspunkt"}: der Vertrag nennt dafür keinen Punkt. Ob Sie widersprechen, entscheiden Sie.
            </span>
          </div>
          <div className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
            <span className="text-xs text-fg-secondary">Zahlungen nachgerechnet</span>
            <ul className="flex flex-col">
              {s.payments.map((p) => (
                <li key={p.invoice} className="flex min-h-9 items-center gap-2 text-xs [&:not(:last-child)]:shadow-line-bottom">
                  <span className="min-w-0 flex-1">
                    {p.invoice}
                    <span className="block text-fg-muted">bezahlt am {p.paidOn}</span>
                  </span>
                  <span className="tabular-nums">{p.paid.text}</span>
                  <Tag colour={p.ok ? "green" : "red"} className="h-5 text-xs">
                    {p.ok ? "stimmt" : "weicht ab"}
                  </Tag>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Check({ v }: { v: View }) {
  const c = v.check;
  return (
    <Section id="vorpruefung" title="Vorprüfung" line={`Vorab geprüft wie von ${v.project.client.name}: wo gekürzt werden könnte, mit Abhilfe. Überschneidet sich mit zusätzlich verrechenbar, wird nie dazugezählt.`}>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Vorprüfung", amount: c.total.text, line: `${c.risks.length} Positionen` },
          { label: "Kürzung droht", amount: c.threatened.text, line: "jetzt noch zu beheben" },
          { label: "schon gekürzt", amount: c.alreadyCut.text, line: "steht noch im Entwurf" },
        ].map((m) => (
          <div key={m.label} className="flex flex-col gap-0.5">
            <span className="text-xs text-fg-secondary">{m.label}</span>
            <span className="text-xl font-semibold tabular-nums">{m.amount}</span>
            <span className="text-xs text-fg-muted">{m.line}</span>
          </div>
        ))}
      </div>
      <div className={table}>
        {c.risks.map((r) => (
          <div key={r.number} className="flex flex-col gap-1 px-3 py-2.5 [&:not(:last-child)]:shadow-line-bottom">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="inline-flex h-5 items-center rounded-xs bg-fill-subtle px-1 font-mono text-xs shadow-ring">{r.number}</span>
              <span aria-hidden className={cn("size-2 rounded-full", r.alreadyCut ? "bg-state-grey" : "bg-state-red")} />
              <span className="font-medium">{r.reason}</span>
              {r.find ? (
                <Link href={r.find.href} className={cn(quiet, "text-fg-secondary")}>
                  {r.about}
                </Link>
              ) : (
                <span className="text-fg-secondary">{r.about}</span>
              )}
              <Tag className="h-5 text-xs">{r.alreadyCut ? "schon gekürzt" : "droht"}</Tag>
              <span className="ml-auto tabular-nums">{r.amount.text}</span>
            </span>
            <span className="text-xs text-fg-secondary">{r.detail}</span>
            <span className="text-xs">Abhilfe: {r.remedy}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Meeting({ v }: { v: View }) {
  const m = v.meeting;
  const cols = "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_120px]";
  return (
    <Section
      id="schlussbesprechung"
      title="Schlussbesprechungs-Blatt"
      line="Für das Gespräch nach der Schlussrechnung: je Fund die Forderung und die Untergrenze. Die einzige Stelle, an der zusätzlich verrechenbar und in Klärung gemeinsam stehen."
    >
      <div className={table}>
        <div className={cn(headRow, cols)}>
          <span className="px-3">Fund</span>
          <span className="px-3">Untergrenze gerechnet als</span>
          <span className="px-3 text-right">Forderung</span>
          <span className="px-3 text-right">Untergrenze</span>
        </div>
        {m.groups.map((g) => (
          <div key={g.stand} className="[&:not(:last-child)]:shadow-line-bottom">
            <div className="flex h-8 items-center gap-2 bg-fill-subtle px-3 text-xs text-fg-secondary">
              <Tag colour={g.stand === "belegt" ? "green" : g.stand === "beleg_fehlt" ? "yellow" : "orange"} className="h-5 text-xs">
                {g.label}
              </Tag>
              <span className="ml-auto">Spielraum {g.room.text}</span>
            </div>
            {g.items.map((i) => (
              <div key={i.find.key} className={cn("grid min-h-10 items-center py-1.5 max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:gap-x-3 max-lg:gap-y-0.5 max-lg:px-3", cols)}>
                <span className="flex min-w-0 items-center gap-2 px-3 max-lg:px-0">
                  <FindChip f={i.find} />
                  <Link href={i.find.href} className={cn(quiet, "min-w-0 truncate")}>
                    {i.find.name}
                  </Link>
                </span>
                <span className="px-3 text-xs text-fg-secondary max-lg:order-3 max-lg:col-span-2 max-lg:px-0">{i.how}</span>
                <span className="px-3 text-right tabular-nums max-lg:px-0">
                  {i.claim.text}
                  <span className="block text-xs text-fg-muted lg:hidden">Untergrenze {i.floor.text}</span>
                </span>
                <span className="px-3 text-right tabular-nums text-fg-secondary max-lg:hidden">{i.floor.text}</span>
              </div>
            ))}
          </div>
        ))}
        <div className={cn("grid min-h-11 items-center bg-fill-subtle py-2 font-semibold shadow-[inset_0_1px_0_0_var(--color-line)] max-lg:flex max-lg:flex-wrap max-lg:gap-x-3 max-lg:px-3", cols)}>
          <span className="px-3 max-lg:px-0">Zusammen</span>
          <span className="px-3 text-xs font-normal text-fg-secondary max-lg:px-0">Spielraum {m.room.text}</span>
          <span className="px-3 text-right tabular-nums max-lg:ml-auto max-lg:px-0">{m.claim.text}</span>
          <span className="px-3 text-right tabular-nums text-fg-secondary max-lg:w-full max-lg:px-0 max-lg:text-xs">
            <span className="lg:hidden">Untergrenze </span>
            {m.floor.text}
          </span>
        </div>
      </div>
      <p className="text-xs text-fg-muted">Untergrenze: Stunden zu Mittellohnkosten und Material zum Einstandspreis, Mehrmengen zum Einheitspreis des Vertrags. Annahme, von einem Baufachmann noch zu bestätigen.</p>
    </Section>
  );
}
