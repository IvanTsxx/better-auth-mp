# PRD: better-auth-mercadopago Plugin

## 1. Overview del Proyecto

**Nombre del Plugin:** `@better-auth-mercadopago/plugin`

**Descripción:** Plugin para Better Auth que provee integración completa con las APIs de MercadoPago para pagos únicos (Checkout Pro), suscripciones recurrentes, y marketplace con split de pagos. Permite a desarrolladores implementar pagos de manera simple, type-safe y agnóstica al framework/DB.

** target audience:** Desarrolladores que usan Better Auth y necesitan integrar pagos con MercadoPago en sus aplicaciones.

**Inspiración:** El plugin sigue el patrón de plugins existentes como `better-auth/plugins` - agnóstico, extensible, con migraciones automáticas.

---

## 2. Integraciones a Implementar

### 2.1 Checkout Pro (Pagos Únicos)

- Creación de preferencias de pago
- Redirección a URL de pago de MercadoPago
- Recepción de webhooks para notificaciones
- Verificación de firma del webhook
- Validación de monto (prevención de fraude)
- Estados: `pending`, `approved`, `rejected`, `refunded`, `cancelled`, `in_process`
- Idempotencia para evitar duplicados

### 2.2 Suscripciones

- Suscripciones sin plan (pago pendiente)
- Suscripciones con plan asociado
- Periodicidad: diaria (`days`), semanal (`weeks`), mensual (`months`), anual (`months` con 12)
- Estados: `pending`, `authorized`, `paused`, `cancelled`, `expired`, `unpaid`
- Webhooks para cambios de estado
- Renovación automática manejada por MP

### 2.3 Marketplace (Split de Pagos)

- OAuth flow para autorización de vendedores
- Creación de preferencias en nombre de vendedores
- Configuración de `marketplace_fee` (comisión fija o porcentaje)
- Manejo de refresh tokens (token rotation)
- Listado de vendedores conectados

---

## 3. API del Plugin

### 3.1 Configuración del Plugin

```typescript
import { betterAuth } from "better-auth";
import { mercadopagoPlugin } from "@better-auth-mercadopago/plugin";

export const auth = betterAuth({
  plugins: [
    mercadopagoPlugin({
      // Required: Access token de MercadoPago
      accessToken: process.env.MP_ACCESS_TOKEN,
      
      // Optional: URL base para callbacks (default: ctx.context.baseURL)
      baseUrl: process.env.APP_URL,
      
      // Optional: Secret para verificar firma del webhook
      webhookSecret: process.env.MP_WEBHOOK_SECRET,
      
      // Optional: Callback para eventos de pago
      onPaymentUpdate?: (event: PaymentEvent) => void | Promise<void>,
      
      // Optional: Callback para eventos de suscripción
      onSubscriptionUpdate?: (event: SubscriptionEvent) => void | Promise<void>,
      
      // Optional: Configuración de marketplace
      marketplace: {
        // Habilitar marketplace
        enabled: true,
        // Client ID para OAuth (obtenido de tu app en MercadoPago)
        clientId: process.env.MP_CLIENT_ID,
        // Client Secret para OAuth
        clientSecret: process.env.MP_CLIENT_SECRET,
        // URL de callback para OAuth
        redirectUri: `${process.env.APP_URL}/api/mercado-pago/oauth/callback`,
      }
    })
  ]
});
```

### 3.2 Tipos de Input/Output

