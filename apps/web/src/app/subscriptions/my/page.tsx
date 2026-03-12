"use client";

import {
  CreditCard,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export default function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authClient.mercadoPago.getSubscriptions({
        filters: { status: "authorized" },
        limit: 50,
      } as never);
      if (result.data) {
        setSubscriptions(result.data.subscriptions as Subscription[]);
      }
    } catch (err) {
      console.error("Error loading subscriptions:", err);
      toast.error("Error al cargar suscripciones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

  const handleCancel = async (subscriptionId: string) => {
    setCancellingId(subscriptionId);
    try {
      const result = await authClient.mercadoPago.cancelSubscription({
        subscriptionId,
      } as never);

      if (result.error) {
        throw new Error(result.error.message);
      }

      toast.success("Suscripción cancelada");
      loadSubscriptions();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      toast.error(`Error: ${message}`);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          Mis Suscripciones
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestioná tus suscripciones activas
        </p>
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No tenés suscripciones activas
            </h3>
            <p className="text-muted-foreground mb-4">
              Cuando actives una suscripción, aparecerá aquí
            </p>
            <Link href="/subscriptions">
              <Button>Crear Suscripción</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => {
            const config = STATUS_CONFIG[sub.status] || STATUS_CONFIG.pending;
            const Icon = config.icon;

            return (
              <Card key={sub.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{sub.reason}</h3>
                        <span
                          className={`flex items-center gap-1 text-sm font-medium ${config.color}`}
                        >
                          <Icon className="h-4 w-4" />
                          {config.label}
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {formatPrice(sub.transactionAmount)}
                        <span className="text-sm font-normal text-muted-foreground">
                          /mes
                        </span>
                      </p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          <span className="font-medium">Email:</span>{" "}
                          {sub.payerEmail}
                        </p>
                        <p>
                          <span className="font-medium">Desde:</span>{" "}
                          {formatDate(sub.createdAt)}
                        </p>
                        <p>
                          <span className="font-medium">
                            Última actualización:
                          </span>{" "}
                          {formatDate(sub.updatedAt)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCancel(sub.mpSubscriptionId)}
                      disabled={cancellingId === sub.mpSubscriptionId}
                    >
                      {cancellingId === sub.mpSubscriptionId ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Cancelar
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex gap-4">
        <Link href="/subscriptions">
          <Button variant="outline">← Nueva Suscripción</Button>
        </Link>
        <Link href="/subscriptions/history">
          <Button variant="outline">Ver Historial →</Button>
        </Link>
      </div>
    </div>
  );
}
