import { Camera, Info } from "lucide-react";

import type { OriginalPage } from "@/lib/originals";
import { cn } from "@/lib/utils";

/** The marked place: a quiet accent field with a bar on the left, so the eye finds it without a second colour meaning. */
const MARK = "rounded-xs bg-accent-soft shadow-[inset_2px_0_0_0_var(--color-accent)]";

function Fields({ fields, mark, className }: { fields: OriginalPage["head"]; mark: string | null; className?: string }) {
  if (!fields.length) return null;
  return (
    <dl className={cn("grid grid-cols-[116px_minmax(0,1fr)] gap-x-3 text-xs", className)}>
      {fields.map((f) => (
        <div key={`${f.label}-${f.place}`} data-place={f.place} className={cn("col-span-2 grid grid-cols-subgrid px-1.5 py-1", f.place === mark && MARK)}>
          <dt className="text-fg-secondary">{f.label}</dt>
          <dd className="min-w-0">{f.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * One page of a Beleg, drawn from the values the twin read from it (`lib/originals.ts`), with the place of the source
 * marked. A sheet of paper in the panel: the file name and kind on top, then the layout of its kind.
 */
export function OriginalPaper({ page, mark }: { page: OriginalPage; mark: string | null }) {
  const table = page.table;
  return (
    <div className="flex flex-col gap-2">
      <article className="rounded-md bg-surface px-4 pt-3.5 pb-4 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.05)]" aria-label={`${page.title}, Seite ${page.page}`}>
        <header className="mb-3 flex flex-col gap-0.5 pb-3 shadow-line-bottom">
          {page.file && <span className="truncate text-2xs tracking-normal text-fg-muted normal-case">{page.file}</span>}
          <span className="text-xs text-fg-secondary">
            {page.kind}
            {page.date ? ` vom ${page.date}` : ""}
          </span>
        </header>

        {page.layout === "nachricht" && (
          <div className="flex flex-col gap-3">
            {page.body.map((b) => (
              <p key={b.place} data-place={b.place} className={cn("max-w-[90%] rounded-lg rounded-tl-xs bg-fill-hover px-3 py-2 text-sm", b.place === mark && MARK)}>
                {b.text}
              </p>
            ))}
            <Fields fields={page.head} mark={mark} />
          </div>
        )}

        {page.layout === "brief" && (
          <div className="flex flex-col gap-3">
            <Fields fields={page.head} mark={mark} />
            {page.body.map((b) => (
              <p key={b.place} data-place={b.place} className={cn("px-1.5 py-1 text-sm", b.place === mark && MARK)}>
                {b.text}
              </p>
            ))}
          </div>
        )}

        {page.layout === "plan" && (
          <div className="flex flex-col gap-3">
            <div
              className="flex aspect-[4/3] flex-col items-start justify-center gap-2 rounded-xs p-3 shadow-ring"
              style={{ backgroundImage: "linear-gradient(var(--color-grid) 1px, transparent 1px), linear-gradient(90deg, var(--color-grid) 1px, transparent 1px)", backgroundSize: "16px 16px" }}
            >
              {page.body.map((b) => (
                <span key={b.place} data-place={b.place} className={cn("rounded-full border border-dashed border-fg-faint bg-surface px-3 py-1.5 text-xs", b.place === mark && MARK)}>
                  {b.text}
                  {b.label && <span className="block text-2xs tracking-normal text-fg-muted normal-case">{b.label}</span>}
                </span>
              ))}
            </div>
            <div className="ml-auto w-full max-w-[280px] rounded-xs p-1 shadow-[inset_0_0_0_1px_var(--color-cell-edge)]">
              <span className="block px-1.5 pt-0.5 pb-1 text-2xs tracking-normal text-fg-muted normal-case">Plankopf</span>
              <Fields fields={page.head} mark={mark} />
            </div>
          </div>
        )}

        {page.layout === "foto" && (
          <div className="flex flex-col gap-3">
            <div className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xs bg-fill-hover text-fg-muted">
              <Camera className="size-6" aria-hidden />
              <span className="text-xs">Bild nicht in den Beispieldaten</span>
            </div>
            <Fields fields={page.head} mark={mark} />
          </div>
        )}

        {page.layout === "liste" && (
          <div className="flex flex-col gap-3">
            <Fields fields={page.head} mark={mark} />
            {table && (
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="text-fg-secondary">
                    {table.columns.map((c, i) => (
                      <th key={c} scope="col" className={cn("px-1.5 pb-1 text-left font-medium shadow-line-bottom", table.numeric.includes(i) && "text-right")}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((r) => (
                    <tr key={r.place} data-place={r.place} className={cn("align-top [&:not(:last-child)]:shadow-line-bottom", r.place === mark && MARK)}>
                      {r.cells.map((c, i) => (
                        <td key={i} className={cn("px-1.5 py-1.5", table.numeric.includes(i) && "text-right whitespace-nowrap tabular-nums")}>
                          {c}
                          {i === 0 && r.note && <span className="mt-0.5 block text-fg-secondary">{r.note}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            {page.sign && (
              <div data-place={page.sign.place} className={cn("mt-2 flex flex-col gap-3 rounded-xs px-2 py-2", page.sign.place === mark && MARK)}>
                <span className="h-8 border-b border-fg-faint" aria-hidden />
                <span className="flex justify-between gap-2 text-xs">
                  <span className="text-fg-secondary">{page.sign.label}</span>
                  <span className={page.sign.given ? "" : "font-medium"}>{page.sign.value}</span>
                </span>
              </div>
            )}
            {!table && !page.sign && !page.head.length && <p className="text-xs text-fg-muted">Auf dieser Seite hat tieout nichts gelesen.</p>}
          </div>
        )}

        {page.layout === "werte" &&
          (page.read.length ? (
            <ul className="flex flex-col text-xs">
              {page.read.map((r) => (
                <li key={`${r.place}-${r.text}`} data-place={r.place} className={cn("grid grid-cols-[120px_minmax(0,1fr)] gap-3 px-1.5 py-1", r.place === mark && MARK)}>
                  <span className="text-fg-secondary">{r.place.replace(/^Zeile /, "Position ")}</span>
                  <span>
                    {r.label && r.label !== r.place && <span className="text-fg-secondary">{r.label}: </span>}
                    {r.text}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-fg-muted">Auf dieser Seite hat tieout nichts gelesen.</p>
          ))}
        {page.extra.length > 0 && <Fields fields={page.extra} mark={mark} className="mt-3 pt-3 shadow-[inset_0_1px_0_0_var(--color-line)]" />}
      </article>
      <p className="flex items-start gap-1.5 px-1 text-xs text-fg-muted">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Beispieldaten: aus den gelesenen Werten nachgebildet, kein Scan.
      </p>
    </div>
  );
}
