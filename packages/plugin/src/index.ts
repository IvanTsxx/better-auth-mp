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
          amount: { required: true, type: "number" },
          approvedAt: { required: false, type: "date" },
          commissionAmount: { required: false, type: "number" },
          currency: { required: true, type: "string" },
          externalReference: { required: false, type: "string" },
          items: { required: true, type: "json" },
          metadata: { required: false, type: "json" },
          mpPaymentId: { required: true, type: "string" },
          netAmount: { required: false, type: "number" },
          paymentLink: { required: false, type: "string" },
          paymentMethod: { required: false, type: "string" },
          sellerEmail: { required: false, type: "string" },
          splitEnabled: { required: false, type: "boolean" },
          status: { required: true, type: "string" },
          transactionId: { required: false, type: "string" },
          userId: { required: true, type: "string" },
        },
      },
      // Subscription table
      mercadoPagoSubscription: {
        fields: {
          amount: { required: true, type: "number" },
          commissionAmount: { required: false, type: "number" },
          currency: { required: true, type: "string" },
          endDate: { required: false, type: "date" },
          frequency: { required: true, type: "number" },
          frequencyType: { required: true, type: "string" },
          items: { required: true, type: "json" },
          mpSubscriptionId: { required: true, type: "string" },
          nextBillingDate: { required: false, type: "date" },
          planId: { required: false, type: "string" },
          sellerEmail: { required: false, type: "string" },
          splitEnabled: { required: false, type: "boolean" },
          startDate: { required: false, type: "date" },
          status: { required: true, type: "string" },
          userId: { required: true, type: "string" },
        },
      },
      // Plan table
      mercadoPagoPlan: {
        fields: {
          amount: { required: true, type: "number" },
          currency: { required: true, type: "string" },
          description: { required: false, type: "string" },
          frequency: { required: true, type: "number" },
          frequencyType: { required: true, type: "string" },
          isActive: { required: false, type: "boolean" },
          items: { required: true, type: "json" },
          mpPlanId: { required: true, type: "string" },
          name: { required: true, type: "string" },
        },
      },
      // Split/Marketplace table
      mercadoPagoSplit: {
        fields: {
          commissionAmount: { required: true, type: "number" },
          items: { required: true, type: "json" },
          netAmount: { required: true, type: "number" },
          paidAt: { required: false, type: "date" },
          paymentId: { required: false, type: "string" },
          sellerEmail: { required: true, type: "string" },
          status: { required: true, type: "string" },
          subscriptionId: { required: false, type: "string" },
          totalAmount: { required: true, type: "number" },
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
