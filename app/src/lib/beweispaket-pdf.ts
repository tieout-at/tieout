/**
 * The Beweispaket as a real PDF (step 14): a cover with the finds, per find its Rechenweg and Belege, then every sheet the
 * Rechenweg points to with the place marked. Each source in the Rechenweg is a link to its sheet, so a number leads to
 * its original here too. It holds what `evidence.ts` lets out and carries "Entwurf, nicht freigegeben" on every page of
 * a find until it is released. Nothing is computed here: amounts are the texts of the core.
 */

import { hasSheet, outward, outwardEvidence, outwardSteps, packagePages, type PackagePage } from "./evidence";
import type { FindRecord, SourceRef } from "./finds";
import { INK, LINE, MUTED, ACCENT, Pdf, textWidth, wrap, type Page } from "./pdf";
import { feet, markPlaces, MARGIN, readPage, sheetPage, type SheetSource } from "./sheet-pdf";

export type EvidenceInput = {
  /** "Kronfeld Haustechnik". */
  business: string;
  project: string;
  client: string;
  asOf: string;
  /** The finds with whether each is still a draft; in the order of the Änderungsliste. */
  finds: { record: FindRecord; draft: boolean }[];
  /** The sum of the Änderungsliste of the whole package; null for one find. */
  total: string | null;
  /** The sample company says so on every page. */
  sample: boolean;
};

const DRAFT = "Entwurf, nicht freigegeben";
const keyOf = (number: string, page: string) => `${number}|${page}`;

/** A column of text that goes on to a new page when it is full. */
class Flow {
  y = 64;
  page: Page;
  constructor(
    private readonly pdf: Pdf,
    private readonly stamp: string | null,
  ) {
    this.page = this.fresh();
  }
  private fresh() {
    const p = this.pdf.page();
    if (this.stamp) p.text(p.w - 20, 20, this.stamp, { size: 8, bold: true, right: true });
    return p;
  }
  room(h: number) {
    if (this.y + h <= this.page.h - 44) return;
    this.page = this.fresh();
    this.y = 48;
  }
}

/** The lines of "Quelle:", each source a link to its sheet. */
function sources(flow: Flow, number: string, list: SourceRef[], width: number) {
  if (!list.length) return;
  const size = 8;
  let x = MARGIN;
  flow.page.text(x, flow.y, "Quelle: ", { size, colour: MUTED });
  x += textWidth("Quelle: ", size);
  list.forEach((s, i) => {
    const text = `${s.label}, ${s.detail}${i < list.length - 1 ? ";" : ""}`;
    const w = textWidth(text, size);
    if (x + w > MARGIN + width) {
      flow.y += 11;
      flow.room(11);
      x = MARGIN;
    }
    flow.page.text(x, flow.y, text, { size, colour: ACCENT });
    flow.page.link(x, flow.y - 8, w, 10, keyOf(number, s.page));
    x += w + 3;
  });
  flow.y += 11;
}

function findPages(pdf: Pdf, { record: r, draft }: EvidenceInput["finds"][number]) {
  const flow = new Flow(pdf, draft ? DRAFT : null);
  const width = flow.page.w - MARGIN * 2;
  pdf.bookmark(`${r.number} ${r.name}`, flow.page);
  flow.page.text(MARGIN, flow.y, r.number, { size: 11, bold: true });
  const title = wrap(r.name, 14, width - 36, true);
  title.forEach((l, i) => flow.page.text(MARGIN + 36, flow.y + i * 17, l, { size: 14, bold: true }));
  flow.y += title.length * 17 + 2;
  for (const l of wrap(r.facts.join(" · "), 9, width)) {
    flow.page.text(MARGIN, flow.y, l, { size: 9, colour: MUTED });
    flow.y += 12;
  }
  flow.y += 8;
  flow.page.text(MARGIN, flow.y, "Betrag, netto", { size: 9, colour: MUTED });
  flow.page.text(MARGIN + width, flow.y, r.amount, { size: 11, bold: true, right: true });
  flow.y += 22;

  flow.page.text(MARGIN, flow.y, "Rechenweg", { size: 11, bold: true });
  flow.y += 16;
  for (const s of outwardSteps(r)) {
    const lines = wrap(s.title, 10, width - 96);
    flow.room(lines.length * 13 + 40);
    lines.forEach((l, i) => flow.page.text(MARGIN, flow.y + i * 13, l, { size: 10 }));
    if (s.amount) flow.page.text(MARGIN + width, flow.y, s.amount, { size: 10, right: true });
    flow.y += lines.length * 13;
    for (const l of wrap([s.formula, s.derivation].filter(Boolean).join(" · "), 8, width)) {
      flow.page.text(MARGIN, flow.y, l, { size: 8, colour: MUTED });
      flow.y += 11;
    }
    sources(flow, r.number, s.sources, width);
    flow.y += 3;
    flow.page.line(MARGIN, flow.y - 6, MARGIN + width);
    flow.y += 6;
  }
  flow.room(26);
  flow.page.text(MARGIN, flow.y, r.calc.total.label, { size: 10, bold: true });
  flow.page.text(MARGIN + width, flow.y, r.calc.total.amount, { size: 10, bold: true, right: true });
  flow.y += 26;

  const evidence = outwardEvidence(r);
  const groups = [
    ["Belegen die Leistung", evidence.work],
    ["Belegen den Preis", evidence.price],
  ] as const;
  flow.room(40);
  flow.page.text(MARGIN, flow.y, "Belege", { size: 11, bold: true });
  flow.y += 16;
  for (const [title, items] of groups) {
    if (!items.length) continue;
    flow.room(30);
    flow.page.text(MARGIN, flow.y, title, { size: 8, colour: MUTED });
    flow.y += 12;
    for (const x of items) {
      const detail = wrap(`${outward(x.text)} · ${x.source.detail}`, 8, width);
      flow.room(detail.length * 11 + 22);
      flow.page.text(MARGIN, flow.y, x.title, { size: 10, colour: ACCENT });
      flow.page.link(MARGIN, flow.y - 9, textWidth(x.title, 10), 11, keyOf(r.number, x.source.page));
      if (x.date) flow.page.text(MARGIN + width, flow.y, x.date, { size: 8, colour: MUTED, right: true });
      flow.y += 12;
      for (const l of detail) {
        flow.page.text(MARGIN, flow.y, l, { size: 8, colour: MUTED });
        flow.y += 11;
      }
      flow.y += 4;
    }
  }
}

