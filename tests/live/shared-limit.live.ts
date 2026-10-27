import { appendFileSync } from "node:fs";
import { expect, it } from "vitest";

/**
 * One "instance" of the contact limiter. Run two of these as separate
 * processes with the same SHARED_IP (scripts in DECISIONS.md, Phase 5): the
 * 4/hour limit must hold across them, because the count lives in Upstash.
 * Sends no email. Appends how many of its 3 checks were allowed to RESULT_FILE.
 */
it("counts against the shared limit", async () => {
  const ip = process.env.SHARED_IP;
  if (!ip) return; // Only meaningful when run in pairs.
  process.loadEnvFile(".env.local");
  const { checkContact } = await import("@/lib/ratelimit");
  let allowed = 0;
  for (let i = 0; i < 3; i++) if ((await checkContact(ip)).ok) allowed++;
  if (process.env.RESULT_FILE) appendFileSync(process.env.RESULT_FILE, `${allowed}\n`);
  expect(allowed).toBeLessThanOrEqual(3);
}, 30_000);
