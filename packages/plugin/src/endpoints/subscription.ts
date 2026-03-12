import { generateId } from "better-auth";
import {
  APIError,
  createAuthEndpoint,
  getSessionFromCtx,
} from "better-auth/api";
import { PreApproval, PreApprovalPlan } from "mercadopago";
import type { MercadoPagoConfig } from "mercadopago";
import { z } from "zod";

import {
  idempotencyStore,
  rateLimiter,
  sanitizeMetadata,
  ValidationRules,
  validateIdempotencyKey,
} from "../security";
import type {
  MercadoPagoPluginOptions,
  SubscriptionOutput,
  PlanOutput,
} from "../types";

/**
 * Schema for creating a subscription (without plan - pending payment)
 */
const CreateSubscriptionSchema = z.object({
  autoRecurring: z.object({
    currencyId: z.string().min(1),
    endDate: z.string().optional(),
    frequency: z.number().min(1),
    frequencyType: z.enum(["days", "weeks", "months"]),
    startDate: z.string().optional(),
    transactionAmount: z.number().min(1),
  }),
  backUrl: z.string().url().optional(),
  idempotencyKey: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  payerEmail: z.string().email(),
  reason: z.string().min(1),
});

/**
 * Schema for creating a plan
 */
const CreatePlanSchema = z.object({
  autoRecurring: z.object({
    currencyId: z.string().min(1),
    frequency: z.number().min(1),
    frequencyType: z.enum(["days", "weeks", "months"]),
    transactionAmount: z.number().min(1),
  }),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  name: z.string().min(1),
});

/**
 * Schema for updating subscription status
 */
const UpdateSubscriptionSchema = z.object({
  status: z.enum(["paused", "authorized"]),
  subscriptionId: z.string(),
});

/**
 * Schema for subscription filters
 */
const SubscriptionFiltersSchema = z.object({
  planId: z.string().optional(),
  status: z
    .enum(["pending", "authorized", "paused", "cancelled", "expired", "unpaid"])
    .optional(),
});

