import { homeChips } from "@/content/chips";
import type { Attachment } from "@/content/types";
import type { Mode } from "@/components/shell/mode";
import { pickFollowUps, route } from "@/lib/router";
import { thread, type Turn } from "./store";

/**
 * The browser side of POST /api/ask (PRD §11). Thread chunk only: nothing
 * here is in the first load.
 */

// ---------------------------------------------------------------------------
// Session tickets: fetched on composer focus, refreshed a minute before they
// expire while the tab is visible, and refetched once on a rejected ticket.

const REFRESH_EARLY_MS = 60_000;

class SessionError extends Error {
  constructor(readonly status: number) {
    super(`session ${status}`);
  }
}

let current: { ticket: string; expires: number } | undefined;
let pending: Promise<string> | undefined;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

function scheduleRefresh() {
  clearTimeout(refreshTimer);
  if (!current) return;
  refreshTimer = setTimeout(
    () => {
      if (document.visibilityState === "visible") void getTicket(true).catch(() => {});
      else current = undefined; // Fetched fresh when the visitor comes back and asks.
    },
    Math.max(1000, current.expires - Date.now() - REFRESH_EARLY_MS),
  );
}

function getTicket(force = false): Promise<string> {
  if (!force && current && current.expires - Date.now() > REFRESH_EARLY_MS) return Promise.resolve(current.ticket);
  pending ??= fetch("/api/session", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new SessionError(response.status);
      current = (await response.json()) as { ticket: string; expires: number };
      scheduleRefresh();
      return current.ticket;
    })
    .finally(() => {
      pending = undefined;
    });
  return pending;
}

export function warmTicket() {
  void getTicket().catch(() => {});
}

// ---------------------------------------------------------------------------
// Asking

type Problem = NonNullable<NonNullable<Turn["ai"]>["problem"]>;
type StreamEvent =
  | { type: "text"; text: string }
  | { type: "blocked"; text: string }
  | { type: "attachments"; items: Attachment[] }
  | { type: "done"; topic: string | null }
  | { type: "error"; error: string };

const controllers = new Map<number, AbortController>();

export function cancelAll() {
  for (const controller of controllers.values()) controller.abort();
  controllers.clear();
}

/** The last 8 messages as the server expects them: questions and the answers actually shown. */
function historyBefore(id: number) {
  return thread
    .get()
    .turns.filter((turn) => turn.id < id && turn.ai?.status !== "problem" && turn.reply.text)
    .flatMap((turn) => [
      { role: "visitor" as const, text: turn.question },
      { role: "site" as const, text: turn.reply.text },
    ])
    .slice(-8);
}

function askedAnswers() {
  return thread.get().turns.flatMap((turn) => (turn.reply.answerId ? [turn.reply.answerId] : []));
}

/** Problems end with the router's best chips for the question, since chips always work. */
function fail(id: number, question: string, problem: Problem, mode: Mode) {
  const topic = route(question, thread.get().topic).topic;
  thread.patchTurn(id, (turn) => ({
    ...turn,
    ai: { status: "problem", problem },
    reply: { ...turn.reply, chips: pickFollowUps(topic, askedAnswers(), homeChips[mode]) },
  }));
}

async function problemFrom(response: Response): Promise<Problem> {
  if (response.status === 429) {
    const body = (await response.json().catch(() => ({}))) as { error?: string };
    if (body.error === "budget") return { kind: "budget" };
    return { kind: "rateLimited", retryAfter: Number(response.headers.get("Retry-After")) || undefined };
  }
  if (response.status === 503) return { kind: "unavailable" };
  return { kind: "server" };
}

function post(question: string, id: number, ticket: string, signal: AbortSignal) {
  return fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-ask-ticket": ticket },
    body: JSON.stringify({ question, history: historyBefore(id), topic: thread.get().topic }),
    signal,
  });
}

/**
 * Text is batched to one store update per animation frame, so a fast stream
 * doesn't re-render the thread on every token.
 */
function textBuffer(id: number) {
  let buffered = "";
  let frame = 0;
  const flush = () => {
    frame = 0;
    if (!buffered) return;
    const text = buffered;
    buffered = "";
    thread.patchTurn(id, (turn) => ({
      ...turn,
      ai: { status: "streaming" },
      reply: { ...turn.reply, text: turn.reply.text + text },
    }));
  };
  return {
    add(text: string) {
      buffered += text;
      frame ||= requestAnimationFrame(flush);
    },
    flush() {
      cancelAnimationFrame(frame);
      flush();
    },
  };
}

async function run(id: number, question: string, mode: Mode) {
  const controller = new AbortController();
  controllers.set(id, controller);
  const buffer = textBuffer(id);
  try {
    let response = await post(question, id, await getTicket(), controller.signal);
    if (response.status === 401) response = await post(question, id, await getTicket(true), controller.signal);
    if (!response.ok || !response.body) return fail(id, question, await problemFrom(response), mode);

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let partial = "";
    let finished = false;
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      partial += value;
      const lines = partial.split("\n");
      partial = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line) as StreamEvent;
        if (event.type === "text") buffer.add(event.text);
        else {
          buffer.flush();
          if (event.type === "blocked") {
            // Replaces anything already streamed.
            thread.patchTurn(id, (turn) => ({
              ...turn,
              ai: { status: "streaming", blocked: true },
              reply: { ...turn.reply, text: event.text },
            }));
          } else if (event.type === "attachments") {
            thread.patchTurn(id, (turn) => ({ ...turn, reply: { ...turn.reply, attachments: event.items } }));
          } else if (event.type === "done") {
            finished = true;
            thread.update({ topic: event.topic });
            thread.patchTurn(id, (turn) => ({
              ...turn,
              ai: { ...turn.ai, status: "done" },
              reply: { ...turn.reply, chips: pickFollowUps(event.topic, askedAnswers(), homeChips[mode]) },
            }));
          } else if (event.type === "error") {
            return fail(id, question, { kind: "server" }, mode);
          }
        }
      }
    }
    buffer.flush();
    if (!finished) fail(id, question, { kind: "network" }, mode);
  } catch (error) {
    if (controller.signal.aborted) return;
    buffer.flush();
    if (error instanceof SessionError) {
      return fail(id, question, error.status === 503 ? { kind: "unavailable" } : { kind: "server" }, mode);
    }
    fail(id, question, { kind: "network" }, mode);
  } finally {
    controllers.delete(id);
  }
}

/** Starts an AI answer for a typed question. `retryOf` re-asks in the same turn. */
export function askAI(question: string, mode: Mode, retryOf?: number) {
  const id = retryOf ?? thread.nextId();
  const turn: Turn = {
    id,
    question,
    from: "typed",
    reply: { text: "", attachments: [], chips: [] },
    ai: { status: "waiting" },
  };
  const { turns } = thread.get();
  thread.update({
    view: "thread",
    turns: retryOf === undefined ? [...turns, turn] : turns.map((entry) => (entry.id === id ? turn : entry)),
  });
  void run(id, question, mode);
}
