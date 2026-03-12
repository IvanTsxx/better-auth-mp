import { APIError, createAuthEndpoint } from "better-auth/api";
import { Payment, PreApproval } from "mercadopago";
import type { MercadoPagoConfig } from "mercadopago";

import {
  rateLimiter,
  validatePaymentAmount,
  verifyWebhookSignature,
  idempotencyStore,
} from "../security";
import type {
  MercadoPagoPaymentNotification,
  MercadoPagoPaymentRecord,
  MercadoPagoPluginOptions,
  MercadoPagoSubscriptionRecord,
} from "../types";

export const createWebhookEndpoint = (
  client: MercadoPagoConfig,
  options: MercadoPagoPluginOptions
) => ({
  webhook: createAuthEndpoint(
    "/mercado-pago/webhook",
    {
      method: "POST",
      secured: false,
    },
    async (ctx) => {
      console.log(">>> MP WEBHOOK");

      const webhookRateLimitKey = "webhook:global";
      if (!rateLimiter.check(webhookRateLimitKey, 1000, 60 * 1000)) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message: "Webhook rate limit exceeded",
        });
      }

      // Get URL params - MercadoPago can send type in body or query params
      const url = ctx.request?.url || "";
      const urlParams = new URL(url, "http://localhost").searchParams;

      // Get notification type from body or query params
      const bodyType = (ctx.body as { type?: string })?.type;
      const queryType = urlParams.get("type");
      const notificationType = bodyType || queryType;

      console.log(">>> MP WEBHOOK notification type:", notificationType);

      // Handle subscription events: subscription_preapproval and subscription_authorized_payment
      if (
        notificationType === "subscription_preapproval" ||
        notificationType === "subscription_authorized_payment"
      ) {
        let notification: MercadoPagoPaymentNotification;
        try {
          notification = ctx.body;
        } catch {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid JSON payload",
          });
        }

        return await handleSubscriptionWebhook(
          ctx as unknown as {
            context: { adapter: unknown; logger: unknown };
            json: (data: unknown) => unknown;
          },
          notification,
          client,
          options
        );
      }

      // Handle payment events - get payment ID from body or query params
      const dataIdFromQuery = urlParams.get("data.id");
      const paymentIdFromBody = (ctx.body as { data?: { id?: string } })?.data
        ?.id;
      const paymentIdParam = dataIdFromQuery || paymentIdFromBody;

      if (!paymentIdParam) {
        return ctx.json({ received: true });
      }

      let notification: MercadoPagoPaymentNotification;
      try {
        notification = ctx.body;
      } catch {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid JSON payload",
        });
      }

      if (!ctx.request) {
        throw new APIError("BAD_REQUEST", {
          message: "Missing request",
        });
      }

      if (options.webhookSecret) {
        const xSignature = ctx.request.headers.get("x-signature");
        const xRequestId = ctx.request.headers.get("x-request-id");
        const dataId = notification.data.id.toString();

        console.log(">>> MP WEBHOOK X-SIGNATURE:", xSignature);
        console.log(">>> MP WEBHOOK X-REQUEST-ID:", xRequestId);
        console.log(">>> MP WEBHOOK DATA ID:", dataId);

        const isValid = verifyWebhookSignature({
          dataId,
          secret: options.webhookSecret,
          xRequestId,
          xSignature,
        });

        if (!isValid) {
          throw new APIError("UNAUTHORIZED", {
            message: "Invalid webhook signature",
          });
        }
      }

      // Use the payment idempotency key
      const webhookId = `mp:webhook:${notification.type}:${notification.data.id}`;
      if (idempotencyStore.get(webhookId)) {
        return ctx.json({ received: true });
      }
      idempotencyStore.set(webhookId, true, 24 * 60 * 60 * 1000);

      try {
        const paymentId = notification.data.id.toString();

        const mpPayment = await new Payment(client).get({
          id: paymentId,
        });

        const externalRef = mpPayment.external_reference;

        if (!externalRef) {
          ctx.context.logger.warn("Payment without external_reference", {
            paymentId,
          });
          return ctx.json({ received: true });
        }

        const existingPayment: MercadoPagoPaymentRecord | null =
          await ctx.context.adapter.findOne({
            model: "mercadoPagoPayment",
            where: [
              {
                field: "externalReference",
                value: externalRef,
              },
            ],
          });

        if (!existingPayment) {
          ctx.context.logger.warn("Payment not found by external_reference", {
            externalRef,
            paymentId,
          });
          return ctx.json({ received: true });
        }

        if (
          !validatePaymentAmount(
            existingPayment.amount,
            mpPayment.transaction_amount || 0
          )
        ) {
          throw new APIError("BAD_REQUEST", {
            message: "Payment amount mismatch",
          });
        }

        await ctx.context.adapter.update({
          model: "mercadoPagoPayment",
          update: {
            mercadoPagoPaymentId: paymentId,
            paymentMethodId: mpPayment.payment_method_id || undefined,
            paymentTypeId: mpPayment.payment_type_id || undefined,
            status: mpPayment.status,
            statusDetail: mpPayment.status_detail || undefined,
            updatedAt: new Date(),
          },
          where: [{ field: "id", value: existingPayment.id }],
        });

        if (options.onPaymentUpdate && mpPayment.status) {
          // Map MP status to payment result type for easier handling
          const paymentResultType = getPaymentResultType(mpPayment.status);

          await options.onPaymentUpdate({
            mpPayment,
            payment: existingPayment,
            resultType: paymentResultType,
            status: mpPayment.status,
            statusDetail: mpPayment.status_detail || "",
          });
        }
      } catch (error) {
        ctx.context.logger.error("Error processing MP webhook", {
          error,
          notification,
        });

        return ctx.json({ received: true });
      }

      return ctx.json({ received: true });
    }
  ),
});

