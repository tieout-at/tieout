"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { SectionEmpty } from "@/components/shell/empty-state";
import { InfoTip } from "@/components/ui/info-tip";
import { ProjectHead, type ProjectLink } from "./project-head";
import { useLive } from "@/lib/live";
import type { TwinCell, TwinFind, TwinView } from "@/lib/twin";
import { cn } from "@/lib/utils";

/** An amount never breaks before its euro sign. */
const keep = (text: string) => text.replace(/ €/g, " €");
/** Cents of a formatted amount, only to size a bar (the figures themselves stay the core's text). */
const centOf = (text: string) => Number(text.replace(/\D/g, ""));

const STAND_DOT = { belegt: "bg-state-green", beleg_fehlt: "bg-state-yellow", nachtrag_nicht_gelegt: "bg-state-orange" } as const;

const BUCKETS: { key: TwinFind["bucket"]; title: string }[] = [
  { key: "zusaetzlich", title: "zusätzlich verrechenbar" },
  { key: "klaerung", title: "in Klärung" },
  { key: "pauschale", title: "Pauschale laut Vertrag" },
  { key: "nicht_verrechnen", title: "Nicht verrechnen" },
];

const MONEY_WORD: Record<TwinFind["bucket"], string> = {
  zusaetzlich: "zusätzlich verrechenbar, netto, vor Nachlass",
  klaerung: "in Klärung, nicht addiert",
  pauschale: "Pauschale laut Vertrag",
  nicht_verrechnen: "zählt in keiner Summe",
};

/** A cell of the Abgleich in the bar of step 2: grey by how it was invoiced, in its Belegstand colour when a find lies in it. */
function cellClass(c: TwinCell, finds: TwinFind[]): string {
  if (c.state === "fund") {
    const f = finds.find((x) => x.number === c.find);
    return f?.belegstand ? STAND_DOT[f.belegstand.state] : "bg-fg/35";
  }
  return c.state === "menge_abweichend" ? "bg-fg/35" : c.state === "pauschale" ? "bg-fg/[0.07]" : "bg-fg/[0.14]";
}

/** The title without the short name the list already shows, unless the rest would start mid-sentence ("zweiter Pufferspeicher …"). */
function titleOf(f: TwinFind): string {
  const rest = f.title.startsWith(`${f.label}: `) ? f.title.slice(f.label.length + 2) : null;
  return rest && /^[p{Lu}d]/u.test(rest) ? rest : f.title;
}

/** The name of a cell in a chip: the position number, or the Beleg of a service without position ("Regiebericht 9"). */
const cellName = (c: TwinCell) => (c.index === null ? c.label.split(",")[0].split(":")[0] : c.id);

/**
 * "Übersicht" (step 8a, chosen by Maxi S. on 26.10.2026 from three drafts: the trace of draft C, the figure of draft A,
 * the bar of draft B). On top one question with one figure; below, a find chosen on the left shows on the right how
 * tieout comes to its amount along the three steps of the website: the Belege that prove it, its place among all
 * services of the Abgleich, the money. The chosen find is in the address (#f1). After a decision in this browser the
 * core's figures (live.ts).
 */
