"use client";

/**
 * Runs the core in the browser once this browser holds a decision (step 6b). Without one every page shows the figures
 * of its static HTML, computed by the same code while it was built, so the amounts of the solution list stay as they
 * are. With one, `useLive()` hands the pages the core's result over those decisions: sums, money words and the board
 * follow every decision, and "nicht gerechnet" stays only where the core has no sum for exactly the rows shown.
 */

import { useSyncExternalStore } from "react";

import { onStorageChange, readDecisions } from "./decisions";
import type { Live } from "./kern-live";

let core: typeof import("./kern-live") | null = null;
let loading: Promise<void> | null = null;
let snapshot: Live | null = null;
let computedFor = "";
const listeners = new Set<() => void>();
let stop: (() => void) | null = null;

/** Loads the core and its sample data as a chunk of their own; asked for as soon as a page shows sums, used at the first decision. */
function load() {
  loading ??= import("./kern-live").then((m) => {
    core = m;
    refresh();
  });
}

function refresh() {
  const list = readDecisions();
  const key = JSON.stringify(list);
  if (key === computedFor) return;
  if (list.length && !core) return load();
  computedFor = key;
  snapshot = list.length ? core!.live(list) : null;
  for (const l of listeners) l();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (!stop) {
    stop = onStorageChange(refresh);
    refresh();
    load();
  }
  return () => {
    listeners.delete(listener);
    if (!listeners.size && stop) {
      stop();
      stop = null;
    }
  };
}

/** The core's result over the decisions of this browser, or null while there is none (then the built figures hold). */
export function useLive(): Live | null {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => null,
  );
}
