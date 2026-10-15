"use client";

import { ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const chips = [
  "What have you built with AI agents?",
  "Where have you worked?",
  "What do you do outside code?",
];

export function AskPanel() {
  return (
    <aside
      id="ask"
      className="flex w-full flex-[1_1_380px] flex-col gap-8 border-t border-line bg-panel p-8 min-[900px]:min-w-[340px] min-[900px]:border-t-0 min-[900px]:border-l"
    >
      <form
        className="flex items-end gap-3"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <label
            htmlFor="ask-input"
            className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase"
          >
            Ask me anything
          </label>
          <Input
            id="ask-input"
            name="question"
            placeholder="Ask a question"
            autoComplete="off"
            className="h-12 rounded-[12px] border-line bg-surface px-4 text-base text-body placeholder:text-muted"
          />
        </div>
        <Button
          type="submit"
          size="ask"
          className="shrink-0"
          aria-label="Submit question"
        >
          <ArrowUp />
        </Button>
      </form>

      <div className="flex flex-col gap-3">
        <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
          Try one
        </p>
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip}
              type="button"
              className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-left text-[13px] font-medium text-text"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      <p className="font-mono text-[12px] tracking-[0.08em] text-muted uppercase">
        <a className="hover:text-text" href="mailto:g4kohli@uwaterloo.ca">
          g4kohli@uwaterloo.ca
        </a>
      </p>

      <div className="rounded-[16px] border border-dashed border-line p-6">
        <p className="text-[20px] leading-snug font-medium text-text">
          Ask something, and watch where the answer comes from.
        </p>
      </div>
    </aside>
  );
}