```typescript
// ============================================
// SCHEMA DEFINITIONS (para el plugin)
// ============================================

// Tabla: mercadopagoPayment (pagos únicos)
interface MercadoPagoPaymentSchema {
  // ID externo generado por nosotros
  externalReference: string;
  // ID del usuario en better-auth
  userId: string;
  // ID del pago en MercadoPago (nullable hasta que se aprueba)
  mpPaymentId?: string;
  // ID de la preferencia
  preferenceId: string;
  // Estado del pago
  status: PaymentStatus;
  // Detalle del estado
  statusDetail?: string;
  // Monto en centavos
  amount: number;
  // Código de moneda (ARS, USD, BRL, etc.)
  currency: string;
  // ID del método de pago (visa, master, amex, pix, etc.)
  paymentMethodId?: string;
  // Tipo de método (credit_card, debit_card, ticket, account_money, etc.)
  paymentTypeId?: string;
  // Metadata guardada como JSON string
  metadata?: string;
  // Fecha de creación
  createdAt: Date;
  // Fecha de última actualización
  updatedAt: Date;
}

// Tabla: mercadopagoSubscription (suscripciones)
interface MercadoPagoSubscriptionSchema {
  // ID externo
  externalReference: string;
  // ID del usuario
  userId: string;
  // ID de suscripción en MP
  mpSubscriptionId?: string;
  // ID del plan (si es con plan)
  planId?: string;
  // Estado
  status: SubscriptionStatus;
  // Razón/descripción
  reason?: string;
  // Frecuencia de recurrencia
  autoRecurringFrequency?: number;
  autoRecurringFrequencyType?: "days" | "weeks" | "months";
  // Monto
  transactionAmount?: number;
  // Moneda
  currencyId?: string;
  // Email del pagador
  payerEmail?: string;
  // Fecha del próximo pago
  nextPaymentDate?: Date;
  // Metadata
  metadata?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tabla: mercadopagoPlan (planes de suscripción)
interface MercadoPagoPlanSchema {
  // ID del plan en MP
  mpPlanId: string;
  // Nombre del plan
  name: string;
  // Descripción
  description?: string;
  // Frecuencia
  autoRecurringFrequency: number;
  autoRecurringFrequencyType: "days" | "weeks" | "months";
  // Monto
  transactionAmount: number;
  // Moneda
  currencyId: string;
  // Metadata
  metadata?: string;
}

// Tabla: mercadopagoSeller (vendedores marketplace)
interface MercadoPagoSellerSchema {
  // ID del usuario en better-auth
  userId: string;
  // ID del vendedor en MP
  mpSellerId: string;
  // Access token (encriptado)
  accessToken: string;
  // Refresh token (encriptado)
  refreshToken?: string;
  // Cuándo expira el token
  tokenExpiresAt?: Date;
  // Estado de la conexión
  status?: string;
  // Cuándo se conectó
  dateConnected: Date;
}

// ============================================
// API INPUT TYPES
// ============================================

// Item para preferencia
interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currencyId: string;
  pictureUrl?: string;
  categoryId?: string;
}

// URLs de retorno
interface BackUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

// Input para crear preferencia
interface CreatePreferenceInput {
  items: PreferenceItem[];
  backUrls?: BackUrls;
  metadata?: Record<string, unknown>;
  // Para marketplace - ID del vendedor
  sellerId?: string;
  // Para marketplace - comisión (en centavos)
  marketplaceFee?: number;
  // Para evitar duplicados
  idempotencyKey?: string;
}

// Input para crear suscripción
interface CreateSubscriptionInput {
  // Razón de la suscripción
  reason: string;
  // Configuración de recurrencia
  autoRecurring: {
    frequency: number;
    frequencyType: "days" | "weeks" | "months";
    transactionAmount: number;
    currencyId: string;
    // Optional: fecha de inicio de facturación
    startDate?: string;
    // Optional: fecha de fin
    endDate?: string;
  };
  // Email del pagador
  payerEmail: string;
  // URLs de retorno
  backUrl?: string;
  // Metadata
  metadata?: Record<string, unknown>;
  // Idempotency
  idempotencyKey?: string;
}

// Input para crear suscripción con plan
interface CreateSubscriptionWithPlanInput {
  planId: string;
  payerEmail: string;
  // Token de tarjeta (del lado del cliente)
  cardTokenId: string;
  // Identificación del pagador
  identification?: {
    type: string;
    number: string;
  };
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
}

// Input para crear plan
interface CreatePlanInput {
  name: string;
  description?: string;
  autoRecurring: {
    frequency: number;
    frequencyType: "days" | "weeks" | "months";
    transactionAmount: number;
    currencyId: string;
  };
  metadata?: Record<string, unknown>;
}

// ============================================
// API OUTPUT TYPES
// ============================================

// Output de preferencia
interface PreferenceOutput {
  checkoutUrl: string;
  preferenceId: string;
  sandboxCheckoutUrl?: string;
}

// Output de suscripción
interface SubscriptionOutput {
  checkoutUrl: string;
  subscriptionId: string;
  status: string;
}

// Output de plan
interface PlanOutput {
  planId: string;
  name: string;
  url: string;
}

// Filtros para listar pagos
interface PaymentFilters {
  status?: PaymentStatus;
  dateCreatedFrom?: string;
  dateCreatedTo?: string;
}

// Filtros para listar suscripciones
interface SubscriptionFilters {
  status?: SubscriptionStatus;
  planId?: string;
}

// ============================================
// STATUS TYPES
// ============================================

type PaymentStatus = 
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

type SubscriptionStatus =
  | "pending"
  | "authorized"
  | "paused"
  | "cancelled"
  | "expired"
  | "unpaid";
```

