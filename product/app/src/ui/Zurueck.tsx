"use client";

// Back and close on detail pages (pattern: Linear, Attio): icon button at the start of the page header, Esc closes.
// Goes back to the list the user came from, with its scroll position and filters; without one (direct link, reload)
// to the project's list given as `liste`.

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { rueckweg, scrollZurueck } from "./herkunft";
import { Ico } from "./Ico";

const nichtBeobachten = () => () => {};

export function Zurueck({ liste }: { liste: string }) {
  const router = useRouter();
  // Shown as link target (hover, middle click); on the server and after a reload the fallback.
  const ziel = useSyncExternalStore(
    nichtBeobachten,
    () => rueckweg()?.ziel ?? liste,
    () => liste,
  );

  const zurueck = useCallback(() => {
    const weg = rueckweg() ?? { ziel: liste, zurueck: false };
    scrollZurueck(weg.ziel);
    if (weg.zurueck) router.back();
    else router.push(weg.ziel);
  }, [liste, router]);

  useEffect(() => {
    const taste = (ev: KeyboardEvent) => {
      if (ev.key !== "Escape" || ev.defaultPrevented || ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) return;
      if (ev.target instanceof Element && ev.target.closest("input, textarea, select, [contenteditable]")) return;
      // Esc first closes what is open on top: search, company menu, the sidebar drawer on the phone.
      if (document.querySelector('[role="dialog"], [role="menu"]') || document.documentElement.dataset.schublade) return;
      ev.preventDefault();
      zurueck();
    };
    window.addEventListener("keydown", taste);
    return () => window.removeEventListener("keydown", taste);
  }, [zurueck]);

  return (
    <Link
      href={ziel}
      className="kopf-zurueck"
      title="Zurück (Esc)"
      aria-label="Zurück"
      onClick={(ev) => {
        if (ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        zurueck();
      }}
    >
      <Ico icon={ArrowLeft} />
    </Link>
  );
}
