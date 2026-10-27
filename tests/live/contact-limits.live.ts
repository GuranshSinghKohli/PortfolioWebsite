import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * The contact limiter against the real Upstash database. Sends no email.
 * Uses a made-up IP and deletes its keys.
 */
const IP = `test-${Date.now()}`;
let limits: typeof import("@/lib/ratelimit");

beforeAll(async () => {
  process.loadEnvFile(".env.local");
  limits = await import("@/lib/ratelimit");
});

afterAll(async () => {
  const keys = await limits.redis.keys(`portfolio:contact:*${IP}*`);
  if (keys.length) await limits.redis.del(...keys);
});

describe("contact limiter (live)", () => {
  it("allows 4 messages an hour per IP, then refuses with a wait", async () => {
    for (let i = 1; i <= 4; i++) expect(await limits.checkContact(IP), `message ${i}`).toEqual({ ok: true });
    const fifth = await limits.checkContact(IP);
    expect(fifth).toMatchObject({ ok: false, reason: "hour" });
    // Upstash reports the reset at the current window's boundary, so anywhere up to an hour.
    const wait = fifth.ok === false && "retryAfter" in fifth ? fifth.retryAfter : 0;
    expect(wait).toBeGreaterThan(0);
    expect(wait).toBeLessThanOrEqual(3600);

    const keys = await limits.redis.keys(`portfolio:contact:*${IP}*`);
    console.log(`\nUpstash keys for the test IP: ${keys.map((key) => key.replace(IP, "<ip>")).join(", ")}\n`);
    expect(keys.some((key) => key.startsWith("portfolio:contact:hour"))).toBe(true);
    expect(keys.some((key) => key.startsWith("portfolio:contact:day"))).toBe(true);
  }, 30_000);
});
