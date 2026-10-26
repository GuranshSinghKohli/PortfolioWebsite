/**
 * What an answer cost, from its real token usage, for the daily bill guard.
 * USD per million tokens, OpenAI Standard tier, short context (pricing page,
 * 2026-10-26). OpenAI bills no premium for cache writes: they cost input rate.
 */
type Rates = { input: number; output: number; cacheRead: number };

const RATES: Record<string, Rates> = {
  "gpt-6.1-sol": { input: 2, output: 10, cacheRead: 0.1 },
  "gpt-6.1-terra": { input: 1, output: 5, cacheRead: 0.05 },
  "gpt-6-luna": { input: 0.1, output: 0.5, cacheRead: 0.01 },
  "gpt-6-sol": { input: 2, output: 10, cacheRead: 0.2 },
  "gpt-6-astra": { input: 10, output: 50, cacheRead: 1 },
};

/** Unknown models bill at the top rate, so the guard never under-counts. */
const TOP_RATE: Rates = RATES["gpt-6-astra"];

export function ratesFor(model: string): Rates {
  return RATES[model] ?? TOP_RATE;
}

export type Usage = {
  /** Uncached input tokens. */
  input: number;
  cacheRead: number;
  cacheWrite: number;
  /** Includes reasoning tokens. */
  output: number;
};

/** Cost in micro-dollars (millionths of a dollar), rounded up. */
export function costMicros(usage: Usage, rates: Rates) {
  const usd =
    (usage.input * rates.input +
      usage.cacheWrite * rates.input +
      usage.cacheRead * rates.cacheRead +
      usage.output * rates.output) /
    1_000_000;
  return Math.ceil(usd * 1_000_000);
}

/** $20 a month (DECISIONS: AI budget), spread over the longest month. */
export const MONTHLY_BUDGET_USD = 20;
export const DAILY_CAP_MICROS = Math.floor((MONTHLY_BUDGET_USD / 31) * 1_000_000);
