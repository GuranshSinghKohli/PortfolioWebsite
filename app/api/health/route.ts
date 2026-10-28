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

async function upstashOk(mod: Limits | null) {
  if (!mod) return false;
  try {
    const pong = await Promise.race([
      mod.redis.ping(),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
    ]);
    return pong === "PONG";
  } catch {
    return false;
  }
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
  const [upstash, openai] = await Promise.all([upstashOk(mod), openaiCheck()]);
  const ok = Object.values(env).every(Boolean) && upstash && openai.keyAccepted && openai.modelAvailable;

  return Response.json({ ok, env, upstash, openai }, { status: ok ? 200 : 503, headers: noStore });
}
