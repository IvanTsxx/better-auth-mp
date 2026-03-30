<div align="center">

  <h1>better-auth-mp</h1>

  <p>
    MercadoPago plugin for <a href="https://better-auth.com">Better Auth</a> — subscriptions, payments & webhooks out of the box.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/better-auth-mp">
      <img src="https://img.shields.io/npm/v/better-auth-mp?style=flat-square&colorA=18181b&colorB=00BCFF" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/better-auth-mp">
      <img src="https://img.shields.io/npm/dm/better-auth-mp?style=flat-square&colorA=18181b&colorB=00BCFF" alt="npm downloads" />
    </a>
    <a href="https://github.com/IvanTsxx/better-auth-mp/blob/main/packages/plugin/LICENSE">
      <img src="https://img.shields.io/npm/l/better-auth-mp?style=flat-square&colorA=18181b&colorB=00BCFF" alt="license" />
    </a>
    <a href="https://github.com/IvanTsxx/better-auth-mp/actions/workflows/release.yml">
      <img src="https://img.shields.io/github/actions/workflow/status/IvanTsxx/better-auth-mp/release.yml?style=flat-square&colorA=18181b&colorB=00BCFF&label=release" alt="release status" />
    </a>
  </p>

  <p>
    <a href="./README.es.md">🇦🇷 Leer en Español</a>
  </p>
</div>

---

> ⚠️ **Disclaimer:** This plugin is community-maintained and is not officially affiliated with MercadoPago or Better Auth. See [DISCLAIMER.md](./packages/plugin/DISCLAIMER.md) for full details.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
  - [Server Setup](#server-setup)
  - [Client Setup](#client-setup)
- [Configuration](#configuration)
- [Integrations](#integrations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

- 🔐 **Authentication-first payments** — Payments tied to authenticated Better Auth users
- 💳 **Subscription management** — Create and manage recurring subscriptions with MercadoPago
- 🔔 **Webhook handling** — Built-in webhook verification and event processing  
- 📦 **Type-safe** — Full TypeScript support with Zod validation
- 🔌 **Pluggable** — Drop-in Better Auth plugin with minimal configuration
- 🌎 **LATAM-ready** — Built specifically for MercadoPago's Latin American market

## Installation

```bash
# npm
npm install better-auth-mp

# yarn
yarn add better-auth-mp

# pnpm
pnpm add better-auth-mp

# bun
bun add better-auth-mp
```

### Agent Skills

If you use an AI coding agent (Claude Code, Antigravity, Codex, Cursor, OpenCode...) install the
`better-auth-mp` skill so your agent knows how to integrate this plugin without extra prompting:

```bash
# npx
npx skills add IvanTsxx/better-auth-mp

# bunx
bunx --bun skills add IvanTsxx/better-auth-mp

# pnpm
pnpm dlx skills add IvanTsxx/better-auth-mp
```

Compatible with [40+ AI coding agents](https://github.com/vercel-labs/skills#supported-agents).

### Peer Dependencies

Make sure you have the required peer dependencies installed:

```bash
bun add better-auth @prisma/client
```

## Quick Start

### Server Setup

Add the plugin to your Better Auth configuration:

```typescript
// auth.ts (server)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mercadopago } from "better-auth-mp";
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

### Client Setup

Add the client plugin to your Better Auth client:

```typescript
// auth-client.ts (client)
import { createAuthClient } from "better-auth/react";
import { mercadopagoClient } from "better-auth-mp/client";

export const authClient = createAuthClient({
  plugins: [mercadopagoClient()],
});
```

### Environment Variables

```env
# MercadoPago credentials
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx
MP_WEBHOOK_SECRET=your-webhook-secret

# Better Auth
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=http://localhost:3000
```

## Configuration

### Plugin Options

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `accessToken` | `string` | ✅ | MercadoPago Access Token (production or sandbox) |
| `webhookSecret` | `string` | ✅ | Secret for webhook signature verification |
| `sandbox` | `boolean` | ❌ | Enable sandbox mode (default: `false`) |
| `notificationUrl` | `string` | ❌ | Override webhook URL (default: auto-detected from `BETTER_AUTH_URL`) |

```typescript
mercadopago({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  webhookSecret: process.env.MP_WEBHOOK_SECRET!,
  sandbox: process.env.NODE_ENV !== "production",
  notificationUrl: "https://yourdomain.com/api/auth/mercadopago/webhook",
})
```

### Database Schema (ORM-agnostic)

This plugin is **fully ORM-agnostic** — it works with Prisma, Drizzle, or any other ORM/database supported by Better Auth.

The required schema is generated automatically using the **Better Auth CLI**. Run it once after configuring the plugin:

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

The CLI reads your `auth.ts` configuration and generates the necessary models/migrations for your configured ORM and database automatically.

## Integrations

### Next.js App Router

Create the webhook route handler:

```typescript
// app/api/auth/[...betterauth]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

The plugin automatically registers the webhook endpoint at `/api/auth/mercadopago/webhook`.

### Webhook Events

The plugin handles the following MercadoPago webhook events:

| Event | Description |
|-------|-------------|
| `subscription_preapproval` | Subscription created or updated |
| `payment` | Payment received, refunded, or failed |

### Client Hooks (React)

```typescript
import { authClient } from "@/lib/auth-client";

// In your component
const { data: session } = authClient.useSession();
const subscription = authClient.mercadopago.useSubscription();
```

## Roadmap

| Feature | Status |
|---------|--------|
| ✅ Basic payment webhooks | Released |
| ✅ Subscription management | Released |
| ✅ Webhook signature verification | Released |
| 🔄 One-click checkout via Brick | In progress |
| 🔄 Subscription plan management UI | In progress |
| 📋 Refund management | Planned |
| 📋 Payment analytics endpoints | Planned |
| 📋 Multi-currency support | Planned |
| 📋 Installment (cuotas) support | Planned |

## Contributing

We welcome contributions! Please read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide before submitting a PR.

## License

[MIT](./LICENSE) — Copyright © 2025 better-auth-mp contributors.

See [DISCLAIMER.md](./packages/plugin/DISCLAIMER.md) for important legal information.
