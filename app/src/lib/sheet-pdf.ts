/**
 * What the Beweispaket and the Mappe share: a real sheet on its own PDF page with a head line, its marks and a foot, and
 * a page drawn from the read values where a Beleg has no sheet yet. The pictures come through `SheetSource`, so the page
 * layout runs in a test without a browser.
 */

import { ACCENT, A4, INK, LINE, MUTED, wrap, type Page, type Pdf } from "./pdf";
import type { OriginalPage } from "./originals";
import { marksOf, type Box, type ScanBeleg, type ScanPage } from "./scans";

/** A sheet as a JPEG with its size in pixels. */
export type Picture = { bytes: Uint8Array; w: number; h: number };

export type SheetSource = {
  scan: (project: string, belegId: string) => Promise<ScanBeleg | null>;
  picture: (project: string, file: string) => Promise<Picture>;
};

export const MARGIN = 42;
const HEAD = 26;
const FOOT = 24;

/** Puts one sheet on a page of its own, upright or across as the sheet is. Returns the page and where the sheet lies. */
export function sheetPage(pdf: Pdf, picture: Picture, key: string, scan: ScanPage, head: string, right: string | null) {
  const across = scan.b > scan.h;
  const page = pdf.page(across ? A4.h : A4.w, across ? A4.w : A4.h);
  const room = { w: page.w - 40, h: page.h - HEAD - FOOT - 16 };
  const scale = Math.min(room.w / scan.b, room.h / scan.h);
  const [w, h] = [scan.b * scale, scan.h * scale];
  const [x, y] = [(page.w - w) / 2, HEAD + 8];
  page.text(20, 20, head, { size: 9, colour: INK });
  if (right) page.text(page.w - 20, 20, right, { size: 8, colour: INK, bold: true, right: true });
  pdf.image(page, key, picture, x, y, w, h);
  const at = (b: Box) => ({ x: x + b[0] * w, y: y + b[1] * h, w: b[2] * w, h: b[3] * h });
  return { page, at };
}

/** Marks every place on a sheet with a soft field and a line, so a black and white print shows it too. */
export function markPlaces(page: Page, scan: ScanPage, places: readonly string[], at: (b: Box) => { x: number; y: number; w: number; h: number }) {
  for (const place of places)
    for (const b of marksOf(scan, place)) {
      const r = at(b);
      page.rect(r.x, r.y, r.w, r.h, { fill: ACCENT, soft: true });
      page.rect(r.x, r.y, r.w, r.h, { stroke: ACCENT, width: 0.9 });
    }
}

/** A Beleg without a sheet (a photo, a WhatsApp-Meldung): what the twin read, and that it is no scan. */
export function readPage(pdf: Pdf, o: OriginalPage, head: string, right: string | null): Page {
  const page = pdf.page();
  page.text(20, 20, head, { size: 9 });
  if (right) page.text(page.w - 20, 20, right, { size: 8, bold: true, right: true });
  let y = 64;
  page.text(MARGIN, y, o.title, { size: 14, bold: true });
  y += 16;
  page.text(MARGIN, y, `${o.kind}${o.date ? ` vom ${o.date}` : ""}`, { size: 9, colour: MUTED });
  y += 22;
  const row = (label: string, value: string) => {
    const lines = wrap(value, 10, page.w - MARGIN * 2 - 120);
    page.text(MARGIN, y, label, { size: 9, colour: MUTED });
    lines.forEach((l, i) => page.text(MARGIN + 120, y + i * 13, l, { size: 10 }));
    y += Math.max(1, lines.length) * 13 + 5;
    page.line(MARGIN, y - 4, page.w - MARGIN, { colour: LINE });
    y += 4;
  };
  for (const f of [...o.head, ...o.extra]) row(f.label, f.value);
  for (const b of o.body) row(b.label ?? "Text", b.text);
  for (const r of o.table?.rows ?? []) row(r.cells[0], r.cells.slice(1).join(", "));
  if (!o.head.length && !o.body.length && !o.table) for (const r of o.read) row(r.label ?? r.place, r.text);
  y += 8;
  page.text(MARGIN, y, "Aus den gelesenen Werten nachgebildet, kein Scan.", { size: 9, colour: MUTED });
  return page;
}

/** The foot of every page, written last, when the number of pages is known. */
export function feet(pdf: Pdf, left: string | null) {
  pdf.pages.forEach((p, i) => {
    if (left) p.text(20, p.h - 12, left, { size: 7.5, colour: MUTED });
    p.text(p.w - 20, p.h - 12, `Seite ${i + 1} von ${pdf.pages.length}`, { size: 7.5, colour: MUTED, right: true });
  });
}

/** Loads a sheet in the browser and turns it into a JPEG: the PDF format has no WebP. */
export function browserSheets(load: SheetSource["scan"]): SheetSource {
  const made = new Map<string, Promise<Picture>>();
  const picture = async (project: string, file: string): Promise<Picture> => {
    const res = await fetch(`/belege/${project}/${file}`);
    if (!res.ok) throw new Error(`Blatt ${file} fehlt`);
    const bitmap = await createImageBitmap(await res.blob());
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0);
    bitmap.close();
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, "image/jpeg", 0.8));
    if (!blob) throw new Error("Blatt ließ sich nicht umwandeln");
    return { bytes: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height };
  };
  // a sheet that recurs in a package is decoded once
  return {
    scan: load,
    picture: (project, file) => {
      const key = `${project}/${file}`;
      if (!made.has(key)) made.set(key, picture(project, file));
      return made.get(key)!;
    },
  };
}
