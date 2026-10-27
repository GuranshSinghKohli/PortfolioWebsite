"use client";

import { useEffect } from "react";

import { StatusPage, statusAction } from "@/components/StatusPage";

/** The page crashed while rendering (Next 16 passes `retry`, not `reset`). */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    // Imported here, not at the top, to keep analytics out of every page's first load.
    void import("@/lib/analytics").then((mod) => mod.track("error", { source: "boundary", kind: error.name || "Error" }));
  }, [error]);

  return (
    <StatusPage
      label="Error"
      title="That broke on my side."
      actions={
        <>
          <button type="button" onClick={() => retry()} className={statusAction(true)}>
            Try again
          </button>
          {/* A full load, in case the broken state lives in memory. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className={statusAction()}>
            Start over
          </a>
        </>
      }
    >
      <p>Something on this page crashed. Try again, or start over and ask from the top.</p>
    </StatusPage>
  );
}
