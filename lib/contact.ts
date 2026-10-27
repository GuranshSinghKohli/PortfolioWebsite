import { z } from "zod";

import { profile } from "@/content/profile";

/**
 * The contact form (PRD §12), shared by the sheet and POST /api/contact so
 * the inline errors and the server agree. `website` is the honeypot: people
 * never see it, so anything in it means a bot.
 */
export const MESSAGE_MAX = 2000;

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Add your name.").max(100, "Keep your name under 100 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Add your email, so I can reply.")
    .max(254, "That email is too long.")
    .pipe(z.email("That email doesn't look right.")),
  message: z
    .string()
    .trim()
    .min(10, "Say a little more: at least 10 characters.")
    .max(MESSAGE_MAX, `Keep it under ${MESSAGE_MAX.toLocaleString("en-US")} characters.`),
});

export const contactRequest = contactSchema.extend({ website: z.string().max(500).optional() });

export type ContactDraft = z.input<typeof contactSchema>;
export type ContactField = keyof ContactDraft;

/** The first error for each field, or nothing when the draft is valid. */
export function contactErrors(draft: ContactDraft): Partial<Record<ContactField, string>> {
  const result = contactSchema.safeParse(draft);
  if (result.success) return {};
  const { fieldErrors } = z.flattenError(result.error);
  return Object.fromEntries(Object.entries(fieldErrors).map(([field, messages]) => [field, messages?.[0]]));
}

/** The fallback: the visitor's mail app, with the draft already written. */
export function mailtoDraft({ name, email, message }: ContactDraft) {
  const subject = `Hello from ${name.trim() || "your portfolio"}`;
  const body = `${message.trim()}\n\n${name.trim()}${email.trim() ? ` (${email.trim()})` : ""}`;
  return `mailto:${profile.socials.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
