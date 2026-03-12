import { APIError, createAuthEndpoint } from "better-auth/api";
import { Payment } from "mercadopago";
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

      let notification: MercadoPagoPaymentNotification;
      try {
        notification = ctx.body;
      } catch {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid JSON payload",
        });
      }

      if (notification.type !== "payment" || !notification.data?.id) {
        return ctx.json({ received: true });
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
