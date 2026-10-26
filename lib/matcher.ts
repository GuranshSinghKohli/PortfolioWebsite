import { projects } from "@/content/projects";
import { roles } from "@/content/roles";
import type { Attachment } from "@/content/types";
import { isFilled } from "@/lib/content";
import { normalize } from "@/lib/router";

/**
 * Entity matcher (PRD §8): which project cards and roles to attach to an
 * answer. Each card is indexed from its own title and copy.
 *
 * - Title words (project title, company name) always match.
 * - Body words match only when no sibling card uses them, so shared words
 *   like "pipeline" or "100k" never decide anything.
 * - The question and the answer are scored together.
 * - A card needs a title hit or two distinctive words, and must score within
 *   CONFIDENCE of the best card, so one strong match doesn't drag weak ones in.
 */
export type Entity = { kind: "project" | "role"; id: string };
export type Scored = Entity & { score: number; title: boolean; words: string[] };

/** Share of the best score a card needs to attach. */
export const CONFIDENCE = 0.5;
const TITLE_WEIGHT = 3;

const STOPWORDS = new Set(
  "the and for with from that this into what which who how did does was were are you your have has had about tell more show give some any all his her their them they our its it's can could would should will just also than then there here when where why one two get got using used use via per out over under after before across while".split(
    " ",
  ),
);

/** Crude singular form, applied to both sides: "crashes" and "crash" meet. */
function stem(word: string) {
  if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
  if (word.length > 4 && word.endsWith("es") && /(sh|ch|x|ss)es$/.test(word)) return word.slice(0, -2);
  if (word.length > 3 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function tokens(text: string) {
  return normalize(text)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length >= 3 && !STOPWORDS.has(word))
    .map(stem);
}

type Doc = Entity & { title: Set<string>; body: Set<string> };

const docs: Doc[] = [
  ...projects.map((project) => ({
    kind: "project" as const,
    id: project.slug,
    title: new Set(tokens(project.title)),
    body: new Set(
      tokens([project.blurb, ...project.highlights, ...project.stack, project.writeUp].filter(isFilled).join(" ")),
    ),
  })),
  ...roles.map((role) => ({
    kind: "role" as const,
    id: role.id,
    title: new Set(tokens(role.company)),
    body: new Set(tokens([role.team ?? "", role.headline, ...role.impact, ...role.stack].join(" "))),
  })),
];

/** Body words that only one card uses. */
const distinctive = new Map(
  docs.map((doc) => [
    doc,
    new Set([...doc.body].filter((word) => !docs.some((other) => other !== doc && other.body.has(word)))),
  ]),
);

export function score(question: string, answer = ""): Scored[] {
  const words = new Set(tokens(`${question} ${answer}`));
  return docs
    .map((doc) => {
      const title = [...doc.title].some((word) => words.has(word));
      const hits = [...distinctive.get(doc)!].filter((word) => words.has(word));
      return { kind: doc.kind, id: doc.id, title, words: hits, score: (title ? TITLE_WEIGHT : 0) + hits.length };
    })
    .filter((entry) => entry.title || entry.words.length >= 2)
    .sort((a, b) => b.score - a.score);
}

/** The cards to attach, best first, after the confidence floor. */
export function match(question: string, answer = ""): Entity[] {
  const scored = score(question, answer);
  const best = scored[0]?.score ?? 0;
  return scored.filter((entry) => entry.score >= best * CONFIDENCE).map(({ kind, id }) => ({ kind, id }));
}

/** Matched cards as thread attachments, projects first. */
export function matchedAttachments(question: string, answer = ""): Attachment[] {
  const found = match(question, answer);
  const slugs = found.filter((entity) => entity.kind === "project").map((entity) => entity.id);
  const ids = found.filter((entity) => entity.kind === "role").map((entity) => entity.id);
  return [
    ...(slugs.length ? [{ kind: "projects" as const, slugs }] : []),
    ...(ids.length ? [{ kind: "roles" as const, ids }] : []),
  ];
}
