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
    kind: "8-month full-time co-op",
    headline:
      "Cut support escalations by 90% by revamping Garry, an OpenClaw-based conversational chatbot, across 15+ intents.",
    impact: [
      "Cut support escalations by 90% by revamping Garry, an OpenClaw-based conversational chatbot, across 15+ intents.",
      "Reduced API token usage by 65% by rewriting an internal LLM support tool’s prompt and generation pipeline.",
      "Projected $32K in annual savings by building a Stripe dispute analyst combining Stripe APIs with agentic workflows.",
      "Cut manual time by 20% with Feedback Radar, an automated pipeline turning multi-source feedback into reports.",
      "Cut manual fraud review by 20% with LLM-powered Stripe Radar triage, scoring flagged payments against fraud signals.",
    ],
    stack: ["OpenClaw", "LLMs", "Stripe APIs", "Agentic workflows"],
    signals: {
      strong: ["Windscribe", "Garry", "OpenClaw", "Stripe", "Feedback Radar", "Stripe Radar"],
      weak: ["chatbot", "support", "escalations", "tokens", "disputes", "feedback", "reports", "fraud", "payments"],
    },
  },
  {
    id: "uw-research",
    company: "University of Waterloo",
    team: "Data Systems Group",
    matchNames: ["Jimmy Lin", "Anserini", "RankLLM"],
    title: "AI/ML Undergraduate Researcher",
    logo: { src: "[fill in: /logos/uwaterloo.svg]", mono: false },
    location: "Waterloo, ON",
    dates: { start: "2026-10", end: null },
    kind: "Research",
    headline:
      "Researching information retrieval and LLM-based reranking for RAG under Prof. Jimmy Lin in the Data Systems Group.",
    impact: [
      "Researching information retrieval and LLM-based reranking for RAG under Prof. Jimmy Lin in the Data Systems Group, evaluating models against standard benchmarks.",
      "Reproduced BM25, dense (BGE) and learned sparse (SPLADE) retrieval on 8.8M MS MARCO passages, matching published results and contributing to Anserini.",
      "Built a two-stage BM25 + monoT5 search pipeline with RankLLM, raising nDCG@10 from 0.51 to 0.70 (+37%) on TREC DL19.",
    ],
    stack: ["BM25", "monoT5", "RankLLM", "Anserini", "BGE", "SPLADE", "MS MARCO"],
    signals: {
      strong: ["Jimmy Lin", "Anserini", "RankLLM", "monoT5", "MS MARCO", "BM25", "SPLADE", "TREC", "nDCG", "Data Systems Group"],
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
      "Built a modular Python ETL pipeline processing 100k+ tracking records across 64 FIFA World Cup matches into a unified schema.",
    impact: [
      "Built a modular Python ETL pipeline processing 100k+ tracking records across 64 FIFA World Cup matches into a unified schema.",
      "Engineered 7+ spatial features with Pandas and NumPy, converting raw player-tracking data into model-ready inputs.",
      "Automated validation across an 8-stage data pipeline, producing reproducible ML-ready datasets for run-value modelling.",
      "Researching counterfactual off-ball movement using Google Research Football to quantify alternative player runs.",
      "Designing run-value metrics using pitch control, controlled threat, defender displacement and passing-lane changes.",
      "Developing XGBoost models to estimate attacking value from player-agent states and movement trajectories.",
    ],
    stack: ["Python", "Pandas", "NumPy", "XGBoost", "Google Research Football"],
    signals: {
      strong: ["WAT.ai", "Wat.ai", "WATai", "FIFA", "World Cup", "Google Research Football"],
      weak: ["football", "soccer", "matches", "tracking", "spatial", "ETL", "run-value", "off-ball", "pitch control", "design team"],
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
      "Shipped trip-logging and expense-tracking features for 1.5K+ users by building REST and GraphQL APIs in Go backed by MySQL.",
      "Cut core expense-tracking query latency 5x (2s to 400ms) by redesigning relational schemas and optimizing SQL queries.",
      "Resolved recurring data-integrity issues across production services by adding request validation at API boundaries.",
    ],
    stack: ["Go", "MySQL", "REST APIs", "GraphQL"],
    signals: {
      strong: ["Savi", "Savi Finance"],
      weak: ["expense", "expenses", "trip", "Go", "MySQL", "query", "schema"],
    },
  },
];
