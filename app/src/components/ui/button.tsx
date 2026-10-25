import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Attio buttons: 28 px high, radius 8, padding 4 8 4 6, gap 6, white with a soft outline shadow (docs/DESIGN.md).
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap text-sm font-medium outline-none select-none transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        secondary: "bg-surface text-fg shadow-button hover:bg-[#fafafa] [&_svg]:text-fg-secondary",
        primary: "bg-accent text-white shadow-primary hover:bg-accent-hover",
        ghost: "text-fg-help hover:bg-fill-hover hover:text-fg",
        quiet: "bg-fill-subtle text-fg-muted hover:bg-fill-hover",
      },
      size: {
        // on phones 32 px to look at and 44 px to tap (an invisible frame above and below), not a 44 px block
        md: "h-7 rounded-md py-1 pr-2 pl-1.5 max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0",
        lg: "h-8 rounded-item py-1.5 pr-2.5 pl-2 max-md:relative max-md:h-8 max-md:before:absolute max-md:before:-inset-y-1.5 max-md:before:inset-x-0",
        icon: "size-7 rounded-md max-md:relative max-md:size-8 max-md:before:absolute max-md:before:-inset-1.5",
      },
    },
    defaultVariants: { variant: "secondary", size: "md" },
  },
);

function Button({ className, variant, size, ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
