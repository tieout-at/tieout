"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { createElement, useLayoutEffect, useRef, useState } from "react";

import { belegIcon } from "./icons";
import type { SourceRef } from "@/lib/finds";
import { markOf, placeText, type OriginalPage } from "@/lib/originals";
import { OriginalPaper } from "./original-paper";
import { FileView, StoredFiles, type ShownFile } from "./stored-files";

const iconButton =
  "flex size-7 items-center justify-center rounded-md text-fg-secondary outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-40 max-md:size-11";

/**
 * The original on the right (Attio's chat panel, SPEZIFIKATION.md 4.2): header of 48 px with the Beleg, its page and the
 * arrows to the other pages, below it the page with the place of the source marked. Paging leaves the source; the mark
 * shows only on the page the source points to. With an account the files the company stored for the Beleg are listed
 * under the head, and one of them can take the place of the drawn page.
 */
export function OriginalViewer({ source, originals, onClose }: { source: SourceRef; originals: Record<string, OriginalPage>; onClose?: () => void }) {
  // the page shown; a new source resets it (the parent keys this component by the source)
  const [key, setKey] = useState(source.page);
  // a stored file of the Beleg shown instead of the drawn page, until it is closed or another page is chosen
  const [file, setFile] = useState<ShownFile | null>(null);
  const page = originals[key] ?? originals[source.page];
  const scroller = useRef<HTMLDivElement>(null);
  const mark = page && key === source.page ? markOf(page, source.place) : null;

  // bring the marked place into the middle of the panel, without moving the page behind it
  useLayoutEffect(() => {
    const box = scroller.current;
    const el = mark ? box?.querySelector<HTMLElement>(`[data-place="${CSS.escape(mark)}"]`) : null;
    if (!box) return;
    if (!el) return void (box.scrollTop = 0);
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop;
    box.scrollTop = Math.max(0, top - box.clientHeight / 2 + el.offsetHeight / 2);
  }, [mark, key]);

  if (!page) return null;
  const sameBeleg = Object.values(originals)
    .filter((o) => o.belegId === page.belegId)
    .sort((a, b) => a.page - b.page);
  const at = sameBeleg.findIndex((o) => o.key === page.key);
  const read = mark ? page.read.filter((r) => r.place === source.place || r.place === mark) : [];
  const reviews = [...new Set(read.map((r) => (r.before ? `${r.review}, vorher ${r.before}${r.reason ? `, ${r.reason}` : ""}` : r.review)))];

  return (
    <section aria-label="Original" className="flex h-full min-h-0 flex-col bg-sidebar">
      <header className="flex h-12 shrink-0 items-center gap-2 bg-surface pr-2.5 pl-4 shadow-line-bottom">
        {createElement(belegIcon(page.art), { className: "size-4 shrink-0 text-fg-secondary", "aria-hidden": true })}
        <h2 className="min-w-0 flex-1 truncate text-sm font-medium">{page.title}</h2>
        {page.art !== "whatsapp" && (
          <span className="shrink-0 text-xs text-fg-secondary tabular-nums">
            Seite {page.page} von {page.pages}
          </span>
        )}
        <button type="button" aria-label="Vorige Seite" disabled={at <= 0} onClick={() => (setKey(sameBeleg[at - 1].key), setFile(null))} className={iconButton}>
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <button type="button" aria-label="Nächste Seite" disabled={at < 0 || at >= sameBeleg.length - 1} onClick={() => (setKey(sameBeleg[at + 1].key), setFile(null))} className={iconButton}>
          <ChevronRight className="size-4" aria-hidden />
        </button>
        {onClose && (
          <button type="button" aria-label="Original schließen" onClick={onClose} className={iconButton}>
            <X className="size-4" aria-hidden />
          </button>
        )}
      </header>
      <p className="shrink-0 truncate bg-surface px-4 py-2 text-xs text-fg-secondary shadow-line-bottom">
        {mark ? (
          <>
            <span className="text-fg">Markiert: {placeText(source.place ?? mark).replace(/^Pos\. /, "Position ")}</span>
            {reviews.length > 0 && <span> · {reviews.join(" · ")}</span>}
          </>
        ) : key === source.page ? (
          `${source.detail}`
        ) : (
          "Andere Seite als die Quelle, ohne Markierung"
        )}
      </p>
      {page.art !== "whatsapp" && page.project && <StoredFiles key={page.belegId} project={page.project} belegId={page.belegId} shown={file?.file ?? null} onShow={setFile} />}
      <div ref={scroller} className="relative min-h-0 flex-1 overflow-y-auto p-4">
        {file ? <FileView shown={file} /> : <OriginalPaper page={page} mark={mark} />}
      </div>
    </section>
  );
}
