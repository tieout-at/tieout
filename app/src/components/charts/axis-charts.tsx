"use client";

import Link from "next/link";
import { useState } from "react";

import { useReducedMotion } from "@/components/ui/use-media";
import { cn } from "@/lib/utils";
import { ChartTip, useBox, type TipLine } from "./chart-tip";
import { keep, ticks, TONE_VAR, type ChartTone } from "./tones";

export type BarPart = { id: string; label: string; cent: number; text: string; tone: ChartTone; hatched?: boolean };
export type BarGroup = {
  id: string;
  name: string;
  sub?: React.ReactNode;
  href?: string;
  /** One or more bars per group (for example "zusätzlich verrechenbar" and, apart, "in Klärung"); each bar is a stack of parts of its own amount. */
  bars: { id: string; label: string; text: string; parts: BarPart[] }[];
};

const Hatch = ({ id, tone }: { id: string; tone: ChartTone }) => (
  <pattern id={id} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
    <rect width="5" height="5" fill={TONE_VAR[tone]} opacity="0.3" />
    <rect width="2.2" height="5" fill={TONE_VAR[tone]} />
  </pattern>
);

/**
 * Horizontal bars on a real axis (step 8d): names left, one row per group, its bars stacked from zero on a shared
 * scale with round ticks and hairline grid, the amount at the end of each bar. Two bars in a group stand one under
 * the other and are never stacked onto each other (two money words are never added). Pointing at a row lights it
 * and opens the card with its parts; a row with a target is a link.
 */
