"use client";

import { ArrowUp, MapPin } from "lucide-react";

import { profile } from "@/content/profile";
import { ModeToggle } from "@/components/shell/mode";
import { isFilled } from "@/lib/content";

/** PRD §11 caps a typed question at 300 characters. */
const MAX_QUESTION = 300;

/** The ask box. Submitting does nothing until Phase 2 wires the thread. */
export function Composer() {
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="w-full rounded-2xl border border-line bg-surface transition-colors focus-within:border-line-muted"
    >
      <label htmlFor="composer-input" className="sr-only">
        Ask a question
      </label>
      <textarea
        id="composer-input"
        name="question"
        rows={2}
        maxLength={MAX_QUESTION}
        placeholder="Ask me about anything I've built…"
        className="block w-full resize-none bg-transparent px-4 pt-3.5 text-[15px] leading-[1.5] text-body outline-none placeholder:text-muted-foreground"
      />
      <div className="flex items-center gap-2 px-2 pb-1.5">
        <ModeToggle size="sm" />
        {isFilled(profile.location) && (
          <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
            <MapPin className="size-3" strokeWidth={1.5} aria-hidden="true" />
            {profile.location}
          </span>
        )}
        <button
          type="submit"
          aria-label="Send question"
          className="ml-auto flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <ArrowUp className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
