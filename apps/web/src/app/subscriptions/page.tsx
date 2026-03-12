"use client";

import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
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

function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface Subscription {
  id: string;
  mpSubscriptionId: string;
  status: string;
  reason: string;
  transactionAmount: number;
  currencyId: string;
  payerEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

const STATUS_CONFIG: Record<
  string,
  { icon: typeof CheckCircle; color: string; label: string }
> = {
  authorized: { color: "text-green-500", icon: CheckCircle, label: "Activa" },
  cancelled: { color: "text-red-500", icon: XCircle, label: "Cancelada" },
  expired: { color: "text-gray-500", icon: XCircle, label: "Expirada" },
  paused: { color: "text-blue-500", icon: Clock, label: "Pausada" },
  pending: { color: "text-yellow-500", icon: Clock, label: "Pendiente" },
};

export default function SubscriptionsPage() {
  const [email, setEmail] = useState("test_user_683487747@testuser.com");
  const [price, setPrice] = useState("10");
  const [frequency, setFrequency] = useState<"1" | "3" | "6" | "12">("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loadingSubscriptions, setLoadingSubscriptions] = useState(true);

  const priceCents = Number.parseInt(price, 10);

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoadingSubscriptions(true);
    try {
      const result = await authClient.mercadoPago.getSubscriptions({});
      if (result.data) {
        setSubscriptions(result.data.subscriptions as Subscription[]);
      }
    } catch (err) {
      console.error("Error loading subscriptions:", err);
    } finally {
      setLoadingSubscriptions(false);
    }
  };

  const handleSubscribe = async () => {
    if (!email || !price) {
      setError("Ingresa tu email y el precio");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const result = await authClient.mercadoPago.createSubscription({
        autoRecurring: {
          currencyId: "ARS",
          frequency: Number.parseInt(frequency, 10),
          frequencyType: "months",
          transactionAmount: priceCents,
        },
        payerEmail:
          process.env.NODE_ENV === "development"
            ? "test_user_683487747@testuser.com"
            : email,
        reason: `Suscripción mensual - ${formatPrice(priceCents)}`,
      });

      if (!result.data) {
        throw new Error(result.error?.message || "Error desconocido");
      }

      toast.success("Suscripción creada! Redirigiendo...");
      window.location.href = result.data.checkoutUrl;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      toast.error(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async (subscriptionId: string) => {
    try {
      const result = await authClient.mercadoPago.cancelSubscription({
        subscriptionId,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Suscripción cancelada");
      loadSubscriptions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error: ${message}`);
    }
  };

  const activeSubscriptions = subscriptions.filter(
    (s) => s.status === "authorized"
  );
  const otherSubscriptions = subscriptions.filter(
    (s) => s.status !== "authorized"
  );

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          Suscripciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestionar suscripciones recurrentes con MercadoPago
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Nueva Suscripción</CardTitle>
            <CardDescription>
              Crear una nueva suscripción recurrente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV !== "development" && (
              <div className="space-y-2">
                <Label htmlFor="email">Email del suscriptor</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Precio (ARS)</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="999"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Frecuencia</Label>
                <div className="flex gap-1">
                  {(["1", "3", "6", "12"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={frequency === f ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFrequency(f)}
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
                  Total por mes
                </span>
                <span className="text-2xl font-bold">
                  {formatPrice(priceCents)}
                </span>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              disabled={!email || !price || isLoading}
              onClick={handleSubscribe}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>Crear Suscripción</>
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              Serás redirigido a MercadoPago para completar el pago
            </p>
          </CardContent>
        </Card>

        {activeSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600">
                Suscripciones Activas
              </CardTitle>
              <CardDescription>Tus suscripciones vigentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeSubscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{sub.reason}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(sub.transactionAmount)}/mes •{" "}
                      {sub.payerEmail}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDate(sub.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600 text-sm font-medium">
                      Activa
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(sub.mpSubscriptionId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {otherSubscriptions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historial de Suscripciones</CardTitle>
              <CardDescription>Suscripciones anteriores</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {otherSubscriptions.map((sub) => {
                const config =
                  STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
                const Icon = config.icon;
                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-lg border opacity-75"
                  >
                    <div>
                      <p className="font-medium">{sub.reason}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(sub.transactionAmount)}/mes
                      </p>
                    </div>
                    <div className={`flex items-center gap-2 ${config.color}`}>
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {config.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {loadingSubscriptions && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {!loadingSubscriptions && subscriptions.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No tenés suscripciones aún
            </CardContent>
          </Card>
        )}

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Ejemplo de uso</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
              <code>{`await authClient.mercadoPago.createSubscription({
  reason: "Suscripción Premium",
  payerEmail: "user@example.com",
  autoRecurring: {
    frequency: 1,
    frequencyType: "months",
    transactionAmount: 99900,
    currencyId: "ARS"
  }
})`}</code>
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