async function sheetOf(pdf: Pdf, src: SheetSource, r: FindRecord, draft: boolean, p: PackagePage) {
  const o = p.page;
  const scan = hasSheet(o) ? await src.scan(o.project, o.belegId) : null;
  const page = scan?.seiten[String(o.page)];
  const where = p.places[0] ? `, ${p.first.detail.replace(/^Seite \d+, /, "")}` : "";
  const head = `${r.number} · ${o.title}, Seite ${o.page} von ${o.pages}${where}`;
  const stamp = draft ? DRAFT : null;
  if (!page) return pdf.anchor(keyOf(r.number, o.key), readPage(pdf, o, head, stamp));
  const picture = await src.picture(o.project, page.bild);
  const { page: at, at: place } = sheetPage(pdf, picture, `${o.project}/${page.bild}`, page, head, stamp);
  markPlaces(at, page, p.places, place);
  // the sheet here is the one read from the folder; the signed one lies with the business
  const signed = r.gaps.find((g) => g.closed && g.sheet?.belegId === o.belegId);
  if (signed) at.text(at.w / 2, at.h - 12, `Unterschrieben am ${signed.closed!.day}, unterschriebenes Blatt beim Betrieb`, { size: 8, bold: true, right: false });
  pdf.anchor(keyOf(r.number, o.key), at);
}

export async function evidencePdf(input: EvidenceInput, src: SheetSource): Promise<Uint8Array> {
  const { finds } = input;
  const one = finds.length === 1;
  const pdf = new Pdf(one ? `Beweispaket ${finds[0].record.number}, ${input.project}` : `Beweispakete, ${input.project}`, input.business);

  let cover = pdf.page();
  const draftAny = finds.some((f) => f.draft);
  if (draftAny) cover.text(cover.w - 20, 20, DRAFT, { size: 8, bold: true, right: true });
  let y = 96;
  cover.text(MARGIN, y, one ? "Beweispaket zur Schlussrechnung" : "Beweispakete zur Schlussrechnung", { size: 20, bold: true });
  y += 22;
  cover.text(MARGIN, y, `${input.business} · Belege abgeglichen am ${input.asOf}`, { size: 10, colour: MUTED });
  y += 34;
  for (const [label, value] of [
    ["Projekt", input.project],
    ["Auftraggeber", input.client],
  ]) {
    cover.text(MARGIN, y, label, { size: 10, colour: MUTED });
    cover.text(MARGIN + 110, y, value, { size: 10 });
    y += 17;
  }
  y += 18;
  cover.text(MARGIN, y, "Nr.", { size: 9, bold: true });
  cover.text(MARGIN + 36, y, "Inhalt", { size: 9, bold: true });
  cover.text(cover.w - MARGIN, y, "netto", { size: 9, bold: true, right: true });
  y += 6;
  cover.line(MARGIN, y, cover.w - MARGIN, { colour: INK });
  y += 14;
  for (const { record: r } of finds) {
    if (y > cover.h - 90) {
      cover = pdf.page();
      y = 60;
    }
    const lines = wrap(r.name, 10, cover.w - MARGIN * 2 - 36 - 80);
    cover.text(MARGIN, y, r.number, { size: 10 });
    lines.forEach((l, i) => cover.text(MARGIN + 36, y + i * 13, l, { size: 10 }));
    cover.text(cover.w - MARGIN, y, r.amount, { size: 10, right: true });
    cover.link(MARGIN, y - 9, cover.w - MARGIN * 2, 12, `fund|${r.number}`);
    y += lines.length * 13 + 5;
    cover.line(MARGIN, y - 9, cover.w - MARGIN, { colour: LINE });
    y += 6;
  }
  if (input.total) {
    cover.text(MARGIN + 36, y + 2, "Zusammen", { size: 10, bold: true });
    cover.text(cover.w - MARGIN, y + 2, input.total, { size: 10, bold: true, right: true });
  }

  for (const f of finds) {
    const at = pdf.pages.length;
    findPages(pdf, f);
    pdf.anchor(`fund|${f.record.number}`, pdf.pages[at]);
    for (const p of packagePages(f.record)) await sheetOf(pdf, src, f.record, f.draft, p);
  }
  feet(pdf, input.sample ? "Beispieldaten, synthetisch" : null);
  return pdf.build();
}
