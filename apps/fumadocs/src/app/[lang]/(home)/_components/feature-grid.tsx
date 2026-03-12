import {
  Puzzle,
  CreditCard,
  Globe,
  ShieldCheck,
  Code2,
  Zap,
} from "lucide-react";

const features = [
  {
    description:
      "First-class support for Next.js, Node.js, Express, and more. Integrate effortlessly regardless of your backend.",
    headline: "Works with your stack.",
    icon: <Puzzle className="w-4 h-4 text-zinc-400" />,
    title: "FRAMEWORK AGNOSTIC",
  },
  {
    description:
      "Choose between the fully hosted Checkout Pro experience or build completely custom flows with the Checkout API.",
    headline: "Flexible implementation.",
    icon: <CreditCard className="w-4 h-4 text-zinc-400" />,
    title: "CHECKOUT PRO & API",
  },
  {
    description:
      "Automatically handle local payment methods, currencies, and installments across supported Latin American countries.",
    headline: "Built for LatAm.",
    icon: <Globe className="w-4 h-4 text-zinc-400" />,
    title: "LOCALIZED PAYMENTS",
  },
  {
    description:
      "Signature validation, idempotent requests, and robust webhook handling out of the box. Stop worrying about fraud.",
    headline: "Secure by default.",
    icon: <ShieldCheck className="w-4 h-4 text-zinc-400" />,
    title: "WEBHOOKS & SECURITY",
  },
  {
    description:
      "Written in TypeScript. Get autocomplete for all MercadoPago endpoints, payloads, and Webhook events.",
    headline: "End-to-end typed.",
    icon: <Code2 className="w-4 h-4 text-zinc-400" />,
    title: "TYPE SAFETY",
  },
  {
    description:
      "Fully compatible with Edge Runtimes (Vercel Edge, Cloudflare Workers). No Node.js built-ins required.",
    headline: "Blazing fast.",
    icon: <Zap className="w-4 h-4 text-zinc-400" />,
    title: "EDGE READY",
  },
];

export function FeatureGrid({ lang }: { lang: string }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-l border-t border-zinc-800/60">
      {features.map((feature, i) => (
        <div
          key={i}
          className="flex flex-col p-8 min-h-[260px] border-r border-b border-zinc-800/60 bg-[#09090b] hover:bg-zinc-900/60 transition-colors"
        >
          <div className="mb-6 flex space-x-2 items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span className="text-zinc-500">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-zinc-500 font-medium">{feature.title}</span>
          </div>
          <h3 className="text-[17px] font-semibold text-zinc-50 mb-3 tracking-tight">
            {feature.headline}
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
            {feature.description}
          </p>
          <div className="mt-auto flex justify-between items-center bg-[#09090b] p-3 rounded-md border border-zinc-800/80">
            <div className="flex gap-2 text-zinc-700">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
            </div>
            {feature.icon}
          </div>
        </div>
      ))}
    </div>
  );
}
