import { describe, expect, it } from "vitest";

import type { Task, TaskCheck } from "./decisions";
import { findRows } from "./kern-data";
import { byDue, doneTasks, dueGroup, dueText, groupOpen, targetOf, taskWords, withChecks } from "./tasks";

const task = (id: string, bis: string | null, zeit = "2026-10-25T09:00"): Task => ({
  id,
  fundSchluessel: "p1/plan:H-201:D",
  fund: "F1 Wohnpark Mooshaim",
  href: "/funde/wohnpark-mooshaim-f1/",
  zeit,
  wer: "Abrechnung",
  text: `Aufgabe ${id}.`,
  zustaendig: "Bauleitung",
  bis,
});
const check = (aufgabeId: string, zeit: string, erledigt: boolean): TaskCheck => ({ aufgabeId, zeit, wer: "Bauleitung", erledigt });

describe("tasks on finds (append only)", () => {
  it("is open without a tick; the latest tick counts and every tick stays for the Verlauf", () => {
    const [a, b] = withChecks([task("a", null), task("b", null)], [check("a", "2026-10-25T10:00", true), check("a", "2026-10-25T11:00", false), check("b", "2026-10-25T10:00", true)]);
    expect(a.done).toBeNull();
    expect(a.checks.map((c) => c.erledigt)).toEqual([true, false]);
    expect(b.done?.zeit).toBe("2026-10-25T10:00");
  });

  it("keeps the order of appending within the same minute", () => {
    const [a] = withChecks([task("a", null)], [check("a", "2026-10-25T10:00", true), check("a", "2026-10-25T10:00", false)]);
    expect(a.done).toBeNull();
  });

  it("groups by due date across month ends, free of time zones", () => {
    expect(dueGroup(null, "2026-10-25")).toBe("ohne");
    expect(dueGroup("2026-10-24", "2026-10-25")).toBe("ueberfaellig");
    expect(dueGroup("2026-10-25", "2026-10-25")).toBe("heute");
    expect(dueGroup("2026-11-01", "2026-10-25")).toBe("woche");
    expect(dueGroup("2026-11-02", "2026-10-25")).toBe("spaeter");
    expect(dueText("2026-10-26", "2026-10-25")).toEqual({ text: "Morgen", tone: null });
    expect(dueText("2026-10-20", "2026-10-25")).toEqual({ text: "20.10.2026", tone: "red" });
    expect(dueText("2026-10-25", "2026-10-25")?.tone).toBe("orange");
  });

  it("lists open tasks by due date in their groups, without a date last, and done ones by their tick", () => {
    const items = withChecks([task("ohne", null), task("spaet", "2026-12-01"), task("bald", "2026-10-28"), task("weg", "2026-10-26")], [check("weg", "2026-10-25T12:00", true)]);
    expect(groupOpen(items, "2026-10-25").map((g) => [g.id, g.items.map((t) => t.id)])).toEqual([
      ["woche", ["bald"]],
      ["spaeter", ["spaet"]],
      ["ohne", ["ohne"]],
    ]);
    expect(items.toSorted(byDue).map((t) => t.id)).toEqual(["weg", "bald", "spaet", "ohne"]);
    expect(doneTasks(items).map((t) => t.id)).toEqual(["weg"]);
  });

  it("names the find and starts with its Abhilfe, as the find page does", () => {
    const f1 = targetOf(findRows()[0]);
    expect(f1.label).toBe("F1 Wohnpark Mooshaim");
    expect(f1.deadline).toBe("Schlussrechnung legen bis 30.10.2026");
    expect(f1.taskText.length).toBeGreaterThan(0);
    expect(taskWords({ text: "Aufmaß gegenzeichnen lassen.", zustaendig: "Bauleitung", bis: "2026-10-28" })).toBe("Aufmaß gegenzeichnen lassen, bis 28.10.2026");
  });
});
