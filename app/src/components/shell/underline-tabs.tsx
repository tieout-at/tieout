"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export type UnderlineTab = {
  key: string;
  title: string;
  icon?: LucideIcon;
  count?: number;
  active: boolean;
  /** A link between pages, or a button that switches a panel on the same page. */
  href?: string;
  onSelect?: () => void;
  /** Tooltip, for example the website step a project tab belongs to. */
  hint?: string;
  /** For a tab that switches a panel: the id of that panel. */
  controls?: string;
};

/**
 * One tab row for the whole app (step 8d, Attio's record tabs and Linear's views): 40 px, icon and word in 14 px, an
 * optional count, the open tab in ink with a 2 px ink line under it that slides to the tab chosen next. Groups are parted
 * by a thin line. Links are a `nav` with `aria-current`; buttons are an ARIA tab list. On phones the row scrolls sideways,
 * a soft edge shows there is more, and the open tab scrolls into view.
 */
export function UnderlineTabs({ groups, label, sticky = false, className }: { groups: { title?: string; items: UnderlineTab[] }[]; label: string; sticky?: boolean; className?: string }) {
  const row = useRef<HTMLDivElement>(null);
  const [line, setLine] = useState<{ x: number; w: number } | null>(null);
  const [edges, setEdges] = useState({ left: false, right: false });
  const activeKey = groups.flatMap((g) => g.items).find((t) => t.active)?.key;
  const isTabs = groups.some((g) => g.items.some((t) => !t.href));

  useLayoutEffect(() => {
    const el = row.current;
    if (!el) return;
    const measure = () => {
      const a = el.querySelector<HTMLElement>('[data-active="true"]');
      setLine(a ? { x: a.offsetLeft, w: a.offsetWidth } : null);
      setEdges({ left: el.scrollLeft > 2, right: el.scrollLeft + el.clientWidth < el.scrollWidth - 2 });
    };
    const a = el.querySelector<HTMLElement>('[data-active="true"]');
    if (a && el.scrollWidth > el.clientWidth) el.scrollLeft = Math.max(0, a.offsetLeft - 24);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    el.addEventListener("scroll", measure, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", measure);
    };
  }, [activeKey]);

  const items = groups.map((g, gi) => (
    <span key={gi} role={isTabs ? undefined : "group"} aria-label={isTabs ? undefined : g.title || undefined} className="flex shrink-0 items-stretch">
      {gi > 0 && <span aria-hidden className="mx-2 my-3 w-px shrink-0 bg-line" />}
      {g.items.map((t) => {
        const Icon = t.icon;
        const body = (
          <>
            {Icon && <Icon aria-hidden className={cn("size-4 shrink-0", t.active ? "text-fg" : "text-fg-muted group-hover:text-fg-secondary")} />}
            <span>{t.title}</span>
            {t.count !== undefined && <span className={cn("rounded-[5px] px-1 text-xs tabular-nums", t.active ? "bg-fill-hover text-fg-secondary" : "text-fg-muted")}>{t.count}</span>}
          </>
        );
        const cls = cn(
          "group relative flex h-10 shrink-0 items-center gap-1.5 px-2.5 whitespace-nowrap outline-none transition-colors focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent max-md:h-11",
          t.active ? "font-medium text-fg" : "text-fg-secondary hover:text-fg",
        );
        return t.href ? (
          <Link key={t.key} href={t.href} title={t.hint} aria-current={t.active ? "page" : undefined} data-active={t.active} className={cls}>
            {body}
          </Link>
        ) : (
          <button key={t.key} type="button" role="tab" title={t.hint} aria-selected={t.active} aria-controls={t.controls} id={t.controls ? `tab-${t.controls}` : undefined} data-active={t.active} onClick={t.onSelect} className={cls}>
            {body}
          </button>
        );
      })}
    </span>
  ));

  return (
    <div className={cn("relative shrink-0 bg-surface shadow-line-bottom print:hidden", sticky && "sticky top-0 z-20", className)}>
      <div ref={row} {...(isTabs ? { role: "tablist", "aria-label": label } : {})} className="relative flex items-stretch overflow-x-auto px-4 [scrollbar-width:none] max-md:px-2">
        {isTabs ? items : <nav aria-label={label} className="flex items-stretch">{items}</nav>}
        {line && <span aria-hidden className="pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-fg transition-[left,width] duration-300 ease-soft motion-reduce:transition-none" style={{ left: line.x, width: line.w }} />}
      </div>
      <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-surface via-surface/80 transition-opacity", edges.left ? "opacity-100" : "opacity-0")} />
      <span aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-surface via-surface/80 transition-opacity", edges.right ? "opacity-100" : "opacity-0")} />
    </div>
  );
}
