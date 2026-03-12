/**
 * better-auth-mercadopago - Webhook Handler
 *
 * Processes MercadoPago webhook notifications
 */

import type {
  MercadopagoPayment,
  MercadopagoSubscription,
  MercadopagoItem,
  PaymentStatus,
  SubscriptionStatus,
  MercadopagoHooks,
} from "../types";

/**
 * Webhook payload from MercadoPago
 */
export interface MPWebhookPayload {
  type: string;
  data: {
    id: string;
  };
  date_created: string;
}

/**
 * Payment data from webhook
 */
export interface MPPaymentWebhookData {
  id: string;
  status: string;
  status_detail: string;
  payment_method_id: string;
  transaction_amount: number;
  currency_id: string;
  external_reference: string;
  date_approved: string | null;
  date_created: string;
  last_modified: string;
}

/**
 * Subscription data from webhook
 */
export interface MPSubscriptionWebhookData {
  id: string;
  status: string;
  auto_recurring: {
    frequency: number;
    frequency_type: string;
    transaction_amount: number;
    currency_id: string;
  } | null;
  start_date: string | null;
  end_date: string | null;
  next_payment_date: string | null;
}

/**
 * Webhook handler config
 */
export interface WebhookHandlerConfig {
  webhookSecret?: string;
  hooks?: MercadopagoHooks;
  /**
   * Function to find user by external reference or payment data
   */
  findUserByPayment?: (data: MPPaymentWebhookData) => Promise<string | null>;
  /**
   * Function to find user by subscription data
   */
  findUserBySubscription?: (
    data: MPSubscriptionWebhookData
  ) => Promise<string | null>;
  /**
   * Function to update payment in database
   */
  updatePayment?: (
    mpPaymentId: string,
    data: Partial<MercadopagoPayment>
  ) => Promise<void>;
  /**
   * Function to create payment in database
   */
  createPayment?: (data: CreatePaymentDBData) => Promise<string>;
  /**
   * Function to update subscription in database
   */
  updateSubscription?: (
    mpSubscriptionId: string,
    data: Partial<MercadopagoSubscription>
  ) => Promise<void>;
  /**
   * Function to create subscription in database
   */
  createSubscription?: (data: CreateSubscriptionDBData) => Promise<string>;
}

/**
 * Data needed to create payment in DB
 */
export interface CreatePaymentDBData {
  mpPaymentId: string;
  userId: string;
  items: MercadopagoItem[];
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  externalRef?: string;
  transactionId?: string;
  paymentLink?: string;
  approvedAt?: Date;
}

/**
 * Data needed to create subscription in DB
 */
export interface CreateSubscriptionDBData {
  mpSubscriptionId: string;
  userId: string;
  items: MercadopagoItem[];
  amount: number;
  currency: string;
  frequency: number;
  frequencyType: string;
  status: SubscriptionStatus;
  startDate?: Date;
  endDate?: Date;
  nextBillingDate?: Date;
}

/**
 * Create webhook handler
 *
 * @example
 * ```typescript
 * import { createWebhookHandler } from "better-auth-mercadopago/server"
 *
 * const handler = createWebhookHandler({
 *   hooks: {
 *     onPaymentApproved: async ({ payment, userId, items }) => {
 *       await grantAccess(userId, items)
 *     }
 *   },
 *   findUserByPayment: async (data) => {
 *     return await findUserByExternalRef(data.external_reference)
 *   },
 *   createPayment: async (data) => {
 *     return await db.mercadoPagoPayment.create({ data })
 *   },
 *   updatePayment: async (id, data) => {
 *     await db.mercadoPagoPayment.update({ where: { mpPaymentId: id }, data })
 *   }
 * })
 *
 * // Use in your API route
 * export async function POST(req: Request) {
 *   return handler(req)
 * }
 * ```
 */
