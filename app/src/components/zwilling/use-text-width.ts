"use client";

import { useMemo } from "react";

import type { Geo } from "./layout";

const FALLBACK = (text: string) => text.length * 6.4;

/** A width measure on its own canvas, cached per text; no layout is forced. */
function makeTextWidth(sans: string | null, mono: string | null): (text: string, isMono: boolean) => number {
  if (!sans || !mono || typeof document === "undefined") return FALLBACK;
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return FALLBACK;
  const cache = new Map<string, number>();
  return (text, isMono) => {
    const key = `${isMono ? 1 : 0}${text}`;
    let w = cache.get(key);
    if (w === undefined) {
      ctx.font = isMono ? `400 11px ${mono}` : `500 12px ${sans}`;
      w = ctx.measureText(text).width;
      cache.set(key, w);
    }
    return w;
  };
}

/** Width of a card title (12 px, weight 500) or a date (11 px mono) in the fonts the page resolved. */
export function useTextWidth(font: Geo["font"] | null): (text: string, mono: boolean) => number {
  const sans = font?.sans ?? null;
  const mono = font?.mono ?? null;
  return useMemo(() => makeTextWidth(sans, mono), [sans, mono]);
}