### 3.3 API del Cliente (authClient)

```typescript
// ============================================
// CHECKOUT PRO - Pagos Únicos
// ============================================

// Crear preferencia de pago (Checkout Pro)
const { checkoutUrl, preferenceId } = await authClient.mercadopago.createPreference({
  items: [{
    id: "product-123",
    title: "Producto Premium",
    description: "Descripción del producto",
    quantity: 1,
    unitPrice: 10000, // En centavos (ARS 100,00)
    currencyId: "ARS"
  }],
  backUrls: {
    success: "https://miapp.com/pagos/exitoso",
    failure: "https://miapp.com/pagos/fallido",
    pending: "https://miapp.com/pagos/pendiente"
  },
  metadata: {
    orderId: "orden-456",
    userId: "user-789"
  }
});

// Obtener estado de un pago por external reference
const payment = await authClient.mercadopago.getPayment({
  externalReference: "orden-456"
});

// Listar pagos del usuario autenticado
const payments = await authClient.mercadopago.getPayments({
  filters: {
    status: "approved",
    dateCreatedFrom: "2024-01-01"
  },
  pagination: {
    limit: 20,
    offset: 0
  }
});

// ============================================
// SUSCRIPCIONES
// ============================================

// Crear suscripción (sin plan - pago pendiente)
const { checkoutUrl, subscriptionId } = await authClient.mercadopago.createSubscription({
  reason: "Suscripción Premium Mensual",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 4999,
    currencyId: "ARS"
  },
  payerEmail: "cliente@email.com",
  backUrl: "https://miapp.com/suscripcion/resultado",
  metadata: {
    planType: "premium"
  }
});

// Crear suscripción con plan (pago con tarjeta)
const subscription = await authClient.mercadopago.createSubscriptionWithPlan({
  planId: "plan_123",
  payerEmail: "cliente@email.com",
  cardTokenId: "card_token_del_cliente",
  identification: {
    type: "DNI",
    number: "12345678"
  }
});

// Obtener suscripción
const subData = await authClient.mercadopago.getSubscription({
  subscriptionId: "subscription_123"
});

// Listar suscripciones del usuario
const subscriptions = await authClient.mercadopago.getSubscriptions({
  filters: {
    status: "authorized"
  }
});

// Actualizar suscripción (pausar/reanudar)
await authClient.mercadopago.updateSubscription({
  subscriptionId: "subscription_123",
  status: "paused" // o "authorized" para reanudar
});

// Cancelar suscripción
await authClient.mercadopago.cancelSubscription({
  subscriptionId: "subscription_123"
});

// Crear plan de suscripción
const plan = await authClient.mercadopago.createPlan({
  name: "Plan Premium",
  description: "Acceso completo",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 9999,
    currencyId: "ARS"
  }
});

// Obtener plan
const planData = await authClient.mercadopago.getPlan({
  planId: "plan_123"
});

// Listar planes
const plans = await authClient.mercadopago.getPlans();

// ============================================
// MARKETPLACE
// ============================================

// Obtener URL de autorización OAuth
const authUrl = await authClient.mercadopago.getAuthorizationUrl();

// Procesar callback OAuth (en el servidor, no desde cliente)
// Este endpoint se configura en la redirectUri de MP

// Obtener vendedor conectado actual
const seller = await authClient.mercadopago.getConnectedSeller();

// Listar vendedores conectados (solo admins del marketplace)
const sellers = await authClient.mercadopago.listConnectedSellers();

// Desconectar vendedor
await authClient.mercadopago.disconnectSeller();
```

### 3.4 API del Servidor (auth.api)

Todas las operaciones del cliente están disponibles en `auth.api` para uso en Server Actions, API Routes, etc:

```typescript
// En una Server Action
async function createPayment(formData: FormData) {
  "use server";
  
  const result = await auth.api.mercadopago.createPreference({
    body: {
      items: [{
        id: "product-" + formData.get("productId"),
        title: formData.get("title") as string,
        quantity: 1,
        unitPrice: Number(formData.get("price")),
        currencyId: "ARS"
      }],
      metadata: {
        orderId: formData.get("orderId")
      }
    },
    headers: await headers()
  });
  
  redirect(result.checkoutUrl);
}

```

---

