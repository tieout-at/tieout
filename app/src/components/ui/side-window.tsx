"use client";

import { useEffect, useRef } from "react";

import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { useMediaQuery } from "./use-media";
import { cn } from "@/lib/utils";

/**
 * A window that opens at the right on a click and closes again (step 8d, asked for by Maxi S.: an original or a detail
 * is not built into the page, so it is clear it can be closed and another one opened). From 1024 px a floating panel
 * (radius 12, popup shadow, 12 px from the edges); while it is open the page makes room for it (`--side-window` pads the
 * scroll area of `Page`), so nothing under it is covered. Opening moves the focus into the window, closing (Escape, its
 * close button, a second click on what is open) gives it back to the element that opened it. Below 1024 px the same
 * content comes as a sheet, from the bottom on phones. The content brings its own header with the close button.
 */
export function SideWindow({ open, onClose, title, width = 440, children }: { open: boolean; onClose: () => void; title: string; width?: number; children: React.ReactNode }) {
  const wide = useMediaQuery("(min-width: 1024px)", true);
  const phone = useMediaQuery("(max-width: 767px)", false);
  const box = useRef<HTMLElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open || !wide) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, wide, onClose]);

  // room for the window, and the focus into it and back to what opened it
  useEffect(() => {
    if (!wide || !open) return;
    const root = document.documentElement;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    root.style.setProperty("--side-window", `${width + 24}px`);
    const t = window.setTimeout(() => box.current?.querySelector<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")?.focus({ preventScroll: true }), 60);
    const el = box.current;
    return () => {
      window.clearTimeout(t);
      root.style.setProperty("--side-window", "0px");
      if (opener.current && (!document.activeElement || document.activeElement === document.body || el?.contains(document.activeElement))) opener.current.focus({ preventScroll: true });
    };
  }, [open, wide, width]);

  if (!wide)
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side={phone ? "bottom" : "right"} className={phone ? "h-[85dvh]" : ""}>
          <SheetTitle>{title}</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    );
  return (
    <aside
      ref={box}
      aria-label={title}
      aria-hidden={!open}
      inert={!open}
      className={cn(
        "fixed top-[calc(var(--header-height)+12px)] right-3 bottom-3 z-40 flex flex-col overflow-hidden rounded-xl bg-surface shadow-popup transition-[transform,opacity,visibility] duration-300 ease-soft motion-reduce:transition-none print:hidden",
        open ? "visible translate-x-0 opacity-100" : "pointer-events-none invisible translate-x-3 opacity-0",
      )}
      style={{ width }}
    >
      {children}
    </aside>
  );
}

/** Open, switch or close: a second click on what is open closes the window. */
export function toggleOpen<T>(current: T | null, next: T, same: (a: T, b: T) => boolean): T | null {
  return current && same(current, next) ? null : next;
}
