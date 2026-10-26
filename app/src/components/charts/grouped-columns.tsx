"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { useMediaQuery, useReducedMotion } from "@/components/ui/use-media";
import { cn } from "@/lib/utils";
import { ChartTip, useBox, type TipLine } from "./chart-tip";
import { keep, ticks, TONE_VAR, type ChartTone } from "./tones";

export type StackPart = { id: string; label: string; cent: number; text: string; tone: ChartTone; hatched?: boolean };
export type Stack = {
  id: string;
  /** What the column is ("zusätzlich verrechenbar", "in Klärung", "Kürzungen" ...), named in the hover card. */
  label: string;
  /** The core's amount of the whole column, printed on its top; null for an empty column. */
  text: string | null;
  parts: StackPart[];
  /** A column drawn as a dashed outline (announced, not yet withheld). */
  hollow?: boolean;
  /** Said under an empty column ("keine"). */
  empty?: string;
  /** Extra lines of the hover card (for example the reasons of the cuts). */
  more?: TipLine[];
};
export type ColumnGroup = { id: string; label: string; sub?: string; href?: string; stacks: Stack[] };

const Hatch = ({ id, tone }: { id: string; tone: ChartTone }) => (
  <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="5" height="5" fill={TONE_VAR[tone]} opacity="0.3" />
    <rect width="2.2" height="5" fill={TONE_VAR[tone]} />
  </pattern>
);

/**
 * Columns grouped on a real axis (step 8d, Berichte): one group per project or Auftraggeber, its columns side by side
 * (never stacked onto each other, so two money words are never added), each column a stack of the parts of its own
 * amount with 2 px between them, a 4 px round top, its amount above it. Round ticks on the left with a hairline grid.
 * Pointing at or focusing a group lights it (and, through `onHover`, the same project in other charts) and opens its
 * card; `active` lights a group from outside.
 */
