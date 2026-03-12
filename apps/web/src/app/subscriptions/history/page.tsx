"use client";

import { Loader2, CheckCircle, XCircle, Clock, History } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  unpaid: { color: "text-orange-500", icon: Clock, label: "Impaga" },
};

export default function SubscriptionHistoryPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authClient.mercadoPago.getSubscriptions({
        limit: 100,
      } as never);
      if (result.data) {
        setSubscriptions(result.data.subscriptions as Subscription[]);
      }
    } catch (err) {
      console.error("Error loading subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

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
          <History className="h-8 w-8" />
          Historial de Suscripciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Ver todas tus suscripciones (activas y anteriores)
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tenés suscripciones aún
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Activas ({activeSubscriptions.length})
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
                    <span className="text-green-600 text-sm font-medium">
                      Activa
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {otherSubscriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Historial ({otherSubscriptions.length})
                </CardTitle>
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
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sub.createdAt)} -{" "}
                          {formatDate(sub.updatedAt)}
                        </p>
                      </div>
                      <div
                        className={`flex items-center gap-2 ${config.color}`}
                      >
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
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/subscriptions">
          <Button variant="outline">← Nueva Suscripción</Button>
        </Link>
        <Link href="/subscriptions/my">
          <Button variant="outline">Mis Suscripciones →</Button>
        </Link>
      </div>
    </div>
  );
}
