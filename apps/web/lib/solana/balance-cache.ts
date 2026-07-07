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

export function getCachedBalance(pubkey: string): BalanceCacheEntry | null {
  const memoryEntry = MEMORY_CACHE.get(pubkey);
  if (memoryEntry) {
    return memoryEntry;
  }

  const storageEntry = readStorageCache()[pubkey];
  if (!storageEntry) {
    return null;
  }

  MEMORY_CACHE.set(pubkey, storageEntry);
  return storageEntry;
}

export function setCachedBalance(pubkey: string, lamports: number) {
  const entry: BalanceCacheEntry = {
    lamports,
    fetchedAt: Date.now(),
  };

  MEMORY_CACHE.set(pubkey, entry);

  const storageCache = readStorageCache();
  storageCache[pubkey] = entry;
  writeStorageCache(storageCache);
}

export function isBalanceCacheStale(
  entry: BalanceCacheEntry,
  staleMs = BALANCE_STALE_MS,
) {
  return Date.now() - entry.fetchedAt > staleMs;
}

export function clearCachedBalance(pubkey: string) {
  MEMORY_CACHE.delete(pubkey);

  const storageCache = readStorageCache();
  delete storageCache[pubkey];
  writeStorageCache(storageCache);
}
