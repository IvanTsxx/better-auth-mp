import prisma from "@better-auth-mercadopago/db";
import { mercadoPagoPlugin } from "@better-auth-mercadopago/plugin";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { env } from "@better-auth-mercadopago/env/server";

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
