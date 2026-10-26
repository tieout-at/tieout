/**
 * The meanings a chart may colour (step 8d). Every chart takes a tone, never a raw colour, so the palette lives in the
 * tokens of globals.css alone. Money words keep the colours of the Übersicht; neutral is what is invoiced or paid.
 */
export type ChartTone = "money" | "risk" | "gap" | "change" | "neutral" | "strong" | "ink" | "track" | "s1" | "s2" | "s3";

export const TONE_VAR: Record<ChartTone, string> = {
  money: "var(--color-data-money)",
  risk: "var(--color-data-risk)",
  gap: "var(--color-data-gap)",
  change: "var(--color-data-change)",
  neutral: "var(--color-bar)",
  strong: "var(--color-bar-strong)",
  ink: "var(--color-fg)",
  track: "var(--color-track)",
  s1: "var(--color-series-1)",
  s2: "var(--color-series-2)",
  s3: "var(--color-series-3)",
};

export const TONE_BG: Record<ChartTone, string> = {
  money: "bg-data-money",
  risk: "bg-data-risk",
  gap: "bg-data-gap",
  change: "bg-data-change",
  neutral: "bg-bar",
  strong: "bg-bar-strong",
  ink: "bg-fg",
  track: "bg-track",
  s1: "bg-series-1",
  s2: "bg-series-2",
  s3: "bg-series-3",
};

/** An amount never breaks before its euro sign. */
export const keep = (text: string) => text.replace(/ €/g, " €");

/** Axis ticks: round steps (1, 2, 2,5, 5 × 10ⁿ) from zero to at least `max`, written without the euro sign (the axis says it). */
export function ticks(maxCent: number, count = 4): { cent: number; text: string }[] {
  const max = Math.max(maxCent, 100);
  const raw = max / count;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw)!;
  const out: { cent: number; text: string }[] = [];
  for (let v = 0; v < max + step * 0.999; v += step) out.push({ cent: v, text: tickText(v) });
  return out;
}

// whole euros with the thousands dot ("15.000"), so a tick never reads as an amount of the core
const tickText = (cent: number) => Math.round(cent / 100).toLocaleString("de-AT").replace(/\s/g, ".");
