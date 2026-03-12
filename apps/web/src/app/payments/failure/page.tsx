"use client";

import { XCircle, Home, RefreshCw } from "lucide-react";
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
    reason: searchParams.get("reason"),
    siteId: searchParams.get("site_id"),
    status: searchParams.get("status"),
  };
}

export default function PaymentFailurePage() {
  const searchParams = useSearchParams();
  const params = extractPaymentParams(searchParams);

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <XCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600 dark:text-red-400">
            Pago Rechazado
          </CardTitle>
          <CardDescription>El pago no pudo ser procesado</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado del pago */}
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-red-800 dark:text-red-300">
                Estado
              </span>
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white">
                {params.collectionStatus === "rejected"
                  ? "Rechazado"
                  : params.status || "Fallido"}
              </span>
            </div>
            {params.reason && (
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                Razón: {params.reason}
              </p>
            )}
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
              </dl>
            </div>
          )}

          {/* Información adicional */}
          <div className="rounded-lg bg-muted p-4">
            <p className="text-sm text-muted-foreground">
              El pago fue rechazado. Por favor verificá los datos de tu tarjeta
              e intentá nuevamente. Si el problema persiste, contactá a tu
              banco.
            </p>
          </div>

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            <Link
              href="/payments"
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-none bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Intentar nuevamente
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
