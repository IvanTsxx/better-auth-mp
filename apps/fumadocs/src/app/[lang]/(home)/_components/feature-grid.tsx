import {
  Puzzle,
  CreditCard,
  Globe,
  ShieldCheck,
  Code2,
  Zap,
} from "lucide-react";

import { TerminalDemo } from "./terminal-demo";

const features = [
  {
    description:
      "First-class support for Next.js, Node.js, Express, and more. Integrate effortlessly regardless of your backend.",
    headline: "Works with your stack.",
    icon: <Puzzle className="w-6 h-6 text-zinc-400" />,
    title: "FRAMEWORK AGNOSTIC",
  },
  {
    description:
      "Choose between the fully hosted Checkout Pro experience or build completely custom flows with the Checkout API.",
    headline: "Flexible implementation.",
    icon: <CreditCard className="w-6 h-6 text-zinc-400" />,
    title: "CHECKOUT PRO & API",
  },
  {
    description:
      "Automatically handle local payment methods, currencies, and installments across supported Latin American countries.",
    headline: "Built for LatAm.",
    icon: <Globe className="w-6 h-6 text-zinc-400" />,
    title: "LOCALIZED PAYMENTS",
  },
  {
    description:
      "Signature validation, idempotent requests, and robust webhook handling out of the box. Stop worrying about fraud.",
    headline: "Secure by default.",
    icon: <ShieldCheck className="w-6 h-6 text-zinc-400" />,
    title: "WEBHOOKS & SECURITY",
  },
  {
    description:
      "Written in TypeScript. Get autocomplete for all MercadoPago endpoints, payloads, and Webhook events.",
    headline: "End-to-end typed.",
    icon: <Code2 className="w-6 h-6 text-zinc-400" />,
    title: "TYPE SAFETY",
  },
  {
    description:
      "Fully compatible with Edge Runtimes (Vercel Edge, Cloudflare Workers). No Node.js built-ins required.",
    headline: "Blazing fast.",
    icon: <Zap className="w-6 h-6 text-zinc-400" />,
    title: "EDGE READY",
  },
];

export function FeatureGrid() {
  return (
    <section className="col-span-8">
      <section className="flex flex-col gap-2">
        <div className="w-full border-t border-zinc-800 mx-auto px-4">
          <TerminalDemo />
        </div>
        <div className="w-full border-t border-zinc-800 mx-auto px-4">
          <h2 className="text-sm font-mono tracking-widest text-zinc-500 mb-8 uppercase">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-zinc-950 p-8 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="mb-4">
                  <span className="text-xs font-mono tracking-wider text-zinc-500">
                    {String(i + 1).padStart(2, "0")} {feature.title}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {feature.headline}
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>
                <div className="mt-auto">{feature.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
