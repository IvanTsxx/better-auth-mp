# PRD: better-auth-mercadopago

## Plugin oficial de MercadoPago para better-auth

---

## 1. Visión del Producto

**Plugin de npm** que integra MercadoPago en better-auth, permitiendo a desarrolladores agregar:

- 💰 Pagos únicos (one-time payments)
- 🔄 Suscripciones recurrentes (mensuales, anuales)
- 🏪 Split de pagos (marketplace/comisiones)

**Filosofía**: El desarrollador NO necesita conocer la API de MercadoPago. El plugin abstrae todo: webhooks, callbacks, validación, estados.

---

## 2. Objetivos

| Objetivo                     | Métrica                                              |
| ---------------------------- | ---------------------------------------------------- |
| Plugin agnóstico a framework | Funciona con cualquier framework que use better-auth |
| Experiencia developer minima | ≤5 líneas de código para integrar pagos              |
| Abstracción completa         | Dev no ve SDK de MercadoPago                         |
| Documentación bilingüe       | Español + Inglés con ejemplos                        |

---

## 3. Funcionalidades Core

### 3.1 Pagos Únicos (One-time Payments)

```typescript
// Dev usa esto:
await authClient.mercadopago.createPayment({
  items: [
    {
      id: "prod_001",
      title: "Membresía Premium",
      description: "Acceso completo por 1 mes",
      quantity: 1,
      unitPrice: 1500, // en centavos
      pictureUrl: "https://...",
    },
  ],
  email: "user@example.com",
  paymentMethod: "card", // card, pix, ticket
});
```

**Internamente el plugin**:

- Crea preferencia en MercadoPago con los items
- Genera URL de checkout
- Maneja webhook `payment.updated`
- Ejecuta callbacks del developer

### 3.2 Suscripciones

Dos modalidades:

#### A) Suscripción sin plan (directa)

```typescript
await authClient.mercadopago.createSubscription({
  items: [
    {
      id: "plan_premium",
      title: "Plan Premium Mensual",
      description: "Acceso mensual completo",
      quantity: 1,
      unitPrice: 1500,
    },
  ],
  currency: "ARS",
  frequency: 1,
  frequencyType: "months",
});
```

#### B) Suscripción con plan creado

```typescript
// El admin crea el plan primero
await auth.api.mercadopago.createPlan({
  items: [
    {
      id: "plan_premium",
      title: "Plan Premium Mensual",
      description: "Acceso mensual completo",
      quantity: 1,
      unitPrice: 1500,
    },
  ],
  currency: "ARS",
  frequency: 1,
  frequencyType: "months",
});

// El usuario se suscribe
await authClient.mercadopago.subscribeToPlan({
  planId: "plan_id_de_mercadopago",
});
```

### 3.3 Split de Pagos (Marketplace)

```typescript
// Configuración del plugin (inicialización)
mercadopagoPlugin({
  split: {
    receiverEmail: "mi-cuenta@mercadopago.com",
    commissionType: "percentage", // "fixed" | "percentage"
    commissionValue: 10, // 10% o $1000
  },
});

// El payment se crea con split automático usando items
await authClient.mercadopago.createPayment({
  items: [
    {
      id: "prod_001",
      title: "Producto del vendedor",
      quantity: 2,
      unitPrice: 5000,
    },
  ],
  splitEnabled: true,
  sellerEmail: "vendedor@email.com", // Email del vendedor
});
```

### 3.4 Callbacks/Eventos

El developer registra handlers para eventos:

```typescript
mercadopagoPlugin({
  hooks: {
    onPaymentApproved: async ({ payment, user, items }) => {
      // Otorgar acceso al producto
      // items contiene lo que el dev pasó al crear el pago
      await grantAccess(user.id, items);
    },
    onPaymentRejected: async ({ payment, user, items }) => {
      // Revocar acceso o notificar
      await notifyUser(user.id, "Pago rechazado");
    },
    onSubscriptionActivated: async ({ subscription, user, items }) => {
      // Activar membresía
      await activateMembership(user.id, items);
    },
    onSubscriptionCancelled: async ({ subscription, user, items }) => {
      // Desactivar al final del período
      await scheduleDeactivation(user.id);
    },
    onPaymentPending: async ({ payment, user, items }) => {
      // Notificar que espera confirmación
    },
  },
});
```

