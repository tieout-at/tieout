"use client";

import { useEffect, useState } from "react";
import { CircleAlert, X } from "lucide-react";

import { REFUSED } from "@/lib/server-store";

/**
 * Says why the database refused an entry of this page (a step of the wrong role, four eyes, an old state): the page
 * already shows the state again, this line tells why. Closes on its own after a while or with the cross.
 */
export function ServerNotice() {
  const [why, setWhy] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const show = (e: Event) => {
      setWhy(String((e as CustomEvent).detail ?? ""));
      clearTimeout(timer);
      timer = setTimeout(() => setWhy(null), 8000);
    };
    window.addEventListener(REFUSED, show);
    return () => {
      window.removeEventListener(REFUSED, show);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden">
      {why && (
        <div className="pointer-events-auto flex max-w-[480px] items-start gap-2 rounded-lg bg-surface px-3 py-2 text-sm shadow-[0_0_0_1px_var(--color-line),0_8px_24px_rgb(10_16_32/0.12)]">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-fg-secondary" aria-hidden />
          <p className="flex-1">
            <span className="font-medium">Nicht gespeichert.</span> {why}
          </p>
          <button type="button" onClick={() => setWhy(null)} aria-label="Hinweis schließen" className="flex size-6 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover">
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
