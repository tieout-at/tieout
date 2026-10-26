"use client";

import { useState } from "react";

import { SideWindow } from "@/components/ui/side-window";
import type { OriginalPage } from "@/lib/originals";
import { cn } from "@/lib/utils";
import { OriginalViewer } from "./original-viewer";

// the originals of a project, loaded once per visit from its static file
const loaded = new Map<string, Promise<Record<string, OriginalPage>>>();
export const loadOriginals = (project: string) => {
  if (!loaded.has(project)) loaded.set(project, fetch(`/originale/${project}.json`).then((r) => (r.ok ? r.json() : {})).catch(() => ({})));
  return loaded.get(project)!;
};

/**
 * Product rule 3, every number leads to its original with one click: a Beleg named on the Zeitstrahl, in the
 * Belegabdeckung or in a peek opens its first page in the original viewer, in the window at the right (a sheet on
 * phones); a second click on the same Beleg closes it again. The pages come from `/originale/<projekt>.json` when the
 * first one is opened.
 */
export function OriginalLink({ project, belegId, label, className, children }: { project: string; belegId: string; label: string; className?: string; children: React.ReactNode }) {
  const [pages, setPages] = useState<Record<string, OriginalPage> | null>(null);
  const [open, setOpen] = useState(false);
  const key = `${belegId}:1`;
  return (
    <>
      <button
        type="button"
        aria-pressed={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
          void loadOriginals(project).then(setPages);
        }}
        className={cn("link-quiet text-left outline-none focus-visible:outline-2 focus-visible:outline-accent", className)}
        title={`${label}: Original ansehen`}
      >
        {children}
      </button>
      <OriginalWindow open={open} onClose={() => setOpen(false)} pages={pages} pageKey={key} label={label} />
    </>
  );
}

/** The original of one page of a Beleg in the window at the right, with a note while the pages load. */
export function OriginalWindow({ open, onClose, pages, pageKey, label, place = null }: { open: boolean; onClose: () => void; pages: Record<string, OriginalPage> | null; pageKey: string; label: string; place?: string | null }) {
  return (
    <SideWindow open={open} onClose={onClose} title={label}>
      {pages?.[pageKey] ? (
        <OriginalViewer key={`${pageKey}|${place}`} source={{ page: pageKey, place, label, detail: `Seite ${pageKey.slice(pageKey.lastIndexOf(":") + 1)}`, short: label }} originals={pages} onClose={onClose} />
      ) : (
        <p className="p-4 text-fg-secondary">{pages ? "Für diesen Beleg gibt es keine Seite in den Beispieldaten." : "Original wird geladen."}</p>
      )}
    </SideWindow>
  );
}
