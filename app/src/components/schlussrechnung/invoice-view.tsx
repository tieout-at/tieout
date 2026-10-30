"use client";

import Link from "next/link";
import { ChevronRight, CircleCheck, FileCheck2, FileSpreadsheet, FolderCheck, Printer } from "lucide-react";
import { useRef, useState } from "react";

import { KpiRow } from "@/components/charts/kpi";
import { keep } from "@/components/charts/tones";
import { Tag, type TagColour } from "@/components/table/tag";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { InfoTip } from "@/components/ui/info-tip";
import { useActor } from "@/lib/account";
import { notYours } from "@/lib/decision-rules";
import { DECISION_TEXT, localTime, readDecisions, readEingaenge, takeIntoInvoice, type DecisionState } from "@/lib/decisions";
import type { ChangeEntry, Gap, InvoiceFind, InvoiceView as View } from "@/lib/invoice";
import { useLive } from "@/lib/live";
import type { Mode } from "@/lib/stairs";
import { cn } from "@/lib/utils";
import { SavedWhere } from "@/components/shell/saved-where";
import { FindWindow } from "./find-window";
import { GapWindow } from "./gap-window";
import { Treppe } from "./treppe";

const quiet = "link-quiet";
const DECISION_COLOUR: Partial<Record<DecisionState, TagColour>> = { freigegeben: "green", in_schlussrechnung: "green", nicht_verrechnen: "grey" };
const decided = (d: DecisionState) => d === "freigegeben" || d === "in_schlussrechnung" || d === "nicht_verrechnen";
const card = "flex min-w-0 flex-col rounded-xl bg-surface shadow-ring";

/**
 * The tab "Schlussrechnung" of a project, rebuilt in step 8d from the council's mix of the two drafts: the decisions as
 * the answer to "Kann die Rechnung raus?", two figures with "zusätzlich verrechenbar" as the money tieout found (never
 * the Restforderung), the Rechnungsabschluss as a staircase (step 14), then what comes into the invoice, what can be cut
 * with "Lücke schließen" at each line, and the sheet for the final meeting. Every figure is the core's; after a decision
 * or a signature that came back the core's figures over it (live.ts). Printing shows every part, marked internal.
 */
