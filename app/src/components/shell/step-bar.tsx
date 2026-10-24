"use client";

import { ChevronRight, Circle } from "lucide-react";

import { OVERVIEW_TAB, STEPS, projectHref, type Project } from "@/lib/example";
import { TabLinks } from "./tab-links";

/**
 * Step bar of the project page (SPEZIFIKATION.md 4.1): the three website steps in order, each with its run steps
 * of the Abschluss-Lauf and its tabs, after the tab "Überblick" of the record itself. Every run step is "offen" until the core runs (step 2 onwards).
 * Side by side from 1024 px; below that one step per row, so nothing runs into the next column.
 */
export function StepBar({ project }: { project: Project }) {
  return (
    <div className="shadow-line-bottom">
      <ol className="grid gap-3 px-4 pb-2 md:px-6 lg:grid-cols-[auto_1fr_1fr_1.35fr] lg:gap-4">
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
