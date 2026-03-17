import { createEnv } from "@t3-oss/env-core";
import { config } from "dotenv";
import { z } from "zod";

// Next.js auto-carga .env y setea NEXT_RUNTIME. Fuera de ese contexto (CLI, jiti),
// las vars no están disponibles thus cargamos el .env manualmente.
// Con override:false, si Next.js ya las cargó, esta llamada es un no-op total.
if (!process.env.NEXT_RUNTIME) {
  config({ override: false, path: "../../apps/web/.env" });
}

export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    DATABASE_URL: z.string().min(1),
    MP_ACCESS_TOKEN: z.string().min(1),

    MP_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
});
