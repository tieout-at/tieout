import type { LucideIcon } from "lucide-react";

/** Name block of a record page (Attio: 18 px semibold name with its object chip, one line of facts below). */
export function RecordHead({ icon: Icon, title, badge, facts, children }: { icon: LucideIcon; title: string; badge?: string; facts: string[]; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 px-6 pt-5 pb-4 max-md:px-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-surface text-fg-secondary shadow-ring" aria-hidden>
          <Icon className="size-4" />
        </span>
        {badge && <span className="flex h-6 min-w-8 shrink-0 items-center justify-center rounded-xs bg-fill-hover px-1.5 text-sm text-count shadow-ring tabular-nums">{badge}</span>}
        <h1 className="truncate text-lg font-semibold max-md:line-clamp-2 max-md:whitespace-normal">{title}</h1>
        {children}
      </div>
      <p className="flex flex-wrap gap-x-2 pl-9 text-fg-secondary max-md:flex-col">
        {facts.map((fact, i) => (
          <span key={fact} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden className="text-fg-faint max-md:hidden">
                ·
              </span>
            )}
            {fact}
          </span>
        ))}
      </p>
    </div>
  );
}
