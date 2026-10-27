import { hasTracks } from "./music";
import { projects } from "./projects";
import { roles } from "./roles";
import type { CuratedAnswer } from "./types";

/**
 * Instant answers for chips and sidebar items (PRD section 8). These never
 * call the AI, so every fact in them must also be in content/.
 */
/**
 * What a typed question gets when the model's safety checks block it, in the
 * voice of content/voice.md: short, polite, steering back to work.
 */
export const blockedReply = "That's not one I'll answer here. Ask me about something I've built instead.";

/**
 * What a typed question shows when the AI can't answer, in the same voice.
 * Never a raw error. `{seconds}` is filled in when the server says how long
 * to wait. The chips under each one still answer instantly.
 */
export const aiProblems = {
  rateLimited: "You're asking faster than my rate limit. Give it {seconds} seconds, or tap a chip below.",
  rateLimitedLong: "That's a lot of questions in an hour. Take a breather, or tap a chip below.",
  budget: "The AI has used up today's budget. The chips below still answer instantly.",
  unavailable: "The AI is offline for a moment. The chips below still work.",
  network: "The connection dropped before my answer arrived.",
  server: "Something broke on my side. Try again, or tap a chip below.",
};

/**
 * The contact sheet's results, in the same voice. `{email}` is the visitor's
 * address. Failures hand the draft to the visitor's mail app.
 */
export const contactCopy = {
  sent: "Sent. It's in my inbox now, and my reply will go to {email}.",
  failed: "My mail server didn't take it, so I opened your mail app with your message ready to send.",
  rateLimited: "That's a few messages from you already. I opened your mail app with this one ready to send.",
  mailtoHint: "Nothing opened?",
};


const topics: CuratedAnswer[] = [
  {
    id: "about",
    question: "Who are you?",
    answer:
      "I'm Guransh, a math student at the University of Waterloo. Right now I'm an AI engineer co-op at Windscribe, building LLM tools for support and payments. I'm also an undergraduate researcher in Prof. Jimmy Lin's Data Systems Group working on retrieval and reranking for RAG, a data science engineer at WAT.ai, and the founding engineer of Wanderers.space, a campus social app.",
    attachments: [{ kind: "roles", ids: roles.map((role) => role.id) }],
    followUps: ["projects", "experience", "contact"],
  },
  {
    id: "projects",
    question: "What have you built?",
    answer:
      "Four worth your time. MerchantOS is a multi-tenant AI commerce platform where LangGraph agents help Shopify merchants, with a human approving every action. QuantPilot is a multi-agent research platform for market events. RoadSafe AI digs into 100K US crash records to find what really drives severe crashes. Wanderers.space is a campus social app for Waterloo students.",
    attachments: [{ kind: "projects", slugs: projects.map((project) => project.slug) }],
    followUps: ["experience", "resume", "contact"],
  },
  {
    id: "experience",
    question: "Where have you worked?",
    answer:
      "AI Engineer co-op at Windscribe (May to December 2026), AI/ML Undergraduate Researcher in the University of Waterloo's Data Systems Group (October 2026 to now), Data Science Engineer at WAT.ai (September 2026 to now), and Software Developer at Savi Finance (November 2025 to May 2026).",
    attachments: [{ kind: "roles", ids: roles.map((role) => role.id) }],
    followUps: ["projects", "resume", "contact"],
  },
  {
    id: "listening",
    question: "What are you listening to?",
    answer: hasTracks
      ? "Here's what's on repeat right now."
      : "My playlist isn't up yet. Check back soon, or ask me about something I've built.",
    attachments: hasTracks ? [{ kind: "music" }] : [],
    followUps: ["about", "projects"],
  },
  {
    id: "resume",
    question: "Can I see your résumé?",
    answer:
      "Here's my résumé. Short version: AI engineering at Windscribe, retrieval research at Waterloo, data engineering at WAT.ai, backend work at Savi Finance.",
    attachments: [{ kind: "resume" }],
    followUps: ["experience", "projects", "contact"],
  },
  {
    id: "contact",
    question: "How do I get in touch?",
    answer: "Send me a message below, or reach me by email or LinkedIn.",
    attachments: [{ kind: "contact" }],
    followUps: ["resume", "projects"],
  },
];

/** Answer text for each pinned role, keyed by `Role.id`. */
const roleAnswerText: Record<string, string> = {
  windscribe:
    "I'm an AI engineer co-op at Windscribe in Toronto. I revamped Garry, their OpenClaw-based support chatbot, across 15+ intents and cut escalations by 90%. I rewrote an internal LLM support tool's pipeline to use 65% fewer tokens, built a Stripe dispute analyst with agentic workflows projected to save $32K a year, and built two automations that each cut manual work by 20%: Feedback Radar, which turns feedback from several sources into reports, and LLM-powered Stripe Radar triage, which scores flagged payments against fraud signals.",
  "uw-research":
    "I'm an undergraduate researcher in Prof. Jimmy Lin's Data Systems Group at Waterloo, working on information retrieval and LLM-based reranking for RAG. I reproduced BM25, dense (BGE) and learned sparse (SPLADE) retrieval on 8.8M MS MARCO passages, matching published results and contributing to Anserini. Then I built a two-stage BM25 + monoT5 pipeline with RankLLM that raised nDCG@10 on TREC DL19 from 0.51 to 0.70, a 37% gain.",
  "wat-ai":
    "I'm a data science engineer at WAT.ai, working on counterfactual off-ball movement in football: what if a player had made a different run? I built the Python ETL pipeline that turns 100K+ tracking records across 64 FIFA World Cup matches into one schema, engineered 7+ spatial features, and I'm designing run-value metrics (pitch control, controlled threat, defender displacement, passing lanes) and XGBoost models in Google Research Football.",
  savi:
    "At Savi Finance I built REST and GraphQL APIs in Go and MySQL for trip logging and expense tracking used by 1.5K+ people, and fixed recurring data-integrity issues with request validation at the API boundaries. The biggest win was redesigning the schemas and queries behind a core expense query, taking it from 2 seconds to 400 ms.",
};

/** Answer text for each recent project, keyed by `Project.slug`. */
const projectAnswerText: Record<string, string> = {
  merchantos:
    "MerchantOS is a multi-tenant AI commerce platform for Shopify merchants. Three LangGraph agents handle analytics, inventory and customer insights, and a merchant approves every recommendation before it runs on Shopify. It's deployed on AWS ECS and SQS with PostgreSQL, tenant isolation and audit logging, and it passes 240+ automated tests: 52/52 eval scenarios, 25/25 prompt-injection tests and zero tenant leaks.",
  quantpilot:
    "QuantPilot is an event-driven research platform for stocks that traces the second-order impacts of news and tech trends. Kafka and PySpark stream financial, news and research data in real time into a Neo4j knowledge graph of companies, technologies and partnerships, and LangGraph multi-agent workflows verify sources and keep the evidence in PostgreSQL. The backend is FastAPI.",
  "roadsafe-ai":
    "RoadSafe AI models 100K US crash records in a Dockerized dbt and PostgreSQL star schema (one fact table, four dimensions). The surprise: the national rain-versus-clear severity gap comes from which states the crashes happen in, not the weather (California +0.46 pp, Florida +9.45 pp). I benchmarked scikit-learn models against an 80.55% majority-class baseline and published the findings to Tableau.",
  wanderers:
    "Wanderers.space is a campus social app for verified Waterloo students, and I'm the founding engineer. It's built on Next.js with REST APIs, real-time pub/sub and live chat; K-means clustering personalizes activity recommendations and Gemini drafts new activities. It's grown to 46 monthly active users and is mentored by Velocity, Waterloo's startup incubator.",
};

/** Pinned roles in the sidebar ask "What did you do at [Company]?". */
const roleAnswers: CuratedAnswer[] = roles.map((role) => ({
  id: `role:${role.id}`,
  question: `What did you do at ${role.company}?`,
  answer:
    roleAnswerText[role.id] ??
    `[fill in: 1–2 sentences on ${role.company}, from content/roles.ts]`,
  attachments: [{ kind: "roles", ids: [role.id] }],
  followUps: ["experience", "projects"],
}));

/** Recent projects in the sidebar ask "Tell me about [Project]". */
const projectAnswers: CuratedAnswer[] = projects.map((project) => ({
  id: `project:${project.slug}`,
  question: `Tell me about ${project.title}`,
  answer:
    projectAnswerText[project.slug] ??
    `[fill in: 1–2 sentences on ${project.title}, from content/projects.ts]`,
  attachments: [{ kind: "projects", slugs: [project.slug] }],
  followUps: ["projects", "experience"],
}));

export const answers: CuratedAnswer[] = [...topics, ...roleAnswers, ...projectAnswers];
