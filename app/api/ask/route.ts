import { openai, type OpenAILanguageModelResponsesOptions } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

import { historySchema, MAX_QUESTION_CHARS, clean, sanitizeHistory, wrapQuestion } from "@/lib/ai/history";
import { costMicros, ratesFor } from "@/lib/ai/pricing";
import { systemInstruction, topicHint } from "@/lib/ai/prompt";
import { matchedAttachments } from "@/lib/matcher";
import { checkAsk, settle } from "@/lib/ratelimit";
import { clientIp, noStore, sameOrigin } from "@/lib/request";
import { route } from "@/lib/router";
import { verifyTicket } from "@/lib/ticket";

/**
 * POST /api/ask (PRD §11): guard, ground, answer. The response is
 * newline-delimited JSON: text events while the model streams, then one
 * attachments event from the entity matcher, then done.
 *
 *   {"type":"text","text":"…"}
 *   {"type":"attachments","items":[…]}
 *   {"type":"done","topic":"…"}
 *   {"type":"error","error":"…"}   (instead of done, if the model fails)
 */
const bodySchema = z.object({
  question: z.string(),
  history: historySchema,
  /** The thread's current topic, from the client's router. */
  topic: z.string().max(64).nullable().default(null),
});

/** A runaway guard, not a length control: the prompt keeps answers short. Reasoning counts toward it. */
const MAX_OUTPUT_TOKENS = 4096;

/** Groups every ask on one prompt cache, since the system instruction never changes between requests. */
const PROMPT_CACHE_KEY = "portfolio-ask-v1";

const REFUSED = "That one's outside what I can answer here. Ask me about my work, projects or experience instead.";

function fail(status: number, error: string, headers: Record<string, string> = {}) {
  return Response.json({ error }, { status, headers: { ...noStore, ...headers } });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return fail(403, "origin");

  const model = process.env.ASK_MODEL;
  const secret = process.env.ASK_SIGNING_SECRET;
  if (!model || !secret || !process.env.OPENAI_API_KEY) return fail(503, "unavailable");

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return fail(400, "bad_request");

  const question = clean(parsed.data.question, Infinity);
  if (!question) return fail(400, "empty");
  if (question.length > MAX_QUESTION_CHARS) return fail(413, "too_long");

  const ip = clientIp(request);
  const ticket = await verifyTicket(request.headers.get("x-ask-ticket"), ip, secret);
  if (ticket !== "ok") return fail(401, "ticket", { "X-Ticket": ticket });

  let limit;
  try {
    limit = await checkAsk(ip);
  } catch {
    return fail(503, "limiter"); // Redis unreachable: fail closed.
  }
  if (!limit.ok) return fail(429, limit.reason, { "Retry-After": String(limit.retryAfter) });

  const history = sanitizeHistory(parsed.data.history);
  const { topic } = route(question, parsed.data.topic);

  const result = streamText({
    model: openai(model),
    instructions: systemInstruction,
    messages: [
      {
        role: "user",
        content: `<lead_here>${topicHint(topic)}</lead_here>\n\n${wrapQuestion(question, history)}`,
      },
    ],
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    maxRetries: 1,
    abortSignal: request.signal,
    // Log the message only; the SDK's default logs the whole error object.
    onError: ({ error }) => console.error("ask model error:", error instanceof Error ? error.message : "unknown"),
    providerOptions: {
      openai: {
        // Short conversational answers don't need deep reasoning; no summaries, and nothing stored at OpenAI.
        reasoningEffort: "low",
        reasoningSummary: null,
        store: false,
        promptCacheKey: PROMPT_CACHE_KEY,
      } satisfies OpenAILanguageModelResponsesOptions,
    },
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) => controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      let text = "";
      try {
        for await (const delta of result.textStream) {
          text += delta;
          send({ type: "text", text: delta });
        }
        const [usage, finishReason] = await Promise.all([result.usage, result.finishReason]);
        await settle(
          costMicros(
            {
              input: usage.inputTokenDetails?.noCacheTokens ?? usage.inputTokens ?? 0,
              cacheRead: usage.inputTokenDetails?.cacheReadTokens ?? 0,
              cacheWrite: usage.inputTokenDetails?.cacheWriteTokens ?? 0,
              output: usage.outputTokens ?? 0,
            },
            ratesFor(model),
          ),
        );

        if (!text.trim()) {
          // A refusal or an empty answer: say something useful rather than nothing.
          text = REFUSED;
          send({ type: "text", text });
        }
        if (finishReason !== "content-filter") {
          send({ type: "attachments", items: matchedAttachments(question, text) });
        }
        send({ type: "done", topic });
      } catch (error) {
        if (!request.signal.aborted) {
          console.error("ask failed", error instanceof Error ? error.message : error);
          send({ type: "error", error: "model" });
        }
      } finally {
        // An aborted or failed answer keeps its reservation: the guard over-counts rather than under-counts.
        try {
          controller.close();
        } catch {}
      }
    },
  });

  return new Response(stream, {
    headers: {
      ...noStore,
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "X-Accel-Buffering": "no",
    },
  });
}
