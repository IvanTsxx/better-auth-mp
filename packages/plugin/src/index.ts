import { generateId } from "better-auth";
import type { BetterAuthPlugin } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  getSessionFromCtx,
} from "better-auth/api";
import { MercadoPagoConfig, Payment, Preference } from "mercadopago";
import type { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { z } from "zod";

import { MercadoPagoPreferenceSchema } from "./schemas";
import {
  idempotencyStore,
  rateLimiter,
  sanitizeMetadata,
  ValidationRules,
  validateIdempotencyKey,
  validatePaymentAmount,
  verifyWebhookSignature,
} from "./security";
import type {
  MercadoPagoPaymentNotification,
  MercadoPagoPaymentRecord,
  MercadoPagoPluginOptions,
  PaymentOutput,
  PaginatedPayments,
  PreferenceOutput,
} from "./types";

/**
 * Maps MercadoPago payment status to a simplified result type
 * for easier handling of the 3 main Checkout Pro states
 */
function getPaymentResultType(mpStatus: string): "success" | "pending" | "error" {
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

export const mercadoPagoPlugin = (options: MercadoPagoPluginOptions) => {
  const client = new MercadoPagoConfig({
    accessToken: options.accessToken,
  });

  return {
    endpoints: {
      createPayment: createAuthEndpoint(
        "/mercado-pago/create-payment",
        {
          body: z.object({
            ...MercadoPagoPreferenceSchema.shape,
            idempotencyKey: z.string().optional(),
          }),
          method: "POST",
        },
        async (ctx): Promise<PreferenceOutput> => {
          const session = await getSessionFromCtx(ctx);
          if (!session) {
            throw new APIError("UNAUTHORIZED");
          }

          const rateLimitKey = `payment:create:${session.user.id}`;
          if (!rateLimiter.check(rateLimitKey, 10, 60 * 1000)) {
            throw new APIError("TOO_MANY_REQUESTS", {
              message:
                "Too many payment creation attempts. Please try again later.",
            });
          }

          const { backUrls, items, metadata, idempotencyKey } = ctx.body;

          // Destructure with fallback to empty object if undefined
          const {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl,
          } = backUrls || {};

          // Use provided URLs or fallback to defaults
          const finalBackUrls = {
            failure:
              failureUrl ||
              `${options.baseUrl}/payments/one-time?status=failure`,
            pending:
              pendingUrl ||
              `${options.baseUrl}/payments/one-time?status=pending`,
            success:
              successUrl ||
              `${options.baseUrl}/payments/one-time?status=success`,
          };

          // Validate that at least success URL exists
          if (!finalBackUrls.success) {
            throw new APIError("BAD_REQUEST", {
              message: "Missing required backUrl.success",
            });
          }

          if (idempotencyKey) {
            if (!validateIdempotencyKey(idempotencyKey)) {
              throw new APIError("BAD_REQUEST", {
                message: "Invalid idempotency key format",
              });
            }

            const cachedResult = idempotencyStore.get(idempotencyKey);
            if (cachedResult) {
              return ctx.json(cachedResult) as Promise<PreferenceOutput>;
            }
          }

          if (
            items.some((item) => !ValidationRules.currency(item.currencyId))
          ) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid currency code",
            });
          }

          const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};

          const totalAmount = items.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity,
            0
          );

          if (!ValidationRules.amount(totalAmount)) {
            throw new APIError("BAD_REQUEST", {
              message: "Invalid payment amount",
            });
          }

          const externalReference = generateId();

          const preferenceBody: PreferenceCreateData["body"] = {
            // Activar esto solo si el .env tiene un https sino no andara
            auto_return: "approved",
            back_urls: finalBackUrls,
            expires: true,
            external_reference: externalReference,
            items: items.map((item) => ({
              currency_id: item.currencyId,
              id: item.id,
              quantity: item.quantity,
              title: item.title,
              unit_price: item.unitPrice,
            })),
            metadata: {
              ...sanitizedMetadata,
              userId: session.user.id,
            },
          };

          const preference = await new Preference(client)
            .create({
              body: preferenceBody,
            })
            .catch((error) => {
              console.error(">>> MP PREFERENCE ERROR:", error);
              throw new APIError("INTERNAL_SERVER_ERROR", {
                message: `MP PREFERENCE ERROR: ${error.message}`,
              });
            });

          const payment = await ctx.context.adapter.create({
            data: {
              amount: totalAmount,
              createdAt: new Date(),
              currency: items[0]?.currencyId || "ARS",
              externalReference,
              metadata: JSON.stringify({
                ...sanitizedMetadata,
                preferenceId: preference.id,
              }),
              preferenceId: preference.id,
              status: "pending",
              updatedAt: new Date(),
              userId: session.user.id,
            },
            model: "mercadoPagoPayment",
          });

          if (!preference.init_point || !payment.id || !preference.id) {
            throw new APIError("INTERNAL_SERVER_ERROR", {
              message: "Something went wrong",
            });
          }

          const result: PreferenceOutput = {
            checkoutUrl: preference.init_point,
            paymentId: payment.id,
            preferenceId: preference.id,
          };

          if (idempotencyKey) {
            idempotencyStore.set(idempotencyKey, result);
          }

          return ctx.json(result);
        }
      ),

      getPayment: createAuthEndpoint(
        "/mercado-pago/get-payment",
        {
          body: z.object({
            externalReference: z.string(),
          }),
          method: "POST",
        },
        async (ctx): Promise<PaymentOutput> => {
          const session = await getSessionFromCtx(ctx);
          if (!session) {
            throw new APIError("UNAUTHORIZED");
          }

          const { externalReference } = ctx.body;

          const payment = await ctx.context.adapter.findOne({
            model: "mercadoPagoPayment",
            where: [
              { field: "externalReference", value: externalReference },
              { field: "userId", value: session.user.id },
            ],
          });

          if (!payment) {
            throw new APIError("NOT_FOUND", {
              message: "Payment not found",
            });
          }

          return ctx.json(payment as PaymentOutput);
        }
      ),

      getPayments: createAuthEndpoint(
        "/mercado-pago/get-payments",
        {
          body: z.object({
            filters: z
              .object({
                dateCreatedFrom: z.string().optional(),
                dateCreatedTo: z.string().optional(),
                status: z
                  .enum([
                    "pending",
                    "approved",
                    "authorized",
                    "in_process",
                    "in_mediation",
                    "rejected",
                    "cancelled",
                    "refunded",
                    "charged_back",
                  ])
                  .optional(),
              })
              .optional(),
            limit: z.number().min(1).max(100).default(20),
            offset: z.number().min(0).default(0),
          }),
          method: "POST",
        },
        async (ctx): Promise<PaginatedPayments> => {
          const session = await getSessionFromCtx(ctx);
          if (!session) {
            throw new APIError("UNAUTHORIZED");
          }

          const { filters, limit, offset } = ctx.body;

          // Build where conditions
          const whereConditions: { field: string; value: string }[] = [
            { field: "userId", value: session.user.id },
          ];

          if (filters?.status) {
            whereConditions.push({ field: "status", value: filters.status });
          }

          // Get total count
          const total = await ctx.context.adapter.count({
            model: "mercadoPagoPayment",
            where: whereConditions,
          });

          // Get paginated results
          const payments = await ctx.context.adapter.findMany({
            limit,
            model: "mercadoPagoPayment",
            offset,
            sortBy: { direction: "desc", field: "createdAt" },
            where: whereConditions,
          });

          return ctx.json({
            limit,
            offset,
            payments: payments as PaymentOutput[],
            total,
          } as PaginatedPayments);
        }
      ),

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
              ctx.context.logger.warn(
                "Payment not found by external_reference",
                { externalRef, paymentId }
              );
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
    },
    id: "mercado-pago",
    schema: {
      mercadoPagoPayment: {
        fields: {
          amount: { required: true, type: "number" },
          createdAt: { required: true, type: "date" },
          currency: { required: true, type: "string" },
          externalReference: {
            required: true,
            type: "string",
            unique: true,
          },
          id: { required: true, type: "string" },
          mercadoPagoPaymentId: {
            required: false,
            type: "string",
            unique: true,
          },
          metadata: { type: "string" },
          paymentMethodId: { type: "string" },
          paymentTypeId: { type: "string" },
          preferenceId: { required: true, type: "string" },
          status: { required: true, type: "string" },
          statusDetail: { type: "string" },
          updatedAt: { required: true, type: "date" },
          userId: {
            references: {
              field: "id",
              model: "user",
            },
            required: true,
            type: "string",
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};

export type { MercadoPagoPluginOptions };
