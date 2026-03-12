/**
 * better-auth-mercadopago - TypeScript Types
 *
 * Complete type definitions for the MercadoPago plugin
 */

import type { BetterAuthPlugin } from "better-auth";

/**
 * Item structure for payments and subscriptions
 * This is the CORE type that developers pass for all operations
 */
export interface MercadopagoItem {
  /** Unique identifier for the item */
  id: string;
  /** Item title */
  title: string;
  /** Item description */
  description?: string;
  /** Quantity being purchased */
  quantity: number;
  /** Unit price in cents */
  unitPrice: number;
  /** URL for item image */
  pictureUrl?: string;
  /** Category ID for the item */
  categoryId?: string;
}

/**
 * Payment method types supported by MercadoPago
 */
export type PaymentMethodType =
  | "card"
  | "debit_card"
  | "pix"
  | "ticket"
  | "bank_transfer";

/**
 * Payment status from MercadoPago
 */
export type PaymentStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "in_process"
  | "in_mediation";

/**
 * Subscription status from MercadoPago
 */
export type SubscriptionStatus =
  | "pending"
  | "authorized"
  | "paused"
  | "cancelled"
  | "expired"
  | "deleted";

/**
 * Frequency types for subscriptions
 */
export type FrequencyType = "days" | "weeks" | "months" | "years";

/**
 * Commission types for marketplace/split payments
 */
export type CommissionType = "percentage" | "fixed";

/**
 * Supported countries
 */
export type CountryCode = "AR" | "BR" | "MX" | "CL" | "CO" | "PE" | "UY";

/**
 * Supported currencies by country
 */
export const COUNTRY_CURRENCIES: Record<CountryCode, string> = {
  AR: "ARS",
  BR: "BRL",
  CL: "CLP",
  CO: "COP",
  MX: "MXN",
  PE: "PEN",
  UY: "UYU",
} as const;

/**
 * Filters for querying payments
 */
export interface PaymentFilters {
  /** Filter by payment status */
  status?: PaymentStatus;
  /** Filter by start date */
  startDate?: Date;
  /** Filter by end date */
  endDate?: Date;
  /** Minimum amount in cents */
  minAmount?: number;
  /** Maximum amount in cents */
  maxAmount?: number;
  /** Sort field */
  sortBy?: "date" | "amount";
  /** Sort order */
  sortOrder?: "asc" | "desc";
  /** Pagination cursor */
  cursor?: string;
  /** Number of items per page */
  limit?: number;
}

/**
 * Filters for querying subscriptions
 */
export interface SubscriptionFilters {
  /** Filter by subscription status */
  status?: SubscriptionStatus;
  /** Filter by plan ID */
  planId?: string;
  /** Pagination cursor */
  cursor?: string;
  /** Number of items per page */
  limit?: number;
}

/**
 * Input for creating a payment
 */
export interface CreatePaymentInput {
  /** Array of items being purchased - REQUIRED */
  items: MercadopagoItem[];
  /** Payer email */
  email: string;
  /** Payer ID (optional) */
  payerId?: string;
  /** Payment method preference */
  paymentMethod?: PaymentMethodType[];
  /** External reference (your internal ID) */
  externalReference?: string;
  /** Enable split/marketplace payment */
  splitEnabled?: boolean;
  /** Seller email for split payments */
  sellerEmail?: string;
  /** Additional metadata */
  metadata?: Record<string, string>;
  /** Notification URL for webhook */
  notificationUrl?: string;
}

/**
 * Input for creating a subscription (without plan)
 */
export interface CreateSubscriptionInput {
  /** Array of items - REQUIRED */
  items: MercadopagoItem[];
  /** Currency code */
  currency: string;
  /** Billing frequency */
  frequency: number;
  /** Frequency type */
  frequencyType: FrequencyType;
  /** Subscription start date */
  startDate?: Date;
  /** Subscription end date */
  endDate?: Date;
  /** Payer email */
  email?: string;
  /** External reference */
  externalReference?: string;
  /** Notification URL */
  notificationUrl?: string;
}

