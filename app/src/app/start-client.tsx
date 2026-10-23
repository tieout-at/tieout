"use client";

import { useSyncExternalStore } from "react";

import { BUSINESS } from "@/lib/example";

const noSubscribe = () => () => {};

// The time of day exists only in the browser; the static HTML keeps the line empty so nothing jumps.
function useNow(): Date | null {
  const stamp = useSyncExternalStore(
    noSubscribe,
    () => Math.floor(Date.now() / 60_000),
    () => null,
  );
  return stamp === null ? null : new Date(stamp * 60_000);
}

export function greetingFor(hour: number): string {
  if (hour < 5) return "Guten Abend";
  if (hour < 11) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}

export function Greeting() {
  const now = useNow();
  return (
    <h1 className="min-h-6 px-1 text-xl font-semibold">
      {now ? `${greetingFor(now.getHours())}, ${BUSINESS.name}.` : <span className="sr-only">Start</span>}
    </h1>
  );
}

export function Today() {
  const now = useNow();
  if (!now) return null;
  const label = new Intl.DateTimeFormat("de-AT", { weekday: "long", day: "numeric", month: "long" }).format(now);
  return <span className="text-xs text-fg-secondary">Heute, {label}</span>;
}
