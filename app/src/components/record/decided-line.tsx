"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

import { currentState, onStorageChange, readDecisions, type Decision, type DecisionState } from "@/lib/decisions";

/**
 * What is next on a project's "Überblick" (review of step 8a): how many of its finds are decided, counted as the tab
 * "Schlussrechnung" counts them, with the decisions of this browser; a link to the finds.
 */
export function DecidedLine({ finds, href }: { finds: { keys: string[]; state: DecisionState }[]; href: string }) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  useEffect(() => {
    const load = () => setDecisions(readDecisions());
    load();
    return onStorageChange(load);
  }, []);
  const decided = finds.filter((f) => currentState(decisions, f.keys, f.state) !== "gefunden").length;
  return (
    <Link href={href} className="flex w-fit items-center gap-1 rounded-md text-fg-secondary outline-none hover:text-fg focus-visible:outline-2 focus-visible:outline-accent max-md:min-h-11">
      <span className="tabular-nums">
        {decided} von {finds.length} Funden entschieden
      </span>
      <ChevronRight aria-hidden className="size-4" />
    </Link>
  );
}
