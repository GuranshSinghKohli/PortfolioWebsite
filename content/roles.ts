import type { Role } from "./types";

/** In the résumé's order. The sidebar pins these in this order. */
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
      "Cut support escalations by 90% by revamping Garry, an OpenClaw-based conversational chatbot, across 15+ intents.",
    impact: [
      "Cut support escalations by 90% by revamping Garry, an OpenClaw-based conversational chatbot, across 15+ intents.",
      "Reduced API token usage by 65% by rewriting an internal LLM support tool’s prompt and generation pipeline.",
      "Projected $32K in annual savings by building a Stripe dispute analyst combining Stripe APIs with agentic workflows.",
      "Cut manual time by 20% with Feedback Radar, an automated pipeline turning multi-source feedback into reports.",
    ],
    stack: ["OpenClaw", "LLMs", "Stripe APIs", "Agentic workflows"],
    signals: {
      strong: ["Windscribe", "Garry", "OpenClaw", "Stripe", "Feedback Radar"],
      weak: ["chatbot", "support", "escalations", "tokens", "disputes", "feedback", "reports"],
    },
  },
  {
    id: "uw-research",
    company: "University of Waterloo",
    team: "Data Group",
    matchNames: ["Jimmy Lin", "Anserini", "RankLLM"],
    title: "AI/ML Undergraduate Researcher",
    logo: { src: "[fill in: /logos/uwaterloo.svg]", mono: false },
    location: "Waterloo, ON",
    dates: { start: "2026-10", end: null },
    kind: "Research",
    headline:
      "Researching information retrieval and LLM-based reranking for RAG under Prof. Jimmy Lin in the Data Group.",
    impact: [
      "Researching information retrieval and LLM-based reranking for RAG under Prof. Jimmy Lin in the Data Group.",
      "Reproduced BM25, dense and learned sparse retrieval on 8.8M MS MARCO passages, contributing to Anserini.",
      "Built a two-stage search pipeline (BM25 + monoT5 reranker) with RankLLM, improving ranking quality by 37%.",
    ],
    stack: ["BM25", "monoT5", "RankLLM", "Anserini", "MS MARCO"],
    signals: {
      strong: ["Jimmy Lin", "Anserini", "RankLLM", "monoT5", "MS MARCO", "BM25", "Data Group"],
      weak: ["research", "researcher", "retrieval", "reranking", "reranker", "ranking", "search", "RAG", "lab"],
    },
  },
  {
    id: "wat-ai",
    company: "WAT.ai",
    title: "Data Science Engineer",
    logo: { src: "[fill in: /logos/wat-ai.svg]", mono: false },
    location: "Waterloo, ON",
    dates: { start: "2026-09", end: null },
    kind: "Design team",
    headline:
      "Built a modular Python ETL pipeline processing 100k+ tracking records across 64 matches into a unified schema.",
    impact: [
      "Built a modular Python ETL pipeline processing 100k+ tracking records across 64 matches into a unified schema.",
      "Engineered 7+ spatial features with Pandas and NumPy, converting raw player-tracking data into model-ready inputs.",
      "Automated validation across an 8-stage data pipeline, producing reproducible ML-ready datasets for run-value modelling.",
    ],
    stack: ["Python", "Pandas", "NumPy"],
    signals: {
      strong: ["WAT.ai", "Wat.ai", "WATai"],
      weak: ["football", "soccer", "matches", "tracking", "spatial", "ETL", "run-value", "design team"],
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
      "Cut core expense-tracking query latency 5x (2s to 400ms) by redesigning relational schemas and optimizing SQL queries.",
    impact: [
      "Shipped trip-logging and expense-tracking features for 1.5K+ users by building RESTful APIs in Go backed by MySQL.",
      "Cut core expense-tracking query latency 5x (2s to 400ms) by redesigning relational schemas and optimizing SQL queries.",
    ],
    stack: ["Go", "MySQL", "REST APIs"],
    signals: {
      strong: ["Savi", "Savi Finance"],
      weak: ["expense", "expenses", "trip", "Go", "MySQL", "query", "schema"],
    },
  },
];
