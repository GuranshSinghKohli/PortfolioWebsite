"use client";

import { homeChips } from "@/content/answers";
import { useMode } from "@/components/shell/mode";

const chipLabels: Record<string, string> = {
  projects: "Projects",
  experience: "Experience",
  resume: "Résumé",
  listening: "Listening",
  contact: "Contact",
};

/** Suggestion chips under the composer. They switch with the About / Work mode. */
export function Chips() {
  const { mode } = useMode();

  return (
    <ul aria-label="Suggested questions" className="flex flex-wrap justify-center gap-2">
      {homeChips[mode].map((id) => (
        <li key={id}>
          <button
            type="button"
            className="h-11 rounded-full border border-line px-4 text-[13px] text-body outline-none transition-colors hover:border-line-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            {chipLabels[id]}
          </button>
        </li>
      ))}
    </ul>
  );
}
