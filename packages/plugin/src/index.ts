import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";

export const mercadopagoPlugin = () =>
  ({
    endpoints: {
      getHelloWorld: createAuthEndpoint(
        "/mercadopago/hello-world",
        {
          method: "GET",
          use: [sessionMiddleware],
        },
        async (ctx) => {
          const { session } = ctx.context;

          return await ctx.json({
            message: "Hello World",
          });
        }
      ),
    },
    id: "mercadopago",
    rateLimit: [
      {
        max: 10,
        pathMatcher: (path) => path === "/mercadopago/hello-world",
        window: 60,
      },
    ],
    schema: {},
  }) satisfies BetterAuthPlugin;
