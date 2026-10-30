import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { evidencePdf, type EvidenceInput } from "./beweispaket-pdf";
import { findRecord, findSlugs } from "./finds";
import { folderPdf } from "./folder-pdf";
import { gapsView, invoiceView } from "./invoice";
import { live } from "./kern-live";
import { Pdf, textWidth, winAnsi, wrap } from "./pdf";
import type { ScanBeleg } from "./scans";
import type { SheetSource } from "./sheet-pdf";

const sheets: SheetSource = {
  scan: async (project, belegId) => {
    try {
      return JSON.parse(readFileSync(new URL(`../../public/belege/${project}/${belegId}.json`, import.meta.url), "utf8")) as ScanBeleg;
    } catch {
      return null;
    }
  },
  picture: async () => ({ bytes: new Uint8Array([0xff, 0xd8, 0xff, 0xd9]), w: 1240, h: 1754 }),
};

const latin = (b: Uint8Array) => new TextDecoder("latin1").decode(b);

/** Every text of a file, as a reader would extract it. */
function texts(b: Uint8Array): string {
  const win: Record<number, string> = { 0x80: "€", 0x84: "„", 0x93: "“", 0x96: "2013" };
  return [...latin(b).matchAll(/<([0-9a-f]+)> Tj/g)]
    .map((m) =>
      m[1]
        .match(/../g)!
        .map((h) => {
          const c = parseInt(h, 16);
          return win[c] ?? String.fromCharCode(c);
        })
        .join(""),
    )
    .join("\n");
}

/** The offsets of the table at the end of the file must point at the objects. */
function checkFile(b: Uint8Array) {
  const s = latin(b);
  expect(s.startsWith("%PDF-1.4")).toBe(true);
  expect(s.trimEnd().endsWith("%%EOF")).toBe(true);
  const at = Number(/startxref\n(\d+)/.exec(s)![1]);
  expect(s.slice(at, at + 4)).toBe("xref");
  const entries = s.slice(at).match(/^(\d{10}) 00000 n $/gm)!;
  entries.forEach((e, i) => expect(s.slice(Number(e.slice(0, 10)), Number(e.slice(0, 10)) + 12)).toContain(`${i + 1} 0 obj`));
}

const pages = (b: Uint8Array) => (latin(b).match(/\/Type \/Page /g) ?? []).length;
const record = (slug: string) => findRecord(slug);
const v = invoiceView("p1")!;
const slugOf = (href: string) => href.split("/")[2];
const input = (slugs: string[], draft = true): EvidenceInput => ({ business: "Kronfeld Haustechnik", project: "Wohnpark Mooshaim", client: "Hornfeld Bau GmbH", asOf: "22.10.2026", finds: slugs.map((s) => ({ record: record(s), draft })), total: slugs.length > 1 ? "14.620,15 €" : null, sample: true });
const allSlugs = v.changes.entries.map((c) => slugOf(c.find.href));

describe("PDF writer", () => {
  it("writes German text and the euro sign in its encoding, and never breaks out of a string", () => {
    expect(winAnsi("Aufmaß 5 € „x“")).toEqual([65, 117, 102, 109, 97, 223, 32, 53, 32, 128, 32, 132, 120, 147]);
    const p = new Pdf("T", "A");
    p.page().text(10, 10, "a) ] > ( \\ <evil>");
    expect(latin(p.build())).not.toContain("evil");
  });

  it("names what Helvetica lacks in words", () => {
    expect(winAnsi("C → D").map((c) => String.fromCharCode(c)).join("")).toBe("C auf D");
    expect(winAnsi("−").length).toBe(1);
    expect(winAnsi("漢")).toEqual([63]);
  });

  it("measures and breaks text", () => {
    expect(textWidth("MMMM", 10)).toBeCloseTo(33.32, 1);
    expect(textWidth("ä", 10)).toBe(textWidth("a", 10));
    expect(wrap("eins zwei drei", 10, 30).length).toBeGreaterThan(1);
    expect(wrap("", 10, 30)).toEqual([]);
  });

  it("stores a picture once, however often it is shown", () => {
    const p = new Pdf("T", "A");
    const pic = { bytes: new Uint8Array([1, 2, 3]), w: 1, h: 1 };
    p.image(p.page(), "x", pic, 0, 0, 10, 10);
    p.image(p.page(), "x", pic, 0, 0, 10, 10);
    expect(latin(p.build()).match(/\/Subtype \/Image/g)).toHaveLength(1);
    checkFile(p.build());
  });
});