---

## 4. API del Plugin

### 4.1 Server-side (`auth.api.mercadopago.*`)

| Método                      | Descripción                    |
| --------------------------- | ------------------------------ |
| `getPayments(filters)`      | Historial de pagos con filtros |
| `getPayment(id)`            | Detalle de un pago             |
| `getSubscriptions(filters)` | Listar suscripciones           |
| `getSubscription(id)`       | Detalle de suscripción         |
| `cancelSubscription(id)`    | Cancelar suscripción           |
| `pauseSubscription(id)`     | Pausar suscripción             |
| `resumeSubscription(id)`    | Reanudar suscripción           |
| `createPlan(data)`          | Crear plan en MP               |
| `getPlans()`                | Listar planes                  |
| `updatePlan(id, data)`      | Actualizar plan                |
| `deletePlan(id)`            | Eliminar plan                  |
| `getSplitConfig()`          | Ver config de split            |
| `getCommissions()`          | Historial de comisiones        |

### 4.2 Client-side (`authClient.mercadopago.*`)

| Método                       | Descripción                     |
| ---------------------------- | ------------------------------- |
| `createPayment(data)`        | Crear pago y obtener URL        |
| `createSubscription(data)`   | Crear suscripción y obtener URL |
| `subscribeToPlan(planId)`    | Suscribirse a plan existente    |
| `getPaymentLink(paymentId)`  | Obtener link de pago            |
| `getSubscriptionLink(subId)` | Obtener link de gestión         |

### 4.3 Tipos TypeScript

```typescript
// Item para pagos y suscripciones
interface MercadopagoItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  pictureUrl?: string;
  categoryId?: string;
}

// Filters
interface PaymentFilters {
  status?: "pending" | "approved" | "rejected" | "cancelled" | "refunded";
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "date" | "amount";
  sortOrder?: "asc" | "desc";
}

interface SubscriptionFilters {
  status?: "pending" | "authorized" | "paused" | "cancelled" | "expired";
  planId?: string;
}

// Payment/Create - USA items
interface CreatePaymentInput {
  items: MercadopagoItem[]; // ✅ Array de items - REQUERIDO
  email: string;
  payerId?: string;
  paymentMethod?: "card" | "pix" | "ticket" | "bank_transfer";
  externalReference?: string;
  splitEnabled?: boolean;
  sellerEmail?: string; // Para split
  metadata?: Record<string, string>;
}

// Subscription/Create - USA items
interface CreateSubscriptionInput {
  items: MercadopagoItem[]; // ✅ Array de items - REQUERIDO
  currency: string;
  frequency: number;
  frequencyType: "days" | "weeks" | "months" | "years";
  startDate?: Date;
  endDate?: Date;
  // Para suscripciones con plan
  planId?: string;
}

// Plan/Create - USA items
interface CreatePlanInput {
  items: MercadopagoItem[]; // ✅ Array de items - REQUERIDO
  currency: string;
  frequency: number;
  frequencyType: "days" | "weeks" | "months" | "years";
  billingDay?: number;
}
```

---

## 5. Arquitectura del Paquete

