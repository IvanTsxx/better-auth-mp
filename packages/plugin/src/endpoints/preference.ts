import { generateId } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  getSessionFromCtx,
} from "better-auth/api";
import { Preference } from "mercadopago";
import type { MercadoPagoConfig } from "mercadopago";
import type { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { z } from "zod";

import { MercadoPagoPreferenceSchema } from "../schemas";
import {
  idempotencyStore,
  rateLimiter,
  sanitizeMetadata,
  ValidationRules,
  validateIdempotencyKey,
} from "../security";
import type {
  MercadoPagoPluginOptions,
  PaymentOutput,
  PaginatedPayments,
  PreferenceOutput,
} from "../types";

/**
 * Helper function to get payment result type
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

export const createPreferenceEndpoints = (
  client: MercadoPagoConfig,
  options: MercadoPagoPluginOptions
) => ({
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
          failureUrl || `${options.baseUrl}/payments/one-time?status=failure`,
        pending:
          pendingUrl || `${options.baseUrl}/payments/one-time?status=pending`,
        success:
          successUrl || `${options.baseUrl}/payments/one-time?status=success`,
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

      if (items.some((item) => !ValidationRules.currency(item.currencyId))) {
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
});

export { getPaymentResultType };
