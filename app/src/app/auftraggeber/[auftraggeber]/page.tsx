import type { Metadata } from "next";
import Link from "next/link";
import { Briefcase } from "lucide-react";

import { AttributeList } from "@/components/record/attribute-list";
import { Highlights } from "@/components/record/highlights";
import { MiniTable } from "@/components/record/mini-table";
import { Page } from "@/components/shell/page";
import { RecordHead } from "@/components/shell/record-head";
import { Tag } from "@/components/table/tag";
import { InfoTip } from "@/components/ui/info-tip";
import { clientRows } from "@/lib/kern-data";
import { clientRecord } from "@/lib/records";
import { ClientProjects } from "./client-projects";

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


const projectLink = (p: { name: string; href: string }) => (
  <Link href={p.href} className="link-quiet">
    {p.name}
  </Link>
);

/**
 * An Auftraggeber in Attio's record layout (SPEZIFIKATION.md 2.2 and 7.2): Angaben left; right the history from the
 * documents of every project, led by "Gleicher Grund" (what was cut before and stands again in the running project, said
 * once), then the three figures and the projects. Facts only.
 */
export default async function AuftraggeberRecordPage({ params }: Props) {
  const r = find((await params).auftraggeber);
  const kind = r.attributes.find((a) => a.label === "Art")!.value;
  const projects = r.attributes.find((a) => a.label === "Projekte")!;
  // the head says the kind and the projects; Angaben keeps what it alone says
  const details = r.attributes.filter((a) => a.label !== "Art" && a.label !== "Projekte");
  return (
    <Page destination="auftraggeber" trail={[{ label: r.name }]}>
      <RecordHead icon={Briefcase} title={r.name} facts={[kind, `${projects.value} Projekte${projects.detail ? `, ${projects.detail}` : ""}`]} />
      <div className="flex flex-1 shadow-[inset_0_1px_0_0_var(--color-line)] max-lg:flex-col">
        <aside className="w-[374px] shrink-0 shadow-[inset_-1px_0_0_0_var(--color-line)] max-lg:order-2 max-lg:w-full max-lg:shadow-[inset_0_1px_0_0_var(--color-line)]">
          <AttributeList title="Angaben" attributes={details} />
        </aside>
        <div className="flex min-w-0 flex-1 flex-col gap-6 px-6 py-5 max-md:px-4 max-lg:order-1">
          {r.sameReason.length > 0 && (
            <section aria-labelledby="gleicher-grund">
              <h2 id="gleicher-grund" className="mb-2 flex items-center gap-1.5 text-sm text-fg-secondary">
                Gleicher Grund wie in einem früheren Projekt
                <InfoTip label="Gleicher Grund">
                  Was {r.name} in einem abgeschlossenen Projekt gekürzt oder abgezogen hat und im laufenden Projekt wieder als Kürzungsrisiko steht. Die Abhilfe steht beim Fund.
                </InfoTip>
              </h2>
              <ul className="rounded-lg bg-surface shadow-ring">
                {r.sameReason.map((s) => (
                  <li key={s.id} className="flex items-start gap-2.5 px-4 py-3 [&:not(:last-child)]:shadow-line-bottom">
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-state-red" aria-hidden />
                    <p className="min-w-0">
                      <span className="font-semibold">{s.reason}</span>{" "}
                      <span className="text-fg-secondary">
                        {s.deducted ? "auch in" : "droht in"} {projectLink(s.project)}.
                      </span>
                      <span className="block text-fg-secondary tabular-nums">{(s.earlier.charAt(0).toUpperCase() + s.earlier.slice(1)).replace(/ €/g, " €")}.</span>
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <Highlights items={r.highlights} title="Aus allen Projekten" />

          <ClientProjects rows={r.projects} />

          <MiniTable
            title="Kürzungen"
            rows={r.cuts}
            empty="Keine Kürzung auf einem Korrekturblatt."
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
      </div>
    </Page>
  );
}
