/**
 * better-auth-mercadopago - Main Entry Point
 *
 * Plugin entry that integrates MercadoPago with better-auth
 */

import type { BetterAuthPlugin } from "better-auth";

import type { MercadopagoPluginConfig } from "./types";

/**
 * Create the MercadoPago plugin for better-auth
 *
 * @example
 * ```typescript
 * import { betterAuth } from "better-auth"
 * import { mercadopagoPlugin } from "better-auth-mercadopago"
 *
 * export const auth = betterAuth({
 *   plugins: [
 *     mercadopagoPlugin({
 *       accessToken: process.env.MP_ACCESS_TOKEN!,
 *       country: "AR",
 *       hooks: {
 *         onPaymentApproved: async ({ payment, userId, items }) => {
 *           // Grant access to purchased items
 *         }
 *       }
 *     })
 *   ]
 * })
 * ```
 */
export function mercadopagoPlugin(
  _config: MercadopagoPluginConfig
): BetterAuthPlugin {
  return {
    id: "mercadopago",

    /**
     * Database schema extensions
     * Extends the database with MercadoPago tables
     */
    schema: {
      // Payment table
      mercadoPagoPayment: {
        fields: {
          amount: { type: "number", required: true },
          approvedAt: { type: "date", required: false },
          commissionAmount: { type: "number", required: false },
          currency: { type: "string", required: true },
          externalReference: { type: "string", required: false },
          items: { type: "json", required: true },
          metadata: { type: "json", required: false },
          mpPaymentId: { type: "string", required: true },
          netAmount: { type: "number", required: false },
          paymentLink: { type: "string", required: false },
          paymentMethod: { type: "string", required: false },
          sellerEmail: { type: "string", required: false },
          splitEnabled: { type: "boolean", required: false },
          status: { type: "string", required: true },
          transactionId: { type: "string", required: false },
          userId: { type: "string", required: true },
        },
      },
      // Subscription table
      mercadoPagoSubscription: {
        fields: {
          amount: { type: "number", required: true },
          commissionAmount: { type: "number", required: false },
          currency: { type: "string", required: true },
          endDate: { type: "date", required: false },
          frequency: { type: "number", required: true },
          frequencyType: { type: "string", required: true },
          items: { type: "json", required: true },
          mpSubscriptionId: { type: "string", required: true },
          nextBillingDate: { type: "date", required: false },
          planId: { type: "string", required: false },
          sellerEmail: { type: "string", required: false },
          splitEnabled: { type: "boolean", required: false },
          startDate: { type: "date", required: false },
          status: { type: "string", required: true },
          userId: { type: "string", required: true },
        },
      },
      // Plan table
      mercadoPagoPlan: {
        fields: {
          amount: { type: "number", required: true },
          currency: { type: "string", required: true },
          description: { type: "string", required: false },
          frequency: { type: "number", required: true },
          frequencyType: { type: "string", required: true },
          isActive: { type: "boolean", required: false },
          items: { type: "json", required: true },
          mpPlanId: { type: "string", required: true },
          name: { type: "string", required: true },
        },
      },
      // Split/Marketplace table
      mercadoPagoSplit: {
        fields: {
          commissionAmount: { type: "number", required: true },
          items: { type: "json", required: true },
          netAmount: { type: "number", required: true },
          paidAt: { type: "date", required: false },
          paymentId: { type: "string", required: false },
          sellerEmail: { type: "string", required: true },
          status: { type: "string", required: true },
          subscriptionId: { type: "string", required: false },
          totalAmount: { type: "number", required: true },
        },
      },
    },
  };
}

// Re-export types
export type {
  MercadopagoPluginConfig,
  MercadopagoItem,
  MercadopagoPayment,
  MercadopagoSubscription,
  MercadopagoPlan,
  MarketplaceSplitPayment,
  CreatePaymentInput,
  CreateSubscriptionInput,
  CreatePlanInput,
  SubscribeToPlanInput,
  PaymentFilters,
  SubscriptionFilters,
  GetPaymentsResult,
  GetSubscriptionsResult,
  CreatePaymentResult,
  CreateSubscriptionResult,
  CreatePlanResult,
  PaymentCallback,
  SubscriptionCallback,
  MercadopagoHooks,
  MercadopagoSplitConfig,
  MercadopagoCheckoutConfig,
  MercadopagoSchemaConfig,
  PaymentMethodType,
  PaymentStatus,
  SubscriptionStatus,
  FrequencyType,
  CommissionType,
  CountryCode,
} from "./types";
