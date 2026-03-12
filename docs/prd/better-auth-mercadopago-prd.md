# PRD: better-auth-mercadopago Plugin

## 1. Overview del Proyecto

**Nombre del Plugin:** `better-auth-mercadopago`

**Descripción:** Plugin para Better Auth que provee integración completa con todas las APIs de MercadoPago (Checkout Pro, Checkout Bricks, Checkout API, Suscripciones, Marketplace/Split de pagos). Permite a desarrolladores implementar pagos y suscripciones en sus aplicaciones de manera simple y type-safe.

** target audience:** Desarrolladores que usan Better Auth y necesitan integrar pagos con MercadoPago en sus aplicaciones.

---

## 2. Integraciones de MercadoPago a Implementar

### 2.1 Checkout Pro
- Creación de preferencias de pago
- Redirección a URL de pago de MercadoPago
- Recepción de webhooks para notificaciones de pago
- Verificación de autenticidad del pago
- Estados: `pending`, `approved`, `rejected`, `refunded`, `cancelled`

### 2.2 Checkout Bricks
- Integración con `@mercadopago/sdk-react`
- Componente `CardPayment` para UI embebida
- Tokenización de tarjetas del lado del cliente
- Procesamiento de pago desde el servidor

### 2.3 Checkout API
- Integración con componentes individuales (`CardNumber`, `SecurityCode`, `ExpirationDate`)
- Tokenización de tarjetas
- Creación de pagos directos
- Manejo de cuotas (installments)

### 2.4 Suscripciones
- Suscripciones sin plan asociado (pago pendiente)
- Suscripciones con plan asociado
- Periodicidad: diaria, semanal, mensual, anual
- Estados de suscripción: `pending`, `authorized`, `paused`, `cancelled`
- Webhooks para notificaciones de cambio de estado

### 2.5 Marketplace (Split de Pagos)
- OAuth flow para autorización de vendedores
- Creación de preferencias en nombre de vendedores
- Configuración de `marketplace_fee` (comisión)
- Manejo de refresh tokens

---

## 3. API del Plugin

### 3.1 Configuración del Plugin

```typescript
import { betterAuth } from "better-auth";
import { mercadopagoPlugin } from "@better-auth-mercadopago/plugin";

export const auth = betterAuth({
  plugins: [
    mercadopagoPlugin({
      // Credenciales de MercadoPago
      accessToken: process.env.MP_ACCESS_TOKEN,
      // URLs de callback
      webhookUrl: process.env.MP_WEBHOOK_URL,
      // Modo sandbox/producción
      sandbox: process.env.NODE_ENV !== "production",
      // Opciones adicionales
      marketplace: {
        enabled: true,
        clientId: process.env.MP_CLIENT_ID,
        clientSecret: process.env.MP_CLIENT_SECRET,
      }
    })
  ]
});
```

### 3.2 API del Cliente (authClient)

#### Pagos

```typescript
// Crear preferencia de pago (Checkout Pro)
const { initPoint } = await authClient.mercadopago.createPreference({
  items: [{
    id: "product-123",
    title: "Producto Premium",
    quantity: 1,
    unitPrice: 1000,
    currencyId: "ARS"
  }],
  metadata: {
    orderId: "order-456",
    userId: "user-789"
  },
  // URLs de retorno
  backUrls: {
    success: "https://miapp.com/pago/exitoso",
    failure: "https://miapp.com/pago/fallido",
    pending: "https://miapp.com/pago/pendiente"
  }
});

// Crear pago directo (Checkout API/Bricks)
const payment = await authClient.mercadopago.createPayment({
  token: "card_token_id", // Del lado del cliente
  transactionAmount: 1000,
  description: "Compra de producto",
  paymentMethodId: "visa",
  installments: 1,
  payer: {
    email: "cliente@email.com"
  },
  metadata: {
    orderId: "order-456"
  }
});

// Obtener estado de un pago
const paymentStatus = await authClient.mercadopago.getPayment({
  paymentId: "payment_id"
});

// Listar pagos del usuario actual
const payments = await authClient.mercadopago.getPayments({
  filters: {
    status: "approved",
    dateCreatedFrom: "2024-01-01",
    dateCreatedTo: "2024-12-31"
  },
  sort: {
    field: "dateCreated",
    order: "desc"
  },
  pagination: {
    limit: 20,
    offset: 0
  }
});

// Buscar pagos
const foundPayments = await authClient.mercadopago.searchPayments({
  query: "orden-123"
});

// Obtener medios de pago disponibles
const paymentMethods = await authClient.mercadopago.getPaymentMethods();

// Obtener configuraciones de cuotas
const installments = await authClient.mercadopago.getInstallments({
  paymentMethodId: "visa",
  transactionAmount: 1000
});

// Crear documento (facturación)
const document = await authClient.mercadopago.createDocument({
  type: "invoice",
  payer: {
    type: "individual",
    name: "Juan Perez",
    email: "juan@email.com",
    address: {...}
  },
  items: [...]
});
```

