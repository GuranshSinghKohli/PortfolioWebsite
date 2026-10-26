"use client";

import type { ReactNode } from "react";

import { useThread } from "@/lib/thread/store";

/**
 * Home or thread in the main area. Home stays mounted but hidden while the
 * thread shows, so its pre-paint greeting and the hero aren't rebuilt (and
 * the hidden canvas stops drawing). The thread view arrives with the
 * lazily loaded thread chunk.
 */
export function MainView({ children }: { children: ReactNode }) {
  const { view, runtime } = useThread();
  const ThreadView = view === "thread" ? runtime?.ThreadView : undefined;

  return (
    <>
      <div className={ThreadView ? "hidden" : "contents"}>{children}</div>
      {ThreadView && <ThreadView />}
    </>
  );
}
