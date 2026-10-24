import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { twinView } from "./twin";

const list = readFileSync(new URL("../../../docs/Demo_Faelle.md", import.meta.url), "utf8");
function listed(text: string): string {
  if (!list.includes(text)) throw new Error(`${text} is not in docs/Demo_Faelle.md`);
  return text;
}

describe("Übersicht of Wohnpark Mooshaim", () => {
  const v = twinView("p1")!;

  it("counts the folder in the website's groups: 77 Belege with 4 copies, 4 WhatsApp-Meldungen outside", () => {
    expect([v.counts.belege, v.counts.copies, v.counts.whatsapp]).toEqual([77, 4, 4]);
    expect(v.counts.perGroup).toEqual({ systeme: 7, dokumente: 44, kommunikation: 26, whatsapp: 4 });
  });

  it("shows the Abgleich of all 286 positions and 17 services without position", () => {
    expect([v.abgleich.positions.length, v.abgleich.withoutPosition.length]).toEqual([286, 17]);
    expect(v.abgleich.counts).toEqual({ verrechnet: 265, menge_abweichend: 11, pauschale: 16, fund: 11 });
    expect(v.abgleich.positions.filter((c) => c.find === "F1").map((c) => c.id)).toEqual(["22.03.02A", "22.04.12B", "22.05.03A", "22.05.06A"]);
  });

  it("links every finding to the Belege that prove it, and F1 to the same reason in Wohnhof Erlenhain", () => {
    const proving = (nr: string) => v.belege.filter((b) => b.finds.includes(nr));
    expect(proving("F1").map((b) => b.title)).toContain("Aufmaßblatt 12");
    expect(proving("F1").filter((b) => b.groupKey === "whatsapp")).toHaveLength(1);
    expect(v.finds.every((f) => proving(f.number).length > 0)).toBe(true);
    expect(v.finds.find((f) => f.number === "F1")?.sameReason).toBe("Gleicher Grund bei diesem Auftraggeber schon im Wohnhof Erlenhain.");
    // 23 Belege point to a finding; the own Entwurf only shows what was invoiced and is never counted as proof
    expect(v.belege.filter((b) => (b.finds.length || b.shows.length) && b.groupKey !== "whatsapp")).toHaveLength(23);
    expect(v.belege.filter((b) => b.shows.length).map((b) => b.art)).toEqual(["entwurf"]);
    expect(proving("F4").map((b) => b.art)).not.toContain("entwurf");
    expect(v.finds.map((f) => f.label)).toEqual(["Plan H-201 Index C → D", "Regiebericht 9", "Regiebericht 15", "Mehrschichtverbundrohr", "Brandschutzmanschette", "Regiebericht 12", "Heizkörper Top 9 versetzt", "Technikraum umgeplant"]);
    expect(v.finds.map((f) => f.bucket)).toEqual(["zusaetzlich", "zusaetzlich", "zusaetzlich", "zusaetzlich", "zusaetzlich", "klaerung", "klaerung", "klaerung"]);
    expect(v.finds[0].cells).toEqual(["22.03.02A", "22.04.12B", "22.05.03A", "22.05.06A"]);
    expect(v.abgleich.positions.find((c) => c.id === "22.04.12B")?.index).toBe(49);
    expect(v.planChains.find((k) => k.plan === "H-201")?.indices).toEqual(["C", "D"]);
    expect(v.finds.find((f) => f.number === "F1")?.risk).toEqual({ reason: "Aufmaß nicht gegengezeichnet", amount: listed("6.648,60 €"), alreadyCut: false });
    expect(v.finds.find((f) => f.number === "F6")?.remedy).toBe("Regiebericht vom Polier unterschreiben lassen");
  });

  it("keeps the money words apart, all from the solution list", () => {
    expect(v.money).toEqual({
      extra: listed("14.620,15 €"),
      atRisk: listed("6.843,00 €"),
      unclear: listed("8.073,59 €"),
      missing: listed("1.119,99 €"),
      changeOrder: listed("6.953,60 €"),
    });
  });

  it("has no overview for a closed project", () => {
    expect(twinView("p4")).toBeNull();
  });
});