#### Suscripciones

```typescript
// Crear suscripción (sin plan)
const { initPoint } = await authClient.mercadopago.createSubscription({
  reason: "Suscripción Premium",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 500,
    currencyId: "ARS"
  },
  payer: {
    email: "cliente@email.com"
  },
  backUrl: "https://miapp.com/suscripcion/resultado"
});

// Crear suscripción (con plan)
const subscription = await authClient.mercadopago.createSubscriptionWithPlan({
  planId: "plan_id",
  payer: {
    email: "cliente@email.com",
    identification: {
      type: "DNI",
      number: "12345678"
    }
  },
  cardTokenId: "card_token_id"
});

// Obtener suscripción
const subscriptionData = await authClient.mercadopago.getSubscription({
  subscriptionId: "subscription_id"
});

// Listar suscripciones del usuario
const subscriptions = await authClient.mercadopago.getSubscriptions({
  filters: {
    status: "authorized",
    planId: "plan_id"
  }
});

// Actualizar suscripción
await authClient.mercadopago.updateSubscription({
  subscriptionId: "subscription_id",
  data: {
    status: "paused"
  }
});

// Cancelar suscripción
await authClient.mercadopago.cancelSubscription({
  subscriptionId: "subscription_id"
});

// Crear plan de suscripción
const plan = await authClient.mercadopago.createPlan({
  name: "Plan Premium",
  description: "Acceso completo a funcionalidades premium",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 999,
    currencyId: "ARS"
  }
});

// Listar planes
const plans = await authClient.mercadopago.getPlans();

// Obtener plan
const planData = await authClient.mercadopago.getPlan({
  planId: "plan_id"
});
```

#### Marketplace

```typescript
// Obtener URL de autorización OAuth
const authUrl = await authClient.mercadopago.getAuthorizationUrl({
  redirectUri: "https://miapp.com/marketplace/connect"
});

// Procesar callback OAuth
await authClient.mercadopago.handleOAuthCallback({
  code: "authorization_code"
});

// Obtener vendedor conectado
const connectedSeller = await authClient.mercadopago.getConnectedSeller();

// Crear preferencia en nombre del vendedor
const preference = await authClient.mercadopago.createSellerPreference({
  sellerAccessToken: "seller_token",
  items: [...],
  marketplaceFee: 50 // Comisión en centavos
});

// Listar vendedores conectados (para admins del marketplace)
const sellers = await authClient.mercadopago.listConnectedSellers();

// Desconectar vendedor
await authClient.mercadopago.disconnectSeller({
  sellerId: "seller_id"
});
```

#### Webhooks

```typescript
// Procesar webhook (solo servidor)
await authClient.mercadopago.processWebhook({
  topic: "payment",
  data: {
    id: "payment_id"
  }
});
```

### 3.3 API del Servidor (auth.api)

Todas las operaciones del cliente también están disponibles en `auth.api` para uso en Server Components, Server Actions, y API Routes:

```typescript
// Ejemplo en Server Action
async function createPaymentServer(formData: FormData) {
  "use server";
  
  const payment = await auth.api.mercadopago.createPayment({
    body: {
      token: formData.get("token"),
      transactionAmount: Number(formData.get("amount")),
      // ...
    },
    headers: await headers() // Required para autenticación
  });
  
  return payment;
}
```

---

## 4. Esquema de Base de Datos

### 4.1 Tablas Requeridas

