"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Check, ChevronDown, Circle, FlaskConical, PanelLeft, Search, UserPlus } from "lucide-react";

import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BUSINESS } from "@/lib/example";
import { activeDestination, SECTIONS, TOP, type Destination } from "@/lib/navigation";
import { useTasks } from "@/lib/use-tasks";
import { cn } from "@/lib/utils";
import { useModifierLabel, useShell } from "./shell-state";

/**
 * Sidebar in the Attio layout (docs/DESIGN.md, "Sidebar"). `inSheet` is the variant shown as a panel on small
 * screens: there the whole panel scrolls as one, so no entry hides behind the bottom rows.
 */
export function Sidebar({ inSheet = false }: { inSheet?: boolean }) {
  const pathname = usePathname();
  const active = activeDestination(pathname);

  return (
    <nav aria-label="Hauptnavigation" className={cn("flex h-full w-full flex-col bg-sidebar", inSheet && "overflow-y-auto overscroll-contain")}>
      <BusinessRow inSheet={inSheet} />
      <div className="px-3 pt-2.5 pb-[11px]">
        <SearchButton />
      </div>
      <div className={cn("pb-3", inSheet ? "flex-1" : "no-scrollbar flex-1 overflow-y-auto")}>
        <ul className="flex flex-col gap-px px-2">
          {TOP.map((d) => (
            <NavItem key={d.id} destination={d} active={active?.id === d.id} />
          ))}
        </ul>
        {SECTIONS.map((section) => (
          <NavSection key={section.id} title={section.title}>
            {section.destinations.map((d) => (
              <NavItem key={d.id} destination={d} active={active?.id === d.id} />
            ))}
          </NavSection>
        ))}
      </div>
      <BottomRows />
    </nav>
  );
}

function BusinessRow({ inSheet }: { inSheet: boolean }) {
  const { toggleCollapsed } = useShell();
  return (
    <div className="relative flex h-12 shrink-0 items-center shadow-line-bottom">
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-12 w-full min-w-0 items-center gap-1.5 py-px pr-10 pl-3 text-left outline-none hover:bg-fill-subtle focus-visible:bg-fill-hover">
          <BusinessChip />
          <span className="truncate text-base font-semibold">{BUSINESS.name}</span>
          <ChevronDown className="size-4 shrink-0 text-fg-secondary" aria-hidden />
        </DropdownMenuTrigger>
        <DropdownMenuContent alignOffset={8} className="w-64">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Betrieb</DropdownMenuLabel>
            <DropdownMenuItem render={<Link href="/betrieb/" />} className="h-11">
              <BusinessChip small />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate">{BUSINESS.name}</span>
                <span className="text-xs text-fg-muted">Beispieldaten</span>
              </span>
              <Check className="text-fg!" aria-label="ausgewählt" />
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/betrieb/mitglieder/" />}>
            <UserPlus />
            Mitglieder einladen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {!inSheet && (
        <Tooltip>
          <TooltipTrigger
            onClick={toggleCollapsed}
            aria-label="Seitenleiste ausblenden"
            className="absolute right-3 flex size-7 items-center justify-center rounded-md text-fg-secondary hover:bg-fill-hover hover:text-fg"
          >
            <PanelLeft className="size-[18px]" aria-hidden />
          </TooltipTrigger>
          <TooltipContent>Seitenleiste ausblenden</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}

export function BusinessChip({ small = false }: { small?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-sm bg-fg font-semibold text-white",
        small ? "size-5 text-[11px]" : "size-5 text-xs",
      )}
    >
      {BUSINESS.initial}
    </span>
  );
}

function SearchButton() {
  const { setSearchOpen, setMobileOpen } = useShell();
  const mod = useModifierLabel();
  return (
    <button
      type="button"
      onClick={() => {
        setMobileOpen(false);
        setSearchOpen(true);
      }}
      className="flex h-7 w-full items-center gap-1.5 rounded-md bg-surface py-1 pr-1 pl-1.5 text-left shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
    >
      <Search className="size-4 text-fg-secondary" aria-hidden />
      <span className="flex-1">Suche</span>
      <KbdGroup aria-label={`Tastenkürzel ${mod} K`} className="max-md:hidden">
        <Kbd>{mod}</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
    </button>
  );
}

function NavItem({ destination, active }: { destination: Destination; active: boolean }) {
  const { setMobileOpen } = useShell();
  const Icon = destination.icon;
  return (
    <li>
      <Link
        href={destination.href}
        onClick={() => setMobileOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-7 items-center gap-1.5 rounded-item pr-1 pl-2 text-fg outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11",
          active && "bg-fill-hover",
        )}
      >
        <Icon className={cn("size-4 shrink-0", active ? "text-fg" : "text-fg-secondary")} aria-hidden />
        <span className="truncate">{destination.title}</span>
        {destination.id === "aufgaben" && <OpenTasks />}
      </Link>
    </li>
  );
}

