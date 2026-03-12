import type { BetterFetchOption } from "@better-fetch/fetch";
import type { BetterAuthClientPlugin } from "better-auth/client";

import type { mercadopagoPlugin } from "@/index";

export const mercadopagoPluginClient = () =>
  ({
    $InferServerPlugin: {} as ReturnType<typeof mercadopagoPlugin>,
    getActions: ($fetch) => ({
      myCustomAction: async (
        data: {
          foo: string;
        },
        fetchOptions?: BetterFetchOption
      ) => {
        const res = await $fetch("/mercadopago/action", {
          body: {
            foo: data.foo,
          },
          method: "POST",
          ...fetchOptions,
        });
        return res;
      },
    }),
    id: "mercadopago",
  }) satisfies BetterAuthClientPlugin;
