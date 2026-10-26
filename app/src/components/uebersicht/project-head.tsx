"use client";

import Link from "next/link";
import { Check, ChevronsUpDown, Layers } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { StatusColour } from "@/lib/kern-data";
import type { TwinView } from "@/lib/twin";
import { cn } from "@/lib/utils";

export type ProjectLink = { slug: string; name: string; href: string; colour: StatusColour; status: string };

const DOT: Record<StatusColour, string> = {
  rot: "bg-state-red",
  gelb: "bg-state-yellow",
  gruen: "bg-state-green",
  grau: "bg-state-grey",
};

/** Name block of the page and the project selector: one link per open project (closed projects have no overview). */
export function ProjectHead({ view, projects }: { view: TwinView; projects: ProjectLink[] }) {
  const p = view.project;
  return (
    <div className="flex items-start gap-3 px-6 pt-5 pb-2 max-md:flex-col max-md:items-stretch max-md:px-4 max-md:pt-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-fg-secondary shadow-ring" aria-hidden>
            <Layers className="size-4" />
          </span>
          <h1 className="truncate text-lg font-semibold">Übersicht</h1>
        </div>
        {/* separators sit before each fact; the one that starts a wrapped line is clipped by the negative margin */}
        <div className="pl-9 text-fg-secondary max-md:pl-0 max-md:pt-1">
          <p className="overflow-hidden">
          <span className="-ml-4 flex flex-wrap max-md:ml-0 max-md:flex-col">
            {[
              <span key="c">{p.client}</span>,
              ...(p.date ? [<span key="d">{p.date.label} {p.date.text}</span>] : []),
            ].map((fact) => (
              <span key={fact.key} className="flex items-center whitespace-nowrap before:w-4 before:shrink-0 before:text-center before:text-fg-faint before:content-['·'] max-md:before:hidden">
                {fact}
              </span>
            ))}
          </span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <span className="text-xs text-fg-secondary">Projekt</span>
        <DropdownMenu>
          <DropdownMenuTrigger className="flex h-7 min-w-0 items-center gap-1.5 rounded-md bg-surface py-1 pr-1.5 pl-2 shadow-button outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover max-md:h-11 max-md:flex-1 max-md:px-3">
            <i className={cn("size-2 shrink-0 rounded-full", DOT[p.status.colour])} aria-hidden />
            <span className="truncate">{p.name}</span>
            <ChevronsUpDown className="size-3.5 shrink-0 text-fg-secondary max-md:ml-auto" aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuGroup>
              <DropdownMenuLabel>Offene Projekte</DropdownMenuLabel>
              {projects.map((x) => (
                <DropdownMenuItem key={x.slug} render={<Link href={x.href} />}>
                  <i className={cn("size-2 shrink-0 rounded-full", DOT[x.colour])} aria-hidden />
                  <span className="flex-1 truncate">{x.name}</span>
                  {x.slug === p.slug && <Check aria-label="geöffnet" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