```typescript
// Schema para better-auth (definido en el plugin)
schema: {
  // Tabla de pagos
  mercadopagoPayment: {
    fields: {
      // ID externo de MercadoPago
      mpPaymentId: {
        type: "string",
        required: true,
        unique: true
      },
      // ID del usuario en better-auth
      userId: {
        type: "string",
        required: true,
        references: {
          model: "user",
          field: "id"
        }
      },
      // Estado del pago
      status: {
        type: "string",
        required: true
      },
      // Monto en centavos
      transactionAmount: {
        type: "number",
        required: true
      },
      // Moneda
      currencyId: {
        type: "string",
        required: true
      },
      // Descripción
      description: {
        type: "string"
      },
      // ID del método de pago
      paymentMethodId: {
        type: "string"
      },
      // Cantidad de cuotas
      installments: {
        type: "number"
      },
      // Email del pagador
      payerEmail: {
        type: "string"
      },
      // Metadata guardada
      metadata: {
        type: "string" // JSON string
      },
      // Fecha de creación en MP
      dateCreated: {
        type: "date"
      },
      // Fecha de aprobación
      dateApproved: {
        type: "date"
      },
      // Tipo de checkout usado
      checkoutType: {
        type: "string", // "pro" | "bricks" | "api"
        required: true
      }
    }
  },
  
  // Tabla de suscripciones
  mercadopagoSubscription: {
    fields: {
      mpSubscriptionId: {
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
      dateCreated: {
        type: "date"
      },
      dateLastModified: {
        type: "date"
      }
    }
  },
  
  // Tabla de planes
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
  
  // Tabla de preferencias
  mercadopagoPreference: {
    fields: {
      mpPreferenceId: {
        type: "string",
        required: true,
        unique: true
      },
      userId: {
        type: "string",
        references: {
          model: "user",
          field: "id"
        }
      },
      mpPaymentId: {
        type: "string"
      },
      status: {
        type: "string"
      },
      initPoint: {
        type: "string"
      },
      sandboxInitPoint: {
        type: "string"
      },
      items: {
        type: "string" // JSON
      },
      metadata: {
        type: "string"
      },
      backUrls: {
        type: "string" // JSON
      },
      marketplaceFee: {
        type: "number"
      },
      dateCreated: {
        type: "date"
      }
    }
  },
  
  // Tabla de vendedores marketplace
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

## 5. Webhooks

### 5.1 Eventos a Manejar

| Evento | Descripción | Acción |
|--------|-------------|--------|
| `payment.created` | Pago creado | Crear registro en BD |
| `payment.updated` | Pago actualizado | Actualizar estado |
| `payment.wallet.created` | Wallet creado | - |
| `subscription.created` | Suscripción creada | Crear registro |
| `subscription.updated` | Suscripción actualizada | Actualizar estado |
| `subscription.authorized` | Suscripción autorizada | Activar servicio |
| `subscription.paused` | Suscripción pausada | Pausar servicio |
| `subscription.resumed` | Suscripción reiniciada | Reactivar servicio |
| `subscription.cancelled` | Suscripción cancelada | Desactivar servicio |
| `subscription.payment_failed` | Pago de suscripción fallido | Notificar usuario |

### 5.2 Verificación de Webhook

```typescript
// Verificar firma del webhook
function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

---

## 6. Tipos TypeScript

### 6.1 Tipos Principales

```typescript
// Tipos de Payment
interface Payment {
  id: string;
  status: PaymentStatus;
  statusDetail: string;
  transactionAmount: number;
  currencyId: string;
  description?: string;
  paymentMethodId: string;
  installments: number;
  payer: Payer;
  metadata?: Record<string, unknown>;
  dateCreated: Date;
  dateApproved?: Date;
  dateLastModified: Date;
}

type PaymentStatus = 
  | "pending"
  | "approved"
  | "active"
  | "rejected"
  | "refunded"
  | "cancelled"
  | "in_process"
  | "in_mediation"
  | "pending_review_manual";

// Tipos de Subscription
interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planId?: string;
  reason: string;
  autoRecurring: AutoRecurring;
  payer: Payer;
  metadata?: Record<string, unknown>;
  dateCreated: Date;
  dateLastModified: Date;
  nextPaymentDate?: Date;
}

type SubscriptionStatus =
  | "pending"
  | "authorized"
  | "paused"
  | "cancelled"
  | "expired"
  | "unpaid";

// Tipos de Payer
interface Payer {
  id?: string;
  email: string;
  identification?: {
    type: string;
    number: string;
  };
  address?: Address;
  phone?: Phone;
}

// Tipos de Preference
interface Preference {
  id: string;
  initPoint: string;
  sandboxInitPoint?: string;
  items: Item[];
  metadata?: Record<string, unknown>;
  backUrls?: BackUrls;
  marketplaceFee?: number;
  status: string;
  dateCreated: Date;
}

interface Item {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  currencyId: string;
  pictureUrl?: string;
  categoryId?: string;
}
```

