import { describe, expect, it } from "vitest";
import type { Decision } from "./decisions";
import { invoiceView } from "./invoice";
import { exportFileName, exportState, invoiceSheets } from "./invoice-export";
import { live } from "./kern-live";
import { column, crc32, sheetName, xlsx, xml, type Cell, type Sheet } from "./xlsx";

const v = invoiceView("p1")!;
const origin = "https://app.example";
const sheets = invoiceSheets(v, origin);

/** The value of a cell, the number or text it holds. */
const value = (c: Cell) => (c === null || typeof c !== "object" ? c : "link" in c ? c.text : c.value);
const euroCells = (s: Sheet) => s.rows.flat().filter((c): c is { value: number; style: "euro" | "euroBold" } => !!c && typeof c === "object" && "style" in c && (c.style === "euro" || c.style === "euroBold"));

/** Every cent amount of the view, wherever it sits. */
function amountsOf(x: unknown, out = new Set<number>()): Set<number> {
  if (x && typeof x === "object") {
    if ("cent" in x && "text" in x && typeof x.cent === "number") out.add(x.cent);
    for (const y of Object.values(x)) amountsOf(y, out);
  }
  return out;
}

/** The files of a stored zip, read back from its local headers. */
function unzip(bytes: Uint8Array): Map<string, string> {
  const files = new Map<string, string>();
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const dec = new TextDecoder();
  for (let at = 0; d.getUint32(at, true) === 0x04034b50; ) {
    const size = d.getUint32(at + 18, true);
    const nameLength = d.getUint16(at + 26, true);
    const name = dec.decode(bytes.subarray(at + 30, at + 30 + nameLength));
    const data = bytes.subarray(at + 30 + nameLength, at + 30 + nameLength + size);
    expect(crc32(data)).toBe(d.getUint32(at + 14, true));
    files.set(name, dec.decode(data));
    at += 30 + nameLength + size;
  }
  // the central directory names the same files at the same places, and the end record counts them
  const end = bytes.length - 22;
  expect(d.getUint32(end, true)).toBe(0x06054b50);
  let at = d.getUint32(end + 16, true);
  for (let i = 0; i < d.getUint16(end + 10, true); i++) {
    expect(d.getUint32(at, true)).toBe(0x02014b50);
    const nameLength = d.getUint16(at + 28, true);
    const local = d.getUint32(at + 42, true);
    expect(dec.decode(bytes.subarray(local + 30, local + 30 + nameLength))).toBe(dec.decode(bytes.subarray(at + 46, at + 46 + nameLength)));
    at += 46 + nameLength;
  }
  expect(at).toBe(end);
  return files;
}

describe("xlsx writer", () => {
  it("has the standard checksum, column names and safe sheet names", () => {
    expect(crc32(new TextEncoder().encode("123456789"))).toBe(0xcbf43926);
    expect([column(0), column(25), column(26), column(701), column(702)]).toEqual(["A", "Z", "AA", "ZZ", "AAA"]);
    expect(sheetName("a/b:c*d?e[f]g\\h and a very long rest of the name")).toBe("a b c d e f g h and a very long");
    expect(xml(`<a & "b">\u0001`)).toBe("&lt;a &amp; &quot;b&quot;&gt;");
  });

  it("writes text as text, never as a formula, and refuses a broken number", () => {
    const files = unzip(xlsx([{ name: "T", widths: [10], rows: [["=HYPERLINK(\"http://x\")"], [{ value: 1.5, style: "euro" }]] }], "t"));
    const sheet = files.get("xl/worksheets/sheet1.xml")!;
    expect(sheet).not.toContain("<f>");
    expect(sheet).toContain('t="inlineStr"><is><t xml:space="preserve">=HYPERLINK(&quot;http://x&quot;)</t>');
    expect(sheet).toContain('<c r="A2" s="6"><v>1.5</v></c>');
    expect(() => xlsx([{ name: "T", widths: [], rows: [[NaN]] }], "t")).toThrow();
    const bare = unzip(xlsx([{ name: "T", widths: [], rows: [["x".repeat(40_000)]] }], "t")).get("xl/worksheets/sheet1.xml")!;
    expect(bare).not.toContain("<cols>");
    expect(bare.match(/<t xml:space="preserve">(x*)…<\/t>/)?.[1]).toHaveLength(32_766);
    expect(() => xlsx([{ name: "T", widths: [], rows: [] }, { name: "T", widths: [], rows: [] }], "t")).toThrow();
  });

  it("packs a complete workbook with links as relationships", () => {
    const files = unzip(xlsx(sheets, "Wohnpark Mooshaim, Schlussrechnung"));
    expect([...files.keys()]).toEqual(expect.arrayContaining(["[Content_Types].xml", "_rels/.rels", "xl/workbook.xml", "xl/_rels/workbook.xml.rels", "xl/styles.xml", "xl/worksheets/sheet4.xml", "xl/worksheets/_rels/sheet1.xml.rels"]));
    expect(files.get("xl/workbook.xml")).toContain('<sheet name="Vorprüfung (intern)" sheetId="3" r:id="rId3"/>');
    expect(files.get("xl/worksheets/_rels/sheet1.xml.rels")).toContain(`Target="${origin}/funde/wohnpark-mooshaim-f1/beweispaket/" TargetMode="External"`);
  });
});

