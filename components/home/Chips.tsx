"use client";

import type { Variants } from "motion/react";
import * as m from "motion/react-m";

import { homeChips } from "@/content/answers";
import { useMode } from "@/components/shell/mode";
import { useIntroStage } from "@/lib/intro";

const chipLabels: Record<string, string> = {
  projects: "Projects",
  experience: "Experience",
  resume: "Résumé",
  listening: "Listening",
  contact: "Contact",
};

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
 * Suggestion chips under the composer. They switch with the About / Work mode.
 * While the intro runs, CSS keeps them hidden until their turn.
 */
export function Chips() {
  const { mode } = useMode();
  const stage = useIntroStage();
  const animate = stage === "idle" ? undefined : stage === "waiting" ? "hidden" : "shown";

  return (
    <ul aria-label="Suggested questions" className="flex flex-wrap justify-center gap-2">
      {homeChips[mode].map((id, index) => (
        <m.li key={id} data-chip custom={index} variants={rise} initial={false} animate={animate}>
          <m.button
            type="button"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.15 }}
            className="h-11 rounded-full border border-line px-4 text-[13px] text-body outline-none transition-colors hover:border-line-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            {chipLabels[id]}
          </m.button>
        </m.li>
      ))}
    </ul>
  );
}
