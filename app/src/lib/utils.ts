import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge must know the custom font sizes, otherwise `text-2xs` and `text-fg` would be treated as one group.
const merge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["2xs"] }] } },
});

export function cn(...inputs: ClassValue[]) {
  return merge(clsx(inputs));
}