describe("export of the Schlussrechnung (step 8e)", () => {
  it("has four sheets, two of them marked internal", () => {
    expect(sheets.map((s) => s.name)).toEqual(["Änderungsliste", "Rechnungsabschluss", "Vorprüfung (intern)", "Schlussbesprechung (intern)"]);
    for (const s of sheets) {
      expect(value(s.rows[3][0])).toBe("Entwurf, nicht freigegeben: 0 von 8 Funden entschieden");
      expect(s.rows.some((r) => value(r[0]) === "Synthetische Beispieldaten, keine echten Kundendaten")).toBe(true);
      expect(value(s.rows[4][0])).toBe(s.name.includes("intern") ? "Nur intern, nicht für Hornfeld Bau GmbH: mit Kalkulation und Untergrenzen" : "Intern, für Ihr Rechnungsprogramm. Für Hornfeld Bau GmbH sind die Beweispakete.");
    }
  });

  it("adds no amount: every euro in the file is one of the core's amounts", () => {
    const known = amountsOf(v);
    for (const s of sheets) for (const c of euroCells(s)) expect(known.has(Math.round(c.value * 100)), `${s.name} ${c.value}`).toBe(true);
  });

  it("lists every position of the Änderungsliste, summing to zusätzlich verrechenbar, with In Klärung apart", () => {
    const rows = sheets[0].rows;
    const start = rows.findIndex((r) => value(r[0]) === "Fund") + 1;
    const end = rows.findIndex((r) => value(r[0]) === "zusätzlich verrechenbar");
    const items = rows.slice(start, end);
    expect(items).toHaveLength(v.changes.entries.reduce((n, c) => n + c.items.length, 0));
    expect(Math.round(items.reduce((s, r) => s + (value(r[7]) as number) * 100, 0))).toBe(v.changes.total.cent);
    expect(value(rows[end][7])).toBe(146_20.15);
    const f1 = items.filter((r) => value(r[0]) === "F1");
    expect(f1).toHaveLength(4);
    for (const r of f1) expect(Math.round((value(r[4]) as number) * (value(r[6]) as number) * 100)).toBe(Math.round((value(r[7]) as number) * 100));
    const pending = rows.findIndex((r) => value(r[0]) === "in Klärung, nicht addiert");
    expect(value(rows[pending][7])).toBe(80_73.59);
    expect(rows.slice(end, pending).filter((r) => /^F[678]$/.test(String(value(r[0])))).map((r) => value(r[0]))).toEqual(["F6", "F7", "F8"]);
  });

  it("settles both ways down to the Restforderung", () => {
    const text = sheets[1].rows.map((r) => r.map(value).join("|"));
    expect(text).toContain("Restforderung||89274.41|");
    expect(text).toContain("Restforderung laut Vertrag||92882.45|");
    expect(text.some((t) => t === "Bauschadensumlage|0.005|-3719.63|Abzug ohne Vertragspunkt")).toBe(true);
  });

  it("carries the Vorprüfung and the Schlussbesprechung with the figures of the solution list", () => {
    const check = sheets[2].rows.map((r) => r.map(value).join("|"));
    expect(check).toContain("Vorprüfung|||||8619");
    expect(check).toContain("davon schon gekürzt|||||1776");
    const meeting = sheets[3].rows.map((r) => r.map(value).join("|"));
    expect(meeting).toContain("Zusammen mit in Klärung||22693.74|20723.8|1969.94");
  });

  it("names the file a draft until every find is decided, and follows the decisions of this browser", () => {
    expect(exportFileName(v)).toBe(`Schlussrechnung_wohnpark-mooshaim_${v.project.asOf.iso}_Entwurf_intern.xlsx`);
    const decide = (stand: Decision["stand"]) => v.status.all.map((f): Decision => ({ fundSchluessel: f.key, zeit: "2026-10-25T10:00", wer: "Geschäftsführung", stand, ...(stand === "nicht_verrechnen" ? { grund: "Test" } : {}) }));
    const one = live([decide("nicht_verrechnen")[0]]).invoiceView("p1")!;
    expect(exportState(one).text).toBe("Entwurf, nicht freigegeben: 1 von 8 Funden entschieden");
    expect(invoiceSheets(one, origin)[0].rows.some((r) => value(r[0]) === "F1")).toBe(false);
    const all = live(decide("freigegeben")).invoiceView("p1")!;
    expect(exportState(all)).toEqual({ draft: false, text: "Alle 8 Funde entschieden" });
    expect(exportFileName(all)).toBe(`Schlussrechnung_wohnpark-mooshaim_${v.project.asOf.iso}_intern.xlsx`);
  });
});
