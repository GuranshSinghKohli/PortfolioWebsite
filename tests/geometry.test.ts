import { describe, expect, it } from "vitest";

import { nodes } from "@/content/graph";
import {
  MIN_CANVAS_WIDTH,
  displayLabel,
  edgeRuleViolations,
  findOverlaps,
  nodePosition,
} from "@/lib/graph-geometry";

describe("graph geometry", () => {
  it("places the owner at the centre and a known node on its ring", () => {
    const owner = nodes.find((node) => node.id === "me");
    const currentRole = nodes.find((node) => node.id === "r1");
    expect(owner && nodePosition(owner)).toEqual({ x: 50, y: 50 });
    expect(currentRole && nodePosition(currentRole)).toEqual({ x: 50, y: 29.77 });
  });

  it("keeps pills and ring labels 8px apart at 620px and wider", () => {
    for (const width of [MIN_CANVAS_WIDTH, 800, 1100, 1440]) {
      expect(findOverlaps(width), `canvas ${width}px`).toEqual([]);
    }
  });

  it("only connects neighbouring rings, except owner to life", () => {
    expect(edgeRuleViolations()).toEqual([]);
  });

  it("shortens pill text once a label passes 16 characters", () => {
    expect(
      displayLabel({
        id: "long",
        label: "A label that is clearly too long",
        ring: "projects",
        fullName: "[Placeholder]",
        summary: "[Placeholder]",
        links: {},
        year: "[Placeholder]",
        askQuestion: "[Placeholder]",
      }),
    ).toBe("A label that is…");
  });
});
