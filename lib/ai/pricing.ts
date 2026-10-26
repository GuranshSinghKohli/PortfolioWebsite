/**
 * What an answer cost, from its real token usage, for the daily bill guard.
 * USD per million tokens, Anthropic first-party rates (October 2026). Cache
 * writes bill at 1.25× input (5-minute TTL); cache reads as listed.
 */
type Rates = { input: number; output: number; cacheRead: number };

const RATES: Record<string, Rates> = {
  "claude-haiku-5-5": { input: 0.1, output: 0.5, cacheRead: 0.01 },
  "claude-sonnet-5-5": { input: 2, output: 10, cacheRead: 0.2 },
  "claude-opus-5-5": { input: 4, output: 20, cacheRead: 0.2 },
};

/** Unknown models, and turns a fallback model served, bill at the top rate so the guard never under-counts. */
const TOP_RATE: Rates = { input: 10, output: 50, cacheRead: 1 };

export function ratesFor(model: string, servedByFallback = false): Rates {
  return servedByFallback ? TOP_RATE : (RATES[model] ?? TOP_RATE);
}

export type Usage = {
  /** Uncached input tokens. */
  input: number;
  cacheRead: number;
  cacheWrite: number;
  /** Includes thinking tokens. */
  output: number;
};

/** Cost in micro-dollars (millionths of a dollar), rounded up. */
export function costMicros(usage: Usage, rates: Rates) {
  const usd =
    (usage.input * rates.input +
      usage.cacheWrite * rates.input * 1.25 +
      usage.cacheRead * rates.cacheRead +
      usage.output * rates.output) /
    1_000_000;
  return Math.ceil(usd * 1_000_000);
}

/** $20 a month (DECISIONS: AI budget), spread over the longest month. */
export const MONTHLY_BUDGET_USD = 20;
export const DAILY_CAP_MICROS = Math.floor((MONTHLY_BUDGET_USD / 31) * 1_000_000);
