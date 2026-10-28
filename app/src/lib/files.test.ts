import { describe, expect, it } from "vitest";

import { cleanName, fileRefusal, hex, MAX_BYTES, sizeText, sniffType } from "./files";

const bytes = (...b: number[]) => new Uint8Array([...b, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, 8));

describe("a file before it goes up (step 10, part E)", () => {
  it("knows PDF, JPEG and PNG by their first bytes, whatever the name says", () => {
    expect(sniffType(new TextEncoder().encode("%PDF-1.7"))).toBe("application/pdf");
    expect(sniffType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe("image/jpeg");
    expect(sniffType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe("image/png");
    expect(sniffType(new TextEncoder().encode("<html><s"))).toBeNull();
    expect(sniffType(new TextEncoder().encode("%PDF"))).toBeNull();
    expect(sniffType(new Uint8Array())).toBeNull();
  });

  it("refuses an empty file, one over 20 MB and any other type, in the app's words", () => {
    expect(fileRefusal(0, "application/pdf")).toBe("Die Datei ist leer.");
    expect(fileRefusal(MAX_BYTES + 1, "application/pdf")).toMatch(/20 MB/);
    expect(fileRefusal(MAX_BYTES, "image/png")).toBeNull();
    expect(fileRefusal(1200, null)).toMatch(/Nur PDF, JPEG oder PNG/);
  });

  it("gives the name in the form the database takes it", () => {
    expect(cleanName("Regiebericht 9 (Seite 1).pdf")).toBe("Regiebericht 9 (Seite 1).pdf");
    expect(cleanName("../a\\b.pdf")).toBe(".._a_b.pdf");
    expect(cleanName("Rechnung‮fdp.pdf")).toBe("Rechnung_fdp.pdf");
    expect(cleanName("a\tb.pdf")).toBe("a_b.pdf");
    expect(cleanName("   ")).toBe("Datei");
    expect(cleanName(`${"x".repeat(300)}.pdf`)).toHaveLength(255);
  });

  it("writes the checksum as 64 small hex digits and the size in words", async () => {
    const sha = hex(await crypto.subtle.digest("SHA-256", new TextEncoder().encode("abc")));
    expect(sha).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
    expect(sizeText(1_258_291)).toBe("1,2 MB");
    expect(sizeText(860_000)).toBe("840 KB");
    expect(sizeText(10)).toBe("1 KB");
  });
});
