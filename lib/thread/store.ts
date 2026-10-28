"use client";

import { useSyncExternalStore } from "react";

import type { Mode } from "@/components/shell/mode";
import type { Attachment } from "@/content/types";

/**
 * App state (PRD figure 3): boot → home → thread. Boot is the intro in
 * lib/intro.ts; this store holds home vs thread and the turns. It is in the
 * first load, so it imports no thread code: the router, answer texts and
 * thread UI arrive in one chunk through `prefetchThread()`.
 */
export type Ask =
  | { kind: "answer"; id: string; from: "chip" | "sidebar" | "follow-up" }
  | { kind: "typed"; text: string };

export type Turn = {
  id: number;
  question: string;
  from: "chip" | "sidebar" | "follow-up" | "typed";
  reply: {
    text: string;
    /** The curated answer shown, if any. */
    answerId?: string;
    /** Cards under the answer, shown once its text has finished. */
    attachments: Attachment[];
    /** Follow-up chips, shown after the last turn only. */
    chips: string[];
  };
  /** Typed questions are answered by the AI (Phase 3); chips and sidebar items never are. */
  ai?: {
    status: "waiting" | "streaming" | "done" | "problem";
    /** The answer was blocked; `reply.text` holds the deflection. */
    blocked?: boolean;
    problem?: { kind: "rateLimited" | "budget" | "unavailable" | "network" | "server"; retryAfter?: number };
  };
};

type ThreadRuntime = typeof import("@/components/thread/runtime");

type State = {
  view: "home" | "thread";
  turns: Turn[];
  topic: string | null;
  runtime: ThreadRuntime | null;
  /** The thread chunk failed to load; MainView hands it to the error page. */
  failure: Error | null;
  /** Something has been asked this visit. Survives going home; hides the starter questions. */
  started: boolean;
};

const initial: State = { view: "home", turns: [], topic: null, runtime: null, failure: null, started: false };
let state = initial;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useThread() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

/**
 * One value from the thread, re-rendering only when it changes. For
 * components outside the thread (composer, main view) that would otherwise
 * re-render on every streamed batch. `select` must return a primitive or a
 * stable reference.
 */
export function useThreadValue<T>(select: (state: State) => T) {
  return useSyncExternalStore(
    subscribe,
    () => select(state),
    () => select(initial),
  );
}

let loading: Promise<ThreadRuntime> | undefined;

/** Loads the thread chunk once. Called on hover, focus or press of anything that asks. */
export function prefetchThread() {
  loading ??= import("@/components/thread/runtime").then(
    (runtime) => {
      set({ runtime });
      return runtime;
    },
    (error: unknown) => {
      loading = undefined;
      throw error;
    },
  );
  return loading;
}

/** Composer focus: load the thread chunk and fetch a session ticket in the background. */
export function warmAI() {
  prefetchThread()
    .then((runtime) => runtime.warmTicket())
    .catch(() => {});
}

/** Spread onto anything that asks, so the chunk is on its way before the click. */
export const prefetchOnIntent = {
  onPointerEnter: () => void prefetchThread().catch(() => {}),
  onPointerDown: () => void prefetchThread().catch(() => {}),
  onFocus: () => void prefetchThread().catch(() => {}),
};

let nextId = 1;

/**
 * Chips and sidebar items get their curated answer at once. Typed questions
 * go to the AI client in the thread chunk, which streams into the turn.
 */
export async function ask(input: Ask, mode: Mode) {
  const started = performance.now();
  if (!state.started) set({ started: true });
  let runtime: ThreadRuntime;
  try {
    runtime = await prefetchThread();
  } catch (error) {
    // Offline, or a new deploy replaced the chunk: show the error page rather than nothing.
    set({ failure: error instanceof Error ? error : new Error("Thread failed to load") });
    return;
  }
  if (input.kind === "typed") {
    runtime.askAI(input.text, mode);
    return;
  }
  const asked = state.turns.flatMap((turn) => (turn.reply.answerId ? [turn.reply.answerId] : []));
  const { turn, topic } = runtime.resolveTurn(input, { id: nextId++, topic: state.topic, asked, mode });
  set({ view: "thread", turns: [...state.turns, turn], topic });
  runtime.track("ask", { source: input.from === "sidebar" ? "rail" : input.from, topic: input.id, mode });
  runtime.track("answer_done", {
    path: "curated",
    latency_ms: Math.round(performance.now() - started),
    attachments: turn.reply.attachments.length,
  });
}

/** For the AI client in the thread chunk: read and update the thread. */
export const thread = {
  get: () => state,
  nextId: () => nextId++,
  update: (next: Partial<Pick<State, "view" | "turns" | "topic">>) => set(next),
  patchTurn: (id: number, patch: (turn: Turn) => Turn) =>
    set({ turns: state.turns.map((turn) => (turn.id === id ? patch(turn) : turn)) }),
};

/** Forgets a failed chunk load once the error page has it, so "Try again" starts clean. */
export function clearFailure() {
  set({ failure: null });
}

/** Back to the home screen with a fresh thread, cancelling any answer in flight. */
export function goHome() {
  state.runtime?.cancelAll();
  set({ view: "home", turns: [], topic: null });
}
