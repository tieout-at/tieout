"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Circle } from "lucide-react";
import { useEffect, useRef } from "react";

import { OVERVIEW_TAB, STEPS, projectHref, type Project } from "@/lib/example";
import { cn } from "@/lib/utils";
import { normalisePath } from "@/lib/navigation";
import { TabLinks } from "./tab-links";

/**
 * Step bar of the project page (SPEZIFIKATION.md 4.1): the three website steps in order, each with its run steps
 * of the Abschluss-Lauf and its tabs, after the tab "Überblick" of the record itself. Every run step is "offen" until the core runs (step 2 onwards).
 * Side by side from 1024 px; below that one step per row, so nothing runs into the next column. On phones one row of
 * tabs that scrolls sideways, the steps parted by a thin line, so the content of a tab starts high on the screen
 * (customer test of step 6: the full bar took 650 of 844 px).
 */
export function StepBar({ project }: { project: Project }) {
  return (
    <div className="shadow-line-bottom print:hidden">
      <PhoneTabs project={project} />
      <ol className="grid gap-3 px-4 pb-2 max-md:hidden md:px-6 lg:grid-cols-[auto_1fr_1fr_1.35fr] lg:gap-4">
        <li className="flex min-w-0 lg:self-end">
          <TabLinks label="Reiter: Überblick" className="lg:-ml-0.5" tabs={[{ title: OVERVIEW_TAB.title, href: projectHref(project, OVERVIEW_TAB.slug) }]} />
        </li>
        {STEPS.map((step, i) => (
          <li key={step.id} className="flex min-w-0 flex-col gap-2 lg:gap-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-xs bg-fill-hover text-2xs text-count shadow-ring">{i + 1}</span>
              <span className="shrink-0">{step.title}</span>
              <span aria-hidden className="h-px min-w-4 flex-1 bg-line" />
              {i < STEPS.length - 1 && <ChevronRight aria-hidden className="size-4 shrink-0 text-fg-faint max-lg:hidden" />}
            </div>
            <div className="flex flex-col gap-2.5 max-lg:flex-row max-lg:flex-wrap max-lg:items-center max-lg:gap-1">
              <ul className="flex flex-wrap gap-1" aria-label={`Lauf: ${step.title}`}>
                {step.run.map((run) => (
                  <li key={run} className="flex h-6 items-center gap-1 rounded-sm bg-fill-subtle px-1.5 text-xs text-fg-secondary shadow-ring">
                    <Circle aria-hidden className="size-3 text-fg-faint" />
                    {run}
                    <span className="sr-only">: offen</span>
                  </li>
                ))}
              </ul>
              <TabLinks
                label={`Reiter: ${step.title}`}
                className="lg:-ml-0.5"
                tabs={step.tabs.map((t) => ({ title: t.title, href: projectHref(project, t.slug) }))}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function PhoneTabs({ project }: { project: Project }) {
  const path = normalisePath(usePathname());
  const row = useRef<HTMLElement>(null);
  // the step of the open tab in view from its start, without moving the page
  useEffect(() => {
    const group = row.current?.querySelector<HTMLElement>('[aria-current="page"]')?.parentElement;
    if (row.current && group) row.current.scrollLeft = Math.max(0, group.offsetLeft - 16);
  }, [path]);
  const groups = [
    { number: null, tabs: [OVERVIEW_TAB] },
    ...STEPS.map((step, i) => ({ number: i + 1, title: step.title, tabs: step.tabs })),
  ];
  return (
    <nav ref={row} aria-label="Reiter" className="relative flex items-center gap-1 overflow-x-auto px-4 pb-2 [scrollbar-width:none] md:hidden">
      {groups.map((g) => (
        <span key={g.number ?? 0} className="flex shrink-0 items-center gap-1">
          {g.number && <span aria-hidden title={"title" in g ? g.title : undefined} className="mx-1 h-5 w-px shrink-0 bg-line" />}
          {g.tabs.map((t) => {
            const href = projectHref(project, t.slug);
            const active = path === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 shrink-0 items-center rounded-md px-2.5 whitespace-nowrap outline-none focus-visible:outline-2 focus-visible:outline-accent",
                  active ? "bg-sidebar text-fg shadow-ring" : "text-fg-secondary",
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
