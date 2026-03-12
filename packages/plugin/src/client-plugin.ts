import type { BetterAuthClientPlugin } from "better-auth/client";

import type { mercadoPagoPlugin } from "./index";

export const mercadopagoClient = () =>
  ({
    $InferServerPlugin: {} as ReturnType<typeof mercadoPagoPlugin>,

    id: "mercadopago",
  }) satisfies BetterAuthClientPlugin;

// Export the client plugin
export const mercadopagoPluginClient = mercadopagoClient;
