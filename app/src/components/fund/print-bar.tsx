"use client";

import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/** The bar above a page made for printing: back to where it came from, and "Drucken" (the browser saves it as PDF too). */
export function PrintBar({ back, count }: { back: { href: string; label: string }; count?: number }) {
  return (
    <div className="flex min-h-12 items-center gap-2 px-4 py-2 shadow-line-bottom print:hidden">
      <Link href={back.href} className="link-quiet inline-flex items-center gap-1.5 text-fg-secondary">
        <ArrowLeft className="size-4" aria-hidden />
        {back.label}
      </Link>
      {count !== undefined && <span className="text-xs text-fg-muted">{count === 1 ? "1 Beweispaket" : `${count} Beweispakete`}, jedes auf eigenen Seiten</span>}
      <Button variant="primary" className="ml-auto" onClick={() => window.print()}>
        <Printer />
        Drucken
      </Button>
    </div>
  );
}