export function Spur({ view: built, projects }: { view: TwinView; projects: ProjectLink[] }) {
  const view = useLive()?.twinView(built.project.slug) ?? built;
  const finds = view.finds;
  const [chosen, setChosen] = useState(finds[0]?.number ?? null);

  // the find of the address once the page is there; a choice writes it back without a new history entry
  useEffect(() => {
    const read = () => {
      const hit = finds.find((f) => `#${f.number.toLowerCase()}` === window.location.hash);
      if (hit) setChosen(hit.number);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [finds]);
  const choose = (number: string) => {
    setChosen(number);
    window.history.replaceState(null, "", `#${number.toLowerCase()}`);
    // on phones the trace stands below the list: bring it into view
    if (window.innerWidth < 1024) document.getElementById("ue-spur")?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  const find = finds.find((f) => f.number === chosen) ?? finds[0];
  const cells = [...view.abgleich.positions, ...view.abgleich.withoutPosition];
  const proven = finds.filter((f) => f.bucket === "zusaetzlich").length;
  const share = view.money.atRisk ? centOf(view.money.atRisk) / Math.max(centOf(view.money.extra), 1) : 0;

  return (
    <div className="flex flex-col">
      <ProjectHead view={view} projects={projects} />
      <div className="flex w-full max-w-[1120px] flex-col gap-5 px-6 pt-3 pb-12 max-md:px-4">
        {/* the answer: one question, one figure, its part with a Kürzungsrisiko; in Klärung beside it, never added */}
        <section aria-labelledby="ue-frage" className="grid gap-x-10 gap-y-5 rounded-lg bg-surface p-6 shadow-ring max-md:p-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-1">
            <h2 id="ue-frage" className="flex items-center gap-1.5 text-fg-secondary">
              Was bringt der Abgleich?
              <InfoTip label="Was bringt der Abgleich?">
                Die Summe der Funde mit Belegstand „belegt“, die niemand auf „Nicht verrechnen“ gesetzt hat. „Davon mit Kürzungsrisiko“ ist ein Teil davon. „In Klärung“ wird nie dazugezählt.
              </InfoTip>
            </h2>
            <span className="text-[28px] leading-9 font-semibold tracking-tight tabular-nums">{keep(view.money.extra)}</span>
            <span className="text-xs text-fg-secondary">
              zusätzlich verrechenbar aus {proven} {proven === 1 ? "belegtem Fund" : "belegten Funden"}
            </span>
            {view.money.atRisk && (
              <>
                <span aria-hidden className="mt-3 flex h-1.5 w-full max-w-[460px] overflow-hidden rounded-full bg-fg/35">
                  <span className="h-full bg-state-red" style={{ width: `${Math.max(share, 0.02) * 100}%` }} />
                </span>
                <p className="mt-2 font-semibold">davon mit Kürzungsrisiko {keep(view.money.atRisk)}</p>
              </>
            )}
          </div>
          <div className="flex flex-col gap-1 lg:pl-10 lg:shadow-[inset_1px_0_0_0_var(--color-line)] max-lg:pt-5 max-lg:shadow-[inset_0_1px_0_0_var(--color-line)]">
            <span className="text-fg-secondary">in Klärung, nicht addiert</span>
            {/* a zero is said as "nichts", and a part that is zero is left out (step 8a) */}
            <span className="text-xl font-semibold tabular-nums">{centOf(view.money.unclear) ? keep(view.money.unclear) : "nichts"}</span>
            {centOf(view.money.unclear) > 0 && (
              <span className="text-xs text-fg-secondary tabular-nums">
                {[
                  ...(centOf(view.money.missing) ? [`Beleg fehlt ${keep(view.money.missing)}`] : []),
                  ...(centOf(view.money.changeOrder) ? [`Nachtrag nicht gelegt ${keep(view.money.changeOrder)}`] : []),
                ].join(", ")}
              </span>
            )}
            <span className="mt-auto pt-4 text-xs text-fg-muted tabular-nums">
              {view.counts.belege + view.counts.whatsapp} Belege, {cells.length} Leistungen abgeglichen, {finds.length} Funde
            </span>
          </div>
        </section>

        {!find ? (
          <SectionEmpty title="Kein Fund in diesem Projekt" text="Der Abgleich hat nichts gefunden, das zusätzlich verrechenbar oder in Klärung ist." />
        ) : (
          <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
            <Picker finds={finds} chosen={find.number} onChoose={choose} />
            <Trace find={find} view={view} cells={cells} />
          </div>
        )}
      </div>
    </div>
  );
}

/** The finds to choose from, by name and grouped by money word; on phones above the trace. */
function Picker({ finds, chosen, onChoose }: { finds: TwinFind[]; chosen: string; onChoose: (n: string) => void }) {
  const dot = (f: TwinFind) => f.belegstand && f.belegstand.state !== "belegt" && <span aria-hidden className={cn("size-2 shrink-0 rounded-full", STAND_DOT[f.belegstand.state])} />;
  return (
    <nav aria-label="Fund wählen">
      <h2 className="mb-1 px-2 text-fg-secondary">Wählen Sie einen Fund</h2>
      <div className="flex flex-col gap-3">
        {BUCKETS.map((b) => {
          const list = finds.filter((f) => f.bucket === b.key);
          if (!list.length) return null;
          return (
            <div key={b.key}>
              <h3 className="px-2 pb-1 text-xs text-fg-secondary">{b.title}</h3>
              <ul>
                {list.map((f) => (
                  <li key={f.number}>
                    <button
                      type="button"
                      aria-pressed={f.number === chosen}
                      onClick={() => onChoose(f.number)}
                      className={cn(
                        "grid min-h-9 w-full grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none max-md:min-h-11 hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent",
                        f.number === chosen && "bg-sidebar shadow-ring hover:bg-sidebar",
                      )}
                    >
                      <span className="flex h-5 min-w-7 items-center justify-center rounded-xs bg-fill-hover px-1 font-mono text-xs text-count shadow-ring">{f.number}</span>
                      <span className="truncate">{f.label}</span>
                      <span className="flex items-center gap-1.5 tabular-nums">
                        {dot(f)}
                        {keep(f.amount.text)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function Step({ n, title, last = false, children }: { n: number; title: string; last?: boolean; children: React.ReactNode }) {
  return (
    <li className={cn("relative grid grid-cols-[24px_minmax(0,1fr)] gap-3", !last && "pb-6")}>
      {!last && <span aria-hidden className="absolute top-7 bottom-1 left-[11.5px] w-px bg-line" />}
      <span className={cn("flex size-6 items-center justify-center rounded-sm font-mono text-xs shadow-ring", last ? "bg-fg text-white shadow-none" : "bg-fill-hover text-count")}>{n}</span>
      <div className="flex min-w-0 flex-col gap-2">
        <h4 className="font-semibold">{title}</h4>
        {children}
      </div>
    </li>
  );
}

/** One find from folder to money, along the three steps of the website section 03. */
function Trace({ find, view, cells }: { find: TwinFind; view: TwinView; cells: TwinCell[] }) {
  const belege = view.belege.filter((b) => b.finds.includes(find.number) && !b.copy);
  const mine = new Set(find.cells);
  const own = cells.filter((c) => mine.has(c.id));
  const c = view.abgleich.counts;
  const legend = [
    { text: "verrechnet", n: c.verrechnet, cls: "bg-fg/[0.14]" },
    { text: "Pauschale", n: c.pauschale, cls: "bg-fg/[0.07]" },
    { text: "Menge weicht ab", n: c.menge_abweichend, cls: "bg-fg/35" },
    { text: "in einem Fund", n: c.fund, cls: "bg-[linear-gradient(90deg,var(--color-state-green)_33%,var(--color-state-yellow)_33%_66%,var(--color-state-orange)_66%)]" },
  ];
  const b = view.business;
  return (
    <section aria-labelledby="ue-spur" className="flex min-w-0 flex-col gap-4 rounded-lg bg-surface p-6 shadow-ring max-md:p-4">
      <div className="flex flex-col gap-1">
        <h3 id="ue-spur" className="text-fg-secondary">
          So kommt tieout auf diesen Betrag
        </h3>
        <p className="flex items-start gap-2">
          <span className="mt-px flex h-5 min-w-7 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1 font-mono text-xs text-count shadow-ring">{find.number}</span>
          <span className="text-base font-semibold">{titleOf(find)}</span>
        </p>
      </div>
      <ol>
        <Step n={1} title="Ihre Daten">
          <p className="text-xs text-fg-secondary">
            {belege.length === 1 ? "1 Beleg beweist" : `${belege.length} Belege beweisen`} den Fund
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {belege.map((x) => (
              <li key={x.id} className="max-w-full min-w-0">
                <Link
                  href={`${find.href}#belege`}
                  title={`${x.kind}, ${x.date.text}`}
                  className="flex h-6 max-w-[min(360px,100%)] items-center rounded-sm bg-surface px-1.5 text-xs shadow-ring outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent"
                >
                  <span className="truncate">{x.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Step>
        <Step n={2} title="Digitaler Zwilling">
          <p className="flex items-center gap-1.5 text-xs text-fg-secondary">
            {find.detail}; liegt in {own.length === 1 ? "einer" : own.length} von {cells.length} Leistungen
            <InfoTip label="Digitaler Zwilling">
              {cells.length} Leistungen: {view.abgleich.positions.length} Positionen des Leistungsverzeichnisses und {view.abgleich.withoutPosition.length} ohne Position (Regieberichte, Meldungen). Je Leistung vergleicht tieout beauftragt, erbracht und verrechnet, mit Vertrag und Leistungsverzeichnis. „Menge weicht ab“: anders als beauftragt, aber so verrechnet, wie erbracht, also nichts offen. Wissen aus Ihrem Betrieb: {b.client.name} ({b.client.kind}), Vertrag vom {b.contract.date}, {b.contract.kind}
              {b.priceBasis.hourly ? `, Preisbasis mit ${b.priceBasis.hourly}` : ""}.
            </InfoTip>
          </p>
          {/* every service of the Abgleich as one thin part of one bar; the parts of this find stand up in ultramarine */}
          <div aria-hidden className="flex h-7 items-end">
            {cells.map((x) => (
              <span key={x.id} className={cn("min-w-0 flex-1", mine.has(x.id) ? "h-7 min-w-[3px] bg-accent" : cn("h-3.5", cellClass(x, view.finds)))} />
            ))}
          </div>
          <p className="sr-only">
            {find.number} liegt in {own.length === 1 ? "einer" : own.length} von {cells.length} Leistungen.
          </p>
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-fg-secondary">
            {legend.map((l) => (
              <span key={l.text} className="flex items-center gap-1.5">
                <span aria-hidden className={cn("size-2 rounded-xs", l.cls)} />
                {l.text} <span className="text-fg tabular-nums">{l.n}</span>
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-accent">
              <span aria-hidden className="size-2 rounded-xs bg-accent" />
              {find.number}
            </span>
          </div>
          <ul className="flex flex-wrap gap-1.5">
            {own.map((x) => (
              <li key={x.id} title={x.label} className={cn("flex h-6 items-center gap-1.5 rounded-sm bg-surface px-1.5 text-xs shadow-ring", x.index !== null && "font-mono")}>
                <span aria-hidden className="size-2 rounded-xs bg-accent" />
                {cellName(x)}
              </li>
            ))}
          </ul>
        </Step>
        <Step n={3} title="Ergebnis" last>
          <span className="text-xl font-semibold tabular-nums">{keep(find.amount.text)}</span>
          <span className="-mt-1.5 text-xs text-fg-secondary">dieser Fund, {MONEY_WORD[find.bucket]}</span>
          {find.risk && (
            <p className="flex items-center gap-1.5">
              <span aria-hidden className={cn("size-2 shrink-0 rounded-full", find.risk.alreadyCut ? "bg-state-grey" : "bg-state-red")} />
              <span>
                {find.risk.alreadyCut ? "Schon gekürzt" : "Kürzungsrisiko"}: {find.risk.reason}
                {find.risk.amount !== find.amount.text && <span className="text-fg-secondary tabular-nums">, {keep(find.risk.amount)}</span>}
              </span>
            </p>
          )}
          {!find.risk && find.remedy && <p className="text-fg-secondary">Was fehlt: {find.remedy}</p>}
          <Link href={find.href} className="flex w-fit items-center gap-1 text-fg outline-none hover:underline focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
            Fund öffnen
            <ChevronRight aria-hidden className="size-4" />
          </Link>
        </Step>
      </ol>
    </section>
  );
}