export function GroupedColumns({
  groups,
  label,
  height = 210,
  unit = "Euro",
  active,
  onHover,
}: {
  groups: ColumnGroup[];
  label: string;
  height?: number;
  unit?: string;
  active?: string | null;
  onHover?: (id: string | null) => void;
}) {
  const phone = useMediaQuery("(max-width: 767px)", false);
  const [box, w] = useBox<HTMLDivElement>(600);
  const [own, setOwn] = useState<string | null>(null);
  // pattern ids from indices: project names carry spaces, which break url(#…)
  const uid = useId().replace(/:/g, "");
  const pid = (gi: number, si: number, pi: number) => `gc-${uid}-${gi}-${si}-${pi}`;
  const still = useReducedMotion();
  const hot = own ?? active ?? null;
  const set = (id: string | null) => {
    setOwn(id);
    onHover?.(id);
  };
  const max = Math.max(...groups.flatMap((g) => g.stacks.map((s) => s.parts.reduce((t, p) => t + p.cent, 0))), 1);
  const axis = ticks(max);
  const top = axis[axis.length - 1].cent;
  const left = 46;
  const head = 18;
  const plotW = Math.max(80, w - left - 4);
  const slot = plotW / Math.max(groups.length, 1);
  const n = Math.max(...groups.map((g) => g.stacks.length), 1);
  // a column is spaced by the widest amount printed on a column, so two amounts side by side never touch
  const labelW = Math.max(40, ...groups.flatMap((g) => g.stacks.map((s) => (s.text ? keep(s.text).length * 6.3 : 0))));
  const colW = Math.min(30, (slot * 0.62) / n);
  const gap = Math.max(Math.min(8, colW * 0.3), Math.min(labelW + 6 - colW, (slot * 0.94) / n - colW));
  const y = (v: number) => head + height - (v / top) * height;
  const shown = own ? groups.find((g) => g.id === own) : null;
  const colX = (gi: number, si: number, count: number) => left + slot * gi + slot / 2 - (count * colW + (count - 1) * gap) / 2 + si * (colW + gap);
  if (phone) return <PhoneBars groups={groups} label={label} hot={hot} set={set} />;
  return (
    <figure aria-label={label} className="flex flex-col">
      <div ref={box} className="relative" style={{ height: head + height + 44 }} onPointerLeave={() => set(null)}>
        <svg aria-hidden width={w} height={head + height + 44} className="absolute inset-0 overflow-visible">
          <defs>{groups.flatMap((g, gi) => g.stacks.flatMap((s, si) => s.parts.flatMap((p, pi) => (p.hatched ? [<Hatch key={pid(gi, si, pi)} id={pid(gi, si, pi)} tone={p.tone} />] : []))))}</defs>
          {axis.map((t) => (
            <g key={t.cent} transform={`translate(0,${y(t.cent)})`}>
              <line x1={left} x2={w} stroke={t.cent === 0 ? "var(--color-fg-faint)" : "var(--color-line)"} />
              <text x={left - 8} y={4} textAnchor="end" className="fill-fg-muted text-[11px] tabular-nums">
                {t.text}
              </text>
            </g>
          ))}
          <text x={left - 8} y={8} textAnchor="end" className="fill-fg-muted text-[11px]">
            {unit}
          </text>
          {groups.map((g, gi) => (
            <g key={g.id} className={cn(!still && "transition-opacity duration-300", hot && hot !== g.id && "opacity-30")}>
              {g.stacks.map((s, si) => {
                const all = s.parts;
                const x0 = colX(gi, si, g.stacks.length);
                const parts = s.parts.filter((p) => p.cent > 0);
                const sum = parts.reduce((t, p) => t + p.cent, 0);
                // an empty column is a short mark on the baseline; what it means stands under the group
                if (!parts.length) return <line key={s.id} x1={x0 + 4} x2={x0 + colW - 4} y1={y(0) - 1.5} y2={y(0) - 1.5} stroke="var(--color-fg-faint)" strokeWidth={2} strokeLinecap="round" />;
                if (s.hollow)
                  return (
                    <g key={s.id}>
                      <rect
                        x={x0 + 0.75}
                        y={y(sum) + 0.75}
                        width={colW - 1.5}
                        height={Math.max(2, y(0) - y(sum) - 1.5)}
                        rx={4}
                        fill="none"
                        stroke={TONE_VAR[parts[0].tone]}
                        strokeWidth={1.5}
                        strokeDasharray="4 3"
                      />
                      <text x={x0 + colW / 2} y={y(sum) - 6} textAnchor="middle" className="fill-fg-secondary text-[11px] tabular-nums">
                        {s.text ? keep(s.text) : ""}
                      </text>
                    </g>
                  );
                let acc = 0;
                return (
                  <g key={s.id}>
                    {parts.map((p, pi) => {
                      const y0 = y(acc);
                      acc += p.cent;
                      const y1 = y(acc);
                      const last = pi === parts.length - 1;
                      const h = Math.max(2, y0 - y1 - (pi > 0 ? 2 : 0));
                      return (
                        <path
                          key={p.id}
                          d={last ? roundTop(x0, y1, colW, h, Math.min(4, h)) : `M${x0} ${y1}h${colW}v${h}h${-colW}Z`}
                          fill={p.hatched ? `url(#${pid(gi, si, all.indexOf(p))})` : TONE_VAR[p.tone]}
                          className={cn(!still && "transition-[d] duration-500 ease-soft")}
                        />
                      );
                    })}
                    <text x={x0 + colW / 2} y={y(sum) - 6} textAnchor="middle" className="fill-fg text-[11px] tabular-nums">
                      {s.text ? keep(s.text) : ""}
                    </text>
                  </g>
                );
              })}
            </g>
          ))}
        </svg>
        {groups.map((g, gi) => {
          const inner = (
            <span className="absolute inset-x-1 flex flex-col items-center text-center" style={{ top: head + height + 8 }}>
              <span className={cn("max-w-full truncate text-xs", hot === g.id ? "text-fg" : "text-fg-secondary")}>{g.label}</span>
              {subOf(g) && <span className="max-w-full truncate text-[11px] text-fg-muted">{subOf(g)}</span>}
            </span>
          );
          const cls = cn("absolute rounded-lg outline-none focus-visible:outline-2 focus-visible:outline-accent", hot === g.id && "bg-fill-subtle");
          const style = { left: left + slot * gi, width: slot, top: 0, height: head + height + 44 };
          const aria = `${g.label}: ${g.stacks.map((s) => `${s.label} ${s.text ?? s.empty ?? ""}`).join(", ")}`;
          const ev = { onPointerEnter: () => set(g.id), onFocus: () => set(g.id), onBlur: () => set(null) };
          return g.href ? (
            <Link key={g.id} href={g.href} aria-label={aria} className={cls} style={style} {...ev}>
              {inner}
            </Link>
          ) : (
            <div key={g.id} tabIndex={0} role="group" aria-label={aria} className={cls} style={style} {...ev}>
              {inner}
            </div>
          );
        })}
        <ChartTip
          at={shown ? { x: left + slot * groups.indexOf(shown) + slot / 2, y: y(Math.max(...shown.stacks.map((s) => s.parts.reduce((t, p) => t + p.cent, 0)))) } : null}
          box={{ w, h: head + height }}
          title={shown?.label ?? ""}
          lines={(shown?.stacks ?? []).flatMap((s): TipLine[] => [
            { label: s.label, value: s.text ?? s.empty ?? "", dot: s.parts[0] ? TONE_VAR[s.parts[0].tone] : undefined },
            ...(s.parts.filter((p) => p.cent > 0).length > 1 ? s.parts.filter((p) => p.cent > 0 && p.text).map((p) => ({ label: `davon ${p.label}`, value: p.text, dot: TONE_VAR[p.tone] })) : []),
            ...(s.more ?? []),
          ])}
        />
      </div>
    </figure>
  );
}

