import { describe, expect, it } from "vitest";

import { bounds, paintOrder, sceneOf, topCell } from "@/components/projekt/scene";
import { buildingModel, placesIn } from "./building";
import { projectOverview } from "./project-view";

const placeOf = (projektId: string) => Object.fromEntries(projectOverview(projektId).finds.map((f) => [f.number, f.place]));

describe("places of the finds, read from their Belege", () => {
  it("places every find of Wohnpark Mooshaim where its Belege name it", () => {
    const p = placeOf("p1");
    expect(Object.fromEntries(Object.entries(p).map(([nr, x]) => [nr, x?.zone]))).toEqual({
      F1: "wohnungen",
      F2: "schacht-2",
      F3: "keller",
      F4: "stiege-2",
      F5: "decken",
      F6: "stiege-1",
      F7: "top-2-9",
      F8: "technikraum",
    });
  });

  it("takes the words and the source as written, an Ort field before running text", () => {
    const p = placeOf("p1");
    expect([p.F1!.label, p.F1!.from, p.F1!.stiegen]).toEqual(["Stiege 1 und 2, Wohnungstyp C", "WhatsApp-Meldung W1", [1, 2]]);
    expect([p.F7!.label, p.F7!.from, p.F7!.top]).toEqual(["Stiege 2, Top 9", "WhatsApp-Meldung W4", 9]);
    expect([p.F4!.label, p.F4!.from]).toEqual(["Stiege 2", "Aufmaßblatt 11"]);
  });

  it("leaves a find without a place off the schema instead of guessing", () => {
    const p = placeOf("p2");
    expect([p.F1?.zone, p.F2, p.F3?.zone]).toEqual(["og-2", null, "og-3"]);
    expect(Object.values(placeOf("p3")).map((x) => x?.zone)).toEqual(["altbau", "zubau", "altbau"]);
  });

  it("reads floors and Stiegen from plain words", () => {
    expect(placesIn({ text: "Teeküche zweiter Stock", from: "x", field: false })[0].zone).toBe("og-2");
    expect(placesIn({ text: "3. Obergeschoß, Heizung und Kühlung", from: "x", field: true })[0].label).toBe("3. Obergeschoß");
    expect(placesIn({ text: "Stiege 2, Steigschacht", from: "x", field: true })[0].zone).toBe("schacht-2");
    expect(placesIn({ text: "Provisorische Wasserversorgung für den Estrichleger", from: "x", field: false })).toEqual([]);
  });
});

describe("the schema of each project", () => {
  it("draws Wohnpark Mooshaim as two Stiegen over a base with Tiefgarage, Keller and Technikraum", () => {
    expect(projectOverview("p1").building).toEqual({ kind: "stiegen", stiegen: 2, base: ["tiefgarage", "keller", "technikraum"] });
  });

  it("draws Bürohaus Kiefernau as its floors from the Aufmaßblätter, Untergeschoß to 4. Obergeschoß", () => {
    const m = projectOverview("p2").building;
    expect(m?.kind).toBe("geschosse");
    expect(m?.kind === "geschosse" && m.floors.map((f) => f.id)).toEqual(["ug", "eg", "og-1", "og-2", "og-3", "og-4"]);
  });

  it("draws Volksschule Ahornbrunn as Altbau and Zubau, and no schema for closed projects", () => {
    expect(projectOverview("p3").building).toEqual({ kind: "teile", parts: ["altbau", "zubau"], untergeschoss: true });
    expect(projectOverview("p4").building).toBeNull();
    expect(projectOverview("p5").building).toBeNull();
  });

  it("needs two places for a schema", () => {
    expect(buildingModel(projectOverviewData(), [])).toBeNull();
  });
});

describe("the isometric scene", () => {
  const v = projectOverview("p1");
  const scene = sceneOf(v.building!, v.finds.flatMap((f) => (f.place ? [f.place] : [])));

  it("has a marker anchor for every placed find", () => {
    for (const f of v.finds) expect(scene.anchors[f.place!.zone], f.number).toBeDefined();
  });

  it("marks 14 flats of type C over both Stiegen and Top 9 on the third floor of Stiege 2", () => {
    expect(scene.patches.filter((p) => p.zone === "wohnungen")).toHaveLength(14);
    const stiege2 = scene.boxes.find((b) => b.id === "stiege-2")!;
    const cell = topCell(stiege2, 9);
    expect(cell.every((p) => p[2] > stiege2.z + 2 * 1.05 && p[2] < stiege2.z + 3 * 1.05)).toBe(true);
  });

  it("paints the base first and keeps everything inside its bounds", () => {
    expect(paintOrder(scene.boxes)[0].id).toBe("base");
    const b = bounds(scene);
    expect(b.w).toBeGreaterThan(0);
    expect(b.h).toBeGreaterThan(0);
  });
});

function projectOverviewData() {
  // a dataset is only read for its titles when there are places; two places are needed before that
  return { projekt: { langname: "" }, aufmass: [], plaene: [] } as unknown as Parameters<typeof buildingModel>[0];
}

describe("the figures of a closed project", () => {
  it("names the cut of Wohnhof Erlenhain by reason, as the solution list does", () => {
    const c = projectOverview("p4").closing!;
    expect(c.cut.text).toBe("2.655,20 €");
    expect(c.reasons.map((r) => `${r.label} ${r.amount.text}`)).toEqual(["Aufmaß nicht gegengezeichnet 2.575,20 €", "Rechenfehler 80,00 €"]);
    expect(c.deductions.map((d) => `${d.label} ${d.amount.text}`)).toEqual(["Bauschadensumlage 3.305,55 €"]);
    expect([c.final.text, c.days, c.kept.text]).toEqual(["86.223,12 €", 90, "19.615,15 €"]);
  });
});
