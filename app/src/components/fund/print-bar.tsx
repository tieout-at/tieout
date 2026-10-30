"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

/** The bar above a Beweispaket: back to where it came from, and the button that makes the PDF. */
export function PrintBar({ back, count, children }: { back: { href: string; label: string }; count?: number; children: React.ReactNode }) {
  return (
    <div className="flex min-h-12 items-center gap-2 px-4 py-2 shadow-line-bottom print:hidden">
      <Link href={back.href} className="link-quiet inline-flex items-center gap-1.5 text-fg-secondary">
        <ArrowLeft className="size-4" aria-hidden />
        {back.label}
      </Link>
      {count !== undefined && <span className="text-xs text-fg-muted">{count === 1 ? "1 Beweispaket" : `${count} Beweispakete`}, jedes auf eigenen Seiten</span>}
      {children}
    </div>
  );
}