---

## 7. UI Components (React)

El plugin incluirá componentes de React para facilitar la integración:

```tsx
// Componentes disponibles
import { 
  // Checkout Pro
  PaymentButton,
  
  // Checkout Bricks  
  CardPaymentBrick,
  WalletBrick,
  StatusScreenBrick,
  
  // Checkout API
  CardNumberField,
  SecurityCodeField,
  ExpirationDateField,
  
  // Suscripciones
  SubscriptionButton,
  SubscriptionStatusBadge,
  
  // Marketplace
  ConnectSellerButton,
  SellerInfoCard
} from "@better-auth-mercadopago/plugin/react";
```

### Ejemplo de uso

```tsx
"use client";

import { 
  initMercadoPago, 
  CardPaymentBrick 
} from "@better-auth-mercadopago/plugin/react";
import { useEffect, useRef } from "react";

export function CheckoutForm({ amount }: { amount: number }) {
  const formRef = useRef<HTMLFormElement>(null);
  
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!);
  }, []);
  
  const handleSubmit = async (data: CardPaymentFormData) => {
    await createPayment({
      token: data.token,
      transactionAmount: amount,
      // ...
    });
  };
  
  return (
    <form ref={formRef}>
      <CardPaymentBrick
        initialization={{ amount }}
        onSubmit={handleSubmit}
        customization={{
          paymentMethods: {
            maxInstallments: 6,
            minInstallments: 1
          }
        }}
      />
    </form>
  );
}
```

---

## 8. Demo y Documentación

### 8.1 Demo (apps/web)

La aplicación demo mostrará:

1. **Checkout Pro**: Botón de pago que redirige a MercadoPago
2. **Checkout Bricks**: Formulario embebido con CardPayment
3. **Checkout API**: Componentes individuales para tokenización
4. **Suscripciones**: Flow completo de suscripción
5. **Marketplace**: Conexión de vendedores y split de pagos

### 8.2 Documentación (apps/fumadocs)

La documentación incluirá:

1. **Getting Started**: Instalación y configuración inicial
2. **Guías por integración**:
   - Checkout Pro
   - Checkout Bricks  
   - Checkout API
   - Suscripciones
   - Marketplace
3. **API Reference**: Todos los métodos disponibles
4. **Ejemplos de código**: Casos de uso comunes
5. **Webhooks**: Configuración y manejo de eventos
6. **Types**: Documentación de tipos TypeScript

---

## 9. Consideraciones de Seguridad

1. **Validación de webhooks**: Siempre verificar firma
2. **Tokenización**: Nunca manejar tarjetas directamente
3. **Credenciales**: Usar variables de entorno
4. **IDempotency**: Usar claves de idempotencia en pagos
5. **Rate limiting**: Implementar límites en endpoints
6. **Sanitización**: Validar y sanitizar metadata

---

## 10. Roadmap de Implementación

### Fase 1: Core
- [ ] Schema de base de datos
- [ ] Endpoints básicos de Payments
- [ ] Webhook handler
- [ ] Client plugin básico

### Fase 2: Checkout Pro
- [ ] Crear preferencia
- [ ] Redirección a pago
- [ ] Manejo de callbacks

### Fase 3: Suscripciones
- [ ] CRUD de suscripciones
- [ ] Planes
- [ ] Estados y transiciones

### Fase 4: Marketplace
- [ ] OAuth flow
- [ ] Split de pagos
- [ ] Gestión de vendedores

### Fase 5: Checkout Bricks/API
- [ ] Componentes React
- [ ] Tokenización
- [ ] Crear pago directo

### Fase 6: Demo y Docs
- [ ] Aplicación demo completa
- [ ] Documentación en Fumadocs
- [ ] Ejemplos adicionales
