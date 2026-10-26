"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";

import { chipLabels, homeChips } from "@/content/chips";
import { ChipButton } from "@/components/ChipButton";
import { useMode } from "@/components/shell/mode";
import { useIntroStage } from "@/lib/intro";
import { ask } from "@/lib/thread/store";

/** PRD figure B, effect 4: rise in after the greeting with a 60 ms stagger. */
const rise: Variants = {
  hidden: { opacity: 0, y: 8 },
  shown: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.06, duration: 0.32, ease: [0.22, 1, 0.36, 1] },
  }),
};

/**
 * Suggestion chips under the composer. They switch with the About / Work mode
 * and open the thread with their curated answer. While the intro runs, CSS
 * keeps them hidden until their turn.
 */
export function Chips() {
  const { mode } = useMode();
  const stage = useIntroStage();
  const animate = stage === "idle" ? undefined : stage === "waiting" ? "hidden" : "shown";

  return (
    <ul aria-label="Suggested questions" className="flex flex-wrap justify-center gap-2">
      {homeChips[mode].map((id, index) => (
        <m.li key={id} data-chip custom={index} variants={rise} initial={false} animate={animate}>
          <ChipButton onClick={() => void ask({ kind: "answer", id, from: "chip" }, mode)}>
            {chipLabels[id]}
          </ChipButton>
        </m.li>
      ))}
    </ul>
  );
}
