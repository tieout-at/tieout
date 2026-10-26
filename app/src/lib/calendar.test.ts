import { describe, expect, it } from "vitest";

import { addDays, byMoment, groupByDay, mondayOf, monthGrid, monthsBetween, weekNumber, weekTitle, weekdayOf, weeksBetween } from "./calendar";
import { timelineView } from "./timeline";

describe("calendar of the Zeitstrahl", () => {
  it("counts weeks from Monday and finds ISO week numbers", () => {
    expect(weekdayOf("2026-09-08")).toBe(1); // a Tuesday
    expect(mondayOf("2026-09-08")).toBe("2026-09-07");
    expect(mondayOf("2026-09-13")).toBe("2026-09-07"); // Sunday belongs to the week before
    expect(weekNumber("2026-09-08")).toBe(37); // W4 falls in KW 37 (solution list)
    expect(weekNumber("2026-01-01")).toBe(1);
    expect(weekNumber("2027-01-01")).toBe(53);
  });

  it("lists the weeks and months of a range", () => {
    expect(weeksBetween("2026-09-01", "2026-10-01")).toEqual(["2026-08-31", "2026-09-07", "2026-09-14", "2026-09-21", "2026-09-28"]);
    expect(monthsBetween("2025-11-20", "2026-02-01")).toEqual(["2025-11-01", "2025-12-01", "2026-01-01"]);
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("builds a month as full weeks from Monday", () => {
    const grid = monthGrid("2026-09-01");
    expect(grid[0][0]).toEqual({ iso: "2026-08-31", inMonth: false });
    expect(grid[0][1]).toEqual({ iso: "2026-09-01", inMonth: true });
    expect(grid.every((w) => w.length === 7)).toBe(true);
    expect(grid.flat().filter((d) => d.inMonth)).toHaveLength(30);
  });

  it("names a week within one month and across two", () => {
    expect(weekTitle("2026-09-07")).toBe("7. bis 13. September 2026");
    expect(weekTitle("2026-09-28")).toBe("28. September bis 4. Oktober 2026");
  });

  it("orders a day: all day first, then by time, the site before the invoices", () => {
    const e = (iso: string, time: string | null, lane = "baustelle") => ({ date: { iso }, time, lane });
    const day = [e("2026-06-05", "09:05"), e("2026-06-05", null, "rechnung"), e("2026-06-05", null), e("2026-06-04", "18:00")].sort(byMoment);
    expect(day.map((x) => `${x.date.iso} ${x.time} ${x.lane}`)).toEqual(["2026-06-04 18:00 baustelle", "2026-06-05 null baustelle", "2026-06-05 null rechnung", "2026-06-05 09:05 baustelle"]);
  });

  it("groups the events of Wohnpark Mooshaim by day, newest first, without losing one", () => {
    const view = timelineView("p1")!;
    const days = groupByDay(view.events, true);
    expect(days.flatMap((d) => d.events)).toHaveLength(view.events.length);
    expect(days[0].iso > days[days.length - 1].iso).toBe(true);
    // W4, the WhatsApp-Meldung of 08.09.2026 at 14:30, is on its day with its time
    const w4 = days.find((d) => d.iso === "2026-09-08")?.events.find((x) => x.art === "whatsapp");
    expect(w4?.time).toBe("14:30");
  });
});
