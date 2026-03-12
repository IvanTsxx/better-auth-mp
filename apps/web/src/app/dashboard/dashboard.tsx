"use client";

import {
  CreditCard,
  ShoppingCart,
  Repeat,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
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

interface Stats {
  totalPayments: number;
  approvedPayments: number;
  totalSubscriptions: number;
  activeSubscriptions: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    activeSubscriptions: 0,
    approvedPayments: 0,
    totalPayments: 0,
    totalSubscriptions: 0,
  });

  const loadStats = useCallback(async () => {
    try {
      // Load payments
      const paymentsResult = await authClient.mercadoPago.getPayments({
        limit: 100,
      } as never);

      // Load subscriptions
      const subsResult = await authClient.mercadoPago.getSubscriptions({
        limit: 100,
      } as never);

      const payments = (paymentsResult.data?.payments as unknown[]) || [];
      const subscriptions = (subsResult.data?.subscriptions as unknown[]) || [];

      setStats({
        activeSubscriptions: subscriptions.filter(
          (s: unknown) => (s as { status?: string }).status === "authorized"
        ).length,
        approvedPayments: payments.filter(
          (p: unknown) => (p as { status?: string }).status === "approved"
        ).length,
        totalPayments: payments.length,
        totalSubscriptions: subscriptions.length,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Resumen de tu actividad con MercadoPago
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalPayments}</span>
            </div>
            <p className="text-sm text-muted-foreground">Total Pagos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {stats.approvedPayments}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Pagos Exitosos</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">
                {stats.totalSubscriptions}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Suscripciones</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {stats.activeSubscriptions}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Activas</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Pagos
            </CardTitle>
            <CardDescription>Crear y gestionar pagos únicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/payments" className="block">
              <Button className="w-full">Nuevo Pago</Button>
            </Link>
            <Link href="/payments/history" className="block">
              <Button variant="outline" className="w-full">
                Ver Historial
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Repeat className="h-5 w-5" />
              Suscripciones
            </CardTitle>
            <CardDescription>Suscripciones recurrentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/subscriptions" className="block">
              <Button className="w-full">Nueva Suscripción</Button>
            </Link>
            <Link href="/subscriptions/my" className="block">
              <Button variant="outline" className="w-full">
                Mis Suscripciones
              </Button>
            </Link>
            <Link href="/subscriptions/plans" className="block">
              <Button variant="outline" className="w-full">
                Gestionar Planes
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Marketplace
            </CardTitle>
            <CardDescription>Gestionar vendedores</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/marketplace" className="block">
              <Button variant="outline" className="w-full">
                Configurar
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
