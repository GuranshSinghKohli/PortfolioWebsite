import { clientIp, noStore } from "@/lib/request";

/**
 * GET /api/health: is the AI and contact setup working? Only true/false,
 * never a value. Checks that every env var the site needs is present, that
 * Upstash answers a ping, and that OpenAI accepts the key and serves
 * ASK_MODEL (a free model lookup, no generation). 10 a minute per IP, in
 * Upstash when it's reachable and in memory when it isn't (it may be the
 * thing that's broken).
 */
const REQUIRED = [
  "OPENAI_API_KEY",
  "ASK_MODEL",
  "ASK_SIGNING_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RESEND_API_KEY",
  "CONTACT_FROM_EMAIL",
  "CONTACT_TO_EMAIL",
] as const;

const TIMEOUT_MS = 4000;
const LOCAL_LIMIT = 10;
const local = new Map<string, number[]>();

/** Per-instance fallback: at most 10 checks a minute per IP. */
function localAllow(ip: string) {
  const now = Date.now();
  const recent = (local.get(ip) ?? []).filter((at) => now - at < 60_000);
  if (recent.length >= LOCAL_LIMIT) return false;
  local.set(ip, [...recent, now]);
  return true;
}

type Limits = typeof import("@/lib/ratelimit");

/** Loaded lazily: with a broken Upstash config, importing it must not take the route down. */
async function limits(): Promise<Limits | null> {
  try {
    return await import("@/lib/ratelimit");
  } catch {
    return null;
  }
}

type UpstashError = "unauthorized" | "unreachable" | "timeout" | "other" | null;

/** A rough reason, from the error text only (Upstash errors carry no secrets). */
function upstashReason(error: unknown): UpstashError {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/timeout/i.test(text)) return "timeout";
  if (/WRONGPASS|unauthori[sz]ed|401|invalid.*(token|password)/i.test(text)) return "unauthorized";
  if (/ENOTFOUND|EAI_AGAIN|getaddrinfo|fetch failed|ECONNREFUSED|invalid url|failed to parse url/i.test(text)) return "unreachable";
  return "other";
}

async function upstashCheck(mod: Limits | null): Promise<{ ok: boolean; error: UpstashError }> {
  if (!mod) return { ok: false, error: "other" };
  try {
    const pong = await Promise.race([
      mod.redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
    ]);
    return { ok: pong === "PONG", error: pong === "PONG" ? null : "other" };
  } catch (error) {
    return { ok: false, error: upstashReason(error) };
  }
}

/**
 * Shape checks on the Upstash values, as booleans. They catch the usual
 * paste mistakes: the masked "••••" from a dashboard, quotes, a trailing
 * space or newline, or a redis:// connection string instead of the REST URL.
 */
function upstashFormat() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? "";
  return {
    urlIsRestUrl: /^https:\/\/[a-z0-9-]+\.upstash\.io\/?$/i.test(url),
    tokenHasNoSpacesOrQuotes: token.length > 0 && !/[\s"'`]/.test(token),
    tokenIsNotMasked: token.length > 0 && !/[*•●]/.test(token),
    tokenLongEnough: token.length >= 40,
  };
}

/** 200: key and model fine. 404: key fine, model not available to it. 401/403: key rejected. */
async function openaiCheck() {
  const key = process.env.OPENAI_API_KEY;
  const model = process.env.ASK_MODEL;
  if (!key) return { keyAccepted: false, modelAvailable: false };
  try {
    const response = await fetch(`https://api.openai.com/v1/models/${encodeURIComponent(model || "gpt-6-luna")}`, {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    return {
      keyAccepted: response.status === 200 || response.status === 404,
      modelAvailable: Boolean(model) && response.status === 200,
    };
  } catch {
    return { keyAccepted: false, modelAvailable: false };
  }
}

export async function GET(request: Request) {
  const ip = clientIp(request);
  const mod = await limits();

  let allowed: boolean;
  try {
    if (!mod) throw new Error("no limiter");
    const result = await mod.healthLimiter.limit(ip);
    allowed = result.success && result.reason !== "timeout";
    if (result.reason === "timeout") allowed = localAllow(ip);
  } catch {
    allowed = localAllow(ip);
  }
  if (!allowed) {
    return Response.json({ error: "rate_limited" }, { status: 429, headers: { ...noStore, "Retry-After": "60" } });
  }

  const env = Object.fromEntries(REQUIRED.map((name) => [name, Boolean(process.env[name])])) as Record<
    (typeof REQUIRED)[number],
    boolean
  >;
  const [check, openai] = await Promise.all([upstashCheck(mod), openaiCheck()]);
  const ok = Object.values(env).every(Boolean) && check.ok && openai.keyAccepted && openai.modelAvailable;

  return Response.json(
    { ok, env, upstash: check.ok, upstashDetail: check.ok ? undefined : { error: check.error, ...upstashFormat() }, openai },
    { status: ok ? 200 : 503, headers: noStore },
  );
}
