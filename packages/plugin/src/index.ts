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
  PreferenceOutput,
} from "./types";

export const mercadoPagoPlugin = (options: MercadoPagoPluginOptions) => {
  const client = new MercadoPagoConfig({
    accessToken: options.accessToken,
  });

  return {
    endpoints: {
      createPayment: createAuthEndpoint(
        "/mercadopago/create-payment",
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
          const { success, failure, pending } = backUrls || {};

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

          const baseUrl = options.baseUrl || ctx.context.baseURL;

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
            auto_return: "approved",
            back_urls: {
              failure: failure || `${baseUrl}/payments/one-time?status=failure`,
              pending: pending || `${baseUrl}/payments/one-time?status=pending`,
              success: success || `${baseUrl}/payments/one-time?status=success`,
            },
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

          const preference = await new Preference(client).create({
            body: preferenceBody,
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

      webhook: createAuthEndpoint(
        "/mercadopago/webhook",
        {
          method: "POST",
        },
        async (ctx) => {
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
              await options.onPaymentUpdate({
                mpPayment,
                payment: existingPayment,
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
    id: "mercadopago",
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
            required: true,
            type: "string",
            references: {
              field: "id",
              model: "user",
            },
          },
        },
      },
    },
  } satisfies BetterAuthPlugin;
};

export type { MercadoPagoPluginOptions };