export function HBarChart({ groups, label, onHover, active, unit = "Euro" }: { groups: BarGroup[]; label: string; onHover?: (id: string | null) => void; active?: string | null; unit?: string }) {
  const [box, w] = useBox<HTMLDivElement>(700);
  const [own, setOwn] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; g: BarGroup } | null>(null);
  const still = useReducedMotion();
  const hot = active ?? own;
  const nameW = Math.min(260, Math.max(130, w * 0.28));
  const valueW = 92;
  const plotW = Math.max(80, w - nameW - valueW - 16);
  const max = Math.max(...groups.flatMap((g) => g.bars.map((b) => b.parts.reduce((s, p) => s + p.cent, 0))), 1);
  const axis = ticks(max);
  const top = axis[axis.length - 1].cent;
  const x = (c: number) => (c / top) * plotW;
  const barH = 12;
  const rowGap = 6;
  const set = (id: string | null) => {
    setOwn(id);
    onHover?.(id);
  };
  const rows = groups.reduce<{ g: BarGroup; y: number; h: number }[]>((list, g) => {
    const y = list.length ? list[list.length - 1].y + list[list.length - 1].h : 0;
    return [...list, { g, y, h: Math.max(44, g.bars.length * (barH + rowGap) + 16) }];
  }, []);
  const total = rows.length ? rows[rows.length - 1].y + rows[rows.length - 1].h : 0;
  // narrow: name and its line over the full width, the bars under it on the same scale, the amount after each bar, no axis
  if (w < 520)
    return (
      <figure aria-label={label}>
        <ul ref={box as unknown as React.Ref<HTMLUListElement>} className="flex flex-col gap-1">
          {groups.map((g) => {
            const head = (
              <span className="flex flex-col">
                <span className="font-medium">{g.name}</span>
                {g.sub && <span className="text-xs text-fg-muted">{g.sub}</span>}
              </span>
            );
            return (
              <li key={g.id} className="flex flex-col gap-1.5 rounded-md px-1 py-2">
                {g.href ? (
                  <Link href={g.href} className="flex min-h-11 items-center rounded-md outline-none focus-visible:outline-2 focus-visible:outline-accent">
                    {head}
                  </Link>
                ) : (
                  head
                )}
                {g.bars.map((b) => {
                  const parts = b.parts.filter((p) => p.cent > 0);
                  const sum = parts.reduce((s, p) => s + p.cent, 0);
                  return (
                    <span key={b.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
                      <span className="flex h-2.5 gap-0.5" style={{ width: `${(sum / top) * 100}%`, minWidth: 6 }} aria-hidden>
                        {parts.map((p, i) => (
                          <span
                            key={p.id}
                            className={cn("h-full", i === parts.length - 1 && "rounded-r-[4px]")}
                            style={{ flex: p.cent, background: p.hatched ? `repeating-linear-gradient(45deg, ${TONE_VAR[p.tone]} 0 2px, color-mix(in srgb, ${TONE_VAR[p.tone]} 30%, transparent) 2px 4px)` : TONE_VAR[p.tone] }}
                          />
                        ))}
                      </span>
                      <span className="text-xs tabular-nums whitespace-nowrap">
                        <span className="text-fg-muted">{b.label} </span>
                        {keep(b.text)}
                      </span>
                    </span>
                  );
                })}
              </li>
            );
          })}
        </ul>
      </figure>
    );
  return (
    <figure aria-label={label} className="flex flex-col gap-1">
      <div ref={box} className="relative" style={{ height: total + 26 }} onPointerLeave={() => { set(null); setTip(null); }}>
        <svg aria-hidden width={w} height={total + 26} className="absolute inset-0 overflow-visible">
          <defs>
            {groups.flatMap((g) => g.bars.flatMap((b) => b.parts.filter((p) => p.hatched).map((p) => <Hatch key={`${g.id}-${b.id}-${p.id}`} id={`hb-${g.id}-${b.id}-${p.id}`} tone={p.tone} />)))}
          </defs>
          {axis.map((t) => (
            <g key={t.cent} transform={`translate(${nameW + x(t.cent)},0)`}>
              <line y1={0} y2={total} stroke="var(--color-line)" />
              <text y={total + 16} textAnchor="middle" className="fill-fg-muted text-[11px] tabular-nums">
                {t.text}
              </text>
            </g>
          ))}
          <text x={nameW - 10} y={total + 16} textAnchor="end" className="fill-fg-muted text-[11px]">
            {unit}
          </text>
          {rows.map(({ g, y: gy, h }) =>
            g.bars.map((b, bi) => {
              const by = gy + (h - g.bars.length * (barH + rowGap) + rowGap) / 2 + bi * (barH + rowGap);
              let acc = 0;
              const parts = b.parts.filter((p) => p.cent > 0);
              return (
                <g key={`${g.id}-${b.id}`} className={cn(!still && "transition-opacity duration-300", hot && hot !== g.id && "opacity-35")}>
                  {parts.map((p, i) => {
                    const px = nameW + x(acc);
                    const pw = Math.max(2, x(p.cent) - (i < parts.length - 1 ? 2 : 0));
                    acc += p.cent;
                    const last = i === parts.length - 1;
                    return <rect key={p.id} x={px} y={by} width={pw} height={barH} rx={last ? 4 : 0} fill={p.hatched ? `url(#hb-${g.id}-${b.id}-${p.id})` : TONE_VAR[p.tone]} className={cn(!still && "transition-[width,x] duration-500 ease-soft")} />;
                  })}
                  <text x={nameW + x(acc) + 8} y={by + barH / 2 + 4} className="fill-fg text-xs tabular-nums">
                    {keep(b.text)}
                  </text>
                </g>
              );
            }),
          )}
        </svg>
        {rows.map(({ g, y: gy, h }) => {
          const inner = (
            <span className="flex min-w-0 flex-col justify-center" style={{ width: nameW - 12 }}>
              <span className="truncate font-medium">{g.name}</span>
              {g.sub && <span className="truncate text-xs text-fg-muted">{g.sub}</span>}
            </span>
          );
          const cls = cn("absolute left-0 flex items-center rounded-md pl-2 outline-none focus-visible:outline-2 focus-visible:outline-accent", hot === g.id && "bg-fill-hover");
          const style = { top: gy, height: h, width: w };
          const events = {
            onPointerEnter: () => {
              set(g.id);
              setTip({ x: nameW + plotW * 0.6, y: gy + 4, g });
            },
            onFocus: () => {
              set(g.id);
              setTip({ x: nameW + plotW * 0.6, y: gy + 4, g });
            },
            onBlur: () => {
              set(null);
              setTip(null);
            },
          };
          return g.href ? (
            <Link key={g.id} href={g.href} className={cls} style={style} {...events}>
              {inner}
            </Link>
          ) : (
            <div key={g.id} tabIndex={0} className={cls} style={style} {...events}>
              {inner}
            </div>
          );
        })}
        <ChartTip
          at={tip ? { x: tip.x, y: tip.y } : null}
          box={{ w, h: total }}
          title={tip?.g.name ?? ""}
          lines={(tip?.g.bars ?? []).flatMap((b): TipLine[] => (b.parts.length > 1 ? [{ label: b.label, value: b.text }, ...b.parts.filter((p) => p.cent > 0 && p.text).map((p) => ({ label: `davon ${p.label}`, value: p.text, dot: TONE_VAR[p.tone] }))] : [{ label: b.label, value: b.text, dot: TONE_VAR[b.parts[0]?.tone ?? "neutral"] }]))}
        />
      </div>
    </figure>
  );
}

export type Column = { id: string; label: string; sub?: string; href?: string; parts: BarPart[]; text?: string };

/**
 * Columns on a real axis (step 8d): round ticks on the left with a hairline grid, one column per item (at most 24 px
 * wide, 4 px round top), parts stacked from the baseline with 2 px between them, the label under it. Pointing at a
 * column lights it and opens its card. For counts pass `unit` and integer values in `cent`.
 */
