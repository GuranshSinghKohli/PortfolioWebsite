"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";
import { useId } from "react";

import { homeChips, starterQuestions } from "@/content/chips";
import { useMode } from "@/components/shell/mode";
import { useIntroStage } from "@/lib/intro";
import { ask, prefetchOnIntent, useThreadValue } from "@/lib/thread/store";

/** Same rise as the chips, continuing their 60 ms stagger after a short beat. */
const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 + index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * "Try asking": four starter questions under the chips. Quieter than the
 * chips (smaller, muted, a thin border) so they read as suggestions. Each one
 * goes to the AI like a typed question. Gone once anything has been asked
 * this visit. Phones scroll the row sideways instead of stacking it.
 */
export function StarterQuestions() {
  const { mode } = useMode();
  const stage = useIntroStage();
  const started = useThreadValue((thread) => thread.started);
  const label = useId();
  if (started) return null;
  const animate = stage === "idle" ? undefined : stage === "waiting" ? "hidden" : "shown";
  const offset = homeChips[mode].length;

  return (
    <div role="group" aria-labelledby={label} className="flex w-full min-w-0 flex-col items-center gap-2 pt-2">
      <m.p
        id={label}
        data-starter
        custom={offset}
        variants={rise}
        initial={false}
        animate={animate}
        className="font-mono text-[10px] tracking-[0.08em] text-dim uppercase"
      >
        Try asking
      </m.p>
      {/* Phones: one sideways-scrolling row, faded at the edge. Wider: wrap and centre. */}
      <ul className="-mx-4 flex w-[calc(100%+2rem)] snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,#000_85%,transparent)] [scrollbar-width:none] sm:mx-0 sm:w-full sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0 sm:[mask-image:none]">
        {starterQuestions.map((question, index) => (
          <m.li
            key={question}
            data-starter
            custom={offset + 1 + index}
            variants={rise}
            initial={false}
            animate={animate}
            className="shrink-0 snap-start"
          >
            <button
              type="button"
              onClick={() => void ask({ kind: "typed", text: question }, mode)}
              {...prefetchOnIntent}
              className="h-11 cursor-pointer rounded-full border border-line-soft px-3.5 text-[12.5px] whitespace-nowrap text-muted-foreground outline-none transition-colors hover:border-line hover:text-body focus-visible:ring-2 focus-visible:ring-ring"
            >
              {question}
            </button>
          </m.li>
        ))}
      </ul>
    </div>
  );
}