/**
 * Input for creating a plan
 */
export interface CreatePlanInput {
  /** Array of items for the plan - REQUIRED */
  items: MercadopagoItem[];
  /** Plan name */
  name: string;
  /** Currency code */
  currency: string;
  /** Billing frequency */
  frequency: number;
  /** Frequency type */
  frequencyType: FrequencyType;
  /** Description */
  description?: string;
  /** Billing day of month (1-31) */
  billingDay?: number;
}

/**
 * Input for subscribing to an existing plan
 */
export interface SubscribeToPlanInput {
  /** The plan ID from MercadoPago */
  planId: string;
  /** Payer email */
  email?: string;
  /** External reference */
  externalReference?: string;
}

/**
 * Payment entity returned to developer
 */
export interface MercadopagoPayment {
  id: string;
  mpPaymentId: string;
  userId: string;
  items: MercadopagoItem[];
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  externalReference?: string;
  metadata?: Record<string, string>;
  transactionId?: string;
  paymentLink?: string;
  splitEnabled: boolean;
  sellerEmail?: string;
  commissionAmount?: number;
  netAmount?: number;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Subscription entity returned to developer
 */
export interface MercadopagoSubscription {
  id: string;
  mpSubscriptionId: string;
  userId: string;
  items: MercadopagoItem[];
  planId?: string;
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: FrequencyType;
  status: SubscriptionStatus;
  splitEnabled: boolean;
  sellerEmail?: string;
  commissionAmount?: number;
  startDate?: Date;
  endDate?: Date;
  nextBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Plan entity
 */
export interface MercadopagoPlan {
  id: string;
  mpPlanId: string;
  items: MercadopagoItem[];
  name: string;
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: FrequencyType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Split/Marketplace payment entity
 */
export interface MarketplaceSplitPayment {
  id: string;
  paymentId: string;
  subscriptionId?: string;
  sellerEmail: string;
  items: MercadopagoItem[];
  totalAmount: number;
  commissionAmount: number;
  netAmount: number;
  status: PaymentStatus;
  paidAt?: Date;
  createdAt: Date;
}

/**
 * Callback context for payment events
 */
export interface PaymentCallbackContext {
  payment: MercadopagoPayment;
  userId: string;
  items: MercadopagoItem[];
}

/**
 * Callback context for subscription events
 */
export interface SubscriptionCallbackContext {
  subscription: MercadopagoSubscription;
  userId: string;
  items: MercadopagoItem[];
}

/**
 * Callback type for payment events
 */
export type PaymentCallback = (
  context: PaymentCallbackContext
) => Promise<void>;

/**
 * Callback type for subscription events
 */
export type SubscriptionCallback = (
  context: SubscriptionCallbackContext
) => Promise<void>;

/**
 * Hooks configuration for the plugin
 */
export interface MercadopagoHooks {
  /** Called when a payment is created */
  onPaymentCreated?: PaymentCallback;
  /** Called when payment status is updated */
  onPaymentUpdated?: PaymentCallback;
  /** Called when payment is approved */
  onPaymentApproved?: PaymentCallback;
  /** Called when payment is rejected */
  onPaymentRejected?: PaymentCallback;
  /** Called when payment is pending */
  onPaymentPending?: PaymentCallback;
  /** Called when payment is refunded */
  onPaymentRefunded?: PaymentCallback;
  /** Called when payment is cancelled */
  onPaymentCancelled?: PaymentCallback;