/**
 * Handle subscription_preapproval webhook events
 */
async function handleSubscriptionWebhook(
  ctx: {
    context: { adapter: unknown; logger: unknown };
    json: (data: unknown) => unknown;
  },
  notification: MercadoPagoPaymentNotification,
  client: MercadoPagoConfig,
  options: MercadoPagoPluginOptions
) {
  console.log(">>> MP SUBSCRIPTION WEBHOOK:", notification);

  // For subscriptions, use only subscriptionId as key
  // We need to process all updates to check if status changed
  const webhookId = `mp:webhook:subscription:${notification.data.id}`;
  console.log(">>> Subscription webhook idempotency key:", webhookId);

  if (idempotencyStore.get(webhookId)) {
    console.log(
      ">>> Subscription webhook already processed once, checking status anyway..."
    );
  } else {
    idempotencyStore.set(webhookId, true, 24 * 60 * 60 * 1000);
  }

  try {
    const subscriptionId = notification.data.id.toString();

    const mpSubscription = await (
      new PreApproval(client) as unknown as {
        get: (config: { id: string }) => Promise<{
          id: string;
          status: string;
          external_reference?: string;
          reason?: string;
          payer_email?: string;
          auto_recurring?: {
            frequency: number;
            frequency_type: string;
            transaction_amount: number;
            currency_id: string;
          };
        }>;
      }
    ).get({ id: subscriptionId });

    console.log(
      ">>> MP Subscription status from MP:",
      mpSubscription.status,
      "subscriptionId:",
      subscriptionId
    );

    // Buscar la suscripción por mpSubscriptionId
    const existingSubscription: MercadoPagoSubscriptionRecord | null = await (
      ctx.context.adapter as {
        findOne: (config: {
          model: string;
          where: { field: string; value: string }[];
        }) => Promise<{
          id: string;
          externalReference: string;
          userId: string;
          mpSubscriptionId?: string;
          status: string;
          reason?: string;
          payerEmail?: string;
          transactionAmount?: number;
          currencyId?: string;
          createdAt: Date;
          updatedAt: Date;
        } | null>;
      }
    ).findOne({
      model: "mercadoPagoSubscription",
      where: [{ field: "mpSubscriptionId", value: subscriptionId }],
    });

    if (!existingSubscription) {
      console.log(
        ">>> Subscription not found in DB, creating new record with mpSubscriptionId:",
        subscriptionId
      );
      // Si no existe, creamos la suscripción (para el caso de webhooks que llegan antes de que se guarde localmente)
      // Esto es improbable pero posible en casos de race conditions
      return ctx.json({ received: true });
    }

    console.log(
      ">>> Found subscription in DB:",
      existingSubscription.id,
      "current status:",
      existingSubscription.status,
      "new status:",
      mpSubscription.status
    );

    // Solo actualizamos si el status cambió o si es "authorized" (como en la docs)
    if (existingSubscription.status !== mpSubscription.status) {
      // Map MP subscription status to result type
      const subscriptionResultType = getSubscriptionResultType(
        mpSubscription.status
      );

      // Update subscription status in database
      await (
        ctx.context.adapter as {
          update: (config: {
            model: string;
            update: Record<string, unknown>;
            where: { field: string; value: string }[];
          }) => Promise<void>;
        }
      ).update({
        model: "mercadoPagoSubscription",
        update: {
          status: mpSubscription.status,
          updatedAt: new Date(),
        },
        where: [{ field: "id", value: existingSubscription.id }],
      });

      console.log(
        `>>> Subscription ${subscriptionId} status updated to: ${mpSubscription.status} (${subscriptionResultType})`
      );
    } else {
      console.log(
        ">>> Subscription status unchanged:",
        mpSubscription.status,
        "- no update needed"
      );
    }

    // Call the subscription update callback if provided
    if (options.onSubscriptionUpdate) {
      await options.onSubscriptionUpdate({
        mpSubscription,
        status: mpSubscription.status,
        subscription: existingSubscription,
      });
    }
  } catch (error) {
    (
      ctx.context.logger as {
        error: (msg: string, data: Record<string, unknown>) => void;
      }
    ).error("Error processing MP subscription webhook", {
      error,
      notification,
    });
  }

  return ctx.json({ received: true });
}

/**
 * Maps MercadoPago subscription status to a simplified result type
 */
function getSubscriptionResultType(
  mpStatus: string
): "success" | "pending" | "error" {
  switch (mpStatus) {
    case "authorized": {
      return "success";
    }
    case "pending": {
      return "pending";
    }
    case "cancelled":
    case "expired":
    case "unpaid": {
      return "error";
    }
    default: {
      return "pending";
    }
  }
}

/**
 * Maps MercadoPago payment status to a simplified result type
 * for easier handling of the 3 main Checkout Pro states
 */
function getPaymentResultType(
  mpStatus: string
): "success" | "pending" | "error" {
  switch (mpStatus) {
    case "approved":
    case "authorized": {
      return "success";
    }
    case "pending":
    case "in_process": {
      return "pending";
    }
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
    case "in_mediation": {
      return "error";
    }
    default: {
      return "pending";
    }
  }
}
