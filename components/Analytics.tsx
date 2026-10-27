"use client";

import { useEffect } from "react";

/** Starts analytics after first paint (lib/analytics.ts), without adding it to the first load. Renders nothing. */
export function Analytics() {
  useEffect(() => {
    void import("@/lib/analytics").then((mod) => mod.startAnalytics());
  }, []);
  return null;
}
