---
name: better-auth-mp
description: >
  Integrate the `better-auth-mp` plugin (MercadoPago payments and subscriptions for Better Auth) into any TypeScript/Next.js project.
  Use this skill whenever the user mentions better-auth-mp, mercadopago plugin, MercadoPago payments with Better Auth, recurring subscriptions in LATAM, payment webhooks with better-auth, or wants to
  add one-time payments, subscription plans, or webhook handling through Better Auth. Also trigger this skill when the user asks about configuring
  `mercadoPagoPlugin`, `mercadopagoClient`, setting up the webhook endpoint, generating the DB schema with `@better-auth/cli`, or handling
  `onPaymentUpdate` / `onSubscriptionUpdate` callbacks. Always use this skill before writing any code that touches better-auth-mp.
---

# better-auth-mp

**MercadoPago plugin for Better Auth** — one-time payments, recurring subscriptions, webhook handling, and ORM-agnostic DB schema. Specifically built for Latin America.

- npm: `better-auth-mp`
- repo: https://github.com/IvanTsxx/better-auth-mp
- version: 1.0.0+

---

## Installation

```bash
bun add better-auth-mp
# or
npm install better-auth-mp
```

**Peer dependencies** (must already be installed):

```bash
bun add better-auth @prisma/client zod
```

---

## Environment Variables

```env
MP_ACCESS_TOKEN=APP_USR-xxxxxxxxxxxxxxxxxxxx   # from MercadoPago dashboard
MP_WEBHOOK_SECRET=your-webhook-secret          # set when registering the webhook in MP
BETTER_AUTH_SECRET=your-auth-secret
BETTER_AUTH_URL=https://yourdomain.com         # must be HTTPS in production
```

---

## Server Setup

```typescript
// lib/auth.ts  (or auth.ts)
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { mercadoPagoPlugin } from "better-auth-mp";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  plugins: [
    mercadoPagoPlugin({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      webhookSecret: process.env.MP_WEBHOOK_SECRET!,
      // optional:
      sandbox: process.env.NODE_ENV !== "production",
      baseUrl: process.env.BETTER_AUTH_URL,

      // Called every time MP sends a payment webhook
      onPaymentUpdate: async ({ payment, status, resultType, mpPayment }) => {
        if (resultType === "success") {
          // grant feature, send email, etc.
        }
      },

      // Called every time MP sends a subscription webhook
      onSubscriptionUpdate: async ({ subscription, status, mpSubscription }) => {
        if (status === "authorized") {
          // activate subscription in your app
        }
      },
    }),
  ],
});
```

### Plugin Options

| Option | Type | Required | Default | Notes |
|---|---|---|---|---|
| `accessToken` | `string` | ✅ | — | MercadoPago Access Token (prod or sandbox) |
| `webhookSecret` | `string` | ⚠️ | — | Secret for HMAC signature verification. Skip only in dev |
| `sandbox` | `boolean` | ❌ | `false` | Enables sandbox mode |
| `baseUrl` | `string` | ❌ | auto | Override base URL for generated back URLs |
| `onPaymentUpdate` | `function` | ❌ | — | Callback called on every payment webhook |
| `onSubscriptionUpdate` | `function` | ❌ | — | Callback called on every subscription webhook |

---

## Client Setup

```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";
import { mercadopagoClient } from "better-auth-mp/client";

export const authClient = createAuthClient({
  plugins: [mercadopagoClient()],
});
```

---

## Database Schema

The plugin uses **Better Auth's CLI** to auto-generate database models — it is ORM-agnostic (Prisma, Drizzle, etc.).

```bash
# Generate migrations/models from your auth.ts config
bunx @better-auth/cli generate

# Or with npm
npx @better-auth/cli@latest generate
```

This creates three models:
- `mercadoPagoPayment` — stores every one-time payment
- `mercadoPagoSubscription` — stores recurring subscriptions
- `mercadoPagoPlan` — stores subscription plan definitions

