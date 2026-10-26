"use client";

import Link from "next/link";
import { ChevronRight, FileCheck2, Printer } from "lucide-react";
import { useEffect, useState } from "react";

import { Tag, type TagColour } from "@/components/table/tag";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InfoTip } from "@/components/ui/info-tip";
import { DECISION_TEXT, localTime, takeIntoInvoice, type DecisionState } from "@/lib/decisions";
import type { ChangeEntry, InvoiceFind, InvoiceView as View } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import { cn } from "@/lib/utils";

const quiet = "link-quiet";
const DECISION_COLOUR: Partial<Record<DecisionState, TagColour>> = { freigegeben: "green", in_schlussrechnung: "green", nicht_verrechnen: "grey" };
const decided = (d: DecisionState) => d === "freigegeben" || d === "in_schlussrechnung" || d === "nicht_verrechnen";

type Panel = "aenderungsliste" | "rechnungsabschluss" | "vorpruefung" | "schlussbesprechung";
const PANELS: Panel[] = ["aenderungsliste", "rechnungsabschluss", "vorpruefung", "schlussbesprechung"];

/**
 * The tab "Schlussrechnung" of a project, chosen with Maxi S. after the design round of step 8 (draft A with the head of
 * draft B): one question with the decisions as its answer, three figures, then four sub-tabs so that only one part shows
 * at a time; the rule behind a figure sits behind an info icon. Every figure is the core's; after a decision in this
 * browser the core's figures over it (live.ts). Printing shows every part, marked internal.
 */
export function InvoiceView({ built }: { built: View }) {
  const v = useLive()?.invoiceView(built.project.id) ?? built;
  const [panel, setPanel] = useState<Panel>("aenderungsliste");
  // the sub-tab is in the address, so a link or the back button can open it
  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as Panel;
      if (PANELS.includes(h)) setPanel(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  const open = (p: Panel) => {
    setPanel(p);
    window.history.replaceState(null, "", `#${p}`);
  };
  const tabs: { id: Panel; title: string; count?: number }[] = [
    { id: "aenderungsliste", title: "Änderungsliste", count: v.changes.entries.length },
    { id: "rechnungsabschluss", title: "Rechnungsabschluss" },
    { id: "vorpruefung", title: "Vorprüfung", count: v.check.risks.length },
    { id: "schlussbesprechung", title: "Schlussbesprechungs-Blatt" },
  ];
  const shown = (p: Panel) => cn(panel === p ? "flex" : "hidden print:flex", "flex-col gap-4 print:break-before-page");

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-5 px-6 py-5 max-md:px-4 print:max-w-none print:px-0">
      <p className="hidden text-xs font-medium print:block">Intern, nicht für {v.project.client.name}: mit Vorprüfung, Kalkulation und Untergrenzen. Für den Auftraggeber sind die Beweispakete.</p>
      <StatusHead v={v} />
      <Figures v={v} />
      <div role="tablist" aria-label="Teile der Schlussrechnung" className="flex items-center gap-1 overflow-x-auto pb-2 shadow-line-bottom print:hidden">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={panel === t.id}
            aria-controls={`teil-${t.id}`}
            onClick={() => open(t.id)}
            className={cn(
              "flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 whitespace-nowrap outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0",
              panel === t.id ? "bg-sidebar text-fg shadow-ring hover:bg-sidebar" : "text-fg-secondary",
            )}
          >
            {t.title}
            {t.count !== undefined && <span className="text-xs text-fg-muted tabular-nums">{t.count}</span>}
          </button>
        ))}
      </div>
      <section role="tabpanel" id="teil-aenderungsliste" aria-labelledby="tab-aenderungsliste" className={shown("aenderungsliste")}>
        <ChangeList v={v} />
      </section>
      <section role="tabpanel" id="teil-rechnungsabschluss" aria-labelledby="tab-rechnungsabschluss" className={shown("rechnungsabschluss")}>
        <Settlement v={v} />
      </section>
      <section role="tabpanel" id="teil-vorpruefung" aria-labelledby="tab-vorpruefung" className={shown("vorpruefung")}>
        <Check v={v} />
      </section>
      <section role="tabpanel" id="teil-schlussbesprechung" aria-labelledby="tab-schlussbesprechung" className={shown("schlussbesprechung")}>
        <Meeting v={v} />
      </section>
    </div>
  );
}

function FindChip({ f }: { f: InvoiceFind }) {
  return (
    <Link href={f.href} className="inline-flex h-5 shrink-0 items-center rounded-xs bg-fill-subtle px-1 font-mono text-xs shadow-ring outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent">
      {f.number}
    </Link>
  );
}

