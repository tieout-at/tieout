import type { CSSProperties } from "react";

import { TONE_VAR, type ChartTone } from "@/components/charts/tones";
import { MISSING_TEXT, type InvoiceTarget, type TimelineEvent, type TimelineFind } from "@/lib/timeline";

/**
 * How an event looks in every view of the Zeitstrahl (step 8d): the tone of what it means for the Schlussrechnung.
 * Missing and proven is money green, missing with a gap yellow or orange, missing with a weak Beleg or a Kürzungsrisiko
 * red; invoiced is a quiet grey, nothing to invoice a hollow ring. Invoices are squares in the strong neutral.
 */
export type Meaning = "money" | "gap" | "change" | "risk" | "invoiced" | "next" | "none" | "invoice" | "payment" | "draft" | "cut";

export function meaningOf(e: TimelineEvent, finds: Record<string, TimelineFind>): Meaning {
  if (e.lane === "rechnung") {
    if (e.art === "entwurf") return "draft";
    if (e.art === "korrekturblatt" || e.art === "abzugsschreiben") return "cut";
    if (e.art === "zahlungsavis") return "payment";
    return "invoice";
  }
  if (e.stand === "fehlt") {
    const f = e.finds[0] ? finds[e.finds[0]] : null;
    if (f?.belegstand?.state === "beleg_fehlt") return "gap";
    if (f?.belegstand?.state === "nachtrag_nicht_gelegt") return "change";
    if (e.weak || e.risk) return "risk";
    return "money";
  }
  if (e.stand === "naechste_abschlagsrechnung") return "next";
  if (e.stand === "verrechnet") return "invoiced";
  return "none";
}

const TONE: Partial<Record<Meaning, ChartTone>> = { money: "money", gap: "gap", change: "change", risk: "risk" };
export const toneOf = (m: Meaning): ChartTone | null => TONE[m] ?? null;

const EDGE: Partial<Record<Meaning, string>> = { money: "var(--color-state-green-edge)", gap: "var(--color-state-yellow-edge)", change: "var(--color-state-orange-edge)", risk: "var(--color-state-red-edge)" };

/**
 * The mark as inline style plus classes. A missing event has its own shape as well as its colour, so it reads without
 * colour: belegt a filled circle, Beleg fehlt a hollow ring (the Beleg is missing), Nachtrag nicht gelegt a dashed ring,
 * Kürzungsrisiko a filled circle with a white core. Each has a 1 px contour in its edge colour (at least 3:1 on white).
 */
export function markStyle(m: Meaning, size = 12): { className: string; style: CSSProperties } {
  const tone = toneOf(m);
  const s = (n: number) => ({ width: n, height: n });
  if (tone) {
    const edge = EDGE[m]!;
    if (m === "gap") return { className: "rounded-full bg-surface", style: { ...s(size), boxShadow: `inset 0 0 0 ${size > 9 ? 3 : 2}px ${TONE_VAR[tone]}, inset 0 0 0 1px ${edge}` } };
    if (m === "change") return { className: "rounded-full border-2 border-dashed", style: { ...s(size), borderColor: edge, background: `color-mix(in srgb, ${TONE_VAR[tone]} 35%, white)` } };
    if (m === "risk") return { className: "rounded-full", style: { ...s(size), background: `radial-gradient(circle, white 0 ${Math.max(1.5, size / 6)}px, ${TONE_VAR[tone]} ${Math.max(2, size / 6 + 0.5)}px)`, boxShadow: `inset 0 0 0 1px ${edge}` } };
    return { className: "rounded-full", style: { ...s(size), background: TONE_VAR[tone], boxShadow: `inset 0 0 0 1px ${edge}` } };
  }
  switch (m) {
    case "next":
      return { className: "rounded-full bg-surface", style: { ...s(size), boxShadow: "inset 0 0 0 2px var(--color-fg-secondary)" } };
    case "invoiced":
      return { className: "rounded-full bg-fg-faint", style: s(size - 4) };
    case "invoice":
      return { className: "rounded-[3px] bg-bar-strong", style: s(size) };
    case "payment":
      return { className: "rounded-[3px] bg-surface", style: { ...s(size - 2), boxShadow: "inset 0 0 0 1.5px var(--color-bar-strong)" } };
    case "draft":
      return { className: "rounded-[3px] border-[1.5px] border-dashed border-fg-secondary bg-surface", style: s(size) };
    case "cut":
      return { className: "rounded-[3px] bg-surface", style: { ...s(size - 2), boxShadow: "inset 0 0 0 1.5px var(--color-fg)" } };
    default:
      return { className: "rounded-full bg-surface", style: { ...s(size - 4), boxShadow: "inset 0 0 0 1.5px var(--color-fg-faint)" } };
  }
}

/** The status word an event carries everywhere (never colour alone); missing work by where it belongs. */
export function statusWord(m: Meaning, target: InvoiceTarget = "schlussrechnung"): string | null {
  switch (m) {
    case "money":
      return MISSING_TEXT[target];
    case "gap":
      return "fehlt, Beleg fehlt";
    case "change":
      return "fehlt, Nachtrag nicht gelegt";
    case "risk":
      return "fehlt, mit Kürzungsrisiko";
    case "next":
      return "kommt in die nächste Abschlagsrechnung";
    case "invoiced":
      return "verrechnet";
    case "none":
      return "nichts zu verrechnen";
    default:
      return null;
  }
}

export const isMissing = (m: Meaning) => m === "money" || m === "gap" || m === "change" || m === "risk";

/** The legend of the marks, in the order of the meanings, each with the lane it belongs to. */
export const LEGEND: { m: Meaning; text: string; lane: "baustelle" | "rechnung" }[] = [
  { m: "money", text: "fehlt, belegt", lane: "baustelle" },
  { m: "gap", text: "fehlt, Beleg fehlt", lane: "baustelle" },
  { m: "change", text: "fehlt, Nachtrag nicht gelegt", lane: "baustelle" },
  { m: "risk", text: "fehlt, mit Kürzungsrisiko", lane: "baustelle" },
  { m: "invoiced", text: "verrechnet", lane: "baustelle" },
  { m: "none", text: "nichts zu verrechnen", lane: "baustelle" },
  { m: "invoice", text: "Rechnung", lane: "rechnung" },
  { m: "payment", text: "Zahlung", lane: "rechnung" },
  { m: "draft", text: "Entwurf, nicht gelegt", lane: "rechnung" },
  { m: "cut", text: "Kürzung", lane: "rechnung" },
];
