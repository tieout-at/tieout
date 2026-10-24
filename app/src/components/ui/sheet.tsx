"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return <SheetPrimitive.Title data-slot="sheet-title" className={cn("sr-only", className)} {...props} />;
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

const SIDE = {
  /** Panel from the left edge, used for the sidebar on small screens. */
  left: "inset-y-0 left-0 w-[var(--sidebar-width)] max-w-[85vw] bg-sidebar data-open:slide-in-from-left data-closed:slide-out-to-left",
  /** Panel from the right edge (the original of a find on tablets). */
  right: "inset-y-0 right-0 w-[400px] max-w-[90vw] bg-surface data-open:slide-in-from-right data-closed:slide-out-to-right",
  /** Sheet from the bottom edge (a trace on the Übersicht on phones). */
  bottom:
    "inset-x-0 bottom-0 max-h-[calc(100dvh-64px)] rounded-t-2xl bg-surface data-open:slide-in-from-bottom data-closed:slide-out-to-bottom",
} as const;

function SheetContent({ className, children, side = "left", ...props }: SheetPrimitive.Popup.Props & { side?: keyof typeof SIDE }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
      <SheetPrimitive.Popup
        data-slot="sheet-content"
        className={cn("fixed z-50 flex flex-col shadow-popup outline-none data-open:animate-in data-closed:animate-out", SIDE[side], className)}
        {...props}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  );
}

export { Sheet, SheetClose, SheetContent, SheetTitle };
