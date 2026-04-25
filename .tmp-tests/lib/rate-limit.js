"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRequestIdentity = getRequestIdentity;
exports.checkRateLimit = checkRateLimit;
const store = global.requestRateLimitStore ?? new Map();
global.requestRateLimitStore = store;
function cleanupExpiredEntries(now) {
    for (const [key, entry] of store.entries()) {
        if (entry.expiresAt <= now) {
            store.delete(key);
        }
    }
}
function getRequestIdentity(request, fallback = "anonymous") {
    const forwardedFor = request.headers.get("x-forwarded-for") || "";
    const realIp = request.headers.get("x-real-ip") || "";
    const ip = forwardedFor.split(",")[0]?.trim() || realIp.trim();
    return ip || fallback;
}
function checkRateLimit({ key, limit, windowMs }) {
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
