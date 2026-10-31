/**
 * A small PDF writer of our own, as `xlsx.ts` is for Excel (step 14): pages, text in the built-in Helvetica, rectangles,
 * JPEG pictures, links between pages and bookmarks. No package, loaded on a click only. Text goes in as hex in the
 * WinAnsi encoding, so nothing in it can break out of a string. Sizes are points, the origin is the top left corner of a
 * page (the file turns them round): 595 × 842 is A4 upright.
 */

export const A4 = { w: 595.28, h: 841.89 };

const HELVETICA = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];
const BOLD = [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584];

/** Windows-1252 codes of the characters above Latin-1's range that German text uses. */
const WIN: Record<string, number> = { "€": 0x80, "‚": 0x82, "„": 0x84, "…": 0x85, "‘": 0x91, "’": 0x92, "“": 0x93, "”": 0x94, "•": 0x95, "\u2013": 0x96, "\u2014": 0x97 };

/** What Helvetica has no glyph for, in words or the nearest sign ("Index C → D" reads "Index C auf D"). */
const plain = (text: string) => text.replace(/ → /g, " auf ").replace(/→/g, "-").replace(/−/g, "\u2013").replace(/[  ]/g, " ").replace(/₂/g, "2").replace(/₃/g, "3");

export function winAnsi(text: string): number[] {
  return [...plain(text)].map((c) => {
    const code = c.codePointAt(0)!;
    if (WIN[c]) return WIN[c];
    if ((code >= 32 && code < 127) || (code >= 0xa1 && code <= 0xff)) return code;
    return 63; // "?"
  });
}

const BASE: Record<number, string> = { 0xc4: "A", 0xd6: "O", 0xdc: "U", 0xe4: "a", 0xf6: "o", 0xfc: "u", 0xe9: "e", 0xe8: "e", 0xe0: "a", 0xe1: "a", 0xf3: "o" };

/** The width of a text in points. */
export function textWidth(text: string, size: number, bold = false): number {
  const table = bold ? BOLD : HELVETICA;
  const units = winAnsi(text).reduce((sum, code) => {
    if (code >= 32 && code < 127) return sum + table[code - 32];
    if (BASE[code]) return sum + table[BASE[code].charCodeAt(0) - 32];
    if (code === 0xdf) return sum + 611; // ß
    if (code === 0x82 || code === 0x91 || code === 0x92) return sum + 222;
    if (code === 0x84 || code === 0x93 || code === 0x94) return sum + 333;
    if (code === 0x85 || code === 0x97) return sum + 1000;
    if (code === 0x95) return sum + 350;
    if (code === 0xd7) return sum + 584;
    return sum + 556;
  }, 0);
  return (units * size) / 1000;
}

/** A text broken into lines no wider than `width`; a word wider than the line stands alone on its line. */
export function wrap(text: string, size: number, width: number, bold = false): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && textWidth(next, size, bold) > width) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

export type Colour = [number, number, number];
export const INK: Colour = [0.09, 0.09, 0.11];
export const MUTED: Colour = [0.36, 0.37, 0.41];
export const LINE: Colour = [0.8, 0.81, 0.83];
export const ACCENT: Colour = [0.11, 0.23, 1];
export const WHITE: Colour = [1, 1, 1];

const n = (x: number) => (Math.round(x * 100) / 100).toString();
const hex = (bytes: number[]) => bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
const utf16 = (text: string) => `FEFF${Array.from({ length: text.length }, (_, i) => text.charCodeAt(i).toString(16).padStart(4, "0")).join("")}`;
const rgb = (c: Colour, op: string) => `${c.map(n).join(" ")} ${op}`;

type Picture = { bytes: Uint8Array; w: number; h: number };
type Link = { x: number; y: number; w: number; h: number; to: string };

export class Page {
  readonly ops: string[] = [];
  readonly links: Link[] = [];
  readonly images = new Set<number>();
  constructor(
    readonly w: number,
    readonly h: number,
  ) {}

  text(x: number, y: number, text: string, { size = 10, bold = false, colour = INK, right = false }: { size?: number; bold?: boolean; colour?: Colour; right?: boolean } = {}) {
    const left = right ? x - textWidth(text, size, bold) : x;
    this.ops.push(`BT ${rgb(colour, "rg")} /${bold ? "F2" : "F1"} ${n(size)} Tf ${n(left)} ${n(this.h - y)} Td <${hex(winAnsi(text))}> Tj ET`);
  }

  rect(x: number, y: number, w: number, h: number, { fill, stroke, width = 1, soft = false }: { fill?: Colour; stroke?: Colour; width?: number; soft?: boolean }) {
    const paint = fill && stroke ? "B" : fill ? "f" : "S";
    this.ops.push(`q ${soft ? "/Soft gs " : ""}${fill ? `${rgb(fill, "rg")} ` : ""}${stroke ? `${rgb(stroke, "RG")} ${n(width)} w ` : ""}${n(x)} ${n(this.h - y - h)} ${n(w)} ${n(h)} re ${paint} Q`);
  }

  line(x1: number, y: number, x2: number, { colour = LINE, width = 0.5 }: { colour?: Colour; width?: number } = {}) {
    this.ops.push(`q ${rgb(colour, "RG")} ${n(width)} w ${n(x1)} ${n(this.h - y)} m ${n(x2)} ${n(this.h - y)} l S Q`);
  }

  /** Makes a place on this page lead to the page registered under `to`. */
  link(x: number, y: number, w: number, h: number, to: string) {
    this.links.push({ x, y, w, h, to });
  }
}

