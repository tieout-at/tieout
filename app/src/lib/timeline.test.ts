import { describe, expect, it } from "vitest";

import { whatsappView } from "./inbox";
import { MISSING_TEXT, timelineView } from "./timeline";

describe("where missing work belongs", () => {
  it("settles in the Schlussrechnung once its Entwurf is in the folder, else in the next Abschlagsrechnung", () => {
    expect(timelineView("p1")?.target).toBe("schlussrechnung");
    expect(timelineView("p2")?.target).toBe("abschlagsrechnung");
    expect(timelineView("p3")?.target).toBe("abschlagsrechnung");
  });

  it("never says Schlussrechnung for a message of a running project", () => {
    const items = whatsappView().items;
    const kiefernau = items.filter((i) => i.project.name === "Bürohaus Kiefernau");
    expect(kiefernau.length).toBeGreaterThan(0);
    for (const i of kiefernau) expect(i.missing).toBe(MISSING_TEXT.abschlagsrechnung);
    for (const i of items.filter((x) => x.project.name === "Wohnpark Mooshaim")) expect(i.missing).toBe(MISSING_TEXT.schlussrechnung);
  });
});
