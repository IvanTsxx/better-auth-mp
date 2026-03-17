"use client";

import { CheckCircle2, Home, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

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

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const params = extractPaymentParams(searchParams);

  return (
    <div className="container mx-auto flex  items-center justify-center px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600 dark:text-green-400">
            ¡Pago Aprobado!
          </CardTitle>
          <CardDescription>
            Tu pago ha sido procesado correctamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estado del pago */}
          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-800 dark:text-green-300">
                Estado
              </span>
              <span className="rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white">
                {params.collectionStatus === "approved"
                  ? "Aprobado"
                  : params.status}
              </span>
            </div>
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

          {/* Acciones */}
          <div className="flex flex-col gap-3">
            <Link
              href="/payments"
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-none bg-primary px-2.5 text-xs font-medium text-primary-foreground transition-all hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Realizar otro pago
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

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto flex  items-center justify-center px-4 py-8">
          <div className="text-muted-foreground">
            Cargando estado del pago...
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}
