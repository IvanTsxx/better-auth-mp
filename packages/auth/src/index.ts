import prisma from "@better-auth-mercadopago/db";
import { env } from "@better-auth-mercadopago/env/server";
import { mercadopagoPlugin } from "@better-auth-mercadopago/plugin";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    nextCookies(),
    mercadopagoPlugin({
      accessToken: env.MP_ACCESS_TOKEN,
      checkout: {
        redirectAfterFailure: "/dashboard?payment=failed",
        redirectAfterSuccess: "/dashboard?payment=success",
      },
      country: "AR",
      defaultCurrency: "ARS",
      split: env.MP_RECEIVER_EMAIL
        ? {
            commissionType: "percentage",
            commissionValue: 10,
            enabled: true,
            receiverEmail: env.MP_RECEIVER_EMAIL,
          }
        : undefined,
    }),
  ],
  trustedOrigins: [env.CORS_ORIGIN],
});