## 4. Endpoints del Plugin

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/mercado-pago/preference` | Crear preferencia | ✅ Session |
| GET | `/mercado-pago/payment/:externalReference` | Obtener pago | ✅ Session |
| GET | `/mercado-pago/payments` | Listar pagos | ✅ Session |
| POST | `/mercado-pago/subscription` | Crear suscripción | ✅ Session |
| GET | `/mercado-pago/subscription/:id` | Obtener suscripción | ✅ Session |
| GET | `/mercado-pago/subscriptions` | Listar suscripciones | ✅ Session |
| POST | `/mercado-pago/subscription/:id/update` | Actualizar suscripción | ✅ Session |
| POST | `/mercado-pago/subscription/:id/cancel` | Cancelar suscripción | ✅ Session |
| POST | `/mercado-pago/plan` | Crear plan | ✅ Session |
| GET | `/mercado-pago/plan/:id` | Obtener plan | ✅ Session |
| GET | `/mercado-pago/plans` | Listar planes | ✅ Session |
| GET | `/mercado-pago/oauth/authorize` | URL autorización OAuth | ❌ |
| GET | `/mercado-pago/oauth/callback` | Callback OAuth | ❌ |
| GET | `/mercado-pago/seller` | Vendedor conectado | ✅ Session |
| GET | `/mercado-pago/sellers` | Listar vendedores | ✅ Session (admin) |
| DELETE | `/mercado-pago/seller/:userId` | Desconectar vendedor | ✅ Session (admin) |
| POST | `/mercado-pago/webhook` | Webhook de MP | ❌ |

---

## 5. Esquema de Base de Datos

El esquema sigue el formato de better-auth para migraciones automáticas:

```typescript
// Schema para el plugin (definido en index.ts)
schema: {
  // ========================================
  // Pagos únicos (Checkout Pro)
  // ========================================
  mercadopagoPayment: {
    fields: {
      // Referencia externa (generada por nosotros)
      externalReference: {
        type: "string",
        required: true,
        unique: true
      },
      // Usuario que inició el pago
      userId: {
        type: "string",
        required: true,
        references: {
          model: "user",
          field: "id"
        }
      },
      // ID del pago en MercadoPago
      mpPaymentId: {
        type: "string",
        unique: true
      },
      // Preferencia asociada
      preferenceId: {
        type: "string",
        required: true
      },
      // Estado del pago
      status: {
        type: "string",
        required: true
      },
      // Detalle del estado
      statusDetail: {
        type: "string"
      },
      // Monto en centavos
      amount: {
        type: "number",
        required: true
      },
      // Moneda
      currency: {
        type: "string",
        required: true
      },
      // Método de pago
      paymentMethodId: {
        type: "string"
      },
      // Tipo de método
      paymentTypeId: {
        type: "string"
      },
      // Metadata como JSON string
      metadata: {
        type: "string"
      },
      // Fechas
      createdAt: {
        type: "date",
        required: true
      },
      updatedAt: {
        type: "date",
        required: true
      }
    }
  },

  // ========================================
  // Suscripciones
  // ========================================
  mercadopagoSubscription: {
    fields: {
      externalReference: {
        type: "string",
        required: true,
        unique: true
      },
      userId: {
        type: "string",
        required: true,
        references: {
          model: "user",
          field: "id"
        }
      },
      mpSubscriptionId: {
        type: "string",
        unique: true
      },
      planId: {
        type: "string"
      },
      status: {
        type: "string",
        required: true
      },
      reason: {
        type: "string"
      },
      autoRecurringFrequency: {
        type: "number"
      },
      autoRecurringFrequencyType: {
        type: "string"
      },
      transactionAmount: {
        type: "number"
      },
      currencyId: {
        type: "string"
      },
      payerEmail: {
        type: "string"
      },
      nextPaymentDate: {
        type: "date"
      },
      metadata: {
        type: "string"
      },
      createdAt: {
        type: "date",
        required: true
      },
      updatedAt: {
        type: "date",
        required: true
      }
    }
  },

  // ========================================
  // Planes de suscripción
  // ========================================
  mercadopagoPlan: {
    fields: {
      mpPlanId: {
        type: "string",
        required: true,
        unique: true
      },
      name: {
        type: "string",
        required: true
      },
      description: {
        type: "string"
      },
      autoRecurringFrequency: {
        type: "number",
        required: true
      },
      autoRecurringFrequencyType: {
        type: "string",
        required: true
      },
      transactionAmount: {
        type: "number",
        required: true
      },
      currencyId: {
        type: "string",
        required: true
      },
      metadata: {
        type: "string"
      }
    }
  },

  // ========================================
  // Vendedores Marketplace
  // ========================================
  mercadopagoSeller: {
    fields: {
      userId: {
        type: "string",
        required: true,
        references: {
          model: "user",
          field: "id"
        }
      },
      mpSellerId: {
        type: "string",
        required: true
      },
      accessToken: {
        type: "string",
        required: true
      },
      refreshToken: {
        type: "string"
      },
      tokenExpiresAt: {
        type: "date"
      },
      status: {
        type: "string"
      },
      dateConnected: {
        type: "date",
        required: true
      }
    }
  }
}
```

---

## 6. Webhooks

### 6.1 Eventos a Manejar

| Tipo | Evento | Acción en DB |
|------|--------|--------------|
| payment | payment.created | Crear/actualizar registro |
| payment | payment.updated | Actualizar estado |
| subscription | subscription.created | Crear registro |
| subscription | subscription.updated | Actualizar estado |
| subscription | subscription.authorized | Activar servicio |
| subscription | subscription.paused | Pausar servicio |
| subscription | subscription.resumed | Reactivar servicio |
| subscription | subscription.cancelled | Cancelar servicio |
| subscription | subscription.payment_failed | Notificar usuario |

### 6.2 Verificación de Firma

```typescript
// El plugin maneja esto automáticamente si se provee webhookSecret
// Pero el desarrollador puede implementar su propia verificación

