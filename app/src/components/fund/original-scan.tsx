"use client";

import { useLayoutEffect, useRef, useState } from "react";

import { marksOf, scanUrl, type Box, type ScanPage } from "@/lib/scans";
import { OriginalPaper } from "./original-paper";
import type { OriginalPage } from "@/lib/originals";

/**
 * How much wider than the panel a sheet opens: as close as the line of the mark still fits whole, so a marked row shows
 * its amount as well as its name; without a mark a sensible reading size.
 */
export function closeZoom(boxes: Box[]): number {
  if (!boxes.length) return 1.7;
  const widest = Math.max(...boxes.map((b) => b[2]));
  return Math.min(2.2, Math.max(1, 0.92 / widest));
}

const place = ([l, t, w, h]: Box) => ({ left: `${l * 100}%`, top: `${t * 100}%`, width: `${w * 100}%`, height: `${h * 100}%` });

/**
 * A real sheet with the place of the source marked. It opens close on that place, in the middle of the panel; the whole
 * page is one click away. The values the twin read stay on the page as text for readers that cannot see the picture,
 * and take its place if the picture does not arrive.
 */
export function OriginalScan({ scan, project, page, source, mark, zoom, showRead }: { scan: ScanPage; project: string; page: OriginalPage; source: string | null; mark: string | null; zoom: number; showRead: boolean }) {
  const sheet = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const boxes = marksOf(scan, source);

  // bring the mark into the middle of the panel, in both directions, without moving the page behind it
  useLayoutEffect(() => {
    const el = sheet.current;
    const box = el?.closest<HTMLElement>("[data-scroller]");
    if (!el || !box) return;
    if (!boxes.length) {
      box.scrollTop = 0;
      box.scrollLeft = (box.scrollWidth - box.clientWidth) / 2;
      return;
    }
    const [l, t, w, h] = boxes[0];
    box.scrollLeft = (l + w / 2) * el.offsetWidth + el.offsetLeft - box.clientWidth / 2;
    box.scrollTop = (t + h / 2) * el.offsetHeight + el.offsetTop - box.clientHeight / 2;
  }, [boxes, zoom]);

  if (failed) return <OriginalPaper page={page} mark={mark} />;
  return (
    <>
      <div ref={sheet} className="relative shrink-0 bg-surface shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_1px_3px_0_rgb(0_0_0/0.05)]" style={{ width: `${zoom * 100}%`, aspectRatio: `${scan.b} / ${scan.h}` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- a static export has no image server, and the file is already the size it is shown at */}
        <img src={scanUrl(project, scan.bild)} alt={`${page.title}, Seite ${page.page}`} width={scan.b} height={scan.h} draggable={false} onError={() => setFailed(true)} className="block h-full w-full" />
        {showRead &&
          Object.values(scan.marken)
            .flat()
            .map((b, i) => <span key={i} aria-hidden className="pointer-events-none absolute rounded-xs bg-accent-soft/60" style={place(b)} />)}
        {boxes.map((b, i) => (
          <span key={i} aria-hidden className="pointer-events-none absolute rounded-xs bg-accent-soft shadow-[inset_0_0_0_1.5px_var(--color-accent)] mix-blend-multiply" style={place(b)} />
        ))}
      </div>
      <div className="sr-only">
        <OriginalPaper page={page} mark={mark} />
      </div>
    </>
  );
}
