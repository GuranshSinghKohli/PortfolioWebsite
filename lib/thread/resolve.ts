import { answers } from "@/content/answers";
import { homeChips } from "@/content/chips";
import type { Attachment, CuratedAnswer } from "@/content/types";
import { matchedAttachments as matchedCards } from "@/lib/matcher";
import { pickFollowUps, route, type TopicId } from "@/lib/router";
import type { Ask, Turn } from "./store";

/** Typed questions until the AI path lands in Phase 3. */
export const NO_AI_YET = "The live AI arrives soon. Try one of these:";

export type ThreadContext = {
  id: number;
  topic: TopicId | null;
  /** Curated answers already shown in this thread, oldest first. */
  asked: TopicId[];
  mode: keyof typeof homeChips;
};

const isCards = (attachment: Attachment) => attachment.kind === "projects" || attachment.kind === "roles";

/**
 * A typed question's attachments. When the curated answer carries cards, the
 * matcher scores the question and the answer and its result replaces them (if
 * it finds any). When it carries none (résumé, contact, listening), only cards
 * the question itself names are added, so an answer that mentions every role
 * doesn't pull in the timeline. Music, contact and résumé always come along.
 */
function typedAttachments(question: string, answer: CuratedAnswer): Attachment[] {
  const curated = answer.attachments.filter(isCards);
  const cards = curated.length ? matchedCards(question, answer.answer) : matchedCards(question);
  return [...(cards.length || !curated.length ? cards : curated), ...answer.attachments.filter((a) => !isCards(a))];
}

/**
 * Turns an ask into a thread turn. Chips and sidebar items name their curated
 * answer and get its listed attachments. Typed text goes through the router:
 * a new topic gets its curated answer with matched cards; an inherited or
 * repeated one gets the no-AI line, chips, and any cards the question names.
 */
export function resolveTurn(ask: Ask, context: ThreadContext): { turn: Turn; topic: TopicId | null } {
  const fallback = homeChips[context.mode];

  if (ask.kind === "answer") {
    const answer = answers.find((entry) => entry.id === ask.id);
    if (answer) {
      return {
        topic: answer.id,
        turn: {
          id: context.id,
          question: answer.question,
          from: ask.from,
          reply: {
            text: answer.answer,
            answerId: answer.id,
            attachments: answer.attachments,
            chips: pickFollowUps(answer.id, [...context.asked, answer.id], fallback),
          },
        },
      };
    }
  }

  const question = ask.kind === "typed" ? ask.text : ask.id;
  const { topic, reason } = route(question, context.topic);
  const answer = reason === "inherit" ? undefined : answers.find((entry) => entry.id === topic);
  const repeat = answer && answer.id === context.asked.at(-1);

  return {
    topic,
    turn: {
      id: context.id,
      question,
      from: "typed",
      reply:
        answer && !repeat
          ? {
              text: answer.answer,
              answerId: answer.id,
              attachments: typedAttachments(question, answer),
              chips: pickFollowUps(answer.id, [...context.asked, answer.id], fallback),
            }
          : {
              text: NO_AI_YET,
              attachments: matchedCards(question),
              chips: pickFollowUps(topic, context.asked, fallback),
            },
    },
  };
}
