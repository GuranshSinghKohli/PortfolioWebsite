"use client";

import type { ReactNode } from "react";

import { clearFailure, useThreadValue } from "@/lib/thread/store";

/**
 * Home or thread in the main area. Home stays mounted but hidden while the
 * thread shows, so its pre-paint greeting and the hero aren't rebuilt (and
 * the hidden canvas stops drawing). The thread view arrives with the
 * lazily loaded thread chunk.
 */
export function MainView({ children }: { children: ReactNode }) {
  const view = useThreadValue((thread) => thread.view);
  const runtime = useThreadValue((thread) => thread.runtime);
  const failure = useThreadValue((thread) => thread.failure);
  if (failure) {
    // Hand it to app/error.tsx, and forget it, so the page's "Try again" starts clean.
    queueMicrotask(clearFailure);
    throw failure;
  }
  const ThreadView = view === "thread" ? runtime?.ThreadView : undefined;

  return (
    <>
      <div className={ThreadView ? "hidden" : "contents"}>{children}</div>
      {ThreadView && <ThreadView />}
    </>
  );
}
