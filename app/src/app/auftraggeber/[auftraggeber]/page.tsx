import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";

import { ClientFigures, ClientProjectRows, ReasonMatrix, SameReason } from "@/components/auftraggeber/client-record";
import { AttributeList } from "@/components/record/attribute-list";
import { MiniTable } from "@/components/record/mini-table";
import { Page } from "@/components/shell/page";
import { RecordHead } from "@/components/shell/record-head";
import { Tag } from "@/components/table/tag";
import { cn } from "@/lib/utils";
import { clientView } from "@/lib/client-view";
import { clientRows } from "@/lib/kern-data";
import { clientRecord } from "@/lib/records";

type Props = { params: Promise<{ auftraggeber: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return clientRows().map((r) => ({ auftraggeber: r.slug }));
}

function find(slug: string) {
  const row = clientRows().find((r) => r.slug === slug);
  if (!row) throw new Error(`Unknown Auftraggeber ${slug}`);
  return clientRecord(row.id);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: find((await params).auftraggeber).name };
}

const count = (n: number, one: string, many: string) => (n ? `${n} ${n === 1 ? one : many}` : "");

const projectLink = (p: { name: string; href: string }) => (
  <Link href={p.href} className="link-quiet">
    {p.name}
  </Link>
);

/**
 * An Auftraggeber (step 8d, draft A chosen by Maxi S.): the three figures with rings, then "Gleicher Grund" as a chain
 * and the projects, next to them the reasons per project as a matrix; the single cuts, deductions and Nachträge fold
 * away below. Facts only, every amount from the core.
 */
export default async function AuftraggeberRecordPage({ params }: Props) {
  const r = find((await params).auftraggeber);
  const v = clientView(r.id);
  const kind = r.attributes.find((a) => a.label === "Art")!.value;
  const projects = r.attributes.find((a) => a.label === "Projekte")!;
  // the head says the kind and the projects; Angaben keeps what it alone says
  const details = r.attributes.filter((a) => a.label !== "Art" && a.label !== "Projekte");
  // a single fact left is said in the head, not in a column of its own
  const inHead = details.length <= 1;
  const headFacts = inHead ? details.map((a) => (a.label === "Tage bis Schlusszahlung" ? `Schlusszahlung nach ${a.value} Tagen${a.detail ? `, ${a.detail}` : ""}` : `${a.label} ${a.value}`)) : [];
  return (
    <Page destination="auftraggeber" trail={[{ label: r.name }]}>
      <RecordHead
        icon={Briefcase}
        title={r.name}
        facts={[kind, `${projects.value} ${projects.value === "1" ? "Projekt" : "Projekte"}${projects.detail ? `, ${projects.detail}` : ""}`, ...headFacts]}
      />
      <div className="flex flex-1 shadow-[inset_0_1px_0_0_var(--color-line)] max-lg:flex-col">
        {!inHead && (
          <aside className="w-[340px] shrink-0 shadow-[inset_-1px_0_0_0_var(--color-line)] max-lg:order-2 max-lg:w-full max-lg:shadow-[inset_0_1px_0_0_var(--color-line)]">
            <AttributeList title="Angaben" attributes={details} />
          </aside>
        )}
        <div className={cn("mx-auto flex w-full min-w-0 flex-1 flex-col gap-4 px-6 py-5 max-md:px-4 max-lg:order-1", inHead && "max-w-[1200px]")}>
          <ClientFigures highlights={r.highlights} v={v} />
          <div className={cn("grid grid-cols-1 gap-4", v.reasons.length > 0 && "xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]")}>
            <div className="flex min-w-0 flex-col gap-4">
              <SameReason v={v} name={r.name} />
              <ClientProjectRows rows={r.projects} closing={v.closing} />
            </div>
            <ReasonMatrix v={v} name={r.name} />
          </div>

          {r.cuts.length + r.deductions.length + r.changeOrders.length > 0 && (
            <details className="group rounded-xl bg-surface shadow-ring">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 text-fg-secondary outline-none focus-visible:outline-2 focus-visible:outline-accent">
                <span>
                  Einzeln:{" "}
                  {[
                    count(r.cuts.length, "Kürzung", "Kürzungen"),
                    count(r.deductions.length, "Abzug ohne Vertragspunkt", "Abzüge ohne Vertragspunkt"),
                    count(r.changeOrders.length, "Nachtrag", "Nachträge"),
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </span>
                <span aria-hidden className="text-xs text-fg-muted group-open:hidden">
                  anzeigen
                </span>
                <span aria-hidden className="hidden text-xs text-fg-muted group-open:inline">
                  ausblenden
                </span>
              </summary>
              <div className="flex flex-col gap-6 px-4 pb-5">
                <MiniTable
                  title="Kürzungen"
                  rows={r.cuts}
                  empty="Keine Kürzung."
                  columns={[
                    { id: "project", title: "Projekt", className: "whitespace-nowrap", cell: (x) => projectLink(x.project) },
                    { id: "what", title: "Position", cell: (x) => x.what },
                    { id: "reason", title: "Grund", cell: (x) => x.reason },
                    { id: "invoice", title: "Rechnung", cell: (x) => <span className="text-fg-secondary">{x.invoice}</span> },
                    { id: "amount", title: "Betrag", align: "right", cell: (x) => x.amount },
                  ]}
                />

                <MiniTable
                  title="Abzug ohne Vertragspunkt"
                  rows={r.deductions}
                  empty="Kein Abzug, den der Vertrag nicht nennt."
                  columns={[
                    { id: "project", title: "Projekt", className: "whitespace-nowrap", cell: (x) => projectLink(x.project) },
                    { id: "what", title: "Abzug", cell: (x) => x.what },
                    { id: "invoice", title: "Rechnungen", cell: (x) => <span className="text-fg-secondary">{x.invoice}</span> },
                    { id: "amount", title: "Betrag", align: "right", cell: (x) => x.amount },
                  ]}
                />

                <MiniTable
                  title="Nachträge"
                  rows={r.changeOrders}
                  empty="Kein Nachtrag angeboten."
                  columns={[
                    { id: "project", title: "Projekt", className: "whitespace-nowrap", cell: (x) => x.project },
                    { id: "title", title: "Nachtrag", cell: (x) => `${x.number}, ${x.title}` },
                    { id: "accepted", title: "Entscheidung", cell: (x) => <Tag colour={x.accepted ? "green" : "grey"}>{x.accepted ? "beauftragt" : "abgelehnt"}</Tag> },
                    { id: "amount", title: "Betrag", align: "right", cell: (x) => x.amount },
                  ]}
                />
              </div>
            </details>
          )}
        </div>
      </div>
    </Page>
  );
}
