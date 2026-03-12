import Link from "next/link";

export function HeroSection() {
  return (
    <section className="sticky top-0 flex flex-col items-center justify-center  text-center overflow-hidden col-span-4 border-r border-zinc-800 px-4">
      <div className="relative">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8 max-w-4xl px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300">
            <span className="flex h-2 w-2 rounded-full bg-blue-500"></span>
            MercadoPago Plugin is now in beta
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            The most comprehensive <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-blue-600">
              payment plugin
            </span>{" "}
            for Next.js
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Seamlessly integrate MercadoPago checkout into your application with
            zero configuration. Support for localized payments, subscriptions,
            and split payments out of the box.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/docs"
              className="flex items-center justify-center px-6 py-3 text-sm font-medium text-black bg-white rounded-md hover:bg-zinc-200 transition-colors w-full sm:w-auto"
            >
              Get Started
            </Link>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-transparent border border-zinc-700 rounded-md hover:bg-zinc-800 transition-colors w-full sm:w-auto"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
