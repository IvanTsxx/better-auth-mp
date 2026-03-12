// ============================================
// METADATA SANITIZATION
// ============================================
//
// Sanitizes metadata to prevent security issues.
// - Removes reserved keys that could conflict with plugin internals
// - Validates types
// - Limits size
//
// SECURITY: Critical to prevent metadata injection attacks.

// Reserved keys that cannot be set via user metadata
const RESERVED_KEYS = [
  "userId",
  "externalReference",
  "preferenceId",
  "paymentId",
  "subscriptionId",
  "status",
  "amount",
  "currency",
  "_plugin_internal",
] as const;

// Maximum metadata size (in characters)
const MAX_METADATA_SIZE = 5000;

/**
 * Sanitize metadata object
 * Removes reserved keys and validates types
 */
export function sanitizeMetadata(
  metadata: Record<string, unknown>
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  for (const [key, value] of Object.entries(metadata)) {
    // Skip reserved keys
    if (RESERVED_KEYS.includes(key as (typeof RESERVED_KEYS)[number])) {
      continue;
    }

    // Skip undefined/null values
    if (value === undefined || value === null) {
      continue;
    }

    // Convert value to string
    let stringValue: string;

    if (typeof value === "string") {
      stringValue = value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      stringValue = String(value);
    } else {
      // JSON stringify objects
      stringValue = JSON.stringify(value);
    }

    // Skip empty values
    if (!stringValue || stringValue.trim() === "") {
      continue;
    }

    sanitized[key] = stringValue;
  }

  return sanitized;
}

/**
 * Check if metadata contains reserved keys
 */
export function hasReservedKeys(metadata: Record<string, unknown>): boolean {
  return Object.keys(metadata).some((key) =>
    RESERVED_KEYS.includes(key as (typeof RESERVED_KEYS)[number])
  );
}

/**
 * Get reserved keys list
 */
export function getReservedKeys(): readonly string[] {
  return RESERVED_KEYS;
}

/**
 * Validate metadata size
 */
export function validateMetadataSize(
  metadata: Record<string, unknown>
): boolean {
  const jsonString = JSON.stringify(metadata);
  return jsonString.length <= MAX_METADATA_SIZE;
}

/**
 * Get metadata size in characters
 */
export function getMetadataSize(metadata: Record<string, unknown>): number {
  return JSON.stringify(metadata).length;
}

/**
 * Safe JSON parse for metadata
 */
export function parseMetadata(
  metadataString: string
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(metadataString);
    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
