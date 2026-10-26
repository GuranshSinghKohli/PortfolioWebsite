import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { DAILY_CAP_MICROS } from "@/lib/ai/pricing";

/**
 * Limits for POST /api/ask (PRD §11), shared across serverless instances
 * through Upstash Redis. Every check fails closed: if Redis is unreachable,
 * the ask is refused rather than let through unmetered.
 */
const redis = Redis.fromEnv();
const PREFIX = "portfolio:ask";

const perMinute = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(8, "1 m"),
  prefix: `${PREFIX}:minute`,
  timeout: 2000,
});

const perHour = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(40, "1 h"),
  prefix: `${PREFIX}:hour`,
  timeout: 2000,
});

/** Room held for an answer while it streams, settled to the real cost after. */
export const RESERVE_MICROS = 20_000;
const MIN_GAP_MS = 700;

export type LimitResult = { ok: true } | { ok: false; reason: "gap" | "minute" | "hour" | "budget"; retryAfter: number };

const dayKey = () => `${PREFIX}:spend:${new Date().toISOString().slice(0, 10)}`;

/**
 * Checks one ask from `ip` and, if allowed, reserves budget for it. The
 * caller must call `settle` with the real cost once the answer is done.
 */
export async function checkAsk(ip: string): Promise<LimitResult> {
  // 700 ms minimum gap: one key per IP that lives for the gap.
  const fresh = await redis.set(`${PREFIX}:gap:${ip}`, 1, { nx: true, px: MIN_GAP_MS });
  if (fresh !== "OK") return { ok: false, reason: "gap", retryAfter: 1 };

  for (const [limiter, reason] of [
    [perMinute, "minute"],
    [perHour, "hour"],
  ] as const) {
    const result = await limiter.limit(ip);
    if (!result.success || result.reason === "timeout") {
      return { ok: false, reason, retryAfter: Math.max(1, Math.ceil((result.reset - Date.now()) / 1000)) };
    }
  }

  // Daily global cap: reserve first, so concurrent asks can't all slip under it.
  const key = dayKey();
  const spent = await redis.incrby(key, RESERVE_MICROS);
  await redis.expire(key, 60 * 60 * 48);
  if (spent > DAILY_CAP_MICROS) {
    await redis.decrby(key, RESERVE_MICROS);
    const midnight = new Date();
    midnight.setUTCHours(24, 0, 0, 0);
    return { ok: false, reason: "budget", retryAfter: Math.ceil((midnight.getTime() - Date.now()) / 1000) };
  }
  return { ok: true };
}

/** Replaces an ask's reservation with what it really cost. */
export async function settle(actualMicros: number) {
  await redis.incrby(dayKey(), actualMicros - RESERVE_MICROS);
}

/** Today's spend in micro-dollars, for checks and logs. */
export async function spentToday() {
  return Number((await redis.get<number>(dayKey())) ?? 0);
}

export { redis };
