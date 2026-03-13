import prisma from "@repo/db";
import { env } from "@repo/env/server";
import { betterAuth } from "better-auth";
import { mercadoPagoPlugin } from "better-auth-mp";
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
    mercadoPagoPlugin({
      accessToken: env.MP_ACCESS_TOKEN,
      baseUrl: env.BETTER_AUTH_URL,
      webhookSecret: env.MP_WEBHOOK_SECRET,
    }),
  ],
  trustedOrigins: [env.CORS_ORIGIN],
});
