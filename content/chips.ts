import { hasTracks } from "./music";

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
  certifications: "Certifications",
  contact: "Contact",
};

/** Chips under the composer on the home screen, by mode. Listening only once there's a playlist. */
export const homeChips: Record<"about" | "work", readonly string[]> = {
  about: hasTracks ? ["projects", "resume", "listening", "contact"] : ["projects", "resume", "experience", "contact"],
  work: ["projects", "experience", "resume", "contact"],
};

/** Topics hidden from chips, follow-ups and the sidebar. */
export const hiddenTopics: readonly string[] = hasTracks ? [] : ["listening"];

/** "Try asking" starters under the home chips. Each goes to the AI as a typed question. */
export const starterQuestions = [
  "What are you building right now?",
  "What's the hardest problem you've solved?",
  "How did you cut support escalations by 90%?",
  "What do you do when you're not coding?",
];
