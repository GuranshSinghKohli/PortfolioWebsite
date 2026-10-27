import type { Project } from "./types";

/** The three headline projects, in the order the Projects answer shows them. */
export const projects: Project[] = [
  {
    slug: "quantpilot",
    title: "QuantPilot",
    blurb: "Stock intelligence platform.",
    writeUp: "[fill in: long write-up for the QuantPilot detail sheet and case-study page]",
    highlights: [
      "Architected an event-driven research platform with a FastAPI backend, surfacing the second-order impacts of market events.",
      "Built Kafka + PySpark streaming pipelines ingesting and processing financial, news and research data in real time.",
      "Modelled companies, technologies, investments and partnerships in a Neo4j knowledge graph for relationship-driven analysis.",
      "Orchestrated LangGraph multi-agent research workflows with source verification, persisting evidence in PostgreSQL.",
    ],
    stack: ["LangGraph", "Kafka", "PySpark", "Neo4j", "FastAPI", "PostgreSQL"],
    links: {
      code: "https://github.com/GuranshSinghKohli/quantpilot",
      live: "[fill in: live URL, or delete this line]",
    },
    poster: "[fill in: /posters/quantpilot.jpg]",
    demo: "[fill in: /demos/quantpilot.mp4]",
    year: "[fill in: year]",
    signals: {
      strong: ["QuantPilot", "Quant Pilot", "Neo4j", "LangGraph", "Kafka", "PySpark"],
      weak: ["stocks", "market", "finance", "trading", "agents", "multi-agent", "knowledge graph", "research"],
    },
  },
  {
    slug: "roadsafe-ai",
    title: "RoadSafe AI",
    blurb: "US road safety analytics.",
    writeUp: "[fill in: long write-up for the RoadSafe AI detail sheet and case-study page]",
    highlights: [
      "Built a Dockerized dbt + PostgreSQL pipeline modelling 100K US crash records into a star schema.",
      "Found the national rain-vs-clear severity gap was driven by state mix, not weather (California +0.46 pp vs Florida +9.45 pp).",
      "Benchmarked scikit-learn models against an 80.55% majority-class baseline and published findings to a Tableau dashboard.",
    ],
    stack: ["Python", "dbt", "PostgreSQL", "Docker", "scikit-learn", "Tableau"],
    links: {
      code: "https://github.com/GuranshSinghKohli/Accident_Severity_-Predictor_USA",
      live: "[fill in: Tableau dashboard URL, or delete this line]",
    },
    poster: "[fill in: /posters/roadsafe-ai.jpg]",
    demo: "[fill in: /demos/roadsafe-ai.mp4]",
    year: "[fill in: year]",
    signals: {
      strong: ["RoadSafe", "RoadSafe AI", "Road Safe", "Tableau", "dbt"],
      weak: ["crash", "crashes", "road", "safety", "weather", "analytics", "star schema", "severity", "accident"],
    },
  },
  {
    slug: "wanderers",
    title: "Wanderers.space",
    blurb: "Campus social platform for verified Waterloo students.",
    writeUp: "[fill in: long write-up for the Wanderers.space detail sheet and case-study page]",
    highlights: [
      "Launched Wanderers, a Next.js campus social platform, growing to 46 MAU among verified Waterloo students.",
      "Architected REST APIs, real-time pub/sub and live chat, powering activity matching, feeds and group interactions.",
    ],
    stack: ["Next.js", "REST APIs", "Real-time pub/sub", "Live chat"],
    links: {
      code: "https://github.com/Kapil-Iyer/Wanderers",
      live: "https://www.wanderers.space",
    },
    poster: "[fill in: /posters/wanderers.jpg]",
    demo: "[fill in: /demos/wanderers.mp4]",
    year: "2026",
    status: "Prototype",
    role: {
      title: "Founding Engineer",
      location: "Waterloo, ON",
      dates: { start: "2026-01", end: null },
    },
    signals: {
      strong: ["Wanderers", "Wanderers.space"],
      weak: ["social", "campus", "students", "chat", "realtime", "real-time", "matching", "feeds", "startup", "founding"],
    },
  },
];
