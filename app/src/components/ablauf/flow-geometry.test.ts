import { describe, expect, it } from "vitest";

import { FLOW_SLUGS, flowView } from "@/lib/flows";
import { cn } from "@/lib/utils";
import { blockShadow, bounds, edge, GROUP, GROUP_W, GROUP_X, H, LEFT, moveBy, place, ROW, W } from "./flow-geometry";

// The canvas of "Abläufe": blocks moved by hand (only in this browser view) and the blue outline of a selected block.
const view = flowView(FLOW_SLUGS.abschluss_lauf)!;
const trigger = view.nodes.find((n) => n.kind === "ausloeser")!;
const task = view.nodes.find((n) => n.side === "left")!;

describe("Abläufe canvas", () => {
  it("lays the blocks out as before while nothing was moved", () => {
    expect(place(view, trigger.id, {})).toEqual({ x: 0, y: 0 });
    expect(place(view, task.id, {})).toEqual({ x: LEFT, y: task.row * ROW });
    expect(bounds(view, {})).toEqual({ minX: LEFT, maxX: GROUP_X + GROUP_W, minY: -32, maxY: Math.max(...view.nodes.map((n) => n.row)) * ROW + H });
  });

  it("draws straight edges while the blocks line up, as laid out", () => {
    expect(edge({ x: 0, y: 0 }, { x: 0, y: ROW }, "down")).toEqual({ line: `M${W / 2} ${H} V${ROW - 1}`, head: `M${W / 2 - 5} ${ROW - 6} l5 5 5-5` });
    expect(edge({ x: 0, y: ROW }, { x: LEFT, y: ROW }, "left").line).toBe(`M0 ${ROW + H / 2} H${LEFT + W + 1}`);
    const at = place(view, view.checksAt!, {});
    expect(edge(at, place(view, GROUP, {}), "right").line).toBe(`M${W} ${at.y + H / 2} H${GROUP_X - 1}`);
  });

  it("moves a block by the drag at the current zoom, and its edges follow", () => {
    const from = place(view, trigger.id, {});
    // 60 px right and 30 px down on screen at 75 % are 80 and 40 canvas pixels
    const moved = moveBy({}, trigger.id, { x: 0, y: 0 }, 60, 30, 0.75);
    expect(place(view, trigger.id, moved)).toEqual({ x: from.x + 80, y: from.y + 40 });
    // a second drag starts where the first one ended
    expect(moveBy(moved, trigger.id, moved[trigger.id], -80, -40, 1)[trigger.id]).toEqual({ x: 0, y: 0 });
    const next = view.edges.find((e) => e.from === trigger.id)!;
    const line = edge(place(view, trigger.id, moved), place(view, next.to, moved), "down").line;
    expect(line.startsWith(`M${80 + W / 2} ${40 + H} C`)).toBe(true);
    expect(line.endsWith(`${W / 2} ${place(view, next.to, moved).y - 1}`)).toBe(true);
    // every other block stays where it was
    expect(place(view, task.id, moved)).toEqual(place(view, task.id, {}));
  });

  it("moves the card of the checks as one block and lets 'Ganz anzeigen' include moved blocks", () => {
    const moved = moveBy({}, GROUP, { x: 0, y: 0 }, 400, 0, 1);
    expect(place(view, GROUP, moved).x).toBe(GROUP_X + 400);
    expect(bounds(view, moved).maxX).toBe(GROUP_X + 400 + GROUP_W);
  });

  it("shows the selected block with the blue line, never hidden behind the button shadow", () => {
    // tailwind-merge keeps `shadow-button` next to `shadow-[…]`, and the stylesheet lets `shadow-button` win: one class only
    for (const [selected, running] of [[false, false], [true, false], [false, true], [true, true]]) {
      const classes = cn("rounded-[14px]", blockShadow(selected, running)).split(" ").filter((c) => c.startsWith("shadow-"));
      expect(classes).toHaveLength(1);
    }
    expect(blockShadow(true, false)).toContain("inset_0_0_0_1px_var(--color-accent)");
    expect(blockShadow(false, false)).toBe("shadow-button");
  });
});
