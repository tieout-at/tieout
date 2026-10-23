import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Picture of an empty state: Attio's frame (215 × 140, a grid fading out to the edges) with tieout's own drawing
 * language from the brand: plan grid, a dimension line and the ultramarine square of the logo.
 */
export function Illustration({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <div aria-hidden className="relative h-[140px] w-[215px] shrink-0">
      <svg className="absolute inset-0" width="215" height="140" viewBox="0 0 215 140" fill="none">
        <defs>
          <radialGradient id="leer-fade" cx="50%" cy="50%" r="55%">
            <stop offset="45%" stopColor="#fff" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="leer-mask">
            <rect width="215" height="140" fill="url(#leer-fade)" />
          </mask>
        </defs>
        <g mask="url(#leer-mask)" stroke="var(--color-grid)" strokeWidth="1">
          {[26.5, 53.5, 80.5, 107.5, 134.5, 161.5, 188.5].map((x) => (
            <line key={`v${x}`} x1={x} y1="0" x2={x} y2="140" />
          ))}
          {[16.5, 43.5, 70.5, 97.5, 124.5].map((y) => (
            <line key={`h${y}`} x1="0" y1={y} x2="215" y2={y} />
          ))}
        </g>
        <g stroke="rgb(10 16 32 / 0.3)" strokeWidth="1">
          <line x1="75.5" y1="112.5" x2="139.5" y2="112.5" />
          <line x1="75.5" y1="108" x2="75.5" y2="117" />
          <line x1="139.5" y1="108" x2="139.5" y2="117" />
        </g>
      </svg>
      <div className="absolute top-[33px] left-[75px] flex size-16 items-center justify-center rounded-lg bg-surface shadow-button">
        <Icon className="size-8 text-fg" strokeWidth={1.25} />
        <span className="absolute -top-1 -right-1 size-2 bg-accent" />
      </div>
    </div>
  );
}

/** Empty state of a page, in Attio's pattern: picture, title, one line, optional action (docs/DESIGN.md). */
export function EmptyState({
  icon,
  title,
  text,
  children,
  className,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-full items-center justify-center px-4 py-12", className)}>
      <div className="flex w-full max-w-[380px] flex-col items-center gap-6 text-center">
        <Illustration icon={icon} />
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-fg-secondary">{text}</p>
          </div>
          {children && <div className="flex flex-wrap justify-center gap-2">{children}</div>}
        </div>
      </div>
    </div>
  );
}

/** Small empty state inside a section (Attio: "Meetings" on Home). */
export function SectionEmpty({ title, text }: { title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-4 py-6 text-center">
      <p className="text-fg-secondary">{title}</p>
      {text && <p className="text-xs text-fg-muted">{text}</p>}
    </div>
  );
}
