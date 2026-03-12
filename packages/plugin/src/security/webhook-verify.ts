// ============================================
// WEBHOOK SIGNATURE VERIFICATION
// ============================================
//
// Verifies MercadoPago webhook signatures using HMAC-SHA256.
//
// SECURITY: This is critical for security. Ensure:
// - Always verify signatures in production
// - Use constant-time comparison to prevent timing attacks
// - Store webhookSecret securely

import { createHmac, timingSafeEqual } from "node:crypto";

interface VerifyWebhookSignatureParams {
  /** Signature header from MP */
  xSignature?: string | null;
  /** Request ID header from MP */
  xRequestId?: string | null;
  /** Payment/Subscription ID from notification data */
  dataId: string;
  /** Webhook secret from MP config */
  secret: string;
}

/**
 * Verify webhook signature from MercadoPago
 *
 * MercadoPago sends a signature in the x-signature header
 * that needs to be verified against the payload.
 *
 * The signature is generated as:
 * sha256(id + ":" + secret)
 *
 * @returns {boolean} true if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  params: VerifyWebhookSignatureParams
): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;

  // If no signature provided, reject (security first)
  if (!xSignature || !xRequestId) {
    return false;
  }

  try {
    // The signature format from MP is: timestamp,signature
    // We need to verify the signature part
    const parts = xSignature.split(",");

    if (parts.length !== 2) {
      return false;
    }

    const timestamp = parts[0]?.split("=")[1];
    const signature = parts[1]?.split("=")[1];

    if (!timestamp || !signature) {
      return false;
    }

    // Generate our own signature
    // Format: sha256(timestamp:id:secret)
    const payload = `${timestamp}:${dataId}:${secret}`;
    const expectedSignature = createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, "hex");
    const expectedBuffer = Buffer.from(expectedSignature, "hex");

    // If lengths don't match, reject
    if (sigBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return timingSafeEqual(sigBuffer, expectedBuffer);
  } catch {
    // Any error means verification failed
    return false;
  }
}

/**
 * Alternative verification using the older v1 format
 * This is kept for backward compatibility
 */
export function verifyWebhookSignatureV1(
  dataId: string,
  secret: string,
  signature: string
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(dataId)
    .digest("hex");

  const sigBuffer = Buffer.from(signature, "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Simple signature verification for testing
 * (not secure for production)
 */
export function verifyWebhookSignatureSimple(
  dataId: string,
  secret: string,
  signature: string
): boolean {
  const expectedSignature = createHmac("sha256", secret)
    .update(dataId)
    .digest("hex");

  return signature === expectedSignature;
}
