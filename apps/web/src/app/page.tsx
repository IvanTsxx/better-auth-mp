import { ArrowRight, BookOpen, Github, Key, CreditCard } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16">
      <div className="flex flex-col items-center text-center space-y-10">
        {/* Hero Section */}
        <div className="space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-balance">
            Better Auth <span className="text-[#00BCFF]">Mercado Pago</span>{" "}
            Demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
            La forma más rápida y segura de integrar pagos y suscripciones de
            Mercado Pago en tu aplicación Next.js.
          </p>
        </div>

        {/* Cta / Links */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#00BCFF] text-white px-6 py-3 text-sm font-medium hover:bg-[#009bd6] transition-colors shadow-sm"
          >
            Probar la Demo <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://better-auth-mp-docs.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <BookOpen className="size-4" /> Documentación
          </a>
          <a
            href="https://github.com/ivantsxx/better-auth-mp"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-md border bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Github className="size-4" /> Repositorio
          </a>
        </div>

        {/* Instructions */}
        <div className="grid md:grid-cols-2 gap-8 mt-16 w-full text-left">
          {/* Step 1 */}
          <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#00BCFF]/10 text-[#00BCFF]">
                <Key className="size-5" />
              </div>
              <h2 className="text-xl font-semibold">1. Iniciar Sesión</h2>
            </div>
            <p className="text-muted-foreground mb-4">
              Para probar el flujo completo, necesitás autenticarte. Podés
              registrarte con cualquier correo electrónico y una contraseña.
            </p>
            <div className="bg-muted/50 border text-muted-foreground p-4 rounded-md text-sm font-mono space-y-1">
              <span className="block">
                Email: <strong className="font-semibold">test@gmail.com</strong>
              </span>
              <span className="block">
                Pass: <strong className="font-semibold">12345678</strong>
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic">
              * Nota: No uses credenciales reales para la demo.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#00BCFF]/10 text-[#00BCFF]">
                <CreditCard className="size-5" />
              </div>
              <h2 className="text-xl font-semibold">2. Explorar Opciones</h2>
            </div>
            <p className="text-muted-foreground">
              Una vez que inicies sesión y accedas al dashboard, vas a poder
              probar las distintas integraciones del plugin:
            </p>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-[#00BCFF] mt-1.5 shrink-0" />
                Demostración de pagos únicos (Checkout Pro).
              </li>
              <li className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-[#00BCFF] mt-1.5 shrink-0" />
                Flujo de suscripciones (Creación y gestión).
              </li>
              <li className="flex items-start gap-2">
                <div className="size-1.5 rounded-full bg-[#00BCFF] mt-1.5 shrink-0" />
                Gestión de estado del usuario vinculado a MP.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
