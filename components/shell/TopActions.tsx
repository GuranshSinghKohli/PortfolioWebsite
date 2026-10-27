"use client";

import { profile } from "@/content/profile";
import { ask, prefetchOnIntent } from "@/lib/thread/store";
import { cn } from "@/lib/utils";
import { useMode } from "./mode";

const pill =
  "inline-flex h-11 cursor-pointer items-center rounded-full border border-line bg-bg/60 px-4 text-[13px] text-body outline-none backdrop-blur-md transition-colors hover:border-line-muted hover:text-text focus-visible:ring-2 focus-visible:ring-ring";

/** Analytics stays out of the first load, so it's imported on click. */
const trackResume = () => void import("@/lib/analytics").then((mod) => mod.track("resume_download", { from: "header" }));

/**
 * Top-right quick links: the résumé PDF (new tab) and "About", which asks the
 * curated About answer. Floating over the main area from 860px, and in the
 * phone header bar below that.
 */
export function TopActions({ className }: { className?: string }) {
  const { mode } = useMode();

  return (
    <nav aria-label="Quick links" className={cn("flex items-center gap-2", className)}>
      <a href={profile.resumePath} target="_blank" rel="noreferrer" onClick={trackResume} className={pill}>
        Résumé
      </a>
      <button
        type="button"
        onClick={() => void ask({ kind: "answer", id: "about", from: "chip" }, mode)}
        {...prefetchOnIntent}
        className={pill}
      >
        About
      </button>
    </nav>
  );
}
