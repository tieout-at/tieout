"use client";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { SearchDialog } from "./search-dialog";
import { ShellProvider, useShell } from "./shell-state";
import { Sidebar } from "./sidebar";

/** Frame of every page: sidebar left (275 px), page right; below 768 px the sidebar opens as a panel. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellProvider>
      <TooltipProvider>
        <Frame>{children}</Frame>
      </TooltipProvider>
    </ShellProvider>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  const { collapsed, mobileOpen, setMobileOpen } = useShell();
  return (
    <>
      <div className="flex h-dvh overflow-hidden">
        <aside className={cn("hidden w-[var(--sidebar-width)] shrink-0 border-r border-line md:block", collapsed && "md:hidden")}>
          <Sidebar />
        </aside>
        <main className="flex min-w-0 flex-1 flex-col">{children}</main>
      </div>
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent>
          <SheetTitle>Navigation</SheetTitle>
          <Sidebar inSheet />
        </SheetContent>
      </Sheet>
      <SearchDialog />
    </>
  );
}
