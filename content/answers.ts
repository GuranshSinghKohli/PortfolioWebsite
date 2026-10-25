import { projects } from "./projects";
import { roles } from "./roles";
import type { CuratedAnswer } from "./types";

/**
 * Instant answers for chips and sidebar items (PRD section 8). These never
 * call the AI. Answer text is in the owner's voice, so it stays a placeholder
 * until written; attachments and follow-ups are wired now.
 */
const topics: CuratedAnswer[] = [
  {
    id: "about",
    question: "Who are you?",
    answer:
      "[fill in: 2–3 sentences: who you are, Waterloo Math (AMML + Statistics), what you build. Facts only from content/.]",
    attachments: [{ kind: "roles", ids: roles.map((role) => role.id) }],
    followUps: ["projects", "experience", "contact"],
  },
  {
    id: "projects",
    question: "What have you built?",
    answer: "[fill in: one line introducing the three projects]",
    attachments: [{ kind: "projects", slugs: projects.map((project) => project.slug) }],
    followUps: ["experience", "resume", "contact"],
  },
  {
    id: "experience",
    question: "Where have you worked?",
    answer: "[fill in: one or two lines introducing the roles]",
    attachments: [{ kind: "roles", ids: roles.map((role) => role.id) }],
    followUps: ["projects", "resume", "contact"],
  },
  {
    id: "listening",
    question: "What are you listening to?",
    answer: "[fill in: one line about your music taste]",
    attachments: [{ kind: "music" }],
    followUps: ["about", "projects"],
  },
  {
    id: "resume",
    question: "Can I see your résumé?",
    answer: "[fill in: one line handing over the résumé]",
    attachments: [{ kind: "resume" }],
    followUps: ["experience", "projects", "contact"],
  },
  {
    id: "contact",
    question: "How do I get in touch?",
    answer: "[fill in: one line inviting a message, plus what you're open to]",
    attachments: [{ kind: "contact" }],
    followUps: ["resume", "projects"],
  },
];

/** Pinned roles in the sidebar ask "What did you do at [Company]?". */
const roleAnswers: CuratedAnswer[] = roles.map((role) => ({
  id: `role:${role.id}`,
  question: `What did you do at ${role.company}?`,
  answer: `[fill in: 1–2 sentences on ${role.company}, from content/roles.ts]`,
  attachments: [{ kind: "roles", ids: [role.id] }],
  followUps: ["experience", "projects"],
}));

/** Recent projects in the sidebar ask "Tell me about [Project]". */
const projectAnswers: CuratedAnswer[] = projects.map((project) => ({
  id: `project:${project.slug}`,
  question: `Tell me about ${project.title}`,
  answer: `[fill in: 1–2 sentences on ${project.title}, from content/projects.ts]`,
  attachments: [{ kind: "projects", slugs: [project.slug] }],
  followUps: ["projects", "experience"],
}));

export const answers: CuratedAnswer[] = [...topics, ...roleAnswers, ...projectAnswers];

/** Chips under the composer on the home screen, by mode. */
export const homeChips = {
  about: ["projects", "resume", "listening", "contact"],
  work: ["projects", "experience", "resume", "contact"],
} as const satisfies Record<"about" | "work", string[]>;
