"use client";

// Where the user came from, for the back control on detail pages (Zurueck.tsx). Kept in memory of the open tab only:
// a reload or a direct link starts empty, then the back control falls back to the project's list.
// Lists scroll inside `.scr-body`, which the browser does not restore, so the scroll position is remembered here too,
// together with the filters of a list (useGemerkt), as long as the tab is open.

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Detail pages: one item, one document, one new WhatsApp message. Everything else counts as a list. */
const DETAIL = /^\/projekte\/[^/]+\/((posten|belege)\/[^/]+|whatsapp)\/?$/;

let aktuelle: string | null = null;
let vorige: string | null = null;
let liste: string | null = null;
const scroll = new Map<string, number>();
const gemerkt = new Map<string, unknown>();
let zurueckNach: string | null = null;

const adresse = () => location.pathname;

/** Last list page of this tab and whether it is the previous history entry (then back keeps the history clean). */
export function rueckweg(): { ziel: string; zurueck: boolean } | null {
  return liste ? { ziel: liste, zurueck: vorige === liste } : null;
}

/** Before going back to a list: restore its scroll position once it is shown. */
export function scrollZurueck(ziel: string) {
  zurueckNach = ziel;
}

/** In the frame (Rahmen.tsx): remembers every page shown and the scroll position of lists. */
export function useHerkunft() {
  const pfad = usePathname();
  useEffect(() => {
    const hier = adresse();
    if (hier !== aktuelle) {
      vorige = aktuelle;
      aktuelle = hier;
      if (!DETAIL.test(hier)) liste = hier;
    }
    if (zurueckNach !== hier) return;
    zurueckNach = null;
    const y = scroll.get(hier) ?? 0;
    // The list may render in two steps (useStufenweise): try for a few frames until the position is reachable.
    let runden = 0;
    let rahmen = 0;
    const setzen = () => {
      const el = document.querySelector<HTMLElement>(".scr-body");
      if (el) el.scrollTop = y;
      if (++runden < 30 && (!el || Math.abs(el.scrollTop - y) > 1)) rahmen = requestAnimationFrame(setzen);
    };
    setzen();
    return () => cancelAnimationFrame(rahmen);
  }, [pfad]);

  useEffect(() => {
    // Only while the address is still the list: after a click the next page replaces the content and the browser
    // reports a last scroll to 0, which must not overwrite the remembered position.
    const merken = (ev: Event) => {
      const el = ev.target;
      if (!(el instanceof HTMLElement) || !el.classList.contains("scr-body") || !aktuelle || DETAIL.test(aktuelle) || adresse() !== aktuelle) return;
      scroll.set(aktuelle, el.scrollTop);
    };
    document.addEventListener("scroll", merken, { capture: true, passive: true });
    return () => document.removeEventListener("scroll", merken, { capture: true });
  }, []);
}

/** Like useState, but kept per page while the tab is open (filter and search of a list survive a detail page). */
export function useGemerkt<T>(name: string, start: T): [T, (wert: T | ((alt: T) => T)) => void] {
  const schluessel = `${usePathname()}#${name}`;
  const [wert, setWert] = useState<T>(() => (gemerkt.has(schluessel) ? (gemerkt.get(schluessel) as T) : start));
  return [
    wert,
    (neu) =>
      setWert((alt) => {
        const w = typeof neu === "function" ? (neu as (alt: T) => T)(alt) : neu;
        gemerkt.set(schluessel, w);
        return w;
      }),
  ];
}