/** The decision of a find, named only once it is more than "Gefunden" (every find starts there). */
function DecisionTag({ state }: { state: DecisionState }) {
  if (state === "gefunden") return null;
  return (
    <Tag colour={DECISION_COLOUR[state]} className="h-5 text-xs">
      {DECISION_TEXT[state]}
    </Tag>
  );
}

/** "Kann die Rechnung raus?": the decisions as the answer, one field per find, and the actions. */
function StatusHead({ v }: { v: View }) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const done = v.status.all.filter((f) => decided(f.decision)).length;
  const released = v.status.all.filter((f) => f.decision === "freigegeben");
  const says = v.status.final
    ? "Ja. Alle Funde sind entschieden, die Ausdrucke sind endgültig."
    : released.length
      ? `${v.status.open === 1 ? "1 Fund ist" : `${v.status.open} Funde sind`} noch offen. Freigegebene Funde können Sie schon übernehmen.`
      : "Noch nicht. Bis alle Funde entschieden sind, trägt jeder Ausdruck „Entwurf, nicht freigegeben“.";
  const take = () => {
    const zeit = localTime();
    const refused = released.map((f) => takeIntoInvoice([f.key, ...f.earlierKeys], f.decision, zeit).refused).filter(Boolean);
    setAsking(false);
    setNote(refused.length ? `${released.length - refused.length} übernommen, ${refused.length} nicht: ${refused[0]}` : `${released.length === 1 ? "1 Fund steht" : `${released.length} Funde stehen`} jetzt in der Schlussrechnung.`);
  };
  return (
    <div className="grid gap-x-8 gap-y-4 pt-2 md:grid-cols-[minmax(0,1fr)_auto]">
      <div className="flex min-w-0 flex-col gap-1">
        <span className="text-fg-secondary">Kann die Rechnung raus?</span>
        <span className="flex items-baseline gap-2.5">
          <span className="text-4xl leading-10 font-semibold tracking-tight tabular-nums">
            {done} von {v.status.finds}
          </span>
          <span className="text-lg text-fg-muted">entschieden</span>
        </span>
        <span role="img" aria-label={v.status.all.map((f) => `${f.number} ${DECISION_TEXT[f.decision]}`).join(", ")} className="mt-2 grid max-w-[520px] gap-1" style={{ gridTemplateColumns: `repeat(${v.status.all.length}, minmax(0, 1fr))` }}>
          {v.status.all.map((f) => (
            <span key={f.key} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  "h-2 w-full rounded-[3px] shadow-[inset_0_0_0_1px_rgb(10_16_32/0.1)]",
                  f.decision === "freigegeben" || f.decision === "in_schlussrechnung" ? "bg-state-green" : f.decision === "nicht_verrechnen" ? "bg-state-grey" : f.decision === "geprueft" ? "bg-fg/25" : "bg-fill-hover",
                )}
              />
              <span className="font-mono text-[11px] leading-3 text-fg-muted">{f.number}</span>
            </span>
          ))}
        </span>
        <p className="mt-2">{says}</p>
        {note && (
          <p role="status" className="text-xs text-fg-secondary">
            {note}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 max-md:items-stretch print:hidden">
        <div className="flex flex-wrap gap-2 max-md:justify-start">
          <Button onClick={() => window.print()}>
            <Printer />
            Drucken
          </Button>
          <Link href={v.project.packagesHref} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
            <FileCheck2 className="size-4 text-fg-secondary" aria-hidden />
            Beweispakete
          </Link>
          <Button variant={released.length ? "primary" : "secondary"} disabled={!released.length} onClick={() => setAsking(true)} aria-describedby={released.length ? undefined : "uebernehmen-hinweis"}>
            In die Schlussrechnung übernehmen
          </Button>
        </div>
        {!released.length && (
          <span id="uebernehmen-hinweis" className="text-xs text-fg-muted">
            erst nach der Freigabe eines Funds
          </span>
        )}
        {!v.status.final && (
          <Tag className="mt-1 h-5 w-fit text-xs max-md:self-start">
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-2 rounded-full bg-state-grey" />
              Entwurf, nicht freigegeben
            </span>
          </Tag>
        )}
      </div>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent dim className="top-[24vh] max-w-96 p-3">
          <DialogTitle className="pb-1 text-sm">In die Schlussrechnung übernehmen?</DialogTitle>
          <p className="text-xs text-fg-secondary">
            {released.length === 1 ? "1 freigegebener Fund kommt" : `${released.length} freigegebene Funde kommen`} auf „In der Schlussrechnung“. Die Positionen tragen Sie selbst in Ihr Rechnungsprogramm ein; tieout
            schreibt keine zweite Rechnung und schickt nichts an {v.project.client.name}. Vorerst nur in diesem Browser gespeichert.
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

function Figures({ v }: { v: View }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid overflow-hidden rounded-lg shadow-ring sm:grid-cols-3">
        {[
          {
            label: "zusätzlich verrechenbar",
            amount: v.changes.total.text,
            line: v.changes.risk.cent ? (
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="size-2 rounded-full bg-state-red" />
                davon mit Kürzungsrisiko <span className="text-fg tabular-nums">{v.changes.risk.text}</span>
              </span>
            ) : null,
          },
          {
            label: "in Klärung",
            amount: v.pendingTotal.text,
            line: (
              <span className="flex items-center gap-1.5">
                nicht addiert
                <InfoTip label="in Klärung">Funde, denen ein Beleg oder ein Nachtrag fehlt. Sie werden nie zu zusätzlich verrechenbar addiert und kommen erst mit Beleg oder Nachtrag in die Änderungsliste.</InfoTip>
              </span>
            ),
          },
          {
            label: "Restforderung",
            amount: v.settlement.restforderung.text,
            line: (
              <span>
                laut Vertrag <span className="text-fg tabular-nums">{v.settlement.contract.restforderung.text}</span>
              </span>
            ),
          },
        ].map((f) => (
          <div key={f.label} className="flex flex-col gap-0.5 px-4 py-3 [&:not(:last-child)]:shadow-[inset_-1px_0_0_0_var(--color-line)] max-sm:[&:not(:last-child)]:shadow-line-bottom">
            <span className="text-xs text-fg-secondary">{f.label}</span>
            <span className="text-xl font-semibold tabular-nums">{f.amount}</span>
            <span className="text-xs text-fg-secondary">{f.line}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-fg-muted">tieout sendet nichts an den Auftraggeber. Alle Beträge netto.</p>
    </div>
  );
}

const table = "overflow-hidden rounded-lg shadow-ring";
const cols = "lg:grid-cols-[44px_120px_minmax(0,1fr)_80px_100px_110px_32px]";

function Intro({ text, info }: { text: string; info?: string }) {
  return (
    <p className="flex items-center gap-1.5 text-fg-secondary">
      {text}
      {info && <InfoTip label={text}>{info}</InfoTip>}
    </p>
  );
}

function ChangeRow({ c }: { c: ChangeEntry }) {
  const [open, setOpen] = useState(false);
  const single = c.items.length === 1 && c.items[0].quantity !== null;
  const item = c.items[0];
  return (
    <li className="[&:not(:last-child)]:shadow-line-bottom">
      <div className={cn("grid min-h-12 items-center gap-x-3 px-3 py-1.5 max-lg:grid-cols-[auto_minmax(0,1fr)_auto] max-lg:gap-y-1", cols)}>
        <FindChip f={c.find} />
        {single ? (
          <span className="font-mono text-xs max-lg:hidden">{item.position}</span>
        ) : (
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex w-fit items-center gap-1 rounded-md pr-1.5 text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-lg:relative max-lg:order-4 max-lg:col-span-3 max-lg:before:absolute max-lg:before:-inset-y-2 max-lg:before:inset-x-0"
          >
            <ChevronRight className={cn("size-4 transition-transform", open && "rotate-90")} aria-hidden />
            {c.items.length > 1 ? `${c.items.length} Positionen` : item.position}
          </button>
        )}
        <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5">
          <Link href={c.find.href} className={cn(quiet, "min-w-0 truncate max-lg:line-clamp-2 max-lg:whitespace-normal")}>
            {c.find.name}
          </Link>
          {c.risk && (
            <span className="flex shrink-0 items-center gap-1 text-xs text-state-red-edge">
              <span aria-hidden className="size-2 rounded-full bg-state-red" />
              Kürzungsrisiko
            </span>
          )}
          <DecisionTag state={c.find.decision} />
        </span>
        <span className="text-right tabular-nums max-lg:hidden">{single ? item.quantity : ""}</span>
        <span className="text-right tabular-nums max-lg:hidden">{single ? item.price?.text : ""}</span>
        <span className="text-right tabular-nums">{c.amount.text}</span>
        <Link href={c.find.packageHref} aria-label={`Beweispaket ${c.find.number}`} className="flex size-7 items-center justify-center rounded-md text-fg-muted outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-lg:hidden print:hidden">
          <FileCheck2 className="size-4" aria-hidden />
        </Link>
      </div>
      {open && (
        <ul className="pb-2">
          {c.items.map((i) => (
            <li key={i.position} className={cn("grid min-h-9 items-center gap-x-3 px-3 text-fg-secondary max-lg:grid-cols-[minmax(0,1fr)_auto] max-lg:py-1", cols)}>
              <span className="max-lg:hidden" />
              <span className={cn("max-lg:col-span-2", /^\S+$/.test(i.position) ? "font-mono text-xs" : "text-xs")}>{i.position}</span>
              <span className="min-w-0 text-xs">{i.text}</span>
              <span className="text-right text-xs tabular-nums max-lg:hidden">{i.quantity ?? ""}</span>
              <span className="text-right text-xs tabular-nums max-lg:hidden">{i.price?.text ?? ""}</span>
              <span className="text-right text-xs tabular-nums">{i.amount.text}</span>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

function ChangeList({ v }: { v: View }) {
  return (
    <>
      <Intro text="Neue Positionen für Ihr Rechnungsprogramm, je mit Beweispaket." info="tieout schreibt keine zweite Rechnung: Sie tragen diese Positionen selbst in Ihr Rechnungsprogramm ein." />
      <div className={table}>
        <div className={cn("grid h-9 items-center gap-x-3 px-3 text-xs text-fg-secondary shadow-line-bottom max-lg:hidden", cols)}>
          <span>Fund</span>
          <span>Position</span>
          <span>Leistung</span>
          <span className="text-right">Menge</span>
          <span className="text-right">Einheitspreis</span>
          <span className="text-right">Betrag</span>
          <span />
        </div>
        <ul>
          {v.changes.entries.map((c) => (
            <ChangeRow key={c.find.key} c={c} />
          ))}
        </ul>
        <div className="flex min-h-11 flex-wrap items-center justify-end gap-x-3 bg-fill-subtle px-3 py-2 shadow-[inset_0_1px_0_0_var(--color-line)]">
          {v.changes.risk.cent > 0 && (
            <span className="flex items-center gap-1.5 text-xs text-fg-secondary">
              <span aria-hidden className="size-2 rounded-full bg-state-red" />
              davon mit Kürzungsrisiko <span className="text-fg tabular-nums">{v.changes.risk.text}</span>
            </span>
          )}
          <span className="text-xs text-fg-secondary">zusätzlich verrechenbar</span>
          <span className="font-semibold tabular-nums">{v.changes.total.text}</span>
        </div>
      </div>
      {v.pending.length > 0 && (
        <div className="flex flex-col gap-2 pt-2">
          <h3 className="flex items-center gap-1.5 font-medium">
            In Klärung
            <InfoTip label="In Klärung">Noch nicht in der Änderungsliste: es fehlt ein Beleg oder ein Nachtrag. Nie zu zusätzlich verrechenbar addiert.</InfoTip>
          </h3>
          <ul className={table}>
            {v.pending.map((x) => (
              <li key={x.find.key} className="grid min-h-12 grid-cols-[auto_minmax(0,1fr)_auto_110px] items-center gap-x-3 px-3 py-1.5 [&:not(:last-child)]:shadow-line-bottom max-lg:grid-cols-[auto_minmax(0,1fr)_auto]">
                <FindChip f={x.find} />
                <span className="flex min-w-0 flex-col">
                  <Link href={x.find.href} className={cn(quiet, "truncate max-lg:line-clamp-2 max-lg:whitespace-normal")}>
                    {x.find.name}
                  </Link>
                  {x.remedy && <span className="text-xs text-fg-secondary">{x.remedy}</span>}
                </span>
                <Tag colour={x.stand === "Beleg fehlt" ? "yellow" : "orange"} className="h-5 text-xs max-lg:order-4 max-lg:col-span-2 max-lg:col-start-2 max-lg:w-fit">
                  {x.stand}
                </Tag>
                <span className="text-right tabular-nums">{x.amount.text}</span>
              </li>
            ))}
            <li className="flex min-h-11 items-center justify-end gap-3 bg-fill-subtle px-3 py-2">
              <span className="text-xs text-fg-secondary">in Klärung</span>
              <span className="font-semibold tabular-nums">{v.pendingTotal.text}</span>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}

const CHECK_COLOUR = { laut_vertrag: "green", abweichung: "orange", abzug_ohne_vertragspunkt: "red" } as const;

function Settlement({ v }: { v: View }) {
  const s = v.settlement;
  const [findsOpen, setFindsOpen] = useState(false);
  const [paidOpen, setPaidOpen] = useState(false);
  const findLines = s.lines.filter((l) => l.kind === "fund");
  const ok = s.payments.every((p) => p.ok);
  // the finds of the Änderungsliste follow the Entwurf as one line that opens; the rest of the cascade stays as the core has it
  const rows: React.ReactNode[] = [];
  s.lines.forEach((l, i) => {
    if (l.kind === "fund") {
      if (s.lines[i - 1]?.kind === "fund") return;
      rows.push(
        <li key="aenderungsliste" className="shadow-line-bottom">
          <button
            type="button"
            aria-expanded={findsOpen}
            onClick={() => setFindsOpen(!findsOpen)}
            className="flex min-h-11 w-full items-center gap-2 px-3 py-1.5 text-left outline-none hover:bg-row-hover focus-visible:outline-2 focus-visible:outline-accent"
          >
            <ChevronRight className={cn("size-4 text-fg-secondary transition-transform", findsOpen && "rotate-90")} aria-hidden />
            Änderungsliste, {findLines.length === 1 ? "1 Fund" : `${findLines.length} Funde`}
            <span className="ml-auto tabular-nums">{v.changes.total.text}</span>
          </button>
          {findsOpen && (
            <ul className="pb-2">
              {findLines.map((f) => (
                <li key={f.find?.key ?? f.label} className="flex min-h-9 items-center gap-2 pr-3 pl-9 text-fg-secondary">
                  {f.find && <FindChip f={f.find} />}
                  <span className="min-w-0 truncate text-xs">{f.label}</span>
                  {f.find && <DecisionTag state={f.find.decision} />}
                  <span className="ml-auto text-xs tabular-nums">{f.amount.text}</span>
                </li>
              ))}
            </ul>
          )}
        </li>,
      );
      return;
    }
    const sum = l.kind === "summe" || l.kind === "ergebnis";
    rows.push(
      <li key={`${l.label}-${i}`} className={cn("flex min-h-11 flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1.5 [&:not(:last-child)]:shadow-line-bottom", sum && "bg-fill-subtle font-semibold", l.kind === "ergebnis" && "min-h-12 text-base")}>
        <span className="min-w-0">
          {l.label}
          {l.rate && <span className="font-normal text-fg-secondary"> {l.rate}</span>}
        </span>
        {l.check && (
          <Tag colour={CHECK_COLOUR[l.check.state]} className="h-5 text-xs font-normal">
            {l.check.text}
          </Tag>
        )}
        <span className="ml-auto shrink-0 tabular-nums">{l.amount.text}</span>
      </li>,
    );
  });
  return (
    <>
      <Intro text={`So rechnet ${v.project.client.name} voraussichtlich ab. Alle Beträge netto.`} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ol className={table}>{rows}</ol>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
            <span className="text-xs text-fg-secondary">Restforderung laut Vertrag</span>
            <span className="text-xl font-semibold tabular-nums">{s.contract.restforderung.text}</span>
            <span className="text-xs text-fg-muted">
              Ohne {s.contract.difference.map((d) => d.label).join(" und ") || "Abzüge ohne Vertragspunkt"}: dafür nennt der Vertrag keinen Punkt. Ob Sie widersprechen, entscheiden Sie.
            </span>
          </div>
          <div className="flex flex-col rounded-lg px-4 py-2 shadow-ring">
            <button type="button" aria-expanded={paidOpen} onClick={() => setPaidOpen(!paidOpen)} className="flex min-h-9 items-center gap-2 text-left outline-none focus-visible:outline-2 focus-visible:outline-accent">
              <ChevronRight className={cn("size-4 text-fg-secondary transition-transform", paidOpen && "rotate-90")} aria-hidden />
              <span className="text-xs text-fg-secondary">Zahlungen nachgerechnet</span>
              <Tag colour={ok ? "green" : "red"} className="ml-auto h-5 text-xs">
                {ok ? `alle ${s.payments.length} wie Zahlungsavis` : "weicht ab"}
              </Tag>
            </button>
            {paidOpen && (
              <ul className="flex flex-col pb-1">
                {s.payments.map((p) => (
                  <li key={p.invoice} className="flex min-h-8 items-center gap-2 text-xs [&:not(:last-child)]:shadow-line-bottom">
                    <span className="min-w-0 flex-1">
                      {p.invoice} <span className="text-fg-muted">bezahlt am {p.paidOn}</span>
                    </span>
                    <span className="tabular-nums">{p.paid.text}</span>
                  </li>
                ))}
              </ul>
            )}
            {s.withheld.map((w) => (
              <span key={w.kind} className="flex items-start gap-1.5 pb-1 text-xs text-fg-secondary">
                <span aria-hidden className="mt-1 size-2 shrink-0 rounded-full bg-state-red" />
                Davon schon einbehalten: {w.kind} {w.amount.text}, ohne Vertragspunkt.
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function Check({ v }: { v: View }) {
  const c = v.check;
  return (
    <>
      <Intro text={`Wo ${v.project.client.name} kürzen könnte und was Sie vorher tun.`} info="Die Vorprüfung prüft den eigenen Entwurf so, wie es der Auftraggeber tun wird. Sie überschneidet sich mit zusätzlich verrechenbar und wird nie dazugezählt." />
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
      <ul className={table}>
        {c.risks.map((r) => (
          <li key={r.number} className="flex flex-col gap-1 px-3 py-2.5 [&:not(:last-child)]:shadow-line-bottom">
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
              <Tag className="h-5 text-xs">{r.alreadyCut ? "schon gekürzt" : "Kürzung droht"}</Tag>
              <span className="ml-auto tabular-nums">{r.amount.text}</span>
            </span>
            <span className="text-xs">Abhilfe: {r.remedy}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function Meeting({ v }: { v: View }) {
  const m = v.meeting;
  const mcols = "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_120px_120px]";
  return (
    <>
      <Intro
        text="Für die Schlussbesprechung: je Fund Forderung und Untergrenze."
        info="Die einzige Stelle, an der zusätzlich verrechenbar und in Klärung zusammen stehen: alles, was man im Gespräch nach der Schlussrechnung ansprechen kann. Untergrenze: Stunden zu Mittellohnkosten und Material zum Einstandspreis, Mehrmengen zum Einheitspreis des Vertrags (Annahme der Beispieldaten)."
      />
      <div className={table}>
        <div className={cn("grid h-9 items-center text-xs text-fg-secondary shadow-line-bottom max-md:hidden", mcols)}>
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
              <div key={i.find.key} className={cn("grid min-h-10 items-center py-1.5 max-md:grid-cols-[minmax(0,1fr)_auto] max-md:gap-x-3 max-md:gap-y-0.5 max-md:px-3", mcols)}>
                <span className="flex min-w-0 items-center gap-2 px-3 max-md:px-0">
                  <FindChip f={i.find} />
                  <Link href={i.find.href} className={cn(quiet, "min-w-0 truncate")}>
                    {i.find.name}
                  </Link>
                </span>
                <span className="px-3 text-xs text-fg-secondary max-md:order-3 max-md:col-span-2 max-md:px-0">{i.how}</span>
                <span className="px-3 text-right tabular-nums max-md:px-0">
                  {i.claim.text}
                  <span className="block text-xs text-fg-muted md:hidden">Untergrenze {i.floor.text}</span>
                </span>
                <span className="px-3 text-right text-fg-secondary tabular-nums max-md:hidden">{i.floor.text}</span>
              </div>
            ))}
          </div>
        ))}
        <div className={cn("grid min-h-11 items-center bg-fill-subtle py-2 font-semibold shadow-[inset_0_1px_0_0_var(--color-line)] max-md:flex max-md:flex-wrap max-md:gap-x-3 max-md:px-3", mcols)}>
          <span className="px-3 max-md:px-0">Zusammen, mit in Klärung</span>
          <span className="px-3 text-xs font-normal text-fg-secondary max-md:px-0">Spielraum {m.room.text}</span>
          <span className="px-3 text-right tabular-nums max-md:ml-auto max-md:px-0">{m.claim.text}</span>
          <span className="px-3 text-right text-fg-secondary tabular-nums max-md:w-full max-md:px-0 max-md:text-xs">
            <span className="md:hidden">Untergrenze </span>
            {m.floor.text}
          </span>
        </div>
      </div>
      {v.notes.map((n) => (
        <div key={n.title} className="flex flex-col gap-1 rounded-lg px-4 py-3 shadow-ring">
          <span className="font-medium">Rechtsfrage für die Geschäftsführung</span>
          <p className="text-fg-secondary">{n.text}</p>
        </div>
      ))}
    </>
  );
}
