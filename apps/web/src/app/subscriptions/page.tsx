"use client";

import { CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
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

function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(cents);
}

export default function SubscriptionsPage() {
  const [email, setEmail] = useState("test_user_683487747@testuser.com");
  const [price, setPrice] = useState("100");
  const [frequency, setFrequency] = useState<"1" | "3" | "6" | "12">("1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceCents = Number.parseInt(price, 10);

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

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          Nueva Suscripción
        </h1>
        <p className="text-muted-foreground mt-2">
          Crear una nueva suscripción recurrente con MercadoPago
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Crear Suscripción</CardTitle>
            <CardDescription>
              Completá los datos para crear una nueva suscripción
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

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Gestionar Suscripciones</CardTitle>
            <CardDescription>
              Accedé a tus suscripciones activas o ver el historial
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Link href="/subscriptions/my" className="flex-1">
              <Button variant="outline" className="w-full">
                Mis Suscripciones
              </Button>
            </Link>
            <Link href="/subscriptions/history" className="flex-1">
              <Button variant="outline" className="w-full">
                Historial
              </Button>
            </Link>
          </CardContent>
        </Card>

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
