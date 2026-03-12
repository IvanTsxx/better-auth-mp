import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

import { LanguageSelector } from "./language-selector";

export const Navbar = ({ lang }: { lang: string }) => (
  <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur border-b border-zinc-800/50">
    <nav className="flex items-center overflow-x-auto text-[11px] font-mono uppercase tracking-widest text-zinc-500">
      <Link
        href={`/${lang}`}
        className="shrink-0 px-8 py-5 border-b-2 border-white text-zinc-100"
      >
        README
      </Link>
      <Link
        href={`/${lang}/docs`}
        className="shrink-0 px-8 py-5 border-b-2 border-transparent hover:text-zinc-300 transition-colors"
      >
        DOCS
      </Link>
      <Link
        href="https://better-auth-mercadopago.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 px-8 py-5 border-b-2 border-transparent hover:text-zinc-300 transition-colors"
      >
        Demo
      </Link>

      {/* Spacer to push SIGN-IN to the right */}
      <div className="flex-1" />

      <LanguageSelector />
    </nav>
  </header>
);
