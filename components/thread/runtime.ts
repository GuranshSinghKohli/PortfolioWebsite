/**
 * The thread chunk: router, curated answer texts and thread UI. Loaded only
 * through `prefetchThread()` in lib/thread/store.ts, never in the first load.
 */
export { resolveTurn } from "@/lib/thread/resolve";
export { ThreadView } from "./ThreadView";