export const createSubscriptionEndpoints = (
  client: MercadoPagoConfig,
  options: MercadoPagoPluginOptions
) => ({
  cancelSubscription: createAuthEndpoint(
    "/mercado-pago/cancel-subscription",
    {
      body: z.object({
        subscriptionId: z.string(),
      }),
      method: "POST",
    },
    async (ctx) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const { subscriptionId } = ctx.body;

      const subscription = (await ctx.context.adapter.findOne({
        model: "mercadoPagoSubscription",
        where: [
          { field: "mpSubscriptionId", value: subscriptionId },
          { field: "userId", value: session.user.id },
        ],
      })) as { id: string } | null;

      if (!subscription) {
        throw new APIError("NOT_FOUND", {
          message: "Subscription not found",
        });
      }

      await new PreApproval(client).update({
        body: {
          status: "cancelled",
        },
        id: subscriptionId,
      });

      await ctx.context.adapter.update({
        model: "mercadoPagoSubscription",
        update: {
          status: "cancelled",
          updatedAt: new Date(),
        },
        where: [{ field: "id", value: subscription.id }],
      });

      return ctx.json({ success: true });
    }
  ),

  createPlan: createAuthEndpoint(
    "/mercado-pago/create-plan",
    {
      body: CreatePlanSchema,
      method: "POST",
    },
    async (ctx): Promise<PlanOutput> => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const { name, description, autoRecurring, metadata } = ctx.body;

      const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};

      const plan = await (
        new PreApprovalPlan(client) as unknown as {
          create: (config: { body: Record<string, unknown> }) => Promise<{
            id: string;
            name?: string;
            url?: string;
          }>;
        }
      ).create({
        body: {
          auto_recurring: {
            currency_id: autoRecurring.currencyId,
            frequency: autoRecurring.frequency,
            frequency_type: autoRecurring.frequencyType,
            transaction_amount: autoRecurring.transactionAmount,
          },
          reason: name,
        },
      });

      await ctx.context.adapter.create({
        data: {
          autoRecurringFrequency: autoRecurring.frequency,
          autoRecurringFrequencyType: autoRecurring.frequencyType,
          createdAt: new Date(),
          currencyId: autoRecurring.currencyId,
          description,
          metadata: JSON.stringify(sanitizedMetadata),
          mpPlanId: plan.id,
          name,
          transactionAmount: autoRecurring.transactionAmount,
          updatedAt: new Date(),
        },
        model: "mercadoPagoPlan",
      });

      const result: PlanOutput = {
        name: plan.name || name,
        planId: plan.id,
        url: plan.url || "",
      };

      return ctx.json(result);
    }
  ),

  createSubscription: createAuthEndpoint(
    "/mercado-pago/create-subscription",
    {
      body: CreateSubscriptionSchema,
      method: "POST",
    },
    async (ctx): Promise<SubscriptionOutput> => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const rateLimitKey = `subscription:create:${session.user.id}`;
      if (!rateLimiter.check(rateLimitKey, 10, 60 * 1000)) {
        throw new APIError("TOO_MANY_REQUESTS", {
          message:
            "Too many subscription creation attempts. Please try again later.",
        });
      }

      const {
        reason,
        autoRecurring,
        payerEmail,
        backUrl,
        metadata,
        idempotencyKey,
      } = ctx.body;

      if (idempotencyKey) {
        if (!validateIdempotencyKey(idempotencyKey)) {
          throw new APIError("BAD_REQUEST", {
            message: "Invalid idempotency key format",
          });
        }

        const cachedResult = idempotencyStore.get(idempotencyKey);
        if (cachedResult) {
          return ctx.json(cachedResult) as Promise<SubscriptionOutput>;
        }
      }

      if (!ValidationRules.currency(autoRecurring.currencyId)) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid currency code",
        });
      }

      if (!ValidationRules.amount(autoRecurring.transactionAmount)) {
        throw new APIError("BAD_REQUEST", {
          message: "Invalid subscription amount",
        });
      }

      const sanitizedMetadata = metadata ? sanitizeMetadata(metadata) : {};
      const externalReference = generateId();

      const preApproval = await (
        new PreApproval(client) as unknown as {
          create: (config: {
            body: Record<string, unknown>;
            requestOptions?: Record<string, unknown>;
          }) => Promise<{
            id: string;
            status: string;
            init_point?: string;
          }>;
        }
      ).create({
        body: {
          auto_recurring: {
            currency_id: autoRecurring.currencyId,
            end_date: autoRecurring.endDate,
            frequency: autoRecurring.frequency,
            frequency_type: autoRecurring.frequencyType,
            start_date: autoRecurring.startDate,
            transaction_amount: autoRecurring.transactionAmount,
          },
          back_url:
            backUrl || `${options.baseUrl}/subscriptions?status=pending`,
          payer_email: payerEmail,
          reason,
          status: "pending",
        },
        requestOptions: idempotencyKey ? { idempotencyKey } : undefined,
      });

      await ctx.context.adapter.create({
        data: {
          autoRecurringFrequency: autoRecurring.frequency,
          autoRecurringFrequencyType: autoRecurring.frequencyType,
          createdAt: new Date(),
          currencyId: autoRecurring.currencyId,
          externalReference,
          metadata: JSON.stringify(sanitizedMetadata),
          mpSubscriptionId: preApproval.id,
          payerEmail,
          reason,
          status: preApproval.status || "pending",
          transactionAmount: autoRecurring.transactionAmount,
          updatedAt: new Date(),
          userId: session.user.id,
        },
        model: "mercadoPagoSubscription",
      });

      if (!preApproval.id || !preApproval.init_point) {
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: "Something went wrong",
        });
      }

      const result: SubscriptionOutput = {
        checkoutUrl: preApproval.init_point,
        status: preApproval.status || "pending",
        subscriptionId: preApproval.id,
      };

      if (idempotencyKey) {
        idempotencyStore.set(idempotencyKey, result);
      }

      return ctx.json(result);
    }
  ),

  getPlan: createAuthEndpoint(
    "/mercado-pago/get-plan",
    {
      body: z.object({
        planId: z.string(),
      }),
      method: "POST",
    },
    async (ctx) => {
      const { planId } = ctx.body;

      const plan = await ctx.context.adapter.findOne({
        model: "mercadoPagoPlan",
        where: [{ field: "mpPlanId", value: planId }],
      });

      if (!plan) {
        throw new APIError("NOT_FOUND", {
          message: "Plan not found",
        });
      }

      return ctx.json(plan);
    }
  ),

  getPlans: createAuthEndpoint(
    "/mercado-pago/get-plans",
    {
      body: z.object({
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
      method: "POST",
    },
    async (ctx) => {
      const { limit, offset } = ctx.body;

      const total = await ctx.context.adapter.count({
        model: "mercadoPagoPlan",
      });

      const plans = await ctx.context.adapter.findMany({
        limit,
        model: "mercadoPagoPlan",
        offset,
        sortBy: { direction: "desc", field: "createdAt" },
      });

      return ctx.json({
        limit,
        offset,
        plans,
        total,
      });
    }
  ),

  getSubscription: createAuthEndpoint(
    "/mercado-pago/get-subscription",
    {
      body: z.object({
        subscriptionId: z.string(),
      }),
      method: "POST",
    },
    async (ctx) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const { subscriptionId } = ctx.body;

      const subscription = (await ctx.context.adapter.findOne({
        model: "mercadoPagoSubscription",
        where: [
          { field: "mpSubscriptionId", value: subscriptionId },
          { field: "userId", value: session.user.id },
        ],
      })) as { id: string } | null;

      if (!subscription) {
        throw new APIError("NOT_FOUND", {
          message: "Subscription not found",
        });
      }

      return ctx.json(subscription);
    }
  ),

  getSubscriptions: createAuthEndpoint(
    "/mercado-pago/get-subscriptions",
    {
      body: z.object({
        filters: SubscriptionFiltersSchema.optional(),
        limit: z.number().min(1).max(100).default(20),
        offset: z.number().min(0).default(0),
      }),
      method: "POST",
    },
    async (ctx) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const { filters, limit, offset } = ctx.body;

      const whereConditions: { field: string; value: string }[] = [
        { field: "userId", value: session.user.id },
      ];

      if (filters?.status) {
        whereConditions.push({ field: "status", value: filters.status });
      }

      if (filters?.planId) {
        whereConditions.push({ field: "planId", value: filters.planId });
      }

      const total = await ctx.context.adapter.count({
        model: "mercadoPagoSubscription",
        where: whereConditions,
      });

      const subscriptions = await ctx.context.adapter.findMany({
        limit,
        model: "mercadoPagoSubscription",
        offset,
        sortBy: { direction: "desc", field: "createdAt" },
        where: whereConditions,
      });

      return ctx.json({
        limit,
        offset,
        subscriptions,
        total,
      });
    }
  ),

  updateSubscription: createAuthEndpoint(
    "/mercado-pago/update-subscription",
    {
      body: UpdateSubscriptionSchema,
      method: "POST",
    },
    async (ctx) => {
      const session = await getSessionFromCtx(ctx);
      if (!session) {
        throw new APIError("UNAUTHORIZED");
      }

      const { subscriptionId, status } = ctx.body;

      const subscription = (await ctx.context.adapter.findOne({
        model: "mercadoPagoSubscription",
        where: [
          { field: "mpSubscriptionId", value: subscriptionId },
          { field: "userId", value: session.user.id },
        ],
      })) as { id: string } | null;

      if (!subscription) {
        throw new APIError("NOT_FOUND", {
          message: "Subscription not found",
        });
      }

      await new PreApproval(client).update({
        body: {
          status: status === "paused" ? "paused" : "authorized",
        },
        id: subscriptionId,
      });

      await ctx.context.adapter.update({
        model: "mercadoPagoSubscription",
        update: {
          status: status === "paused" ? "paused" : "authorized",
          updatedAt: new Date(),
        },
        where: [{ field: "id", value: subscription.id }],
      });

      return ctx.json({ status, success: true });
    }
  ),
});
