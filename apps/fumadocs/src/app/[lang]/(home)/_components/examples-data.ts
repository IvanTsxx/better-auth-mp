export const initCode = [
  {
    code: `import { betterAuth } from "better-auth";
import { mercadopago } from "@better-auth/mercadopago";

export const auth = betterAuth({
  plugins: [
    mercadopago({
      accessToken: process.env.MP_ACCESS_TOKEN!,
      // Puedes pasar más opciones aquí
    }),
  ],
});`,
    lang: "tsx",
    title: "auth.ts",
  },
  {
    code: `import { createAuthClient } from "better-auth/react"; // o vue, svelte, solid
import { mercadopagoClient } from "@better-auth/mercadopago/client";

export const authClient = createAuthClient({
  plugins: [
    mercadopagoClient(),
  ],
});`,
    lang: "tsx",
    title: "auth-client.ts",
  },
];

export const checkoutProCode = [
  {
    code: `import { authClient } from "@/lib/auth-client";

export function CheckoutButton() {
  const handlePayment = async () => {
    const result = await authClient.mercadoPago.createPayment({
      backUrls: {
        success: \`\${window.location.origin}/payments/success\`
      },
      items: [
        { 
          id: "prod_1", 
          title: "Plan Premium", 
          quantity: 1, 
          unitPrice: 1500, 
          currencyId: "ARS" 
        }
      ]
    });

    if (result.data) {
      window.location.href = result.data.checkoutUrl;
    }
  };

  return <button onClick={handlePayment}>Pagar con Mercado Pago</button>;
}`,
    lang: "tsx",
    title: "React",
  },
  {
    code: `<script setup>
import { authClient } from "@/lib/auth-client";

const handlePayment = async () => {
  const result = await authClient.mercadoPago.createPayment({
    backUrls: {
      success: \`\${window.location.origin}/payments/success\`
    },
    items: [
      { id: "prod_1", title: "Plan Premium", quantity: 1, unitPrice: 1500, currencyId: "ARS" }
    ]
  });

  if (result.data) {
    window.location.href = result.data.checkoutUrl;
  }
};
</script>

<template>
  <button @click="handlePayment">Pagar con Mercado Pago</button>
</template>`,
    lang: "html",
    title: "Vue",
  },
  {
    code: `<script>
import { authClient } from "$lib/auth-client";

async function handlePayment() {
  const result = await authClient.mercadoPago.createPayment({
    backUrls: {
      success: \`\${window.location.origin}/payments/success\`
    },
    items: [
      { id: "prod_1", title: "Plan Premium", quantity: 1, unitPrice: 1500, currencyId: "ARS" }
    ]
  });

  if (result.data) {
    window.location.href = result.data.checkoutUrl;
  }
}
</script>

<button on:click={handlePayment}>Pagar con Mercado Pago</button>`,
    lang: "html",
    title: "Svelte",
  },
];

export const subscriptionsCode = [
  {
    code: `import { authClient } from "@/lib/auth-client";

export function SubscriptionButton() {
  const handleSubscribe = async () => {
    const result = await authClient.mercadoPago.createSubscription({
      reason: "Suscripción Mensual Pro",
      payerEmail: "user@example.com",
      autoRecurring: {
        frequency: 1,
        frequencyType: "months",
        transactionAmount: 5000,
        currencyId: "ARS"
      }
    });

    if (result.data) {
      window.location.href = result.data.checkoutUrl;
    }
  };

  return <button onClick={handleSubscribe}>Suscribirse</button>;
}`,
    lang: "tsx",
    title: "React",
  },
  {
    code: `<script setup>
import { authClient } from "@/lib/auth-client";

const handleSubscribe = async () => {
  const result = await authClient.mercadoPago.createSubscription({
    reason: "Suscripción Mensual Pro",
    payerEmail: "user@example.com",
    autoRecurring: {
      frequency: 1,
      frequencyType: "months",
      transactionAmount: 5000,
      currencyId: "ARS"
    }
  });

  if (result.data) {
    window.location.href = result.data.checkoutUrl;
  }
};
</script>

<template>
  <button @click="handleSubscribe">Suscribirse</button>
</template>`,
    lang: "html",
    title: "Vue",
  },
  {
    code: `<script>
import { authClient } from "$lib/auth-client";

async function handleSubscribe() {
  const result = await authClient.mercadoPago.createSubscription({
    reason: "Suscripción Mensual Pro",
    payerEmail: "user@example.com",
    autoRecurring: {
      frequency: 1,
      frequencyType: "months",
      transactionAmount: 5000,
      currencyId: "ARS"
    }
  });

  if (result.data) {
    window.location.href = result.data.checkoutUrl;
  }
}
</script>

<button on:click={handleSubscribe}>Suscribirse</button>`,
    lang: "html",
    title: "Svelte",
  },
];

export const marketplaceCode = [
  {
    code: `import { authClient } from "@/lib/auth-client";

export function LinkSellerButton() {
  const handleConnect = async () => {
    await authClient.mercadoPago.connectSeller({
      redirect_uri: "https://miapp.xyz/callback/mercadopago",
    });
  };

  return <button onClick={handleConnect}>Conectar Mercado Pago</button>;
}`,
    lang: "tsx",
    title: "React",
  },
  {
    code: `<script setup>
import { authClient } from "@/lib/auth-client";

const handleConnect = async () => {
  await authClient.mercadoPago.connectSeller({
    redirect_uri: "https://miapp.xyz/callback/mercadopago",
  });
};
</script>

<template>
  <button @click="handleConnect">Conectar Mercado Pago</button>
</template>`,
    lang: "html",
    title: "Vue",
  },
  {
    code: `<script>
import { authClient } from "$lib/auth-client";

async function handleConnect() {
  await authClient.mercadoPago.connectSeller({
    redirect_uri: "https://miapp.xyz/callback/mercadopago",
  });
}
</script>

<button on:click={handleConnect}>Conectar Mercado Pago</button>`,
    lang: "html",
    title: "Svelte",
  },
];
