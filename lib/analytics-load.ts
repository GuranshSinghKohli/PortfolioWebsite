import posthog from "posthog-js";

import { connect, track } from "./analytics";

/**
 * PostHog itself, loaded lazily by `startAnalytics()` in lib/analytics.ts.
 * No cookies (memory persistence), anonymous events only, no autocapture,
 * no session recording or surveys, and Do Not Track respected.
 */
export function load() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    defaults: "2026-08-30",
    persistence: "memory",
    person_profiles: "never",
    autocapture: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    respect_dnt: true,
    mask_personal_data_properties: true,
  });
  connect((event, properties) => void posthog.capture(event, properties));

  // Uncaught errors: only their type, never the message (it could hold anything).
  addEventListener("error", (event) => track("error", { source: "window", kind: event.error?.name ?? "Error" }));
  addEventListener("unhandledrejection", (event) =>
    track("error", { source: "window", kind: (event.reason as Error | undefined)?.name ?? "rejection" }),
  );
}
