import {
  Puzzle,
  CreditCard,
  Globe,
  ShieldCheck,
  Code2,
  Zap,
} from "lucide-react";

const features = {
  en: [
    {
      description:
        "Create Checkout Pro preferences effortlessly. Automatically handle local payment methods, currencies, and installments.",
      headline: "Checkout Pro & API.",
      icon: <CreditCard className="w-4 h-4 text-zinc-400" />,
      title: "ONE-TIME PAYMENTS",
    },
    {
      description:
        "Seamlessly handle recurring billing via PreApproval. Full support for creating and managing subscriptions with or without predefined plans.",
      headline: "Recurring billing made simple.",
      icon: <Zap className="w-4 h-4 text-zinc-400" />,
      title: "SUBSCRIPTIONS",
    },
    {
      description:
        "Automatically process MercadoPago notifications with strict signature verification and automatic database status synchronization.",
      headline: "Reliable event handling.",
      icon: <Globe className="w-4 h-4 text-zinc-400" />,
      title: "WEBHOOKS & SYNC",
    },
    {
      description:
        "Automatic schema generation for payment, subscription, and plan tables. Built to work perfectly with Better Auth's database adapters.",
      headline: "Zero-config database.",
      icon: <Puzzle className="w-4 h-4 text-zinc-400" />,
      title: "AUTOMATIC SCHEMA",
    },
    {
      description:
        "Built-in rate limiting, idempotency guards, and metadata sanitization to protect your application from fraudulent or duplicated requests.",
      headline: "Secure by default.",
      icon: <ShieldCheck className="w-4 h-4 text-zinc-400" />,
      title: "ADVANCED SECURITY",
    },
    {
      description:
        "Written entirely in TypeScript. Get precise autocomplete for Better Auth methods, MercadoPago endpoints, and Webhook payloads.",
      headline: "End-to-end typed.",
      icon: <Code2 className="w-4 h-4 text-zinc-400" />,
      title: "TYPE SAFETY",
    },
  ],
  es: [
    {
      description:
        "Crea preferencias de Checkout Pro sin esfuerzo. Maneja automáticamente métodos de pago locales, monedas y cuotas sin complicaciones.",
      headline: "Checkout Pro y API.",
      icon: <CreditCard className="w-4 h-4 text-zinc-400" />,
      title: "PAGOS ÚNICOS",
    },
    {
      description:
        "Administra la facturación recurrente vía PreApproval del lado del servidor. Soporte completo para suscripciones con o sin planes predefinidos.",
      headline: "Facturación recurrente.",
      icon: <Zap className="w-4 h-4 text-zinc-400" />,
      title: "SUSCRIPCIONES",
    },
    {
      description:
        "Procesa automáticamente las notificaciones de MercadoPago con verificación de firmas estricta y sincronización de estado en tu base de datos.",
      headline: "Manejo de eventos.",
      icon: <Globe className="w-4 h-4 text-zinc-400" />,
      title: "WEBHOOKS Y SYNC",
    },
    {
      description:
        "Generación automática de tablas para pagos, suscripciones y planes. Funciona a la perfección con los adaptadores de base de datos de Better Auth.",
      headline: "Base de datos sin configuración.",
      icon: <Puzzle className="w-4 h-4 text-zinc-400" />,
      title: "ESQUEMA AUTOMÁTICO",
    },
    {
      description:
        "Límites de peticiones integrados, protección de idempotencia y sanitización de metadatos para blindar tu aplicación contra fraudes.",
      headline: "Seguro por defecto.",
      icon: <ShieldCheck className="w-4 h-4 text-zinc-400" />,
      title: "SEGURIDAD AVANZADA",
    },
    {
      description:
        "Escrito completamente en TypeScript. Autocompletado preciso para los métodos de Better Auth, endpoints de MercadoPago y payloads de Webhooks.",
      headline: "Tipado estricto.",
      icon: <Code2 className="w-4 h-4 text-zinc-400" />,
      title: "TIPADO FUERTE",
    },
  ],
};

export function FeatureGrid({ lang }: { lang: string }) {
  const currentFeatures =
    features[lang as keyof typeof features] || features.es;

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] border-l border-t border-zinc-800/60">
      {currentFeatures.map((feature, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 px-8 py-6 border-r border-b border-zinc-800/60 bg-[#09090b] hover:bg-zinc-900/60 transition-colors"
        >
          <div className="flex space-x-2 items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="text-zinc-500">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-zinc-500 text-[8px] font-medium">
              {feature.title}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <div className="bg-[#09090b] rounded-md border border-zinc-800/80">
              {feature.icon}
            </div>

            <h3 className="font-semibold text-zinc-50 tracking-tight">
              {feature.headline}
            </h3>
          </div>
          <p className="text-zinc-400 text-[10px] leading-relaxed flex-1">
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
