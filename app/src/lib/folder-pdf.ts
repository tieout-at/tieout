/**
 * The Mappe for the site (step 14): what the business prints and the Bauleitung takes along. A sheet to tick off, then
 * per gap the real sheet with the field to sign marked, what the Abhilfe says to enclose, and a Regiebericht prepared from
 * a WhatsApp-Meldung. It goes through the hands of the Polier, so it holds no amount and not the word "Fund"; a mark must
 * read in black and white. tieout sends it to nobody.
 */

import type { Gap, GapSheet } from "./invoice";
import { LINE, MUTED, Pdf, textWidth, WHITE, INK, wrap } from "./pdf";
import { feet, markPlaces, MARGIN, sheetPage, type SheetSource } from "./sheet-pdf";
import { marksOf } from "./scans";

export type FolderInput = { business: string; project: string; client: string; asOf: string; gaps: Gap[]; sample: boolean };

const WHAT: Partial<Record<Gap["kind"], string>> = { unterschrift: "Unterschrift", gegenzeichnung: "Gegenzeichnung", regiebericht: "prüfen, Unterschrift" };
const TAG: Partial<Record<Gap["kind"], string>> = { unterschrift: "Hier unterschreiben", gegenzeichnung: "Hier gegenzeichnen" };

const ABOVE = 34;

/** Every page of the Beleg, the page to sign marked. */
async function signSheet(pdf: Pdf, src: SheetSource, g: Gap, sheet: GapSheet, project: string) {
  const scan = await src.scan(project, sheet.belegId);
  if (!scan) return;
  for (const number of Object.keys(scan.seiten).map(Number).sort((a, b) => a - b)) {
    const page = scan.seiten[String(number)];
    const picture = await src.picture(project, page.bild);
    const { page: at, at: place } = sheetPage(pdf, picture, `${project}/${page.bild}`, page, `${sheet.title}, Seite ${number}`, null);
    if (number !== sheet.page) continue;
    pdf.bookmark(sheet.title, at);
    for (const b of marksOf(page, sheet.place)) {
      // the signature goes on the line above the label, so the frame reaches over it
      const r = place(b);
      const top = r.y - ABOVE;
      at.rect(r.x, top, r.w, r.h + ABOVE, { stroke: INK, width: 1.4 });
      const tag = TAG[g.kind] ?? "Hier unterschreiben";
      const w = textWidth(tag, 9, true) + 12;
      at.rect(r.x, top - 17, w, 15, { fill: INK });
      at.text(r.x + 6, top - 6, tag, { size: 9, bold: true, colour: WHITE });
    }
  }
}

async function enclosure(pdf: Pdf, src: SheetSource, e: GapSheet, of: string, project: string) {
  const scan = await src.scan(project, e.belegId);
  const page = scan?.seiten[String(e.page)];
  if (!page) return;
  const picture = await src.picture(project, page.bild);
  const { page: at, at: place } = sheetPage(pdf, picture, `${project}/${page.bild}`, page, `Beilage zu ${of}: ${e.title}`, null);
  markPlaces(at, page, [e.place], place);
}

