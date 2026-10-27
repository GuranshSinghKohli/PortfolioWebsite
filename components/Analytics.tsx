"use client";

import { useEffect } from "react";

/** Starts analytics after first paint (lib/analytics.ts), without adding it to the first load. Renders nothing. */
export function Analytics() {
  useEffect(() => {
    // No key (e.g. before launch): load nothing, send nothing, log nothing.
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    void import("@/lib/analytics").then((mod) => mod.startAnalytics());
  }, []);
  return null;
}
