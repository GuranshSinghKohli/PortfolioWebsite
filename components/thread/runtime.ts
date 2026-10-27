/**
 * The thread chunk: router, curated answer texts, the AI client and the
 * thread UI. Loaded only through `prefetchThread()` in lib/thread/store.ts,
 * never in the first load.
 */
export { askAI, cancelAll, warmTicket } from "@/lib/thread/ai-client";
export { resolveTurn } from "@/lib/thread/resolve";
export { ThreadView } from "./ThreadView";