---

## Next.js App Router Integration

```typescript
// app/api/auth/[...betterauth]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { POST, GET } = toNextJsHandler(auth);
```

The plugin automatically registers these endpoints under `/api/auth/mercado-pago/`:

| Endpoint | Method | Auth Required | Description |
|---|---|---|---|
| `/mercado-pago/create-payment` | POST | ✅ | Create a Checkout Pro preference (one-time) |
| `/mercado-pago/get-payment` | POST | ✅ | Get a payment by `externalReference` |
| `/mercado-pago/get-payments` | POST | ✅ | List & filter user payments (paginated) |
| `/mercado-pago/create-subscription` | POST | ✅ | Create a recurring subscription (no plan) |
| `/mercado-pago/create-subscription-with-plan` | POST | ✅ | Subscribe a user to an existing plan |
| `/mercado-pago/get-subscription` | POST | ✅ | Get a subscription by MP ID |
| `/mercado-pago/get-subscriptions` | POST | ✅ | List & filter user subscriptions (paginated) |
| `/mercado-pago/update-subscription` | POST | ✅ | Pause or resume a subscription |
| `/mercado-pago/cancel-subscription` | POST | ✅ | Cancel a subscription |
| `/mercado-pago/create-plan` | POST | ✅ | Create a subscription plan in MP + DB |
| `/mercado-pago/get-plan` | POST | ❌ | Get a plan by MP plan ID |
| `/mercado-pago/get-plans` | POST | ❌ | List plans (paginated) |
| `/mercado-pago/webhook` | POST | ❌ | Webhook receiver (called by MercadoPago) |

---

## One-Time Payments — Checkout Pro

### 1. Create a preference (server action or route handler)

```typescript
const { data } = await authClient.mercadopago.createPayment({
  items: [
    {
      id: "plan-pro",
      title: "Pro Plan",
      quantity: 1,
      unitPrice: 9999,     // in the smallest currency unit (ARS cents are NOT used — use full pesos)
      currencyId: "ARS",
    },
  ],
  backUrls: {
    success: "https://yourdomain.com/payments?status=success",
    failure: "https://yourdomain.com/payments?status=failure",
    pending: "https://yourdomain.com/payments?status=pending",
  },
  // optional: prevent duplicates
  idempotencyKey: "unique-key-per-intent",
});

// Redirect user to the checkout
window.location.href = data.checkoutUrl;
```

### 2. Handle the result back URL

After the user pays, MP redirects to your `backUrls`. Use `getPaymentResultType` on the server to map status:

```typescript
import { getPaymentResultType } from "better-auth-mp";

// resultType is: "success" | "pending" | "error"
const resultType = getPaymentResultType(mpStatus);
```

### 3. Handle webhook (already done automatically)

MP calls `POST /api/auth/mercado-pago/webhook`. The plugin:
1. Verifies the HMAC signature (if `webhookSecret` is set)
2. Fetches full payment data from MP API
3. Updates `mercadoPagoPayment` in DB
4. Calls `onPaymentUpdate` if configured

**Register your webhook** in the MercadoPago dashboard pointing to:
`https://yourdomain.com/api/auth/mercado-pago/webhook`

---

## Subscriptions

### Create a plan (admin, run once)

```typescript
const { data } = await authClient.mercadopago.createPlan({
  name: "Pro Monthly",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 9999,
    currencyId: "ARS",
  },
  description: "Full access to Pro features",
});

const planId = data.planId; // store this
```

### Subscribe a user (with card token from MP Brick)

```typescript
// cardTokenId comes from MercadoPago's CardPayment Brick or SDK
const { data } = await authClient.mercadopago.createSubscriptionWithPlan({
  planId: "YOUR_MP_PLAN_ID",
  payerEmail: session.user.email,
  cardTokenId: cardTokenId,
  identification: { type: "DNI", number: "12345678" }, // optional
});
```