```
packages/plugin/
├── src/
│   ├── index.ts                 # Entry point del plugin
│   ├── types.ts                 # Todos los tipos TypeScript
│   ├── server/
│   │   ├── client.ts            # Wrapper del SDK MP (server)
│   │   ├── endpoints.ts         # API endpoints del plugin
│   │   ├── webhooks.ts          # Manejador de webhooks
│   │   └── callbacks.ts         # Sistema de callbacks
│   ├── client/
│   │   ├── proxy.ts             # Client proxy para API calls
│   │   └── types.ts             # Tipos específicos del cliente
│   ├── database/
│   │   └── schema.ts            # Schema Prisma
│   └── utils/
│       ├── validators.ts        # Validaciones Zod
│       └── formatters.ts        # Formatadores de moneda/fecha
├── package.json
└── tsconfig.json
```

---

## 6. Schema de Base de Datos

```prisma
// Extiende las tablas de better-auth

model MercadoPagoPayment {
  id              String   @id @default(cuid())
  mpPaymentId     String   @unique // ID de MercadoPago
  userId          String
  items           Json     // Array de items guardados
  amount          Int      // Total en centavos (calculado de items)
  currency        String   @default("ARS")
  status          String   // pending, approved, rejected, cancelled, refunded
  paymentMethod   String?  // card, pix, ticket
  externalRef     String?
  metadata        Json?
  transactionId   String?  // ID de la transacción
  paymentLink     String?  // URL de pago

  // Split fields
  splitEnabled    Boolean  @default(false)
  sellerEmail     String?
  commissionAmount Int?
  netAmount       Int?

  approvedAt      DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([userId])
  @@index([status])
  @@index([createdAt])
}

model MercadoPagoSubscription {
  id                String   @id @default(cuid())
  mpSubscriptionId  String   @unique
  userId            String
  items             Json     // Array de items guardados
  planId            String?  // Null si es sin plan
  amount            Int      // Total en centavos
  currency          String   @default("ARS")
  frequency         Int
  frequencyType     String   // days, weeks, months, years
  status            String   // pending, authorized, paused, cancelled, expired

  // Split para suscripciones recurrentes
  splitEnabled      Boolean  @default(false)
  sellerEmail       String?
  commissionAmount  Int?

  startDate         DateTime?
  endDate           DateTime?
  nextBillingDate   DateTime?
  autoRecurring     Json?    // Datos de auto_recurring de MP

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
  @@index([status])
}

model MercadoPagoPlan {
  id              String   @id @default(cuid())
  mpPlanId        String   @unique
  items           Json     // Array de items - CRÍTICO para marketplace
  name            String
  amount          Int
  currency        String   @default("ARS")
  frequency       Int
  frequencyType   String
  description     String?
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([isActive])
}

model MarketplaceSplit {
  id              String   @id @default(cuid())
  paymentId       String
  subscriptionId  String?  // Null para pagos únicos
  sellerEmail     String
  items           Json     // Items originales

  // Montos
  totalAmount     Int      // Total del pago
  commissionAmount Int     // Tu comisión
  netAmount       Int      // Monto para el vendedor

  // Estado
  status          String   // pending, paid, failed

  paidAt          DateTime?
  createdAt       DateTime @default(now())

  @@unique([paymentId])
}
```

---

## 7. Webhooks a Manejar

| Evento MP                             | Handler del Plugin                       | Callback del Dev            |
| ------------------------------------- | ---------------------------------------- | --------------------------- |
| `payment.created`                     | Actualiza estado en DB                   | `onPaymentCreated`          |
| `payment.updated`                     | Actualiza estado                         | `onPaymentUpdated`          |
| `payment.approved`                    | Marca como aprobado + ejecuta con items  | `onPaymentApproved` ✓       |
| `payment.rejected`                    | Marca como rechazado + ejecuta con items | `onPaymentRejected` ✓       |
| `payment.pending`                     | Marca como pendiente + ejecuta con items | `onPaymentPending` ✓        |
| `payment.refunded`                    | Marca como reembolsado                   | `onPaymentRefunded`         |
| `subscription_preapproval.created`    | Crea registro + guarda items             | `onSubscriptionCreated`     |
| `subscription_preapproval.updated`    | Actualiza estado                         | `onSubscriptionUpdated`     |
| `subscription_preapproval.authorized` | Activa suscripción + ejecuta con items   | `onSubscriptionActivated` ✓ |
| `subscription_preapproval.paused`     | Pausa suscripción                        | `onSubscriptionPaused` ✓    |
| `subscription_preapproval.cancelled`  | Cancela suscripción                      | `onSubscriptionCancelled` ✓ |

