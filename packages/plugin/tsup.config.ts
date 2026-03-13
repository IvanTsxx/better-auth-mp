import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: {
    "client-plugin": "src/client-plugin.ts",
    index: "src/index.ts",
    schemas: "src/schemas.ts",
    types: "src/types.ts",
  },
  external: [
    "better-auth",
    "@prisma/client",
    "@better-fetch/fetch",
    "node:crypto",
    "crypto",
  ],
  format: ["esm", "cjs"],
  platform: "node",
  sourcemap: true,
  splitting: false,
  treeshake: true,
});
