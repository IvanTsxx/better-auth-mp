import "@/app/global.css";
import { RootProvider } from "fumadocs-ui/provider/next";
import { Geist } from "next/font/google";

import { i18nUI } from "@/lib/layout.shared";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700"],
});

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
      <body className={`${geist.className} antialiased`}>
        <RootProvider i18n={i18nUI.provider(lang)}>{children}</RootProvider>
      </body>
    </html>
  );
}
