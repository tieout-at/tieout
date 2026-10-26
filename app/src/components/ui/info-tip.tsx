"use client";

import { Info } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "./popover";

/**
 * An explanation behind an info icon (research of step 8: one statement next to a figure, the rule behind it one click
 * away). A popover, not a tooltip, so it opens on a tap as well; 16 px to look at, 44 px to tap on phones.
 */
export function InfoTip({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Erklärung: ${label}`}
        className="relative inline-flex size-4 shrink-0 items-center justify-center rounded-full text-fg-muted outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:before:absolute max-md:before:-inset-3.5 print:hidden"
      >
        <Info className="size-3.5" aria-hidden />
      </PopoverTrigger>
      <PopoverContent className="w-72 px-3 py-2.5 text-xs leading-4 text-fg-secondary">{children}</PopoverContent>
    </Popover>
  );
}