describe("Beweispaket", () => {
  it("is a well-formed file of F1 with a cover, its Rechenweg and its sheets", async () => {
    const b = await evidencePdf(input([slugOf(v.status.all[0].href)]), sheets);
    checkFile(b);
    const t = texts(b);
    expect(t).toContain("Beweispaket zur Schlussrechnung");
    expect(t).toContain("6.648,60 €");
    expect(t).toContain("Aufmaßblatt 12");
    expect(t).toContain("Entwurf, nicht freigegeben");
    expect(t).toContain("Beispieldaten, synthetisch");
    expect(pages(b)).toBeGreaterThan(3);
  });

  it("leads each source to its sheet by a link", async () => {
    const b = await evidencePdf(input([slugOf(v.status.all[0].href)]), sheets);
    expect((latin(b).match(/\/Subtype \/Link/g) ?? []).length).toBeGreaterThanOrEqual(8);
    expect(latin(b)).toContain("/Outlines");
  });

  it("holds nothing internal in any of the five packages", async () => {
    const b = await evidencePdf(input(allSlugs), sheets);
    const t = texts(b);
    for (const word of ["Kürzungsrisiko", "Abhilfe", "Gleicher Grund", "Gegenprobe", "Preisbasis", "Stundenzettel", "Mittellohn", "Untergrenze", "tieout", "Rechnungsprogramm"]) expect(t).not.toContain(word);
    expect(t).toContain("14.620,15 €");
  });

  it("says nothing of a draft once a find is released", async () => {
    const b = await evidencePdf(input([slugOf(v.status.all[0].href)], false), sheets);
    expect(texts(b)).not.toContain("Entwurf, nicht freigegeben");
  });

  it("says so on a page drawn from read values", async () => {
    const slugs = findSlugs().filter((s) => s.startsWith("wohnpark-mooshaim"));
    const b = await evidencePdf(input(slugs.slice(0, 1)), { ...sheets, scan: async () => null });
    expect(texts(b)).toContain("Aus den gelesenen Werten nachgebildet, kein Scan.");
  });
});

describe("Mappe", () => {
  const folder = (gaps = gapsView("p1")) => folderPdf({ business: "Kronfeld Haustechnik", project: "Wohnpark Mooshaim", client: "Hornfeld Bau GmbH", asOf: "22.10.2026", gaps, sample: true }, sheets);

  it("holds the sheet to tick, the sheets to sign, the prepared Regiebericht and the enclosures", async () => {
    const b = await folder();
    checkFile(b);
    const t = texts(b);
    for (const word of ["Mappe für die Baustelle", "Regiebericht 12", "Aufmaßblatt 12", "Regiebericht, neu", "Hier unterschreiben", "Hier gegenzeichnen", "Beilage zu Aufmaßblatt 12: Plan H-201 Index D", "Beilage zu Aufmaßblatt 12: E-Mail vom 07.04.2026", "Heizkörper Top 9 versetzt", "Polier"]) expect(t).toContain(word);
  });

  it("shows no amount and not the word Fund", async () => {
    const t = texts(await folder());
    expect(t).not.toMatch(/\d,\d\d €/);
    expect(t).not.toContain("€");
    expect(t).not.toMatch(/\bFunde?\b/);
    expect(t).not.toContain("Kürzungsrisiko");
  });

  it("leaves out what came back", async () => {
    const closed = live([], [{ lueckeSchluessel: "p1/unterschrift:rb-12", zeit: "2026-10-23T10:00", wer: "Abrechnung", gueltig: true }]).gapsView("p1");
    const t = texts(await folder(closed));
    expect(t).not.toContain("Regiebericht 12");
    expect(t).toContain("Aufmaßblatt 12");
  });
});
