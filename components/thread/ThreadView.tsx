"use client";

import * as m from "motion/react-m";
import { memo, useEffect, useRef, useState } from "react";

import { chipLabels } from "@/content/chips";
import { profile } from "@/content/profile";
import { Attachments } from "@/components/attachments/Attachments";
import { ChipButton } from "@/components/ChipButton";
import { Composer } from "@/components/home/Composer";
import { SheetHost } from "@/components/sheets/SheetHost";
import { useMode } from "@/components/shell/mode";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/media";
import { ask, useThread, type Turn } from "@/lib/thread/store";
import { AiAnswer, problemMessage } from "./AiAnswer";

/**
 * A curated answer's text: blank lines split paragraphs, and lines starting
 * with "• " become a list with the lime dots used on cards and sheets.
 */
function CuratedText({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  if (blocks.length === 1 && !text.includes("\n• ")) return text;

  return (
    <div className="flex flex-col gap-3">
      {blocks.map((block, i) => {
        const [lead, ...rest] = block.split("\n");
        const items = (lead.startsWith("• ") ? [lead, ...rest] : rest).filter((line) => line.startsWith("• "));
        return (
          <div key={i} className="flex flex-col gap-2">
            {!lead.startsWith("• ") && <p className={items.length ? "text-text" : undefined}>{lead}</p>}
            {items.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span aria-hidden="true" className="mt-[0.65em] size-1 shrink-0 rounded-full bg-accent" />
                    {item.slice(2)}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * One question and its answer (PRD figure 2). Motion from figure C: the
 * question bubble rises from the composer below on a 260 ms spring, then the
 * answer fades up over 240 ms. Attachments mount once the answer text has
 * finished (PRD §8), so text and cards never land at once. Reduced motion
 * shows everything still. Memoised: while one answer streams, the other
 * turns don't re-render.
 */
const TurnView = memo(function TurnView({ turn, reduced }: { turn: Turn; reduced: boolean }) {
  const [textDone, setTextDone] = useState(false);
  const showCards = (reduced || textDone) && turn.reply.attachments.length > 0;

  return (
    <article
      className="relative flex scroll-mt-6 flex-col gap-3"
      data-turn={turn.id}
      aria-busy={turn.ai?.status === "waiting" || turn.ai?.status === "streaming"}
    >
      {turn.from === "sidebar" && (
        <p className="self-end font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
          Asked from sidebar
        </p>
      )}
      {/* A heading, so screen readers can jump question to question; cards' titles sit under it. */}
      <m.h2
        initial={reduced ? false : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.26, bounce: 0.15 }}
        className="max-w-[85%] origin-bottom-right self-end rounded-[22px] border border-line bg-raised px-4 py-2.5 text-[15px] leading-[1.5] text-pretty text-text"
      >
        <span className="sr-only">You asked: </span>
        {turn.question}
      </m.h2>
      <m.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduced ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        onAnimationComplete={() => setTextDone(true)}
        className={cn(!turn.ai && "max-w-[65ch] text-[15px] leading-[1.65] text-pretty text-body")}
      >
        {turn.ai ? (
          <AiAnswer turn={turn} reduced={reduced} />
        ) : (
          <>
            <span className="sr-only">Guransh: </span>
            <CuratedText text={turn.reply.text} />
          </>
        )}
      </m.div>
      {!turn.ai && showCards && (
        <div className="mt-2">
          <Attachments items={turn.reply.attachments} reduced={reduced} />
        </div>
      )}
    </article>
  );
});

/**
 * What screen readers hear for the newest turn: "Answering" while the AI
 * works, then the question and the whole answer once it's finished (never a
 * half-streamed sentence), or the problem line.
 */
function announcement(turn: Turn | undefined) {
  if (!turn) return "";
  const ai = turn.ai;
  if (ai?.status === "waiting" || ai?.status === "streaming") return "Answering…";
  const answer = ai?.status === "problem" && ai.problem ? problemMessage(ai.problem) : turn.reply.text;
  return `You asked: ${turn.question}. ${profile.shortName}: ${answer}`;
}

/**
 * The thread (PRD §7): questions on the right, answers on the left, follow-up
 * chips after the last answer and a sticky "Ask a follow-up…" composer, in a
 * 720px column. New turns are announced through aria-live.
 */
export function ThreadView() {
  const { turns } = useThread();
  const { mode } = useMode();
  // Follows the setting live, unlike Motion's hook, which reads it once.
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const region = useRef<HTMLElement>(null);
  const last = turns.at(-1);

  // Bring each new turn into view. On entering the thread, move focus here
  // too, since the chip or button that asked is gone with the home screen.
  const entered = useRef(false);
  useEffect(() => {
    const node = region.current?.querySelector<HTMLElement>(`[data-turn="${last?.id}"]`);
    node?.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
    if (!entered.current) {
      entered.current = true;
      if (!region.current?.contains(document.activeElement)) region.current?.focus({ preventScroll: true });
    }
  }, [last?.id, reduced]);

  return (
    // relative: keeps the sr-only labels inside the scroller, not stretching the page.
    <div className="relative mx-auto flex min-h-full w-full max-w-[720px] flex-col px-4">
      {/* The home greeting (the page's h1) is hidden while the thread shows. */}
      <h1 className="sr-only">Conversation with {profile.shortName}</h1>
      {/*
        The live region is this text alone, not the conversation: a live region
        holding cards and buttons stays exposed behind an open sheet (Radix
        leaves live regions unhidden), and streaming text would be read in pieces.
      */}
      <p aria-live="polite" className="sr-only">
        {announcement(last)}
      </p>
      <section
        ref={region}
        tabIndex={-1}
        aria-label="Conversation"
        className="flex flex-col gap-10 pt-10 pb-6 outline-none shell:pt-20"
      >
        {turns.map((turn) => (
          <TurnView key={turn.id} turn={turn} reduced={reduced} />
        ))}
      </section>

      {last && last.reply.chips.length > 0 && (
        <m.div
          key={last.id}
          role="group"
          aria-label="Suggested follow-ups"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.24, delay: reduced ? 0 : 0.24 }}
          className="flex flex-wrap gap-2 pb-8"
        >
          {last.reply.chips.map((id) => (
            <ChipButton key={id} onClick={() => void ask({ kind: "answer", id, from: "follow-up" }, mode)}>
              {chipLabels[id] ?? id}
            </ChipButton>
          ))}
        </m.div>
      )}

      <div className="sticky bottom-0 z-20 -mx-4 mt-auto bg-bg/80 px-4 pt-3 pb-4 backdrop-blur-md before:pointer-events-none before:absolute before:inset-x-0 before:-top-6 before:h-6 before:bg-gradient-to-t before:from-bg/80 before:to-transparent">
        <Composer placeholder="Ask a follow-up…" />
      </div>
      <SheetHost />
    </div>
  );
}
