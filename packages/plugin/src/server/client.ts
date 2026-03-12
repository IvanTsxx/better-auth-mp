/**
 * better-auth-mercadopago - MercadoPago SDK Client
 *
 * Wrapper around MercadoPago SDK for server-side operations
 */

import type {
  MercadopagoItem,
  MercadopagoPlan,
  CreatePaymentInput,
  CreateSubscriptionInput,
  CreatePlanInput,
  SubscribeToPlanInput,
  PaymentStatus,
  SubscriptionStatus,
  MercadopagoSplitConfig,
} from "../types";

/**
 * MercadoPago client configuration
 */
export interface MPClientConfig {
  accessToken: string;
  country?: string;
}

/**
 * Create a MercadoPago client instance
 *
 * @example
 * ```typescript
 * import { createMPClient } from "better-auth-mercadopago/server"
 *
 * const mp = createMPClient({
 *   accessToken: process.env.MP_ACCESS_TOKEN!,
 *   country: "AR"
 * })
 * ```
 */
export function createMPClient(config: MPClientConfig) {
  // Initialize MercadoPago SDK
  const mp = new (require("mercadopago"))(config.accessToken);

  /**
   * Calculate total amount from items
   */
  const calculateTotal = (items: MercadopagoItem[]): number => items.reduce((total, item) => {
      return total + item.unitPrice * item.quantity;
    }, 0);

  /**
   * Convert items to MercadoPago preference items format
   */
  const toMPItems = (items: MercadopagoItem[]) => items.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice / 100, // Convert cents to currency unit
      picture_url: item.pictureUrl,
      category_id: item.categoryId,
    }));

  /**
   * Create a payment preference
   */
  const createPayment = async (
    input: CreatePaymentInput,
    splitConfig?: MercadopagoSplitConfig
  ) => {
    const total = calculateTotal(input.items);

    // Build payment data
    const paymentData: Record<string, unknown> = {
      transaction_amount: total / 100, // Convert cents to currency unit
      description: input.items.map((i) => i.title).join(", "),
      payment_method_id: input.paymentMethod?.[0],
      payer: {
        email: input.email,
      },
      external_reference: input.externalReference,
      notification_url: input.notificationUrl,
      items: toMPItems(input.items),
    };

    // Add split payments if enabled
    if (input.splitEnabled && splitConfig?.enabled) {
      const commissionAmount =
        splitConfig.commissionType === "percentage"
          ? Math.round(total * (splitConfig.commissionValue / 100))
          : splitConfig.commissionValue;

      const netAmount = total - commissionAmount;

      // Use marketplace/collector structure
      paymentData.marketplace = {
        marketplace_fee: commissionAmount / 100,
      };

      // Add collector for split
      paymentData.metadata = {
        ...input.metadata,
        commission_amount: commissionAmount.toString(),
        net_amount: netAmount.toString(),
        seller_email: input.sellerEmail,
        split_enabled: "true",
      };
    }

    const payment = await mp.payment.create(paymentData);

    return {
      amount: total,
      mpPaymentId: payment.body.id?.toString() || "",
      paymentLink:
        payment.body.transaction_details?.external_resource_url ||
        payment.body.point_of_interaction?.transaction_data?.ticket_url ||
        "",
      status: mapPaymentStatus(payment.body.status),
    };
  };

  /**
   * Create a subscription (preapproval)
   */
  const createSubscription = async (input: CreateSubscriptionInput) => {
    const total = calculateTotal(input.items);

    const subscriptionData = {
      auto_recurring: {
        frequency: input.frequency,
        frequency_type: input.frequencyType,
        transaction_amount: total / 100,
        currency_id: input.currency,
        start_date: input.startDate?.toISOString(),
        end_date: input.endDate?.toISOString(),
      },
      back_url: process.env.MP_BACK_URL || "https://yourapp.com",
      external_reference: input.externalReference,
      payer_email: input.email,
      reason: input.items.map((i) => i.title).join(", "),
    };

    const subscription = await mp.preapproval.create(subscriptionData);

    return {
      amount: total,
      mpSubscriptionId: subscription.body.id?.toString() || "",
      status: mapSubscriptionStatus(subscription.body.status),
      subscriptionLink: subscription.body.init_point || "",
    };
  };

  /**
   * Subscribe to an existing plan
   */
  const subscribeToPlan = async (
    input: SubscribeToPlanInput,
    planDetails: MercadopagoPlan
  ) => {
    const subscriptionData = {
      back_url: process.env.MP_BACK_URL || "https://yourapp.com",
      external_reference: input.externalReference,
      payer_email: input.email,
      preapproval_plan_id: input.planId,
      reason: planDetails.name,
    };

    const subscription = await mp.preapproval.create(subscriptionData);

    return {
      amount: planDetails.amount,
      mpSubscriptionId: subscription.body.id?.toString() || "",
      status: mapSubscriptionStatus(subscription.body.status),
      subscriptionLink: subscription.body.init_point || "",
    };
  };

  /**
   * Create a plan
   */
  const createPlan = async (input: CreatePlanInput) => {
    const total = calculateTotal(input.items);

    const planData = {
      auto_recurring: {
        frequency: input.frequency,
        frequency_type: input.frequencyType,
        transaction_amount: total / 100,
        currency_id: input.currency,
        billing_day: input.billingDay,
      },
      description:
        input.description || input.items.map((i) => i.title).join(", "),
      title: input.name,
    };

    const plan = await mp.plan.create(planData);

    return {
      amount: total,
      mpPlanId: plan.body.id?.toString() || "",
    };
  };

  /**
   * Get a payment by ID
   */
  const getPayment = async (paymentId: string) => {
    const payment = await mp.payment.get(paymentId);

    return {
      amount: (payment.body.transaction_amount || 0) * 100,
      approvedAt: payment.body.date_approved
        ? new Date(payment.body.date_approved)
        : undefined,
      currency: payment.body.currency_id || "ARS",
      externalReference: payment.body.external_reference,
      mpPaymentId: payment.body.id?.toString() || "",
      paymentMethod: payment.body.payment_method_id,
      status: mapPaymentStatus(payment.body.status),
      transactionId: payment.body.transaction_id?.toString(),
    };
  };

  /**
   * Get a subscription by ID
   */
  const getSubscription = async (subscriptionId: string) => {
    const subscription = await mp.preapproval.get(subscriptionId);

    return {
      amount: (subscription.body.auto_recurring?.transaction_amount || 0) * 100,
      currency: subscription.body.currency_id || "ARS",
      endDate: subscription.body.end_date
        ? new Date(subscription.body.end_date)
        : undefined,
      frequency: subscription.body.auto_recurring?.frequency || 1,
      frequencyType:
        subscription.body.auto_recurring?.frequency_type || "months",
      mpSubscriptionId: subscription.body.id?.toString() || "",
      nextBillingDate: subscription.body.next_payment_date
        ? new Date(subscription.body.next_payment_date)
        : undefined,
      startDate: subscription.body.start_date
        ? new Date(subscription.body.start_date)
        : undefined,
      status: mapSubscriptionStatus(subscription.body.status),
    };
  };

  /**
   * Cancel a subscription
   */
  const cancelSubscription = async (subscriptionId: string) => {
    await mp.preapproval.update({
      id: subscriptionId,
      status: "cancelled",
    });
  };

  /**
   * Pause a subscription
   */
  const pauseSubscription = async (subscriptionId: string) => {
    await mp.preapproval.update({
      id: subscriptionId,
      status: "paused",
    });
  };

  /**
   * Resume a paused subscription
   */
  const resumeSubscription = async (subscriptionId: string) => {
    await mp.preapproval.update({
      id: subscriptionId,
      status: "authorized",
    });
  };

  /**
   * Delete a plan
   */
  const deletePlan = async (planId: string) => {
    await mp.plan.del(planId);
  };

  return {
    calculateTotal,
    cancelSubscription,
    createPayment,
    createPlan,
    createSubscription,
    deletePlan,
    getPayment,
    getSubscription,
    pauseSubscription,
    resumeSubscription,
    subscribeToPlan,
  };
}

/**
 * Map MP payment status to our status type
 */
function mapPaymentStatus(status: string | undefined): PaymentStatus {
  const statusMap: Record<string, PaymentStatus> = {
    approved: "approved",
    cancelled: "cancelled",
    in_mediation: "in_mediation",
    in_process: "in_process",
    pending: "pending",
    refunded: "refunded",
    rejected: "rejected",
  };
  return statusMap[status || ""] || "pending";
}

/**
 * Map MP subscription status to our status type
 */
function mapSubscriptionStatus(status: string | undefined): SubscriptionStatus {
  const statusMap: Record<string, SubscriptionStatus> = {
    authorized: "authorized",
    cancelled: "cancelled",
    deleted: "deleted",
    expired: "expired",
    paused: "paused",
    pending: "pending",
  };
  return statusMap[status || ""] || "pending";
}

// Export type for client
export type MPClient = ReturnType<typeof createMPClient>;
