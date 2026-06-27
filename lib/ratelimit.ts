import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Per-IP rate limit for the paid /api/check call. Each check is one billed
// Anthropic request, so this caps what a single IP can spend.
//
// Uses Upstash Redis when it's configured (shared across every serverless
// instance, so the limit is real on Vercel). Falls back to an in-memory window
// when it isn't — fine for local dev, but weaker on serverless because each
// warm instance keeps its own map. Set UPSTASH_REDIS_REST_URL/TOKEN (or the
// KV_REST_API_* pair from a Vercel KV store) to switch to the robust path.

const LIMIT = 3; // checks allowed per IP per window
const WINDOW = "1 h"; // human window for Upstash
const WINDOW_MS = 60 * 60 * 1000; // same window for the in-memory fallback

export const RATE_LIMIT = LIMIT;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();

const upstash = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: "vibecheck:rl",
      analytics: false,
    })
  : null;

// In-memory fallback: ip -> recent request timestamps.
const memory = new Map<string, number[]>();

function memoryLimit(ip: string) {
  const now = Date.now();
  // Cheap guard against unbounded growth on a long-lived instance.
  if (memory.size > 5000) memory.clear();
  const hits = (memory.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (hits.length >= LIMIT) {
    const resetSeconds = Math.ceil((WINDOW_MS - (now - hits[0])) / 1000);
    return { ok: false, remaining: 0, resetSeconds };
  }
  hits.push(now);
  memory.set(ip, hits);
  return { ok: true, remaining: LIMIT - hits.length, resetSeconds: 0 };
}

export interface RateResult {
  ok: boolean;
  remaining: number;
  resetSeconds: number;
  backend: "upstash" | "memory";
}

export async function checkRateLimit(ip: string): Promise<RateResult> {
  if (upstash) {
    const { success, remaining, reset } = await upstash.limit(ip);
    return {
      ok: success,
      remaining,
      resetSeconds: Math.max(0, Math.ceil((reset - Date.now()) / 1000)),
      backend: "upstash",
    };
  }
  return { ...memoryLimit(ip), backend: "memory" };
}

// Durable daily usage counter, viewable in the Upstash data browser. No-op
// without Redis (local logs are the fallback for usage visibility).
export async function recordUsage(day: string): Promise<void> {
  if (!redis) return;
  try {
    await redis.incr(`vibecheck:checks:${day}`);
  } catch {
    // Usage counting must never break a check.
  }
}
