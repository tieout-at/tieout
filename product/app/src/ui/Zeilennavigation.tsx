"use client";

// Tastatur und Klick für Tabellen (Vorlage: Linear): Zeilen mit data-href sind fokussierbar,
// Klick oder Enter öffnet, j/k springt zur nächsten/vorigen Zeile. Kurztasten reagieren nicht mit Strg, Alt oder Cmd
// und nicht auf gehaltene Tasten. Der Link in der Zeile bleibt der eigentliche Weg (auch ohne JavaScript).

import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useRef, useState } from "react";

let hydriert = false;

/**
 * Lange Listen in zwei Schritten (gemessen 22.10.: 370 neue Zeilen kosten rund 250 ms bis zum Bild): Nach Filter oder
 * Suche erscheinen sofort die schon sichtbaren Zeilen und die ersten `erste` neuen (füllen den Bildschirm), der Rest
 * folgt im nächsten Schritt im Hintergrund. Das Endbild ist dasselbe. Beim ersten Laden (vom Server gerendert) alles.
 */
export function useStufenweise<T>(liste: T[], schluessel: (x: T) => string, erste = 40): T[] {
  const [voll, setVoll] = useState<T[] | null>(() => (hydriert ? null : liste));
  useEffect(() => {
    hydriert = true;
  }, []);
  useEffect(() => {
    if (voll !== liste) startTransition(() => setVoll(liste));
  }, [liste, voll]);
  return useMemo(() => {
    if (voll === liste) return liste;
    const da = new Set((voll ?? []).map(schluessel));
    return liste.filter((x, i) => i < erste || da.has(schluessel(x)));
  }, [liste, voll, schluessel, erste]);
}

/**
 * Für Listen mit sehr vielen Links (Belegmatrix): schlichtes `<a>` statt `next/link`, aber gleiches Verhalten.
 * Klick wechselt die Seite ohne Neuladen, Zeigen oder Fokus lädt das Ziel vor. Ein `next/link` je Zelle hätte für
 * jeden Link einen eigenen Beobachter und lädt alle sichtbaren Ziele vor (gemessen 22.10.: über 1.000 Links, 1,1 MB).
 * Mit Strg, Cmd, Umschalt oder mittlerer Maustaste bleibt es ein normaler Link (neuer Tab).
 */
export function useLinkFolgen() {
  const router = useRouter();
  return useMemo(() => {
    const ziel = (ev: React.SyntheticEvent<HTMLAnchorElement>) => ev.currentTarget.getAttribute("href") ?? "";
    const vorladen = (ev: React.SyntheticEvent<HTMLAnchorElement>) => router.prefetch(ziel(ev));
    return {
      onClick: (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
        ev.preventDefault();
        router.push(ziel(ev));
      },
      onPointerEnter: vorladen,
      onFocus: vorladen,
    };
  }, [router]);
}

export function Zeilennavigation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const zeilen = () => Array.from(el.querySelectorAll<HTMLTableRowElement>("tr[data-href]"));

    const klick = (ev: MouseEvent) => {
      const ziel = ev.target as HTMLElement;
      if (ziel.closest("a, button")) return;
      const tr = ziel.closest<HTMLTableRowElement>("tr[data-href]");
      if (tr?.dataset.href) router.push(tr.dataset.href);
    };
    const taste = (ev: KeyboardEvent) => {
      if (ev.ctrlKey || ev.altKey || ev.metaKey || ev.repeat) return;
      const tr = (ev.target as HTMLElement).closest<HTMLTableRowElement>("tr[data-href]");
      if (!tr) return;
      if (ev.key === "Enter" && tr.dataset.href) {
        ev.preventDefault();
        router.push(tr.dataset.href);
      } else if (ev.key === "j" || ev.key === "k") {
        const alle = zeilen();
        const i = alle.indexOf(tr) + (ev.key === "j" ? 1 : -1);
        if (alle[i]) {
          ev.preventDefault();
          alle[i].focus();
        }
      }
    };
    el.addEventListener("click", klick);
    el.addEventListener("keydown", taste);
    return () => {
      el.removeEventListener("click", klick);
      el.removeEventListener("keydown", taste);
    };
  }, [router]);

  return (
    <div ref={ref} className="tw">
      {children}
    </div>
  );
}
