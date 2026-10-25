import type { Project } from "./types";

/** The three headline projects, in the order the Projects answer shows them. */
export const projects: Project[] = [
  {
    slug: "quantpilot",
    title: "QuantPilot",
    blurb: "Stocks intelligence platform.",
    writeUp: "[fill in: long write-up for the QuantPilot detail sheet and case-study page]",
    highlights: [
      "Architected an event-driven research platform for market events, technology trends, and second-order impact analysis.",
      "Engineered Kafka + PySpark pipelines for scalable ingestion and processing of financial, news, and research data.",
      "Built a Neo4j knowledge graph mapping companies, technologies, investments, and partnerships for market analysis.",
      "Developed multi-agent research workflows with source verification and PostgreSQL for traceable, evidence-backed analysis.",
    ],
    stack: ["LangGraph", "Kafka", "PySpark", "FastAPI", "PostgreSQL", "Neo4j"],
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
      "Modeled 100K US crash records into a dbt + Postgres star schema (fact + 4 dims) with no imputation in the raw load.",
      "Showed the national rain-vs-clear severity gap is state composition, not weather (California +0.46 pp; Florida +9.45 pp).",
      "Isolated junction proximity at ~27.9% severe across three baselines, the one condition surviving base-rate correction.",
      "Set an 80.55% majority-class floor that weather and time features failed to beat; published findings to a Tableau dashboard.",
    ],
    stack: ["Python", "PostgreSQL", "dbt", "Docker", "Pandas", "NumPy", "scikit-learn", "Tableau"],
    links: {
      code: "[fill in: RoadSafe AI GitHub URL]",
      live: "[fill in: Tableau dashboard URL, or delete this line]",
    },
    poster: "[fill in: /posters/roadsafe-ai.jpg]",
    demo: "[fill in: /demos/roadsafe-ai.mp4]",
    year: "[fill in: year]",
    signals: {
      strong: ["RoadSafe", "RoadSafe AI", "Road Safe", "Tableau", "dbt"],
      weak: ["crash", "crashes", "road", "safety", "weather", "analytics", "star schema", "severity"],
    },
  },
  {
    slug: "wanderers",
    title: "Wanderers.space",
    blurb: "Campus social platform for verified Waterloo students.",
    writeUp: "[fill in: long write-up for the Wanderers.space detail sheet and case-study page]",
    highlights: [
      "Built Wanderers, a Next.js campus social platform serving 46 MAU of verified Waterloo students.",
      "Architected REST APIs, realtime pub/sub, and live chat for activity matching, feeds, and real-time group interactions.",
      "Integrated Gemini AI, Google Maps, and K-means clustering for activity creation and personalized recommendations.",
      "Pitched at Velocity, receiving mentorship from 2 Velocity UW incubator mentors on product development.",
    ],
    stack: ["Next.js", "REST APIs", "Realtime pub/sub", "Gemini", "Google Maps", "K-means"],
    links: {
      code: "https://github.com/Kapil-Iyer/Wanderers",
      live: "[fill in: live URL, or delete this line]",
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
      strong: ["Wanderers", "Wanderers.space", "Velocity", "Gemini"],
      weak: ["social", "campus", "students", "chat", "realtime", "recommendations", "startup", "founding"],
    },
  },
];
