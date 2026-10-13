import type { Request, Response, NextFunction } from "express";

type Bucket = { count: number; resetAt: number };

export function createRateLimiter(options: { windowMs: number; max: number; key?: (req: Request) => string }) {
  const buckets = new Map<string, Bucket>();
  const keyOf = options.key ?? ((req: Request) => req.ip || req.socket.remoteAddress || "unknown");
  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyOf(req);
    const current = buckets.get(key);
    const bucket = !current || current.resetAt <= now
      ? { count: 0, resetAt: now + options.windowMs }
      : current;
    bucket.count += 1;
    buckets.set(key, bucket);
    if (buckets.size > 10_000) {
      for (const [entryKey, entry] of Array.from(buckets.entries())) if (entry.resetAt <= now) buckets.delete(entryKey);
    }
    res.setHeader("RateLimit-Limit", options.max);
    res.setHeader("RateLimit-Remaining", Math.max(0, options.max - bucket.count));
    res.setHeader("RateLimit-Reset", Math.ceil(bucket.resetAt / 1000));
    if (bucket.count > options.max) {
      res.setHeader("Retry-After", Math.ceil((bucket.resetAt - now) / 1000));
      return res.status(429).json({ error: "Too many requests. Please try again later." });
    }
    return next();
  };
}
