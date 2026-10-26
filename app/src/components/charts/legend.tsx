import { cn } from "@/lib/utils";
import { keep, TONE_VAR, type ChartTone } from "./tones";

/**
 * The legend of a chart: a swatch and a word per tone (identity is never colour alone), hatched where the chart hatches,
 * an optional amount after the word. 12 px, in one row that wraps.
 */
export function Legend({ items, className }: { items: { tone: ChartTone; label: string; text?: string; hatched?: boolean; hollow?: boolean }[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-fg-secondary", className)}>
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("size-2.5 shrink-0 rounded-[3px]", i.hollow && "bg-transparent ring-[1.5px] ring-inset")}
            style={
              i.hollow
                ? { color: TONE_VAR[i.tone], boxShadow: `inset 0 0 0 1.5px ${TONE_VAR[i.tone]}` }
                : i.hatched
                  ? { background: `repeating-linear-gradient(45deg, ${TONE_VAR[i.tone]} 0 2px, color-mix(in srgb, ${TONE_VAR[i.tone]} 30%, transparent) 2px 4px)` }
                  : { background: TONE_VAR[i.tone] }
            }
          />
          {i.label}
          {i.text && <span className="text-fg tabular-nums">{keep(i.text)}</span>}
        </li>
      ))}
    </ul>
  );
}
