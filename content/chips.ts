/**
 * Chip labels and the home chips. Kept apart from answers.ts so the home page
 * can show chips without loading every answer text (thread code is lazy).
 */

/** Short chip labels for the topic answers in answers.ts. */
export const chipLabels: Record<string, string> = {
  about: "About",
  projects: "Projects",
  experience: "Experience",
  listening: "Listening",
  resume: "Résumé",
  contact: "Contact",
};

/** Chips under the composer on the home screen, by mode. */
export const homeChips = {
  about: ["projects", "resume", "listening", "contact"],
  work: ["projects", "experience", "resume", "contact"],
} as const satisfies Record<"about" | "work", string[]>;
