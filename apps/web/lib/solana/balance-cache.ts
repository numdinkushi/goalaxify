const MEMORY_CACHE = new Map<string, BalanceCacheEntry>();
const STORAGE_KEY = "goalaxify.wallet.balance";

export const BALANCE_STALE_MS = 90_000;
export const BALANCE_POLL_MS = 120_000;
export const BALANCE_FOCUS_MIN_MS = 90_000;

export type BalanceCacheEntry = {
  lamports: number;
  fetchedAt: number;
};

function readStorageCache(): Record<string, BalanceCacheEntry> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as Record<string, BalanceCacheEntry>;
  } catch {
    return {};
  }
}

function writeStorageCache(entry: Record<string, BalanceCacheEntry>) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
}

export function getCachedBalance(
  network: string,
  pubkey: string,
): BalanceCacheEntry | null {
  const cacheKey = `${network}:${pubkey}`;
  const memoryEntry = MEMORY_CACHE.get(cacheKey);
  if (memoryEntry) {
    return memoryEntry;
  }

  const storageEntry = readStorageCache()[cacheKey];
  if (!storageEntry) {
    return null;
  }

  MEMORY_CACHE.set(cacheKey, storageEntry);
  return storageEntry;
}

export function setCachedBalance(
  network: string,
  pubkey: string,
  lamports: number,
) {
  const cacheKey = `${network}:${pubkey}`;
  const entry: BalanceCacheEntry = {
    lamports,
    fetchedAt: Date.now(),
  };

  MEMORY_CACHE.set(cacheKey, entry);

  const storageCache = readStorageCache();
  storageCache[cacheKey] = entry;
  writeStorageCache(storageCache);
}

export function isBalanceCacheStale(
  entry: BalanceCacheEntry,
  staleMs = BALANCE_STALE_MS,
) {
  return Date.now() - entry.fetchedAt > staleMs;
}

export function clearCachedBalance(network: string, pubkey: string) {
  const cacheKey = `${network}:${pubkey}`;
  MEMORY_CACHE.delete(cacheKey);

  const storageCache = readStorageCache();
  delete storageCache[cacheKey];
  writeStorageCache(storageCache);
}
