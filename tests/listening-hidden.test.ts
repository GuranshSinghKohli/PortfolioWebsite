import { describe, expect, it } from "vitest";

import { answers } from "@/content/answers";
import { hiddenTopics, homeChips } from "@/content/chips";
import { hasTracks } from "@/content/music";
import { pickFollowUps } from "@/lib/router";

describe("Listening while the playlist is empty", () => {
  it.runIf(!hasTracks)("is hidden from home chips and every follow-up", () => {
    expect(hiddenTopics).toContain("listening");
    expect([...homeChips.about, ...homeChips.work]).not.toContain("listening");
    expect(homeChips.about).toHaveLength(4);
    for (const entry of answers) {
      for (const mode of ["about", "work"] as const) {
        expect(pickFollowUps(entry.id, [], homeChips[mode])).not.toContain("listening");
      }
    }
  });

  it.runIf(hasTracks)("is offered once there are songs", () => {
    expect(homeChips.about).toContain("listening");
    expect(hiddenTopics).toEqual([]);
  });
});
