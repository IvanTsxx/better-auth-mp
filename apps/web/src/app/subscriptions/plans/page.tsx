"use client";

import { Package, Loader2, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(cents);
}

interface Plan {
  id: string;
  mpPlanId: string;
  name: string;
  description?: string;
  transactionAmount: number;
  currencyId: string;
  autoRecurringFrequency: number;
  autoRecurringFrequencyType: string;
  createdAt: Date;
}

export default function PlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Form state
  const [planName, setPlanName] = useState("");
  const [planDescription, setPlanDescription] = useState("");
  const [planPrice, setPlanPrice] = useState("");
  const [planFrequency, setPlanFrequency] = useState<"1" | "3" | "6" | "12">(
    "1"
  );

  const priceCents = Number.parseInt(planPrice, 10) || 0;

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authClient.mercadoPago.getPlans({ limit: 50 });
      if (result.data) {
        setPlans(result.data.plans as Plan[]);
      }
    } catch (err) {
      console.error("Error loading plans:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const handleCreatePlan = async () => {
    if (!planName || !planPrice) {
      toast.error("Completá el nombre y precio");
      return;
    }

    setCreating(true);
    try {
      const result = await authClient.mercadoPago.createPlan({
        autoRecurring: {
          currencyId: "ARS",
          frequency: Number.parseInt(planFrequency, 10),
          frequencyType: "months",
          transactionAmount: priceCents,
        },
        description: planDescription || undefined,
        name: planName,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Plan creado!");
      setPlanName("");
      setPlanDescription("");
      setPlanPrice("");
      loadPlans();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Package className="h-8 w-8" />
          Planes de Suscripción
        </h1>
        <p className="text-muted-foreground mt-2">
          Crear y gestionar planes de suscripción
        </p>
      </div>

      <div className="grid gap-6">
        {/* Create Plan Form */}
        <Card>
          <CardHeader>
            <CardTitle>Crear Nuevo Plan</CardTitle>
            <CardDescription>
              Los planes permiten a usuarios suscribirse con pago automático de
              tarjeta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planName">Nombre del Plan</Label>
                <Input
                  id="planName"
                  placeholder="Plan Premium"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planDescription">Descripción (opcional)</Label>
                <Input
                  id="planDescription"
                  placeholder="Acceso completo a..."
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="planPrice">Precio (ARS)</Label>
                <Input
                  id="planPrice"
                  type="number"
                  placeholder="9999"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Facturación</Label>
                <div className="flex gap-1">
                  {(["1", "3", "6", "12"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={planFrequency === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPlanFrequency(f)}
                    >
                      {f}m
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Precio por mes
                </span>
                <span className="text-2xl font-bold">
                  {formatPrice(priceCents)}
                </span>
              </div>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={!planName || !planPrice || creating}
              onClick={handleCreatePlan}
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear Plan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Plans List */}
        <Card>
          <CardHeader>
            <CardTitle>Planes Existentes</CardTitle>
            <CardDescription>
              {plans.length} plan{plans.length !== 1 ? "es" : ""} creado
              {plans.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : plans.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay planes creados
              </div>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div>
                      <p className="font-semibold">{plan.name}</p>
                      {plan.description && (
                        <p className="text-sm text-muted-foreground">
                          {plan.description}
                        </p>
                      )}
                      <p className="text-lg font-bold mt-1">
                        {formatPrice(plan.transactionAmount)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /
                          {plan.autoRecurringFrequencyType === "months"
                            ? "mes"
                            : ""}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {plan.mpPlanId}
                      </code>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              Ejemplo: Crear Suscripción con Plan
            </CardTitle>
            <CardDescription>
              Para crear una suscripción usando un plan, necesitás obtener un
              cardTokenId del cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`// 1. Obtén el cardTokenId del cliente (usando SDK de MP)
// 2. Crea la suscripción con el plan

await authClient.mercadoPago.createSubscriptionWithPlan({
  planId: "PLAN_ID_DEL_CLIENTE",
  payerEmail: "cliente@email.com",
  cardTokenId: "CARD_TOKEN_DEL_CLIENTE",
  identification: {
    type: "DNI",
    number: "12345678"
  }
})`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
