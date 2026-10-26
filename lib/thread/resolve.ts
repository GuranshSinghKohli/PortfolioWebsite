import { answers } from "@/content/answers";
import { homeChips } from "@/content/chips";
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

/**
 * Turns an ask into a thread turn. Chips and sidebar items name their curated
 * answer. Typed text goes through the router: a new topic gets its curated
 * answer; an inherited or repeated one gets the no-AI line and chips.
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
              chips: pickFollowUps(answer.id, [...context.asked, answer.id], fallback),
            }
          : { text: NO_AI_YET, chips: pickFollowUps(topic, context.asked, fallback) },
    },
  };
}
