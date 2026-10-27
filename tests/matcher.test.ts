import { describe, expect, it } from "vitest";

import { answers } from "@/content/answers";
import { projects } from "@/content/projects";
import { match, score, tokens } from "@/lib/matcher";

const answerText = (id: string) => answers.find((entry) => entry.id === id)!.answer;
const ids = (question: string, answer = "") => match(question, answer).map((entity) => entity.id);

describe("matcher", () => {
  it("finds one card from a description that never names it", () => {
    expect(ids("which one looked at severe crashes and the weather?")).toEqual(["roadsafe-ai"]);
    expect(ids("the campus app for verified students")).toEqual(["wanderers"]);
    expect(ids("something with a knowledge graph of companies and partnerships")).toEqual(["quantpilot"]);
  });

  it("finds every project for 'what have you built'", () => {
    expect(ids("what have you built", answerText("projects")).sort()).toEqual(
      projects.map((project) => project.slug).sort(),
    );
  });

  it("attaches every card an answer names, however briefly", () => {
    // gpt-6-luna's own answer to "What have you built?" (2026-10-26): RoadSafe AI gets one short clause.
    const answer =
      "I've built QuantPilot, an event-driven market research platform, and RoadSafe AI, a road-safety analytics project. I'm also a founding engineer on Wanderers.space, a campus social platform for verified Waterloo students. My work has included data pipelines, knowledge graphs, APIs, real-time chat, and AI-powered research and recommendations.";
    expect(ids("What have you built?", answer).sort()).toEqual(["quantpilot", "roadsafe-ai", "wanderers"]);
  });

  it("matches on a title word alone", () => {
    expect(ids("Savi?")).toEqual(["savi"]);
    expect(ids("tell me about QuantPilot")).toEqual(["quantpilot"]);
  });

  it("attaches the research role by its people and tools, not by 'Waterloo'", () => {
    expect(ids("What do you research with Jimmy Lin?")).toEqual(["uw-research"]);
    expect(ids("Tell me about your Anserini work")).toEqual(["uw-research"]);
    // Wanderers' own copy says "verified Waterloo students"; education answers name the university.
    expect(ids("What is Wanderers.space?", answerText("project:wanderers"))).toEqual(["wanderers"]);
    expect(ids("Where do you study?", "I study math at the University of Waterloo.")).toEqual([]);
  });

  it("ignores words shared by several cards", () => {
    // "pipeline" and "100k" appear in more than one card's copy.
    expect(ids("a pipeline with 100k records")).toEqual([]);
  });

  it("needs two distinctive words without a title hit", () => {
    expect(ids("anything about tableau?")).toEqual([]);
    expect(score("tableau dashboards and junctions")[0]).toMatchObject({ id: "roadsafe-ai", title: false });
  });

  it("drops cards below the confidence floor", () => {
    // A strong Windscribe match shouldn't drag in a card with a weak, incidental hit.
    const result = ids("What did you do at Windscribe?", answerText("role:windscribe"));
    expect(result).toEqual(["windscribe"]);
  });

  it("tokenises with accents, plurals and stopwords handled", () => {
    expect(tokens("The Résumé crashes records")).toEqual(["resume", "crash", "record"]);
  });
});
