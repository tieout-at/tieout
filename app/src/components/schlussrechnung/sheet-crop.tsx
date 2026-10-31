"use client";

import { scanUrl, signMarks, useScan, type Box } from "@/lib/scans";
import type { GapSheet } from "@/lib/invoice";

/** The part of the page to show around a box, as fractions of its height. */
const range = (box: Box | undefined) => {
  if (!box) return { start: 0, size: 1 };
  const size = Math.min(1, box[3] + 0.16);
  const start = Math.min(1 - size, Math.max(0, box[1] - 0.1));
  return { start, size };
};

/**
 * The strip of a real sheet around the place of a signature, with the place marked, so a person sees what is missing
 * before opening anything. A sheet without a picture (or while it loads) shows only its name.
 */
export function SheetCrop({ project, sheet }: { project: string; sheet: GapSheet }) {
  const scan = useScan(project, sheet.belegId);
  const page = scan?.seiten[String(sheet.page)];
  if (!page) return <p className="rounded-md bg-fill-subtle px-2 py-3 text-xs text-fg-secondary shadow-ring">{scan === undefined ? "Blatt wird geladen." : `${sheet.title}, ohne Bild in den Beispieldaten`}</p>;
  const box = signMarks(page, sheet.place)[0] as Box | undefined;
  const { start, size } = range(box);
  return (
    <a href={scanUrl(project, page.bild)} target="_blank" rel="noreferrer" aria-label={`${sheet.title}, ganzes Blatt in neuem Tab`} className="relative block overflow-hidden rounded-md shadow-ring outline-none focus-visible:outline-2 focus-visible:outline-accent" style={{ aspectRatio: `${page.b} / ${page.h * size}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image server */}
      <img src={scanUrl(project, page.bild)} alt="" width={page.b} height={page.h} draggable={false} className="absolute left-0 w-full max-w-none" style={{ top: `${(-start / size) * 100}%` }} />
      {box && <span aria-hidden className="absolute rounded-xs bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)]" style={{ left: `${box[0] * 100}%`, top: `${((box[1] - start) / size) * 100}%`, width: `${box[2] * 100}%`, height: `${(box[3] / size) * 100}%` }} />}
    </a>
  );
}
