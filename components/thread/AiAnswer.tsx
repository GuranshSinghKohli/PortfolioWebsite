"use client";

import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

import { aiProblems } from "@/content/answers";
import { Attachments } from "@/components/attachments/Attachments";
import { useMode } from "@/components/shell/mode";
import { askAI } from "@/lib/thread/ai-client";
import type { Turn } from "@/lib/thread/store";
import { loadingVerbs } from "@/lib/thread/voice";
import { cn } from "@/lib/utils";

/** While waiting for the first token: the loading verbs from content/voice.md, one at a time. */
function LoadingVerbs({ reduced }: { reduced: boolean }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % loadingVerbs.length), 1400);
    return () => clearInterval(timer);
  }, []);

  return (
    <p className="flex items-center gap-2.5 text-[15px] text-muted-foreground">
      <span
        aria-hidden="true"
        className={cn("size-1.5 rounded-full bg-accent", !reduced && "animate-pulse")}
      />
      <span className="sr-only">Answering</span>
      <span aria-hidden="true" key={index} className={cn(!reduced && "verb-in")}>
        {loadingVerbs[index]}…
      </span>
    </p>
  );
}

/**
 * Reveals streamed text at a pace that keeps up with the stream (catching up
 * a sixth of the backlog each frame). Escape skips to the end, for this answer
 * and anything still arriving. Reduced motion shows what has arrived in
 * chunks, a few times a second.
 */
function useReveal(text: string, instant: boolean, reduced: boolean) {
  const [shown, setShown] = useState(0);
  const [skipped, setSkipped] = useState(false);
  const target = text.length;
  const caughtUp = skipped || instant || shown >= target;

  useEffect(() => {
    if (caughtUp) return;
    if (reduced) {
      const timer = setTimeout(() => setShown(target), 250);
      return () => clearTimeout(timer);
    }
    const frame = requestAnimationFrame(() =>
      setShown((value) => Math.min(target, value + Math.max(2, Math.ceil((target - value) / 6)))),
    );
    return () => cancelAnimationFrame(frame);
  }, [caughtUp, reduced, shown, target]);

  useEffect(() => {
    if (skipped || instant) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSkipped(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [instant, skipped]);

  return caughtUp ? text : text.slice(0, shown);
}

type ProblemInfo = NonNullable<NonNullable<Turn["ai"]>["problem"]>;

/** The friendly line for a problem, shown in the thread and announced to screen readers. */
export function problemMessage(problem: ProblemInfo) {
  const seconds = problem.retryAfter;
  if (problem.kind !== "rateLimited") return aiProblems[problem.kind];
  return seconds && seconds <= 90 ? aiProblems.rateLimited.replace("{seconds}", String(seconds)) : aiProblems.rateLimitedLong;
}

function Problem({ turn }: { turn: Turn }) {
  const { mode } = useMode();
  const problem = turn.ai!.problem!;
  const message = problemMessage(problem);
  const canRetry = problem.kind === "network" || problem.kind === "server";

  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-[15px] leading-[1.65] text-body">{message}</p>
      {canRetry && (
        <button
          type="button"
          onClick={() => askAI(turn.question, mode, turn.id)}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-4 text-[13px] text-body outline-none transition-colors hover:border-line-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4"
        >
          <RotateCcw strokeWidth={1.5} aria-hidden="true" />
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * An AI answer: loading verbs, then the streamed text with a lime caret, then
 * its cards once the text is fully shown. Problems show a friendly line.
 */
export function AiAnswer({ turn, reduced }: { turn: Turn; reduced: boolean }) {
  const ai = turn.ai!;
  const finished = ai.status === "done";
  const shown = useReveal(turn.reply.text, Boolean(ai.blocked), reduced);
  const revealed = finished && shown.length >= turn.reply.text.length;

  if (ai.status === "problem") return <Problem turn={turn} />;
  if (ai.status === "waiting") return <LoadingVerbs reduced={reduced} />;

  return (
    <>
      <p className="max-w-[65ch] text-[15px] leading-[1.65] whitespace-pre-line text-pretty text-body">
        <span className="sr-only">Guransh: </span>
        {shown}
        {!revealed && (
          <span
            aria-hidden="true"
            className={cn(
              "ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] rounded-full bg-accent",
              !reduced && "caret-blink",
            )}
          />
        )}
      </p>
      {revealed && !ai.blocked && turn.reply.attachments.length > 0 && (
        <div className="mt-2">
          <Attachments items={turn.reply.attachments} reduced={reduced} />
        </div>
      )}
    </>
  );
}
