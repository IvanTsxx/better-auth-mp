import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";
/* import path from "node:path";
import dotenv from "dotenv";

const isCli = process.env.BETTER_AUTH_CLI === "true";

if (isCli) {
  dotenv.config({ path: path.resolve(process.cwd(), "../../apps/web/.env") });
} else {
  dotenv.config();
}
 */
export const env = createEnv({
  emptyStringAsUndefined: true,
  runtimeEnv: process.env,
  server: {
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    DATABASE_URL: z.string().min(1),
    MP_ACCESS_TOKEN: z.string().min(1),

    MP_RECEIVER_EMAIL: z.string().email().optional(),
    MP_WEBHOOK_SECRET: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "production", "test"])
      .default("development"),
  },
});
