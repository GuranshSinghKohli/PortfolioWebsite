import { describe, expect, it } from "vitest";

import type { Track } from "@/content/types";
import { clockTime, nowPlaying } from "@/lib/listening";

const track = (title: string, durationSeconds: number): Track => ({ title, artist: "A", durationSeconds, art: "" });
const list = [track("one", 100), track("two", 50)];

describe("now playing", () => {
  it("loops through the playlist by the clock", () => {
    expect(nowPlaying(list, 0)).toMatchObject({ index: 0, elapsed: 0 });
    expect(nowPlaying(list, 99_999)).toMatchObject({ index: 0, elapsed: 99 });
    expect(nowPlaying(list, 100_000)).toMatchObject({ index: 1, elapsed: 0 });
    expect(nowPlaying(list, 149_000)).toMatchObject({ index: 1, elapsed: 49 });
    expect(nowPlaying(list, 150_000)).toMatchObject({ index: 0, elapsed: 0 });
  });

  it("gives every visitor the same song at the same second", () => {
    const now = Date.UTC(2026, 9, 26, 12, 0, 7);
    expect(nowPlaying(list, now)).toEqual(nowPlaying(list, now + 400));
  });

  it("plays nothing from an empty playlist", () => {
    expect(nowPlaying([], Date.now())).toBeNull();
  });

  it("formats times", () => {
    expect(clockTime(187)).toBe("3:07");
    expect(clockTime(5)).toBe("0:05");
  });
});
