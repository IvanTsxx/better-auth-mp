import path from "node:path";
import { fileURLToPath } from "node:url";

import { config } from "dotenv";

// Entry point exclusivo para @better-auth/cli.
// Next.js nunca importa este archivo — carga apps/web/src/app/api/auth/[...all]/route.ts
// que importa desde el export "." de este paquete, no desde este archivo.
//
// import.meta.url es seguro acá porque jiti (usado por el CLI) lo soporta,
// y Turbopack jamás llega a este archivo.
const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({
  override: false,
  path: path.resolve(__dirname, "../../../apps/web/.env"),
});

export { auth } from "./index.js";
