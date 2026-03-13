<div align="center">
  <img src="https://better-auth-mercadopago.vercel.app/logo.png" alt="better-auth-mercadopago logo" width="120" />

  <h1>better-auth-mercadopago</h1>

  <p>
    Plugin de MercadoPago para <a href="https://better-auth.com">Better Auth</a> — suscripciones, pagos y webhooks listos para usar.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/better-auth-mercadopago">
      <img src="https://img.shields.io/npm/v/better-auth-mercadopago?style=flat-square&colorA=18181b&colorB=00BCFF" alt="versión npm" />
    </a>
    <a href="https://www.npmjs.com/package/better-auth-mercadopago">
      <img src="https://img.shields.io/npm/dm/better-auth-mercadopago?style=flat-square&colorA=18181b&colorB=00BCFF" alt="descargas npm" />
    </a>
    <a href="https://github.com/IvanTsxx/better-auth-mercadopago/blob/main/packages/plugin/LICENSE">
      <img src="https://img.shields.io/npm/l/better-auth-mercadopago?style=flat-square&colorA=18181b&colorB=00BCFF" alt="licencia" />
    </a>
    <a href="https://github.com/IvanTsxx/better-auth-mercadopago/actions/workflows/release.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/IvanTsxx/better-auth-mercadopago/release.yml?style=flat-square&colorA=18181b&colorB=00BCFF&label=release" alt="estado del release" />
    </a>
  </p>

  <p>
    <a href="./README.md">🇺🇸 Read in English</a>
  </p>
</div>

---

> ⚠️ **Descargo de responsabilidad:** Este plugin es mantenido por la comunidad y no está oficialmente afiliado a MercadoPago ni a Better Auth. Consultá el [DISCLAIMER.md](./DISCLAIMER.md) para más detalles.

## Tabla de Contenidos

- [Características](#características)
- [Instalación](#instalación)
- [Inicio rápido](#inicio-rápido)
  - [Configuración del servidor](#configuración-del-servidor)
  - [Configuración del cliente](#configuración-del-cliente)
- [Configuración](#configuración)
- [Integraciones](#integraciones)
- [Roadmap](#roadmap)
- [Contribuir](#contribuir)
- [Licencia](#licencia)

## Características

- 🔐 **Pagos vinculados a autenticación** — Los pagos quedan asociados a usuarios autenticados de Better Auth
- 💳 **Gestión de suscripciones** — Creá y gestioná suscripciones recurrentes con MercadoPago
- 🔔 **Manejo de webhooks** — Verificación de webhooks y procesamiento de eventos incorporado
- 📦 **Type-safe** — Soporte completo de TypeScript con validación Zod
- 🔌 **Pluggable** — Plugin de Better Auth que se integra con configuración mínima
- 🌎 **Hecho para LATAM** — Construido específicamente para el mercado latinoamericano de MercadoPago

## Instalación

```bash
# npm
npm install better-auth-mercadopago

# yarn
yarn add better-auth-mercadopago

# pnpm
pnpm add better-auth-mercadopago

# bun
bun add better-auth-mercadopago
```

### Dependencias de pares (peer dependencies)

Asegurate de tener instaladas las peer dependencies requeridas:

```bash
bun add better-auth @prisma/client
```

## Inicio rápido

### Configuración del servidor

Agregá el plugin a tu configuración de Better Auth:

```typescript
// auth.ts (servidor)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mercadopago } from "better-auth-mercadopago";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  plugins: [
    mercadopago({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      webhookSecret: process.env.MP_WEBHOOK_SECRET!,
    }),
  ],
});
```

### Configuración del cliente

Agregá el plugin al cliente de Better Auth:

```typescript
// auth-client.ts (cliente)
import { createAuthClient } from "better-auth/react";
import { mercadopagoClient } from "better-auth-mercadopago/client";

export const authClient = createAuthClient({
  plugins: [mercadopagoClient()],
});
```

### Variables de entorno

```env
# Credenciales de MercadoPago
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=tu-secreto-de-webhook

# Better Auth
BETTER_AUTH_SECRET=tu-secreto-de-auth
BETTER_AUTH_URL=http://localhost:3000
```

## Configuración

### Opciones del plugin

| Opción | Tipo | Requerido | Descripción |
|--------|------|-----------|-------------|
| `accessToken` | `string` | ✅ | Access Token de MercadoPago (producción o sandbox) |
| `webhookSecret` | `string` | ✅ | Secreto para verificación de firma de webhooks |
| `sandbox` | `boolean` | ❌ | Activa el modo sandbox (por defecto: `false`) |
| `notificationUrl` | `string` | ❌ | URL personalizada para webhooks (por defecto: se detecta automáticamente desde `BETTER_AUTH_URL`) |

```typescript
mercadopago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  webhookSecret: process.env.MP_WEBHOOK_SECRET!,
  sandbox: process.env.NODE_ENV !== "production",
  notificationUrl: "https://tudominio.com/api/auth/mercadopago/webhook",
})
```

### Schema de base de datos (agnóstico al ORM)

Este plugin es **completamente agnóstico al ORM** — funciona con Prisma, Drizzle, o cualquier otro ORM/base de datos compatible con Better Auth.

El schema requerido se genera automáticamente usando el **CLI de Better Auth**. Ejecutalo una vez después de configurar el plugin:

```bash
# bun
bunx @better-auth/cli generate

# npm
npx @better-auth/cli@latest generate

# pnpm
pnpm dlx @better-auth/cli@latest generate

# yarn
yarn dlx @better-auth/cli@latest generate
```

El CLI lee tu configuración de `auth.ts` y genera automáticamente los modelos/migraciones necesarios para el ORM y base de datos que tengas configurado.

## Integraciones

### Next.js App Router

Creá el route handler para los webhooks:

```typescript
// app/api/auth/[...betterauth]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

El plugin registra automáticamente el endpoint de webhook en `/api/auth/mercadopago/webhook`.

### Eventos de Webhook

El plugin maneja los siguientes eventos de webhook de MercadoPago:

| Evento | Descripción |
|--------|-------------|
| `subscription_preapproval` | Suscripción creada o actualizada |
| `payment` | Pago recibido, reembolsado o fallido |

### Hooks del cliente (React)

```typescript
import { authClient } from "@/lib/auth-client";

// En tu componente
const { data: session } = authClient.useSession();
const subscription = authClient.mercadopago.useSubscription();
```

## Roadmap

| Funcionalidad | Estado |
|---------------|--------|
| ✅ Webhooks de pagos básicos | Publicado |
| ✅ Gestión de suscripciones | Publicado |
| ✅ Verificación de firma de webhooks | Publicado |
| 🔄 Checkout con un click via Brick | En desarrollo |
| 🔄 UI para gestión de planes de suscripción | En desarrollo |
| 📋 Gestión de reembolsos | Planeado |
| 📋 Endpoints de analytics de pagos | Planeado |
| 📋 Soporte multi-moneda | Planeado |
| 📋 Soporte de cuotas | Planeado |

## Contribuir

¡Las contribuciones son bienvenidas! Leé nuestra guía [CONTRIBUTING.es.md](./CONTRIBUTING.es.md) antes de enviar un PR.

## Licencia

[MIT](./LICENSE) — Copyright © 2025 better-auth-mercadopago contributors.

Consultá [DISCLAIMER.md](./DISCLAIMER.md) para información legal importante.
