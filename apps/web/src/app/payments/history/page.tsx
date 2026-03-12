"use client";

import { CreditCard, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";

interface Payment {
  id: string;
  externalReference: string;
  userId: string;
  mpPaymentId?: string;
  preferenceId: string;
  status: string;
  statusDetail?: string;
  amount: number;
  currency: string;
  paymentMethodId?: string;
  paymentTypeId?: string;
  metadata?: string;
  createdAt: string;
  updatedAt: string;
}

type PaymentStatus =
  | "pending"
  | "approved"
  | "authorized"
  | "in_process"
  | "in_mediation"
  | "rejected"
  | "cancelled"
  | "refunded"
  | "charged_back";

const STATUS_CONFIG: Record<PaymentStatus, { color: string; label: string }> = {
  approved: { color: "bg-green-600", label: "Aprobado" },
  authorized: { color: "bg-green-600", label: "Autorizado" },
  cancelled: { color: "bg-red-600", label: "Cancelado" },
  charged_back: { color: "bg-red-600", label: "Contracargo" },
  in_mediation: { color: "bg-yellow-500", label: "En mediación" },
  in_process: { color: "bg-yellow-500", label: "En proceso" },
  pending: { color: "bg-gray-500", label: "Pendiente" },
  refunded: { color: "bg-blue-500", label: "Reembolsado" },
  rejected: { color: "bg-red-600", label: "Rechazado" },
};

/**
 * Formatear precio de centavos a moneda
 */
function formatPrice(cents: number, currency = "ARS"): string {
  return new Intl.NumberFormat("es-AR", {
    currency,
    style: "currency",
  }).format(cents / 100);
}

/**
 * Formatear fecha
 */
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function PaymentHistoryPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const filters = statusFilter
        ? { status: statusFilter as PaymentStatus }
        : undefined;

      const result = await authClient.mercadoPago.getPayments({
        filters,
        limit,
        offset,
      });

      if (result.data) {
        setPayments(result.data.payments as unknown as Payment[]);
        setTotal(result.data.total);
      } else {
        setError(result.error.message || "Error al cargar pagos");
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Error al cargar los pagos");
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
  };

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setOffset(0);
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <CreditCard className="h-8 w-8" />
          Historial de Pagos
        </h1>
        <p className="text-muted-foreground mt-2">
          Ver todos tus pagos y su estado
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="status-filter"
                className="text-sm font-medium mb-2 block"
              >
                Filtrar por estado
              </label>
              <div className="flex gap-2">
                <select
                  id="status-filter"
                  className="flex h-8 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                >
                  <option value="">Todos los estados</option>
                  <option value="approved">Aprobados</option>
                  <option value="pending">Pendientes</option>
                  <option value="in_process">En proceso</option>
                  <option value="rejected">Rechazados</option>
                  <option value="cancelled">Cancelados</option>
                  <option value="refunded">Reembolsados</option>
                </select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => fetchPayments()}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de pagos */}
      <Card>
        <CardHeader>
          <CardTitle>Transacciones</CardTitle>
          <CardDescription>
            {total > 0
              ? `Mostrando ${offset + 1}-${Math.min(offset + limit, total)} de ${total} pagos`
              : "No hay pagos para mostrar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fetchPayments()}
              >
                Reintentar
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No hay pagos registrados</p>
              <Link href="/payments" className="inline-flex mt-4">
                <Button>Crear un pago</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-3 text-sm font-medium">
                        Fecha
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Referencia
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Monto
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Estado
                      </th>
                      <th className="text-left p-3 text-sm font-medium">
                        Método
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => {
                      const statusConfig = STATUS_CONFIG[
                        payment.status as PaymentStatus
                      ] || {
                        color: "bg-gray-500",
                        label: payment.status,
                      };

                      return (
                        <tr
                          key={payment.id}
                          className="border-b hover:bg-muted/30 transition-colors"
                        >
                          <td className="p-3 text-sm">
                            {formatDate(payment.createdAt)}
                          </td>
                          <td className="p-3 text-sm">
                            <div className="flex flex-col">
                              <span className="font-mono text-xs truncate max-w-[150px]">
                                {payment.externalReference}
                              </span>
                              {payment.mpPaymentId && (
                                <span className="text-xs text-muted-foreground">
                                  MP: {payment.mpPaymentId}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium">
                            {formatPrice(payment.amount, payment.currency)}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${statusConfig.color}`}
                            >
                              {statusConfig.label}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-muted-foreground">
                            {payment.paymentMethodId ||
                              payment.paymentTypeId ||
                              "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={offset === 0 || isLoading}
                      onClick={() =>
                        handlePageChange(Math.max(0, offset - limit))
                      }
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={offset + limit >= total || isLoading}
                      onClick={() => handlePageChange(offset + limit)}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
