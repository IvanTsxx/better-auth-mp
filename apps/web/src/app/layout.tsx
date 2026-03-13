import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "@/index.css";
import Header from "@/components/header";
import Providers from "@/components/providers";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  description:
    "Live demo of Mercado Pago plugin for Better Auth. Simplify Next.js and React integrations for Checkout Pro, subscriptions, and Marketplace.",
  keywords: [
    "mercadopago better auth",
    "better auth mercadopago",
    "mercado pago better auth",
    "mercado pago react",
    "nextjs mercadopago",
    "mercado pago nextjs",
    "integracion nextjs mercadopago",
    "nextjs mercado pago suscripciones",
    "checkout pro",
    "better auth plugin",
    "argentina mercadopago",
    "better auth nextjs mercadopago",
  ],
  title: "Mercado Pago Plugin for Better Auth | Next.js Integration Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
