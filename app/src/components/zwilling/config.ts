/**
 * Every tunable number of the page "Übersicht" in one place (layout, routing, motion). Pixel values are CSS pixels.
 * The pure layout functions (`layout.ts`) take this object, so tests can vary it.
 */
export const CFG = {
  /** Below this stage width the three columns stack (money first). 1024 px viewport with sidebar leaves 749 px. */
  stackBelow: 740,
  pad: { x: 24, xNarrow: 20, top: 4, bottom: 24, stackX: 16 },
  /** Height of the row with the three step names. */
  stepsH: 40,
  ruler: 44,
  /** Visible length of a tick mark at full scale. */
  mark: 34,
  gap: { min: 24, minNarrow: 16, leftShare: 0.58 },
  cards: {
    share: 0.22,
    min: 150,
    max: 300,
    narrowBelow: 220,
    maxShown: 8,
    gap: 6,
    inset: 12,
    /** One card: 4 px padding top and bottom, 16 px lines, a plan chain of 14 px. */
    padY: 8,
    lineH: 16,
    chainH: 14,
    /** Horizontal room a title does not get: padding 16, icon 14, gap 7; and the gap before the date. */
    chrome: 37,
    /** Narrow cards drop the icon so that a long word ("Leistungsverzeichnis") fits without breaking: padding only. */
    chromeNarrow: 16,
    dateGap: 7,
    moreH: 24,
    moreW: 110,
  },
  twin: { share: 0.36, min: 200, max: 560 },
  out: { share: 0.27, min: 270, max: 340 },
  grid: { minCols: 22, minColsNarrow: 16, maxCols: 140, pitchMax: 22, pitchMin: 5, minH: 200 },
  ticks: { pitchMin: 3, pitchMax: 10, densePitchMin: 1.5, waPitchMin: 7, waShare: 0.25, headH: 24, groupGap: 12, waPad: 14, denseOver: 150 },
  /** Distance of a pointer to a tick that still hovers a linked Beleg. */
  magnet: 12,
  rail: { inset: 8, fan: 1.6, bundleGap: 2.2, trunkShare: 0.36, trunkMin: 36, trunkMax: 150 },
  /** A group with more lines than this draws one line per target (with the count). */
  bundleOver: 40,
  result: { rowH: 32, rowHStack: 44, blockHead: 72, quietH: 24, blockGap: 24, moreH: 28, rowsTop: 6 },
  readout: { lineH: 18, width: 6.4, tableRows: 4, boxPad: 16, gap: 8, max: 300 },
  motion: {
    /** One trace: evidence lines, then through the twin, then out to the money. */
    inStart: 0,
    inMs: 260,
    midMs: 150,
    outMs: 220,
    cardStagger: 24,
    sweepMs: 2400,
    /** Entrance once per session: ticks, lines, cells, money. */
    enterTicks: 0,
    enterLines: 250,
    enterCells: 700,
    enterMoney: 950,
    enterDone: 1700,
  },
  storageKey: "tieout.uebersicht.auftritt",
} as const;

export type Config = typeof CFG;
