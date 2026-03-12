import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export function HeroSection({ lang }: { lang: string }) {
  return (
    <>
      {/* Top Logo */}
      <div className="flex items-center gap-3 z-10 w-fit">
        <div className="w-5 h-5 bg-white flex items-center justify-center">
          <span className="text-[10px] font-black text-black leading-none">
            MP
          </span>
        </div>
        <span className="font-mono font-bold tracking-[0.2em] text-[13px] text-zinc-100">
          MERCADOPAGO-PLUGIN.
        </span>
      </div>

      {/* Background Graphic Mockup (Logo gigante difuminado / con grano) */}
      {/* Nota: El logo de fondo de MP lo configuras en este div reemplazando el texto. */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-40 select-none overflow-hidden mix-blend-screen">
        <div className="w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] absolute" />
        <div className="absolute text-[300px] font-black tracking-tighter text-zinc-800/40 font-sans rotate-[-8deg] drop-shadow-2xl">
          MP
        </div>
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
      <div className="z-10 flex items-center gap-px bg-zinc-800 p-px rounded-[6px] w-fit shadow-2xl shadow-black">
        <Link
          href={`/${lang}/docs`}
          className="px-8 py-2.5 bg-white text-black text-sm font-semibold rounded-l-[5px] hover:bg-zinc-200 transition-colors"
        >
          Get Started
        </Link>
        <Link
          href="https://www.npmjs.com/package/better-auth-mercadopago"
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-2.5 bg-[#09090b] text-zinc-300 text-sm font-medium rounded-r-[5px] hover:text-white hover:bg-zinc-900 transition-colors"
        >
          NPM
        </Link>
      </div>
    </>
  );
}
