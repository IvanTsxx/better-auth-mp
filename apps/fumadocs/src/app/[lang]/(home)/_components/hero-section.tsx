import { ShieldAlert } from "lucide-react";
import Link from "next/link";

import { BetterauthIcon, MercadopagoIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

export function HeroSection({ lang }: { lang: string }) {
  return (
    <>
      {/* Top Logo */}
      <div className="flex items-center gap-3 z-10 w-fit">
        <div className="flex items-center gap-2">
          <MercadopagoIcon className="text-4xl leading-none" />
          <BetterauthIcon className="text-4xl leading-none" />
        </div>

        <span className="font-mono font-bold uppercase tracking-[0.2em] text-[13px] text-zinc-100">
          Better-Auth-Mercadopago
        </span>
      </div>

      {/* Background Graphic Mockup (Logo gigante difuminado / con grano) */}
      {/* Nota: El logo de fondo de MP lo configuras en este div reemplazando el texto. */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 select-none overflow-hidden mix-blend-screen">
        <div className="w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] absolute" />

        <MercadopagoIcon className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[250px] font-black tracking-tighter text-zinc-800/40 font-sans rotate-[-8deg] drop-shadow-2xl" />
      </div>

      {/* Main Content */}
      <div className="z-10 mt-auto mb-20 space-y-4">
        <div className="flex items-center gap-2 text-zinc-300 font-mono text-xs mb-8">
          <ShieldAlert size={14} className="text-zinc-400" />
          <span>
            {lang === "en" ? "Configure Your Payments" : "Configura tus pagos"}
          </span>
        </div>

        <h1 className="text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-zinc-100 leading-[1.1] max-w-lg">
          {lang === "es"
            ? "El plugin mas completo de mercadopago"
            : "The most complete mercadopago plugin"}
          <br />
          <span className="text-zinc-400 font-normal">
            {lang === "es" ? "para better-auth" : "for better-auth"}
          </span>
        </h1>
      </div>

      {/* Buttons */}
      <div className="z-10 flex items-center gap-2  border border-zinc-800 px-2 py-1.5 rounded-[6px] w-fit shadow-2xl shadow-black">
        <Button
          render={<Link href={`/${lang}/docs`} className="" />}
          variant="default"
          nativeButton={false}
        >
          {lang === "en" ? "Get Started" : "Empezar"}
        </Button>

        <Button
          render={
            <Link
              href="https://www.npmjs.com/package/better-auth-mercadopago"
              target="_blank"
              rel="noopener noreferrer"
              className=""
            />
          }
          variant="outline"
          nativeButton={false}
        >
          NPM
        </Button>
      </div>
    </>
  );
}
