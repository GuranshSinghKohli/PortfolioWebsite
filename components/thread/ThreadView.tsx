"use client";

import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

import { chipLabels } from "@/content/chips";
import { ChipButton } from "@/components/ChipButton";
import { Composer } from "@/components/home/Composer";
import { useMode } from "@/components/shell/mode";
import { ask, useThread, type Turn } from "@/lib/thread/store";

/**
 * One question and its answer (PRD figure 2). Motion from figure C: the
 * question bubble rises from the composer below on a 260 ms spring, then the
 * answer fades up over 240 ms. Reduced motion shows both still.
 */
function TurnView({ turn, reduced }: { turn: Turn; reduced: boolean }) {
  return (
    <article className="relative flex scroll-mt-6 flex-col gap-3" data-turn={turn.id}>
      {turn.from === "sidebar" && (
        <p className="self-end font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
          Asked from sidebar
        </p>
      )}
      <m.p
        initial={reduced ? false : { opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.26, bounce: 0.15 }}
        className="max-w-[85%] origin-bottom-right self-end rounded-[22px] border border-line bg-raised px-4 py-2.5 text-[15px] leading-[1.5] text-pretty text-text"
      >
        <span className="sr-only">You asked: </span>
        {turn.question}
      </m.p>
      <m.div
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduced ? 0 : 0.12, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-[65ch] text-[15px] leading-[1.65] text-pretty text-body"
      >
        <span className="sr-only">Guransh: </span>
        {turn.reply.text}
      </m.div>
    </article>
  );
}

/**
 * The thread (PRD §7): questions on the right, answers on the left, follow-up
 * chips after the last answer and a sticky "Ask a follow-up…" composer, in a
 * 720px column. New turns are announced through aria-live.
 */
export function ThreadView() {
  const { turns } = useThread();
  const { mode } = useMode();
  const reduced = useReducedMotion() ?? false;
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
      <section
        ref={region}
        tabIndex={-1}
        aria-live="polite"
        aria-label="Conversation"
        className="flex flex-col gap-10 pt-10 pb-6 outline-none"
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

      <div className="sticky bottom-0 -mx-4 mt-auto bg-bg/80 px-4 pt-3 pb-4 backdrop-blur-md">
        <Composer placeholder="Ask a follow-up…" />
      </div>
    </div>
  );
}