### Subscribe a user (redirect flow, no card upfront)

```typescript
const { data } = await authClient.mercadopago.createSubscription({
  reason: "Pro Monthly",
  payerEmail: session.user.email,
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 9999,
    currencyId: "ARS",
  },
  backUrl: "https://yourdomain.com/subscriptions",
});

// Redirect user to data.checkoutUrl
```

### Manage subscriptions

```typescript
// Pause
await authClient.mercadopago.updateSubscription({
  subscriptionId: mpSubscriptionId,
  status: "paused",
});

// Resume
await authClient.mercadopago.updateSubscription({
  subscriptionId: mpSubscriptionId,
  status: "authorized",
});

// Cancel
await authClient.mercadopago.cancelSubscription({
  subscriptionId: mpSubscriptionId,
});

// List user subscriptions
const { data } = await authClient.mercadopago.getSubscriptions({
  filters: { status: "authorized" },
  limit: 20,
  offset: 0,
});
```

---

## Webhook Events Handled

| MP Event Type | Plugin action |
|---|---|
| `payment` | Updates `mercadoPagoPayment`, calls `onPaymentUpdate` |
| `subscription_preapproval` | Updates `mercadoPagoSubscription`, calls `onSubscriptionUpdate` |
| `subscription_authorized_payment` | Updates `mercadoPagoSubscription`, calls `onSubscriptionUpdate` |

---

## Security — Built-in

The plugin includes these protections out of the box; no extra code needed:

- **HMAC signature verification** — validates `x-signature` + `x-request-id` headers from MP
- **Rate limiting** — 10 req/min per user on payment/subscription creation; 1000 req/min on the webhook
- **Idempotency keys** — pass `idempotencyKey` on create calls to prevent duplicate charges
- **Amount validation** — DB amount vs. MP payment amount is compared at webhook time
- **Metadata sanitization** — user-supplied metadata is sanitized before storing

---

## TypeScript Types

```typescript
import type {
  MercadoPagoPluginOptions,
  PaymentStatus,
  SubscriptionStatus,
  PreferenceItem,
  PreferenceOutput,
  PaymentOutput,
  PaginatedPayments,
  SubscriptionOutput,
  PlanOutput,
  PaginatedSubscriptions,
  MercadoPagoPaymentRecord,
  MercadoPagoSubscriptionRecord,
  MercadoPagoPlanRecord,
} from "better-auth-mp/types";
```

Key status types:

```typescript
type PaymentStatus =
  | "pending" | "approved" | "authorized"
  | "in_process" | "in_mediation"
  | "rejected" | "cancelled" | "refunded" | "charged_back";

type SubscriptionStatus =
  | "pending" | "authorized" | "paused"
  | "cancelled" | "expired" | "unpaid";
```

---

## Common Patterns

### Protect routes based on subscription status

```typescript
// In a Next.js Server Component or middleware
const subscriptions = await authClient.mercadopago.getSubscriptions({
  filters: { status: "authorized" },
});
const isSubscribed = subscriptions.data?.subscriptions.length > 0;
```

### Grant access after payment webhook

```typescript
mercadoPagoPlugin({
  accessToken: process.env.MP_ACCESS_TOKEN!,
  onPaymentUpdate: async ({ payment, resultType }) => {
    if (resultType === "success") {
      await db.user.update({
        where: { id: payment.userId },
        data: { isPro: true },
      });
    }
  },
})
```

---

## Known Limitations (as of v1.0.0)

- The `auto_return: "approved"` on preferences requires an HTTPS URL — will not work on `localhost` without a tunnel (e.g. ngrok)
- Marketplace / split-payment features are in the plugin schema but **not yet exposed** as endpoints — do not implement them
- One-click Checkout Brick integration is **planned** but not released yet
- Refund management endpoints are **planned** — not in current release
- The client plugin (`mercadopagoClient`) provides type inference only; it does not add client-side state hooks beyond session
