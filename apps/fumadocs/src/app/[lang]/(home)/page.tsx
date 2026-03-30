import type { Metadata } from "next";

import { CodeBlockTabsPkg } from "@/components/code-block/blocks/copy-with-tabs-package-manager";
import { CodeBlockSkills } from "@/components/code-block/blocks/skills-install";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CodeExamples } from "./_components/code-examples";
import {
  initCode,
  checkoutProCode,
  subscriptionsCode,
  marketplaceCode,
} from "./_components/examples-data";
import { FeatureGrid } from "./_components/feature-grid";
import { HeroSection } from "./_components/hero-section";
import { Navbar } from "./_components/navbar";
import { SectionContainer } from "./_components/section-container";

export async function generateMetadata(
  props: PageProps<"/[lang]/docs/[[...slug]]">
): Promise<Metadata> {
  const { lang } = await props.params;

  const description =
    lang === "en"
      ? "Mercado Pago plugin for Better Auth. Simplify Next.js and React integrations for Checkout Pro, subscriptions, and Marketplace. Own your payments in Argentina and LATAM with this better-auth plugin."
      : "Plugin de Mercado Pago para Better Auth. Simplificá la integración en Next.js y React para Checkout Pro, suscripciones y Marketplace. Controlá tus pagos en Argentina y LATAM con este plugin para better-auth.";

  const title =
    lang === "en"
      ? "Mercado Pago Plugin for Better Auth | Next.js Integration"
      : "Plugin de Mercado Pago para Better Auth | Integración Next.js";

  const keywords =
    lang === "en"
      ? [
          "mercadopago better auth",
          "better auth mercadopago",
          "mercado pago better auth",
          "mercado pago react",
          "nextjs mercadopago",
          "mercado pago nextjs",
          "nextjs mercadopago integration",
          "nextjs mercado pago subscriptions",
          "checkout pro",
          "better auth plugin",
          "argentina mercadopago",
          "better auth nextjs mercadopago",
        ]
      : [
          "mercadopago better auth",
          "better auth mercadopago",
          "mercado pago better auth",
          "mercado pago react",
          "nextjs mercadopago",
          "mercado pago nextjs",
          "integracion nextjs mercadopago",
          "nextjs integracion mercadopago",
          "nextjs mercado pago suscripciones",
          "checkout pro",
          "better auth plugin",
          "argentina mercadopago",
          "better auth nextjs mercadopago",
        ];

  return {
    alternates: {
      languages: {
        en: "/en",
        es: "/es",
      },
    },
    description,
    keywords,
    openGraph: {
      description,
      images: "/og-image.webp",
      title,
    },
    title,
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <div className="flex flex-col  min-h-screen bg-[#09090b] text-white selection:bg-blue-500/30">
      <main className="flex flex-col lg:flex-row w-full min-h-screen">
        {/* Left Side (Sticky on Desktop) */}
        <div className="lg:w-[40%] xl:w-[45%] lg:sticky lg:top-0 lg:h-screen border-r border-zinc-800/50 flex flex-col justify-between p-8 relative overflow-hidden bg-[#09090b]">
          <HeroSection lang={lang} />
        </div>

        {/* Right Side (Scrollable) */}
        <div className="flex-1 max-w-[60%] flex flex-col min-h-screen bg-[#09090b]">
          {/* Top Nav Tabs */}
          <Navbar lang={lang} />

          {/* Right Content */}
          <div className="px-4 py-10 space-y-6">
            <h2 className="text-md font-mono tracking-widest uppercase  text-zinc-100 border-b border-zinc-800/50 pb-2">
              README
            </h2>
            <p className="text-zinc-400 text-[15px] leading-[1.8]">
              {lang === "en"
                ? "MercadoPago Plugin for better-auth is an npm package. It provides a comprehensive set of features out of the box, simplifies the addition of advanced functionalities and infrastructure to help own your payments at scale in any framework supported by better-auth."
                : "El plugin de mercadopago para better-auth es un paquete de npm. Proporciona un conjunto completo de características listas para usar, simplifica la adición de funcionalidades avanzadas e infraestructura para ayudar a controlar tus pagos a escala en cualquier framework soportado por better-auth."}
            </p>
            <Tabs defaultValue="npm" className="w-full">
              <TabsList className="bg-transparent border border-zinc-800 rounded-md mb-2 h-8 p-0.5 gap-0.5">
                <TabsTrigger
                  value="npm"
                  className="text-xs h-7 px-3 rounded data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  npm
                </TabsTrigger>
                <TabsTrigger
                  value="skills"
                  className="text-xs h-7 px-3 rounded data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 text-zinc-500"
                >
                  skills
                </TabsTrigger>
              </TabsList>
              <TabsContent value="npm" className="mt-0">
                <CodeBlockTabsPkg type="install" command="better-auth-mp" />
              </TabsContent>
              <TabsContent value="skills" className="mt-0">
                <CodeBlockSkills />
              </TabsContent>
            </Tabs>

            <SectionContainer
              title={lang === "en" ? "FEATURES" : "CARACTERÍSTICAS"}
            >
              <FeatureGrid lang={lang} />
            </SectionContainer>

            <SectionContainer
              title={
                lang === "en"
                  ? "Declarative Config"
                  : "Configuración Declarativa"
              }
            >
              <CodeExamples code={initCode} />
            </SectionContainer>

            <SectionContainer title="Checkout Pro">
              <CodeExamples code={checkoutProCode} />
            </SectionContainer>

            <SectionContainer
              title={lang === "es" ? "Suscripciones" : "Subscriptions"}
            >
              <CodeExamples code={subscriptionsCode} />
            </SectionContainer>

            <SectionContainer title="Marketplace">
              <CodeExamples code={marketplaceCode} />
            </SectionContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
