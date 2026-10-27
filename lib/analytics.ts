/**
 * Analytics (PRD §15) through PostHog, kept out of the first load: events
 * queue here until posthog-js arrives, after first paint and an idle moment.
 * Nothing loads, and nothing is sent, when the visitor has Do Not Track or
 * Global Privacy Control on.
 *
 * Privacy: no question text, names, emails or messages ever go in an event,
 * only the small, fixed properties typed below. No cookies (memory
 * persistence), no autocapture, no session recording.
 */
export type AnalyticsEvent = {
  ask: { source: "typed" | "chip" | "rail" | "follow-up"; topic: string | null; mode: string };
  answer_done: { path: "curated" | "ai"; latency_ms: number; attachments: number };
  card_hover_play: { slug: string };
  sheet_open: { sheet: string };
  contact_sent: { result: "server" | "mailto" };
  resume_download: { from: "rail" | "card" | "header" };
  error: { source: "ask" | "contact" | "boundary" | "window"; kind: string };
};

export type Capture = <E extends keyof AnalyticsEvent>(event: E, properties: AnalyticsEvent[E]) => void;

let capture: Capture | undefined;
let queue: [keyof AnalyticsEvent, object][] = [];
let started = false;

/** True when the browser asks not to be tracked (Do Not Track or Global Privacy Control). */
export function optedOut() {
  if (typeof navigator === "undefined") return true;
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };
  const window_ = globalThis as typeof globalThis & { doNotTrack?: string };
  return (
    nav.globalPrivacyControl === true ||
    [nav.doNotTrack, window_.doNotTrack, nav.msDoNotTrack].some((value) => value === "1" || value === "yes")
  );
}

export function track<E extends keyof AnalyticsEvent>(event: E, properties: AnalyticsEvent[E]) {
  if (capture) return capture(event, properties);
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return; // Analytics off: nothing to queue for.
  if (queue.length < 50 && !optedOut()) queue.push([event, properties]);
}

/** Called by lib/analytics-load.ts once PostHog is ready: sends the queue and takes over. */
export function connect(send: Capture) {
  capture = send;
  for (const [event, properties] of queue) send(event as keyof AnalyticsEvent, properties as never);
  queue = [];
}

/** Loads PostHog (lib/analytics-load.ts, its own chunk) once the page has painted and the main thread is idle. */
export function startAnalytics() {
  if (started || !process.env.NEXT_PUBLIC_POSTHOG_KEY || optedOut()) return;
  started = true;
  const load = () => void import("./analytics-load").then((mod) => mod.load()).catch(() => {});
  const idle = () => ("requestIdleCallback" in window ? requestIdleCallback(load, { timeout: 4000 }) : setTimeout(load, 1500));
  if (document.readyState === "complete") idle();
  else addEventListener("load", idle, { once: true });
}
