"use client";

import type { ComponentProps } from "react";

import { useLive } from "@/lib/live";
import { Highlights } from "./highlights";

/** The highlights of a project's "Überblick"; with a decision in this browser computed again by the core (live.ts). */
export function ProjectHighlights({ projektId, items, ...rest }: { projektId: string } & ComponentProps<typeof Highlights>) {
  const live = useLive();
  return <Highlights items={live?.projectHighlights(projektId) ?? items} {...rest} />;
}
