"use client";

import { Command as CommandPrimitive } from "cmdk";

import { cn } from "@/lib/utils";

// Attio's search panel: input row 52 px, group headings 12 px, items 36 px with radius 12, footer 44 px.

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return <CommandPrimitive data-slot="command" className={cn("flex w-full flex-col", className)} {...props} />;
}

function CommandInput({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div data-slot="command-input-wrapper" className="flex h-[52px] items-center gap-1 px-4 shadow-line-bottom">
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn("w-full bg-transparent text-base text-fg outline-none placeholder:text-fg-muted max-md:text-[16px]", className)}
        {...props}
      />
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[min(436px,60vh)] scroll-py-2 overflow-x-hidden overflow-y-auto overscroll-contain px-2.5 pb-2 outline-none", className)}
      {...props}
    />
  );
}

function CommandEmpty({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className={cn("px-1.5 py-6 text-center text-sm text-fg-secondary", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "**:[[cmdk-group-heading]]:px-1.5 **:[[cmdk-group-heading]]:pt-4 **:[[cmdk-group-heading]]:pb-2 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:text-fg-secondary",
        className,
      )}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "flex h-9 cursor-default items-center gap-1.5 rounded-lg py-1.5 pr-3 pl-1.5 text-sm outline-none select-none data-selected:bg-fill-selected max-md:h-11",
        className,
      )}
      {...props}
    />
  );
}

export { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList };
