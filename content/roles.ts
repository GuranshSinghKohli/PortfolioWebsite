import type { Role } from "./types";

/** Newest first. The sidebar pins these in this order. */
export const roles: Role[] = [
  {
    id: "windscribe",
    company: "Windscribe",
    title: "AI Engineer",
    logo: { src: "[fill in: /logos/windscribe.svg]", mono: false },
    location: "Toronto, ON",
    dates: { start: "2026-05", end: "2026-12" },
    kind: "8-month co-op",
    headline:
      "Revamped Garry, an OpenClaw-based chatbot, across 15+ intents, reducing human support escalations by 90%.",
    impact: [
      "Revamped Garry, an OpenClaw-based chatbot, across 15+ intents, reducing human support escalations by 90%.",
      "Rewrote an internal LLM support tool’s prompt and generation pipeline, cutting API token usage by 65%.",
      "Built a Stripe dispute analyst integrating Stripe APIs with agentic workflows, projected to save $32K annually.",
      "Built LLM-powered Stripe Radar triage that scores flagged payments against fraud signals, cutting manual work by 20%.",
    ],
    stack: ["OpenClaw", "LLMs", "Stripe APIs", "Agentic workflows"],
    signals: {
      strong: ["Windscribe", "Garry", "OpenClaw", "Stripe", "Stripe Radar"],
      weak: ["chatbot", "support", "escalations", "tokens", "disputes", "fraud", "payments"],
    },
  },
  {
    id: "wat-ai",
    company: "Wat.ai",
    team: "Offball XI (Real Data & Spatial Analytics UW Design Team)",
    title: "Data Science Engineer",
    logo: { src: "[fill in: /logos/wat-ai.svg]", mono: false },
    location: "Waterloo, ON",
    dates: { start: "2026-09", end: null },
    kind: "Design team",
    headline:
      "Building a Python pipeline to ingest and process 100k+ tracking records from 2022 FIFA World Cup data.",
    impact: [
      "Building a Python pipeline to ingest and process 100k+ tracking records from 2022 FIFA World Cup data.",
      "Standardizing data across 64 matches and 800+ player-tracking fields to align World Cup data with GRF.",
      "Engineering 7+ spatial features using Pandas and NumPy to prepare tracking data for machine learning experiments.",
      "Automating data validation and transformation across 8 processing steps, producing ML-ready datasets for counterfactual run-value modelling.",
    ],
    stack: ["Python", "Pandas", "NumPy"],
    signals: {
      strong: ["Wat.ai", "WAT.ai", "Offball XI", "Offball", "FIFA", "World Cup"],
      weak: ["football", "soccer", "tracking", "spatial", "pipeline", "design team"],
    },
  },
  {
    id: "savi",
    company: "Savi Finance",
    title: "Software Developer",
    logo: { src: "[fill in: /logos/savi.svg]", mono: false },
    location: "Toronto, ON",
    dates: { start: "2025-11", end: "2026-05" },
    headline:
      "Redesigned relational schemas and optimized queries, taking a core expense-tracking query from 2s to 400ms (5x faster).",
    impact: [
      "Built RESTful APIs in Go with MySQL powering trip-logging and expense-tracking workflows for 1.5K+ users.",
      "Redesigned relational schemas and optimized queries, reducing a core expense-tracking query from 2s to 400ms (5x faster).",
      "Resolved recurring data-integrity issues through improved request validation across production services.",
    ],
    stack: ["Go", "MySQL", "REST APIs"],
    signals: {
      strong: ["Savi", "Savi Finance"],
      weak: ["expense", "expenses", "trip", "Go", "MySQL", "query", "schema"],
    },
  },
];