export class Pdf {
  readonly pages: Page[] = [];
  private readonly pictures: Picture[] = [];
  private readonly byKey = new Map<string, number>();
  private readonly anchors = new Map<string, Page>();
  private readonly marks: { title: string; page: Page }[] = [];
  constructor(
    private readonly title: string,
    private readonly author: string,
  ) {}

  page(w = A4.w, h = A4.h): Page {
    const p = new Page(w, h);
    this.pages.push(p);
    return p;
  }

  /** The target of links: `Page.link` names it, and it may come later in the file. */
  anchor(key: string, page: Page) {
    if (!this.anchors.has(key)) this.anchors.set(key, page);
  }

  /** A bookmark in the reader's side panel. */
  bookmark(title: string, page: Page) {
    this.marks.push({ title, page });
  }

  /** Places a JPEG; the same `key` holds the picture once in the file, however often it is shown. */
  image(page: Page, key: string, picture: Picture, x: number, y: number, w: number, h: number) {
    if (!this.byKey.has(key)) {
      this.pictures.push(picture);
      this.byKey.set(key, this.pictures.length - 1);
    }
    const at = this.byKey.get(key)!;
    page.images.add(at);
    page.ops.push(`q ${n(w)} 0 0 ${n(h)} ${n(x)} ${n(page.h - y - h)} cm /Im${at} Do Q`);
  }

  build(): Uint8Array {
    const enc = new TextEncoder();
    const chunks: Uint8Array[] = [];
    const offsets: number[] = [];
    let at = 0;
    const put = (x: string | Uint8Array) => {
      const b = typeof x === "string" ? enc.encode(x) : x;
      chunks.push(b);
      at += b.length;
    };

    // numbers of the objects, fixed before anything is written: 1 catalog, 2 page tree, 3 and 4 fonts, 5 soft fill,
    // 6 info, 7 outline root, then bookmarks, pictures, and per page its object and its content
    const firstMark = 8;
    const firstPicture = firstMark + this.marks.length;
    const firstPage = firstPicture + this.pictures.length;
    const pageRef = (p: Page) => firstPage + this.pages.indexOf(p) * 2;
    const total = firstPage + this.pages.length * 2;

    const object = (id: number, body: string | (() => void)) => {
      offsets[id] = at;
      put(`${id} 0 obj\n`);
      if (typeof body === "string") put(body);
      else body();
      put("\nendobj\n");
    };

    put("%PDF-1.4\n%\xe2\xe3\xcf\xd3\n");
    object(1, `<< /Type /Catalog /Pages 2 0 R /Lang (de-AT) /PageLayout /SinglePage${this.marks.length ? " /Outlines 7 0 R /PageMode /UseOutlines" : ""} >>`);
    object(2, `<< /Type /Pages /Count ${this.pages.length} /Kids [${this.pages.map((p) => `${pageRef(p)} 0 R`).join(" ")}] >>`);
    object(3, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
    object(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
    object(5, "<< /Type /ExtGState /ca 0.14 >>");
    object(6, `<< /Title <${utf16(this.title)}> /Author <${utf16(this.author)}> >>`);
    object(7, `<< /Type /Outlines /Count ${this.marks.length}${this.marks.length ? ` /First ${firstMark} 0 R /Last ${firstMark + this.marks.length - 1} 0 R` : ""} >>`);
    this.marks.forEach((m, i) => {
      const id = firstMark + i;
      object(id, `<< /Title <${utf16(m.title)}> /Parent 7 0 R${i ? ` /Prev ${id - 1} 0 R` : ""}${i < this.marks.length - 1 ? ` /Next ${id + 1} 0 R` : ""} /Dest [${pageRef(m.page)} 0 R /Fit] >>`);
    });
    this.pictures.forEach((pic, i) => {
      object(firstPicture + i, () => {
        put(`<< /Type /XObject /Subtype /Image /Width ${pic.w} /Height ${pic.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pic.bytes.length} >>\nstream\n`);
        put(pic.bytes);
        put("\nendstream");
      });
    });
    this.pages.forEach((p) => {
      const id = pageRef(p);
      const annots = p.links
        .filter((l) => this.anchors.has(l.to))
        .map((l) => `<< /Type /Annot /Subtype /Link /Rect [${n(l.x)} ${n(p.h - l.y - l.h)} ${n(l.x + l.w)} ${n(p.h - l.y)}] /Border [0 0 0] /Dest [${pageRef(this.anchors.get(l.to)!)} 0 R /Fit] >>`);
      const xobjects = [...p.images].map((i) => `/Im${i} ${firstPicture + i} 0 R`).join(" ");
      object(id, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(p.w)} ${n(p.h)}] /Contents ${id + 1} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> /ExtGState << /Soft 5 0 R >>${xobjects ? ` /XObject << ${xobjects} >>` : ""} >>${annots.length ? ` /Annots [${annots.join(" ")}]` : ""} >>`);
      const content = enc.encode(p.ops.join("\n"));
      object(id + 1, () => {
        put(`<< /Length ${content.length} >>\nstream\n`);
        put(content);
        put("\nendstream");
      });
    });

    const xref = at;
    put(`xref\n0 ${total}\n0000000000 65535 f \n`);
    for (let id = 1; id < total; id++) put(`${String(offsets[id]).padStart(10, "0")} 00000 n \n`);
    put(`trailer\n<< /Size ${total} /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

    const out = new Uint8Array(at);
    let pos = 0;
    for (const c of chunks) {
      out.set(c, pos);
      pos += c.length;
    }
    return out;
  }
}

/** Hands the finished file to the browser as a download; the address lives a minute, Safari on iPhones needs the time. */
export function savePdf(bytes: Uint8Array, name: string) {
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: "application/pdf" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
