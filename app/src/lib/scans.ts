/**
 * The real sheets of a Beleg: a picture per page and the measured place of every value on it, as fractions of the page
 * (`ordner/`, one static file per Beleg in `/belege/<projekt>/`). Loaded when an original is opened, so no page gets
 * heavier. The same shape comes back from reading a customer's folder (step 18); a Beleg without sheets (a photo, a
 * WhatsApp-Meldung) stays the drawn page.
 */

import { useEffect, useState } from "react";

/** Left, top, width, height, as fractions of the page. */
export type Box = [number, number, number, number];

export type ScanPage = { bild: string; b: number; h: number; marken: Record<string, Box[]> };

export type ScanBeleg = {
  belegId: string;
  seiten: Record<string, ScanPage>;
  /** A plan with an earlier index: which Beleg it is compared with, and its sheet with only the change in full colour. */
  vergleich?: { mit: string; aenderung: string; links: string; rechts: string };
};

const loaded = new Map<string, Promise<ScanBeleg | null>>();
/** One empty list, so that a page without a mark does not look changed on every render. */
const NONE: Box[] = [];

export const scanUrl = (project: string, file: string) => `/belege/${project}/${file}`;

export function loadScan(project: string, belegId: string): Promise<ScanBeleg | null> {
  const key = `${project}/${belegId}`;
  if (!loaded.has(key))
    loaded.set(
      key,
      fetch(scanUrl(project, `${belegId}.json`))
        .then((r) => (r.ok ? (r.json() as Promise<ScanBeleg>) : null))
        .catch(() => {
          // a broken line is no answer: the next opening asks again
          loaded.delete(key);
          return null;
        }),
    );
  return loaded.get(key)!;
}

/** The sheets of a Beleg; `undefined` while they load, `null` if it has none. Without a project nothing is asked for. */
export function useScan(project: string | null, belegId: string): ScanBeleg | null | undefined {
  const [state, setState] = useState<{ key: string; scan: ScanBeleg | null } | null>(null);
  const key = `${project}/${belegId}`;
  useEffect(() => {
    if (!project) return;
    let live = true;
    void loadScan(project, belegId).then((scan) => live && setState({ key, scan }));
    return () => {
      live = false;
    };
  }, [key, project, belegId]);
  if (!project) return null;
  return state?.key === key ? state.scan : undefined;
}

/**
 * The boxes to mark for a source: the place itself, else the place it lies in ("Pos. 22.04.12B" for "Pos. 22.04.12B,
 * Einheitspreis"), the longest first, as `markOf` does for the drawn page.
 */
export function marksOf(page: ScanPage, source: string | null): Box[] {
  if (!source) return NONE;
  if (page.marken[source]) return page.marken[source];
  const part = Object.keys(page.marken)
    .filter((p) => source.startsWith(`${p},`))
    .sort((a, b) => b.length - a.length)[0];
  return part ? page.marken[part] : NONE;
}

/** The field to sign: the form's own, else the place the twin names. */
export const signMarks = (page: ScanPage, place: string): Box[] => page.marken["Unterschrift Auftraggeber"] ?? marksOf(page, place);

/** The whole line a value lies in ("Pos. 22.04.12B" for its Einheitspreis), so that a close view keeps the line's name. */
export function lineOf(page: ScanPage, source: string | null): Box[] {
  const line = source?.split(",")[0] ?? null;
  return line && page.marken[line] ? page.marken[line] : marksOf(page, source);
}
