"use client";

import { Clock, Home, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

/**
 * Extraer parámetros del query string de MercadoPago
 */
function extractPaymentParams(searchParams: URLSearchParams) {
  return {
    collectionId:
      searchParams.get("collection_id") || searchParams.get("payment_id"),
    collectionStatus: searchParams.get("collection_status"),
    externalReference: searchParams.get("external_reference"),
    merchantOrderId: searchParams.get("merchant_order_id"),
    paymentId: searchParams.get("payment_id"),
    paymentType: searchParams.get("payment_type"),
    preferenceId: searchParams.get("preference_id"),
    siteId: searchParams.get("site_id"),
    status: searchParams.get("status"),
  };
}

export default function PaymentPendingPage() {
  const searchParams = useSearchParams();
  const params = extractPaymentParams(searchParams);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Clock className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            Pago Pendiente
          </CardTitle>
          <CardDescription>Tu pago está siendo procesado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado del pago */}
          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Estado
              </span>
              <span className="rounded-full bg-yellow-600 px-3 py-1 text-xs font-medium text-white">
                {params.collectionStatus === "in_process"
                  ? "En proceso"
                  : params.collectionStatus === "pending"
                    ? "Pendiente"
                    : params.status}
              </span>
            </div>
            <p className="mt-2 text-sm text-yellow-700 dark:text-yellow-400">
              Te notificaremos por email cuando el pago sea aprobado.
            </p>
          </div>

          {/* Detalles del pago */}
          {(params.collectionId ||
            params.paymentId ||
            params.merchantOrderId) && (
            <div className="space-y-3">
              <h4 className="font-semibold">Detalles del Pago</h4>
              <dl className="space-y-2 text-sm">
                {params.collectionId && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ID de Cobro:</dt>
                    <dd className="font-mono">{params.collectionId}</dd>
                  </div>
                )}
                {params.paymentId && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ID de Pago:</dt>
                    <dd className="font-mono">{params.paymentId}</dd>
                  </div>
                )}
                {params.externalReference && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Referencia:</dt>
                    <dd className="font-mono text-xs">
                      {params.externalReference}
                    </dd>
                  </div>
                )}
                {params.merchantOrderId && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Orden:</dt>
                    <dd className="font-mono">{params.merchantOrderId}</dd>
                  </div>
                )}
                {params.paymentType && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Método:</dt>
                    <dd className="font-medium">{params.paymentType}</dd>
                  </div>
                )}
              </dl>
            </div>
          )}

          {/* Información adicional */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              El pago está siendo procesado. Dependiendo del método de pago
              seleccionado, puede tomar unos minutos o hasta 48 horas. Una vez
              aprobado, recibirás un correo electrónico con la confirmación.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            <Link
              href="/payments"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Ver estado del pago
            </Link>
            <Link
              href="/"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none border border-border bg-background px-2.5 text-xs font-medium text-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
