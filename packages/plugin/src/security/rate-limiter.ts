// ============================================
// RATE LIMITER - In-Memory Implementation
// ============================================
//
// Simple in-memory rate limiter for plugin operations.
// For production, consider using Redis or similar.
//
// SECURITY: This is a basic implementation. For production,
// implement distributed rate limiting with proper storage.

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitEntry>();

/**
 * Check if the request should be rate limited
 * @param {string} key  - Unique identifier for the request
 * @param {number} max - Maximum requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} true if allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  max: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (entry.count >= max) {
    // Rate limited
    return false;
  }

  // Increment count
  entry.count += 1;
  return true;
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(key: string, max: number): number {
  const entry = store.get(key);
  if (!entry) return max;
  if (Date.now() > entry.resetTime) return max;
  return Math.max(0, max - entry.count);
}

/**
 * Get reset time for a key
 */
export function getResetTime(key: string): number | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.resetTime) return null;
  return entry.resetTime;
}

/**
 * Clear rate limit for a key
 */
export function clearRateLimit(key: string): void {
  store.delete(key);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  store.clear();
}

// ============================================
// EXPORT DEFAULT OBJECT (like the example)
// ============================================

export const rateLimiter = {
  check: checkRateLimit,
  clear: clearRateLimit,
  clearAll: clearAllRateLimits,
  getRemaining: getRemainingRequests,
  getResetTime,
};