export function InvoiceView({ built }: { built: View }) {
  const v = useLive()?.invoiceView(built.project.id) ?? built;
  const [mode, setMode] = useState<Mode>("announced");
  const [findKey, setFindKey] = useState<string | null>(null);
  const [gapKey, setGapKey] = useState<string | null>(null);
  const all = [...v.status.all];
  const find = all.find((f) => f.key === findKey || f.earlierKeys.includes(findKey ?? "")) ?? null;
  const gap = v.gaps.find((g) => g.key === gapKey) ?? null;
  const openGap = (g: Gap) => {
    setFindKey(null);
    setGapKey(g.key);
  };
  const openFind = (f: InvoiceFind) => {
    setGapKey(null);
    setFindKey(f.key);
  };
  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-5 px-6 py-5 max-md:px-4 print:max-w-none print:px-0">
      <p className="hidden text-xs font-medium print:block">Intern, nicht für {v.project.client.name}: mit Vorprüfung, Kalkulation und Untergrenzen. Für den Auftraggeber sind die Beweispakete.</p>
      <StatusHead v={v} />
      <KpiRow
        items={[
          {
            id: "extra",
            label: "zusätzlich verrechenbar",
            value: v.changes.total.text,
            lead: true,
            info: "Funde, die belegt sind und in Ihrem Entwurf fehlen. Das ist das Geld, das tieout gefunden hat.",
            lines: v.changes.risk.cent ? [{ text: `davon mit Kürzungsrisiko ${v.changes.risk.text}`, tone: "risk" }] : [{ text: "ohne Kürzungsrisiko" }],
          },
          {
            id: "unclear",
            label: "in Klärung, nicht addiert",
            value: v.pendingTotal.text,
            info: "Funde, denen ein Beleg oder ein Nachtrag fehlt. Sie werden nie zu zusätzlich verrechenbar addiert und kommen erst mit Beleg oder Nachtrag in die Änderungsliste.",
            lines: [{ text: "wartet auf Beleg oder Nachtrag" }],
          },
        ]}
      />
      <Treppe v={v} mode={mode} setMode={setMode} onFind={openFind} />
      {/* two columns that stack on their own, so neither card is stretched to the height of its neighbour */}
      <div className="grid items-start gap-5 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <ChangeCard v={v} onGap={openGap} />
          <MeetingCard v={v} />
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <CheckCard v={v} onGap={openGap} />
        </div>
      </div>
      <p className="text-xs text-fg-muted">tieout sendet nichts an den Auftraggeber. Alle Beträge netto.</p>
      <FindWindow find={find} v={v} onClose={() => setFindKey(null)} onGap={openGap} />
      <GapWindow gap={gap} onClose={() => setGapKey(null)} />
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

function CardHead({ title, info, figure, right }: { title: string; info?: string; figure?: string; right?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 px-4 pt-3.5 pb-2.5">
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5 text-fg-secondary">
          {title}
          {info && <InfoTip label={title}>{info}</InfoTip>}
        </span>
        {figure && <span className="text-xl font-semibold tracking-tight tabular-nums">{keep(figure)}</span>}
      </span>
      {right}
    </header>
  );
}

/** "Kann die Rechnung raus?": the count, one field per find (green released, grey excluded), the sentence and the actions. */
function StatusHead({ v }: { v: View }) {
  const [asking, setAsking] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const busy = useRef(false);
  const done = v.status.all.filter((f) => decided(f.decision)).length;
  const signatures = v.gaps.filter((g) => g.folder && !g.closed).length;
  const released = v.status.all.filter((f) => f.decision === "freigegeben");
  // the Abrechnung writes the invoice and notes the take-over (the database refuses it to anyone else)
  const notMine = notYours({ stand: "in_schlussrechnung", label: "Übernehmen", wer: "Abrechnung" }, useActor(), null);
  const can = released.length > 0 && !notMine;
  // why the take-over is grey: nothing released yet, or every released find is in already
  const takeOverNote = released.length && notMine ? notMine : v.status.inInvoice ? "Alle freigegebenen Funde sind übernommen" : "Übernehmen geht erst nach der Freigabe eines Funds";
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
  // the writer and the sheets load on the first click only. The file takes the decisions stored in this browser even when
  // the page has not computed them yet (right after loading); one file per click, however fast the clicks come
  const exportFile = async () => {
    if (busy.current) return;
    busy.current = true;
    setExporting(true);
    setNote(null);
    try {
      const decisions = readDecisions();
      const eingaenge = readEingaenge();
      const view = decisions.length || eingaenge.length ? ((await import("@/lib/kern-live")).live(decisions, eingaenge).invoiceView(v.project.id) ?? v) : v;
      (await import("@/lib/invoice-export")).downloadInvoice(view);
    } catch {
      setNote("Die Excel-Datei ließ sich nicht erstellen. Bitte versuchen Sie es noch einmal.");
    } finally {
      // a second click within a second (a double click) gives no second file
      setTimeout(() => {
        busy.current = false;
        setExporting(false);
      }, 1000);
    }
  };
  return (
    <section aria-label="Kann die Rechnung raus?" className={cn(card, "flex-row flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3.5")}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-fg-secondary">Kann die Rechnung raus?</span>
        <span className="text-2xl font-semibold tracking-tight tabular-nums">
          {done} von {v.status.finds} <span className="text-base font-medium text-fg-muted">entschieden</span>
        </span>
        <span className="text-xs text-fg-secondary">{says}</span>
        <span className="mt-1 flex flex-wrap gap-1" aria-hidden>
          {v.status.all.map((f) => (
            <Link
              key={f.key}
              href={f.href}
              tabIndex={-1}
              title={`${f.number} ${DECISION_TEXT[f.decision]}`}
              className={cn(
                "flex h-6 min-w-9 items-center justify-center rounded-[5px] px-1 font-mono text-[11px] transition-colors max-md:h-8 max-md:min-w-11",
                f.decision === "freigegeben" || f.decision === "in_schlussrechnung" ? "bg-money-soft text-state-green-edge shadow-[inset_0_0_0_1px_var(--color-state-green-edge)]" : f.decision === "nicht_verrechnen" ? "bg-fill-hover text-fg-muted line-through" : f.decision === "geprueft" ? "bg-fill-hover text-fg shadow-ring" : "text-fg-muted shadow-ring hover:bg-fill-hover",
              )}
            >
              {f.number}
            </Link>
          ))}
        </span>
        {note && (
          <p role="status" className="text-xs text-fg-secondary">
            {note}
          </p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1.5 max-md:w-full max-md:items-stretch print:hidden">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => window.print()}>
            <Printer />
            Drucken
          </Button>
          <Button onClick={exportFile} disabled={exporting} title={v.status.final ? "Änderungsliste, Rechnungsabschluss, Vorprüfung und Schlussbesprechung als Excel-Datei" : "Als Excel-Datei, bis alle Funde entschieden sind mit „Entwurf, nicht freigegeben“"}>
            <FileSpreadsheet />
            Excel
          </Button>
          <Link href={v.project.packagesHref} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
            <FileCheck2 className="size-4 text-fg-secondary" aria-hidden />
            Beweispakete
          </Link>
          {signatures > 0 && (
            <Link href={v.project.folderHref} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-surface py-1 pr-2 pl-1.5 font-medium shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-8">
              <FolderCheck className="size-4 text-fg-secondary" aria-hidden />
              Mappe
              <span className="font-mono text-xs text-fg-secondary">{signatures}</span>
            </Link>
          )}
          <Button variant={can ? "primary" : "secondary"} disabled={!can} title={can ? undefined : takeOverNote} onClick={() => setAsking(true)} aria-describedby={can ? undefined : "uebernehmen-hinweis"}>
            In die Schlussrechnung übernehmen
          </Button>
        </div>
        <span className="flex items-center gap-2 text-xs text-fg-muted">
          {!can && <span id="uebernehmen-hinweis" className={notMine && released.length ? "text-fg-secondary" : "sr-only"}>{takeOverNote}</span>}
          {!v.status.final && (
            <span className="flex items-center gap-1.5">
              <span aria-hidden className="size-1.5 rounded-full bg-state-grey" />
              Entwurf, nicht freigegeben
            </span>
          )}
        </span>
      </div>
      <Dialog open={asking} onOpenChange={setAsking}>
        <DialogContent dim className="top-[24vh] max-w-96 p-3">
          <DialogTitle className="pb-1 text-sm">In die Schlussrechnung übernehmen?</DialogTitle>
          <p className="text-xs text-fg-secondary">
            {released.length === 1 ? "1 freigegebener Fund kommt" : `${released.length} freigegebene Funde kommen`} auf „In der Schlussrechnung“. Die Positionen tragen Sie selbst in Ihr Rechnungsprogramm ein; tieout
            schreibt keine zweite Rechnung und schickt nichts an {v.project.client.name}. <SavedWhere variant="satz" />
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
    </section>
  );
}

function ChangeRow({ c }: { c: ChangeEntry }) {
  const [open, setOpen] = useState(false);
  const many = c.items.length > 1 || c.items[0].quantity !== null;
  return (
    <li className="[&:not(:last-child)]:shadow-line-bottom">
      <div className="flex min-h-12 items-center gap-2.5 px-4 py-2">
        <FindChip f={c.find} />
        <span className="flex min-w-0 flex-1 flex-col">
          <Link href={c.find.href} className={cn(quiet, "truncate max-md:line-clamp-2 max-md:whitespace-normal")}>
            {c.find.name}
          </Link>
          <span className="flex flex-wrap items-center gap-x-2 text-xs text-fg-muted">
            {many ? (
              <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="relative flex items-center gap-0.5 rounded-sm outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:before:absolute max-md:before:-inset-y-3 max-md:before:inset-x-0">
                <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} aria-hidden />
                {c.items.length > 1 ? `${c.items.length} Positionen` : `Position ${c.items[0].position}`}
              </button>
            ) : (
              <span>{c.items[0].position}</span>
            )}
            {c.risk && (
              <span className="flex items-center gap-1 text-state-red-edge">
                <span aria-hidden className="size-1.5 rounded-full bg-state-red" />
                Kürzungsrisiko {c.risk.amount.cent !== c.amount.cent ? c.risk.amount.text : ""}
              </span>
            )}
            <DecisionTag state={c.find.decision} />
          </span>
        </span>
        <span className="shrink-0 tabular-nums">{keep(c.amount.text)}</span>
        <Link href={c.find.packageHref} aria-label={`Beweispaket ${c.find.number}`} className="flex size-7 shrink-0 items-center justify-center rounded-md text-fg-muted outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:hidden print:hidden">
          <FileCheck2 className="size-4" aria-hidden />
        </Link>
      </div>
      {open && (
        <ul className="pb-2">
          {c.items.map((i) => (
            <li key={i.position} className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 pr-12 pl-14 text-xs text-fg-secondary max-md:pr-4 max-md:pl-11">
              <span className="min-w-0 truncate">
                <span className="font-mono">{i.position}</span> {i.text}
              </span>
              <span className="text-right tabular-nums whitespace-nowrap">
                {i.quantity ? `${i.quantity} × ${i.price?.text ?? ""} = ` : ""}
                <span className="text-fg">{keep(i.amount.text)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {/* print shows the positions of every find */}
      <ul className="hidden pb-2 print:block">
        {!open &&
          c.items.map((i) => (
            <li key={i.position} className="flex justify-between pr-4 pl-14 text-xs">
              <span>
                {i.position} {i.text}
              </span>
              <span>{i.amount.text}</span>
            </li>
          ))}
      </ul>
    </li>
  );
}

/** "Was kommt dazu?": the Änderungsliste, one row per find (positions open on click), and apart what is still in Klärung. */
function ChangeCard({ v, onGap }: { v: View; onGap: (g: Gap) => void }) {
  return (
    <section id="aenderungsliste" aria-label="Was kommt dazu?" className={card}>
      <CardHead title="Was kommt dazu?" info="Neue Positionen für Ihr Rechnungsprogramm, je mit Beweispaket. tieout schreibt keine zweite Rechnung: Sie tragen diese Positionen selbst ein." right={<span className="pt-0.5 text-xs text-fg-muted">Änderungsliste, {v.changes.entries.length === 1 ? "1 Fund" : `${v.changes.entries.length} Funde`}</span>} />
      <ul className="shadow-[inset_0_1px_0_0_var(--color-line)]">
        {v.changes.entries.map((c) => (
          <ChangeRow key={c.find.key} c={c} />
        ))}
      </ul>
      {v.pending.length > 0 && (
        <div className="mt-auto flex flex-col bg-fill-subtle shadow-[inset_0_1px_0_0_var(--color-line)]">
          <p className="flex items-center justify-between gap-2 px-4 pt-3 pb-1 text-xs text-fg-secondary">
            <span className="flex items-center gap-1.5">
              In Klärung, nicht addiert
              <InfoTip label="In Klärung">Noch nicht in der Änderungsliste: es fehlt ein Beleg oder ein Nachtrag. Nie zu zusätzlich verrechenbar addiert.</InfoTip>
            </span>
            <span className="text-fg tabular-nums">{keep(v.pendingTotal.text)}</span>
          </p>
          <ul className="pb-1.5">
            {v.pending.map((x) => (
              <li key={x.find.key} className="flex min-h-11 items-center gap-2.5 px-4 py-1.5">
                <FindChip f={x.find} />
                <span className="flex min-w-0 flex-1 flex-col">
                  <Link href={x.find.href} className={cn(quiet, "truncate text-fg-secondary max-md:line-clamp-2 max-md:whitespace-normal")}>
                    {x.find.name}
                  </Link>
                  <span className="flex items-center gap-1.5 text-xs text-fg-muted">
                    <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", x.stand === "Beleg fehlt" ? "bg-state-yellow" : "bg-state-orange")} />
                    <span className="line-clamp-2">
                      {x.stand}
                      {x.remedy ? `: ${x.remedy}` : ""}
                    </span>
                  </span>
                  <GapLink gap={v.gaps.find((g) => g.find?.key === x.find.key && !g.closed)} onGap={onGap} />
                </span>
                <span className="shrink-0 text-fg-secondary tabular-nums">{keep(x.amount.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** "Was kann gekürzt werden?": the Vorprüfung, what threatens first with its Abhilfe, what was already cut apart below. */
function CheckCard({ v, onGap }: { v: View; onGap: (g: Gap) => void }) {
  const c = v.check;
  const row = (r: View["check"]["risks"][number]) => <CheckRow key={r.number} r={r} gap={v.gaps.find((g) => g.riskKey === r.key && !g.closed)} onGap={onGap} />;
  const closed = v.gaps.filter((g) => g.closed);
  const threat = c.risks.filter((r) => !r.alreadyCut);
  const cut = c.risks.filter((r) => r.alreadyCut);
  return (
    <Foldable id="vorpruefung" title="Was kann gekürzt werden?" info="Die Vorprüfung prüft Ihren Entwurf so, wie es die Software eines Generalunternehmers tun wird. Sie überschneidet sich mit zusätzlich verrechenbar und wird nie dazugezählt." figure={c.threatened.text} right={<span className="pt-0.5 text-xs text-fg-muted">Vorprüfung</span>}>
      <ul className="shadow-[inset_0_1px_0_0_var(--color-line)]">
        {threat.map(row)}
      </ul>
      {cut.length > 0 && (
        <div className="bg-fill-subtle shadow-[inset_0_1px_0_0_var(--color-line)]">
          <p className="px-4 pt-3 pb-1 text-xs text-fg-secondary">
            Schon gekürzt, nicht in {keep(c.threatened.text)}: steht noch im Entwurf
          </p>
          <ul className="pb-1">
            {cut.map(row)}
          </ul>
        </div>
      )}
      {closed.length > 0 && (
        <ul className="shadow-[inset_0_1px_0_0_var(--color-line)]">
          {closed.map((g) => (
            <li key={g.key} className="flex min-h-11 items-center gap-2 px-4 py-1.5 text-xs">
              <CircleCheck className="size-4 shrink-0 text-state-green-edge" aria-hidden />
              <span className="min-w-0 flex-1 text-fg-secondary">
                <span className="text-fg">{g.sheet?.title ?? g.title}</span>: Unterschrift liegt vor
              </span>
              <button type="button" onClick={() => onGap(g)} className="link-quiet shrink-0">
                Ansehen
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-auto px-4 py-2.5 text-xs text-fg-secondary shadow-[inset_0_1px_0_0_var(--color-line)]">
        Vorprüfung, {c.risks.length === 1 ? "1 Position" : `${c.risks.length} Positionen`}: <span className="text-fg tabular-nums">{keep(c.total.text)}</span>, davon Kürzung droht {keep(c.threatened.text)}, schon gekürzt {keep(c.alreadyCut.text)}
      </p>
    </Foldable>
  );
}

/** Opens the window of a gap; nothing where the line has no gap left. */
function GapLink({ gap, onGap }: { gap: Gap | undefined; onGap: (g: Gap) => void }) {
  if (!gap) return null;
  return (
    <button type="button" onClick={() => onGap(gap)} className="relative mt-0.5 w-fit text-xs font-medium text-accent underline-offset-2 outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent max-md:before:absolute max-md:before:-inset-y-3 max-md:before:inset-x-0 print:hidden">
      Lücke schließen
    </button>
  );
}

function CheckRow({ r, gap, onGap }: { r: View["check"]["risks"][number]; gap: Gap | undefined; onGap: (g: Gap) => void }) {
  return (
    <li className="flex items-start gap-2.5 px-4 py-2.5 [&:not(:last-child)]:shadow-line-bottom">
      <span aria-hidden className={cn("mt-1.5 size-2 shrink-0 rounded-full", r.alreadyCut ? "bg-state-grey" : "bg-state-red")} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex flex-wrap items-center gap-x-2">
          <span className="font-medium">{r.reason}</span>
          {r.find ? (
            <Link href={r.find.href} className={cn(quiet, "text-xs text-fg-secondary")}>
              {r.about}
            </Link>
          ) : (
            <span className="text-xs text-fg-secondary">{r.about}</span>
          )}
        </span>
        <span className="text-xs text-fg-secondary">Abhilfe: {r.remedy}</span>
        <GapLink gap={gap} onGap={onGap} />
      </span>
      <span className={cn("shrink-0 tabular-nums", r.alreadyCut && "text-fg-secondary")}>{keep(r.amount.text)}</span>
    </li>
  );
}

const GROUP_DOT: Record<string, string> = { belegt: "bg-state-green", beleg_fehlt: "bg-state-yellow", nachtrag_nicht_gelegt: "bg-state-orange" };

/**
 * "Für die Schlussbesprechung": per find the Forderung and the Untergrenze as two columns, grouped by Belegstand with the
 * room per group in its head. The one total where both money words meet stays behind a click, marked as meant for the
 * meeting only.
 */
function MeetingCard({ v }: { v: View }) {
  const m = v.meeting;
  const [total, setTotal] = useState(false);
  const cols = "grid grid-cols-[minmax(0,1fr)_96px_96px] items-center gap-x-3 max-md:grid-cols-[minmax(0,1fr)_auto]";
  return (
    <Foldable id="schlussbesprechung" title="Für die Schlussbesprechung" info="Je Fund die Forderung und die Untergrenze, unter die Sie nicht gehen müssen. Untergrenze: Stunden zu Mittellohnkosten und Material zum Einstandspreis, Mehrmengen zum Einheitspreis des Vertrags (Annahme der Beispieldaten). Wie die Untergrenze je Fund gerechnet ist, zeigt der Fund beim Zeigen.">
      <div className={cn(cols, "h-8 px-4 text-xs text-fg-muted shadow-[inset_0_1px_0_0_var(--color-line)] max-md:hidden")}>
        <span>Fund</span>
        <span className="text-right">Forderung</span>
        <span className="text-right">Untergrenze</span>
      </div>
      {m.groups.map((g) => (
        <div key={g.stand} className="shadow-[inset_0_1px_0_0_var(--color-line)]">
          <p className="flex h-8 items-center gap-1.5 bg-fill-subtle px-4 text-xs text-fg-secondary">
            <span aria-hidden className={cn("size-1.5 rounded-full", GROUP_DOT[g.stand])} />
            {g.label}
            <span className="ml-auto tabular-nums">Spielraum {keep(g.room.text)}</span>
          </p>
          <ul>
            {g.items.map((i) => (
              <li key={i.find.key} title={i.how} className={cn(cols, "min-h-10 px-4 py-1.5")}>
                <span className="flex min-w-0 items-center gap-2">
                  <FindChip f={i.find} />
                  <Link href={i.find.href} className={cn(quiet, "min-w-0 truncate")}>
                    {i.find.name}
                  </Link>
                </span>
                <span className="text-right tabular-nums whitespace-nowrap">
                  {keep(i.claim.text)}
                  <span className="block text-xs text-fg-muted md:hidden">Untergrenze {keep(i.floor.text)}</span>
                </span>
                <span className="text-right text-fg-secondary tabular-nums whitespace-nowrap max-md:hidden">{keep(i.floor.text)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className="mt-auto flex flex-col gap-2 px-4 py-3 shadow-[inset_0_1px_0_0_var(--color-line)]">
        <button type="button" aria-expanded={total} onClick={() => setTotal(!total)} className="relative flex w-fit items-center gap-1 text-xs text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:before:absolute max-md:before:-inset-y-3 max-md:before:inset-x-0 print:hidden">
          <ChevronRight className={cn("size-3.5 transition-transform", total && "rotate-90")} aria-hidden />
          Summe nur für das Gespräch
        </button>
        <p className={cn("text-xs text-fg-secondary", total ? "block" : "hidden print:block")}>
          Zusammen mit in Klärung: Forderung <span className="text-fg tabular-nums">{keep(m.claim.text)}</span>, Untergrenze <span className="text-fg tabular-nums">{keep(m.floor.text)}</span>, Spielraum <span className="text-fg tabular-nums">{keep(m.room.text)}</span>. Nur für die Schlussbesprechung, nicht für die Rechnung: Was in Klärung ist, kommt erst mit dem fehlenden Beleg oder Nachtrag dazu.
        </p>
        {v.notes.map((n) => (
          <p key={n.title} className="text-xs text-fg-secondary">
            <span className="font-medium text-fg">Rechtsfrage für die Geschäftsführung:</span> {n.text}
          </p>
        ))}
      </div>
    </Foldable>
  );
}

/** A card with its head; on phones its body folds closed until the head is tapped (the page stays short there). */
function Foldable({ id, title, info, figure, right, children }: { id: string; title: string; info?: string; figure?: string; right?: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <section id={id} aria-label={title} className={card}>
      <div className="md:hidden print:hidden">
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="flex min-h-12 w-full items-center gap-2 px-4 py-2 text-left outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent">
          <ChevronRight className={cn("size-4 shrink-0 text-fg-muted transition-transform", open && "rotate-90")} aria-hidden />
          <span className="min-w-0 flex-1 text-fg-secondary">{title}</span>
          {figure && <span className="font-semibold tabular-nums">{keep(figure)}</span>}
        </button>
      </div>
      <div className="max-md:hidden print:block">
        <CardHead title={title} info={info} figure={figure} right={right} />
      </div>
      <div className={cn("flex flex-1 flex-col", !open && "max-md:hidden print:flex")}>{children}</div>
    </section>
  );
}
