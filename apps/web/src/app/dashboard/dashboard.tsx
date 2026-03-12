"use client";
import type { authClient } from "@/lib/auth-client";

export default function Dashboard({
  session,
}: {
  session: typeof authClient.$Infer.Session;
}) {
  return <pre>{JSON.stringify(session, null, 2)}</pre>;
}
