"use client";

import { ArrowUp, MapPin } from "lucide-react";
import * as m from "motion/react-m";
import { useId, useState, type FormEvent, type KeyboardEvent } from "react";

import { profile } from "@/content/profile";
import { ModeToggle, useMode } from "@/components/shell/mode";
import { isFilled } from "@/lib/content";
import { useMediaQuery } from "@/lib/media";
import { ask, prefetchOnIntent, useThreadValue, warmAI } from "@/lib/thread/store";
import { cn } from "@/lib/utils";

/** PRD §11 caps a typed question at 300 characters. */
const MAX_QUESTION = 300;

/**
 * Focus beam (PRD figure B, effect 3): a lime highlight travels the border in
 * a 2.4 s loop while the input has focus. Reduced motion gets a still border.
 */
function FocusBeam() {
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  if (reduced) {
    return <span aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-2xl border border-accent/60" />;
  }
  return (
    <m.span
      aria-hidden="true"
      className="beam-ring pointer-events-none absolute -inset-px rounded-2xl"
      initial={{ opacity: 0, "--beam": 0 }}
      animate={{ opacity: 1, "--beam": 360 }}
      transition={{ opacity: { duration: 0.2 }, "--beam": { duration: 2.4, ease: "linear", repeat: Infinity } }}
    />
  );
}

/**
 * The ask box, on the home screen and as the thread's sticky follow-up
 * composer. Enter sends, Shift+Enter adds a line. Focus loads the thread
 * chunk and a session ticket in the background; the send button pulses
 * while an AI answer waits for its first token.
 */
export function Composer({
  placeholder = "Ask me about anything I've built…",
  className,
}: {
  placeholder?: string;
  className?: string;
}) {
  const id = useId();
  const { mode } = useMode();
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState("");
  const waiting = useThreadValue((thread) => thread.turns.at(-1)?.ai?.status === "waiting");

  function send(event?: FormEvent) {
    event?.preventDefault();
    const question = text.trim();
    if (!question) return;
    setText("");
    void ask({ kind: "typed", text: question }, mode);
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) send(event);
  }

  return (
    <form
      onSubmit={send}
      className={cn(
        "relative w-full rounded-2xl border border-line bg-surface transition-colors focus-within:border-line-muted",
        className,
      )}
    >
      {focused && <FocusBeam />}
      <label htmlFor={id} className="sr-only">
        Ask a question
      </label>
      <textarea
        id={id}
        name="question"
        rows={2}
        maxLength={MAX_QUESTION}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setFocused(true);
          warmAI();
        }}
        onBlur={() => setFocused(false)}
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
          {...prefetchOnIntent}
          className={cn(
            "ml-auto flex size-11 items-center justify-center rounded-full bg-accent text-accent-foreground outline-none transition-[filter] hover:brightness-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-surface",
            waiting && "send-pulse",
          )}
        >
          <ArrowUp className="size-4" strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    </form>
  );
}
