import { describe, expect, it } from "vitest";

import { homeChips } from "@/content/chips";
import { pickFollowUps, route } from "@/lib/router";
import { NO_AI_YET, resolveTurn, type ThreadContext } from "@/lib/thread/resolve";

const context = (overrides: Partial<ThreadContext> = {}): ThreadContext => ({
  id: 1,
  topic: null,
  asked: [],
  mode: "about",
  ...overrides,
});

describe("router: strong signals", () => {
  it("switches on a company or project name, whatever the current topic", () => {
    expect(route("What did you do at Windscribe?", null)).toEqual({ topic: "role:windscribe", reason: "strong" });
    expect(route("tell me about quantpilot", "role:windscribe")).toEqual({
      topic: "project:quantpilot",
      reason: "strong",
    });
    expect(route("And Wat.ai?", "projects").topic).toBe("role:wat-ai");
  });

  it("switches on résumé, with or without the accents", () => {
    expect(route("Can I see your résumé", "projects").topic).toBe("resume");
    expect(route("got a resume?", "role:savi").topic).toBe("resume");
  });

  it("keeps the current topic when it is named alongside another", () => {
    expect(route("Did Windscribe use Kafka like QuantPilot?", "role:windscribe").topic).toBe("role:windscribe");
  });

  it("matches whole words only", () => {
    expect(route("what's a gopher", null).reason).not.toBe("strong");
  });
});

describe("router: weak signals", () => {
  it("switches when the current topic says nothing about the word", () => {
    expect(route("what music do you like", "role:windscribe")).toEqual({ topic: "listening", reason: "weak" });
    expect(route("where have you worked", null)).toEqual({ topic: "experience", reason: "weak" });
    expect(route("tell me more about your music", "project:quantpilot").topic).toBe("listening");
  });

  it("stays when the current topic already covers the word", () => {
    // The Windscribe answer talks about what was built there.
    expect(route("what else have you built there", "role:windscribe")).toEqual({
      topic: "role:windscribe",
      reason: "inherit",
    });
    // "pipeline" is one of Wat.ai's own words.
    expect(route("how does the pipeline scale", "role:wat-ai").topic).toBe("role:wat-ai");
  });

  it("stays when the question points back at the current topic", () => {
    expect(route("how does that work", "project:quantpilot")).toEqual({
      topic: "project:quantpilot",
      reason: "inherit",
    });
  });
});

describe("router: no signals", () => {
  it("inherits the current topic", () => {
    expect(route("tell me more", "project:roadsafe-ai")).toEqual({ topic: "project:roadsafe-ai", reason: "inherit" });
    expect(route("how does that work", "project:quantpilot").topic).toBe("project:quantpilot");
  });

  it("has no topic at the start of a thread", () => {
    expect(route("hi", null)).toEqual({ topic: null, reason: "inherit" });
  });
});

describe("follow-ups", () => {
  it("offers the topic's follow-ups first, skipping what was asked", () => {
    expect(pickFollowUps("projects", ["projects"], homeChips.about)).toEqual(["experience", "resume", "contact"]);
    expect(pickFollowUps("projects", ["projects", "experience"], homeChips.about)).toEqual([
      "resume",
      "contact",
      "listening",
    ]);
  });

  it("falls back to the home chips and is never empty", () => {
    expect(pickFollowUps(null, [], homeChips.work)).toEqual(["projects", "experience", "resume"]);
    const everything = ["about", "projects", "experience", "listening", "resume", "contact"];
    expect(pickFollowUps("contact", everything, homeChips.about).length).toBeGreaterThan(0);
  });

  it("keeps a follow-up question on the current project", () => {
    const first = resolveTurn({ kind: "answer", id: "project:quantpilot", from: "sidebar" }, context());
    const next = resolveTurn(
      { kind: "typed", text: "how does that work?" },
      context({ id: 2, topic: first.topic, asked: ["project:quantpilot"] }),
    );
    expect(next.topic).toBe("project:quantpilot");
    expect(next.turn.reply.text).toBe(NO_AI_YET);
    expect(next.turn.reply.chips.length).toBeGreaterThan(0);
  });
});

describe("resolveTurn", () => {
  it("answers a chip or sidebar item with its curated answer", () => {
    const { turn, topic } = resolveTurn({ kind: "answer", id: "role:windscribe", from: "sidebar" }, context());
    expect(topic).toBe("role:windscribe");
    expect(turn.question).toBe("What did you do at Windscribe?");
    expect(turn.from).toBe("sidebar");
    expect(turn.reply.answerId).toBe("role:windscribe");
  });

  it("routes a typed question to the best curated answer", () => {
    const { turn } = resolveTurn({ kind: "typed", text: "What did you build at Savi?" }, context());
    expect(turn.question).toBe("What did you build at Savi?");
    expect(turn.reply.answerId).toBe("role:savi");
  });

  it("replies with the no-AI line when nothing matches", () => {
    const { turn } = resolveTurn({ kind: "typed", text: "what's your favourite colour" }, context());
    expect(turn.reply).toEqual({ text: NO_AI_YET, chips: ["projects", "resume", "listening"] });
  });

  it("doesn't repeat the answer just shown", () => {
    const { turn } = resolveTurn(
      { kind: "typed", text: "more about Windscribe" },
      context({ topic: "role:windscribe", asked: ["role:windscribe"] }),
    );
    expect(turn.reply.text).toBe(NO_AI_YET);
  });
});
