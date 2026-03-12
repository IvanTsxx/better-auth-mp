"use client";

import {
  CreditCard,
  ShoppingCart,
  Repeat,
  LayoutDashboard,
  ChevronDown,
  Package,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

const links = [
  { label: "Home", to: "/" },
  {
    auth: false,
    label: "Login",
    to: "/login",
  },
] as const;

export default function Header() {
  const { data } = authClient.useSession();
  const { user } = data || {};
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (!user) {
    return (
      <div>
        <div className="flex flex-row items-center justify-between px-2 py-1">
          <nav className="flex gap-4 text-lg">
            {links.map(({ to, label }) => (
              <Link key={to} href={to as Route}>
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
        <hr />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-2 text-sm">
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          {/* Payments Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2"
              onClick={() =>
                setOpenMenu(openMenu === "payments" ? null : "payments")
              }
            >
              <ShoppingCart className="h-4 w-4" />
              Pagos
              <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === "payments" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-50">
                <Link
                  href="/payments"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  Nuevo Pago
                </Link>
                <Link
                  href="/payments/history"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  Historial
                </Link>
              </div>
            )}
          </div>

          {/* Subscriptions Dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-1 px-3 py-2"
              onClick={() =>
                setOpenMenu(
                  openMenu === "subscriptions" ? null : "subscriptions"
                )
              }
            >
              <Repeat className="h-4 w-4" />
              Suscripciones
              <ChevronDown className="h-3 w-3" />
            </button>
            {openMenu === "subscriptions" && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-background border rounded-md shadow-lg z-50">
                <Link
                  href="/subscriptions"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  Nueva Suscripción
                </Link>
                <Link
                  href="/subscriptions/my"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  Mis Suscripciones
                </Link>
                <Link
                  href="/subscriptions/history"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  Historial
                </Link>
                <Link
                  href="/subscriptions/plans"
                  className="block px-4 py-2 hover:bg-muted"
                  onClick={() => setOpenMenu(null)}
                >
                  <div className="flex items-center gap-2">
                    <Package className="h-3 w-3" />
                    Planes
                  </div>
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/marketplace"
            className="flex items-center gap-2 px-3 py-2"
          >
            <CreditCard className="h-4 w-4" />
            Marketplace
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <UserMenu />
        </div>
      </div>
      <hr />
    </div>
  );
}