function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const crypto = require('crypto');
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}
```

### 6.3 Estructura del Webhook

```typescript
// Notificación recibida de MercadoPago
interface MPWebhookNotification {
  type: "payment" | "subscription" | "plan" | "subscription_preapproval";
  action: string;
  data: {
    id: string;
  };
}
```

---

## 7. Consideraciones de Seguridad

1. **Verificación de firma**: Siempre verificar `x-signature` si se configura `webhookSecret`
2. **Validación de monto**: Verificar que el monto del pago coincida con el registrado
3. **Idempotencia**: Usar `idempotencyKey` y cache en memoria para evitar duplicados
4. **Rate limiting**: Implementar límites por usuario en endpoints de creación
5. **Sanitización de metadata**: No permitir claves reservadas (`userId`, `externalReference`)
6. **Encriptación de tokens**: Los tokens de marketplace deben almacenarse encriptados
7. **No almacenar tarjetas**: Solo almacenar tokens, nunca datos de tarjetas

---

## 8. Roadmap de Implementación

### Fase 1: Core + Checkout Pro
- [ ] Estructura base del plugin
- [ ] Schema de base de datos
- [ ] Endpoint crear preferencia
- [ ] Webhook handler para pagos
- [ ] Verificación de firma
- [ ] Idempotencia
- [ ] Client plugin básico

### Fase 2: Suscripciones
- [ ] Schema de suscripciones y planes
- [ ] Crear suscripción (sin plan)
- [ ] Crear suscripción (con plan)
- [ ] Webhook handler para suscripciones
- [ ] Endpoints CRUD (get, list, update, cancel)

### Fase 3: Marketplace
- [ ] Schema de vendedores
- [ ] OAuth flow (authorize + callback)
- [ ] Refresh token rotation
- [ ] Crear preferencia en nombre del vendedor
- [ ] Listar/desconectar vendedores
- [ ] Split de pagos (marketplace_fee)

### Fase 4: Demo + Docs
- [ ] Demo en apps/web
- [ ] Documentación en apps/fumadocs

---

## 9. Estructura de Archivos Propuesta

```
packages/plugin/
├── src/
│   ├── index.ts              # Plugin principal
│   ├── client-plugin.ts      # Client plugin
│   ├── types.ts              # Tipos TypeScript
│   ├── endpoints/
│   │   ├── preference.ts     # Endpoints de preferencias
│   │   ├── subscription.ts   # Endpoints de suscripciones
│   │   ├── plan.ts           # Endpoints de planes
│   │   ├── marketplace.ts    # Endpoints de marketplace
│   │   └── webhook.ts        # Webhook handler
│   ├── security/
│   │   ├── rate-limiter.ts   # Rate limiting
│   │   ├── idempotency.ts    # Cache de idempotencia
│   │   └── webhook-verify.ts # Verificación de firma
│   ├── mp-client.ts          # Cliente de MercadoPago
│   └── utils/
│       ├── metadata.ts       # Sanitización de metadata
│       └── currency.ts       # Validación de moneda
├── package.json
└── tsconfig.json
```

---

## 10. Referencias

- [Documentación de MercadoPago](https://www.mercadopago.com.ar/developers/es/docs)
- [Better Auth Plugins 1](https://better-auth.com/docs/concepts/plugins)
- [Better Auth Plugins 2](https://better-auth.com/docs/guides/your-first-plugin)
- [Ejemplo](https://github.com/IvanTsxx/better-auth-mercadopago/tree/main/src)
