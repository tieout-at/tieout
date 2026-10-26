import { cn } from "@/lib/utils";

export type MiniColumn<R> = {
  id: string;
  title: string;
  align?: "right";
  className?: string;
  cell: (r: R) => React.ReactNode;
  /** On phones this column stands at the right of the first line (default: the last amount). */
  phoneTop?: boolean;
};

/**
 * A small table inside a record page (Attio's associated records): a 12 px heading with its count, header and rows of
 * 36 px with 1 px lines, no view bar. For lists of a handful of rows; long lists use `DataTable`. Below 768 px each row
 * is a block (the first cell with the last, the amount, on top; the others in one quiet line), so no name is cut.
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
        <>
        <ul className="rounded-lg shadow-ring md:hidden">
          {rows.map((r) => {
            const [head, ...others] = columns;
            const last = others.find((c) => c.phoneTop) ?? (others.at(-1)?.align === "right" ? others.at(-1) : undefined);
            const rest = others.filter((c) => c !== last);
            return (
              <li key={r.id} className="flex flex-col gap-1 px-3 py-2.5 [&:not(:last-child)]:shadow-line-bottom">
                <span className="flex items-start justify-between gap-3">
                  <span className="min-w-0">{head.cell(r)}</span>
                  {last && <span className="shrink-0 tabular-nums">{last.cell(r)}</span>}
                </span>
                {rest.length > 0 && (
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-secondary">
                    {rest.map((c) => (
                      <span key={c.id} className="min-w-0">
                        {/* an amount in the quiet line says what it is */}
                        {c.align === "right" && <span className="text-fg-muted">{c.title} </span>}
                        {c.cell(r)}
                      </span>
                    ))}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        <div className="overflow-x-auto rounded-lg shadow-ring max-md:hidden">
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
        </>
      )}
    </section>
  );
}
