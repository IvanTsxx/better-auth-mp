import type { BetterAuthPlugin } from "better-auth";
import { MercadoPagoConfig } from "mercadopago";

import {
  createPreferenceEndpoints,
  getPaymentResultType,
} from "./endpoints/preference";
import { createSubscriptionEndpoints } from "./endpoints/subscription";
import { createWebhookEndpoint } from "./endpoints/webhook";
import type { MercadoPagoPluginOptions } from "./types";

export { getPaymentResultType };

export const mercadoPagoPlugin = (options: MercadoPagoPluginOptions) => {
  const client = new MercadoPagoConfig({
    accessToken: options.accessToken,
  });

  const preferenceEndpoints = createPreferenceEndpoints(client, options);
  const webhookEndpoints = createWebhookEndpoint(client, options);
  const subscriptionEndpoints = createSubscriptionEndpoints(client, options);

  return {
    endpoints: {
      ...preferenceEndpoints,
      ...webhookEndpoints,
      ...subscriptionEndpoints,
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
      mercadoPagoPlan: {
        fields: {
          autoRecurringFrequency: { required: true, type: "number" },
          autoRecurringFrequencyType: { required: true, type: "string" },
          createdAt: { required: true, type: "date" },
          currencyId: { required: true, type: "string" },
          description: { type: "string" },
          id: { required: true, type: "string" },
          metadata: { type: "string" },
          mpPlanId: {
            required: true,
            type: "string",
            unique: true,
          },
          name: { required: true, type: "string" },
          transactionAmount: { required: true, type: "number" },
          updatedAt: { required: true, type: "date" },
        },
      },
      mercadoPagoSubscription: {
        fields: {
          autoRecurringFrequency: { type: "number" },
          autoRecurringFrequencyType: { type: "string" },
          createdAt: { required: true, type: "date" },
          currencyId: { type: "string" },
          externalReference: {
            required: true,
            type: "string",
            unique: true,
          },
          id: { required: true, type: "string" },
          metadata: { type: "string" },
          mpSubscriptionId: {
            required: false,
            type: "string",
            unique: true,
          },
          nextPaymentDate: { type: "date" },
          payerEmail: { type: "string" },
          planId: { type: "string" },
          reason: { type: "string" },
          status: { required: true, type: "string" },
          transactionAmount: { type: "number" },
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
