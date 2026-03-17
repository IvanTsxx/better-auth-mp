import "@/app/global.css";
import { Analytics } from "@vercel/analytics/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import { GeistPixelSquare } from "geist/font/pixel";

import { i18nUI } from "@/lib/layout.shared";

export default async function RootLayout({
  params,
  children,
}: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const { lang } = await params;

  return (
    <html lang={lang}>
      <body className={`${GeistPixelSquare.className} antialiased`}>
        <RootProvider i18n={i18nUI.provider(lang)}>{children}</RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
