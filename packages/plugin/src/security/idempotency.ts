// ============================================
// IDEMPOTENCY STORE - In-Memory Implementation
// ============================================
//
// Stores results of expensive operations to prevent duplicate processing.
// For production, consider using Redis with TTL.
//
// SECURITY: This stores sensitive data in memory. Ensure proper
// cleanup and consider encryption for production use.

interface IdempotencyEntry<T> {
  value: T;
  expiresAt: number;
}

const store = new Map<string, IdempotencyEntry<unknown>>();

// Default TTL: 24 hours
const DEFAULT_TTL = 24 * 60 * 60 * 1000;

/**
 * Get a cached result by key
 */
export function getIdempotencyKey<T>(key: string): T | null {
  const entry = store.get(key);

  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    // Expired, remove it
    store.delete(key);
    return null;
  }

  return entry.value as T;
}

/**
 * Store a result with key
 */
export function setIdempotencyKey<T>(
  key: string,
  value: T,
  ttl: number = DEFAULT_TTL
): void {
  store.set(key, {
    expiresAt: Date.now() + ttl,
    value,
  });
}

/**
 * Check if an idempotency key exists and is valid
 */
export function hasIdempotencyKey(key: string): boolean {
  return getIdempotencyKey(key) !== null;
}

/**
 * Delete an idempotency key
 */
export function deleteIdempotencyKey(key: string): void {
  store.delete(key);
}

/**
 * Clear all idempotency keys (useful for testing)
 */
export function clearIdempotencyStore(): void {
  store.clear();
}

/**
 * Cleanup expired entries
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, entry] of store.entries()) {
    if (now > entry.expiresAt) {
      store.delete(key);
      cleaned += 1;
    }
  }

  return cleaned;
}

// ============================================
// EXPORT DEFAULT OBJECT
// ============================================

export const idempotencyStore = {
  cleanup: cleanupExpiredEntries,
  clear: clearIdempotencyStore,
  delete: deleteIdempotencyKey,
  get: getIdempotencyKey,
  has: hasIdempotencyKey,
  set: setIdempotencyKey,
};

/**
 * Validate idempotency key format
 * Key should be alphanumeric with hyphens, 36 chars max
 */
export function validateIdempotencyKey(key: string): boolean {
  if (!key || key.length > 36) {
    return false;
  }
  // Allow alphanumeric, hyphens, underscores
  return /^[a-zA-Z0-9_-]+$/.test(key);
}