/** A Regiebericht made from a WhatsApp-Meldung: only what the message says, the rest stays blank to fill in. */
function prepared(pdf: Pdf, g: Gap, input: FolderInput) {
  const t = g.template!;
  const p = pdf.page();
  pdf.bookmark("Regiebericht, vorbereitet", p);
  p.text(MARGIN, 72, input.business, { size: 15, bold: true });
  p.text(p.w - MARGIN, 72, "REGIEBERICHT", { size: 10, bold: true, right: true });
  p.line(MARGIN, 84, p.w - MARGIN, { colour: INK, width: 1 });
  p.text(MARGIN, 104, `Vorbereitet aus der WhatsApp-Meldung, Arbeitstag ${t.day}. Bitte prüfen und ergänzen.`, { size: 9, colour: MUTED });
  let y = 134;
  const row = (label: string, value: string) => {
    const lines = wrap(value, 10.5, p.w - MARGIN * 2 - 130);
    p.text(MARGIN, y, label, { size: 10, colour: MUTED });
    lines.forEach((l, i) => p.text(MARGIN + 130, y + i * 14, l, { size: 10.5 }));
    y += Math.max(1, lines.length) * 14 + 8;
    p.line(MARGIN, y - 6, p.w - MARGIN, { colour: LINE });
    y += 6;
  };
  row("Bauvorhaben", input.project);
  row("Auftraggeber", input.client);
  row("Arbeitstag", t.day);
  row("Ort", t.place);
  if (t.orderedBy) row("Angeordnet von", t.orderedBy);
  row("Tätigkeit", t.work);
  row("Stunden Monteur", `${t.fitter} Std.`);
  row("Stunden Helfer", `${t.helper} Std.`);
  row("Material", "");
  const foot = p.h - 150;
  const half = (p.w - MARGIN * 2 - 30) / 2;
  p.line(MARGIN, foot, MARGIN + half, { colour: INK, width: 0.7 });
  p.text(MARGIN, foot + 13, "Für den Auftragnehmer", { size: 9 });
  const right = MARGIN + half + 30;
  p.rect(right, foot - 40, half, 40, { stroke: INK, width: 1.4 });
  p.rect(right, foot - 57, textWidth("Hier unterschreiben", 9, true) + 12, 15, { fill: INK });
  p.text(right + 6, foot - 46, "Hier unterschreiben", { size: 9, bold: true, colour: WHITE });
  p.text(right, foot + 13, "Unterschrift Auftraggeber", { size: 9 });
}

export async function folderPdf(input: FolderInput, src: SheetSource): Promise<Uint8Array> {
  const gaps = input.gaps.filter((g) => g.folder && !g.closed);
  const pdf = new Pdf(`Mappe für die Baustelle, ${input.project}`, input.business);
  const p = pdf.page();
  let y = 72;
  p.text(MARGIN, y, "Mappe für die Baustelle", { size: 20, bold: true });
  y += 20;
  p.text(MARGIN, y, `${input.project} · ${input.client} · Stand ${input.asOf}`, { size: 10, colour: MUTED });
  y += 34;
  const col = [MARGIN, MARGIN + 24, MARGIN + 250, MARGIN + 380];
  ["", "Blatt", "Was fehlt", "Wer"].forEach((h, i) => p.text(col[i], y, h, { size: 9, bold: true }));
  y += 6;
  p.line(MARGIN, y, p.w - MARGIN, { colour: INK });
  y += 16;
  for (const g of gaps) {
    const title = g.sheet?.title ?? "Regiebericht, neu";
    const small = g.template ? `aus der WhatsApp-Meldung, Arbeitstag ${g.template.day}` : g.enclosures.length ? `Beilagen: ${g.enclosures.map((e) => e.title).join(", ")}` : null;
    p.rect(col[0], y - 9, 11, 11, { stroke: INK, width: 0.8 });
    p.text(col[1], y, title, { size: 10.5 });
    const lines = small ? wrap(small, 8, col[2] - col[1] - 10) : [];
    lines.forEach((l, i) => p.text(col[1], y + 12 + i * 10, l, { size: 8, colour: MUTED }));
    p.text(col[2], y, WHAT[g.kind] ?? "Unterschrift", { size: 10 });
    p.text(col[3], y, g.signer ?? "", { size: 10 });
    y += 18 + lines.length * 10;
    p.line(MARGIN, y - 6, p.w - MARGIN, { colour: LINE });
    y += 8;
  }
  y += 10;
  p.text(MARGIN, y, "Unterschriebene Blätter zurück an die Abrechnung.", { size: 10, colour: MUTED });

  for (const g of gaps) {
    if (g.template) prepared(pdf, g, input);
    if (g.sheet) await signSheet(pdf, src, g, g.sheet, g.project.slug);
    for (const e of g.enclosures) await enclosure(pdf, src, e, g.sheet?.title ?? "Regiebericht", g.project.slug);
  }
  feet(pdf, input.sample ? "Beispieldaten, synthetisch" : null);
  return pdf.build();
}
