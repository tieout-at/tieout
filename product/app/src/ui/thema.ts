"use client";

import { useSyncExternalStore } from "react";
import { NAV, SCHLUESSEL } from "./thema-skript";

// Hell und dunkel: Standard ist die Einstellung des Geräts, ein Wechsel wird im Browser gemerkt.
// Dasselbe für die eingeklappte Seitenleiste. Das Skript im <head> setzt beides vor dem ersten Bild,
// damit nichts aufblitzt.



function merken(schluessel: string, wert: string) {
  try {
    localStorage.setItem(schluessel, wert);
  } catch {
    // privater Modus: gilt nur für diese Seite
  }
}

export type Thema = "hell" | "dunkel" | "system";

/** Thema aus den Einstellungen: fest hell, fest dunkel oder wie das Gerät. */
export function themaSetzen(t: Thema) {
  const dunkel = t === "dunkel" || (t === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.dataset.theme = dunkel ? "dark" : "light";
  if (t === "system") {
    try {
      localStorage.removeItem(SCHLUESSEL);
    } catch {
      // privater Modus
    }
  } else merken(SCHLUESSEL, t);
}

export function themaGemerkt(): Thema {
  try {
    const t = localStorage.getItem(SCHLUESSEL);
    return t === "hell" || t === "dunkel" ? t : "system";
  } catch {
    return "system";
  }
}

export function themaWechseln() {
  const neu = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = neu;
  merken(SCHLUESSEL, neu === "dark" ? "dunkel" : "hell");
}

const navHoerer = new Set<() => void>();

export function navWechseln() {
  const d = document.documentElement;
  const zu = d.dataset.nav !== "zu";
  if (zu) d.dataset.nav = "zu";
  else delete d.dataset.nav;
  merken(NAV, zu ? "zu" : "auf");
  navHoerer.forEach((h) => h());
}

/** Ist die Seitenleiste eingeklappt? (für aria-expanded; im Server-Rendering: nein) */
export function useNavZu(): boolean {
  return useSyncExternalStore(
    (h) => {
      navHoerer.add(h);
      return () => {
        navHoerer.delete(h);
      };
    },
    () => document.documentElement.dataset.nav === "zu",
    () => false,
  );
}
