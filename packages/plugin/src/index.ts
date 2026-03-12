import type { BetterAuthPlugin } from "better-auth";
import { MercadoPagoConfig } from "mercadopago";

import { createPreferenceEndpoints, getPaymentResultType } from "./endpoints/preference";
import { createWebhookEndpoint } from "./endpoints/webhook";
import type { MercadoPagoPluginOptions } from "./types";

export { getPaymentResultType };

export const mercadoPagoPlugin = (options: MercadoPagoPluginOptions) => {
  const client = new MercadoPagoConfig({
    accessToken: options.accessToken,
  });

  // Create preference endpoints (createPayment, getPayment, getPayments)
  const preferenceEndpoints = createPreferenceEndpoints(client, options);

  // Create webhook endpoint
  const webhookEndpoints = createWebhookEndpoint(client, options);

  return {
    endpoints: {
      ...preferenceEndpoints,
      ...webhookEndpoints,
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
