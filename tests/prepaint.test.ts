import { afterEach, describe, expect, it, vi } from "vitest";

import { profile } from "@/content/profile";
import { BOOT_STORAGE_KEY, dayPart, greetingScript, shellScript, subLineScript } from "@/lib/prepaint";

/** Runs an inline script against a one-node fake document. */
function run(script: string) {
  const node = { textContent: "" };
  vi.stubGlobal("document", { getElementById: () => node });
  new Function(script)();
  return node.textContent;
}

/** Runs the <head> script and returns the data attributes it set on <html>. */
function runShell(storage: Record<string, string>, reducedMotion = false) {
  const dataset: Record<string, string> = {};
  vi.stubGlobal("document", { documentElement: { dataset } });
  vi.stubGlobal("localStorage", { getItem: (key: string) => storage[key] ?? null });
  vi.stubGlobal("matchMedia", () => ({ matches: reducedMotion }));
  new Function(shellScript)();
  return dataset;
}

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("pre-paint scripts", () => {
  it("picks the greeting dayPart picks, for every hour", () => {
    vi.useFakeTimers();
    for (let hour = 0; hour < 24; hour++) {
      vi.setSystemTime(new Date(2026, 9, 26, hour, 30));
      expect(run(greetingScript("g")), `hour ${hour}`).toBe(profile.greetings[dayPart(hour)]);
    }
  });

  it("splits the day at 5, 12, 17 and 22", () => {
    expect([4, 5, 11, 12, 16, 17, 21, 22].map(dayPart)).toEqual([
      "lateNight",
      "morning",
      "morning",
      "afternoon",
      "afternoon",
      "evening",
      "evening",
      "lateNight",
    ]);
  });

  it("picks a sub-line from the profile", () => {
    expect(profile.subLines).toContain(run(subLineScript("s")));
  });

  it("boots on a first visit and only reveals after that", () => {
    expect(runShell({}).intro).toBe("boot");
    expect(runShell({ [BOOT_STORAGE_KEY]: "1" }).intro).toBe("reveal");
  });

  it("skips the intro with reduced motion", () => {
    expect(runShell({}, true).intro).toBeUndefined();
  });

  it("restores the collapsed rail", () => {
    expect(runShell({ rail: "collapsed" }).rail).toBe("collapsed");
  });
});
