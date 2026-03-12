import path from "node:path";

import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

dotenv.config({
  path: "../../apps/web/.env",
});

export default defineConfig({
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  schema: path.join("prisma", "schema"),
});
