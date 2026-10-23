"use client";

import Link from "next/link";
import { ChevronRight, CircleHelp, ExternalLink, Menu, PanelLeft, Search } from "lucide-react";

import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ALL } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useModifierLabel, useShell } from "./shell-state";

export type Crumb = { label: string; href?: string };

/**
 * Header of every page (Attio: 48 px, line below, title left, help right). `destination` is the sidebar entry the
 * page belongs to; `trail` adds the record after it ("Projekte › Wohnpark Mooshaim"). Without a trail the title is
 * the page's h1 unless `heading` is off.
 */
export function PageHeader({
  destination,
  title,
  trail = [],
  heading = true,
}: {
  destination?: string;
  title?: string;
  trail?: Crumb[];
  heading?: boolean;
}) {
  const { collapsed, toggleCollapsed, setMobileOpen, setSearchOpen } = useShell();
  const page = ALL.find((d) => d.id === destination);
  const Icon = page?.icon;
  const crumbs: Crumb[] = [{ label: title ?? page?.title ?? "", href: trail.length ? page?.href : undefined }, ...trail];

  return (
    <header className="flex h-[var(--header-height)] shrink-0 items-center gap-1.5 px-3 shadow-line-bottom">
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Navigation öffnen"
        className="flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover md:hidden"
      >
        <Menu className="size-[18px]" aria-hidden />
      </button>
      {collapsed && (
        <Tooltip>
          <TooltipTrigger
            onClick={toggleCollapsed}
            aria-label="Seitenleiste einblenden"
            className="hidden size-7 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover hover:text-fg md:flex"
          >
            <PanelLeft className="size-[18px]" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Seitenleiste einblenden</TooltipContent>
        </Tooltip>
      )}
      {heading && trail.length === 0 ? (
        <h1 className="flex h-7 min-w-0 flex-1 items-center gap-1.5 pr-1.5 pl-1 text-sm font-medium">
          {Icon && <Icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />}
          <span className="truncate">{crumbs[0].label}</span>
        </h1>
      ) : (
      <nav aria-label="Pfad" className="flex min-w-0 flex-1 items-center">
        <ol className="flex min-w-0 items-center gap-0.5">
          {crumbs.map((crumb, i) => {
            const last = i === crumbs.length - 1;
            const content = (
              <>
                {i === 0 && Icon && <Icon className="size-4 shrink-0 text-fg-secondary" aria-hidden />}
                <span className="truncate">{crumb.label}</span>
              </>
            );
            return (
              <li key={`${crumb.label}-${i}`} className={cn("flex min-w-0 items-center gap-0.5", !last && "max-md:hidden")}>
                {crumb.href && !last ? (
                  <Link href={crumb.href} className="flex h-7 min-w-0 items-center gap-1.5 rounded-md pr-1.5 pl-1 text-fg-secondary hover:bg-fill-hover hover:text-fg">
                    {content}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className="flex h-7 min-w-0 items-center gap-1.5 pr-1.5 pl-1">
                    {content}
                  </span>
                )}
                {!last && <ChevronRight className="size-3.5 shrink-0 text-fg-faint" aria-hidden />}
              </li>
            );
          })}
        </ol>
      </nav>
      )}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Suche öffnen"
        className="flex size-11 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover md:hidden"
      >
        <Search className="size-[18px]" aria-hidden />
      </button>
      <HelpMenu />
    </header>
  );
}

function HelpMenu() {
  const { setSearchOpen } = useShell();
  const mod = useModifierLabel();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex h-7 items-center gap-1.5 rounded-md py-1 pr-2 pl-1.5 text-fg-help outline-none hover:bg-fill-hover hover:text-fg focus-visible:outline-2 focus-visible:outline-accent data-popup-open:bg-fill-hover max-md:size-11 max-md:justify-center max-md:p-0">
        <CircleHelp className="size-4" aria-hidden />
        <span className="max-md:sr-only">Hilfe</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Hilfe</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setSearchOpen(true)}>
            <Search />
            <span className="flex-1">Suche</span>
            <KbdGroup>
              <Kbd>{mod}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
          </DropdownMenuItem>
          <DropdownMenuItem render={<a href="https://tieout-at.pages.dev" target="_blank" rel="noreferrer" />}>
            <ExternalLink />
            tieout im Web
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
