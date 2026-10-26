"use client";

import { useState } from "react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useMediaQuery } from "@/components/ui/use-media";
import type { OriginalPage } from "@/lib/originals";
import { cn } from "@/lib/utils";
import { OriginalViewer } from "./original-viewer";

// the originals of a project, loaded once per visit from its static file
const loaded = new Map<string, Promise<Record<string, OriginalPage>>>();
const load = (project: string) => {
  if (!loaded.has(project)) loaded.set(project, fetch(`/originale/${project}.json`).then((r) => (r.ok ? r.json() : {})));
  return loaded.get(project)!;
};

/**
 * Product rule 3, every number leads to its original with one click: a Beleg named on the Zeitstrahl or in the
 * Belegabdeckung opens its first page in the original viewer, as a panel at the right (a sheet on phones). The pages
 * come from `/originale/<projekt>.json` when the first one is opened.
 */
export function OriginalLink({ project, belegId, label, className, children }: { project: string; belegId: string; label: string; className?: string; children: React.ReactNode }) {
  const [pages, setPages] = useState<Record<string, OriginalPage> | null>(null);
  const [open, setOpen] = useState(false);
  const wide = useMediaQuery("(min-width: 768px)", true);
  const key = `${belegId}:1`;
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          void load(project).then(setPages);
        }}
        className={cn("link-quiet text-left outline-none focus-visible:outline-2 focus-visible:outline-accent", className)}
        title={`${label}: Original ansehen`}
      >
        {children}
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side={wide ? "right" : "bottom"} className={wide ? "w-[420px]" : "h-[85dvh]"}>
          <SheetTitle>{label}</SheetTitle>
          {pages?.[key] ? (
            <OriginalViewer source={{ page: key, place: null, label, detail: "Seite 1", short: label }} originals={pages} onClose={() => setOpen(false)} />
          ) : (
            <p className="p-4 text-fg-secondary">{pages ? "Für diesen Beleg gibt es keine Seite in den Beispieldaten." : "Original wird geladen."}</p>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
