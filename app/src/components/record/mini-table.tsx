import { cn } from "@/lib/utils";

export type MiniColumn<R> = { id: string; title: string; align?: "right"; className?: string; cell: (r: R) => React.ReactNode };

/**
 * A small table inside a record page (Attio's associated records): a 12 px heading with its count, header and rows of
 * 36 px with 1 px lines, no view bar. For lists of a handful of rows; long lists use `DataTable`.
 */
export function MiniTable<R extends { id: string }>({ title, rows, columns, empty }: { title: string; rows: R[]; columns: MiniColumn<R>[]; empty?: string }) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 text-sm text-fg-secondary">
        {title} <span className="text-fg-muted tabular-nums">{rows.length}</span>
      </h2>
      {rows.length === 0 ? (
        <p className="rounded-lg px-3 py-2.5 text-fg-muted shadow-ring">{empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-ring">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="h-9 text-xs text-fg-secondary">
                {columns.map((c) => (
                  <th key={c.id} scope="col" className={cn("px-3 text-left font-medium shadow-line-bottom", c.className)}>
                    {c.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="h-9 hover:bg-row-hover [&:not(:last-child)]:shadow-line-bottom">
                  {columns.map((c) => (
                    <td key={c.id} className={cn("px-3 py-1.5", c.align === "right" && "text-right whitespace-nowrap tabular-nums", c.className)}>
                      {c.cell(r)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
