import Link from "next/link";

import { MiniTable } from "@/components/record/mini-table";
import { contractRows } from "@/lib/records";

export const metadata = { title: "Verträge · Betrieb" };

// The Verträge the twin read from the folders, each with its Vertragspunkte on the project's tab "Vertrag" (step 8a).
export default function VertraegePage() {
  const rows = contractRows();
  // a kind every Vertrag shares is said once above the table, not in every row (step 8a)
  const shared = rows.every((r) => r.kind === rows[0].kind) ? rows[0].kind : null;
  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-2 px-6 py-6 max-md:px-4 max-md:py-4">
      <MiniTable
        title="Verträge"
        rows={rows}
        columns={[
          {
            id: "project",
            title: "Projekt",
            className: "whitespace-nowrap",
            cell: (r) => (
              <Link href={r.project.href} className="link-quiet">
                {r.project.name}
              </Link>
            ),
          },
          { id: "client", title: "Auftraggeber", cell: (r) => r.client },
          { id: "date", title: "Vertrag vom", className: "whitespace-nowrap", cell: (r) => <span className="tabular-nums">{r.date}</span> },
          ...(shared ? [] : [{ id: "kind", title: "Art", cell: (r: (typeof rows)[number]) => <span className="text-fg-secondary">{r.kind}</span> }]),
          { id: "sum", title: "Auftragssumme", align: "right", cell: (r) => r.sum },
        ]}
      />
      {shared && <p className="text-xs text-fg-secondary">Alle {rows.length === 5 ? "fünf" : rows.length} Verträge: {shared}.</p>}
    </div>
  );
}
