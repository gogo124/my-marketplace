type CacheEntry<T> = {
  expiresAt: number;
  value: Promise<T>;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export async function withMemoryCache<T>(key: string, ttlMs: number, loader: () => Promise<T>) {
  const now = Date.now();
  const cached = memoryCache.get(key) as CacheEntry<T> | undefined;

  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const value = loader().catch((error) => {
    memoryCache.delete(key);
    throw error;
  });

  memoryCache.set(key, {
    expiresAt: now + ttlMs,
    value
  });

  return value;
}

export function clearMemoryCache(keyPrefix?: string) {
  if (!keyPrefix) {
    memoryCache.clear();
    return;
  }

  for (const key of memoryCache.keys()) {
    if (key.startsWith(keyPrefix)) {
      memoryCache.delete(key);
    }
  }
}