**Importante**: Todos los callbacks reciben `items` para que el developer pueda tomar decisiones basadas en qué productos se pagaron.

---

## 8. Configuración del Plugin

```typescript
import { betterAuth } from "better-auth"
import { mercadopagoPlugin } from "better-auth-mercadopago"

export const auth = betterAuth({
  database: /* ... */,
  plugins: [
    mercadopagoPlugin({
      // Credenciales (se valida que existan)
      accessToken: process.env.MP_ACCESS_TOKEN,
      // Moneda por defecto
      defaultCurrency: "ARS",
      // Configuración de país (determina qué medios de pago están disponibles)
      country: "AR", // AR, BR, MX, CL, CO, PE, UY
      // Split de pagos (marketplace)
      split: {
        enabled: true,
        receiverEmail: process.env.MP_RECEIVER_EMAIL,
        commissionType: "percentage",
        commissionValue: 10, // 10%
      },
      // Callbacks - el developer define qué hacer
      hooks: {
        onPaymentApproved: async ({ payment, user, items }) => {
          // items contiene: [{ id, title, quantity, unitPrice, ... }]
          // Tu lógica de negocio
          for (const item of items) {
            await fulfillOrder(user.id, item)
          }
        },
        onSubscriptionActivated: async ({ subscription, user, items }) => {
          // Activar membresía basada en los items
          await activateMembership(user.id, items)
        },
        // ... todos los callbacks
      },
      // Opciones de checkout
      checkout: {
        redirectAfterSuccess: "/dashboard?payment=success",
        redirectAfterFailure: "/checkout?payment=failed",
        notificationUrl: "https://tu-app.com/api/mercadopago/webhook",
      },
      // Schema customization
      schema: {
        paymentTableName: "mercadoPagoPayments",
      }
    })
  ]
})
```

---

## 9. Medio de Pagos Soportados

| Medio              | Código MP       | Soportado |
| ------------------ | --------------- | --------- |
| Tarjeta de crédito | `card`          | ✅        |
| Tarjeta de débito  | `debit_card`    | ✅        |
| PIX (Brasil)       | `pix`           | ✅ (BR)   |
| Efectivo           | `ticket`        | ✅        |
| Rapipago           | `rapipago`      | ✅ (AR)   |
| Pago Fácil         | `pagofacil`     | ✅ (AR)   |
| Cobro Express      | `cobro_express` | ✅ (AR)   |
| Transferencia      | `bank_transfer` | ✅        |

---

## 10. Estructura del Monorepo

```
better-auth-mercadopago/
├── packages/
│   └── plugin/                      # NPM package: better-auth-mercadopago
│       ├── src/
│       │   ├── index.ts
│       │   ├── types.ts
│       │   ├── server/
│       │   ├── client/
│       │   ├── database/
│       │   └── utils/
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
├── apps/
│   ├── web/                         # Demo app (Next.js)
│   │   └── src/
│   │       ├── app/
│   │       │   ├── page.tsx         # Demo de pagos
│   │       │   ├── subscriptions/  # Demo de suscripciones
│   │       │   └── marketplace/     # Demo de split
│   │       └── components/
│   └── docs/                        # Fumadocs
│       └── src/content/
├── packages/
│   ├── auth/                        # better-auth config
│   ├── db/                          # Prisma schema
│   ├── env/                         # Environment types
│   └── config/                      # Shared config
├── turbo.json
├── package.json
└── README.md
```

---

## 11. Flujos de Usuario

### 11.1 Flujo de Pago Único (con items)

