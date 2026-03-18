import { Github } from "@react-symbols/icons";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LanguageSelector } from "./language-selector";

export const Navbar = ({ lang }: { lang: string }) => (
  <header className="sticky top-0 z-50 bg-[#09090b]/90 backdrop-blur border-b border-zinc-800/50">
    <nav className="flex items-center justify-between px-5">
      <div className="flex items-center overflow-x-auto text-[11px] font-mono uppercase tracking-widest text-zinc-500">
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
          href="https://better-auth-mp-demo.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 px-8 py-5 border-b-2 border-transparent hover:text-zinc-300 transition-colors"
        >
          Demo
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          render={
            <Link
              href="https://github.com/ivantsxx/better-auth-mp"
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          nativeButton={false}
        >
          <Github className="size-5" />
        </Button>
        <LanguageSelector />
      </div>
    </nav>
  </header>
);
