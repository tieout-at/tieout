"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

import { Sheet, SheetContent, SheetTitle } from "./sheet";
import { useMediaQuery } from "./use-media";
import { cn } from "@/lib/utils";

// The open windows, last opened on top: a window opened from inside another one (an original from the position
// window) lies over it, Escape closes only the top one, and the page keeps its room until the last one closes.
const stack: { id: string; width: number }[] = [];
function syncRoom() {
  const widest = stack.reduce((w, s) => Math.max(w, s.width), 0);
  document.documentElement.style.setProperty("--side-window", widest ? `${widest + 24}px` : "0px");
}

const noSubscribe = () => () => {};
/** False in the static HTML and while it hydrates, true after: the window moves to `body` only in the browser. */
function useInBrowser() {
  return useSyncExternalStore(noSubscribe, () => true, () => false);
}

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
  const id = useId();
  const inBrowser = useInBrowser();

  // Escape closes the top window only, and not while a dialog or menu above it takes the key (they live in `body`)
  useEffect(() => {
    if (!open || !wide) return;
    const key = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented || stack.at(-1)?.id !== id) return;
      const t = e.target instanceof Element ? e.target : null;
      if (t && !box.current?.contains(t) && t.closest("[role=dialog], [role=alertdialog], [role=menu], [role=listbox]")) return;
      onClose();
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [open, wide, onClose, id]);

  // room for the window, and the focus into it and back to what opened it
  useEffect(() => {
    if (!wide || !open) return;
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    stack.push({ id, width });
    syncRoom();
    const t = window.setTimeout(() => box.current?.querySelector<HTMLElement>("button, a[href], [tabindex]:not([tabindex='-1'])")?.focus({ preventScroll: true }), 60);
    const el = box.current;
    return () => {
      window.clearTimeout(t);
      const at = stack.findIndex((s) => s.id === id);
      if (at >= 0) stack.splice(at, 1);
      syncRoom();
      if (opener.current && (!document.activeElement || document.activeElement === document.body || el?.contains(document.activeElement))) opener.current.focus({ preventScroll: true });
    };
  }, [open, wide, width, id]);

  if (!wide)
    return (
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent side={phone ? "bottom" : "right"} className={phone ? "h-[85dvh]" : ""}>
          <SheetTitle>{title}</SheetTitle>
          {children}
        </SheetContent>
      </Sheet>
    );
  const aside = (
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
  // in `body`, so a window opened inside another one is placed against the screen, not clipped by the outer window
  return inBrowser ? createPortal(aside, document.body) : aside;
}

/** Open, switch or close: a second click on what is open closes the window. */
export function toggleOpen<T>(current: T | null, next: T, same: (a: T, b: T) => boolean): T | null {
  return current && same(current, next) ? null : next;
}
