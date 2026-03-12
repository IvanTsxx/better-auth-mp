"use client";

import { createMercadopagoClient } from "@better-auth-mercadopago/plugin/client";
import type {
  MercadopagoItem,
  CreateSubscriptionInput,
} from "@better-auth-mercadopago/plugin/types";
import {
  RefreshCw,
  Calendar,
  Zap,
  Crown,
  Building2,
  ArrowRight,
  Loader2,
  Check,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

const mercadopago = createMercadopagoClient(authClient);

/**
 * Planes de suscripción de demo
 */
const PLANES_DEMO = [
  {
    description: "Funciones esenciales para individuos",
    frequency: 1,
    frequencyType: "months" as const,
    id: "plan_basic",
    name: "Plan Básico",
    price: 990,
  },
  {
    description: "Funciones avanzadas para profesionales",
    frequency: 1,
    frequencyType: "months" as const,
    id: "plan_pro",
    name: "Plan Pro",
    price: 1990,
  },
  {
    description: "Acceso completo para equipos",
    frequency: 1,
    frequencyType: "months" as const,
    id: "plan_enterprise",
    name: "Plan Empresa",
    price: 4990,
  },
];

const PLAN_ICONS = {
  plan_basic: Zap,
  plan_enterprise: Building2,
  plan_pro: Crown,
};

const PLAN_COLORS = {
  plan_basic: "text-blue-500",
  plan_enterprise: "text-amber-500",
  plan_pro: "text-purple-500",
};

function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

export default function SubscriptionsPage() {
  const [selectedPlan, setSelectedPlan] = useState<
    (typeof PLANES_DEMO)[number] | null
  >(null);
  const [customPrice, setCustomPrice] = useState("");
  const [customFrequency, setCustomFrequency] = useState<"months" | "years">(
    "months"
  );
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSelect = (plan: (typeof PLANES_DEMO)[number]) => {
    setSelectedPlan(plan);
  };

  const handleSubscribe = async () => {
    if (!selectedPlan || !email) {
      setError("Selecciona un plan e ingresa tu email");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const items: MercadopagoItem[] = [
        {
          description: selectedPlan.description,
          id: selectedPlan.id,
          quantity: 1,
          title: selectedPlan.name,
          unitPrice: selectedPlan.price,
        },
      ];

      const result = await mercadopago.createSubscription({
        currency: "ARS",
        email,
        externalReference: `demo_sub_${Date.now()}`,
        frequency: selectedPlan.frequency,
        frequencyType: selectedPlan.frequencyType,
        items,
      } as CreateSubscriptionInput);

      console.log("Suscripción creada:", result);
      toast.success(`Suscripción creada! Link: ${result.subscriptionLink}`);
    } catch (err) {
      console.error("Error al crear suscripción:", err);
      setError("Error al crear la suscripción. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomSubscribe = async () => {
    if (!customPrice || !email) {
      setError("Ingresa un precio y tu email");
      return;
    }

    const price = Number.parseInt(customPrice, 10) * 100;
    const planId = `custom_${Date.now()}`;

    setIsLoading(true);
    setError(null);

    try {
      const items: MercadopagoItem[] = [
        {
          description: "Plan personalizado",
          id: planId,
          quantity: 1,
          title: "Suscripción Personalizada",
          unitPrice: price,
        },
      ];

      const result = await mercadopago.createSubscription({
        currency: "ARS",
        email,
        externalReference: `demo_custom_sub_${Date.now()}`,
        frequency: 1,
        frequencyType: customFrequency,
        items,
      } as CreateSubscriptionInput);

      console.log("Suscripción personalizada:", result);
      toast.success(`Suscripción creada! Link: ${result.subscriptionLink}`);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al crear la suscripción.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <RefreshCw className="h-8 w-8" />
          Suscripciones - Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Ejemplo de cómo crear suscripciones recurrentes con el plugin de
          MercadoPago
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Selección de Plan */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Elegir un Plan
          </h2>

          {PLANES_DEMO.map((plan) => {
            const Icon = PLAN_ICONS[plan.id as keyof typeof PLAN_ICONS];
            const colorClass = PLAN_COLORS[plan.id as keyof typeof PLAN_COLORS];
            const isSelected = selectedPlan?.id === plan.id;

            return (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "hover:border-muted-foreground"
                }`}
                onClick={() => handlePlanSelect(plan)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-muted ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{plan.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {formatPrice(plan.price)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        /{plan.frequencyType === "months" ? "mes" : "año"}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-primary">
                      <Check className="h-4 w-4" />
                      <span className="text-sm font-medium">Seleccionado</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Plan Personalizado */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-lg">Plan Personalizado</CardTitle>
              <CardDescription>
                Crea tu propio plan con precio personalizado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="custom-price">Precio (ARS)</Label>
                  <Input
                    id="custom-price"
                    type="number"
                    placeholder="19.90"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
                <div className="w-32 space-y-2">
                  <Label>Frecuencia</Label>
                  <div className="flex gap-1">
                    <Button
                      variant={
                        customFrequency === "months" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCustomFrequency("months")}
                      className="flex-1"
                    >
                      Mes
                    </Button>
                    <Button
                      variant={
                        customFrequency === "years" ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setCustomFrequency("years")}
                      className="flex-1"
                    >
                      Año
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Formulario de Suscripción */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Suscribirse</CardTitle>
              <CardDescription>
                Completá los datos de tu suscripción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resumen */}
              <div className="rounded-lg bg-muted p-4">
                <h4 className="font-medium mb-2">Resumen de Suscripción</h4>
                {selectedPlan ? (
                  <div className="flex justify-between">
                    <span>{selectedPlan.name}</span>
                    <span>
                      {formatPrice(selectedPlan.price)}/
                      {selectedPlan.frequencyType === "months" ? "mes" : "año"}
                    </span>
                  </div>
                ) : customPrice ? (
                  <div className="flex justify-between">
                    <span>Plan Personalizado</span>
                    <span>
                      ${customPrice}/
                      {customFrequency === "months" ? "mes" : "año"}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Selecciona un plan o crea uno personalizado
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="sub-email">Email</Label>
                <Input
                  id="sub-email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Error */}
              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                  {error}
                </div>
              )}

              {/* Botón de Suscripción */}
              <Button
                className="w-full"
                size="lg"
                disabled={
                  (!selectedPlan && !customPrice) || !email || isLoading
                }
                onClick={selectedPlan ? handleSubscribe : handleCustomSubscribe}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    Suscribirse
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Las suscripciones se renuevan automáticamente hasta que se
                cancelen
              </p>
            </CardContent>
          </Card>

          {/* Características */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Qué obtenés</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {[
                  "Facturación recurrente automática",
                  "Cancelar o pausar en cualquier momento",
                  "Acceso a funciones premium",
                  "Notificaciones por email",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Ejemplo de Código */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ejemplo de Uso</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                <code>{`await mercadopago.createSubscription({
  items: [{
    id: "plan_pro",
    title: "Plan Pro",
    quantity: 1,
    unitPrice: 1990,
  }],
  currency: "ARS",
  frequency: 1,
  frequencyType: "months",
});`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
