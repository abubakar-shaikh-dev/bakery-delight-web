import { NextRequest, NextResponse } from "next/server";

/** True when `id` is a well-formed MongoDB ObjectId. */
export function isObjectId(id: string) {
  return /^[a-f0-9]{24}$/i.test(id);
}

/**
 * Runs a route body and converts unexpected throws (CastError, transient
 * query failures, E11000) into a JSON 500 instead of an HTML error page.
 */
export async function safeJson(fn: () => Promise<NextResponse>) {
  try {
    return await fn();
  } catch (err) {
    console.error("[api]", (err as Error).message);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

/** Best-effort client IP for rate limiting (proxies first). */
export function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "local"
  );
}

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Tiny per-key sliding-window limiter for public endpoints. Counts are
 * per server instance — enough to blunt spam on a small site.
 */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (hits.size > 5000) {
    for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
  }
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}
