import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** A fact under the name; a dot only when its state is an exception ("Frist nah"), named for screen readers. */
export type Fact = string | { text: string; dot: "rot" | "gelb"; label: string };

const DOT = { rot: "bg-state-red", gelb: "bg-state-yellow" } as const;

/** Name block of a record page (Attio: 18 px semibold name with its object chip, one line of facts below). */
export function RecordHead({
  icon: Icon,
  title,
  badge,
  facts,
  wrap = false,
  children,
}: {
  icon: LucideIcon;
  title: string;
  badge?: string;
  facts: Fact[];
  /** Let a long name take two lines instead of cutting it (the name of a find carries its meaning at the end). */
  wrap?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 px-6 pt-5 pb-4 max-md:px-4">
      <div className={wrap ? "flex items-start gap-2 [&>span]:mt-0.5" : "flex items-center gap-2"}>
        {/* one chip, as Attio: the number of a find stands for its object, else the object's icon */}
        {badge ? (
          <span className="flex h-7 min-w-7 shrink-0 items-center justify-center rounded-md bg-fill-hover px-1.5 text-sm text-count shadow-ring tabular-nums">{badge}</span>
        ) : (
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-fg-secondary shadow-ring" aria-hidden>
            <Icon className="size-4" />
          </span>
        )}
        <h1 className={wrap ? "line-clamp-2 min-w-0 text-lg font-semibold max-sm:line-clamp-3" : "truncate text-lg font-semibold max-md:line-clamp-2 max-md:whitespace-normal"}>{title}</h1>
        {children}
      </div>
      <p className="flex flex-wrap gap-x-2 pl-9 text-fg-secondary max-md:flex-col">
        {facts.map((fact, i) => (
          <span key={typeof fact === "string" ? fact : fact.text} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-fg-faint max-md:hidden">
                ·
              </span>
            )}
            {typeof fact === "string" ? (
              fact
            ) : (
              <span className="flex items-center gap-1.5">
                <span aria-hidden className={cn("size-2 shrink-0 rounded-full", DOT[fact.dot])} />
                {fact.text}
                <span className="sr-only">, {fact.label}</span>
              </span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}
