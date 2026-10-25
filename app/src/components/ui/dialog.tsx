"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";

import { cn } from "@/lib/utils";

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return <DialogPrimitive.Title data-slot="dialog-title" className={cn("text-base font-semibold", className)} {...props} />;
}

function DialogDescription({ className, ...props }: DialogPrimitive.Description.Props) {
  return <DialogPrimitive.Description data-slot="dialog-description" className={cn("text-sm text-fg-secondary", className)} {...props} />;
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/** Centred panel without padding; the content decides its own layout (search, forms). */
function DialogContent({ className, children, dim = false, ...props }: DialogPrimitive.Popup.Props & { dim?: boolean }) {
  return (
    <DialogPrimitive.Portal>
      {/* Attio dims nothing behind the search, the backdrop only catches the click outside; a confirmation dims lightly (`dim`). */}
      <DialogPrimitive.Backdrop className={cn("fixed inset-0 z-50", dim && "bg-black/15 data-open:animate-in data-open:fade-in-0")} />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "fixed top-[14vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-[740px] -translate-x-1/2 overflow-hidden rounded-lg bg-surface text-fg shadow-popup outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  );
}

export { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle };
