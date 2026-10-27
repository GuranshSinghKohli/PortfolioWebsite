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
      "I'm Guransh, a student at the University of Waterloo. Right now I'm an AI engineer co-op at Windscribe, building LLM tools for support and payments. On the side I'm on Wat.ai's Offball XI team doing spatial analytics on World Cup data, and I'm the founding engineer of Wanderers.space, a campus social app.",
    attachments: [{ kind: "roles", ids: roles.map((role) => role.id) }],
    followUps: ["projects", "experience", "contact"],
  },
  {
    id: "projects",
    question: "What have you built?",
    answer:
      "Three worth your time. QuantPilot is a multi-agent research platform for market events. RoadSafe AI digs into 100K US crash records to find what really predicts severe crashes. Wanderers.space is a campus social app for Waterloo students.",
    attachments: [{ kind: "projects", slugs: projects.map((project) => project.slug) }],
    followUps: ["experience", "resume", "contact"],
  },
  {
    id: "experience",
    question: "Where have you worked?",
    answer:
      "Newest first: AI Engineer co-op at Windscribe (May to December 2026), Data Science Engineer on Wat.ai's Offball XI team (September 2026 to now), and Software Developer at Savi Finance (November 2025 to May 2026).",
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
      "Here's my résumé. Short version: AI engineering at Windscribe, data engineering at Wat.ai, backend work at Savi Finance.",
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
    "I'm an AI engineer co-op at Windscribe in Toronto. I revamped Garry, their support chatbot, across 15+ intents and cut human escalations by 90%. I rewrote an internal LLM support tool's pipeline to use 65% fewer tokens, and built agentic Stripe tools: a dispute analyst projected to save $32K a year, and fraud triage for Stripe Radar that cut manual review by 20%.",
  "wat-ai":
    "I'm a data science engineer on Offball XI, a Waterloo design team doing spatial analytics on real football data. I'm building the Python pipeline that processes 100K+ tracking records from the 2022 World Cup across 64 matches, and engineering spatial features for counterfactual run-value models.",
  savi:
    "At Savi Finance I built Go and MySQL APIs for trip logging and expense tracking used by 1.5K+ people. The biggest win was taking a core expense query from 2 seconds to 400 ms.",
};

/** Answer text for each recent project, keyed by `Project.slug`. */
const projectAnswerText: Record<string, string> = {
  quantpilot:
    "QuantPilot is an event-driven research platform for stocks. It tracks market events, tech trends and their second-order effects. Kafka and PySpark pipelines feed a Neo4j knowledge graph of companies and partnerships, and multi-agent LangGraph workflows verify sources before anything reaches the analysis.",
  "roadsafe-ai":
    "RoadSafe AI looks at 100K US crash records to find what actually predicts severe crashes. The surprise: the rain-versus-clear gap is mostly about which states the crashes happen in, not the weather. Junction proximity was the one condition that held up after correcting for base rates.",
  wanderers:
    "Wanderers.space is a campus social app for Waterloo students, and I'm the founding engineer. It matches people to activities using Gemini, Google Maps and K-means clustering, has 46 monthly active verified students, and we pitched it at Velocity.",
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
