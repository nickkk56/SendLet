import type { MiddlewareHandler } from "hono";

/**
 * Simple in-memory rate limiter.
 * Tracks requests by IP and limits to maxRequests per windowMs.
 */
export function rateLimit(
  maxRequests: number,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): MiddlewareHandler {
  const requests = new Map<string, number[]>();

  return async (c, next) => {
    const ip = c.req.header("x-forwarded-for")?.split(",")[0]?.trim()
      ?? c.req.header("x-real-ip")
      ?? "unknown";

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing requests for this IP, filter out expired ones
    let ips = requests.get(ip) ?? [];
    ips = ips.filter((t) => t > windowStart);

    if (ips.length >= maxRequests) {
      return c.json({ error: "Too many requests. Please try again later." }, 429);
    }

    // Record this request
    ips.push(now);
    requests.set(ip, ips);

    return next();
  };
}
