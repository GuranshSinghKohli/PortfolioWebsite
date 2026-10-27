import { describe, expect, it } from "vitest";

import { loadingVerbs } from "@/lib/thread/voice";

describe("loading verbs", () => {
  it("come from the voice guide", () => {
    expect(loadingVerbs).toEqual(["Thinking", "Digging", "Recalling", "Connecting dots", "Checking receipts"]);
  });
});