```
1. User hace click en "Pagar"
2. authClient.mercadopago.createPayment({
     items: [
       { id: "prod_1", title: "Producto", quantity: 2, unitPrice: 1500 }
     ],
     email: "user@test.com"
   })
3. Plugin:
   - Calcula total de items (quantity * unitPrice)
   - Crea preferencia en MP con items
   - Obtiene payment_link
4. Redirect user a payment_link
5. User completa pago en MP
6. MP envía webhook → plugin actualiza estado
7. Plugin ejecuta onPaymentApproved({ payment, user, items })
8. User redirecteado a redirectAfterSuccess
```

### 11.2 Flujo de Suscripción (con items)

```
1. User hace click en "Suscribirse"
2. authClient.mercadopago.createSubscription({
     items: [{ id: "plan_premium", title: "Premium", quantity: 1, unitPrice: 1500 }],
     frequency: 1,
     frequencyType: "months"
   })
3. Plugin:
   - Guarda items en la DB
   - Crea PreApproval con items en descripción
   - Obtiene init_point
4. Redirect user a init_point
5. User completa pago en MP
6. MP envía webhook subscription_preapproval
7. Plugin ejecuta onSubscriptionActivated({ subscription, user, items })
```

### 11.3 Flujo de Marketplace (con items)

```
1. Vendedor registra producto
2. Comprador paga con items:
   authClient.mercadopago.createPayment({
     items: [{ id: "prod_001", title: "Zapatillas", quantity: 1, unitPrice: 25000 }],
     splitEnabled: true,
     sellerEmail: "vendedor@email.com"
   })
3. Plugin automáticamente:
   - Lee items del array
   - Calcula comisión sobre el total
   - Envia monto total al receiver (tu cuenta)
   - Registra comisión y netAmount
   - Guarda items en DB para referencia
4. Webhook actualiza estado
5. onPaymentApproved recibe items para notificar al vendedor
```

---

## 12. Documentación (Fumadocs)

### Secciones

- Getting Started (ES + EN)
- Pagos con items
- Suscripciones con items
- Marketplace con items
- API Reference
- Ejemplos

---

## 13. Diferenciación vs Alternativas

| Característica             | better-auth-mercadopago | goncy/next-mercadopago |
| -------------------------- | ----------------------- | ---------------------- |
| Framework-agnostic         | ✅ better-auth          | ❌ Solo Next.js        |
| **Items en pagos**         | ✅ Array completo       | ⚠️ Básico              |
| **Items en suscripciones** | ✅                      | ❌                     |
| **Items en split**         | ✅                      | ❌                     |
| Callbacks automáticos      | ✅ + items              | ❌ Manual              |
| Suscripciones con planes   | ✅ + items              | ⚠️ Parcial             |
| Split/Marketplace          | ✅ + tracking           | ✅                     |
| Documentación              | ES + EN                 | ES                     |
| Tipos TypeScript           | ✅ Completos            | ⚠️ Básicos             |

---

## 14. Roadmap

### Phase 1 (MVP - 2 semanas)

- [ ] Plugin base con pagos únicos + items
- [ ] Webhook handler
- [ ] Callbacks básicos con items (approved, rejected)
- [ ] Demo en Next.js
- [ ] Docs básicas

### Phase 2 (1 semana)

- [ ] Suscripciones sin plan + items
- [ ] Callbacks de suscripciones con items
- [ ] Docs de suscripciones

### Phase 3 (1 semana)

- [ ] Suscripciones con planes + items
- [ ] CRUD de planes con items
- [ ] Docs marketplace

### Phase 4 (1 semana)

- [ ] Split/Marketplace + items
- [ ] Comisión tracking por items
- [ ] Docs completas
- [ ] Tests

---

## 15. Métricas de Éxito

- Tiempo de integración: <10 min para caso básico
- Cobertura de tipos TypeScript: 100%
- Documentación: 0 ambigüedad
- Items siempre incluidos en callbacks
