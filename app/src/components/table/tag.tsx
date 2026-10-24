import { cn } from "@/lib/utils";

export type TagColour = "red" | "yellow" | "orange" | "green" | "grey";

const DOT: Record<TagColour, string> = {
  red: "bg-state-red",
  yellow: "bg-state-yellow",
  orange: "bg-state-orange",
  green: "bg-state-green",
  grey: "bg-state-grey",
};

/**
 * Tag of a table cell (Attio's status pill: 24 px, radius 6, a coloured dot and the word). Colour carries meaning only
 * and sits in the dot; the pill itself stays grey. Without a colour it is a plain word chip (stage, decision).
 */
export function Tag({ colour, children, className }: { colour?: TagColour; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex h-6 max-w-full min-w-0 items-center gap-1.5 rounded-sm bg-fill-subtle px-1.5 shadow-ring", className)}>
      {colour && <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[colour])} />}
      <span className="truncate">{children}</span>
    </span>
  );
}
