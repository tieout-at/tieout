"use client";

// Tastatur und Klick für Tabellen (Vorlage: Linear): Zeilen mit data-href sind fokussierbar,
// Klick oder Enter öffnet, j/k springt zur nächsten/vorigen Zeile. Kurztasten reagieren nicht mit Strg, Alt oder Cmd
// und nicht auf gehaltene Tasten. Der Link in der Zeile bleibt der eigentliche Weg (auch ohne JavaScript).
// Klick auf einen Gruppenkopf klappt die Gruppe zu oder auf (Linear „Group by“, siehe Gruppe.tsx).

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export function Zeilennavigation({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Nur sichtbare Zeilen: eingeklappte Gruppen überspringt j/k.
    const zeilen = () => Array.from(el.querySelectorAll<HTMLTableRowElement>("tr[data-href]")).filter((tr) => !tr.closest("tbody[data-zu]"));

    // Gruppen klappen (GruppenTitel): Zustand je Seite und Gruppe im Browser merken, beim Laden wiederherstellen.
    const speicher = `sw-zu:${location.pathname}`;
    const gemerkt = (): string[] => {
      try {
        return JSON.parse(sessionStorage.getItem(speicher) ?? "[]");
      } catch {
        return [];
      }
    };
    const setzen = (tbody: HTMLElement, zu: boolean) => {
      if (zu) tbody.dataset.zu = "";
      else delete tbody.dataset.zu;
      tbody.querySelector(".grp-knopf")?.setAttribute("aria-expanded", String(!zu));
    };
    const zuBeimLaden = new Set(gemerkt());
    el.querySelectorAll<HTMLElement>("tbody[data-gruppe]").forEach((t) => setzen(t, zuBeimLaden.has(t.dataset.gruppe ?? "")));

    const klick = (ev: MouseEvent) => {
      const ziel = ev.target as HTMLElement;
      const kopf = ziel.closest("tr.grp");
      const gruppe = kopf?.closest<HTMLElement>("tbody[data-gruppe]");
      if (gruppe && !ziel.closest("a")) {
        const zu = !("zu" in gruppe.dataset);
        setzen(gruppe, zu);
        const neu = new Set(gemerkt());
        if (zu) neu.add(gruppe.dataset.gruppe ?? "");
        else neu.delete(gruppe.dataset.gruppe ?? "");
        try {
          sessionStorage.setItem(speicher, JSON.stringify([...neu]));
        } catch {
          // privater Modus: gilt nur bis zum Neuladen
        }
        return;
      }
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
