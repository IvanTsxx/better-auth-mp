"use client";
import type { Route } from "next";
import Link from "next/link";

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

const routesPrivate = [
  { label: "Home", to: "/" },
  { label: "Payments", to: "/payments" },
  { label: "History", to: "/payments/history" },
  { label: "Subscriptions", to: "/subscriptions" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "Dashboard", to: "/dashboard" },
];

export default function Header() {
  const { data } = authClient.useSession();
  const { user } = data || {};

  const routes = user ? routesPrivate : links;

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <nav className="flex gap-4 text-lg">
          {routes.map(({ to, label }) => (
            <Link key={to} href={to as Route}>
              {label}
            </Link>
          ))}
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
