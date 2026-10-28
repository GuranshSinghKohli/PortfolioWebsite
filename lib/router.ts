import { answers } from "@/content/answers";
import { hiddenTopics } from "@/content/chips";
import { projects } from "@/content/projects";
import { roles } from "@/content/roles";
import type { Signals } from "@/content/types";

/**
 * Topic router (PRD §8). A topic is the id of a curated answer in
 * content/answers.ts: a topic like "projects", or an entity like
 * "role:windscribe" or "project:quantpilot".
 *
 * - Strong signals (company and project names, "résumé") switch topic on their own.
 * - Weak signals ("work", "built", "music") switch only if the current topic
 *   says nothing about them, judged by its answer text and its own signals,
 *   and the question doesn't point back at it ("how does that work").
 * - Anything else inherits the current topic.
 */
export type TopicId = string;

export type Route = {
  topic: TopicId | null;
  reason: "strong" | "weak" | "inherit";
};

/** Words for the topic answers. Entity words come from content/roles.ts and content/projects.ts. */
const topicSignals: Record<string, Signals> = {
  about: { strong: [], weak: ["who are you", "about you", "yourself", "background", "student", "studying"] },
  projects: { strong: [], weak: ["built", "build", "building", "project", "projects", "made", "side project"] },
  experience: {
    strong: [],
    weak: ["work", "worked", "working", "job", "jobs", "experience", "internship", "co-op", "coop", "where"],
  },
  listening: { strong: ["Spotify"], weak: ["music", "listen", "listening", "song", "songs", "playlist"] },
  resume: { strong: ["résumé", "resume", "CV"], weak: [] },
  certifications: {
    strong: ["certification", "certifications", "certificate", "certificates", "certified", "AWS cert", "AWS certs"],
    weak: [],
  },
  contact: { strong: [], weak: ["contact", "email", "reach", "hire", "hiring", "get in touch", "linkedin"] },
};

const signals: [TopicId, Signals][] = [
  ...Object.entries(topicSignals),
  ...roles.map((role): [TopicId, Signals] => [`role:${role.id}`, role.signals]),
  ...projects.map((project): [TopicId, Signals] => [`project:${project.slug}`, project.signals]),
];

/** Lower case, accents removed, so "Résumé" matches "resume". */
export function normalize(text: string) {
  return text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Words that point back at the current topic, so a follow-up stays on it. */
const POINTS_BACK = /(?<![\p{L}])(that|this|it|its|there|they|them|those|these)(?![\p{L}])/u;

const WORD_CHAR = /[\p{L}\p{N}]/u;

/**
 * Where `term` first appears in `text` as a whole word or phrase, or -1. Both
 * normalized. A plain substring search plus a letter-or-digit check on either
 * side: building a Unicode RegExp per term instead cost about 50 ms on every
 * typed question (200 ms at 4x CPU), enough to blow the INP budget.
 */
function find(text: string, term: string) {
  for (let at = text.indexOf(term); at >= 0; at = text.indexOf(term, at + 1)) {
    const before = text[at - 1];
    const after = text[at + term.length];
    if ((!before || !WORD_CHAR.test(before)) && (!after || !WORD_CHAR.test(after))) return at;
  }
  return -1;
}

/** What each topic "says": its answer text and its own signal words. */
const said = new Map(
  signals.map(([topic, { strong, weak }]) => {
    const answer = answers.find((entry) => entry.id === topic)?.answer ?? "";
    return [topic, normalize([answer, ...strong, ...weak].join(" "))];
  }),
);

/** Topics hit by one kind of signal, earliest mention first. */
function hits(text: string, kind: keyof Signals) {
  const found: { topic: TopicId; at: number; terms: string[] }[] = [];
  for (const [topic, words] of signals) {
    const positions = words[kind].map((word) => {
      const term = normalize(word);
      return { term, at: find(text, term) };
    });
    const matched = positions.filter((entry) => entry.at >= 0);
    if (matched.length) {
      found.push({ topic, at: Math.min(...matched.map((entry) => entry.at)), terms: matched.map((entry) => entry.term) });
    }
  }
  return found.sort((a, b) => a.at - b.at);
}

export function route(question: string, current: TopicId | null): Route {
  const text = normalize(question);

  const strong = hits(text, "strong");
  if (strong.length) {
    // Naming the current topic again keeps it, even next to another name.
    const topic = strong.find((hit) => hit.topic === current)?.topic ?? strong[0].topic;
    return { topic, reason: "strong" };
  }

  if (current && POINTS_BACK.test(text)) return { topic: current, reason: "inherit" };

  const currentSays = said.get(current ?? "") ?? "";
  const weak = hits(text, "weak").filter(
    (hit) => hit.topic !== current && hit.terms.some((term) => find(currentSays, term) < 0),
  );
  if (weak.length) return { topic: weak[0].topic, reason: "weak" };

  return { topic: current, reason: "inherit" };
}

/**
 * Follow-up chips after an answer: the topic's own follow-ups, then `fallback`
 * (the home chips), skipping what was already asked. Never empty.
 */
export function pickFollowUps(topic: TopicId | null, asked: TopicId[], fallback: readonly TopicId[], count = 3) {
  const own = answers.find((entry) => entry.id === topic)?.followUps ?? [];
  const candidates = [...new Set([...own, ...fallback])].filter((id) => id !== topic && !hiddenTopics.includes(id));
  const fresh = candidates.filter((id) => !asked.includes(id));
  return (fresh.length ? fresh : candidates).slice(0, count);
}
