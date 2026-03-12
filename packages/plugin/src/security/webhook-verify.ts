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

import crypto, { createHmac, timingSafeEqual } from "node:crypto";

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
 * Verify Mercado Pago webhook signature
 * https://www.mercadopago.com/developers/en/docs/subscriptions/additional-content/security/signature
 */
export function verifyWebhookSignature(
  params: VerifyWebhookSignatureParams
): boolean {
  const { xSignature, xRequestId, dataId, secret } = params;

  if (!xSignature || !xRequestId) {
    return false;
  }

  // Parse x-signature header
  // Format: "ts=1234567890,v1=hash"
  const parts = xSignature.split(",");
  const ts = parts.find((p) => p.startsWith("ts="))?.split("=")[1];
  const hash = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!ts || !hash) {
    return false;
  }

  // Build the manifest (exactly as MP does)
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // Create HMAC SHA256
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(manifest);
  const expectedHash = hmac.digest("hex");

  // Compare hashes (constant-time comparison)
  // Ensure both buffers have the same length before comparing
  const hashBuffer = Buffer.from(hash);
  const expectedBuffer = Buffer.from(expectedHash);

  if (hashBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(hashBuffer, expectedBuffer);
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
