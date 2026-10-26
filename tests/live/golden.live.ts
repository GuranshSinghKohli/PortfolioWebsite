import { writeFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { golden, type GoldenCase } from "../golden/questions";

/**
 * Runs the golden set through POST /api/ask against the real model. Only
 * the Upstash limiter is replaced: 40 asks would trip the 8-a-minute limit.
 * Writes tests/golden/last-run.json and fails below 95%.
 */
vi.mock("@/lib/ratelimit", () => ({
  checkAsk: async () => ({ ok: true }),
  settle: async (micros: number) => void costs.push(micros),
}));

const costs: number[] = [];
const IP = "198.51.100.40";
let ticket = "";

beforeAll(async () => {
  process.loadEnvFile(".env.local");
  const { issueTicket } = await import("@/lib/ticket");
  ({ ticket } = await issueTicket(IP, process.env.ASK_SIGNING_SECRET!));
});

async function answer(entry: GoldenCase) {
  const { POST } = await import("@/app/api/ask/route");
  const response = await POST(
    new Request("http://localhost:3124/api/ask", {
      method: "POST",
      headers: { origin: "http://localhost:3124", host: "localhost:3124", "x-real-ip": IP, "x-ask-ticket": ticket },
      body: JSON.stringify({ question: entry.question, history: entry.history ?? [], topic: null }),
    }),
  );
  if (response.status !== 200) return `HTTP ${response.status}`;
  const events = (await response.text()).trim().split("\n").map((line) => JSON.parse(line) as { type: string; text?: string });
  const blocked = events.find((event) => event.type === "blocked");
  return blocked?.text ?? events.filter((event) => event.type === "text").map((event) => event.text).join("");
}

function grade(entry: GoldenCase, answer: string) {
  // Models write curly apostrophes and quotes; grade on straight ones.
  const text = answer.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"');
  const problems = [
    ...entry.must.filter((re) => !re.test(text)).map((re) => `missing ${re}`),
    ...(entry.mustNot ?? []).filter((re) => re.test(text)).map((re) => `contains ${re}`),
    ...(entry.maxLength && text.length > entry.maxLength ? [`${text.length} chars > ${entry.maxLength}`] : []),
  ];
  return problems;
}

describe("golden set (live)", () => {
  it("scores at least 95%", async () => {
    const results: { id: string; expected: string; answer: string; problems: string[] }[] = [];
    for (let i = 0; i < golden.length; i += 5) {
      const batch = golden.slice(i, i + 5);
      const answers = await Promise.all(batch.map(answer));
      batch.forEach((entry, j) => results.push({ id: entry.id, expected: entry.expected, answer: answers[j], problems: grade(entry, answers[j]) }));
    }
    const passed = results.filter((result) => result.problems.length === 0).length;
    const score = passed / results.length;
    const model = process.env.ASK_MODEL;
    writeFileSync(
      "tests/golden/last-run.json",
      `${JSON.stringify({ model, date: new Date().toISOString(), score, passed, total: results.length, costMicros: costs.reduce((a, b) => a + b, 0), results }, null, 2)}\n`,
    );
    console.log(`\nGolden set on ${model}: ${passed}/${results.length} (${(score * 100).toFixed(1)}%), cost $${(costs.reduce((a, b) => a + b, 0) / 1e6).toFixed(4)}`);
    for (const result of results.filter((r) => r.problems.length)) {
      console.log(`  FAIL ${result.id}: expected ${result.expected}; ${result.problems.join("; ")}\n    answer: ${result.answer}`);
    }
    expect(score).toBeGreaterThanOrEqual(0.95);
  }, 300_000);
});
