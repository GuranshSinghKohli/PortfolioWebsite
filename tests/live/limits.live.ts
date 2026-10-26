import { afterAll, beforeAll, describe, expect, it } from "vitest";

/**
 * The limiter against the real Upstash database, with no model calls. Uses
 * a made-up IP, refunds every reservation it makes and deletes its keys.
 */
const IP = `test-${Date.now()}`;
type Limits = typeof import("@/lib/ratelimit");
let limits: Limits;
let reserved = 0;

beforeAll(async () => {
  process.loadEnvFile(".env.local");
  limits = await import("@/lib/ratelimit");
});

afterAll(async () => {
  // Refund what this test reserved and delete the test IP's keys.
  for (let i = 0; i < reserved; i++) await limits.settle(0);
  const keys = await limits.redis.keys(`portfolio:ask:*${IP}*`);
  if (keys.length) await limits.redis.del(...keys);
});

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("Upstash limiter (live)", () => {
  it("connects", async () => {
    expect(await limits.redis.ping()).toBe("PONG");
  });

  it("enforces the 700 ms gap, 8 a minute, and reserves budget in Upstash", async () => {
    const before = await limits.spentToday();

    const first = await limits.checkAsk(IP);
    expect(first).toEqual({ ok: true });
    reserved++;
    expect(await limits.checkAsk(IP)).toMatchObject({ ok: false, reason: "gap" });

    for (let i = 2; i <= 8; i++) {
      await sleep(750);
      expect(await limits.checkAsk(IP), `ask ${i}`).toEqual({ ok: true });
      reserved++;
    }
    await sleep(750);
    expect(await limits.checkAsk(IP)).toMatchObject({ ok: false, reason: "minute" });

    const keys = await limits.redis.keys(`portfolio:ask:*${IP}*`);
    console.log(`\nUpstash keys for the test IP: ${keys.map((key) => key.replace(IP, "<ip>")).join(", ")}`);
    expect(keys.some((key) => key.startsWith("portfolio:ask:minute"))).toBe(true);
    expect(keys.some((key) => key.startsWith("portfolio:ask:hour"))).toBe(true);

    const after = await limits.spentToday();
    console.log(`Today's spend went ${before} → ${after} micro-dollars (8 reservations of ${limits.RESERVE_MICROS}).\n`);
    expect(after - before).toBeGreaterThanOrEqual(8 * limits.RESERVE_MICROS);
  }, 30_000);
});