/** The number of open tasks next to "Aufgaben" (Attio's counter on Tasks); nothing while there are none. */
function OpenTasks() {
  const open = (useTasks() ?? []).filter((t) => !t.done).length;
  if (!open) return null;
  return (
    <span className="ml-auto flex h-4 min-w-4 items-center justify-center rounded-xs bg-surface px-1 text-[11px] text-count tabular-nums shadow-ring">
      {open}
      <span className="sr-only"> offen</span>
    </span>
  );
}

function NavSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="mt-3 flex flex-col gap-1 px-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="flex h-7 items-center gap-1.5 rounded-sm py-1 pr-1 pl-2 text-left text-xs text-fg-secondary outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
      >
        <ChevronDown className={cn("size-4 transition-transform", !open && "-rotate-90")} aria-hidden />
        {title}
      </button>
      {open && <ul className="flex flex-col gap-px">{children}</ul>}
    </div>
  );
}

// The three first steps (SPEZIFIKATION.md 4.2). None of them works in the shell yet, so they are listed, not linked.
const FIRST_STEPS = ["Ordner importieren", "Ersten Fund prüfen", "Änderungsliste drucken"];

function BottomRows() {
  const { setMobileOpen } = useShell();
  return (
    <div className="shrink-0 bg-sidebar">
      <div className="flex justify-center pb-2.5">
        <Popover>
          <PopoverTrigger className="flex h-7 items-center gap-1.5 rounded-full bg-surface px-3 shadow-button outline-none hover:bg-[#fafafa] focus-visible:outline-2 focus-visible:outline-accent max-md:h-11 max-md:px-4">
            Erste Schritte
            <span className="text-xs text-fg-muted">0/{FIRST_STEPS.length}</span>
          </PopoverTrigger>
          <PopoverContent side="top" align="center" className="w-64">
            <div className="flex flex-col gap-1 px-2 pt-2 pb-2.5">
              <PopoverTitle className="p-0 text-sm text-fg">Erste Schritte</PopoverTitle>
              <p className="text-xs text-fg-secondary">0 von {FIRST_STEPS.length} erledigt</p>
              <div className="mt-1.5 flex gap-1" aria-hidden>
                {FIRST_STEPS.map((step) => (
                  <span key={step} className="h-1 flex-1 rounded-full bg-fill-hover" />
                ))}
              </div>
            </div>
            <ul className="pb-1">
              {FIRST_STEPS.map((step) => (
                <li key={step} className="flex h-8 items-center gap-2 px-2 text-fg-secondary">
                  <Circle className="size-4 text-fg-faint" aria-hidden />
                  <span className="flex-1">{step}</span>
                  <span className="text-xs text-fg-muted">folgt</span>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>
      </div>
      <div className="px-2 py-[5px] shadow-[inset_0_1px_0_0_#eeeff1]">
        <Link
          href="/betrieb/mitglieder/"
          onClick={() => setMobileOpen(false)}
          className="flex h-7 items-center gap-1.5 rounded-item pr-1 pl-2 outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11"
        >
          <UserPlus className="size-4 text-fg-secondary" aria-hidden />
          Mitglieder einladen
        </Link>
      </div>
      <div className="px-2 py-[5px] shadow-[inset_0_1px_0_0_#eeeff1]">
        <Popover>
          <PopoverTrigger className="flex h-7 w-full items-center gap-1.5 rounded-item pr-1 pl-2 text-left outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11">
            <FlaskConical className="size-4 text-fg-secondary" aria-hidden />
            <span className="flex-1">Beispieldaten</span>
            <span className="rounded-xs bg-fill-hover px-1 text-xs text-count shadow-ring">erfunden</span>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-72 p-3">
            <p className="text-sm">Beispieldaten</p>
            <p className="mt-1 text-xs text-fg-secondary">
              {BUSINESS.name}, seine Projekte und Auftraggeber sind Beispiele. Alle Namen und Zahlen sind erfunden.
            </p>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