export function ColumnChart({ columns, label, height = 200, unit = "Euro", format }: { columns: Column[]; label: string; height?: number; unit?: string; format?: (v: number) => string }) {
  const [box, w] = useBox<HTMLDivElement>(500);
  const [hot, setHot] = useState<string | null>(null);
  const still = useReducedMotion();
  const max = Math.max(...columns.map((c) => c.parts.reduce((s, p) => s + p.cent, 0)), 1);
  const axis = format ? countTicks(max) : ticks(max);
  const top = axis[axis.length - 1].cent;
  const left = 44;
  const plotW = Math.max(60, w - left - 8);
  const slot = plotW / Math.max(columns.length, 1);
  const colW = Math.min(28, slot * 0.5);
  const y = (v: number) => height - (v / top) * height;
  const shown = hot ? columns.find((c) => c.id === hot) : null;
  return (
    <figure aria-label={label} className="flex flex-col">
      <div ref={box} className="relative" style={{ height: height + 40 }} onPointerLeave={() => setHot(null)}>
        <svg aria-hidden width={w} height={height + 40} className="absolute inset-0 overflow-visible">
          <defs>{columns.flatMap((c) => c.parts.filter((p) => p.hatched).map((p) => <Hatch key={`${c.id}-${p.id}`} id={`cc-${c.id}-${p.id}`} tone={p.tone} />))}</defs>
          {axis.map((t) => (
            <g key={t.cent} transform={`translate(0,${y(t.cent) + 8})`}>
              <line x1={left} x2={w} stroke="var(--color-line)" />
              <text x={left - 8} y={4} textAnchor="end" className="fill-fg-muted text-[11px] tabular-nums">
                {format ? format(t.cent) : t.text}
              </text>
            </g>
          ))}
          <text x={0} y={0} className="fill-fg-muted text-[11px]">
            {unit}
          </text>
          {columns.map((c, i) => {
            const cx = left + slot * i + slot / 2;
            let acc = 0;
            const parts = c.parts.filter((p) => p.cent > 0);
            return (
              <g key={c.id} className={cn(!still && "transition-opacity duration-300", hot && hot !== c.id && "opacity-35")}>
                {parts.map((p, pi) => {
                  const y0 = y(acc) + 8;
                  acc += p.cent;
                  const y1 = y(acc) + 8;
                  const last = pi === parts.length - 1;
                  const hgt = Math.max(2, y0 - y1 - (pi > 0 ? 2 : 0));
                  return <rect key={p.id} x={cx - colW / 2} y={y1} width={colW} height={hgt} rx={last ? 4 : 0} fill={p.hatched ? `url(#cc-${c.id}-${p.id})` : TONE_VAR[p.tone]} className={cn(!still && "transition-[height,y] duration-500 ease-soft")} />;
                })}
              </g>
            );
          })}
        </svg>
        {columns.map((c, i) => {
          const cx = left + slot * i + slot / 2;
          const inner = (
            <>
              <span className="absolute inset-x-0 top-0" style={{ height: height + 8 }} />
              <span className="absolute inset-x-0 flex flex-col items-center text-center" style={{ top: height + 14 }}>
                <span className={cn("max-w-full truncate text-xs", hot === c.id ? "text-fg" : "text-fg-secondary")}>{c.label}</span>
                {c.sub && <span className="max-w-full truncate text-[11px] text-fg-muted">{c.sub}</span>}
              </span>
            </>
          );
          const cls = "absolute outline-none focus-visible:outline-2 focus-visible:outline-accent rounded-md";
          const style = { left: cx - slot / 2, width: slot, top: 0, height: height + 40 };
          const ev = { onPointerEnter: () => setHot(c.id), onFocus: () => setHot(c.id), onBlur: () => setHot(null) };
          return c.href ? (
            <Link key={c.id} href={c.href} aria-label={`${c.label} ${c.text ?? ""}`} className={cls} style={style} {...ev}>
              {inner}
            </Link>
          ) : (
            <div key={c.id} tabIndex={0} aria-label={`${c.label} ${c.text ?? ""}`} className={cls} style={style} {...ev}>
              {inner}
            </div>
          );
        })}
        <ChartTip
          at={shown ? { x: left + slot * columns.indexOf(shown) + slot / 2, y: y(shown.parts.reduce((s, p) => s + p.cent, 0)) } : null}
          box={{ w, h: height }}
          title={shown ? `${shown.label}${shown.text ? `: ${shown.text}` : ""}` : ""}
          lines={(shown?.parts ?? []).filter((p) => p.cent > 0).map((p) => ({ label: p.label, value: p.text, dot: TONE_VAR[p.tone] }))}
        />
      </div>
    </figure>
  );
}

function countTicks(max: number) {
  const step = max <= 5 ? 1 : max <= 10 ? 2 : max <= 25 ? 5 : 10;
  const out: { cent: number; text: string }[] = [];
  for (let v = 0; v < max + step; v += step) out.push({ cent: v, text: String(v) });
  return out;
}
