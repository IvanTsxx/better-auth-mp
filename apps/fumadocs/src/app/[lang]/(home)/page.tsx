import { Metadata } from "next";

import { CodeBlockTabsPkg } from "@/components/code-block/blocks/copy-with-tabs-package-manager";
import { getPageImage } from "@/lib/source";

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
  const { slug, lang } = await props.params;

  const description =
    lang === "en"
      ? "MercadoPago Plugin for better-auth is an npm package. It provides a comprehensive set of features out of the box, simplifies the addition of advanced functionalities and infrastructure to help own your payments at scale in any framework supported by better-auth."
      : "El plugin de mercadopago para better-auth es un paquete de npm. Proporciona un conjunto completo de características listas para usar, simplifica la adición de funcionalidades avanzadas e infraestructura para ayudar a controlar tus pagos a escala en cualquier framework soportado por better-auth.";

  const title =
    lang === "en"
      ? "MercadoPago Plugin for better-auth"
      : "Plugin de MercadoPago para better-auth";

  return {
    description,
    openGraph: {
      images: "/og-image.webp",
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
            <CodeBlockTabsPkg
              type="install"
              command="better-auth-mercadopago"
            />

            <SectionContainer
              lang={lang}
              title={lang === "en" ? "FEATURES" : "CARACTERÍSTICAS"}
            >
              <FeatureGrid lang={lang} />
            </SectionContainer>

            <SectionContainer
              lang={lang}
              title={
                lang === "en"
                  ? "Declarative Config"
                  : "Configuración Declarativa"
              }
            >
              <CodeExamples code={initCode} />
            </SectionContainer>

            <SectionContainer lang={lang} title="Checkout Pro">
              <CodeExamples code={checkoutProCode} />
            </SectionContainer>

            <SectionContainer
              lang={lang}
              title={lang === "es" ? "Suscripciones" : "Subscriptions"}
            >
              <CodeExamples code={subscriptionsCode} />
            </SectionContainer>

            <SectionContainer lang={lang} title="Marketplace">
              <CodeExamples code={marketplaceCode} />
            </SectionContainer>
          </div>
        </div>
      </main>
    </div>
  );
}
