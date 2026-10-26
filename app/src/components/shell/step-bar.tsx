"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { OVERVIEW_TAB, STEPS, projectHref, type Project } from "@/lib/example";
import { cn } from "@/lib/utils";
import { normalisePath } from "@/lib/navigation";

/**
 * Tabs of the project page (SPEZIFIKATION.md 4.1, calmer in step 8a): one row, "Überblick" first, then the tabs of
 * the three website steps, each group named by its step in 12 px and parted by a thin line. The run steps of the
 * Abschluss-Lauf are not shown until they run (step 9): a chip that always says "offen" says nothing. On phones the
 * row scrolls sideways and the step names give way to the lines, so the content of a tab starts high on the screen.
 */
export function StepBar({ project }: { project: Project }) {
  const path = normalisePath(usePathname());
  const row = useRef<HTMLElement>(null);
  // the group of the open tab in view from its start, without moving the page
  useEffect(() => {
    const group = row.current?.querySelector<HTMLElement>('[aria-current="page"]')?.parentElement;
    if (row.current && group && row.current.scrollWidth > row.current.clientWidth) row.current.scrollLeft = Math.max(0, group.offsetLeft - 16);
  }, [path]);
  const groups = [{ number: 0, title: "", tabs: [OVERVIEW_TAB] }, ...STEPS.map((step, i) => ({ number: i + 1, title: step.title, tabs: step.tabs }))];
  return (
    <nav ref={row} aria-label="Reiter" className="relative flex shrink-0 items-center gap-1 overflow-x-auto px-6 pb-2 shadow-line-bottom [scrollbar-width:none] max-md:px-4 print:hidden">
      {groups.map((g) => (
        <span key={g.number} role="group" aria-label={g.title || undefined} className="flex shrink-0 items-center gap-1">
          {g.number > 0 && (
            <>
              <span aria-hidden className="mx-2 h-4 w-px shrink-0 bg-line max-md:mx-1 max-md:h-5" />
              <span aria-hidden className="mr-1 text-xs whitespace-nowrap text-fg-muted max-md:hidden">
                {g.title}
              </span>
            </>
          )}
          {g.tabs.map((t) => {
            const href = projectHref(project, t.slug);
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-7 shrink-0 items-center rounded-md px-2 whitespace-nowrap outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11 max-md:px-2.5",
                  active ? "bg-sidebar text-fg shadow-ring hover:bg-sidebar" : "text-fg-secondary",
                )}
              >
                {t.title}
              </Link>
            );
          })}
        </span>
      ))}
    </nav>
  );
}
