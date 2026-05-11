// Simple in-memory rate limiter (sufficient for single-instance)
// For multi-instance production, use Redis

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitEntry>();

function getKey(identifier: string, action: string): string {
  return `${action}:${identifier}`;
}

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanup, 5 * 60 * 1000);

export function checkRateLimit(
  identifier: string,
  action: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = getKey(identifier, action);
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  if (entry.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: entry.resetAt - now,
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now,
  };
}

// Get IP from request (supports proxies)
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp;
  // Fallback: use user-agent hash (not perfect but better than nothing)
  return req.headers.get("user-agent")?.slice(0, 50) || "unknown";
}
