"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { normalisePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export type TabLink = { title: string; href: string };

/**
 * Tabs as links between pages (Attio record tabs: 28 px, radius 8; the open one on #fbfbfb with a 1 px ring).
 * They are page links, so they are a `nav` with `aria-current`, not an ARIA tab list.
 */
export function TabLinks({ tabs, label, className }: { tabs: TabLink[]; label: string; className?: string }) {
  const path = normalisePath(usePathname());
  return (
    <nav aria-label={label} className={cn("flex flex-wrap items-center gap-1", className)}>
      {tabs.map((tab) => {
        const active = path === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex h-7 shrink-0 items-center rounded-md px-2 py-1 whitespace-nowrap outline-none hover:bg-fill-hover focus-visible:outline-2 focus-visible:outline-accent max-md:h-11 max-md:px-2.5",
              active ? "bg-sidebar text-fg shadow-ring hover:bg-sidebar" : "text-fg-secondary",
            )}
          >
            {tab.title}
          </Link>
        );
      })}
    </nav>
  );
}
