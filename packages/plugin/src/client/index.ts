/**
 * better-auth-mercadopago - Client Proxy
 *
 * Client-side API for MercadoPago operations
 * This is what developers use in their applications
 */

import type {
  MercadopagoPayment,
  MercadopagoSubscription,
  MercadopagoPlan,
  CreatePaymentInput,
  CreateSubscriptionInput,
  CreatePlanInput,
  SubscribeToPlanInput,
  PaymentFilters,
  SubscriptionFilters,
  CreatePaymentResult,
  CreateSubscriptionResult,
  CreatePlanResult,
  GetPaymentsResult,
  GetSubscriptionsResult,
} from "../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Get the base URL for API calls
 */
const getBaseUrl = (): string => {
  if ((globalThis as any).window !== undefined) {
    return (globalThis as any).window.location.origin;
  }
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
};

/**
 * Create the client API for MercadoPago
 *
 * @example
 * ```typescript
 * import { createMercadopagoClient } from "better-auth-mercadopago/client"
 *
 * const mercadopago = createMercadopagoClient(authClient)
 *
 * // Create a payment
 * const result = await mercadopago.createPayment({
 *   items: [{ id: "prod_1", title: "Product", quantity: 1, unitPrice: 1500 }],
 *   email: "user@test.com"
 * })
 *
 * // Redirect user
 * window.location.href = result.paymentLink
 * ```
 */
export function createMercadopagoClient(authClient: {
  api: {
    get: (path: string) => Promise<{ data: unknown }>;
    post: (
      path: string,
      body?: Record<string, unknown>
    ) => Promise<{ data: unknown }>;
  };
  getSession: () => Promise<{ data: { user: { id: string } } | null }>;
}) {
  const baseUrl = getBaseUrl();

  /**
   * Create a payment and get the payment link
   */
  const createPayment = async (
    input: CreatePaymentInput
  ): Promise<CreatePaymentResult> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/payments`,
      {
        ...input,
      }
    );
    return response.data as CreatePaymentResult;
  };

  /**
   * Get a payment by ID
   */
  const getPayment = async (
    paymentId: string
  ): Promise<MercadopagoPayment | null> => {
    const response = await authClient.api.get(
      `${baseUrl}/api/mercadopago/payments/${paymentId}`
    );
    return (response.data as { payment: MercadopagoPayment | null }).payment;
  };

  /**
   * Get payments list with filters
   */
  const getPayments = async (
    filters?: PaymentFilters
  ): Promise<GetPaymentsResult> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {params.set("status", filters.status);}
      if (filters.startDate)
        {params.set("startDate", filters.startDate.toISOString());}
      if (filters.endDate) {params.set("endDate", filters.endDate.toISOString());}
      if (filters.minAmount)
        {params.set("minAmount", filters.minAmount.toString());}
      if (filters.maxAmount)
        {params.set("maxAmount", filters.maxAmount.toString());}
      if (filters.sortBy) {params.set("sortBy", filters.sortBy);}
      if (filters.sortOrder) {params.set("sortOrder", filters.sortOrder);}
      if (filters.limit) {params.set("limit", filters.limit.toString());}
      if (filters.cursor) {params.set("cursor", filters.cursor);}
    }

    const url = `${baseUrl}/api/mercadopago/payments${params.toString() ? `?${params}` : ""}`;
    const response = await authClient.api.get(url);
    return response.data as GetPaymentsResult;
  };

  /**
   * Create a subscription and get the subscription link
   */
  const createSubscription = async (
    input: CreateSubscriptionInput
  ): Promise<CreateSubscriptionResult> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/subscriptions`,
      {
        ...input,
      }
    );
    return response.data as CreateSubscriptionResult;
  };

  /**
   * Subscribe to an existing plan
   */
  const subscribeToPlan = async (
    input: SubscribeToPlanInput
  ): Promise<CreateSubscriptionResult> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/subscriptions/from-plan`,
      {
        ...input,
      }
    );
    return response.data as CreateSubscriptionResult;
  };

  /**
   * Get a subscription by ID
   */
  const getSubscription = async (
    subscriptionId: string
  ): Promise<MercadopagoSubscription | null> => {
    const response = await authClient.api.get(
      `${baseUrl}/api/mercadopago/subscriptions/${subscriptionId}`
    );
    return (response.data as { subscription: MercadopagoSubscription | null })
      .subscription;
  };

  /**
   * Get subscriptions list with filters
   */
  const getSubscriptions = async (
    filters?: SubscriptionFilters
  ): Promise<GetSubscriptionsResult> => {
    const params = new URLSearchParams();
    if (filters) {
      if (filters.status) {params.set("status", filters.status);}
      if (filters.planId) {params.set("planId", filters.planId);}
      if (filters.limit) {params.set("limit", filters.limit.toString());}
      if (filters.cursor) {params.set("cursor", filters.cursor);}
    }

    const url = `${baseUrl}/api/mercadopago/subscriptions${params.toString() ? `?${params}` : ""}`;
    const response = await authClient.api.get(url);
    return response.data as GetSubscriptionsResult;
  };

  /**
   * Cancel a subscription
   */
  const cancelSubscription = async (
    subscriptionId: string
  ): Promise<{ success: boolean }> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/subscriptions/${subscriptionId}/cancel`
    );
    return response.data as { success: boolean };
  };

  /**
   * Pause a subscription
   */
  const pauseSubscription = async (
    subscriptionId: string
  ): Promise<{ success: boolean }> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/subscriptions/${subscriptionId}/pause`
    );
    return response.data as { success: boolean };
  };

  /**
   * Resume a paused subscription
   */
  const resumeSubscription = async (
    subscriptionId: string
  ): Promise<{ success: boolean }> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/subscriptions/${subscriptionId}/resume`
    );
    return response.data as { success: boolean };
  };

  /**
   * Create a plan (admin operation)
   */
  const createPlan = async (
    input: CreatePlanInput
  ): Promise<CreatePlanResult> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/plans`,
      {
        ...input,
      }
    );
    return response.data as CreatePlanResult;
  };

  /**
   * Get all plans
   */
  const getPlans = async (): Promise<{ plans: MercadopagoPlan[] }> => {
    const response = await authClient.api.get(
      `${baseUrl}/api/mercadopago/plans`
    );
    return response.data as { plans: MercadopagoPlan[] };
  };

  /**
   * Delete a plan (admin operation)
   */
  const deletePlan = async (planId: string): Promise<{ success: boolean }> => {
    const response = await authClient.api.post(
      `${baseUrl}/api/mercadopago/plans/${planId}/delete`
    );
    return response.data as { success: boolean };
  };

  return {
    // Payments
    createPayment,
    getPayment,
    getPayments,

    // Subscriptions
    createSubscription,
    subscribeToPlan,
    getSubscription,
    getSubscriptions,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,

    // Plans (admin)
    createPlan,
    getPlans,
    deletePlan,
  };
}

/**
 * Type for the client API
 */
export type MercadopagoClient = ReturnType<typeof createMercadopagoClient>;