  /** Called when subscription is created */
  onSubscriptionCreated?: SubscriptionCallback;
  /** Called when subscription status is updated */
  onSubscriptionUpdated?: SubscriptionCallback;
  /** Called when subscription is activated */
  onSubscriptionActivated?: SubscriptionCallback;
  /** Called when subscription is paused */
  onSubscriptionPaused?: SubscriptionCallback;
  /** Called when subscription is cancelled */
  onSubscriptionCancelled?: SubscriptionCallback;
  /** Called when subscription expires */
  onSubscriptionExpired?: SubscriptionCallback;
}

/**
 * Split/Marketplace configuration
 */
export interface MercadopagoSplitConfig {
  /** Enable split payments */
  enabled: boolean;
  /** Your MercadoPago account email (receiver) */
  receiverEmail: string;
  /** Commission type */
  commissionType: CommissionType;
  /** Commission value (percentage or fixed amount in cents) */
  commissionValue: number;
}

/**
 * Checkout configuration
 */
export interface MercadopagoCheckoutConfig {
  /** URL to redirect after successful payment */
  redirectAfterSuccess?: string;
  /** URL to redirect after failed payment */
  redirectAfterFailure?: string;
  /** Custom notification URL for webhooks */
  notificationUrl?: string;
}

/**
 * Schema customization options
 */
export interface MercadopagoSchemaConfig {
  /** Custom table name for payments */
  paymentTableName?: string;
  /** Custom table name for subscriptions */
  subscriptionTableName?: string;
  /** Custom table name for plans */
  planTableName?: string;
  /** Custom table name for splits */
  splitTableName?: string;
}

/**
 * Main plugin configuration options
 */
export interface MercadopagoPluginConfig {
  /** MercadoPago Access Token */
  accessToken: string;
  /** Default currency (default: ARS) */
  defaultCurrency?: string;
  /** Country code (default: AR) */
  country?: CountryCode;
  /** Split/Marketplace configuration */
  split?: MercadopagoSplitConfig;
  /** Callback hooks */
  hooks?: MercadopagoHooks;
  /** Checkout configuration */
  checkout?: MercadopagoCheckoutConfig;
  /** Schema customization */
  schema?: MercadopagoSchemaConfig;
}

/**
 * Payment creation result returned to client
 */
export interface CreatePaymentResult {
  /** The payment ID in our database */
  paymentId: string;
  /** The MercadoPago payment ID */
  mpPaymentId: string;
  /** URL to redirect user for payment */
  paymentLink: string;
  /** Status of the created payment */
  status: PaymentStatus;
}

/**
 * Subscription creation result
 */
export interface CreateSubscriptionResult {
  /** The subscription ID in our database */
  subscriptionId: string;
  /** The MercadoPago subscription ID */
  mpSubscriptionId: string;
  /** URL to redirect user for payment */
  subscriptionLink: string;
  /** Status of the created subscription */
  status: SubscriptionStatus;
}

/**
 * Plan creation result
 */
export interface CreatePlanResult {
  /** The plan ID in our database */
  planId: string;
  /** The MercadoPago plan ID */
  mpPlanId: string;
}

/**
 * Get payments list result
 */
export interface GetPaymentsResult {
  /** Array of payments */
  payments: MercadopagoPayment[];
  /** Next page cursor */
  nextCursor?: string;
  /** Total count */
  totalCount: number;
}

/**
 * Get subscriptions list result
 */
export interface GetSubscriptionsResult {
  /** Array of subscriptions */
  subscriptions: MercadopagoSubscription[];
  /** Next page cursor */
  nextCursor?: string;
  /** Total count */
  totalCount: number;
}

/**
 * Plugin instance type
 */
export interface MercadopagoPlugin extends ReturnType<
  typeof mercadopagoPlugin
> {}

/**
 * Create the MercadoPago plugin for better-auth
 */
export function mercadopagoPlugin(
  _config: MercadopagoPluginConfig
): BetterAuthPlugin {
  // This will be implemented in index.ts
  return {
    id: "mercadopago",
    // schema, endpoints, etc. will be added here
  } as BetterAuthPlugin;
}

export { mercadopagoPlugin as mercadopago };
