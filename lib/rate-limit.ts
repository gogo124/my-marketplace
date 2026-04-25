type RateLimitEntry = {
  count: number;
  expiresAt: number;
};

declare global {
  var requestRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const store = global.requestRateLimitStore ?? new Map<string, RateLimitEntry>();

global.requestRateLimitStore = store;

function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt <= now) {
      store.delete(key);
    }
  }
}

export function getRequestIdentity(request: Request, fallback = "anonymous") {
  const forwardedFor = request.headers.get("x-forwarded-for") || "";
  const realIp = request.headers.get("x-real-ip") || "";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp.trim();

  return ip || fallback;
}

export function checkRateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}) {
  const now = Date.now();

  cleanupExpiredEntries(now);

  const existing = store.get(key);

  if (!existing || existing.expiresAt <= now) {
    store.set(key, {
      count: 1,
      expiresAt: now + windowMs
    });

    return { allowed: true, remaining: Math.max(limit - 1, 0) };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: existing.expiresAt - now };
  }

  existing.count += 1;
  store.set(key, existing);

  return { allowed: true, remaining: Math.max(limit - existing.count, 0) };
}