/** The group's quiet line, with what an empty column means ("nichts in Klärung"). */
const subOf = (g: ColumnGroup) => [g.sub, ...g.stacks.filter((s) => !s.parts.some((p) => p.cent > 0) && s.empty).map((s) => s.empty)].filter(Boolean).join(", ");

/**
 * The phone form of the grouped columns: one block per group with its full name, each column as a horizontal bar on a
 * shared scale with its label and amount, no axis and no rotated text.
 */
function PhoneBars({ groups, label, hot, set }: { groups: ColumnGroup[]; label: string; hot: string | null; set: (id: string | null) => void }) {
  const max = Math.max(...groups.flatMap((g) => g.stacks.map((s) => s.parts.reduce((t, p) => t + p.cent, 0))), 1);
  return (
    <ul aria-label={label} className="flex flex-col">
      {groups.map((g) => {
        const head = g.href ? (
          <Link href={g.href} className="link-quiet font-medium" onFocus={() => set(g.id)} onBlur={() => set(null)}>
            {g.label}
          </Link>
        ) : (
          <span className="font-medium">{g.label}</span>
        );
        return (
          <li key={g.id} className={cn("flex flex-col gap-1.5 py-2.5 transition-opacity [&:not(:last-child)]:shadow-line-bottom", hot && hot !== g.id && "opacity-40")}>
            <span className="flex flex-col">
              {head}
              {g.sub && <span className="text-xs text-fg-muted">{g.sub}</span>}
            </span>
            {g.stacks.map((s) => {
              const parts = s.parts.filter((p) => p.cent > 0);
              const sum = parts.reduce((t, p) => t + p.cent, 0);
              return (
                <span key={s.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-xs">
                  <span className="text-fg-secondary">{s.label}</span>
                  <span className="text-right text-sm tabular-nums whitespace-nowrap">{s.text ? keep(s.text) : (s.empty ?? "")}</span>
                  {parts.length > 0 && (
                    <span aria-hidden className="col-span-2 flex h-2.5 gap-0.5" style={{ width: `${Math.max(3, (sum / max) * 100)}%` }}>
                      {parts.map((p, i) => (
                        <span
                          key={p.id}
                          className={cn("h-full", i === parts.length - 1 && "rounded-r-[4px]")}
                          style={{
                            width: `${(p.cent / sum) * 100}%`,
                            background: s.hollow
                              ? "transparent"
                              : p.hatched
                                ? `repeating-linear-gradient(45deg, ${TONE_VAR[p.tone]} 0 2px, color-mix(in srgb, ${TONE_VAR[p.tone]} 30%, transparent) 2px 4px)`
                                : TONE_VAR[p.tone],
                            border: s.hollow ? `1.5px dashed ${TONE_VAR[p.tone]}` : undefined,
                          }}
                        />
                      ))}
                    </span>
                  )}
                </span>
              );
            })}
          </li>
        );
      })}
    </ul>
  );
}

const roundTop = (x: number, y: number, w: number, h: number, r: number) => `M${x} ${y + h}V${y + r}Q${x} ${y} ${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h}Z`;