export function createWebhookHandler(config: WebhookHandlerConfig) {
  /**
   * Process payment webhook
   */
  const processPayment = async (data: MPPaymentWebhookData): Promise<void> => {
    const status = mapPaymentStatus(data.status);

    // Find user
    const userId = await config.findUserByPayment?.(data);

    // Get items from external reference or metadata
    const items = await getItemsFromPayment(data);

    // Update or create payment in DB
    const existingPayment = await config.updatePayment?.(data.id, {
      approvedAt: data.date_approved ? new Date(data.date_approved) : undefined,
      paymentMethod: data.payment_method_id,
      status,
      transactionId: data.id,
    });

    if (!existingPayment && userId) {
      await config.createPayment?.({
        amount: Math.round(data.transaction_amount * 100),
        approvedAt: data.date_approved
          ? new Date(data.date_approved)
          : undefined,
        currency: data.currency_id,
        externalRef: data.external_reference,
        items,
        mpPaymentId: data.id,
        paymentMethod: data.payment_method_id,
        status,
        transactionId: data.id,
        userId,
      });
    }

    // Execute callbacks based on status
    const payment: MercadopagoPayment = {
      amount: Math.round(data.transaction_amount * 100),
      approvedAt: data.date_approved ? new Date(data.date_approved) : undefined,
      createdAt: new Date(data.date_created),
      currency: data.currency_id,
      externalReference: data.external_reference,
      id: data.id,
      items,
      mpPaymentId: data.id,
      paymentMethod: data.payment_method_id,
      splitEnabled: false,
      status,
      transactionId: data.id,
      updatedAt: new Date(data.last_modified),
      userId: userId || "",
    };

    await executePaymentCallback(status, payment, userId || null, items);
  };

  /**
   * Process subscription webhook
   */
  const processSubscription = async (
    data: MPSubscriptionWebhookData
  ): Promise<void> => {
    const status = mapSubscriptionStatus(data.status);

    // Find user
    const userId = await config.findUserBySubscription?.(data);

    // Get items from auto_recurring
    const items = getItemsFromSubscription(data);

    // Update subscription in DB
    await config.updateSubscription?.(data.id, {
      endDate: getDate(data.end_date),
      nextBillingDate: getDate(data.next_payment_date),
      status,
    });

    // Execute callbacks based on status
    const subscription: MercadopagoSubscription = {
      amount: data.auto_recurring
        ? Math.round(data.auto_recurring.transaction_amount * 100)
        : 0,
      createdAt: new Date(),
      currency: data.auto_recurring?.currency_id || "ARS",
      endDate: getDate(data.end_date),
      frequency: data.auto_recurring?.frequency || 1,
      frequencyType: getFrequencyType(
        data.auto_recurring?.frequency_type || "months"
      ),
      id: data.id,
      items,
      mpSubscriptionId: data.id,
      nextBillingDate: getDate(data.next_payment_date),
      splitEnabled: false,
      startDate: getDate(data.start_date),
      status,
      updatedAt: new Date(),
      userId: userId || "",
    };

    await executeSubscriptionCallback(
      status,
      subscription,
      userId || null,
      items
    );
  };

  /**
   * Execute payment callback based on status
   */
  const executePaymentCallback = async (
    status: PaymentStatus,
    payment: MercadopagoPayment,
    userId: string | null,
    items: MercadopagoItem[]
  ): Promise<void> => {
    if (!config.hooks) {
      return;
    }

    const { hooks } = config;
    const context = { items, payment, userId: userId || "" };

    switch (status) {
      case "approved": {
        await hooks.onPaymentApproved?.(context);
        await hooks.onPaymentUpdated?.(context);
        break;
      }
      case "rejected": {
        await hooks.onPaymentRejected?.(context);
        await hooks.onPaymentUpdated?.(context);
        break;
      }
      case "pending": {
        await hooks.onPaymentPending?.(context);
        await hooks.onPaymentUpdated?.(context);
        break;
      }
      case "refunded": {
        await hooks.onPaymentRefunded?.(context);
        break;
      }
      case "cancelled": {
        await hooks.onPaymentCancelled?.(context);
        break;
      }
      default: {
        await hooks.onPaymentUpdated?.(context);
      }
    }

    // Always trigger onPaymentCreated for new payments
    if (payment.approvedAt) {
      await hooks.onPaymentCreated?.(context);
    }
  };

  /**
   * Execute subscription callback based on status
   */
  const executeSubscriptionCallback = async (
    status: SubscriptionStatus,
    subscription: MercadopagoSubscription,
    userId: string | null,
    items: MercadopagoItem[]
  ): Promise<void> => {
    if (!config.hooks) {
      return;
    }

    const { hooks } = config;
    const context = { items, subscription, userId: userId || "" };

    switch (status) {
      case "authorized": {
        await hooks.onSubscriptionActivated?.(context);
        await hooks.onSubscriptionUpdated?.(context);
        break;
      }
      case "paused": {
        await hooks.onSubscriptionPaused?.(context);
        await hooks.onSubscriptionUpdated?.(context);
        break;
      }
      case "cancelled": {
        await hooks.onSubscriptionCancelled?.(context);
        await hooks.onSubscriptionUpdated?.(context);
        break;
      }
      case "expired": {
        await hooks.onSubscriptionExpired?.(context);
        break;
      }
      default: {
        await hooks.onSubscriptionUpdated?.(context);
      }
    }

    // Trigger created for new subscriptions
    await hooks.onSubscriptionCreated?.(context);
  };

  /**
   * Get items from payment data (placeholder - implement based on your needs)
   */
  const getItemsFromPayment = async (
    _data: MPPaymentWebhookData
  ): Promise<MercadopagoItem[]> => [];

  /**
   * Get items from subscription data
   */
  const getItemsFromSubscription = (
    _data: MPSubscriptionWebhookData
  ): MercadopagoItem[] => [];

  /**
   * Get frequency type safely
   */
  const getFrequencyType = (
    type: string | null | undefined
  ): "days" | "weeks" | "months" | "years" => {
    if (
      type === "days" ||
      type === "weeks" ||
      type === "months" ||
      type === "years"
    ) {
      return type;
    }
    return "months";
  };

  /**
   * Get date safely
   */
  const getDate = (dateStr: string | null | undefined): Date | undefined => {
    if (dateStr) {
      return new Date(dateStr);
    }
    return undefined;
  };

  /**
   * Main handler function
   */
  return async function handleWebhook(request: Request): Promise<Response> {
    try {
      // Verify webhook signature if secret is provided
      if (config.webhookSecret) {
        const signature = request.headers.get("x-signature");
        if (
          !signature ||
          !verifySignature(
            signature,
            await request.clone().text(),
            config.webhookSecret
          )
        ) {
          return new Response("Invalid signature", { status: 401 });
        }
      }

      const payload = (await request.json()) as MPWebhookPayload;

      switch (payload.type) {
        case "payment": {
          // Fetch full payment data from MP if needed
          await processPayment(payload.data as unknown as MPPaymentWebhookData);
          break;
        }
        case "subscription_preapproval": {
          await processSubscription(
            payload.data as unknown as MPSubscriptionWebhookData
          );
          break;
        }
        default: {
          console.log(`Unhandled webhook type: ${payload.type}`);
        }
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Webhook handler error:", error);
      return new Response("Error processing webhook", { status: 500 });
    }
  };
}

/**
 * Verify MercadoPago webhook signature
 */
function verifySignature(
  signature: string,
  body: string,
  secret: string
): boolean {
  // MercadoPago uses MD5 signature
  // Implement proper verification based on MP docs
  // For now, this is a placeholder
  const crypto = require("node:crypto");
  const hash = crypto
    .createHash("md5")
    .update(body + secret)
    .digest("hex");
  return hash === signature;
}

/**
 * Map MP payment status to our status type
 */
function mapPaymentStatus(status: string): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    approved: "approved",
    cancelled: "cancelled",
    in_mediation: "in_mediation",
    in_process: "in_process",
    pending: "pending",
    refunded: "refunded",
    rejected: "rejected",
  };
  return statusMap[status] || "pending";
}

/**
 * Map MP subscription status to our status type
 */
function mapSubscriptionStatus(status: string): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    authorized: "authorized",
    cancelled: "cancelled",
    deleted: "deleted",
    expired: "expired",
    paused: "paused",
    pending: "pending",
  };
  return statusMap[status] || "pending";
}

export type WebhookHandler = ReturnType<typeof createWebhookHandler>;
